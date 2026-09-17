// tests/serverTime.test.mjs
// Run with: node --test tests/serverTime.test.mjs
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  updateServerTimeOffset,
  getServerNow,
  hasSyncedServerTime,
  resetServerTimeOffsetForTests,
} from '../src/pages/hit_vol_2k26/services/serverTime.js';

describe('serverTime offset tracking', () => {
  beforeEach(() => {
    resetServerTimeOffsetForTests();
  });

  test('before any sync, getServerNow tracks the local clock (offset 0) and hasSynced is false', () => {
    assert.equal(hasSyncedServerTime(), false);
    const before = Date.now();
    const now = getServerNow();
    const after = Date.now();
    assert.ok(now >= before && now <= after + 5);
  });

  test('after updateServerTimeOffset, getServerNow reflects the server clock, not the local one', () => {
    const serverNow = Date.now() + 5 * 60_000; // server is 5 minutes ahead of this device
    updateServerTimeOffset(serverNow);
    assert.equal(hasSyncedServerTime(), true);
    // Allow a small tolerance for the few ms of real time that pass during the test itself.
    assert.ok(Math.abs(getServerNow() - serverNow) < 50, 'getServerNow should track the synced server time');
  });

  test('a later, different serverNow re-syncs the offset (continuous re-sync via polling)', () => {
    updateServerTimeOffset(Date.now() + 60_000);
    const firstOffsetNow = getServerNow();
    assert.ok(Math.abs(firstOffsetNow - (Date.now() + 60_000)) < 50);

    updateServerTimeOffset(Date.now() - 60_000); // server clock now looks 1 minute BEHIND
    assert.ok(Math.abs(getServerNow() - (Date.now() - 60_000)) < 50);
  });

  test('garbage input (NaN, non-number, undefined) is ignored, never corrupts the offset', () => {
    updateServerTimeOffset(Date.now() + 10_000);
    const goodNow = getServerNow();
    updateServerTimeOffset(NaN);
    updateServerTimeOffset(undefined);
    updateServerTimeOffset('not a number');
    assert.ok(Math.abs(getServerNow() - goodNow) < 50, 'offset must be unchanged by garbage input');
  });
});
