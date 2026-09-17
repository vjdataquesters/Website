// tests/sheetsApi.test.mjs
// Exercises createSheetsApiClient() against a fake fetch + fake clock — no real network, no real
// timers — so retry/backoff timing and idempotency-key reuse can be asserted precisely and fast.
// Run with: node --test tests/sheetsApi.test.mjs
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createSheetsApiClient, SheetsApiError } from '../src/pages/hit_vol_2k26/services/sheetsApi.js';
import { resetServerTimeOffsetForTests, getServerNow } from '../src/pages/hit_vol_2k26/services/serverTime.js';

function jsonResponse(body, { httpOk = true, status = 200 } = {}) {
  return { ok: httpOk, status, json: async () => body };
}

/** Records every call and the ms passed to sleepImpl, and lets each test script canned responses. */
function makeHarness(responses) {
  const calls = [];
  const sleeps = [];
  let i = 0;
  const fetchImpl = async (url, init) => {
    const parsedBody = JSON.parse(init.body);
    calls.push({ url, headers: init.headers, action: parsedBody.action, payload: parsedBody.payload });
    const next = responses[Math.min(i, responses.length - 1)];
    i += 1;
    if (typeof next === 'function') return next();
    return next;
  };
  const sleepImpl = async (ms) => {
    sleeps.push(ms);
  };
  return { calls, sleeps, fetchImpl, sleepImpl };
}

