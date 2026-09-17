// src/pages/hit_vol_2k26/utils/pendingAction.js
//
// A single-slot localStorage buffer for the one mutating write currently in flight from this
// browser, so a refresh, a killed tab, or a phone that sleeps mid-retry can resume with the SAME
// requestId on reload instead of either losing the tap or generating a fresh requestId (which
// would risk a genuinely distinct duplicate write if the original request actually reached the
// server just as the page died). This is explicitly NOT a source of truth for volunteer/run state
// — that always comes from the Sheet via sheetsApi — it exists only to keep a requestId stable
// across a reload. Callers clear it as soon as the call settles, success or a terminal failure.

import { STORAGE_KEYS } from '../../../data/hit_vol_2k26/config.js';

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * @param {string} action one of the mutating action names (e.g. 'endRun')
 * @param {object} payload the args needed to resume the call (e.g. { volunteerId })
 * @param {string} requestId the SAME id already sent to the server for this action
 */
export function savePendingAction(action, payload, requestId) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(
      STORAGE_KEYS.pendingAction,
      JSON.stringify({ action, payload, requestId, savedAt: Date.now() })
    );
  } catch {
    // Storage full/unavailable (e.g. private browsing). The in-memory retry loop for this page
    // load still works fine; it just won't survive a reload. Not fatal — never throw from here.
  }
}

/** @returns {{action:string, payload:object, requestId:string, savedAt:number}|null} */
export function readPendingAction() {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEYS.pendingAction);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingAction() {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.pendingAction);
  } catch {
    // ignore — worst case a stale entry lingers until overwritten by the next pending action
  }
}
