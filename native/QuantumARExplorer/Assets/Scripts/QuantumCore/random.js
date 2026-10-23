// Generated from src/random.js by tools/build-lens-core.mjs. Do not edit.
'use strict';
// Reproducible simulation/test injection. Not cryptographic or physical randomness.
function createSeededRandom(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Expected a 32-bit unsigned seed');
  let value = seed >>> 0;
  return () => ((value = (Math.imul(value, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
module.exports = { createSeededRandom };
