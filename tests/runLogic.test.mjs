// tests/runLogic.test.mjs
// Run with: node --test tests/runLogic.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { canStartRun, canEndRun } from '../src/pages/hit_vol_2k26/services/runLogic.js';

const NOW = 1_000_000_000_000;

describe('canStartRun', () => {
  test('true only when assigned and not started', () => {
    assert.equal(canStartRun({ startedAt: '', endedAt: '' }), true);
  });
  test('false with no run', () => assert.equal(canStartRun(null), false));
  test('false once already started', () => assert.equal(canStartRun({ startedAt: NOW, endedAt: '' }), false));
  test('false once ended', () => assert.equal(canStartRun({ startedAt: NOW, endedAt: NOW + 1 }), false));
});

describe('canEndRun', () => {
  test('true only while running', () => {
    assert.equal(canEndRun({ startedAt: NOW, endedAt: '' }), true);
  });
  test('false before starting, false after ending, false with no run', () => {
    assert.equal(canEndRun({ startedAt: '', endedAt: '' }), false);
    assert.equal(canEndRun({ startedAt: NOW, endedAt: NOW + 1 }), false);
    assert.equal(canEndRun(null), false);
  });
});

