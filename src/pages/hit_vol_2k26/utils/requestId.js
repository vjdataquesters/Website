// src/pages/hit_vol_2k26/utils/requestId.js
//
// Generates the idempotency key used by every mutating Sheets action (assignTeam, startRun,
// addPenalty, endRun, setManualAvailability). The contract that makes retries safe is: ONE
// requestId is generated per logical user action, and the SAME value is reused across every retry
// attempt of that action (see services/sheetsApi.js's callWithRetry) — never a fresh id per HTTP
// attempt. That is what lets Code.gs's CacheService-backed idempotency check collapse a retried
// call into "return the same result as last time" instead of performing the write twice.

/**
 * @returns {string} a value unique-enough among the ~45 volunteer devices + 1 Control Center that
 * might be generating ids around the same moment. Does not need to be globally/cryptographically
 * unique forever — only unique for the ~30 minute idempotency cache TTL on the server.
 */
export function generateRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for browsers/WebViews without crypto.randomUUID (some older Android WebViews a
  // volunteer's phone might use). Not cryptographically strong — doesn't need to be.
  return (
    'rid-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}
