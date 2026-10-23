import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare, probabilities, bloch, measure, validateState } from '../src/quantum.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);

test('basis states produce certain outcomes including RNG boundaries', () => {
  for (const draw of [0, 0.25, 0.5, 1 - Number.EPSILON]) {
    assert.equal(measure(prepare('zero'), () => draw).outcome, 0);
    assert.equal(measure(prepare('one'), () => draw).outcome, 1);
  }
});
test('equal superposition probability and both measurement branches', () => {
  close(probabilities(prepare('plus')).zero, 0.5);
  assert.equal(measure(prepare('plus'), () => 0.1).outcome, 0);
  assert.equal(measure(prepare('plus'), () => 0.9).outcome, 1);
});
test('collapse makes repeated Z measurements certain until re-preparation', () => {
  for (const draw of [0.1, 0.9]) {
    const first = measure(prepare('plus'), () => draw);
    assert.equal(measure(first.state, () => 1 - draw).outcome, first.outcome);
  }
});
test('Bloch axes, relative phase, global phase, and unit length', () => {
  for (const [name, expected] of Object.entries({zero:[0,0,1],one:[0,0,-1],
    plus:[1,0,0],minus:[-1,0,0],plusI:[0,1,0]})) {
    const point = Object.values(bloch(prepare(name)));
    point.forEach((v, i) => close(v, expected[i]));
    close(point.reduce((s, v) => s + v*v, 0), 1);
  }
  const q = Math.SQRT1_2;
  const phased = {alpha:{re:0,im:q},beta:{re:0,im:q}};
  close(bloch(phased).x, 1);
  close(probabilities(phased).zero, 0.5);
});
test('invalid state, preparation and random inputs fail closed', () => {
  for (const state of [null, {}, {alpha:{re:1,im:0},beta:{re:1,im:0}},
    {alpha:{re:NaN,im:0},beta:{re:0,im:0}}]) assert.throws(() => validateState(state));
  for (const draw of [-0.1, 1, Infinity, NaN]) assert.throws(() => measure(prepare('plus'), () => draw));
  assert.throws(() => prepare('constructor'));
});
test('seeded 10000 fresh plus preparations satisfy prespecified 47-53% interval', () => {
  let seed = 0x514152;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2**32);
  let ones = 0;
  for (let i=0; i<10000; i++) ones += measure(prepare('plus'), random).outcome;
  assert.ok(ones >= 4700 && ones <= 5300, `ones=${ones}`);
  console.log(`Seeded statistical smoke test: ${ones}/10000 ones; seed=0x514152`);
});
