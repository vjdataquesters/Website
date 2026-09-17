/**
 * HIT Volunteer Control Center — Apps Script Web App
 * ===================================================
 * This is the ONLY server-side code in the system (see the implementation plan §A for why Apps
 * Script is necessary at all). It is deployed as a Web App, bound to one Google Sheet, and is the
 * sole writer of that Sheet — the frontend never touches Sheets directly.
 *
 * The business logic here (status derivation, idempotency, the duplicate-team-name block, the
 * penalty cap, cooldown math) is a direct, line-for-line port of the algorithm validated in
 * tests/referenceServer.mjs and tests/concurrency.test.mjs in the repo — read those alongside this
 * file if you're auditing the logic; the control flow in each action handler is meant to match.
 *
 * ---------------------------------------------------------------------------------------------
 * SETUP (do this once):
 *
 * 1. Create a new Google Sheet. Add exactly two tabs, named exactly:
 *      "Volunteers" and "Runs"
 *
 * 2. Volunteers tab — row 1 must contain exactly these headers, in any order you like, but
 *    spelled exactly as below (case-sensitive):
 *      volunteerId | volunteerNumber | name | colour | path | manuallyAvailable | activeRunId | cooldownEnd
 *    Seed it with the 45 rows from src/data/hit_vol_2k26/volunteers.js (VOLUNTEERS_SEED) —
 *    set manuallyAvailable to TRUE, leave activeRunId and cooldownEnd blank for all 45 rows.
 *
 * 3. Runs tab — row 1 headers, exactly:
 *      runId | teamName | colour | path | volunteerId | volunteerName | assignedAt | startedAt |
 *      endedAt | durationSeconds | penalties | allowedMinutes | status | cooldownStart | cooldownEnd |
 *      effectiveDurationSeconds
 *    Leave it otherwise empty — rows are appended by this script only.
 *
 *    ******************************************************************************************
 *    UPGRADING AN EXISTING DEPLOYMENT (already had a Runs tab before this version): you MUST add
 *    "effectiveDurationSeconds" as a new column header to your live Runs tab's row 1 BEFORE
 *    deploying this version of the script. readAllRows_ throws a hard error if ANY expected header
 *    is missing from the actual sheet — with this column absent, EVERY action (getVolunteers,
 *    getRun, assignTeam, startRun, addPenalty, endRun) would start failing immediately. Add the
 *    header cell first, then deploy.
 *    ******************************************************************************************
 *
 * 4. Extensions > Apps Script on that Sheet. Delete the default Code.gs content, paste this
 *    whole file in its place.
 *
 * 5. Project Settings (gear icon) > Script Properties > Add script property:
 *      OPERATOR_TOKEN = <a passphrase you choose, e.g. a random 12+ character string>
 *    This is the only credential in the whole system — it gates Control Center write actions
 *    (assignTeam, setManualAvailability). Keep it out of any public repo; it belongs only in the
 *    frontend's local .env and in this Script Property.
 *
 * 6. Deploy > New deployment > select type "Web app" >
 *      Execute as: Me (your account)
 *      Who has access: Anyone with the link
 *    Deploy, then copy the Web app URL — that is VITE_HIT_VOL_2K26_API_URL for the frontend.
 *
 * 7. Every time you edit this file, you must create a NEW deployment version (or use "Manage
 *    deployments" > edit > new version) for the change to actually take effect at the existing URL.
 *
 * IMPORTANT: all timestamp columns (assignedAt, startedAt, endedAt, cooldownStart, cooldownEnd)
 * are stored as plain epoch-millisecond NUMBERS, not Sheets' native Date type — this sidesteps
 * timezone/formatting ambiguity entirely. Do not reformat those columns as dates in the Sheet UI;
 * if a cell shows a huge integer like 1758000000000, that's correct.
 *
 * RESULTS TAB (human-readable, for spectators/scoring — NOT read by this script or the frontend):
 * every completed run also gets a row appended to a tab named exactly "Results", written directly
 * by endRun_ (see appendResultsRow_ below) — NOT a Sheets formula. This sidesteps the fragility of
 * QUERY/ARRAYFORMULA over the epoch-millisecond Runs columns (wrong column letters after any edit,
 * date-serial conversion mistakes, a filter clause that silently stops matching) by just writing
 * the finished, human-readable values once, the same moment the Runs row is finalized. You do NOT
 * need to create this tab yourself — getOrCreateResultsSheet_ creates it (and (re)writes its header
 * row if missing/wrong) automatically the first time a run ends after this version is deployed. If
 * you already have a "Results" tab, its existing rows are left alone; new ones just get appended
 * below them. If you'd rather use a different tab name, change RESULTS_SHEET_NAME below.
 * ---------------------------------------------------------------------------------------------
 */

