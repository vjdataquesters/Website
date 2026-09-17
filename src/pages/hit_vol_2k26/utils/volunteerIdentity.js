// src/pages/hit_vol_2k26/utils/volunteerIdentity.js
//
// Persists which volunteer this browser belongs to, once confirmed via the ID gate (see plan's
// no-PIN, two-link identification model — this is a convenience so a volunteer doesn't re-enter
// their number every time their phone screen locks, NOT a security boundary; anyone with the
// shared volunteer link and a number can act as that volunteer, which was an explicit accepted
// tradeoff during planning). Deliberately separate from utils/pendingAction.js even though both
// are single-slot localStorage buffers — they represent different things (who this browser is, vs.
// one write currently in flight) and are cleared independently.

import { STORAGE_KEYS } from '../../../data/hit_vol_2k26/config.js';

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** @param {{volunteerId:string, volunteerNumber:number, name:string, colour:string, path:number}} identity */
export function saveVolunteerIdentity(identity) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.volunteerIdentity, JSON.stringify(identity));
  } catch {
    // Storage full/unavailable — the gate will just re-prompt next load. Not fatal.
  }
}

/** @returns {{volunteerId:string, volunteerNumber:number, name:string, colour:string, path:number}|null} */
export function readVolunteerIdentity() {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEYS.volunteerIdentity);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearVolunteerIdentity() {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.volunteerIdentity);
  } catch {
    // ignore
  }
}
