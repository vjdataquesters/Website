// src/data/hit_vol_2k26/config.js
//
// Every magic number the HIT Control Center depends on lives here, and only here.
// Nothing else in this feature should hard-code 30, 5, 2, or 15 — import from this file instead.

/** The allowed time for a run — a HARD, FIXED cap. Penalties (below) are logged for the record but
 *  deliberately never extend this; see statusLogic.computeAllowedMinutes. */
export const TIMER_BASE_MINUTES = 30;

/** Historical only — no longer added to the allowed time (kept so old Runs rows / call sites that
 *  still pass it stay meaningful; see statusLogic.computeAllowedMinutes's comment). Not the same
 *  thing as PENALTY_EFFECTIVE_MINUTES below — that one is live and in use. */
export const PENALTY_MINUTES = 5;

/** A team can have at most this many penalties logged per run — enforced client-side in
 *  PenaltyControls.jsx (an instant, local counter — see its header comment for why it's no longer a
 *  server call per tap) and re-clamped server-side in Code.gs's endRun_ as a safety net. */
export const MAX_PENALTIES = 2;

/** Minutes added to a run's "effective" (scored/reported) duration per logged penalty — computed
 *  and stored ONCE, by Code.gs's endRun_, when the run ends. This never touches the live 30-minute
 *  timer or TIMER_BASE_MINUTES; it only affects the recorded effectiveDurationSeconds value used to
 *  rank teams afterwards (see the "Team Results" Sheet tab). */
export const PENALTY_EFFECTIVE_MINUTES = 3;

/** Minutes a volunteer rests after ending a run, before they're eligible again. */
export const COOLDOWN_MINUTES = 15;

/** How long a (colour, path) group's assignment odds stay suppressed after it was last used —
 *  see wheelLogic.js's pickWeightedVolunteer. This is a SOFT bias against recently-used paths, not a
 *  hard cooldown: a hard exclusion can leave the wheel with nothing to pick if every currently-
 *  available volunteer happens to be on a just-used path (see MIN_PATH_WEIGHT, which is what
 *  prevents that deadlock). Odds recover linearly back to normal over this window. */
export const PATH_RECENCY_WINDOW_MS = 7 * 60 * 1000; // 7 minutes

/** The floor a recently-used path's selection weight decays to — never zero, so a path is always
 *  pickable, just less likely right after it was used. 0.2 means "about 1/5 as likely as a path
 *  that hasn't been touched recently", recovering to full odds over PATH_RECENCY_WINDOW_MS. */
export const MIN_PATH_WEIGHT = 0.2;

/** The five hunt colours, in the fixed order used everywhere (IDs, numbering, the sheet). */
export const COLOURS = ['red', 'orange', 'blue', 'green', 'violet'];

/** Paths per colour. */
export const PATHS_PER_COLOUR = 3;

/** Volunteers per path. */
export const VOLUNTEERS_PER_PATH = 3;

/** Total roster size — COLOURS.length * PATHS_PER_COLOUR * VOLUNTEERS_PER_PATH, kept explicit for a quick sanity check. */
export const TOTAL_VOLUNTEERS = COLOURS.length * PATHS_PER_COLOUR * VOLUNTEERS_PER_PATH;

/** Display metadata per colour — used for badges/tags, kept out of component files. */
export const COLOUR_THEME = {
  red: { label: 'Red', hex: '#e14b4b' },
  orange: { label: 'Orange', hex: '#e2792a' },
  blue: { label: 'Blue', hex: '#2f6fe0' },
  green: { label: 'Green', hex: '#1f9d5a' },
  violet: { label: 'Violet', hex: '#7b52d6' },
};

/** Polling cadence. Every poller adds random jitter within +/-JITTER_MS to avoid synchronized bursts (see plan §H). */
export const POLL_INTERVAL_MS = {
  rosterActive: 5000, // Control Center, tab visible
  rosterIdle: 20000, // Control Center, tab hidden/backgrounded
  runActive: 4000, // Volunteer page, a run is in progress
  runIdle: 15000, // Volunteer page, waiting for an assignment
  jitterMs: 1500,
};

/** Retry policy for mutating calls. */
export const RETRY = {
  attempts: 3,
  baseDelayMs: 1000, // 1s, 2s, 4s
};

/** localStorage keys used by this feature — namespaced so they never collide with anything else on the site. */
export const STORAGE_KEYS = {
  operatorToken: 'hit_vol_2k26.operatorToken',
  // Per-run, not-yet-sent penalty taps (utils/pendingPenalties.js) — keyed by runId inside this one
  // key, so a Control Center page refresh doesn't lose taps logged before End Run was pressed.
  pendingPenalties: 'hit_vol_2k26.pendingPenalties',
};