// ------------------------------- Config (mirrors src/data/hit_vol_2k26/config.js) -------------
const CONFIG = {
  BASE_MINUTES: 30,
  PENALTY_MINUTES: 5,
  MAX_PENALTIES: 2,
  COOLDOWN_MINUTES: 15,
  // Minutes added to a run's stored, "effective" (scored/reported) duration per logged penalty —
  // computed and written ONCE, by endRun_, when the run ends. Never touches BASE_MINUTES/the live
  // timer; only affects effectiveDurationSeconds (see the "Team Results" Sheet tab).
  PENALTY_EFFECTIVE_MINUTES: 3,
};

const SHEET_NAMES = { VOLUNTEERS: 'Volunteers', RUNS: 'Runs' };

// Human-readable Results tab — see the setup comment's "RESULTS TAB" section above. Auto-created/
// auto-headered by getOrCreateResultsSheet_, never read by this script (write-only, one direction).
const RESULTS_SHEET_NAME = 'Results';
const RESULTS_HEADERS = [
  'Team', 'Colour', 'Path', 'Volunteer', 'Start time', 'End time', 'Duration', 'Penalties',
  'Effective time (+3m/penalty)',
];

const VOLUNTEER_HEADERS = [
  'volunteerId', 'volunteerNumber', 'name', 'colour', 'path',
  'manuallyAvailable', 'activeRunId', 'cooldownEnd',
];

const RUN_HEADERS = [
  'runId', 'teamName', 'colour', 'path', 'volunteerId', 'volunteerName',
  'assignedAt', 'startedAt', 'endedAt', 'durationSeconds', 'penalties',
  'allowedMinutes', 'status', 'cooldownStart', 'cooldownEnd', 'effectiveDurationSeconds',
];

const IDEMPOTENCY_TTL_SECONDS = 1800; // 30 minutes — comfortably longer than any retry window

// ------------------------------- statusLogic.js, mirrored (see that file for the annotated original) --
function computeStatus_(volunteer, nowMs) {
  if (volunteer.activeRunId && !volunteer.activeRunEndedAt) return 'PLAYING';
  if (volunteer.manuallyAvailable === false) return 'UNAVAILABLE';
  if (volunteer.cooldownEnd && nowMs < Number(volunteer.cooldownEnd)) return 'RESTING';
  return 'AVAILABLE';
}

function isVolunteerEligible_(volunteer, nowMs) {
  return computeStatus_(volunteer, nowMs) === 'AVAILABLE';
}

// Allowed time is a HARD, fixed cap — penalties are logged (see addPenalty_) but never extend it.
// The signature keeps `penalties`/`penaltyMinutes` so every call site is unchanged; both are now
// ignored. Mirrors src/pages/hit_vol_2k26/services/statusLogic.js's computeAllowedMinutes exactly.
function computeAllowedMinutes_(penalties, baseMinutes, penaltyMinutes) {
  return baseMinutes;
}

function computeCooldownEnd_(endedAt, cooldownMinutes) {
  return Number(endedAt) + cooldownMinutes * 60 * 1000;
}

