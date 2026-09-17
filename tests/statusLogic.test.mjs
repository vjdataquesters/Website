// tests/statusLogic.test.mjs
// Dev-only test file — not shipped with the app. Run with: node --test tests/statusLogic.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStatus,
  isVolunteerEligible,
  computeAllowedMinutes,
  computeElapsedSeconds,
  isOverAllowed,
  computeCooldownEnd,
  remainingCooldownMs,
  normalizeTeamName,
} from '../src/pages/hit_vol_2k26/services/statusLogic.js';

const NOW = 1_000_000_000_000; // fixed reference "now" in ms

describe('computeStatus precedence', () => {
  test('fresh volunteer with no state is AVAILABLE', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: true, activeRunId: '', cooldownEnd: '' }, NOW),
      'AVAILABLE'
    );
  });

  test('activeRunId with no end timestamp is PLAYING', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: true, activeRunId: 'RUN-1', activeRunEndedAt: null }, NOW),
      'PLAYING'
    );
  });

  test('activeRunId WITH an end timestamp is not PLAYING (run already closed out)', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: true, activeRunId: 'RUN-1', activeRunEndedAt: NOW - 1000 }, NOW),
      'AVAILABLE'
    );
  });

  test('manuallyAvailable=false with no active run is UNAVAILABLE', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: false, activeRunId: '', cooldownEnd: '' }, NOW),
      'UNAVAILABLE'
    );
  });

  test('cooldownEnd in the future (and available) is RESTING', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: true, activeRunId: '', cooldownEnd: NOW + 60_000 }, NOW),
      'RESTING'
    );
  });

  test('cooldownEnd in the past is AVAILABLE', () => {
    assert.equal(
      computeStatus({ manuallyAvailable: true, activeRunId: '', cooldownEnd: NOW - 1 }, NOW),
      'AVAILABLE'
    );
  });

  test('CRITICAL RULE: manually unavailable mid-run still shows PLAYING (not interrupted)', () => {
    assert.equal(
      computeStatus(
        { manuallyAvailable: false, activeRunId: 'RUN-1', activeRunEndedAt: null, cooldownEnd: '' },
        NOW
      ),
      'PLAYING'
    );
  });

  test('CRITICAL RULE: manually unavailable beats an expired cooldown — does NOT auto-restore', () => {
    assert.equal(
      computeStatus(
        { manuallyAvailable: false, activeRunId: '', activeRunEndedAt: null, cooldownEnd: NOW - 1 },
        NOW
      ),
      'UNAVAILABLE'
    );
  });

  test('re-enabling mid-cooldown still shows RESTING until cooldown actually elapses', () => {
    assert.equal(
      computeStatus(
        { manuallyAvailable: true, activeRunId: '', activeRunEndedAt: null, cooldownEnd: NOW + 60_000 },
        NOW
      ),
      'RESTING'
    );
  });
});

describe('isVolunteerEligible', () => {
  test('only AVAILABLE is eligible', () => {
    const cases = [
      [{ manuallyAvailable: true, activeRunId: '', cooldownEnd: '' }, true],
      [{ manuallyAvailable: false, activeRunId: '', cooldownEnd: '' }, false],
      [{ manuallyAvailable: true, activeRunId: 'R', activeRunEndedAt: null, cooldownEnd: '' }, false],
      [{ manuallyAvailable: true, activeRunId: '', cooldownEnd: NOW + 1000 }, false],
    ];
    for (const [v, expected] of cases) {
      assert.equal(isVolunteerEligible(v, NOW), expected, JSON.stringify(v));
    }
  });
});

describe('computeAllowedMinutes — hard fixed cap, penalties never extend it', () => {
  test('0 penalties = 30', () => assert.equal(computeAllowedMinutes(0, 30, 5), 30));
  test('1 penalty is STILL 30 — penalties no longer add time', () => assert.equal(computeAllowedMinutes(1, 30, 5), 30));
  test('2 penalties is STILL 30', () => assert.equal(computeAllowedMinutes(2, 30, 5), 30));
  test('garbage penalties input still just returns baseMinutes', () =>
    assert.equal(computeAllowedMinutes(-3, 30, 5), 30));
  test('baseMinutes is the only thing that matters', () => assert.equal(computeAllowedMinutes(2, 45, 5), 45));
});

