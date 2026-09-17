// src/pages/hit_vol_2k26/components/StatusBadge.jsx
//
// Renders one of the four derived statuses from statusLogic.computeStatus. Never computes status
// itself — always receives it as a prop from a parent that called deriveLiveStatus/computeStatus.
//
// Deliberately NOT reusing the five hunt colours (red/orange/blue/green/violet — see config.js's
// COLOUR_THEME) for status: every roster row already wears its team colour as a dot, so a
// green/blue status pill sitting next to a green/blue team dot reads ambiguously ("is that my
// status or my team?"). Status gets its own, disjoint palette instead — teal for the one state
// that needs eyes on it (PLAYING), amber for the one that's waiting on the clock (RESTING), and
// quiet slate for the two that need nothing from anyone (AVAILABLE/UNAVAILABLE, told apart by
// weight, not hue).

import PropTypes from 'prop-types';

const STATUS_STYLES = {
  AVAILABLE: { label: 'Available', className: 'bg-slate-100 text-slate-500' },
  PLAYING: { label: 'Playing', className: 'bg-teal-600 text-white' },
  RESTING: { label: 'Resting', className: 'border border-amber-200 bg-amber-50 text-amber-700' },
  UNAVAILABLE: { label: 'Unavailable', className: 'bg-slate-100 text-slate-400 line-through decoration-slate-300' },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.UNAVAILABLE;
  return (
    <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};
