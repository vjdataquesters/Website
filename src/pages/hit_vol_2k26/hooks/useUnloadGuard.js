// src/pages/hit_vol_2k26/hooks/useUnloadGuard.js
//
// Warns the operator before they close, refresh, or navigate away from a tab that's holding
// not-yet-sent penalty taps (utils/pendingPenalties.js) for a still-active run. Penalty logging is
// a purely local counter (see PenaltyControls.jsx's header comment) that only reaches the server
// once, bundled into End Run — so until that happens, it exists ONLY in this browser's
// localStorage. A refresh is fine (the count survives and ActiveRunCard re-reads it on mount), but
// switching to a different device or browser mid-event is NOT: pendingPenalties never leaves this
// origin, so a switch silently drops whatever's been tapped since the run started. Nothing can stop
// that outright short of sending every tap immediately again — the exact round-trip this redesign
// removed — but this at least makes closing/reloading THIS tab require a confirmation instead of
// losing the count without a word.

import { useEffect } from 'react';
import { hasAnyPendingPenalties } from '../utils/pendingPenalties.js';

export function useUnloadGuard() {
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!hasAnyPendingPenalties()) return;
      e.preventDefault();
      e.returnValue = ''; // required for Chrome/Edge to actually show the native confirmation
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
