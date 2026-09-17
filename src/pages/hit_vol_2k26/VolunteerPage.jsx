// src/pages/hit_vol_2k26/VolunteerPage.jsx
//
// The single page a volunteer's phone loads (the "one shared volunteer link" from planning).
// Two phases: identify (VolunteerIdGate, only shown once per browser — see
// utils/volunteerIdentity.js) and then the run view built here.
//
// Refresh-consistency (an explicit requirement from the build approval): the timer never resets on
// reload because RunControls/TimerDisplay always recompute elapsed time from the server-supplied
// `startedAt` timestamp (see statusLogic.computeElapsedSeconds), and the run's current state is
// always re-fetched from the server on mount via useRun — nothing about "what run am I in / how
// much time is left" is ever read from localStorage. localStorage here holds exactly two things,
// neither of which is run state: WHO this browser is (utils/volunteerIdentity.js) and, transiently,
// the requestId of a write that was still in flight when the page last closed (utils/
// pendingAction.js) — resumed below with the SAME id so a refresh mid-tap can never turn into a
// silently duplicated START/PENALTY/END call.

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import VolunteerIdGate from './components/VolunteerIdGate.jsx';
import RunControls from './components/RunControls.jsx';
import PenaltyControls from './components/PenaltyControls.jsx';
import CooldownCountdown from './components/CooldownCountdown.jsx';
import FeatureErrorBoundary from './components/FeatureErrorBoundary.jsx';
import ConnectionBanner from './components/ConnectionBanner.jsx';
import { useRun } from './hooks/useRun.js';
import { useTick } from './hooks/useTick.js';
import { sheetsApi } from './services/sheetsApi.js';
import { generateRequestId } from './utils/requestId.js';
import { readVolunteerIdentity, saveVolunteerIdentity, clearVolunteerIdentity } from './utils/volunteerIdentity.js';
import { readPendingAction, savePendingAction, clearPendingAction } from './utils/pendingAction.js';
import { readPendingPenalties, savePendingPenalties, clearPendingPenalties } from './utils/pendingPenalties.js';
import { deriveRunViewState } from './services/runLogic.js';
import { COLOUR_THEME } from '../../data/hit_vol_2k26/config.js';
import { identityShape } from './propTypes.js';

/** Top-level entry: resolves identity first, then hands off to VolunteerRunView. */
export default function VolunteerPage() {
  const [identity, setIdentity] = useState(() => readVolunteerIdentity());

  if (!identity) {
    return (
      <FeatureErrorBoundary>
        <VolunteerIdGate
          onConfirmed={(vol) => {
            saveVolunteerIdentity(vol);
            setIdentity(vol);
          }}
        />
      </FeatureErrorBoundary>
    );
  }

  return (
    <FeatureErrorBoundary>
      <VolunteerRunView
        identity={identity}
        onSwitchVolunteer={() => {
          clearVolunteerIdentity();
          setIdentity(null);
        }}
      />
    </FeatureErrorBoundary>
  );
}