function normalizeTeamName_(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseBool_(v) {
  return v === true || v === 'TRUE' || v === 'true' || v === 1;
}

// ------------------------------- resultsLogic.js, mirrored (see that file for the annotated original) --
// Pure, no Sheets API calls — see src/pages/hit_vol_2k26/services/resultsLogic.js for the identical,
// unit-tested original this is copy-pasted from.
function formatMinutesSeconds_(totalSeconds) {
  const n = Number(totalSeconds);
  if (totalSeconds === '' || totalSeconds === null || totalSeconds === undefined || !isFinite(n)) return '';
  const total = Math.max(0, Math.round(n));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function buildResultsRow_(run) {
  return [
    run.teamName,
    run.colour,
    run.path,
    run.volunteerName,
    run.startedAt ? new Date(Number(run.startedAt)) : '',
    run.endedAt ? new Date(Number(run.endedAt)) : '',
    formatMinutesSeconds_(run.durationSeconds),
    run.penalties,
    formatMinutesSeconds_(run.effectiveDurationSeconds),
  ];
}

// ------------------------------- Sheet access helpers -------------------------------------------
function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Missing sheet tab: ' + name + ' — see the setup comment at the top of this file.');
  return sheet;
}

/** Reads every data row of a sheet into an array of plain objects keyed by HEADERS, using the
 *  fixed header list (not whatever's actually in row 1) so column order in the sheet never matters
 *  as long as every header name from HEADERS exists somewhere in row 1. */
function readAllRows_(sheetName, expectedHeaders) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 1) return [];
  const actualHeaders = values[0];
  const colIndex = {};
  expectedHeaders.forEach((h) => {
    const idx = actualHeaders.indexOf(h);
    if (idx === -1) throw new Error('Sheet "' + sheetName + '" is missing expected header "' + h + '"');
    colIndex[h] = idx;
  });
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    if (values[r].every((cell) => cell === '')) continue; // skip fully-blank rows
    const obj = { __rowNumber: r + 1 };
    expectedHeaders.forEach((h) => { obj[h] = values[r][colIndex[h]]; });
    rows.push(obj);
  }
  return rows;
}

function findRowIndexMap_(sheetName, expectedHeaders) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const actualHeaders = values.length ? values[0] : [];
  const colIndex = {};
  expectedHeaders.forEach((h) => { colIndex[h] = actualHeaders.indexOf(h); });
  return { sheet, colIndex };
}

/** Writes only the given fields of one existing row (1-based sheet row number), leaving other
 *  columns untouched. */
function writeFields_(sheetName, expectedHeaders, rowNumber, patch) {
  const { sheet, colIndex } = findRowIndexMap_(sheetName, expectedHeaders);
  Object.keys(patch).forEach((key) => {
    const idx = colIndex[key];
    if (idx === undefined || idx === -1) return;
    sheet.getRange(rowNumber, idx + 1).setValue(patch[key]);
  });
}

function appendRowObject_(sheetName, expectedHeaders, obj) {
  const sheet = getSheet_(sheetName);
  const actualHeaders = sheet.getDataRange().getValues()[0];
  const values = actualHeaders.map((h) => (obj[h] !== undefined ? obj[h] : ''));
  sheet.appendRow(values);
}

/** Unlike getSheet_ (throws if missing — used for the two data-critical tabs), this CREATES the
 *  Results tab on first use if it doesn't exist yet, and (re)writes its header row only if what's
 *  there doesn't already match RESULTS_HEADERS exactly — so any rows a human has already added below
 *  it are left untouched. See appendResultsRow_ / the setup comment's "RESULTS TAB" section. */
function getOrCreateResultsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(RESULTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(RESULTS_SHEET_NAME);
  const firstRow = sheet.getRange(1, 1, 1, RESULTS_HEADERS.length).getValues()[0];
  const headersMatch = RESULTS_HEADERS.every((h, i) => firstRow[i] === h);
  if (!headersMatch) sheet.getRange(1, 1, 1, RESULTS_HEADERS.length).setValues([RESULTS_HEADERS]);
  return sheet;
}

/** Appends one human-readable row to the Results tab for a just-completed run. Called once from
 *  endRun_, right after that run's Runs-tab row is finalized — `run` is that same, now-complete,
 *  in-memory record. Never read back by this script; write-only, best-effort (see the try/catch at
 *  its one call site — a Results-tab hiccup must never block End Run itself). */
function appendResultsRow_(run) {
  const sheet = getOrCreateResultsSheet_();
  sheet.appendRow(buildResultsRow_(run));
}

