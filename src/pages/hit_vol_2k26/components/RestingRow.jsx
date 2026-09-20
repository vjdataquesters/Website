// src/pages/hit_vol_2k26/components/RestingRow.jsx
//
// One line in the "Resting" panel — the second-priority tier of the Control Center. There's
// nothing for the operator to DO with a resting volunteer (their run is already over, they're just
// waiting out the cooldown), so this is deliberately lightweight: no buttons, no card shadow — just
// enough to see who's coming back online and when. The row disappears on its own the instant
// CooldownCountdown hits zero (RestingPanel re-splits the roster every tick), so nothing here needs
// to react to that itself.

import { useState } from 'react';
import PropTypes from 'prop-types';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';
import CooldownCountdown from './CooldownCountdown.jsx';
import { volunteerShape } from '../propTypes.js';

export default function RestingRow({ volunteer, onClearCooldown }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const theme = COLOUR_THEME[volunteer.colour] || { label: volunteer.colour, hex: '#9ca3af' };

  async function handleBringBack() {
    if (busy || !onClearCooldown) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onClearCooldown(volunteer.volunteerId);
      if (result && result.ok === false) {
        setError(
          result.reason === 'UNAUTHORIZED'
            ? 'Operator passcode required.'
            : result.message || result.reason || 'Could not end rest.'
        );
      }
    } catch (err) {
      setError((err && err.message) || 'Could not end rest.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-slate-100 py-2 text-sm last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: theme.hex }} />
        <span className="min-w-0 flex-1 truncate text-slate-700">{volunteer.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <CooldownCountdown cooldownEnd={volunteer.cooldownEnd} />
          {onClearCooldown ? (
            <button
              type="button"
              onClick={handleBringBack}
              disabled={busy}
              title="End rest and return volunteer to available pool"
              className="rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? '…' : 'Bring Back'}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-1 text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}

RestingRow.propTypes = {
  volunteer: volunteerShape.isRequired,
  onClearCooldown: PropTypes.func,
};
