// src/pages/hit_vol_2k26/components/ActiveRunCard.jsx
//
// One row of the "Active runs" section — the highest-priority tier of the Control Center (see
// VolunteerRoster.jsx). This is deliberately the only card in the whole roster with real weight:
// there are usually only a handful of these at once (not 45), so a bigger timer and a dedicated
// control row are earned here in a way they aren't when every volunteer, playing or not, got the
// same-sized box. The left edge carries the volunteer's hunt colour — real information (which
// path this run belongs to), not decoration — everything else on the card stays neutral so that
// colour is the thing your eye actually catches.
//
// Owns the run-lifecycle actions for its volunteer: Start / Log penalty / End run, laid out as one
// compact control row (penalty stepper + action button) rather than stacked full-width buttons, so
// the card reads like a console row, not a form. Penalty logging is a purely local, instant counter
// (see PenaltyControls.jsx's header comment for why — no network round-trip per tap), persisted
// per-runId via utils/pendingPenalties.js so a page refresh mid-run doesn't drop taps made before
// End Run. It's sent to the server exactly once, bundled into the endRun call itself.

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TimerDisplay from './TimerDisplay.jsx';
import PenaltyControls from './PenaltyControls.jsx';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';
import { canStartRun, canEndRun } from '../services/runLogic.js';
import { volunteerShape } from '../propTypes.js';
import { readPendingPenalties, savePendingPenalties, clearPendingPenalties } from '../utils/pendingPenalties.js';

/**
 * @param {object} volunteer one row from getVolunteers_'s `volunteers` array, with activeRun set
 * @param {(action:'startRun'|'endRun', volunteerId:string, extra?:object) => Promise<object>} onRunAction
 */
export default function ActiveRunCard({ volunteer, onRunAction }) {
  const [runBusy, setRunBusy] = useState(null); // 'startRun' | 'endRun' | null
  const [runError, setRunError] = useState(null);

  const theme = COLOUR_THEME[volunteer.colour] || { label: volunteer.colour, hex: '#9ca3af' };
  const activeRun = volunteer.activeRun;
  const activeRunId = activeRun ? activeRun.runId : null;

  const [penalties, setPenalties] = useState(() => readPendingPenalties(activeRunId));
  const lastRunIdRef = useRef(activeRunId);
  useEffect(() => {
    if (activeRunId !== lastRunIdRef.current) {
      lastRunIdRef.current = activeRunId;
      setPenalties(readPendingPenalties(activeRunId));
    }
  }, [activeRunId]);

  function handleAddPenalty() {
    setPenalties((prev) => {
      const next = prev + 1;
      savePendingPenalties(activeRunId, next);
      return next;
    });
  }

  async function handleRunAction(action) {
    if (runBusy) return;
    setRunBusy(action);
    setRunError(null);
    try {
      const extra = action === 'endRun' ? { penalties } : undefined;
      const result = await onRunAction(action, volunteer.volunteerId, extra);
      if (result && result.ok === false) {
        setRunError(result.message || result.reason || 'Could not complete that action.');
      } else if (action === 'endRun') {
        clearPendingPenalties(activeRunId);
      }
    } catch (err) {
      setRunError((err && err.message) || 'Could not complete that action.');
    } finally {
      setRunBusy(null);
    }
  }

  if (!activeRun) return null;

  return (
    <div
      className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3"
      style={{ borderLeftWidth: '4px', borderLeftColor: theme.hex }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">{activeRun.teamName}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            <span className="font-medium" style={{ color: theme.hex }}>
              {theme.label} · Path {volunteer.path}
            </span>{' '}
            · {volunteer.name} · #{volunteer.volunteerNumber}
          </p>
        </div>
        <TimerDisplay startedAt={activeRun.startedAt} allowedMinutes={activeRun.allowedMinutes} size="lg" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        {canStartRun(activeRun) ? (
          <button
            type="button"
            onClick={() => handleRunAction('startRun')}
            disabled={runBusy !== null}
            className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:opacity-40"
          >
            {runBusy === 'startRun' ? 'Starting…' : 'Start'}
          </button>
        ) : null}

        {canEndRun(activeRun) ? (
          <>
            <PenaltyControls penalties={penalties} onAddPenalty={handleAddPenalty} />
            <button
              type="button"
              onClick={() => handleRunAction('endRun')}
              disabled={runBusy !== null}
              className="ml-auto rounded-md bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-40"
            >
              {runBusy === 'endRun' ? 'Ending…' : 'End run'}
            </button>
          </>
        ) : null}
      </div>

      {runError ? <p className="text-[11px] text-rose-600">{runError}</p> : null}
    </div>
  );
}

ActiveRunCard.propTypes = {
  volunteer: volunteerShape.isRequired,
  onRunAction: PropTypes.func.isRequired,
};
