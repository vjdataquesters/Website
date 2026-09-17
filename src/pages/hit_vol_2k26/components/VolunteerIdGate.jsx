// src/pages/hit_vol_2k26/components/VolunteerIdGate.jsx
//
// The Volunteer page's entry screen when this browser hasn't identified itself yet. Enter the
// short public volunteerNumber (1-45), server-verify it via identifyVolunteer, then require an
// explicit confirm step showing the matched name/colour/path before saving — so a typo (e.g. "12"
// meant to be "21") is caught by a human glance instead of silently misidentifying the phone for
// the rest of the event. No PIN: this is an identification convenience, not an auth boundary (see
// utils/volunteerIdentity.js's comment on the accepted security tradeoff from planning).

import { useState } from 'react';
import PropTypes from 'prop-types';
import { sheetsApi } from '../services/sheetsApi.js';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';

/** @param {(identity: object) => void} onConfirmed called once the volunteer confirms the match */
export default function VolunteerIdGate({ onConfirmed }) {
  const [numberInput, setNumberInput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'looking-up' | 'confirming' | 'error'
  const [candidate, setCandidate] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleLookup(e) {
    e.preventDefault();
    const trimmed = numberInput.trim();
    if (!trimmed) return;
    setStatus('looking-up');
    setErrorMessage(null);

    if (!sheetsApi) {
      setStatus('error');
      setErrorMessage('This page is not configured (missing VITE_HIT_VOL_2K26_API_URL).');
      return;
    }

    try {
      const result = await sheetsApi.identifyVolunteer(trimmed);
      if (result.ok) {
        setCandidate(result.volunteer);
        setStatus('confirming');
      } else {
        setStatus('error');
        setErrorMessage(result.reason === 'NOT_FOUND' ? 'No volunteer with that number — check and try again.' : (result.message || result.reason));
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage((err && err.message) || 'Could not reach the server — check your connection and try again.');
    }
  }

  function handleConfirm() {
    onConfirmed(candidate);
  }

  function handleNotMe() {
    setCandidate(null);
    setStatus('idle');
    setNumberInput('');
  }

  const theme = candidate ? COLOUR_THEME[candidate.colour] : null;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-bold text-gray-900">HIT Volunteer Check-in</h1>

      {status !== 'confirming' ? (
        <form onSubmit={handleLookup} className="flex flex-col gap-3">
          <label className="text-sm text-gray-600" htmlFor="volunteer-number">
            Enter your volunteer number
          </label>
          <input
            id="volunteer-number"
            type="number"
            inputMode="numeric"
            min="1"
            max="45"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            disabled={status === 'looking-up'}
            className="rounded-md border border-gray-300 px-3 py-3 text-lg disabled:bg-gray-100"
            placeholder="e.g. 7"
            autoFocus
          />
          <button
            type="submit"
            disabled={status === 'looking-up' || !numberInput.trim()}
            className="rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
          >
            {status === 'looking-up' ? 'Checking…' : 'Continue'}
          </button>
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        </form>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Is this you?</p>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme?.hex }} />
            <span className="text-lg font-bold text-gray-900">{candidate.name}</span>
          </div>
          <div className="text-sm text-gray-500">
            {theme?.label} · Path {candidate.path} · #{candidate.volunteerNumber}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleNotMe}
              className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
            >
              No, try again
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Yes, this is me
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

VolunteerIdGate.propTypes = {
  onConfirmed: PropTypes.func.isRequired,
};
