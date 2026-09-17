// tests/referenceServer.mjs
// DEV/TEST ONLY — never shipped. A Node-runnable reference implementation of the Apps Script
// action handlers (Code.gs), operating on an in-memory store instead of a real Spreadsheet, with
// a real async mutex standing in for Apps Script's LockService.getScriptLock().
//
// Purpose: Code.gs itself can only execute inside Apps Script's own runtime (SpreadsheetApp,
// LockService, ContentService don't exist anywhere else), so it can't be unit-tested directly in
// this environment. This file implements the exact same control flow — same order of checks, same
// idempotency approach, same locking discipline — so the *algorithm* can be raced with real
// concurrent async calls and proven correct before trusting the Apps Script port of it.
// Code.gs should be read side-by-side with this file: the step order must match line for line.

import {
  isVolunteerEligible,
  computeAllowedMinutes,
  computeCooldownEnd,
  normalizeTeamName,
} from '../src/pages/hit_vol_2k26/services/statusLogic.js';

export const CONFIG = {
  baseMinutes: 30,
  penaltyMinutes: 5,
  maxPenalties: 2,
  cooldownMinutes: 15,
};

/** FIFO async mutex — stands in for LockService.getScriptLock(): guarantees mutual exclusion
 *  across concurrent calls, the one property the concurrency strategy actually depends on. */
export class AsyncLock {
  constructor() {
    this._chain = Promise.resolve();
  }
  run(fn) {
    const result = this._chain.then(() => fn());
    // Swallow rejections in the chain itself so one failed op doesn't wedge the lock forever;
    // each caller still sees its own rejection via `result`.
    this._chain = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }
}

export function createStore(volunteersSeed) {
  return {
    volunteers: new Map(volunteersSeed.map((v) => [v.volunteerId, { ...v }])),
    runs: new Map(), // runId -> run record
    requestLog: new Map(), // requestId -> the result that was returned for it (idempotency)
  };
}

function findRunByNormalizedTeamName(store, normalized) {
  for (const run of store.runs.values()) {
    if (normalizeTeamName(run.teamName) === normalized) return run;
  }
  return null;
}

function withIdempotency(store, requestId, compute) {
  if (store.requestLog.has(requestId)) return store.requestLog.get(requestId);
  const result = compute();
  store.requestLog.set(requestId, result);
  return result;
}

/**
 * assignTeam — see plan §E commit flow. Step order matches Code.gs's assignTeam_ handler exactly:
 * 1) idempotency check, 2) team-name duplicate check, 3) volunteer eligibility re-check, 4) commit.
 */
export function makeAssignTeam(store, lock, now) {
  return (teamName, volunteerId, requestId) =>
    lock.run(() =>
      withIdempotency(store, requestId, () => {
        const normalized = normalizeTeamName(teamName);
        if (findRunByNormalizedTeamName(store, normalized)) {
          return { ok: false, reason: 'TEAM_ALREADY_PLAYED' };
        }

        const volunteer = store.volunteers.get(volunteerId);
        if (!volunteer || !isVolunteerEligible(volunteer, now())) {
          return { ok: false, reason: 'NO_LONGER_AVAILABLE' };
        }

        const runId = `RUN-${now()}-${Math.random().toString(36).slice(2, 6)}`;
        const run = {
          runId,
          teamName,
          colour: volunteer.colour,
          path: volunteer.path,
          volunteerId,
          volunteerName: volunteer.name,
          assignedAt: now(),
          startedAt: null,
          endedAt: null,
          durationSeconds: null,
          penalties: 0,
          allowedMinutes: computeAllowedMinutes(0, CONFIG.baseMinutes, CONFIG.penaltyMinutes),
          status: 'ASSIGNED',
          cooldownStart: null,
          cooldownEnd: null,
        };
        store.runs.set(runId, run);
        volunteer.activeRunId = runId;
        volunteer.activeRunEndedAt = null;

        return { ok: true, run: { ...run } };
      })
    );
}

