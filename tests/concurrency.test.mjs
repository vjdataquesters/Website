// tests/concurrency.test.mjs
// Races real concurrent async calls against the reference action handlers to prove the
// concurrency safeguards from plan §I actually hold, before trusting the Apps Script port.
// Run with: node --test tests/concurrency.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { VOLUNTEERS_SEED } from '../src/data/hit_vol_2k26/volunteers.js';
import {
  AsyncLock,
  createStore,
  makeAssignTeam,
  makeStartRun,
  makeAddPenalty,
  makeEndRun,
  makeSetManualAvailability,
  CONFIG,
} from './referenceServer.mjs';
import { computeStatus, remainingCooldownMs } from '../src/pages/hit_vol_2k26/services/statusLogic.js';

function freshWorld() {
  const store = createStore(VOLUNTEERS_SEED);
  const lock = new AsyncLock();
  let clock = 1_700_000_000_000;
  const now = () => clock;
  const advance = (ms) => {
    clock += ms;
  };
  return {
    store,
    lock,
    now,
    advance,
    assignTeam: makeAssignTeam(store, lock, now),
    startRun: makeStartRun(store, lock, now),
    addPenalty: makeAddPenalty(store, lock, now),
    endRun: makeEndRun(store, lock, now),
    setManualAvailability: makeSetManualAvailability(store, lock),
  };
}

describe('concurrent assignment races', () => {
  test('two operators assign the SAME volunteer at once — exactly one wins', async () => {
    const w = freshWorld();
    const volunteerId = 'RED-1-01';

    const [a, b] = await Promise.all([
      w.assignTeam('Team Alpha', volunteerId, 'req-a'),
      w.assignTeam('Team Beta', volunteerId, 'req-b'),
    ]);

    const outcomes = [a, b];
    const wins = outcomes.filter((r) => r.ok);
    const losses = outcomes.filter((r) => !r.ok);
    assert.equal(wins.length, 1, 'exactly one assignment should succeed');
    assert.equal(losses.length, 1);
    assert.equal(losses[0].reason, 'NO_LONGER_AVAILABLE');

    // The volunteer's own record agrees with whichever one won.
    const volunteer = w.store.volunteers.get(volunteerId);
    assert.equal(volunteer.activeRunId, wins[0].run.runId);

    // Only one Runs row was actually created.
    assert.equal(w.store.runs.size, 1);
  });

  test('50 concurrent operators all try to grab the same volunteer — still exactly one wins, no crash', async () => {
    const w = freshWorld();
    const volunteerId = 'BLUE-2-02';
    const attempts = Array.from({ length: 50 }, (_, i) =>
      w.assignTeam(`Team ${i}`, volunteerId, `req-${i}`)
    );
    const results = await Promise.all(attempts);
    const wins = results.filter((r) => r.ok);
    assert.equal(wins.length, 1);
    assert.equal(w.store.runs.size, 1);
  });

  test('two operators submit the SAME team name for two different volunteers at once — one wins', async () => {
    const w = freshWorld();
    const [a, b] = await Promise.all([
      w.assignTeam('Team Gamma', 'GREEN-1-01', 'req-a'),
      w.assignTeam('Team Gamma', 'GREEN-1-02', 'req-b'),
    ]);
    const wins = [a, b].filter((r) => r.ok);
    const losses = [a, b].filter((r) => !r.ok);
    assert.equal(wins.length, 1);
    assert.equal(losses[0].reason, 'TEAM_ALREADY_PLAYED');
  });

  test('duplicate team name is blocked even with different capitalization/spacing', async () => {
    const w = freshWorld();
    const first = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-1');
    assert.equal(first.ok, true);
    const second = await w.assignTeam('  team   ALPHA ', 'RED-1-02', 'req-2');
    assert.equal(second.ok, false);
    assert.equal(second.reason, 'TEAM_ALREADY_PLAYED');
  });

  test('a genuinely new team name for an already-taken volunteer fails on availability, not team name', async () => {
    const w = freshWorld();
    await w.assignTeam('Team Alpha', 'RED-1-01', 'req-1');
    const second = await w.assignTeam('Team Zeta', 'RED-1-01', 'req-2');
    assert.equal(second.ok, false);
    assert.equal(second.reason, 'NO_LONGER_AVAILABLE');
  });

  test('other volunteers in the same colour+path remain assignable after one is taken', async () => {
    const w = freshWorld();
    const r1 = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-1');
    const r2 = await w.assignTeam('Team Beta', 'RED-1-02', 'req-2');
    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    assert.notEqual(r1.run.volunteerId, r2.run.volunteerId);
  });
});

