// src/pages/hit_vol_2k26/utils/pendingPenalties.js
//
// Backs the Control Center's local, instant penalty counter (see components/PenaltyControls.jsx's
// header comment for why it's local instead of a server call per tap). One localStorage key holds a
// { [runId]: count } map, covering every volunteer's run at once — several can be PLAYING
// simultaneously, so this can't be a single global counter. Persisting it is what keeps an
// accidental page refresh mid-run from silently dropping penalty taps that haven't reached End Run
// yet: ActiveRunCard re-reads this for a given runId on mount / whenever that volunteer's activeRun
// changes.
//
// Best-effort like every localStorage access in this feature: wrapped in try/catch so a private
// window or blocked storage degrades to "penalties just live in memory for this page load" instead
// of throwing.

import { STORAGE_KEYS } from '../../../data/hit_vol_2k26/config.js';

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.pendingPenalties);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.pendingPenalties, JSON.stringify(map));
  } catch {
    // Storage unavailable/full — the in-memory count in ActiveRunCard's state still works for this
    // page load, it just won't survive a refresh. Nothing else to do about it here.
  }
}

/** @param {string|null} runId @returns {number} the locally-tallied penalty count for this run, or 0 */
export function readPendingPenalties(runId) {
  if (!runId) return 0;
  return Number(readAll()[runId]) || 0;
}

/** @param {string|null} runId @param {number} count */
export function savePendingPenalties(runId, count) {
  if (!runId) return;
  const all = readAll();
  all[runId] = count;
  writeAll(all);
}

/** Called once the final count has been sent to the server with End Run. @param {string|null} runId */
export function clearPendingPenalties(runId) {
  if (!runId) return;
  const all = readAll();
  delete all[runId];
  writeAll(all);
}

/**
 * True if ANY run has a not-yet-sent penalty tap sitting in this browser's storage. Backs
 * hooks/useUnloadGuard.js's "are you sure you want to leave" prompt — this local counter only
 * reaches the server once, bundled into End Run, so it exists ONLY in this browser until then; a
 * closed tab or a switch to a different device silently drops it.
 */
export function hasAnyPendingPenalties() {
  const all = readAll();
  return Object.values(all).some((count) => Number(count) > 0);
}
