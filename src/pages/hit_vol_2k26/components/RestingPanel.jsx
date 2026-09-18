// src/pages/hit_vol_2k26/components/RestingPanel.jsx
//
// The sidebar's "who's coming back online" panel — split out from the main roster column so it can
// sit in the Control Center's sticky right rail next to the assignment wheel, where a quick glance
// doesn't compete for space with Active runs. Self-ticking (useTick) and re-derives its own slice
// of the roster split every second, same as VolunteerRoster does for the main column — cheap for
// 45 rows, and it means a volunteer's cooldown clearing removes them from this list the instant it
// happens rather than on the next poll.

import PropTypes from 'prop-types';
import { splitRosterByPriority } from '../services/rosterLogic.js';
import { useTick } from '../hooks/useTick.js';
import RestingRow from './RestingRow.jsx';

export default function RestingPanel({ volunteers, onClearCooldown }) {
  const now = useTick(1000);
  const { resting } = splitRosterByPriority(volunteers, now);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        Resting <span className="font-normal normal-case text-slate-300">({resting.length})</span>
      </h2>
      {resting.length === 0 ? (
        <p className="py-2 text-xs text-slate-400">No one is cooling down right now.</p>
      ) : (
        <div>
          {resting.map((v) => (
            <RestingRow key={v.volunteerId} volunteer={v} onClearCooldown={onClearCooldown} />
          ))}
        </div>
      )}
    </div>
  );
}

RestingPanel.propTypes = {
  volunteers: PropTypes.array,
  onClearCooldown: PropTypes.func,
};