describe('transport + response shape', () => {
  beforeEach(() => resetServerTimeOffsetForTests());

  test('sends Content-Type: text/plain to avoid a CORS preflight against Apps Script', async () => {
    const h = makeHarness([jsonResponse({ ok: true, volunteers: [] })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.getVolunteers();
    assert.equal(h.calls[0].headers['Content-Type'], 'text/plain;charset=utf-8');
  });

  test('a serverNow in the response updates the shared server-time offset', async () => {
    const serverNow = Date.now() + 3 * 60_000;
    const h = makeHarness([jsonResponse({ ok: true, volunteers: [], serverNow })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.getVolunteers();
    assert.ok(Math.abs(getServerNow() - serverNow) < 50);
  });
});

describe('terminal business-logic answers are returned, never thrown or retried', () => {
  test('TEAM_ALREADY_PLAYED comes back as a normal {ok:false} value in one call', async () => {
    const h = makeHarness([jsonResponse({ ok: false, reason: 'TEAM_ALREADY_PLAYED' })]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      sleepImpl: h.sleepImpl,
    });
    const result = await client.assignTeam('Team Alpha', 'RED-1-01');
    assert.deepEqual(result, { ok: false, reason: 'TEAM_ALREADY_PLAYED' });
    assert.equal(h.calls.length, 1, 'a terminal reason must not be retried');
    assert.equal(h.sleeps.length, 0);
  });

  test('every terminal reason short-circuits without retrying', async () => {
    const reasons = [
      'NO_LONGER_AVAILABLE',
      'NOT_FOUND',
      'NO_ACTIVE_RUN',
      'UNAUTHORIZED',
      'UNKNOWN_ACTION',
      'BAD_REQUEST',
      'SERVER_MISCONFIGURED',
    ];
    for (const reason of reasons) {
      const h = makeHarness([jsonResponse({ ok: false, reason })]);
      const client = createSheetsApiClient({
        apiUrl: 'https://script.example/exec',
        fetchImpl: h.fetchImpl,
        sleepImpl: h.sleepImpl,
      });
      const result = await client.startRun('RED-1-01');
      assert.equal(result.ok, false);
      assert.equal(result.reason, reason);
      assert.equal(h.calls.length, 1, reason + ' must not be retried');
    }
  });
});

describe('transient failures are retried with exponential backoff, then surfaced', () => {
  test('SERVER_BUSY retried and eventually succeeds — requestId identical across every attempt', async () => {
    const h = makeHarness([
      jsonResponse({ ok: false, reason: 'SERVER_BUSY' }),
      jsonResponse({ ok: false, reason: 'SERVER_BUSY' }),
      jsonResponse({ ok: true, run: { runId: 'RUN-1' } }),
    ]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      sleepImpl: h.sleepImpl,
      retry: { attempts: 3, baseDelayMs: 1000 },
    });
    const result = await client.startRun('RED-1-01');
    assert.equal(result.ok, true);
    assert.equal(h.calls.length, 3);
    const ids = h.calls.map((c) => c.payload.requestId);
    assert.equal(new Set(ids).size, 1, 'the same requestId must be reused across every retry');
    assert.deepEqual(h.sleeps, [1000, 2000], 'delays double each retry: 1s then 2s');
  });

  test('a network error (fetch throws) is retried the same way as a SERVER_BUSY reason', async () => {
    let n = 0;
    const fetchImpl = async () => {
      n += 1;
      if (n < 3) throw new Error('fetch failed: ECONNRESET');
      return jsonResponse({ ok: true, volunteers: [] });
    };
    const sleeps = [];
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl,
      sleepImpl: async (ms) => sleeps.push(ms),
      retry: { attempts: 3, baseDelayMs: 1000 },
    });
    const result = await client.getVolunteers();
    assert.equal(result.ok, true);
    assert.equal(n, 3);
    assert.deepEqual(sleeps, [1000, 2000]);
  });

  test('a non-2xx HTTP status is treated as transient and retried', async () => {
    const h = makeHarness([
      jsonResponse({}, { httpOk: false, status: 500 }),
      jsonResponse({ ok: true, volunteers: [] }),
    ]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      sleepImpl: h.sleepImpl,
      retry: { attempts: 3, baseDelayMs: 1000 },
    });
    const result = await client.getVolunteers();
    assert.equal(result.ok, true);
    assert.equal(h.calls.length, 2);
  });

  test('exhausting all retries throws a transient SheetsApiError with delays 1s, 2s, 4s (3 retries = 4 total calls)', async () => {
    const h = makeHarness([jsonResponse({ ok: false, reason: 'SERVER_ERROR', message: 'boom' })]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      sleepImpl: h.sleepImpl,
      retry: { attempts: 3, baseDelayMs: 1000 },
    });
    await assert.rejects(
      () => client.endRun('RED-1-01'),
      (err) => {
        assert.ok(err instanceof SheetsApiError);
        assert.equal(err.transient, true);
        return true;
      }
    );
    assert.equal(h.calls.length, 4, '1 initial try + 3 retries');
    assert.deepEqual(h.sleeps, [1000, 2000, 4000]);
    const ids = h.calls.map((c) => c.payload.requestId);
    assert.equal(new Set(ids).size, 1, 'requestId must stay identical across all 4 attempts');
  });
});

