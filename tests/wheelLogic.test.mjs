// tests/wheelLogic.test.mjs
// Run with: node --test tests/wheelLogic.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEligibleVolunteers,
  isTeamNameTaken,
  pickRandomVolunteer,
  computePathLastActivity,
  computePathWeight,
  pickWeightedVolunteer,
  canSpin,
} from '../src/pages/hit_vol_2k26/services/wheelLogic.js';
import { COOLDOWN_MINUTES, PATH_RECENCY_WINDOW_MS, MIN_PATH_WEIGHT } from '../src/data/hit_vol_2k26/config.js';

const NOW = 1_000_000_000_000;

function row(overrides = {}) {
  return {
    volunteerId: 'RED-1-01',
    volunteerNumber: 1,
    name: 'Red Path 1 - Volunteer A',
    colour: 'red',
    path: 1,
    manuallyAvailable: true,
    cooldownEnd: null,
    activeRun: null,
    ...overrides,
  };
}

describe('getEligibleVolunteers', () => {
  test('only volunteers currently AVAILABLE (live-derived) are eligible', () => {
    const volunteers = [
      row({ volunteerId: 'A' }), // AVAILABLE
      row({ volunteerId: 'B', activeRun: { runId: 'R' } }), // PLAYING
      row({ volunteerId: 'C', manuallyAvailable: false }), // UNAVAILABLE
      row({ volunteerId: 'D', cooldownEnd: NOW + 60_000 }), // RESTING
      row({ volunteerId: 'E' }), // AVAILABLE
    ];
    const eligible = getEligibleVolunteers(volunteers, NOW).map((v) => v.volunteerId);
    assert.deepEqual(eligible, ['A', 'E']);
  });

  test('empty roster yields empty eligible list', () => {
    assert.deepEqual(getEligibleVolunteers([], NOW), []);
  });
});

describe('isTeamNameTaken', () => {
  test('matches regardless of case/spacing, against a Set', () => {
    const used = new Set(['team alpha']);
    assert.equal(isTeamNameTaken('  TEAM   Alpha ', used), true);
    assert.equal(isTeamNameTaken('Team Beta', used), false);
  });

  test('also accepts a plain array', () => {
    assert.equal(isTeamNameTaken('team alpha', ['team alpha']), true);
  });

  test('empty/garbage input is never "taken"', () => {
    assert.equal(isTeamNameTaken('', new Set(['team alpha'])), false);
    assert.equal(isTeamNameTaken('   ', new Set(['team alpha'])), false);
    assert.equal(isTeamNameTaken(undefined, new Set(['team alpha'])), false);
  });
});

describe('pickRandomVolunteer', () => {
  test('null on an empty pool', () => {
    assert.equal(pickRandomVolunteer([], () => 0.5), null);
  });

  test('deterministic randomFn picks the expected index', () => {
    const pool = [row({ volunteerId: 'A' }), row({ volunteerId: 'B' }), row({ volunteerId: 'C' })];
    assert.equal(pickRandomVolunteer(pool, () => 0).volunteerId, 'A');
    assert.equal(pickRandomVolunteer(pool, () => 0.34).volunteerId, 'B'); // floor(0.34*3)=1
    assert.equal(pickRandomVolunteer(pool, () => 0.99).volunteerId, 'C');
  });

  test('a randomFn returning exactly 1 (should not happen, but be defensive) still returns the last item, not undefined', () => {
    const pool = [row({ volunteerId: 'A' }), row({ volunteerId: 'B' })];
    assert.equal(pickRandomVolunteer(pool, () => 1).volunteerId, 'B');
  });

  test('FAIRNESS: over many trials with real randomness, each volunteer is picked roughly equally often', () => {
    const pool = Array.from({ length: 5 }, (_, i) => row({ volunteerId: `V${i}` }));
    const counts = Object.fromEntries(pool.map((v) => [v.volunteerId, 0]));
    const trials = 20000;
    for (let i = 0; i < trials; i++) {
      counts[pickRandomVolunteer(pool).volunteerId] += 1;
    }
    const expected = trials / pool.length; // 4000
    for (const id of Object.keys(counts)) {
      // Generous tolerance (+/-15%) to avoid flakiness while still catching a gross bias, e.g. an
      // accidental per-colour-first weighting that would badly skew a pool this small.
      assert.ok(
        Math.abs(counts[id] - expected) < expected * 0.15,
        `${id} got ${counts[id]} picks, expected close to ${expected}`
      );
    }
  });

  test('FAIRNESS: an uneven pool (skewed colours) still gives every individual volunteer equal odds', () => {
    // 8 "red" volunteers vs 2 "blue" — equal-odds-per-volunteer means red as a GROUP gets picked
    // more often (there are more of them), but each individual volunteer's own odds match everyone
    // else's, red or blue. This is the property "equal odds per volunteer, not per-colour-first"
    // actually guarantees, and the distinction matters enough to assert explicitly.
    const pool = [
      ...Array.from({ length: 8 }, (_, i) => row({ volunteerId: `RED-${i}`, colour: 'red' })),
      ...Array.from({ length: 2 }, (_, i) => row({ volunteerId: `BLUE-${i}`, colour: 'blue' })),
    ];
    const counts = Object.fromEntries(pool.map((v) => [v.volunteerId, 0]));
    const trials = 20000;
    for (let i = 0; i < trials; i++) counts[pickRandomVolunteer(pool).volunteerId] += 1;
    const expectedPerVolunteer = trials / pool.length; // 2000
    for (const id of Object.keys(counts)) {
      assert.ok(
        Math.abs(counts[id] - expectedPerVolunteer) < expectedPerVolunteer * 0.25,
        `${id} got ${counts[id]}, expected close to ${expectedPerVolunteer} (equal odds per volunteer)`
      );
    }
  });
});

