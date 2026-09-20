// src/pages/hit_vol_2k26/components/VolunteerRoster.jsx
//
// The Control Center's main column: a quiet stat strip, then two tiers ordered by how much
// attention they need — not one uniform grid of 45 identical cards grouped only by colour.
//
//   1. Active runs — needs attention right now. Rich ActiveRunCard per volunteer, sorted
//      most-time-elapsed first, so the run closest to the 30-minute cap is on top.
//   2. Roster — everyone else (available/unavailable), the bulk of the 45. A dense table instead
//      of big cards, with search + colour filters (RosterFilters) so finding one person doesn't
//      mean scanning a wall of tiles.
//
// The third tier, Resting, lives in the sidebar instead (RestingPanel.jsx, rendered by
// ControlCenter.jsx) — it's a glance-and-move-on list, not something that belongs in the main
// scanning column.
//
// All grouping/sorting/counting/filtering logic lives in rosterLogic.js (unit-tested); this
// component stays thin — it re-derives the split every tick (useTick) so a run's elapsed time
// moves a volunteer between sections the instant it happens, not on the next 5-20s poll.

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { splitRosterByPriority, filterRosterVolunteers, summarizeRosterCounts } from '../services/rosterLogic.js';
import { useTick } from '../hooks/useTick.js';
import ActiveRunCard from './ActiveRunCard.jsx';
import RosterRow from './RosterRow.jsx';
import RosterFilters from './RosterFilters.jsx';

function StatTile({ label, value, tone }) {
  const toneClass = tone === 'teal' ? 'text-teal-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-700';
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className={`text-xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
StatTile.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, tone: PropTypes.string };

/**
 * @param {object[]} volunteers
 * @param {(volunteerId:string, nextAvailable:boolean) => Promise<object>} onToggleAvailability
 * @param {(action:'startRun'|'endRun', volunteerId:string, extra?:object) => Promise<object>} onRunAction
 */
export default function VolunteerRoster({ volunteers, onToggleAvailability, onRunAction, onClearCooldown }) {
  const now = useTick(1000);
  const [query, setQuery] = useState('');
  const [selectedColours, setSelectedColours] = useState(() => new Set());

  const { active, roster } = splitRosterByPriority(volunteers, now);
  const counts = summarizeRosterCounts(volunteers, now);
  const filteredRoster = useMemo(
    () => filterRosterVolunteers(roster, { query, colours: selectedColours }),
    // roster's array identity changes every tick (a fresh array from splitRosterByPriority), but
    // its membership only meaningfully changes when `volunteers` does — recomputing on every tick
    // is a cheap array filter, but the array identity isn't a useful dep, so depend on the
    // underlying data instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [volunteers, query, selectedColours]
  );

  function toggleColour(colour) {
    setSelectedColours((prev) => {
      const next = new Set(prev);
      if (next.has(colour)) next.delete(colour);
      else next.add(colour);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-4 gap-2">
        <StatTile label="Available" value={counts.AVAILABLE} />
        <StatTile label="Playing" value={counts.PLAYING} tone="teal" />
        <StatTile label="Resting" value={counts.RESTING} tone="amber" />
        <StatTile label="Unavailable" value={counts.UNAVAILABLE} />
      </div>

      <section className="mb-6">
        <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-teal-700">
          Active runs
          <span className="font-normal normal-case text-slate-400">({active.length})</span>
        </h2>
        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-400">
            No teams currently running.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
            {active.map((v) => (
              <ActiveRunCard key={v.volunteerId} volunteer={v} onRunAction={onRunAction} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Roster
          <span className="font-normal normal-case text-slate-400">({roster.length})</span>
        </h2>
        <RosterFilters
          query={query}
          onQueryChange={setQuery}
          selectedColours={selectedColours}
          onToggleColour={toggleColour}
          matchCount={filteredRoster.length}
        />
        <div className="overflow-hidden rounded-lg border border-slate-200">
          {filteredRoster.length === 0 ? (
            <p className="bg-white px-3 py-4 text-center text-xs text-slate-400">No volunteers match these filters.</p>
          ) : (
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="w-8 py-2 pl-3"></th>
                  <th className="py-2 pr-3">Volunteer</th>
                  <th className="hidden py-2 pr-3 sm:table-cell">#</th>
                  <th className="hidden py-2 pr-3 md:table-cell">Colour / Path</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((v) => (
                  <RosterRow key={v.volunteerId} volunteer={v} onToggleAvailability={onToggleAvailability} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

VolunteerRoster.propTypes = {
  volunteers: PropTypes.array,
  onToggleAvailability: PropTypes.func.isRequired,
  onRunAction: PropTypes.func.isRequired,
  onClearCooldown: PropTypes.func,
};
