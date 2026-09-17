// src/pages/hit_vol_2k26/components/TimerDisplay.jsx
//
// The Control Center's per-volunteer run timer, shown on each roster card — ONE timer component, so
// there is exactly one place the "is this run over time" visual rule lives.
//
// Anchored to `startedAt`, never an incrementing counter: every tick recomputes elapsed as
// (now - startedAt) via statusLogic.computeElapsedSeconds. This is precisely what makes a page
// refresh mid-run show the correct elapsed time immediately on mount instead of restarting from
// zero — see tests/statusLogic.test.mjs's "CRITICAL: a refresh" test for the proof of that
// property at the pure-function level.
//
// While a run is still LIVE (no endedAt), the displayed count stops climbing once it reaches
// allowedMinutes — allowed time is now a hard, fixed cap (see statusLogic.computeAllowedMinutes)
// and the clock visibly stopping at e.g. 30:00 is the signal to end the run, not a number that
// keeps climbing past it. A run that has already ENDED still shows its true recorded duration,
// uncapped — that's history, not a live countdown, and may honestly be over the cap.

import PropTypes from 'prop-types';
import { useTick } from '../hooks/useTick.js';
import { computeElapsedSeconds, isOverAllowed } from '../services/statusLogic.js';
import { formatMinutesSeconds } from '../utils/formatDuration.js';

/**
 * @param {number|string|null} startedAt epoch ms, or falsy if the run hasn't started yet
 * @param {number|string|null} [endedAt] epoch ms, or falsy while still running — freezes the
 *   display at the frozen elapsed time once set, rather than continuing to tick
 * @param {number} [allowedMinutes] shown as "/ NN:00" and drives the over-time colour, when known
 * @param {'md'|'lg'} [size]
 */
export default function TimerDisplay({ startedAt, endedAt = null, allowedMinutes, size = 'md' }) {
  const now = useTick(1000);
  const elapsedSeconds = computeElapsedSeconds(startedAt, endedAt, now);
  const displaySeconds = !endedAt && allowedMinutes ? Math.min(elapsedSeconds, allowedMinutes * 60) : elapsedSeconds;
  const over = allowedMinutes ? isOverAllowed(elapsedSeconds, allowedMinutes) : false;
  const sizeClass = size === 'lg' ? 'text-4xl' : 'text-base';

  return (
    <span
      className={`font-mono font-bold tabular-nums ${sizeClass} ${over ? 'text-rose-600' : 'text-slate-900'}`}
      aria-live="off"
    >
      {formatMinutesSeconds(displaySeconds)}
      {allowedMinutes ? <span className="ml-1 text-xs font-normal text-slate-400">/ {allowedMinutes}:00</span> : null}
    </span>
  );
}

TimerDisplay.propTypes = {
  startedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  endedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  allowedMinutes: PropTypes.number,
  size: PropTypes.oneOf(['md', 'lg']),
};
