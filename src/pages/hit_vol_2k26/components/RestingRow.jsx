// src/pages/hit_vol_2k26/components/RestingRow.jsx
//
// One line in the "Resting" panel — the second-priority tier of the Control Center. There's
// nothing for the operator to DO with a resting volunteer (their run is already over, they're just
// waiting out the cooldown), so this is deliberately lightweight: no buttons, no card shadow — just
// enough to see who's coming back online and when. The row disappears on its own the instant
// CooldownCountdown hits zero (RestingPanel re-splits the roster every tick), so nothing here needs
// to react to that itself.

import { COLOUR_THEME } from '../../../data/hit_vol_2k26/config.js';
import CooldownCountdown from './CooldownCountdown.jsx';
import { volunteerShape } from '../propTypes.js';

export default function RestingRow({ volunteer }) {
  const theme = COLOUR_THEME[volunteer.colour] || { label: volunteer.colour, hex: '#9ca3af' };

  return (
    <div className="flex items-center gap-2 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: theme.hex }} />
      <span className="min-w-0 flex-1 truncate text-slate-700">{volunteer.name}</span>
      <CooldownCountdown cooldownEnd={volunteer.cooldownEnd} />
    </div>
  );
}

RestingRow.propTypes = {
  volunteer: volunteerShape.isRequired,
};
