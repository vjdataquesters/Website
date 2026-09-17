// src/pages/hit_vol_2k26/services/runLogic.js
//
// Pure gating logic for a single run's Start / End actions — used by the Control Center's
// ActiveRunCard (see components/ActiveRunCard.jsx). All run-lifecycle actions are operator-driven
// from the Control Center now — there is no separate per-volunteer page or device depending on its
// own connectivity — but the shape these functions depend on (a `run`-like object with
// startedAt/endedAt) is unchanged: on ActiveRunCard it is `volunteer.activeRun` from
// getVolunteers_'s response (see propTypes.js's activeRunShape) rather than getRun_'s `run` field,
// but the same fields mean the same thing either way.
//
// Penalty gating used to live here too (canAddPenalty), but penalties are now a purely local,
// instant counter capped inline in PenaltyControls.jsx against MAX_PENALTIES directly — there's no
// server round-trip per tap to gate, so no shared gating function is needed for it anymore.

/** True only once a team is assigned but the clock hasn't started yet (`startedAt` still blank). */
export function canStartRun(run) {
  return !!run && !run.startedAt && !run.endedAt;
}

/** True only while RUNNING. */
export function canEndRun(run) {
  return !!run && !!run.startedAt && !run.endedAt;
}
