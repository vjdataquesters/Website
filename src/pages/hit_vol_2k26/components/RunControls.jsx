// src/pages/hit_vol_2k26/components/RunControls.jsx
//
// START TIMER / END RUN — and ONLY these two buttons, tapped by the volunteer themselves, ever
// start or stop a run's clock. Scanning a team's QR code (Hit.jsx's existing scavenger-hunt flow,
// fully separate from this feature) must never call startRun/endRun — this component is the only
// place those actions are wired to a user gesture, which is what makes that guarantee auditable in
// one place rather than "somewhere in the QR flow doesn't call it, probably".
//
// The actual start/end calls, retry, and pending-action persistence across a refresh all live in
// VolunteerPage.jsx (the parent) — this component is intentionally a dumb view: given `run`, the
// derived view state, busy flags, and two callbacks, it renders the right button and the shared
// TimerDisplay. See services/runLogic.js for canStartRun/canEndRun.

import PropTypes from 'prop-types';
import TimerDisplay from './TimerDisplay.jsx';
import { canStartRun, canEndRun } from '../services/runLogic.js';
import { runShape } from '../propTypes.js';

/**
 * @param {object|null} run
 * @param {boolean} startBusy
 * @param {boolean} endBusy
 * @param {() => void} onStart
 * @param {() => void} onEnd
 */
export default function RunControls({ run, startBusy, endBusy, onStart, onEnd }) {
  if (canStartRun(run)) {
    return (
      <button
        type="button"
        onClick={onStart}
        disabled={startBusy}
        className="w-full rounded-lg bg-indigo-600 px-4 py-4 text-lg font-bold text-white disabled:opacity-50"
      >
        {startBusy ? 'Starting…' : 'START TIMER'}
      </button>
    );
  }

  if (canEndRun(run)) {
    return (
      <div className="flex flex-col items-center gap-4">
        <TimerDisplay startedAt={run.startedAt} allowedMinutes={run.allowedMinutes} size="lg" />
        <button
          type="button"
          onClick={onEnd}
          disabled={endBusy}
          className="w-full rounded-lg bg-red-600 px-4 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {endBusy ? 'Ending…' : 'END RUN'}
        </button>
      </div>
    );
  }

  return null;
}

RunControls.propTypes = {
  run: runShape,
  startBusy: PropTypes.bool,
  endBusy: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
};
