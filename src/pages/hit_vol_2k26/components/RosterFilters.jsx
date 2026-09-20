// src/pages/hit_vol_2k26/components/RosterFilters.jsx
//
// Search + colour chips above the dense Roster table (see rosterLogic.filterRosterVolunteers,
// which this drives). With ~40 available/unavailable volunteers in one flat list, finding one
// specific person by scanning used to mean hunting through colour sections — this lets the
// operator jump straight there by name/number, or narrow to one or more colours at a glance.
// Purely controlled: all state lives in the parent (VolunteerRoster) so filtering stays in sync
// with the live-ticking roster split.

import PropTypes from 'prop-types';
import { COLOURS, COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';

/**
 * @param {string} query
 * @param {(next:string) => void} onQueryChange
 * @param {Set<string>} selectedColours empty Set means "all colours"
 * @param {(colour:string) => void} onToggleColour
 * @param {number} matchCount how many roster rows match the current filters
 */
export default function RosterFilters({ query, onQueryChange, selectedColours, onToggleColour, matchCount }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search name or #…"
        className="min-w-[160px] flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      <div className="flex flex-wrap items-center gap-1">
        {COLOURS.map((colour) => {
          const theme = COLOUR_THEME[colour] || { label: colour, hex: '#9ca3af' };
          const active = selectedColours.size === 0 || selectedColours.has(colour);
          return (
            <button
              key={colour}
              type="button"
              onClick={() => onToggleColour(colour)}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition"
              style={
                active
                  ? { backgroundColor: theme.hex, color: '#fff' }
                  : { backgroundColor: `${theme.hex}14`, color: theme.hex, opacity: 0.55 }
              }
            >
              {theme.label}
            </button>
          );
        })}
      </div>
      <span className="ml-auto text-xs tabular-nums text-slate-400">{matchCount} shown</span>
    </div>
  );
}

RosterFilters.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  selectedColours: PropTypes.instanceOf(Set).isRequired,
  onToggleColour: PropTypes.func.isRequired,
  matchCount: PropTypes.number.isRequired,
};
