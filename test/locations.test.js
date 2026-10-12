const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

globalThis.window = globalThis.window || {};
require('../js/locations.js');

describe('locations data', () => {
  it('exposes 24 locations with unique days 1..24', () => {
    const days = window.LOCATIONS.map(l => l.day);
    assert.deepEqual(days, Array.from({ length: 24 }, (_, i) => i + 1));
  });
});
