// src/pages/hit_vol_2k26/propTypes.js
//
// Shared PropTypes shapes for the plain data objects that flow through this feature's component
// props — the getVolunteers_/getRun_ response shapes from Code.gs. Centralized here so every
// component declares the same shape instead of each re-describing it slightly differently. The
// project's own .eslintrc.cjs enables plugin:react/recommended with no override, so react/prop-types
// is a real, enforced lint error — this file exists to satisfy that correctly rather than papering
// over it with PropTypes.object.

import PropTypes from 'prop-types';

/** One volunteer's currently-active run, as embedded in getVolunteers_'s response (only present
 *  while that volunteer is actually PLAYING). */
export const activeRunShape = PropTypes.shape({
  runId: PropTypes.string,
  teamName: PropTypes.string,
  startedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  penalties: PropTypes.number,
  allowedMinutes: PropTypes.number,
});

/** One row from getVolunteers_'s `volunteers` array. */
export const volunteerShape = PropTypes.shape({
  volunteerId: PropTypes.string,
  volunteerNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.string,
  colour: PropTypes.string,
  path: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  manuallyAvailable: PropTypes.bool,
  cooldownEnd: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.string,
  currentTeam: PropTypes.string,
  activeRun: activeRunShape,
});

/** getRun_'s `run` field / any Runs-tab row shape, as returned by assignTeam_/startRun_/addPenalty_/endRun_. */
export const runShape = PropTypes.shape({
  runId: PropTypes.string,
  teamName: PropTypes.string,
  colour: PropTypes.string,
  path: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  volunteerId: PropTypes.string,
  volunteerName: PropTypes.string,
  assignedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  startedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  endedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  durationSeconds: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  penalties: PropTypes.number,
  allowedMinutes: PropTypes.number,
  status: PropTypes.string,
  cooldownStart: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cooldownEnd: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // Stored ONCE by Code.gs's endRun_ (durationSeconds + penalties * PENALTY_EFFECTIVE_MINUTES *
  // 60) — the scored/reported duration used to rank teams in the "Team Results" Sheet tab. Never
  // recomputed live; blank until the run ends.
  effectiveDurationSeconds: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});