function findVolunteerRow_(volunteerId) {
  const rows = readAllRows_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS);
  return rows.find((r) => String(r.volunteerId) === String(volunteerId)) || null;
}

function findRunRow_(runId) {
  if (!runId) return null;
  const rows = readAllRows_(SHEET_NAMES.RUNS, RUN_HEADERS);
  return rows.find((r) => String(r.runId) === String(runId)) || null;
}

// ------------------------------- Idempotency (CacheService — see file header) -------------------
function getIdempotentResult_(requestId) {
  if (!requestId) return null;
  const cached = CacheService.getScriptCache().get('req_' + requestId);
  return cached ? JSON.parse(cached) : null;
}

function storeIdempotentResult_(requestId, result) {
  if (requestId) {
    CacheService.getScriptCache().put('req_' + requestId, JSON.stringify(result), IDEMPOTENCY_TTL_SECONDS);
  }
  return result;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  const gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, reason: 'SERVER_BUSY', message: 'Could not acquire lock within 10s — retry.' };
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function withOperatorAuth_(payload, fn) {
  const expected = PropertiesService.getScriptProperties().getProperty('OPERATOR_TOKEN');
  if (!expected) {
    return { ok: false, reason: 'SERVER_MISCONFIGURED', message: 'Set the OPERATOR_TOKEN script property (see setup comment) before using this deployment.' };
  }
  if (payload.operatorToken !== expected) {
    return { ok: false, reason: 'UNAUTHORIZED' };
  }
  return fn();
}

// ------------------------------- Web app entry points --------------------------------------------
function doGet(e) { return handleRequest_(e); }
function doPost(e) { return handleRequest_(e); }

function handleRequest_(e) {
  let body = {};
  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }
  } catch (parseErr) {
    return jsonResponse_({ ok: false, reason: 'BAD_REQUEST', message: 'Invalid JSON body.' });
  }

  try {
    const result = routeAction_(body.action, body.payload || {});
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({ ok: false, reason: 'SERVER_ERROR', message: String((err && err.message) || err) });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function routeAction_(action, payload) {
  switch (action) {
    case 'getVolunteers': return getVolunteers_();
    case 'getRun': return getRun_(payload);
    case 'identifyVolunteer': return identifyVolunteer_(payload);
    case 'setManualAvailability': return withOperatorAuth_(payload, function () { return withLock_(function () { return setManualAvailability_(payload); }); });
    case 'assignTeam': return withOperatorAuth_(payload, function () { return withLock_(function () { return assignTeam_(payload); }); });
    case 'startRun': return withLock_(function () { return startRun_(payload); });
    case 'addPenalty': return withLock_(function () { return addPenalty_(payload); });
    case 'endRun': return withLock_(function () { return endRun_(payload); });
    case 'verifyOperatorToken': return verifyOperatorToken_(payload);
    default: return { ok: false, reason: 'UNKNOWN_ACTION', message: 'Unrecognized action: ' + action };
  }
}

// ------------------------------- Reads --------------------------------------------------------
function getVolunteers_() {
  const volunteers = readAllRows_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS);
  const runs = readAllRows_(SHEET_NAMES.RUNS, RUN_HEADERS);
  const runsById = {};
  runs.forEach(function (r) { runsById[r.runId] = r; });

  const now = Date.now();
  const usedTeamNamesSet = {};
  runs.forEach(function (r) { usedTeamNamesSet[normalizeTeamName_(r.teamName)] = true; });

  const out = volunteers.map(function (v) {
    const activeRun = v.activeRunId ? runsById[v.activeRunId] : null;
    const activeRunEndedAt = activeRun ? (activeRun.endedAt || null) : null;
    const statusInput = {
      manuallyAvailable: parseBool_(v.manuallyAvailable),
      activeRunId: v.activeRunId || '',
      activeRunEndedAt: activeRunEndedAt,
      cooldownEnd: v.cooldownEnd || '',
    };
    const status = computeStatus_(statusInput, now);
    const isPlaying = status === 'PLAYING' && activeRun;
    return {
      volunteerId: v.volunteerId,
      volunteerNumber: v.volunteerNumber,
      name: v.name,
      colour: v.colour,
      path: v.path,
      manuallyAvailable: statusInput.manuallyAvailable,
      cooldownEnd: v.cooldownEnd || null,
      status: status,
      currentTeam: isPlaying ? activeRun.teamName : null,
      activeRun: isPlaying ? {
        runId: activeRun.runId,
        teamName: activeRun.teamName,
        startedAt: activeRun.startedAt || null,
        penalties: Number(activeRun.penalties) || 0,
        allowedMinutes: Number(activeRun.allowedMinutes) || CONFIG.BASE_MINUTES,
      } : null,
    };
  });

  return {
    ok: true,
    volunteers: out,
    usedTeamNames: Object.keys(usedTeamNamesSet),
    serverNow: now,
  };
}

