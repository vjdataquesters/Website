// src/pages/hit_vol_2k26/services/serverTime.js
//
// Tracks the offset between this device's clock and the Apps Script server's clock (Date.now() at
// the moment it handled the request), so the whole feature can compute a "now" that stays roughly
// consistent across every volunteer's phone and the Control Center — a phone with its clock a few
// minutes off should not show a visibly different countdown than the Control Center is showing for
// the same run. This is a DISPLAY-consistency aid only: the timer's authoritative source of truth
// is always the server (durationSeconds is computed server-side in endRun_, from the server's own
// Date.now(), never from anything the client sends) — see statusLogic.js's computeElapsedSeconds,
// which takes a `nowMs` the caller supplies, and callers should supply getServerNow() from here.
//
// Every sheetsApi response that includes `serverNow` (getVolunteers, getRun) feeds this module, so
// the offset re-syncs continuously during normal polling without any dedicated sync call.

let offsetMs = 0; // serverNow - Date.now() at the moment we last heard from the server
let synced = false;

/**
 * @param {number} serverNow epoch ms, as reported by the Apps Script backend in a response.
 */
export function updateServerTimeOffset(serverNow) {
  if (typeof serverNow !== 'number' || Number.isNaN(serverNow)) return;
  offsetMs = serverNow - Date.now();
  synced = true;
}

/**
 * @returns {number} the current time, adjusted by the last-known server offset. Falls back to the
 * device's own clock (offset 0) until the first server response arrives.
 */
export function getServerNow() {
  return Date.now() + offsetMs;
}

/** @returns {boolean} whether we've ever received a serverNow to sync against. */
export function hasSyncedServerTime() {
  return synced;
}

/** Test-only: resets module state between unit tests. Not used by app code. */
export function resetServerTimeOffsetForTests() {
  offsetMs = 0;
  synced = false;
}
