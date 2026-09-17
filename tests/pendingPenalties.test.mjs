// tests/pendingPenalties.test.mjs
// Run with: node --test tests/pendingPenalties.test.mjs
//
// Node has no `window`, so these functions' try/catch degrades to a safe no-op there (confirmed
// below) — the "real" localStorage-backed behaviour is exercised by stubbing a minimal
// window.localStorage on globalThis for the duration of each test, then restoring it.
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  readPendingPenalties,
  savePendingPenalties,
  clearPendingPenalties,
  hasAnyPendingPenalties,
} from '../src/pages/hit_vol_2k26/utils/pendingPenalties.js';

function makeFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

describe('without a window (plain Node — e.g. this test runner itself)', () => {
  test('every function degrades to a safe no-op instead of throwing', () => {
    assert.equal(readPendingPenalties('RUN-1'), 0);
    assert.doesNotThrow(() => savePendingPenalties('RUN-1', 2));
    assert.doesNotThrow(() => clearPendingPenalties('RUN-1'));
    assert.equal(hasAnyPendingPenalties(), false);
  });

  test('a falsy runId is a no-op / returns 0 without touching storage', () => {
    assert.equal(readPendingPenalties(null), 0);
    assert.equal(readPendingPenalties(undefined), 0);
    assert.equal(readPendingPenalties(''), 0);
  });
});

describe('with a stubbed window.localStorage', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
    globalThis.window = { localStorage: makeFakeLocalStorage() };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  test('save then read round-trips the count for that runId', () => {
    savePendingPenalties('RUN-1', 2);
    assert.equal(readPendingPenalties('RUN-1'), 2);
  });

  test('different runIds are tracked independently (several PLAYING at once)', () => {
    savePendingPenalties('RUN-1', 1);
    savePendingPenalties('RUN-2', 2);
    assert.equal(readPendingPenalties('RUN-1'), 1);
    assert.equal(readPendingPenalties('RUN-2'), 2);
  });

  test('an unknown runId reads as 0', () => {
    savePendingPenalties('RUN-1', 1);
    assert.equal(readPendingPenalties('RUN-UNKNOWN'), 0);
  });

  test('clearPendingPenalties removes only that runId, leaving others intact', () => {
    savePendingPenalties('RUN-1', 1);
    savePendingPenalties('RUN-2', 2);
    clearPendingPenalties('RUN-1');
    assert.equal(readPendingPenalties('RUN-1'), 0);
    assert.equal(readPendingPenalties('RUN-2'), 2);
  });

  test('survives a "page refresh" — a fresh read after save still sees the count', () => {
    savePendingPenalties('RUN-1', 2);
    // Simulate nothing but time passing; readPendingPenalties always re-reads from storage rather
    // than trusting any in-memory value, which is the property that makes a refresh safe.
    assert.equal(readPendingPenalties('RUN-1'), 2);
  });

  describe('hasAnyPendingPenalties', () => {
    test('false when nothing has been logged yet', () => {
      assert.equal(hasAnyPendingPenalties(), false);
    });

    test('true once any run has a non-zero count', () => {
      savePendingPenalties('RUN-1', 1);
      assert.equal(hasAnyPendingPenalties(), true);
    });

    test('false again once every non-zero entry is cleared', () => {
      savePendingPenalties('RUN-1', 1);
      savePendingPenalties('RUN-2', 2);
      clearPendingPenalties('RUN-1');
      assert.equal(hasAnyPendingPenalties(), true, 'RUN-2 is still pending');
      clearPendingPenalties('RUN-2');
      assert.equal(hasAnyPendingPenalties(), false);
    });

    test('a run explicitly saved with 0 does not count as pending', () => {
      savePendingPenalties('RUN-1', 0);
      assert.equal(hasAnyPendingPenalties(), false);
    });
  });
});
