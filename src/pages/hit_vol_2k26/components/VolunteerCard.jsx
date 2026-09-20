// src/pages/hit_vol_2k26/components/VolunteerCard.jsx
//
// One volunteer's row in the Control Center roster grid. Status is recomputed live every tick via
// deriveLiveStatus (see rosterLogic.js) rather than trusted from the last poll response, so a
// RESTING volunteer visibly becomes AVAILABLE the instant their cooldown elapses instead of only
// updating on the next 5-20s poll.
//
// The manual availability toggle is intentionally NEVER disabled while a volunteer is PLAYING —
// this is a deliberate match to the validated backend behaviour (see tests/concurrency.test.mjs's
// "marked manually unavailable mid-run" test): an operator marking someone unavailable mid-run does
// not interrupt that run, it only takes effect once the run ends. Blocking the toggle during
// PLAYING would contradict behaviour that's already implemented and tested server-side.
//
// Start / Log penalty / End run: every run-lifecycle action, for every one of the 45 volunteers, is
// taken HERE by the operator on this one device — not on each volunteer's own phone. That's a
// deliberate simplification (there used to be a separate Volunteer page): an event venue can't
// guarantee every volunteer has a working connection, but the Control Center's one device does.
// canStartRun/canEndRun — services/runLogic.js — gate which button shows, mirroring exactly what
// Code.gs enforces server-side; these call the same idempotent sheetsApi.startRun/endRun actions
// the old Volunteer page used to, just triggered from here. "End run" always records the current
// time as the finish (no separate time-entry step) — same as Code.gs's endRun_ has always done.
//
// Penalties are the one exception to "call sheetsApi immediately": logging one is a purely local,
// instant counter (see PenaltyControls.jsx's header comment for why — no network round-trip per
// tap). The count lives in local state here, seeded from and persisted to utils/pendingPenalties.js
// keyed by this run's runId so a page refresh doesn't drop taps made before End Run. It's only ever
// sent to the server once, bundled as `{ penalties }` into the endRun call itself — Code.gs's
// endRun_ is what turns it into the stored, scored effectiveDurationSeconds.

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge.jsx';
import CooldownCountdown from './CooldownCountdown.jsx';
import TimerDisplay from './TimerDisplay.jsx';
import PenaltyControls from './PenaltyControls.jsx';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';
import { deriveLiveStatus } from '../services/rosterLogic.js';
import { canStartRun, canEndRun } from '../services/runLogic.js';
import { useTick } from '../hooks/useTick.js';
import { volunteerShape } from '../propTypes.js';
import { readPendingPenalties, savePendingPenalties, clearPendingPenalties } from '../utils/pendingPenalties.js';

/**
 * @param {object} volunteer one row from getVolunteers_'s `volunteers` array
 * @param {(volunteerId:string, nextAvailable:boolean) => Promise<{ok:boolean, reason?:string, message?:string}>} onToggleAvailability
 * @param {(action:'startRun'|'endRun', volunteerId:string, extra?:object) => Promise<{ok:boolean, reason?:string, message?:string}>} onRunAction
 */
