// tests/rosterLogic.test.mjs
// Run with: node --test tests/rosterLogic.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveLiveStatus,
  sortVolunteersForDisplay,
  groupVolunteersByColour,
  summarizeRosterCounts,
  pickPollDelayMs,
} from '../src/pages/hit_vol_2k26/services/rosterLogic.js';
import { COLOURS } from '../src/data/hit_vol_2k26/config.js';

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
    status: 'AVAILABLE',
    currentTeam: null,
    activeRun: null,
    ...overrides,
  };
}

describe('deriveLiveStatus', () => {
  test('an activeRun present means PLAYING, regardless of manuallyAvailable/cooldownEnd', () => {
    const v = row({ activeRun: { runId: 'RUN-1' }, manuallyAvailable: false, cooldownEnd: NOW - 1 });
    assert.equal(deriveLiveStatus(v, NOW), 'PLAYING');
  });

  test('no activeRun + manuallyAvailable false = UNAVAILABLE', () => {
    const v = row({ manuallyAvailable: false });
    assert.equal(deriveLiveStatus(v, NOW), 'UNAVAILABLE');
  });

  test('no activeRun + cooldownEnd in the future = RESTING, ticks to AVAILABLE once it passes', () => {
    const v = row({ cooldownEnd: NOW + 5000 });
    assert.equal(deriveLiveStatus(v, NOW), 'RESTING');
    assert.equal(deriveLiveStatus(v, NOW + 5001), 'AVAILABLE');
  });

  test('fresh volunteer with nothing set is AVAILABLE', () => {
    assert.equal(deriveLiveStatus(row(), NOW), 'AVAILABLE');
  });
});

describe('sortVolunteersForDisplay', () => {
  test('orders by colour (COLOURS order), then path, then volunteerNumber', () => {
    const shuffled = [
      row({ volunteerId: 'BLUE-2-01', colour: 'blue', path: 2, volunteerNumber: 20 }),
      row({ volunteerId: 'RED-1-02', colour: 'red', path: 1, volunteerNumber: 2 }),
      row({ volunteerId: 'RED-1-01', colour: 'red', path: 1, volunteerNumber: 1 }),
      row({ volunteerId: 'RED-2-01', colour: 'red', path: 2, volunteerNumber: 4 }),
      row({ volunteerId: 'ORANGE-1-01', colour: 'orange', path: 1, volunteerNumber: 10 }),
    ];
    const sorted = sortVolunteersForDisplay(shuffled).map((v) => v.volunteerId);
    assert.deepEqual(sorted, ['RED-1-01', 'RED-1-02', 'RED-2-01', 'ORANGE-1-01', 'BLUE-2-01']);
  });

  test('does not mutate the input array', () => {
    const input = [row({ volunteerNumber: 2 }), row({ volunteerNumber: 1 })];
    const copy = [...input];
    sortVolunteersForDisplay(input);
    assert.deepEqual(input, copy);
  });
});

describe('groupVolunteersByColour', () => {
  test('returns one section per COLOURS entry, in order, including empty colours', () => {
    const volunteers = [row({ colour: 'violet', volunteerNumber: 1 }), row({ colour: 'red', volunteerNumber: 2 })];
    const sections = groupVolunteersByColour(volunteers);
    assert.deepEqual(sections.map((s) => s.colour), COLOURS);
    const redSection = sections.find((s) => s.colour === 'red');
    const orangeSection = sections.find((s) => s.colour === 'orange');
    assert.equal(redSection.volunteers.length, 1);
    assert.equal(orangeSection.volunteers.length, 0);
  });
});

describe('summarizeRosterCounts', () => {
  test('counts each live-derived status and totals correctly', () => {
    const volunteers = [
      row({ volunteerNumber: 1 }), // AVAILABLE
      row({ volunteerNumber: 2, activeRun: { runId: 'R' } }), // PLAYING
      row({ volunteerNumber: 3, manuallyAvailable: false }), // UNAVAILABLE
      row({ volunteerNumber: 4, cooldownEnd: NOW + 60_000 }), // RESTING
      row({ volunteerNumber: 5 }), // AVAILABLE
    ];
    const counts = summarizeRosterCounts(volunteers, NOW);
    assert.deepEqual(counts, { AVAILABLE: 2, PLAYING: 1, RESTING: 1, UNAVAILABLE: 1, total: 5 });
  });

  test('counts recomputed at a later instant reflect a cooldown that has since elapsed', () => {
    const volunteers = [row({ volunteerNumber: 1, cooldownEnd: NOW + 1000 })];
    assert.equal(summarizeRosterCounts(volunteers, NOW).RESTING, 1);
    assert.equal(summarizeRosterCounts(volunteers, NOW + 1001).AVAILABLE, 1);
  });
});

describe('pickPollDelayMs', () => {
  test('visible page uses the *Active interval, hidden page uses the *Idle interval', () => {
    const cfg = { rosterActive: 5000, rosterIdle: 20000, jitterMs: 0 };
    assert.equal(pickPollDelayMs(cfg, true, () => 0.5), 5000);
    assert.equal(pickPollDelayMs(cfg, false, () => 0.5), 20000);
  });

  test('jitter is applied symmetrically within +/-jitterMs', () => {
    const cfg = { rosterActive: 5000, rosterIdle: 20000, jitterMs: 1500 };
    assert.equal(pickPollDelayMs(cfg, true, () => 1), 5000 + 1500); // randomFn()=1 -> +jitterMs
    assert.equal(pickPollDelayMs(cfg, true, () => 0), 5000 - 1500); // randomFn()=0 -> -jitterMs
  });

  test('never returns below the 500ms floor even with extreme negative jitter', () => {
    const cfg = { runActive: 400, runIdle: 15000, jitterMs: 5000 };
    assert.equal(pickPollDelayMs(cfg, true, () => 0), 500);
  });

  test('works with the runActive/runIdle key names too (Volunteer page polling)', () => {
    const cfg = { runActive: 4000, runIdle: 15000, jitterMs: 0 };
    assert.equal(pickPollDelayMs(cfg, true, () => 0.5), 4000);
    assert.equal(pickPollDelayMs(cfg, false, () => 0.5), 15000);
  });
});
