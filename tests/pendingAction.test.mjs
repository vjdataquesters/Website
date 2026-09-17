// tests/pendingAction.test.mjs
// Run with: node --test tests/pendingAction.test.mjs
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal in-memory localStorage polyfill — Node has no localStorage global by default.
class MemoryStorage {
  constructor() {
    this._map = new Map();
  }
  getItem(key) {
    return this._map.has(key) ? this._map.get(key) : null;
  }
  setItem(key, value) {
    this._map.set(key, String(value));
  }
  removeItem(key) {
    this._map.delete(key);
  }
}

globalThis.localStorage = new MemoryStorage();

const { savePendingAction, readPendingAction, clearPendingAction } = await import(
  '../src/pages/hit_vol_2k26/utils/pendingAction.js'
);

describe('pendingAction buffer', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
  });

  test('nothing saved yet reads as null', () => {
    assert.equal(readPendingAction(), null);
  });

  test('save then read round-trips action, payload, and requestId', () => {
    savePendingAction('endRun', { volunteerId: 'RED-1-01' }, 'req-123');
    const pending = readPendingAction();
    assert.equal(pending.action, 'endRun');
    assert.deepEqual(pending.payload, { volunteerId: 'RED-1-01' });
    assert.equal(pending.requestId, 'req-123');
    assert.equal(typeof pending.savedAt, 'number');
  });

  test('clearPendingAction removes it', () => {
    savePendingAction('startRun', { volunteerId: 'X' }, 'req-1');
    clearPendingAction();
    assert.equal(readPendingAction(), null);
  });

  test('saving a new pending action overwrites the previous one (single-slot buffer)', () => {
    savePendingAction('startRun', { volunteerId: 'A' }, 'req-a');
    savePendingAction('endRun', { volunteerId: 'B' }, 'req-b');
    const pending = readPendingAction();
    assert.equal(pending.action, 'endRun');
    assert.equal(pending.requestId, 'req-b');
  });

  test('missing localStorage (e.g. some WebViews in private mode) never throws', () => {
    const real = globalThis.localStorage;
    // @ts-ignore
    delete globalThis.localStorage;
    try {
      assert.doesNotThrow(() => savePendingAction('endRun', {}, 'req-x'));
      assert.equal(readPendingAction(), null);
      assert.doesNotThrow(() => clearPendingAction());
    } finally {
      globalThis.localStorage = real;
    }
  });
});
