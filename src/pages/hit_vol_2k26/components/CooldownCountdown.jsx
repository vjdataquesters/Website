// src/pages/hit_vol_2k26/components/CooldownCountdown.jsx
//
// Live "resting · m:ss left" readout for a RESTING volunteer. Ticks every second between polls via
// statusLogic.remainingCooldownMs against the server-synced clock, so the countdown reaches 0 at
// the same instant deriveLiveStatus flips the card to AVAILABLE — the two never disagree because
// both read from the same cooldownEnd value and the same clock.

import PropTypes from 'prop-types';
import { useTick } from '../hooks/useTick.js';
import { remainingCooldownMs } from '../services/statusLogic.js';
import { formatMinutesSeconds } from '../utils/formatDuration.js';

/** @param {number|string|null} cooldownEnd epoch ms */
export default function CooldownCountdown({ cooldownEnd }) {
  const now = useTick(1000);
  const remainingMs = remainingCooldownMs(cooldownEnd, now);
  if (remainingMs <= 0) return null;

  return (
    <span className="font-mono text-xs tabular-nums text-amber-700">
      {formatMinutesSeconds(remainingMs / 1000)} left
    </span>
  );
}

CooldownCountdown.propTypes = {
  cooldownEnd: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
