const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

globalThis.window = globalThis.window || {};
require('../js/locations.js');

describe('locations data', () => {
  it('exposes a locations array', () => {
    assert.ok(Array.isArray(window.LOCATIONS));
  });
});
