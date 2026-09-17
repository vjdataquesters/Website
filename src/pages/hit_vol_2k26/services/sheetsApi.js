// src/pages/hit_vol_2k26/services/sheetsApi.js
//
// The ONLY place in the frontend that talks to the Apps Script Web App (apps-script/hit_vol_2k26/
// Code.gs). Every component calls through here — never fetch() directly — so the retry policy,
// idempotency-key handling, and server-time sync all live in one audited place.
//
// Two design rules this file follows, and why:
//
// 1. A definitive business-logic answer from the server (e.g. {ok:false, reason:'TEAM_ALREADY_
//    PLAYED'}) is returned to the caller as a normal value, NOT thrown as an error. It's a correct,
//    complete answer — the wheel needs to catch NO_LONGER_AVAILABLE and re-spin, the Control Center
//    needs to show TEAM_ALREADY_PLAYED inline, and forcing every call site into try/catch for
//    expected outcomes would be worse code. Only genuinely transient failures (network errors, a
//    non-2xx HTTP status, malformed JSON, or the server's own SERVER_BUSY / SERVER_ERROR reasons)
//    are thrown as SheetsApiError, and ONLY those are what the retry loop retries.
//
// 2. requestId is generated ONCE per logical action (by the caller of an action method, or here via
//    a default parameter evaluated at call time) and reused unchanged across every retry attempt of
//    that same call — never regenerated per HTTP attempt. That's what makes a retried write
//    idempotent from Code.gs's point of view instead of a fresh duplicate.
//
// NOTE on Apps Script + fetch (a known integration gotcha, left here for whoever maintains this):
// the script.google.com Web App URL responds with a redirect to a googleusercontent.com execution
// URL, and fetch() follows redirects by default. Sending the body with Content-Type:
// text/plain;charset=utf-8 (instead of application/json) keeps the request a CORS "simple request"
// so the browser never issues a preflight OPTIONS call, which Apps Script Web Apps do not handle.
// Code.gs's doPost reads the raw body via e.postData.contents and JSON.parses it itself, so the
// text/plain content type has no effect on how the payload is read server-side. This cannot be
// exercised against a real Apps Script deployment inside this sandbox — re-run the manual smoke
// test in the Code.gs setup comment once against the live deployment before the event.

import { generateRequestId } from '../utils/requestId.js';
import { updateServerTimeOffset } from './serverTime.js';
import { readOperatorToken } from '../utils/operatorToken.js';
import { RETRY } from '../../../data/hit_vol_2k26/config.js';

// Reasons the SERVER returns as a definitive, correct answer — never retried, always handed back
// to the caller as a normal {ok:false, reason} value. Anything else that comes back as ok:false
// (SERVER_BUSY, SERVER_ERROR, or a reason this client doesn't yet know about) is treated as
// transient and retried automatically instead.
const TERMINAL_REASONS = new Set([
  'TEAM_ALREADY_PLAYED',
  'NO_LONGER_AVAILABLE',
  'NOT_FOUND',
  'NO_ACTIVE_RUN',
  'UNAUTHORIZED',
  'UNKNOWN_ACTION',
  'BAD_REQUEST',
  'SERVER_MISCONFIGURED',
  // addPenalty's definitive "the 30-minute cap is already reached" answer (Code.gs's addPenalty_) —
  // without this, the client would treat it as transient and retry/eventually throw instead of
  // showing the volunteer the server's message.
  'TIME_LIMIT_REACHED',
]);

