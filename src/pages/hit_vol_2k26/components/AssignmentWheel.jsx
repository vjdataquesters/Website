// src/pages/hit_vol_2k26/components/AssignmentWheel.jsx
//
// The Control Center's team-assignment flow: type a team name, spin, confirm, commit. The actual
// pick happens INSTANTLY the moment "Spin" is pressed, via services/wheelLogic.js's
// pickWeightedVolunteer — equal odds per volunteer, EXCEPT a volunteer on a (colour, path) group
// used within the last PATH_RECENCY_WINDOW_MS is less likely (never impossible) to come up, so the
// wheel doesn't keep sending teams down the same physical route back-to-back. The on-screen
// "spinning" cycle after that is a visual flourish only (rapidly cycling displayed names, via the
// plain unweighted pickRandomVolunteer, for ~1.1s before revealing the real pick) — it never changes
// the outcome.
//
// Commit ("assignTeam") is the server's real, authoritative check — this component's own
// eligibility/dedupe checks (via wheelLogic) are only an instant client-side hint so the operator
// doesn't spin against someone who's obviously already gone. Two server outcomes are handled
// explicitly because the plan calls them out by name:
//   - TEAM_ALREADY_PLAYED: someone (possibly this operator, from another tab/device sharing the
//     one Control Center link) already committed this exact team name moments ago. The team name
//     is cleared and the operator must type a new one — there is no way to "retry" a hard block.
//   - NO_LONGER_AVAILABLE: the specific volunteer landed on was grabbed by a concurrent assignment
//     between reveal and commit (see tests/concurrency.test.mjs's 50-concurrent-operators race,
//     which is exactly this scenario). The team name is KEPT (still valid) and the operator is
//     asked to spin again — never silently re-assigned to a different, unseen volunteer.
// A transient failure (network blip, SERVER_BUSY exhausted its retries) keeps the same pick AND
// the same requestId, so pressing "Try again" resumes the identical idempotent call rather than
// risking a distinct duplicate write.

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { sheetsApi } from '../services/sheetsApi.js';
import { generateRequestId } from '../utils/requestId.js';
import { getServerNow } from '../services/serverTime.js';
import {
  getEligibleVolunteers,
  isTeamNameTaken,
  pickRandomVolunteer,
  pickWeightedVolunteer,
  canSpin,
} from '../services/wheelLogic.js';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';

const SPIN_CYCLE_MS = 90; // how often the "spinning" display swaps to a new random name
const SPIN_DURATION_MS = 1100; // total time spent in the visual spin before revealing the real pick

/**
 * @param {object[]} volunteers roster rows (from useVolunteers)
 * @param {Set<string>} usedTeamNames
 * @param {() => void} onCommitted called after a successful assignment, so the parent can refresh
 *   the roster from the server rather than the wheel guessing at the new state itself
 */
