// tests/requestId.test.mjs
// Run with: node --test tests/requestId.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateRequestId } from '../src/pages/hit_vol_2k26/utils/requestId.js';

describe('generateRequestId', () => {
  test('returns a non-empty string', () => {
    const id = generateRequestId();
    assert.equal(typeof id, 'string');
    assert.ok(id.length > 0);
  });

  test('1000 generated ids are all unique (collision-free at the scale this app needs)', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) ids.add(generateRequestId());
    assert.equal(ids.size, 1000);
  });

  test('uses crypto.randomUUID when available', () => {
    const id = generateRequestId();
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      // UUID v4 shape
      assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    }
  });

  test('falls back to a unique id when crypto.randomUUID is unavailable', () => {
    // Node's global `crypto` is a getter-only accessor property, so it can't be reassigned with
    // `globalThis.crypto = ...` — redefine it instead, and restore the original descriptor after.
    const realDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const realCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: { ...realCrypto, randomUUID: undefined },
      configurable: true,
      writable: true,
    });
    try {
      const a = generateRequestId();
      const b = generateRequestId();
      assert.equal(typeof a, 'string');
      assert.ok(a.startsWith('rid-'));
      assert.notEqual(a, b, 'two fallback ids generated back-to-back must still differ');
    } finally {
      Object.defineProperty(globalThis, 'crypto', realDescriptor);
    }
  });

  test('falls back cleanly when crypto is entirely undefined', () => {
    const realDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      const id = generateRequestId();
      assert.ok(id.startsWith('rid-'));
    } finally {
      Object.defineProperty(globalThis, 'crypto', realDescriptor);
    }
  });
});
