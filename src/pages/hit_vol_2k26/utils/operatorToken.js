// src/pages/hit_vol_2k26/utils/operatorToken.js
//
// Persists the Control Center's operator passcode (the OPERATOR_TOKEN checked server-side by
// Code.gs's withOperatorAuth_) in this browser's localStorage, so the operator doesn't re-enter it
// every time the Control Center tab reloads. Same safe-storage pattern as utils/volunteerIdentity.js
// and utils/pendingAction.js — kept as its own file rather than merged into either, since it's a
// conceptually different thing (a credential, not an identity or an in-flight write) with its own
// gate (components/OperatorGate.jsx) and its own "change passcode" flow.
//
// This is the ONE place that reads/writes STORAGE_KEYS.operatorToken — services/sheetsApi.js's
// default singleton reads through here too, rather than touching localStorage itself, so there is
// exactly one implementation of "how the operator token is stored" to audit.

import { STORAGE_KEYS } from '../../../data/hit_vol_2k26/config.js';

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** @param {string} token */
export function saveOperatorToken(token) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.operatorToken, token);
  } catch {
    // Storage full/unavailable — the gate will just re-prompt next load. Not fatal.
  }
}

/** @returns {string|null} */
export function readOperatorToken() {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEYS.operatorToken);
  } catch {
    return null;
  }
}

export function clearOperatorToken() {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.operatorToken);
  } catch {
    // ignore
  }
}
