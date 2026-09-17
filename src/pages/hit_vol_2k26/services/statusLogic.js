// src/pages/hit_vol_2k26/services/statusLogic.js
//
// Pure, framework-free functions shared by the React frontend AND mirrored, function-body-for-
// function-body, into apps-script/hit_vol_2k26/Code.gs. Apps Script has no module system, so it
// cannot literally `import` this file — but every function here is written with zero import/export
// syntax INSIDE the function body specifically so the body can be copy-pasted into Code.gs verbatim.
// The only things Code.gs supplies differently are the config numbers (its own CONFIG block, kept
// in sync with src/data/hit_vol_2k26/config.js by hand — see that file's comment).
//
// None of these functions read the clock, touch the network, or touch the DOM — every "now" is
// passed in, which is what makes them trivial to unit test and safe to run identically on both
// a browser and Apps Script's V8 runtime.

/**
 * The single source of truth for a volunteer's displayed status. Never store this — always derive
 * it, from these three fields, against the current time. See the plan's §D for why this precedence
 * order (PLAYING, then the manual flag, then cooldown) is what makes "manual unavailable survives
 * cooldown" and "marking unavailable mid-run doesn't interrupt the run" fall out for free.
 *
 * @param {{activeRunId?: string, activeRunEndedAt?: string|number|null, manuallyAvailable: boolean, cooldownEnd?: string|number|null}} volunteer
 * @param {number} nowMs
 * @returns {'PLAYING'|'UNAVAILABLE'|'RESTING'|'AVAILABLE'}
 */
function computeStatus(volunteer, nowMs) {
  if (volunteer.activeRunId && !volunteer.activeRunEndedAt) return 'PLAYING';
  if (volunteer.manuallyAvailable === false) return 'UNAVAILABLE';
  if (volunteer.cooldownEnd && nowMs < Number(volunteer.cooldownEnd)) return 'RESTING';
  return 'AVAILABLE';
}

/**
 * @param {{activeRunId?: string, activeRunEndedAt?: string|number|null, manuallyAvailable: boolean, cooldownEnd?: string|number|null}} volunteer
 * @param {number} nowMs
 * @returns {boolean} true only when computeStatus === 'AVAILABLE' — the wheel's eligibility test.
 */
function isVolunteerEligible(volunteer, nowMs) {
  return computeStatus(volunteer, nowMs) === 'AVAILABLE';
}

/**
 * Allowed time in minutes for a run — a HARD, fixed cap. Penalties are logged (see addPenalty_ /
 * makeAddPenalty) for the record, but deliberately never extend this: the signature still accepts
 * `penalties`/`penaltyMinutes` so every existing call site keeps working unchanged, but both are
 * now ignored — this always returns `baseMinutes`. See PenaltyControls.jsx / runLogic.js's
 * canAddPenalty for the matching client behaviour: past `baseMinutes` elapsed, no more penalties
 * can even be logged.
 * @param {number} penalties unused — kept for call-site compatibility, see above
 * @param {number} baseMinutes
 * @param {number} penaltyMinutes unused — kept for call-site compatibility, see above
 */
function computeAllowedMinutes(penalties, baseMinutes, penaltyMinutes) { // eslint-disable-line no-unused-vars
  return baseMinutes;
}

/**
 * Elapsed run time in whole seconds, anchored to startedAt — NEVER an incrementing counter.
 * Recomputing this from the stored timestamps is what makes a refresh, a sleeping phone, or a
 * killed tab self-correct instantly instead of losing or drifting the timer.
 * @param {number|null} startedAt epoch ms, or falsy if not started yet
 * @param {number|null} endedAt epoch ms, or falsy if still running
 * @param {number} nowMs
 */
function computeElapsedSeconds(startedAt, endedAt, nowMs) {
  if (!startedAt) return 0;
  const end = endedAt || nowMs;
  return Math.max(0, Math.floor((Number(end) - Number(startedAt)) / 1000));
}

/**
 * @param {number} elapsedSeconds
 * @param {number} allowedMinutes
 */
function isOverAllowed(elapsedSeconds, allowedMinutes) {
  return elapsedSeconds >= allowedMinutes * 60;
}

/**
 * @param {number} endedAt epoch ms
 * @param {number} cooldownMinutes
 * @returns {number} epoch ms when cooldown ends
 */
function computeCooldownEnd(endedAt, cooldownMinutes) {
  return Number(endedAt) + cooldownMinutes * 60 * 1000;
}

/**
 * @param {number|null} cooldownEnd epoch ms, or falsy if not in cooldown
 * @param {number} nowMs
 * @returns {number} ms remaining, floored at 0
 */
function remainingCooldownMs(cooldownEnd, nowMs) {
  if (!cooldownEnd) return 0;
  return Math.max(0, Number(cooldownEnd) - nowMs);
}

/**
 * Normalizes a team name for uniqueness comparisons: trims, lower-cases, and collapses internal
 * whitespace runs to one space, so "Team Alpha", " team  alpha", and "TEAM ALPHA" all compare equal.
 * @param {string} name
 */
function normalizeTeamName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export {
  computeStatus,
  isVolunteerEligible,
  computeAllowedMinutes,
  computeElapsedSeconds,
  isOverAllowed,
  computeCooldownEnd,
  remainingCooldownMs,
  normalizeTeamName,
};
