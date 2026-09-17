// tests/resultsLogic.test.mjs
// Run with: node --test tests/resultsLogic.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatMinutesSeconds, buildResultsRow } from '../src/pages/hit_vol_2k26/services/resultsLogic.js';

describe('formatMinutesSeconds', () => {
  test('zero is "0:00"', () => {
    assert.equal(formatMinutesSeconds(0), '0:00');
  });

  test('pads single-digit seconds', () => {
    assert.equal(formatMinutesSeconds(65), '1:05');
  });

  test('does not pad double-digit seconds', () => {
    assert.equal(formatMinutesSeconds(95), '1:35');
  });

  test('exact minute boundary', () => {
    assert.equal(formatMinutesSeconds(120), '2:00');
  });

  test('rounds a fractional number of seconds', () => {
    assert.equal(formatMinutesSeconds(59.6), '1:00'); // rounds to 60, not floors to 0:59
  });

  test('a large duration (over an hour) still just accumulates minutes, no separate hour field', () => {
    assert.equal(formatMinutesSeconds(3725), '62:05');
  });

  test('empty string, null, undefined, and non-finite input all format as ""', () => {
    assert.equal(formatMinutesSeconds(''), '');
    assert.equal(formatMinutesSeconds(null), '');
    assert.equal(formatMinutesSeconds(undefined), '');
    assert.equal(formatMinutesSeconds(NaN), '');
    assert.equal(formatMinutesSeconds('not a number'), '');
  });

  test('a negative input clamps to 0 rather than showing a negative duration', () => {
    assert.equal(formatMinutesSeconds(-30), '0:00');
  });
});

describe('buildResultsRow', () => {
  const baseRun = {
    teamName: 'Team Alpha',
    colour: 'red',
    path: 1,
    volunteerName: 'Red Path 1 - Volunteer A',
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_000_000 + 32 * 60_000 + 5_000, // +32:05
    durationSeconds: 32 * 60 + 5,
    penalties: 1,
    effectiveDurationSeconds: 32 * 60 + 5 + 3 * 60, // +1 penalty * 3 effective minutes
  };

  test('produces the 9 fields in RESULTS_HEADERS order', () => {
    const row = buildResultsRow(baseRun);
    assert.equal(row.length, 9);
    assert.equal(row[0], 'Team Alpha');
    assert.equal(row[1], 'red');
    assert.equal(row[2], 1);
    assert.equal(row[3], 'Red Path 1 - Volunteer A');
    assert.equal(row[6], '32:05'); // Duration
    assert.equal(row[7], 1); // Penalties
    assert.equal(row[8], '35:05'); // Effective time: 32:05 + 3:00
  });

  test('Start time and End time are real Date objects, correctly anchored to the epoch-ms input', () => {
    const row = buildResultsRow(baseRun);
    assert.ok(row[4] instanceof Date);
    assert.ok(row[5] instanceof Date);
    assert.equal(row[4].getTime(), baseRun.startedAt);
    assert.equal(row[5].getTime(), baseRun.endedAt);
  });

  test('a run with no startedAt/endedAt yet (should not normally reach here, but defensively) yields empty strings, not "Invalid Date"', () => {
    const row = buildResultsRow({ ...baseRun, startedAt: '', endedAt: '' });
    assert.equal(row[4], '');
    assert.equal(row[5], '');
  });

  test('zero penalties round-trips as 0, not an empty string', () => {
    const row = buildResultsRow({ ...baseRun, penalties: 0, effectiveDurationSeconds: baseRun.durationSeconds });
    assert.equal(row[7], 0);
    assert.equal(row[8], row[6]); // no penalties -> effective time equals plain duration
  });
});
