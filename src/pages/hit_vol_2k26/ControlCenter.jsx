// src/pages/hit_vol_2k26/ControlCenter.jsx
//
// The merged HIT Control Center: passcode gate, then one page with the assignment wheel and the
// full volunteer roster — no separate coordinator pages, per the approved plan. The inner view
// owns the poll-driven roster state (via useVolunteers) and is the single place that turns a
// roster mutation into "call sheetsApi, then refresh the roster from the server" — it never
// mutates local state directly from a write response, so the roster the operator sees is always
// what the Sheet actually says, not an optimistic guess.
//
// Layout: a two-column console on wide screens — the main column (VolunteerRoster: stat strip,
// Active runs, the dense Roster table) is what the operator scans continuously, so it gets the
// width; a narrower sticky sidebar holds the two things reached for on demand rather than watched
// — the assignment wheel and the Resting list (RestingPanel) — always visible, not tucked behind a
// button or a modal. Below the `lg` breakpoint the sidebar simply drops beneath the main column.
//
// Colour discipline: the five hunt colours (red/orange/blue/green/violet — config.js's
// COLOUR_THEME) are reserved for team/path identity. The Control Center's own chrome uses a
// disjoint palette — neutral slate plus a single teal accent for interactive elements — so a teal
// "Spin" button or a slate stat tile never gets mistaken for a team indicator.

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useVolunteers } from './hooks/useVolunteers.js';
import { useUnloadGuard } from './hooks/useUnloadGuard.js';
import { sheetsApi } from './services/sheetsApi.js';
import VolunteerRoster from './components/VolunteerRoster.jsx';
import AssignmentWheel from './components/AssignmentWheel.jsx';
import RestingPanel from './components/RestingPanel.jsx';
import OperatorGate from './components/OperatorGate.jsx';
import FeatureErrorBoundary from './components/FeatureErrorBoundary.jsx';
import ConnectionBanner from './components/ConnectionBanner.jsx';
import { readOperatorToken, clearOperatorToken } from './utils/operatorToken.js';
import { generateRequestId } from './utils/requestId.js';

export default function ControlCenter() {
  const [hasOperatorToken, setHasOperatorToken] = useState(() => !!readOperatorToken());

  if (!hasOperatorToken) {
    return <OperatorGate onVerified={() => setHasOperatorToken(true)} />;
  }

  return (
    <FeatureErrorBoundary>
      <ControlCenterInner
        onChangePasscode={() => {
          clearOperatorToken();
          setHasOperatorToken(false);
        }}
      />
    </FeatureErrorBoundary>
  );
}

function ControlCenterInner({ onChangePasscode }) {
  const { volunteers, usedTeamNames, status, pollError, lastUpdatedAt, refresh } = useVolunteers();
  useUnloadGuard();

  async function handleToggleAvailability(volunteerId, nextAvailable) {
    if (!sheetsApi) {
      return { ok: false, reason: 'NOT_CONFIGURED', message: 'VITE_HIT_VOL_2K26_API_URL is not set.' };
    }
    const result = await sheetsApi.setManualAvailability(volunteerId, nextAvailable);
    if (result.ok) refresh(); // re-pull from the Sheet immediately rather than trusting local state
    return result;
  }

  // Start / End run — every run-lifecycle action, for any of the 45 volunteers, is triggered from
  // here by the operator (see ActiveRunCard.jsx's header comment for why). Same shape as
  // handleToggleAvailability above: call the one matching sheetsApi action with a fresh idempotency
  // key, then re-pull the whole roster from the Sheet on success rather than guessing the new state
  // locally. `extra` forwards ActiveRunCard's locally-tallied `{ penalties }` through to endRun.
  async function handleRunAction(action, volunteerId, extra) {
    if (!sheetsApi) {
      return { ok: false, reason: 'NOT_CONFIGURED', message: 'VITE_HIT_VOL_2K26_API_URL is not set.' };
    }
    const result = await sheetsApi[action](volunteerId, generateRequestId(), extra);
    if (result.ok) refresh();
    return result;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">HIT Volunteer Control Center</h1>
            {lastUpdatedAt ? (
              <p className="text-[11px] tabular-nums text-slate-400">
                updated {Math.max(0, Math.round((Date.now() - lastUpdatedAt) / 1000))}s ago
              </p>
            ) : null}
          </div>
          <button type="button" onClick={onChangePasscode} className="text-xs text-slate-400 underline hover:text-slate-600">
            Change passcode
          </button>
        </div>
        <ConnectionBanner message={pollError} />
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {status === 'loading' ? (
          <p className="text-slate-500">Loading roster…</p>
        ) : status === 'error' ? (
          <div className="rounded-lg bg-rose-50 p-4 text-rose-700">
            <p>{pollError || 'Could not load the roster.'}</p>
            <button type="button" onClick={refresh} className="mt-2 rounded bg-rose-600 px-3 py-1 text-sm text-white">
              Retry
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-5">
            <VolunteerRoster
              volunteers={volunteers}
              onToggleAvailability={handleToggleAvailability}
              onRunAction={handleRunAction}
            />

            <aside className="mt-6 flex flex-col gap-4 lg:sticky lg:top-[70px] lg:mt-0">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Assign a team</h2>
                <AssignmentWheel volunteers={volunteers} usedTeamNames={usedTeamNames} onCommitted={refresh} />
              </div>
              <RestingPanel volunteers={volunteers} />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

ControlCenterInner.propTypes = {
  onChangePasscode: PropTypes.func.isRequired,
};