function getRun_(payload) {
  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer) return { ok: false, reason: 'NOT_FOUND' };
  const run = findRunRow_(volunteer.activeRunId);
  return { ok: true, run: run ? stripRowMeta_(run) : null, serverNow: Date.now() };
}

function identifyVolunteer_(payload) {
  const volunteers = readAllRows_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS);
  const match = volunteers.find(function (v) { return String(v.volunteerNumber) === String(payload.volunteerNumber); });
  if (!match) return { ok: false, reason: 'NOT_FOUND' };
  return {
    ok: true,
    volunteer: { volunteerId: match.volunteerId, volunteerNumber: match.volunteerNumber, name: match.name, colour: match.colour, path: match.path },
  };
}

// Read-only passcode check for the Control Center's OperatorGate — deliberately outside
// withLock_/withOperatorAuth_ (it doesn't mutate anything, and it IS the auth check, not something
// to gate behind itself) so entering a wrong passcode gives instant feedback instead of waiting for
// the first real assignTeam/setManualAvailability attempt to fail.
function verifyOperatorToken_(payload) {
  const expected = PropertiesService.getScriptProperties().getProperty('OPERATOR_TOKEN');
  if (!expected) {
    return { ok: false, reason: 'SERVER_MISCONFIGURED', message: 'Set the OPERATOR_TOKEN script property (see setup comment) before using this deployment.' };
  }
  if (payload.operatorToken !== expected) {
    return { ok: false, reason: 'UNAUTHORIZED' };
  }
  return { ok: true };
}

function stripRowMeta_(row) {
  const copy = {};
  Object.keys(row).forEach(function (k) { if (k !== '__rowNumber') copy[k] = row[k]; });
  return copy;
}

// ------------------------------- Writes (each already wrapped in withLock_ by routeAction_) -----

// Order of checks below matches tests/referenceServer.mjs's makeAssignTeam exactly: idempotency,
// then team-name duplicate, then volunteer eligibility, then commit.
function assignTeam_(payload) {
  const requestId = payload.requestId;
  const cached = getIdempotentResult_(requestId);
  if (cached) return cached;

  const normalized = normalizeTeamName_(payload.teamName);
  const runs = readAllRows_(SHEET_NAMES.RUNS, RUN_HEADERS);
  const duplicate = runs.some(function (r) { return normalizeTeamName_(r.teamName) === normalized; });
  if (duplicate) return storeIdempotentResult_(requestId, { ok: false, reason: 'TEAM_ALREADY_PLAYED' });

  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer) return storeIdempotentResult_(requestId, { ok: false, reason: 'NOT_FOUND' });

  const now = Date.now();
  const activeRun = findRunRow_(volunteer.activeRunId);
  const statusInput = {
    manuallyAvailable: parseBool_(volunteer.manuallyAvailable),
    activeRunId: volunteer.activeRunId || '',
    activeRunEndedAt: activeRun ? (activeRun.endedAt || null) : null,
    cooldownEnd: volunteer.cooldownEnd || '',
  };
  if (!isVolunteerEligible_(statusInput, now)) {
    return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_LONGER_AVAILABLE' });
  }

  const runId = 'RUN-' + now + '-' + Math.random().toString(36).slice(2, 6);
  const runRecord = {
    runId: runId,
    teamName: payload.teamName,
    colour: volunteer.colour,
    path: volunteer.path,
    volunteerId: volunteer.volunteerId,
    volunteerName: volunteer.name,
    assignedAt: now,
    startedAt: '',
    endedAt: '',
    durationSeconds: '',
    penalties: 0,
    allowedMinutes: computeAllowedMinutes_(0, CONFIG.BASE_MINUTES, CONFIG.PENALTY_MINUTES),
    status: 'ASSIGNED',
    cooldownStart: '',
    cooldownEnd: '',
    effectiveDurationSeconds: '',
  };
  appendRowObject_(SHEET_NAMES.RUNS, RUN_HEADERS, runRecord);
  writeFields_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS, volunteer.__rowNumber, { activeRunId: runId });

  return storeIdempotentResult_(requestId, { ok: true, run: runRecord });
}

