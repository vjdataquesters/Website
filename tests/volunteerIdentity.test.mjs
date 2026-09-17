// tests/volunteerIdentity.test.mjs
// Run with: node --test tests/volunteerIdentity.test.mjs
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

const { saveVolunteerIdentity, readVolunteerIdentity, clearVolunteerIdentity } = await import(
  '../src/pages/hit_vol_2k26/utils/volunteerIdentity.js'
);

const IDENTITY = { volunteerId: 'RED-1-01', volunteerNumber: 1, name: 'Red Path 1 - Volunteer A', colour: 'red', path: 1 };

describe('volunteerIdentity persistence', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
  });

  test('nothing saved yet reads as null', () => {
    assert.equal(readVolunteerIdentity(), null);
  });

  test('save then read round-trips the full identity object', () => {
    saveVolunteerIdentity(IDENTITY);
    assert.deepEqual(readVolunteerIdentity(), IDENTITY);
  });

  test('clear removes it', () => {
    saveVolunteerIdentity(IDENTITY);
    clearVolunteerIdentity();
    assert.equal(readVolunteerIdentity(), null);
  });

  test('missing localStorage never throws', () => {
    const real = globalThis.localStorage;
    // @ts-ignore
    delete globalThis.localStorage;
    try {
      assert.doesNotThrow(() => saveVolunteerIdentity(IDENTITY));
      assert.equal(readVolunteerIdentity(), null);
      assert.doesNotThrow(() => clearVolunteerIdentity());
    } finally {
      globalThis.localStorage = real;
    }
  });

  test('corrupted JSON in storage reads as null rather than throwing', () => {
    globalThis.localStorage.setItem('hit_vol_2k26.volunteerId', '{not valid json');
    assert.equal(readVolunteerIdentity(), null);
  });
});
