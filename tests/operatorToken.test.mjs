// tests/operatorToken.test.mjs
// Run with: node --test tests/operatorToken.test.mjs
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

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

const { saveOperatorToken, readOperatorToken, clearOperatorToken } = await import(
  '../src/pages/hit_vol_2k26/utils/operatorToken.js'
);

describe('operatorToken persistence', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
  });

  test('nothing saved yet reads as null', () => {
    assert.equal(readOperatorToken(), null);
  });

  test('save then read round-trips the token string', () => {
    saveOperatorToken('super-secret-passcode');
    assert.equal(readOperatorToken(), 'super-secret-passcode');
  });

  test('clear removes it', () => {
    saveOperatorToken('super-secret-passcode');
    clearOperatorToken();
    assert.equal(readOperatorToken(), null);
  });

  test('saving a new token overwrites the previous one', () => {
    saveOperatorToken('old-passcode');
    saveOperatorToken('new-passcode');
    assert.equal(readOperatorToken(), 'new-passcode');
  });

  test('missing localStorage never throws', () => {
    const real = globalThis.localStorage;
    // @ts-ignore
    delete globalThis.localStorage;
    try {
      assert.doesNotThrow(() => saveOperatorToken('x'));
      assert.equal(readOperatorToken(), null);
      assert.doesNotThrow(() => clearOperatorToken());
    } finally {
      globalThis.localStorage = real;
    }
  });
});