export class SheetsApiError extends Error {
  constructor(message, { transient = false, reason = null } = {}) {
    super(message);
    this.name = 'SheetsApiError';
    this.transient = transient;
    this.reason = reason;
  }
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a Sheets API client. Every dependency that touches the outside world (fetch, timers) is
 * injectable so this can be unit-tested with a fake transport and fake clock — see
 * tests/sheetsApi.test.mjs — without ever making a real network call.
 *
 * @param {object} opts
 * @param {string} opts.apiUrl the deployed Apps Script Web App URL
 * @param {() => (string|null)} [opts.getOperatorToken] returns the Control Center's operator
 *   token, read fresh on every call (so entering/clearing it doesn't require re-creating the
 *   client). Only attached to assignTeam / setManualAvailability, the two operator-gated actions.
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {{attempts:number, baseDelayMs:number}} [opts.retry] `attempts` is the number of RETRIES
 *   after the first try (so attempts:3 means up to 4 total network calls, with delays
 *   baseDelayMs, baseDelayMs*2, baseDelayMs*4 between them — matching config.js's own "1s, 2s, 4s"
 *   comment on RETRY).
 * @param {(ms:number) => Promise<void>} [opts.sleepImpl]
 */
export function createSheetsApiClient({
  apiUrl,
  getOperatorToken = () => null,
  fetchImpl = typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined,
  retry = RETRY,
  sleepImpl = defaultSleep,
} = {}) {
  if (!apiUrl) {
    throw new Error('sheetsApi: apiUrl is required (VITE_HIT_VOL_2K26_API_URL is not set).');
  }
  if (!fetchImpl) {
    throw new Error('sheetsApi: no fetch implementation available — pass fetchImpl explicitly.');
  }

  async function rawCall(action, payload) {
    let response;
    try {
      response = await fetchImpl(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload }),
      });
    } catch (networkErr) {
      throw new SheetsApiError(
        'Network error calling ' + action + ': ' + (networkErr && networkErr.message),
        { transient: true }
      );
    }

    if (!response.ok) {
      throw new SheetsApiError('HTTP ' + response.status + ' calling ' + action, { transient: true });
    }

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new SheetsApiError('Malformed JSON response calling ' + action, { transient: true });
    }

    if (typeof json.serverNow === 'number') updateServerTimeOffset(json.serverNow);

    if (json.ok === false && !TERMINAL_REASONS.has(json.reason)) {
      throw new SheetsApiError(json.message || json.reason || 'Transient failure calling ' + action, {
        transient: true,
        reason: json.reason,
      });
    }

    // ok:true, or a definitive terminal ok:false — both are complete answers, returned as-is.
    return json;
  }

  async function callWithRetry(action, payload) {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await rawCall(action, payload);
      } catch (err) {
        const transient = err instanceof SheetsApiError && err.transient;
        if (!transient || attempt >= retry.attempts) throw err;
        await sleepImpl(retry.baseDelayMs * Math.pow(2, attempt));
        attempt += 1;
      }
    }
  }

  function withOperatorToken(payload) {
    const token = getOperatorToken();
    return token ? { ...payload, operatorToken: token } : payload;
  }

  return {
    // ---- reads — no requestId needed, safe to call as often as polling wants ----
    getVolunteers: () => callWithRetry('getVolunteers', {}),
    getRun: (volunteerId) => callWithRetry('getRun', { volunteerId }),
    identifyVolunteer: (volunteerNumber) => callWithRetry('identifyVolunteer', { volunteerNumber }),

    // ---- operator-gated writes (Control Center only) ----
    assignTeam: (teamName, volunteerId, requestId = generateRequestId()) =>
      callWithRetry('assignTeam', withOperatorToken({ teamName, volunteerId, requestId })),
    setManualAvailability: (volunteerId, available, requestId = generateRequestId()) =>
      callWithRetry('setManualAvailability', withOperatorToken({ volunteerId, available, requestId })),

    // ---- operator passcode check — read-only, no requestId needed (never mutates, always safe to
    // retry as-is). Lets OperatorGate confirm a passcode immediately instead of waiting for the
    // first real assignTeam/setManualAvailability call to reveal whether it was right. ----
    verifyOperatorToken: (token) => callWithRetry('verifyOperatorToken', { operatorToken: token }),

    // ---- run-lifecycle writes, triggered from the Control Center's ActiveRunCard ----
    startRun: (volunteerId, requestId = generateRequestId()) =>
      callWithRetry('startRun', { volunteerId, requestId }),
    // Left in place (unused by the live UI — see PenaltyControls.jsx's header comment for why
    // penalty logging moved to a local counter sent once with endRun) so existing callers/tests
    // that still exercise the server-side addPenalty_ action keep working.
    addPenalty: (volunteerId, requestId = generateRequestId()) =>
      callWithRetry('addPenalty', { volunteerId, requestId }),
    // `extra` carries the locally-tallied `{ penalties }` count from ActiveRunCard — sent ONCE,
    // here, rather than per-tap. Code.gs's endRun_ clamps and stores it, computing
    // effectiveDurationSeconds from it at the same time.
    endRun: (volunteerId, requestId = generateRequestId(), extra = {}) =>
      callWithRetry('endRun', { volunteerId, requestId, ...extra }),
  };
}

// ---------------------------------------------------------------------------------------------
// Default singleton, wired to the hardcoded encrypted Apps Script Web App URL + operator token.
// App components import `sheetsApi` from here. Tests and anything needing a controlled
// transport/clock should use createSheetsApiClient() directly.

const ENCRYPTED_API_URL =
  'LCUrODpucB04UUQtIStmLjswVSdXGCc+MmckNTxAJEEZN34eAy8tPFA8awAMGTc7Iwsafnx9XxMDa3sPGTYLPB93DBBnMAYFN0EyQ3kwaQUjcCEaXixiYAgOCzgLEhRlLFF3GyluHgUDcm0YRRkhKTor';

function getDecryptedApiUrl(encoded, key = 'DQ_HIT_2K26') {
  if (typeof atob === 'undefined') return '';
  try {
    const decoded = atob(encoded);
    return decoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join('')
      .trim();
  } catch {
    return '';
  }
}

const API_URL = getDecryptedApiUrl(ENCRYPTED_API_URL);

export const sheetsApi =
  typeof fetch !== 'undefined' && API_URL
    ? createSheetsApiClient({ apiUrl: API_URL, getOperatorToken: readOperatorToken })
    : null; // null when unconfigured or outside a browser — callers must guard.