describe('idempotency — retried requests never double-write', () => {
  test('assignTeam retried with the SAME requestId returns the identical result, creates one run', async () => {
    const w = freshWorld();
    const first = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-retry');
    const retried = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-retry');
    assert.deepEqual(first, retried);
    assert.equal(w.store.runs.size, 1);
  });

  test('startRun double-tapped (two different requestIds) does not push the timer start later', async () => {
    const w = freshWorld();
    const assigned = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-a');
    const volunteerId = assigned.run.volunteerId;

    const first = await w.startRun(volunteerId, 'req-start-1');
    w.advance(5000); // 5s pass — a slow network makes the double-tap retry land later
    const second = await w.startRun(volunteerId, 'req-start-2');

    assert.equal(first.run.startedAt, second.run.startedAt, 'startedAt must not move on a repeat call');
  });

  test('endRun called concurrently twice only closes the run once', async () => {
    const w = freshWorld();
    const assigned = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-a');
    const volunteerId = assigned.run.volunteerId;
    await w.startRun(volunteerId, 'req-start');
    w.advance(10 * 60_000);

    const [a, b] = await Promise.all([
      w.endRun(volunteerId, 'req-end-1'),
      w.endRun(volunteerId, 'req-end-2'),
    ]);
    assert.equal(a.run.endedAt, b.run.endedAt);

    const run = [...w.store.runs.values()][0];
    assert.equal(run.status, 'COMPLETED');
  });
});

describe('penalties cap under concurrent taps', () => {
  test('5 simultaneous penalty taps only ever record 2, and never extend the allowed time', async () => {
    const w = freshWorld();
    const assigned = await w.assignTeam('Team Alpha', 'RED-1-01', 'req-a');
    const volunteerId = assigned.run.volunteerId;
    await w.startRun(volunteerId, 'req-start');

    const attempts = Array.from({ length: 5 }, (_, i) => w.addPenalty(volunteerId, `req-pen-${i}`));
    await Promise.all(attempts);

    const run = [...w.store.runs.values()][0];
    assert.equal(run.penalties, CONFIG.maxPenalties);
    assert.equal(run.allowedMinutes, CONFIG.baseMinutes, 'penalties are logged but never extend the hard 30-minute cap');
  });

  test('a penalty is blocked once baseMinutes have elapsed, even under the penalty cap', async () => {
    const w = freshWorld();
    const assigned = await w.assignTeam('Team Zulu', 'RED-3-02', 'req-a');
    const volunteerId = assigned.run.volunteerId;
    await w.startRun(volunteerId, 'req-start');

    w.advance(CONFIG.baseMinutes * 60_000); // exactly 30 minutes elapsed
    const blocked = await w.addPenalty(volunteerId, 'req-pen-late');
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 'TIME_LIMIT_REACHED');

    const run = [...w.store.runs.values()][0];
    assert.equal(run.penalties, 0, 'the blocked attempt must not have been recorded');
  });

  test('a penalty logged just before the cutoff still succeeds', async () => {
    const w = freshWorld();
    const assigned = await w.assignTeam('Team Yankee', 'GREEN-2-02', 'req-a');
    const volunteerId = assigned.run.volunteerId;
    await w.startRun(volunteerId, 'req-start');

    w.advance(CONFIG.baseMinutes * 60_000 - 1000); // 29:59
    const result = await w.addPenalty(volunteerId, 'req-pen-ok');
    assert.equal(result.ok, true);
    assert.equal(result.run.penalties, 1);
    assert.equal(result.run.allowedMinutes, CONFIG.baseMinutes);
  });
});