describe('requestId plumbing', () => {
  test('an explicitly-passed requestId (e.g. resumed from the pendingAction buffer) is used verbatim', async () => {
    const h = makeHarness([jsonResponse({ ok: true, run: {} })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.endRun('RED-1-01', 'resumed-req-id');
    assert.equal(h.calls[0].payload.requestId, 'resumed-req-id');
  });

  test('omitting requestId auto-generates a fresh one per call', async () => {
    const h = makeHarness([jsonResponse({ ok: true, run: {} }), jsonResponse({ ok: true, run: {} })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.startRun('RED-1-01');
    await client.startRun('RED-1-01');
    assert.notEqual(h.calls[0].payload.requestId, h.calls[1].payload.requestId);
  });

  test('read actions (getVolunteers, getRun, identifyVolunteer) send no requestId', async () => {
    const h = makeHarness([
      jsonResponse({ ok: true, volunteers: [] }),
      jsonResponse({ ok: true, run: null }),
      jsonResponse({ ok: true, volunteer: {} }),
    ]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.getVolunteers();
    await client.getRun('RED-1-01');
    await client.identifyVolunteer(7);
    for (const call of h.calls) assert.equal(call.payload.requestId, undefined);
  });
});

describe('operator token attachment', () => {
  test('assignTeam and setManualAvailability attach the operator token when one is configured', async () => {
    const h = makeHarness([jsonResponse({ ok: true, run: {} }), jsonResponse({ ok: true })]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      getOperatorToken: () => 'secret-token',
    });
    await client.assignTeam('Team Alpha', 'RED-1-01');
    await client.setManualAvailability('RED-1-01', false);
    assert.equal(h.calls[0].payload.operatorToken, 'secret-token');
    assert.equal(h.calls[1].payload.operatorToken, 'secret-token');
  });

  test('volunteer-page actions (startRun, addPenalty, endRun) never attach an operator token', async () => {
    const h = makeHarness([
      jsonResponse({ ok: true, run: {} }),
      jsonResponse({ ok: true, run: {} }),
      jsonResponse({ ok: true, run: {} }),
    ]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      getOperatorToken: () => 'secret-token',
    });
    await client.startRun('RED-1-01');
    await client.addPenalty('RED-1-01');
    await client.endRun('RED-1-01');
    for (const call of h.calls) assert.equal(call.payload.operatorToken, undefined);
  });

  test('no operator token configured means the field is simply omitted, not sent as null/empty', async () => {
    const h = makeHarness([jsonResponse({ ok: true, run: {} })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    await client.assignTeam('Team Alpha', 'RED-1-01');
    assert.equal('operatorToken' in h.calls[0].payload, false);
  });
});

describe('verifyOperatorToken', () => {
  test('a correct token resolves ok:true in one call, no requestId sent', async () => {
    const h = makeHarness([jsonResponse({ ok: true })]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    const result = await client.verifyOperatorToken('correct-passcode');
    assert.equal(result.ok, true);
    assert.equal(h.calls[0].payload.operatorToken, 'correct-passcode');
    assert.equal(h.calls[0].payload.requestId, undefined);
  });

  test('UNAUTHORIZED is a terminal answer, not retried', async () => {
    const h = makeHarness([jsonResponse({ ok: false, reason: 'UNAUTHORIZED' })]);
    const client = createSheetsApiClient({
      apiUrl: 'https://script.example/exec',
      fetchImpl: h.fetchImpl,
      sleepImpl: h.sleepImpl,
    });
    const result = await client.verifyOperatorToken('wrong-passcode');
    assert.deepEqual(result, { ok: false, reason: 'UNAUTHORIZED' });
    assert.equal(h.calls.length, 1);
  });

  test('SERVER_MISCONFIGURED (OPERATOR_TOKEN never set) is also terminal, surfaced verbatim', async () => {
    const h = makeHarness([
      jsonResponse({ ok: false, reason: 'SERVER_MISCONFIGURED', message: 'Set the OPERATOR_TOKEN script property.' }),
    ]);
    const client = createSheetsApiClient({ apiUrl: 'https://script.example/exec', fetchImpl: h.fetchImpl });
    const result = await client.verifyOperatorToken('anything');
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'SERVER_MISCONFIGURED');
    assert.equal(h.calls.length, 1);
  });
});

describe('constructor guards', () => {
  test('throws immediately if apiUrl is missing', () => {
    assert.throws(() => createSheetsApiClient({ fetchImpl: async () => {} }), /apiUrl is required/);
  });

  test('throws immediately if no fetch implementation is available', () => {
    // The default fetchImpl only kicks in when the global `fetch` exists (Node 18+ has one, like a
    // browser does) — simulate an environment without it to exercise that guard.
    const realFetch = globalThis.fetch;
    // @ts-ignore
    delete globalThis.fetch;
    try {
      assert.throws(
        () => createSheetsApiClient({ apiUrl: 'https://script.example/exec' }),
        /no fetch implementation/
      );
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
