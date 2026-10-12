// Usage: <command that prints the clipboard> | node scripts/save-image.js <day>
// Reads the base64 photo from a form submission email and writes img/<day>.jpg.
const fs = require('fs');
const path = require('path');

function parseDay(arg) {
  if (!/^\d+$/.test(arg || '')) {
    throw new Error('day must be a whole number from 1 to 24');
  }
  const day = Number(arg);
  if (day < 1 || day > 24) {
    throw new Error('day must be a whole number from 1 to 24');
  }
  return day;
}

function parseImagePayload(text) {
  let payload = String(text).replace(/\s+/g, '');
  if (!payload) {
    throw new Error('input is empty');
  }
  if (payload.startsWith('data:')) {
    const match = /^data:image\/jpeg;base64,/.exec(payload);
    if (!match) {
      throw new Error('expected a data:image/jpeg;base64 URL');
    }
    payload = payload.slice(match[0].length);
  }
  // = may only appear as 1-2 padding characters at the very end; anything else means the
  // text was mangled on the way (for example quoted-printable soft line breaks).
  if (payload.replace(/={1,2}$/, '').includes('=')) {
    throw new Error('input is not clean base64 (stray = characters)');
  }
  const buffer = Buffer.from(payload, 'base64');
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    throw new Error('data is not a JPEG image');
  }
  let end = buffer.length;
  while (end > 0 && buffer[end - 1] === 0) end--;
  if (end < 2 || buffer[end - 2] !== 0xff || buffer[end - 1] !== 0xd9) {
    throw new Error('JPEG is truncated (no end marker); copy the whole image field from the email');
  }
  return buffer;
}

function main() {
  let day;
  let buffer;
  try {
    day = parseDay(process.argv[2]);
    buffer = parseImagePayload(fs.readFileSync(0, 'utf8'));
  } catch (err) {
    console.error(`save-image: ${err.message}`);
    process.exit(1);
  }
  const target = path.join(__dirname, '..', 'img', `${day}.jpg`);
  fs.writeFileSync(target, buffer);
  console.log(`Wrote ${target} (${buffer.length} bytes)`);
}

module.exports = { parseDay, parseImagePayload };

if (require.main === module) {
  main();
}
