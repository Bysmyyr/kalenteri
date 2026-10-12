const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseImagePayload, parseDay } = require('../scripts/save-image.js');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 0xff, 0xd9]);
const b64 = jpeg.toString('base64');

describe('parseImagePayload', () => {
  it('accepts a jpeg data URL', () => {
    assert.deepEqual(parseImagePayload(`data:image/jpeg;base64,${b64}`), jpeg);
  });
  it('accepts raw base64', () => {
    assert.deepEqual(parseImagePayload(b64), jpeg);
  });
  it('tolerates hard-wrapped base64 and surrounding whitespace', () => {
    const wrapped = `\n  data:image/jpeg;base64,${b64.slice(0, 6)}\r\n${b64.slice(6)}  \n`;
    assert.deepEqual(parseImagePayload(wrapped), jpeg);
  });
  it('rejects non-image data URLs', () => {
    assert.throws(() => parseImagePayload(`data:text/html;base64,${b64}`), /image\/jpeg/);
  });
  it('rejects data that is not a JPEG', () => {
    assert.throws(() => parseImagePayload(Buffer.from('hello world').toString('base64')), /JPEG/);
  });
  it('rejects a truncated JPEG (no end marker)', () => {
    const truncated = jpeg.subarray(0, jpeg.length - 4).toString('base64');
    assert.throws(() => parseImagePayload(`data:image/jpeg;base64,${truncated}`), /truncated/i);
  });
  it('rejects base64 with an internal = (e.g. quoted-printable soft breaks)', () => {
    const broken = b64.slice(0, 8) + '=\n' + b64.slice(8);
    assert.throws(() => parseImagePayload(broken), /base64/i);
  });
  it('tolerates trailing zero bytes after the end marker', () => {
    const padded = Buffer.concat([jpeg, Buffer.from([0, 0])]);
    assert.deepEqual(parseImagePayload(padded.toString('base64')), padded);
  });
  it('rejects empty input', () => {
    assert.throws(() => parseImagePayload('  \n'), /empty/i);
  });
});

describe('parseDay', () => {
  it('accepts 1..24', () => {
    assert.equal(parseDay('1'), 1);
    assert.equal(parseDay('24'), 24);
  });
  for (const bad of ['0', '25', '1.5', 'abc', '', '../1', '1/../2', '-3', undefined]) {
    it(`rejects ${JSON.stringify(bad)}`, () => {
      assert.throws(() => parseDay(bad), /day/i);
    });
  }
});
