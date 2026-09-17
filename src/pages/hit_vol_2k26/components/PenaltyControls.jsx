// src/pages/hit_vol_2k26/components/PenaltyControls.jsx
//
// The penalty stepper inside ActiveRunCard's control row — a compact "count + add" control, not a
// full-width button, so it sits naturally alongside Start/End in a single toolbar row instead of
// stacking the card taller.
//
// Deliberately NOT a server call per tap: an earlier version called sheetsApi.addPenalty on every
// tap, which meant every single penalty was a network round-trip to Apps Script — slow, and each
// one blocking the button on that round-trip. Penalties are now an instant, purely local counter
// (state lives in ActiveRunCard, persisted per-runId via utils/pendingPenalties.js so a page
// refresh mid-run doesn't lose taps that haven't been sent yet). Nothing about this ever touches
// the live 30-minute timer — see statusLogic.computeAllowedMinutes, still a hard fixed cap.
//
// The count is only ever sent to the server ONCE, bundled into the endRun call when the operator
// taps "End run" (see ActiveRunCard.jsx's handleRunAction and sheetsApi.js's endRun). Code.gs's
// endRun_ is what turns this count into the stored, scored result: it re-clamps to MAX_PENALTIES
// as a safety net and computes effectiveDurationSeconds = durationSeconds +
// penalties * PENALTY_EFFECTIVE_MINUTES * 60, once, at that moment — never recomputed live.
//
// Amber here is the same "needs a beat of attention" tone RESTING uses (StatusBadge.jsx) —
// deliberately not one of the five hunt colours, so it never reads as a team indicator.

import PropTypes from 'prop-types';
import { MAX_PENALTIES } from '../../../data/hit_vol_2k26/config.js';

/**
 * @param {number} penalties the local, not-yet-sent penalty count for this run
 * @param {() => void} onAddPenalty synchronous — just increments local state, no network call
 */
export default function PenaltyControls({ penalties, onAddPenalty }) {
  const atPenaltyCap = penalties >= MAX_PENALTIES;

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 py-1 pl-2.5 pr-1">
      <span className="text-xs font-semibold tabular-nums text-amber-800" title="Penalties — +3 min added to the scored result when the run ends">
        {penalties}/{MAX_PENALTIES} penalty
      </span>
      <button
        type="button"
        onClick={onAddPenalty}
        disabled={atPenaltyCap}
        className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-sm font-bold leading-none text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Log a penalty"
      >
        +
      </button>
    </div>
  );
}

PenaltyControls.propTypes = {
  penalties: PropTypes.number,
  onAddPenalty: PropTypes.func.isRequired,
};

PenaltyControls.defaultProps = {
  penalties: 0,
};