describe('computePathLastActivity', () => {
  test('a PLAYING volunteer\'s path gets activeRun.startedAt as its activity time', () => {
    const volunteers = [row({ colour: 'red', path: 1, activeRun: { runId: 'R', startedAt: NOW - 60_000 } })];
    const activity = computePathLastActivity(volunteers);
    assert.equal(activity.get('red::1'), NOW - 60_000);
  });

  test("a RESTING (or previously-resting) volunteer's path activity is derived from cooldownEnd minus COOLDOWN_MINUTES — i.e. the actual moment that run ended", () => {
    const cooldownEnd = NOW + 5 * 60_000; // still resting, clears 5 min from now
    const volunteers = [row({ colour: 'blue', path: 2, cooldownEnd })];
    const activity = computePathLastActivity(volunteers);
    assert.equal(activity.get('blue::2'), cooldownEnd - COOLDOWN_MINUTES * 60_000);
  });

  test('a volunteer with neither an active run nor a cooldownEnd contributes nothing for their path', () => {
    const volunteers = [row({ colour: 'green', path: 3 })];
    const activity = computePathLastActivity(volunteers);
    assert.equal(activity.has('green::3'), false);
  });

  test('within one path group, the MOST RECENT activity among its volunteers wins', () => {
    const volunteers = [
      row({ volunteerId: 'A', colour: 'red', path: 1, cooldownEnd: NOW - 1000 }), // ended long ago (relative)
      row({ volunteerId: 'B', colour: 'red', path: 1, activeRun: { runId: 'R', startedAt: NOW - 10 } }), // just started
    ];
    const activity = computePathLastActivity(volunteers);
    assert.equal(activity.get('red::1'), NOW - 10);
  });

  test('different (colour, path) groups are tracked independently', () => {
    const volunteers = [
      row({ volunteerId: 'A', colour: 'red', path: 1, activeRun: { runId: 'R1', startedAt: NOW - 100 } }),
      row({ volunteerId: 'B', colour: 'red', path: 2, activeRun: { runId: 'R2', startedAt: NOW - 200 } }),
      row({ volunteerId: 'C', colour: 'blue', path: 1, activeRun: { runId: 'R3', startedAt: NOW - 300 } }),
    ];
    const activity = computePathLastActivity(volunteers);
    assert.equal(activity.get('red::1'), NOW - 100);
    assert.equal(activity.get('red::2'), NOW - 200);
    assert.equal(activity.get('blue::1'), NOW - 300);
  });
});

describe('computePathWeight', () => {
  test('a path with no recorded activity (non-finite) is full weight', () => {
    assert.equal(computePathWeight(undefined, NOW), 1);
    assert.equal(computePathWeight(NaN, NOW), 1);
  });

  test('used this instant is exactly the floor weight', () => {
    assert.equal(computePathWeight(NOW, NOW), MIN_PATH_WEIGHT);
  });

  test('used exactly one window ago (or longer) is back to full weight', () => {
    assert.equal(computePathWeight(NOW - PATH_RECENCY_WINDOW_MS, NOW), 1);
    assert.equal(computePathWeight(NOW - PATH_RECENCY_WINDOW_MS - 60_000, NOW), 1);
  });

  test('recovers linearly at the halfway point of the window', () => {
    const halfway = computePathWeight(NOW - PATH_RECENCY_WINDOW_MS / 2, NOW);
    const expected = MIN_PATH_WEIGHT + 0.5 * (1 - MIN_PATH_WEIGHT);
    assert.ok(Math.abs(halfway - expected) < 1e-9, `expected ~${expected}, got ${halfway}`);
  });

  test('activity "in the future" (clock skew) clamps to the floor rather than going negative/above 1', () => {
    assert.equal(computePathWeight(NOW + 60_000, NOW), MIN_PATH_WEIGHT);
  });
});