function startRun_(payload) {
  const requestId = payload.requestId;
  const cached = getIdempotentResult_(requestId);
  if (cached) return cached;

  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer || !volunteer.activeRunId) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });
  const run = findRunRow_(volunteer.activeRunId);
  if (!run) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });

  if (!run.startedAt) {
    const now = Date.now();
    run.startedAt = now;
    run.status = 'IN_PROGRESS';
    writeFields_(SHEET_NAMES.RUNS, RUN_HEADERS, run.__rowNumber, { startedAt: now, status: 'IN_PROGRESS' });
  }
  return storeIdempotentResult_(requestId, { ok: true, run: stripRowMeta_(run) });
}

// Penalties are logged for the event's record (still capped at CONFIG.MAX_PENALTIES) but never
// extend allowedMinutes, which is now a hard, fixed CONFIG.BASE_MINUTES cap for every run — see
// computeAllowedMinutes_ above. Once the run has been live for CONFIG.BASE_MINUTES, a penalty is
// blocked outright (TIME_LIMIT_REACHED) rather than silently accepted as a no-op, so the volunteer
// gets a clear message instead of a button that quietly does nothing. Mirrors
// tests/referenceServer.mjs's makeAddPenalty exactly — read that alongside this if auditing.
function addPenalty_(payload) {
  const requestId = payload.requestId;
  const cached = getIdempotentResult_(requestId);
  if (cached) return cached;

  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer || !volunteer.activeRunId) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });
  const run = findRunRow_(volunteer.activeRunId);
  if (!run) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });

  if (run.startedAt) {
    const elapsedMs = Date.now() - Number(run.startedAt);
    if (elapsedMs >= CONFIG.BASE_MINUTES * 60 * 1000) {
      return storeIdempotentResult_(requestId, {
        ok: false,
        reason: 'TIME_LIMIT_REACHED',
        run: stripRowMeta_(run),
        message: CONFIG.BASE_MINUTES + ' minute limit reached — no further penalties can be logged.',
      });
    }
  }

  const currentPenalties = Number(run.penalties) || 0;
  if (currentPenalties >= CONFIG.MAX_PENALTIES) {
    return storeIdempotentResult_(requestId, { ok: true, run: stripRowMeta_(run), atMax: true });
  }
  const newPenalties = currentPenalties + 1;
  const newAllowed = computeAllowedMinutes_(newPenalties, CONFIG.BASE_MINUTES, CONFIG.PENALTY_MINUTES);
  writeFields_(SHEET_NAMES.RUNS, RUN_HEADERS, run.__rowNumber, { penalties: newPenalties, allowedMinutes: newAllowed });
  run.penalties = newPenalties;
  run.allowedMinutes = newAllowed;

  return storeIdempotentResult_(requestId, {
    ok: true,
    run: stripRowMeta_(run),
    atMax: newPenalties >= CONFIG.MAX_PENALTIES,
    timeAdded: false,
  });
}