export default function AssignmentWheel({ volunteers, usedTeamNames, onCommitted }) {
  const [teamName, setTeamName] = useState('');
  const [phase, setPhase] = useState('idle'); // 'idle' | 'spinning' | 'revealed' | 'committing'
  const [pickedVolunteer, setPickedVolunteer] = useState(null);
  const [spinDisplayVolunteer, setSpinDisplayVolunteer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const spinIntervalRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const commitRequestIdRef = useRef(null);

  useEffect(
    () => () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    },
    []
  );

  function resetWheel() {
    setPhase('idle');
    setTeamName('');
    setPickedVolunteer(null);
    setSpinDisplayVolunteer(null);
    commitRequestIdRef.current = null;
  }

  function handleSpin() {
    setErrorMessage(null);
    setSuccessMessage(null);
    const now = getServerNow();
    const eligible = getEligibleVolunteers(volunteers, now);
    const check = canSpin(teamName, usedTeamNames, eligible);
    if (!check.ok) {
      setErrorMessage(
        {
          EMPTY_TEAM_NAME: 'Enter a team name first.',
          TEAM_ALREADY_PLAYED: 'That team has already played — pick a different name.',
          NO_ELIGIBLE_VOLUNTEERS: 'No volunteers are currently available to assign.',
        }[check.reason] || 'Could not spin.'
      );
      return;
    }

    // The real pick happens right now — everything after this is cosmetic. Weighted against
    // recently-used paths (see wheelLogic.js's pickWeightedVolunteer header comment).
    const finalPick = pickWeightedVolunteer(eligible, volunteers, now);
    commitRequestIdRef.current = null; // fresh spin = fresh logical action = fresh requestId later

    setPhase('spinning');
    spinIntervalRef.current = setInterval(() => {
      setSpinDisplayVolunteer(pickRandomVolunteer(eligible));
    }, SPIN_CYCLE_MS);

    spinTimeoutRef.current = setTimeout(() => {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
      setSpinDisplayVolunteer(null);
      setPickedVolunteer(finalPick);
      setPhase('revealed');
    }, SPIN_DURATION_MS);
  }

  async function handleCommit() {
    if (!pickedVolunteer) return;
    setPhase('committing');
    setErrorMessage(null);
    if (!commitRequestIdRef.current) commitRequestIdRef.current = generateRequestId();

    if (!sheetsApi) {
      setErrorMessage('HIT Volunteer Control Center is not configured (missing VITE_HIT_VOL_2K26_API_URL).');
      setPhase('revealed');
      return;
    }

    try {
      const result = await sheetsApi.assignTeam(teamName, pickedVolunteer.volunteerId, commitRequestIdRef.current);
      if (result.ok) {
        setSuccessMessage(`${teamName} assigned to ${pickedVolunteer.name}.`);
        resetWheel();
        onCommitted();
        return;
      }
      if (result.reason === 'NO_LONGER_AVAILABLE') {
        setErrorMessage('That volunteer just became unavailable — spin again.');
        setPickedVolunteer(null);
        setPhase('idle');
        commitRequestIdRef.current = null;
        return;
      }
      if (result.reason === 'TEAM_ALREADY_PLAYED') {
        setErrorMessage('That team has already played — pick a different name.');
        setTeamName('');
        setPickedVolunteer(null);
        setPhase('idle');
        commitRequestIdRef.current = null;
        return;
      }
      if (result.reason === 'UNAUTHORIZED') {
        setErrorMessage('Operator passcode required to assign teams.');
        setPhase('revealed');
        return;
      }
      setErrorMessage(result.message || result.reason || 'Could not assign team.');
      setPhase('revealed');
    } catch (err) {
      setErrorMessage((err && err.message) || 'Connection issue — you can try committing again.');
      setPhase('revealed'); // same pick + same requestId, so "Try again" is a safe retry
    }
  }

  const displayedVolunteer = phase === 'spinning' ? spinDisplayVolunteer : pickedVolunteer;
  const displayTheme = displayedVolunteer ? COLOUR_THEME[displayedVolunteer.colour] : null;

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        disabled={phase === 'spinning' || phase === 'revealed' || phase === 'committing'}
        placeholder="Team name"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100"
      />
      {phase === 'idle' ? (
        <button
          type="button"
          onClick={handleSpin}
          className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
        >
          Spin
        </button>
      ) : null}

      {(phase === 'spinning' || phase === 'revealed' || phase === 'committing') && displayedVolunteer ? (
        <div
          className={`rounded-lg border-2 p-3 transition ${phase === 'spinning' ? 'animate-pulse border-slate-200 bg-slate-50' : ''}`}
          style={phase !== 'spinning' ? { borderColor: displayTheme?.hex, backgroundColor: `${displayTheme?.hex}14` } : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: displayTheme?.hex }} />
            <span className="truncate text-base font-bold text-slate-900">{displayedVolunteer.name}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {displayTheme?.label} · Path {displayedVolunteer.path} · #{displayedVolunteer.volunteerNumber}
          </div>
          {phase === 'revealed' ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleSpin}
                className="flex-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Re-spin
              </button>
              <button
                type="button"
                onClick={handleCommit}
                className="flex-1 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Confirm
              </button>
            </div>
          ) : null}
          {phase === 'committing' ? <span className="mt-2 block text-sm text-slate-500">Assigning…</span> : null}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-rose-600">{errorMessage}</p>
          {phase === 'revealed' ? (
            <button type="button" onClick={handleCommit} className="text-sm font-medium text-teal-700 underline">
              Try again
            </button>
          ) : null}
        </div>
      ) : null}
      {successMessage ? <p className="text-sm text-teal-700">{successMessage}</p> : null}
      {teamName && !errorMessage && phase === 'idle' && isTeamNameTaken(teamName, usedTeamNames) ? (
        <p className="text-xs text-amber-600">This team name has already played.</p>
      ) : null}
    </div>
  );
}

AssignmentWheel.propTypes = {
  volunteers: PropTypes.array,
  usedTeamNames: PropTypes.instanceOf(Set),
  onCommitted: PropTypes.func.isRequired,
};