function VolunteerRunView({ identity, onSwitchVolunteer }) {
  const { run, status, pollError, refresh, setRunDirectly } = useRun(identity.volunteerId);
  const now = useTick(1000);

  const [startBusy, setStartBusy] = useState(false);
  const [endBusy, setEndBusy] = useState(false);
  const [penaltyBusy, setPenaltyBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const resumedRef = useRef(false);

  const activeRunId = run ? run.runId : null;
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

  const busySetterFor = (action) => ({ startRun: setStartBusy, endRun: setEndBusy, addPenalty: setPenaltyBusy }[action]);

  async function resumeAction(pending) {
    if (!sheetsApi) return;
    const busySetter = busySetterFor(pending.action);
    if (busySetter) busySetter(true);
    try {
      const result = await sheetsApi[pending.action](identity.volunteerId, pending.requestId);
      if (result.ok) setRunDirectly(result.run);
      else setActionError(result.message || result.reason || 'Could not finish your last action.');
    } catch (err) {
      setActionError((err && err.message) || 'Could not finish your last action — please try again.');
    } finally {
      clearPendingAction();
      if (busySetter) busySetter(false);
      refresh();
    }
  }

  // Runs once, before anything else: if this browser died mid-write (killed tab, lost signal),
  // resume it with the same requestId rather than waiting for the volunteer to notice and re-tap.
  useEffect(() => {
    if (resumedRef.current) return;
    resumedRef.current = true;
    const pending = readPendingAction();
    if (pending && pending.payload && pending.payload.volunteerId === identity.volunteerId) {
      resumeAction(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runMutation(action, extraOptions = {}) {
    const busySetter = busySetterFor(action);
    if (!sheetsApi) {
      setActionError('This page is not configured (missing VITE_HIT_VOL_2K26_API_URL).');
      return;
    }
    if (busySetter) busySetter(true);
    setActionError(null);
    const requestId = generateRequestId();
    const extra = action === 'endRun' ? { penalties, ...extraOptions } : extraOptions;
    savePendingAction(action, { volunteerId: identity.volunteerId, ...extra }, requestId);
    try {
      const result = await sheetsApi[action](identity.volunteerId, requestId, extra);
      if (result.ok) {
        if (action === 'endRun') {
          clearPendingPenalties(activeRunId);
        }
        setRunDirectly(result.run);
      } else if (result.reason === 'NO_ACTIVE_RUN') {
        // Something else already changed this run (operator, or another device/tab for the same
        // volunteer) — resync from the server instead of showing a confusing stale-button error.
        setActionError('Your run status changed — refreshing…');
        refresh();
      } else {
        setActionError(result.message || result.reason || 'Could not complete that action.');
      }
    } catch (err) {
      setActionError((err && err.message) || 'Connection issue — please try again.');
    } finally {
      clearPendingAction();
      if (busySetter) busySetter(false);
    }
  }

  const viewState = deriveRunViewState(run, now);
  const theme = COLOUR_THEME[identity.colour] || { label: identity.colour, hex: '#9ca3af' };
  const showTeamBanner = (viewState === 'ASSIGNED_NOT_STARTED' || viewState === 'RUNNING') && run;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.hex }} />
            <span className="font-bold text-gray-900">{identity.name}</span>
          </div>
          <div className="text-xs text-gray-500">
            {theme.label} · Path {identity.path} · #{identity.volunteerNumber}
          </div>
        </div>
        <button type="button" onClick={onSwitchVolunteer} className="text-xs text-gray-400 underline">
          Not you?
        </button>
      </header>

      {status === 'loading' ? (
        <p className="text-gray-500">Loading…</p>
      ) : status === 'error' ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>{pollError || 'Could not load your run.'}</p>
          <button type="button" onClick={refresh} className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white">
            Retry
          </button>
        </div>
      ) : (
        <>
          <ConnectionBanner message={pollError} />

          {viewState === 'WAITING_FOR_ASSIGNMENT' ? (
            <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              Waiting for a team to be assigned to you.
            </div>
          ) : null}

          {viewState === 'RESTING' && run ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
              <p className="mb-2 font-semibold text-yellow-800">Run complete — resting</p>
              <CooldownCountdown cooldownEnd={run.cooldownEnd} />
            </div>
          ) : null}

          {showTeamBanner ? (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center">
              <p className="text-xs text-indigo-700">Team</p>
              <p className="text-lg font-bold text-indigo-900">{run.teamName}</p>
            </div>
          ) : null}

          {viewState === 'ASSIGNED_NOT_STARTED' || viewState === 'RUNNING' ? (
            <RunControls
              run={run}
              startBusy={startBusy}
              endBusy={endBusy}
              onStart={() => runMutation('startRun')}
              onEnd={() => runMutation('endRun')}
              onGiveUp={() => runMutation('endRun', { giveUp: true })}
            />
          ) : null}

          {viewState === 'RUNNING' ? (
            <PenaltyControls
              penalties={penalties}
              onAddPenalty={handleAddPenalty}
              onRemovePenalty={handleRemovePenalty}
            />
          ) : null}

          {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
        </>
      )}
    </div>
  );
}

VolunteerRunView.propTypes = {
  identity: identityShape.isRequired,
  onSwitchVolunteer: PropTypes.func.isRequired,
};
