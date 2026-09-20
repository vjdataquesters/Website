// src/pages/hit_vol_2k26/services/resultsLogic.js
//
// Pure, framework-free, zero-import-inside-function-body functions — mirrored, function-body-for-
// function-body, into apps-script/hit_vol_2k26/Code.gs's formatMinutesSeconds_/buildResultsRow_
// (same convention as statusLogic.js; see that file's header comment). NOT used by the React
// frontend at runtime — the Results tab is written server-side, once, by Code.gs's endRun_, directly
// as real Sheet values (a proper Date object per timestamp, a formatted "M:SS" string per duration)
// rather than via a Sheets formula. That earlier formula-based approach turned out to be fragile in
// practice (see git history / conversation: the formula silently went missing and stopped showing
// completed runs at all) — writing the finished values once, in code, removes that whole failure
// mode. This module exists purely so that row-building logic gets the same unit-test coverage as
// everything else in this codebase, even though only Code.gs ever calls the mirrored copy.
//
// @param {{teamName, colour, path, volunteerName, startedAt, endedAt, durationSeconds, penalties,
//   effectiveDurationSeconds}} run one row from the Runs sheet (RUN_HEADERS shape) — all timestamp/
//   duration fields are epoch-ms numbers or seconds, per that sheet's own convention.

/**
 * @param {number|string} totalSeconds
 * @returns {string} "M:SS" (e.g. "32:05"), or '' for a missing/non-finite input.
 */
export function formatMinutesSeconds(totalSeconds) {
  const n = Number(totalSeconds);
  if (totalSeconds === '' || totalSeconds === null || totalSeconds === undefined || !isFinite(n)) return '';
  const total = Math.max(0, Math.round(n));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

/**
 * Builds one Results-tab row, in RESULTS_HEADERS order: Team, Colour, Path, Volunteer, Start time,
 * End time, Duration, Penalties, Effective time (+3m/penalty).
 * @param {object} run
 * @returns {Array}
 */
export function buildResultsRow(run) {
  return [
    run.teamName,
    run.colour,
    run.path,
    run.volunteerName,
    run.startedAt ? new Date(Number(run.startedAt)) : '',
    run.endedAt ? new Date(Number(run.endedAt)) : '',
    formatMinutesSeconds(run.durationSeconds),
    run.penalties,
    formatMinutesSeconds(run.effectiveDurationSeconds),
  ];
}