export default function VolunteerCard({ volunteer, onToggleAvailability, onRunAction, onClearCooldown }) {
  const now = useTick(1000);
  const [busy, setBusy] = useState(false);
  const [toggleError, setToggleError] = useState(null);
  const [clearBusy, setClearBusy] = useState(false);
  // Which run action is currently in flight ('startRun' | 'endRun'), or null — a single flag is
  // enough because only one of this card's run buttons is ever shown at a time.
  const [runBusy, setRunBusy] = useState(null);
  const [runError, setRunError] = useState(null);

  const status = deriveLiveStatus(volunteer, now);
  const theme = COLOUR_THEME[volunteer.colour] || { label: volunteer.colour, hex: '#9ca3af' };
  const isAvailableFlag = !!volunteer.manuallyAvailable;
  const activeRun = volunteer.activeRun;
  const activeRunId = activeRun ? activeRun.runId : null;

  // Local, instant penalty counter — see the header comment above. Lazily seeded from whatever was
  // already persisted for this runId (a refresh mid-run must not lose taps made before End Run).
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

  function handleRemovePenalty() {
    setPenalties((prev) => {
      const next = Math.max(0, prev - 1);
      savePendingPenalties(activeRunId, next);
      return next;
    });
  }

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    setToggleError(null);
    try {
      const result = await onToggleAvailability(volunteer.volunteerId, !isAvailableFlag);
      if (result && result.ok === false) {
        setToggleError(
          result.reason === 'UNAUTHORIZED'
            ? 'Operator passcode required.'
            : result.message || result.reason || 'Could not update availability.'
        );
      }
    } catch (err) {
      setToggleError((err && err.message) || 'Could not update availability.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAction(action, extraOptions = {}) {
    if (runBusy) return;
    setRunBusy(action);
    setRunError(null);
    try {
      const extra = action === 'endRun' ? { penalties, ...extraOptions } : undefined;
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

  async function handleClearRest() {
    if (clearBusy || !onClearCooldown) return;
    setClearBusy(true);
    setToggleError(null);
    try {
      const result = await onClearCooldown(volunteer.volunteerId);
      if (result && result.ok === false) {
        setToggleError(
          result.reason === 'UNAUTHORIZED'
            ? 'Operator passcode required.'
            : result.message || result.reason || 'Could not end rest.'
        );
      }
    } catch (err) {
      setToggleError((err && err.message) || 'Could not end rest.');
    } finally {
      setClearBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: theme.hex }} />
            <span className="font-medium text-gray-900">{volunteer.name}</span>
            <span className="text-xs text-gray-400">#{volunteer.volunteerNumber}</span>
          </div>
          <div className="text-xs text-gray-500">
            {theme.label} · Path {volunteer.path}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === 'PLAYING' && activeRun ? (
        <div className="mt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-gray-700">{activeRun.teamName}</span>
            <TimerDisplay startedAt={activeRun.startedAt} allowedMinutes={activeRun.allowedMinutes} />
          </div>

          {canStartRun(activeRun) ? (
            <button
              type="button"
              onClick={() => handleRunAction('startRun')}
              disabled={runBusy !== null}
              className="mt-2 w-full rounded-md bg-indigo-600 px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              {runBusy === 'startRun' ? 'Starting…' : 'Start'}
            </button>
          ) : null}

          {canEndRun(activeRun) ? (
            <div className="mt-2 space-y-2">
              <PenaltyControls
                penalties={penalties}
                onAddPenalty={handleAddPenalty}
                onRemovePenalty={handleRemovePenalty}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRunAction('endRun')}
                  disabled={runBusy !== null}
                  className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  {runBusy === 'endRun' ? 'Ending…' : 'Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRunAction('endRun', { giveUp: true })}
                  disabled={runBusy !== null}
                  className="rounded-md bg-slate-600 px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Give Up
                </button>
              </div>
            </div>
          ) : null}

          {runError ? <p className="mt-1 text-[11px] text-red-600">{runError}</p> : null}
        </div>
      ) : null}

      {status === 'RESTING' ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <CooldownCountdown cooldownEnd={volunteer.cooldownEnd} />
          {onClearCooldown ? (
            <button
              type="button"
              onClick={handleClearRest}
              disabled={clearBusy}
              className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearBusy ? 'Saving…' : 'Bring Back'}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isAvailableFlag ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          {busy ? 'Saving…' : isAvailableFlag ? 'Mark unavailable' : 'Mark available'}
        </button>
        {toggleError ? <span className="text-xs text-red-600">{toggleError}</span> : null}
      </div>
    </div>
  );
}

VolunteerCard.propTypes = {
  volunteer: volunteerShape.isRequired,
  onToggleAvailability: PropTypes.func.isRequired,
  onRunAction: PropTypes.func.isRequired,
  onClearCooldown: PropTypes.func,
};
