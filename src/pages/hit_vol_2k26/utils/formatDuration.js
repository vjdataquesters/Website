// src/pages/hit_vol_2k26/utils/formatDuration.js
//
// Pure formatting helper shared by TimerDisplay and CooldownCountdown so "m:ss" formatting exists
// in exactly one place.

/**
 * @param {number} totalSeconds
 * @returns {string} "m:ss", e.g. 65 -> "1:05". Negative/garbage input clamps to "0:00".
 */
export function formatMinutesSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