describe('computeElapsedSeconds — timestamp anchoring, not counting', () => {
  test('no startedAt yet = 0', () => assert.equal(computeElapsedSeconds(null, null, NOW), 0));

  test('mid-run elapsed is now - startedAt', () => {
    const startedAt = NOW - 90_000; // 90s ago
    assert.equal(computeElapsedSeconds(startedAt, null, NOW), 90);
  });

  test('CRITICAL: a "refresh" (recomputing with the same inputs) gives the identical answer', () => {
    const startedAt = NOW - 12 * 60_000; // 12 minutes ago
    const beforeRefresh = computeElapsedSeconds(startedAt, null, NOW);
    // Simulate losing all in-memory state and re-deriving purely from the stored startedAt + a
    // freshly read clock a moment later — this is exactly what the Volunteer page does on mount.
    const afterRefresh = computeElapsedSeconds(startedAt, null, NOW + 3000); // 3s passed during reload
    assert.equal(beforeRefresh, 720);
    assert.equal(afterRefresh, 723); // correctly advanced by the 3s the reload took, not reset to 0
  });

  test('ended run freezes elapsed at endedAt, ignoring current time moving further', () => {
    const startedAt = NOW - 20 * 60_000;
    const endedAt = NOW - 5 * 60_000;
    assert.equal(computeElapsedSeconds(startedAt, endedAt, NOW), 15 * 60);
    assert.equal(computeElapsedSeconds(startedAt, endedAt, NOW + 999_999), 15 * 60); // unaffected
  });
});

describe('isOverAllowed', () => {
  test('under allowed time is false', () => assert.equal(isOverAllowed(29 * 60, 30), false));
  test('exactly at allowed time is true (>=)', () => assert.equal(isOverAllowed(30 * 60, 30), true));
  test('well past allowed time is true', () => assert.equal(isOverAllowed(90 * 60, 40), true));
});

describe('cooldown math', () => {
  test('computeCooldownEnd adds exactly N minutes', () => {
    assert.equal(computeCooldownEnd(NOW, 15), NOW + 15 * 60_000);
  });

  test('remainingCooldownMs counts down correctly and floors at 0', () => {
    const cooldownEnd = NOW + 5 * 60_000;
    assert.equal(remainingCooldownMs(cooldownEnd, NOW), 5 * 60_000);
    assert.equal(remainingCooldownMs(cooldownEnd, NOW + 5 * 60_000 + 1), 0);
    assert.equal(remainingCooldownMs(cooldownEnd, NOW + 999_999_999), 0); // never negative
  });

  test('no cooldownEnd set means 0 remaining', () => {
    assert.equal(remainingCooldownMs('', NOW), 0);
    assert.equal(remainingCooldownMs(null, NOW), 0);
  });
});

describe('normalizeTeamName — duplicate-team detection basis', () => {
  test('trims, lower-cases, collapses internal whitespace', () => {
    assert.equal(normalizeTeamName('  Team   Alpha '), 'team alpha');
    assert.equal(normalizeTeamName('TEAM ALPHA'), 'team alpha');
    assert.equal(normalizeTeamName('team alpha'), 'team alpha');
  });

  test('these three are all the same team per the hard-block rule', () => {
    const a = normalizeTeamName('Team Alpha');
    const b = normalizeTeamName(' team  alpha');
    const c = normalizeTeamName('TEAM ALPHA');
    assert.equal(a, b);
    assert.equal(b, c);
  });

  test('different teams stay different', () => {
    assert.notEqual(normalizeTeamName('Team Alpha'), normalizeTeamName('Team Beta'));
  });

  test('empty/garbage input never throws', () => {
    assert.equal(normalizeTeamName(undefined), '');
    assert.equal(normalizeTeamName(null), '');
    assert.equal(normalizeTeamName(''), '');
  });
});
