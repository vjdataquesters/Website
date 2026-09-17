// src/pages/hit_vol_2k26/components/OperatorGate.jsx
//
// Gates the Control Center behind the operator passcode (the same OPERATOR_TOKEN Code.gs's
// withOperatorAuth_ checks on assignTeam/setManualAvailability). Verified immediately via the
// read-only verifyOperatorToken action rather than waiting for the first real write to reveal
// whether it was right — see sheetsApi.js's comment on that action.
//
// This is access control for the Control Center UI, not encryption or a login system — the token
// travels in every operator-gated request exactly as before. It exists to keep a volunteer who
// opens the wrong link, or someone poking at the shared Control Center URL, from casually assigning
// teams or toggling availability, not to withstand a determined attacker.

import { useState } from 'react';
import PropTypes from 'prop-types';
import { sheetsApi } from '../services/sheetsApi.js';
import { saveOperatorToken } from '../utils/operatorToken.js';

/** @param {() => void} onVerified called once the entered passcode is confirmed correct */
export default function OperatorGate({ onVerified }) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token.trim()) return;
    setStatus('checking');
    setErrorMessage(null);

    if (!sheetsApi) {
      setStatus('error');
      setErrorMessage('This page is not configured (missing VITE_HIT_VOL_2K26_API_URL).');
      return;
    }

    try {
      const result = await sheetsApi.verifyOperatorToken(token.trim());
      if (result.ok) {
        saveOperatorToken(token.trim());
        onVerified();
      } else {
        setStatus('error');
        setErrorMessage(
          result.reason === 'SERVER_MISCONFIGURED'
            ? 'The server has no operator passcode set yet — see the Code.gs setup instructions (Script Properties > OPERATOR_TOKEN).'
            : 'Incorrect passcode.'
        );
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage((err && err.message) || 'Could not reach the server — check your connection and try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="mb-5 text-xl font-bold text-slate-900">HIT Control Center</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-600" htmlFor="operator-passcode">
            Operator passcode
          </label>
          <input
            id="operator-passcode"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={status === 'checking'}
            className="rounded-md border border-slate-300 px-3 py-3 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100"
            autoFocus
          />
          <button
            type="submit"
            disabled={status === 'checking' || !token.trim()}
            className="rounded-md bg-teal-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
          >
            {status === 'checking' ? 'Checking…' : 'Enter'}
          </button>
          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
        </form>
      </div>
    </div>
  );
}

OperatorGate.propTypes = {
  onVerified: PropTypes.func.isRequired,
};