describe('full lifecycle + cooldown + manual-unavailable interaction', () => {
  test('assign -> start -> 2 penalties -> end -> RESTING -> AVAILABLE after 15 minutes', async () => {
    const w = freshWorld();
    const volunteerId = 'VIOLET-3-03';

    const assigned = await w.assignTeam('Team Omega', volunteerId, 'req-assign');
    assert.equal(assigned.ok, true);
    assert.equal(computeStatus(w.store.volunteers.get(volunteerId), w.now()), 'PLAYING');

    await w.startRun(volunteerId, 'req-start');
    await w.addPenalty(volunteerId, 'req-pen-1');
    await w.addPenalty(volunteerId, 'req-pen-2');
    const blocked = await w.addPenalty(volunteerId, 'req-pen-3');
    assert.equal(blocked.atMax, true);

    // The run genuinely runs long — past the fixed 30-min cap. That's fine: only the volunteer's
    // own END RUN button closes a run, regardless of elapsed time; the 30-min cap only stops the
    // live timer display from climbing further and blocks any NEW penalty past that point (see the
    // 'penalties cap under concurrent taps' tests above) — it never force-ends anything.
    w.advance(37 * 60_000); // run takes 37 minutes
    const ended = await w.endRun(volunteerId, 'req-end');
    assert.equal(ended.ok, true);
    assert.equal(ended.run.penalties, 2);
    assert.equal(ended.run.allowedMinutes, 30, 'penalties never extend the hard 30-minute cap');
    assert.equal(ended.run.durationSeconds, 37 * 60, 'the true recorded duration is never capped, only the live display is');

    const volunteerAfterEnd = w.store.volunteers.get(volunteerId);
    assert.equal(computeStatus(volunteerAfterEnd, w.now()), 'RESTING');
    assert.equal(remainingCooldownMs(volunteerAfterEnd.cooldownEnd, w.now()), 15 * 60_000);

    w.advance(14 * 60_000 + 59_000); // 14:59 into the 15-minute cooldown
    assert.equal(computeStatus(volunteerAfterEnd, w.now()), 'RESTING');

    w.advance(2000); // now past 15:00
    assert.equal(computeStatus(volunteerAfterEnd, w.now()), 'AVAILABLE');
  });

  test('marked manually unavailable mid-run: run is unaffected, but stays UNAVAILABLE after cooldown', async () => {
    const w = freshWorld();
    const volunteerId = 'ORANGE-2-01';

    const assigned = await w.assignTeam('Team Delta', volunteerId, 'req-assign');
    await w.startRun(volunteerId, 'req-start');

    // Operator disables them WHILE they're out with a team.
    await w.setManualAvailability(volunteerId, false, 'req-unavail');
    assert.equal(
      computeStatus(w.store.volunteers.get(volunteerId), w.now()),
      'PLAYING',
      'disabling mid-run must not interrupt the run'
    );

    w.advance(20 * 60_000);
    await w.endRun(volunteerId, 'req-end');

    const volunteer = w.store.volunteers.get(volunteerId);
    assert.equal(
      computeStatus(volunteer, w.now()),
      'UNAVAILABLE',
      'manual flag beats an active cooldown window entirely'
    );

    w.advance(20 * 60_000); // long past the 15-minute cooldown
    assert.equal(
      computeStatus(volunteer, w.now()),
      'UNAVAILABLE',
      'cooldown elapsing must NOT auto-restore a manually-disabled volunteer'
    );

    await w.setManualAvailability(volunteerId, true, 'req-reenable');
    assert.equal(computeStatus(volunteer, w.now()), 'AVAILABLE', 'explicit re-enable restores them');
  });

  test('a team that already completed a run cannot be assigned again under a new attempt', async () => {
    const w = freshWorld();
    await w.assignTeam('Team Epsilon', 'RED-2-01', 'req-1');
    await w.startRun('RED-2-01', 'req-2');
    await w.endRun('RED-2-01', 'req-3');

    const secondAttempt = await w.assignTeam('Team Epsilon', 'RED-3-01', 'req-4');
    assert.equal(secondAttempt.ok, false);
    assert.equal(secondAttempt.reason, 'TEAM_ALREADY_PLAYED');
  });
});
