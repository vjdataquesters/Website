// tests/formatDuration.test.mjs
// Run with: node --test tests/formatDuration.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatMinutesSeconds } from '../src/pages/hit_vol_2k26/utils/formatDuration.js';

describe('formatMinutesSeconds', () => {
  test('formats whole minutes with no leftover seconds', () => {
    assert.equal(formatMinutesSeconds(120), '2:00');
  });

  test('pads single-digit seconds', () => {
    assert.equal(formatMinutesSeconds(65), '1:05');
  });

  test('zero is 0:00', () => {
    assert.equal(formatMinutesSeconds(0), '0:00');
  });

  test('floors fractional seconds', () => {
    assert.equal(formatMinutesSeconds(59.9), '0:59');
  });

  test('negative/garbage input clamps to 0:00, never throws or shows negative time', () => {
    assert.equal(formatMinutesSeconds(-30), '0:00');
    assert.equal(formatMinutesSeconds(NaN), '0:00');
    assert.equal(formatMinutesSeconds(undefined), '0:00');
    assert.equal(formatMinutesSeconds(null), '0:00');
  });

  test('minutes beyond 59 are not wrapped into hours (e.g. 40 min allowed time)', () => {
    assert.equal(formatMinutesSeconds(40 * 60), '40:00');
  });
});