// See the file header + tests/referenceServer.mjs's makeEndRun comment: activeRunId on the
// Volunteers row is deliberately NOT cleared here. computeStatus_ already stops returning
// PLAYING once the referenced run has endedAt set, and leaving the pointer in place is what lets
// a second, genuinely-concurrent END RUN call (a double-tap with its own fresh requestId) still
// find the run and return the same "already ended" result instead of NO_ACTIVE_RUN.
//
// payload.penalties: the Control Center's locally-tallied, not-yet-sent penalty count (see
// PenaltyControls.jsx / VolunteerCard.jsx — penalty logging is an instant local counter, sent ONCE
// here rather than one server call per tap). Re-clamped to [0, MAX_PENALTIES] here as a safety net
// against a stale/tampered client value, then used to compute and STORE effectiveDurationSeconds —
// the scored/reported duration (see the "Team Results" Sheet tab) — once, at this moment. Neither
// this nor `penalties` itself is ever recomputed later; they're written once and read thereafter.
function endRun_(payload) {
  const requestId = payload.requestId;
  const cached = getIdempotentResult_(requestId);
  if (cached) return cached;

  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer || !volunteer.activeRunId) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });
  const run = findRunRow_(volunteer.activeRunId);
  if (!run) return storeIdempotentResult_(requestId, { ok: false, reason: 'NO_ACTIVE_RUN' });

  if (!run.endedAt) {
    const now = Date.now();
    // The 30-minute allowed time is a hard cap end-to-end, not just on the live display: if the
    // operator doesn't tap End Run until after that cap has already passed (busy running the event,
    // got to it late — whatever), the RECORDED finish time and duration are capped at exactly
    // CONFIG.BASE_MINUTES from the start, never the real, late tap time. This still only fires on
    // the operator's own tap — nothing here auto-ends a run — it just makes sure no completed run's
    // duration is ever more than the cap, matching what TimerDisplay.jsx already shows visually.
    const capMs = run.startedAt ? Number(run.startedAt) + CONFIG.BASE_MINUTES * 60 * 1000 : now;
    const effectiveEndedAt = run.startedAt && now > capMs ? capMs : now;
    const durationSeconds = run.startedAt ? Math.floor((effectiveEndedAt - Number(run.startedAt)) / 1000) : '';
    const cooldownEnd = computeCooldownEnd_(effectiveEndedAt, CONFIG.COOLDOWN_MINUTES);

    const penalties = Math.max(0, Math.min(CONFIG.MAX_PENALTIES, Math.floor(Number(payload.penalties) || 0)));
    const effectiveDurationSeconds = durationSeconds === '' ? '' : durationSeconds + penalties * CONFIG.PENALTY_EFFECTIVE_MINUTES * 60;

    writeFields_(SHEET_NAMES.RUNS, RUN_HEADERS, run.__rowNumber, {
      endedAt: effectiveEndedAt, durationSeconds: durationSeconds, status: 'COMPLETED',
      cooldownStart: effectiveEndedAt, cooldownEnd: cooldownEnd,
      penalties: penalties, effectiveDurationSeconds: effectiveDurationSeconds,
    });
    writeFields_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS, volunteer.__rowNumber, { cooldownEnd: cooldownEnd });

    run.endedAt = effectiveEndedAt; run.durationSeconds = durationSeconds; run.status = 'COMPLETED';
    run.cooldownStart = effectiveEndedAt; run.cooldownEnd = cooldownEnd;
    run.penalties = penalties; run.effectiveDurationSeconds = effectiveDurationSeconds;

    try {
      appendResultsRow_(run);
    } catch (err) {
      // Best-effort only — the Runs row above (the source of truth) is already safely written by
      // this point; a Results-tab hiccup (e.g. the sheet got deleted, a transient Sheets API error)
      // must never fail End Run itself. Visible in Apps Script's Executions log if it ever happens.
      console.error('appendResultsRow_ failed: ' + (err && err.message));
    }
  }
  return storeIdempotentResult_(requestId, { ok: true, run: stripRowMeta_(run) });
}

function setManualAvailability_(payload) {
  const requestId = payload.requestId;
  const cached = getIdempotentResult_(requestId);
  if (cached) return cached;

  const volunteer = findVolunteerRow_(payload.volunteerId);
  if (!volunteer) return storeIdempotentResult_(requestId, { ok: false, reason: 'NOT_FOUND' });

  const value = !!payload.available;
  writeFields_(SHEET_NAMES.VOLUNTEERS, VOLUNTEER_HEADERS, volunteer.__rowNumber, { manuallyAvailable: value });

  return storeIdempotentResult_(requestId, { ok: true, volunteerId: volunteer.volunteerId, manuallyAvailable: value });
}
