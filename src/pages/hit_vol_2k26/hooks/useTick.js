// src/pages/hit_vol_2k26/hooks/useTick.js
import { useEffect, useState } from 'react';
import { getServerNow } from '../services/serverTime.js';

/**
 * Re-renders the calling component every `intervalMs`, returning the current server-synced time
 * (see services/serverTime.js). Used by anything that must visibly move between polls without
 * waiting on the network — TimerDisplay's elapsed seconds, CooldownCountdown's remaining time, and
 * the roster summary's live status counts.
 * @param {number} [intervalMs]
 * @returns {number} epoch ms
 */
export function useTick(intervalMs = 1000) {
  const [now, setNow] = useState(() => getServerNow());

  useEffect(() => {
    const id = setInterval(() => setNow(getServerNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
