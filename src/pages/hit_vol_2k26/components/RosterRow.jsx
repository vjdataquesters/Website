// src/pages/hit_vol_2k26/components/RosterRow.jsx
//
// One <tr> of the dense "Roster" table — available/unavailable volunteers, the bulk of the 45 at
// any given moment. This replaces what used to be a full bordered card per volunteer: there's
// nothing to look at here beyond identity + status + the availability toggle, so it's a real table
// row instead of a tile — ~40 idle volunteers fit in a scannable list instead of a wall of boxes,
// and a native <table> gets column alignment (and accessibility) for free instead of hand-rolled
// grid CSS. Colour is a small dot, kept consistent with ActiveRunCard/RestingRow's colour language
// without repeating their visual weight.

import { useState } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge.jsx';
import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';
import { volunteerShape } from '../propTypes.js';

/**
 * @param {object} volunteer
 * @param {(volunteerId:string, nextAvailable:boolean) => Promise<object>} onToggleAvailability
 */
export default function RosterRow({ volunteer, onToggleAvailability }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const theme = COLOUR_THEME[volunteer.colour] || { label: volunteer.colour, hex: '#9ca3af' };
  const isAvailableFlag = !!volunteer.manuallyAvailable;

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onToggleAvailability(volunteer.volunteerId, !isAvailableFlag);
      if (result && result.ok === false) {
        setError(
          result.reason === 'UNAUTHORIZED'
            ? 'Operator passcode required.'
            : result.message || result.reason || 'Could not update availability.'
        );
      }
    } catch (err) {
      setError((err && err.message) || 'Could not update availability.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-slate-100 text-sm last:border-b-0 hover:bg-slate-50">
      <td className="w-8 py-2 pl-3">
        <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.hex }} />
      </td>
      <td className="min-w-0 py-2 pr-3">
        <span className="block truncate font-medium text-slate-900">{volunteer.name}</span>
        {error ? <span className="block text-[11px] text-rose-600">{error}</span> : null}
      </td>
      <td className="hidden whitespace-nowrap py-2 pr-3 text-xs tabular-nums text-slate-400 sm:table-cell">
        #{volunteer.volunteerNumber}
      </td>
      <td className="hidden whitespace-nowrap py-2 pr-3 text-xs text-slate-500 md:table-cell">
        {theme.label} · Path {volunteer.path}
      </td>
      <td className="whitespace-nowrap py-2 pr-3">
        <StatusBadge status={isAvailableFlag ? 'AVAILABLE' : 'UNAVAILABLE'} />
      </td>
      <td className="whitespace-nowrap py-2 pr-3 text-right">
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          className={`rounded px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isAvailableFlag ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
          }`}
        >
          {busy ? 'Saving…' : isAvailableFlag ? 'Mark unavailable' : 'Mark available'}
        </button>
      </td>
    </tr>
  );
}

RosterRow.propTypes = {
  volunteer: volunteerShape.isRequired,
  onToggleAvailability: PropTypes.func.isRequired,
};