export function makeStartRun(store, lock, now) {
  return (volunteerId, requestId) =>
    lock.run(() =>
      withIdempotency(store, requestId, () => {
        const volunteer = store.volunteers.get(volunteerId);
        if (!volunteer || !volunteer.activeRunId) return { ok: false, reason: 'NO_ACTIVE_RUN' };
        const run = store.runs.get(volunteer.activeRunId);
        if (!run) return { ok: false, reason: 'NO_ACTIVE_RUN' };

        if (!run.startedAt) {
          run.startedAt = now();
          run.status = 'IN_PROGRESS';
        }
        // Idempotent no-op if already started — always returns the actual stored value, never
        // whatever the caller thinks "now" is, so a retried START TIMER can't push the anchor later.
        return { ok: true, run: { ...run } };
      })
    );
}

// Mirrors Code.gs's addPenalty_ exactly: penalties are logged (still capped at maxPenalties) but
// never extend allowedMinutes, which is a hard, fixed CONFIG.baseMinutes cap for every run — see
// computeAllowedMinutes. Once the run has been live for baseMinutes, a penalty is blocked outright
// (TIME_LIMIT_REACHED) instead of silently accepted as a no-op.
export function makeAddPenalty(store, lock, now) {
  return (volunteerId, requestId) =>
    lock.run(() =>
      withIdempotency(store, requestId, () => {
        const volunteer = store.volunteers.get(volunteerId);
        if (!volunteer || !volunteer.activeRunId) return { ok: false, reason: 'NO_ACTIVE_RUN' };
        const run = store.runs.get(volunteer.activeRunId);
        if (!run) return { ok: false, reason: 'NO_ACTIVE_RUN' };

        if (run.startedAt) {
          const elapsedMs = now() - run.startedAt;
          if (elapsedMs >= CONFIG.baseMinutes * 60 * 1000) {
            return { ok: false, reason: 'TIME_LIMIT_REACHED', run: { ...run } };
          }
        }

        if (run.penalties >= CONFIG.maxPenalties) {
          return { ok: true, run: { ...run }, atMax: true };
        }
        run.penalties += 1;
        run.allowedMinutes = computeAllowedMinutes(run.penalties, CONFIG.baseMinutes, CONFIG.penaltyMinutes);
        return { ok: true, run: { ...run }, atMax: run.penalties >= CONFIG.maxPenalties, timeAdded: false };
      })
    );
}

export function makeEndRun(store, lock, now) {
  return (volunteerId, requestId) =>
    lock.run(() =>
      withIdempotency(store, requestId, () => {
        const volunteer = store.volunteers.get(volunteerId);
        if (!volunteer || !volunteer.activeRunId) return { ok: false, reason: 'NO_ACTIVE_RUN' };
        const run = store.runs.get(volunteer.activeRunId);
        if (!run) return { ok: false, reason: 'NO_ACTIVE_RUN' };

        if (!run.endedAt) {
          const endedAt = now();
          run.endedAt = endedAt;
          run.durationSeconds = run.startedAt ? Math.floor((endedAt - run.startedAt) / 1000) : null;
          run.status = 'COMPLETED';
          run.cooldownStart = endedAt;
          run.cooldownEnd = computeCooldownEnd(endedAt, CONFIG.cooldownMinutes);

          volunteer.activeRunEndedAt = endedAt;
          volunteer.cooldownEnd = run.cooldownEnd;
          // Deliberately NOT clearing volunteer.activeRunId here. computeStatus() already stops
          // returning PLAYING once activeRunEndedAt is set, regardless of activeRunId — and leaving
          // it pointing at the completed run is what lets a second, genuinely-concurrent END RUN
          // call (a double-tap with its own fresh requestId, not a retry of the same one) still find
          // the run and return the same "already ended" result instead of NO_ACTIVE_RUN. The next
          // assignTeam() overwrites it unconditionally anyway, so nothing is lost by leaving it set.
        }
        return { ok: true, run: { ...run } };
      })
    );
}

export function makeSetManualAvailability(store, lock) {
  return (volunteerId, available, requestId) =>
    lock.run(() =>
      withIdempotency(store, requestId, () => {
        const volunteer = store.volunteers.get(volunteerId);
        if (!volunteer) return { ok: false, reason: 'NOT_FOUND' };
        volunteer.manuallyAvailable = !!available;
        return { ok: true, volunteer: { ...volunteer } };
      })
    );
}