describe('pickWeightedVolunteer', () => {
  test('null on an empty eligible pool', () => {
    assert.equal(pickWeightedVolunteer([], [], NOW, () => 0.5), null);
  });

  test('with no recent activity anywhere, behaves like a uniform pick (deterministic randomFn)', () => {
    const pool = [row({ volunteerId: 'A' }), row({ volunteerId: 'B' }), row({ volunteerId: 'C' })];
    assert.equal(pickWeightedVolunteer(pool, pool, NOW, () => 0).volunteerId, 'A');
    assert.equal(pickWeightedVolunteer(pool, pool, NOW, () => 0.99).volunteerId, 'C');
  });

  test("a volunteer on a just-used path is never IMPOSSIBLE to pick, even alone in the pool", () => {
    // The whole point of the soft-bias design: if the only eligible volunteer left happens to be on
    // a path used seconds ago, the wheel must still be able to land on them (weight > 0), not stall.
    const allVolunteers = [row({ volunteerId: 'ONLY', colour: 'red', path: 1, activeRun: { runId: 'R', startedAt: NOW } })];
    // ONLY isn't eligible themselves (PLAYING) — simulate a path-mate who IS eligible instead.
    const eligible = [row({ volunteerId: 'MATE', colour: 'red', path: 1 })];
    const pick = pickWeightedVolunteer(eligible, allVolunteers, NOW, () => 0.9999);
    assert.equal(pick.volunteerId, 'MATE'); // only option — must still be returned, not null
  });

  test('FAIRNESS: a volunteer on a cold (never-used) path is picked noticeably more often than one on a just-used path', () => {
    // RECENT_PLAYER is currently PLAYING on red::1 — not eligible themselves, but their path-mate
    // HOT (also red::1, and AVAILABLE) should inherit that path's just-used weight; COLD is on a
    // path (blue::1) nobody has touched.
    const recentPlayer = row({ volunteerId: 'RECENT_PLAYER', colour: 'red', path: 1, activeRun: { runId: 'R', startedAt: NOW } });
    const hot = row({ volunteerId: 'HOT', colour: 'red', path: 1 });
    const cold = row({ volunteerId: 'COLD', colour: 'blue', path: 1 }); // never used
    const eligible = [hot, cold];
    const allVolunteers = [recentPlayer, hot, cold];
    const counts = { HOT: 0, COLD: 0 };
    const trials = 20000;
    for (let i = 0; i < trials; i++) counts[pickWeightedVolunteer(eligible, allVolunteers, NOW).volunteerId] += 1;
    // Expected split is proportional to weights: MIN_PATH_WEIGHT vs 1 — COLD should heavily dominate.
    const expectedColdShare = 1 / (1 + MIN_PATH_WEIGHT);
    const actualColdShare = counts.COLD / trials;
    assert.ok(
      Math.abs(actualColdShare - expectedColdShare) < 0.03,
      `expected COLD share ~${expectedColdShare}, got ${actualColdShare} (HOT=${counts.HOT}, COLD=${counts.COLD})`
    );
  });

  test('two volunteers on the SAME path share identical odds regardless of the third-party path bias', () => {
    const a = row({ volunteerId: 'A', colour: 'red', path: 1 });
    const b = row({ volunteerId: 'B', colour: 'red', path: 1 });
    const eligible = [a, b];
    const counts = { A: 0, B: 0 };
    const trials = 20000;
    for (let i = 0; i < trials; i++) counts[pickWeightedVolunteer(eligible, eligible, NOW).volunteerId] += 1;
    assert.ok(Math.abs(counts.A - counts.B) < trials * 0.05, `expected roughly even split, got A=${counts.A} B=${counts.B}`);
  });
});

describe('canSpin', () => {
  const eligible = [row({ volunteerId: 'A' })];

  test('empty team name is rejected before checking anything else', () => {
    assert.deepEqual(canSpin('   ', new Set(), eligible), { ok: false, reason: 'EMPTY_TEAM_NAME' });
  });

  test('an already-used team name is rejected', () => {
    assert.deepEqual(canSpin('Team Alpha', new Set(['team alpha']), eligible), {
      ok: false,
      reason: 'TEAM_ALREADY_PLAYED',
    });
  });

  test('no eligible volunteers is rejected', () => {
    assert.deepEqual(canSpin('Team Alpha', new Set(), []), { ok: false, reason: 'NO_ELIGIBLE_VOLUNTEERS' });
  });

  test('a valid, new team name with eligible volunteers is allowed', () => {
    assert.deepEqual(canSpin('Team Gamma', new Set(['team alpha']), eligible), { ok: true });
  });
});
