import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { applyGate, relativePhase, createGateLab } from '../src/gates.js';
import { prepare, probabilities, bloch, validateState } from '../src/quantum.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
const stateClose = (a, b) => { for (const k of ['alpha', 'beta']) for (const z of ['re', 'im']) close(a[k][z], b[k][z]); };
test('X swaps the computational basis states', () => {
  stateClose(applyGate(prepare('zero'), 'X'), prepare('one'));
  stateClose(applyGate(prepare('one'), 'X'), prepare('zero'));
});
test('H produces plus/minus from the computational basis', () => {
  stateClose(applyGate(prepare('zero'), 'H'), prepare('plus'));
  stateClose(applyGate(prepare('one'), 'H'), prepare('minus'));
});
test('Z changes plus to minus without changing Z measurement probabilities', () => {
  const a = prepare('plus'), b = applyGate(a, 'Z'); stateClose(b, prepare('minus'));
  close(probabilities(a).zero, probabilities(b).zero); close(relativePhase(b), Math.PI);
});
test('complex states obey independent analytical Bloch rotation identities', () => {
  for (let i = 1; i < 60; i++) {
    const theta = i * Math.PI / 60, phi = i * Math.sqrt(2);
    const s = { alpha: { re: Math.cos(theta / 2), im: 0 }, beta: {
      re: Math.sin(theta / 2) * Math.cos(phi), im: Math.sin(theta / 2) * Math.sin(phi) } };
    const p = bloch(s);
    for (const [gate, expected] of [['X', [p.x, -p.y, -p.z]], ['H', [p.z, -p.y, p.x]], ['Z', [-p.x, -p.y, p.z]]]) {
      const actual = bloch(applyGate(s, gate)); ['x', 'y', 'z'].forEach((k, j) => close(actual[k], expected[j]));
    }
  }
});
test('X,H,Z are each their own inverse, including complex amplitudes', () => {
  for (const name of ['zero', 'one', 'plus', 'minus', 'plusI']) for (const gate of ['X', 'H', 'Z']) {
    const a = prepare(name); stateClose(applyGate(applyGate(a, gate), gate), a);
  }
});
test('H-Z-H reveals phase as a certain 1; H-H returns certain 0', () => {
  let s = prepare('zero'); for (const g of ['H', 'Z', 'H']) s = applyGate(s, g);
  close(probabilities(s).one, 1); close(probabilities(applyGate(applyGate(prepare('zero'), 'H'), 'H')).zero, 1);
});
test('global complex phase preserves probabilities, Bloch direction and relative phase', () => {
  const s = prepare('plusI'), phi = 0.713, c = Math.cos(phi), d = Math.sin(phi);
  const rotate = z => ({ re: z.re * c - z.im * d, im: z.re * d + z.im * c });
  const t = { alpha: rotate(s.alpha), beta: rotate(s.beta) };
  close(relativePhase(t), Math.PI / 2);
  for (const gate of ['X', 'H', 'Z']) {
    const a = bloch(applyGate(s, gate)), b = bloch(applyGate(t, gate));
    ['x', 'y', 'z'].forEach(k => close(a[k], b[k]));
  }
});
test('relative phase is explicitly undefined when one amplitude is zero', () => {
  assert.equal(relativePhase(prepare('zero')), null); assert.equal(relativePhase(prepare('one')), null);
});
test('relative phase remains defined for tiny nonzero amplitudes', () => {
  close(relativePhase({ alpha: { re: 1, im: 0 }, beta: { re: 0, im: 1e-20 } }), Math.PI / 2);
});
test('gate operations leave frozen input amplitudes untouched', () => {
  const s = prepare('plusI'); Object.freeze(s.alpha); Object.freeze(s.beta); Object.freeze(s);
  for (const gate of ['X', 'H', 'Z']) validateState(applyGate(s, gate)); stateClose(s, prepare('plusI'));
});
test('invalid gates and invalid states are rejected', () => {
  assert.throws(() => applyGate(prepare('zero'), 'other')); assert.throws(() => applyGate({}, 'X'));
});
test('lab rejects stale callbacks without drawing randomness or changing state', () => {
  let draws = 0; const lab = createGateLab({ random: () => { draws++; return 0.7; } });
  assert.equal(lab.dispatch('H', 0).ok, true); const before = lab.snapshot();
  assert.equal(lab.dispatch('measure', 0).code, 'STALE_CONTROL'); assert.equal(draws, 0);
  assert.deepEqual(lab.snapshot(), before);
});
test('lab measurement collapses and repetition stays certain', () => {
  const lab = createGateLab({ random: () => 0.8 }); lab.dispatch('H', 0);
  const a = lab.dispatch('measure', 1), b = lab.dispatch('measure', 2);
  assert.equal(a.result, 1); assert.equal(b.result, 1); assert.deepEqual(b.counts, [0, 2]);
});
test('lab reset clears only its own experiment and state', () => {
  const lab = createGateLab({ random: () => 0.2 }); lab.dispatch('H', 0); lab.dispatch('measure', 1);
  const a = lab.dispatch('reset', 2); assert.equal(a.trials, 0); assert.equal(a.result, null);
  assert.deepEqual(a.counts, [0, 0]); stateClose(a.state, prepare('zero'));
});
test('invalid sampler rolls back state and blocks reentrant operation', () => {
  let nested; const lab = createGateLab({ random: () => { nested = lab.dispatch('X', 2); return Infinity; } });
  lab.dispatch('H', 0); const before = lab.snapshot(); const after = lab.dispatch('measure', 1);
  assert.equal(nested.code, 'LAB_BUSY'); assert.equal(after.ok, false); assert.equal(after.trials, 0);
  stateClose(after.state, before.state); assert.equal(after.revision, 2);
  assert.equal(lab.dispatch('reset', 2).ok, true);
  const recovered = lab.dispatch('X', 3); assert.equal(recovered.ok, true);
  stateClose(recovered.state, prepare('one')); assert.deepEqual(recovered.counts, [0, 0]);
});
test('snapshots and bounded history do not expose mutable internal state', () => {
  const lab = createGateLab(); const s = lab.snapshot(); s.state.alpha.re = 0; s.counts[0] = 99;
  stateClose(lab.snapshot().state, prepare('zero'));
  for (let i = 0; i < 50; i++) lab.dispatch('X', i);
  assert.equal(lab.snapshot().history.length, 16); assert.deepEqual(lab.snapshot().counts, [0, 0]);
});
test('long gate sequences preserve normalization without accumulating drift', () => {
  let s = prepare('plusI'); for (let i = 0; i < 12000; i++) s = applyGate(s, ['H', 'X', 'Z'][i % 3]);
  validateState(s); close(probabilities(s).zero + probabilities(s).one, 1);
});
test('native optional module matches source and phase-sensitive operation results', () => {
  const source = fs.readFileSync(new URL('../src/gates.js', import.meta.url), 'utf8');
  const url = new URL('../native/QuantumARExplorer/Assets/Scripts/QuantumOptional/gates.js', import.meta.url);
  const native = fs.readFileSync(url, 'utf8');
  assert.equal(native, '// Generated from src/gates.js; optional isolated gate laboratory.\n' +
    source.replace("import { validateState, prepare, probabilities, bloch, measure } from './quantum.js';",
      "const { validateState, prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');")
      .replaceAll('export function ', 'function ') +
    '\nmodule.exports = { applyGate, relativePhase, createGateLab, describeGateLab };\n');
  const quantum = { module: { exports: {} } };
  vm.runInNewContext(fs.readFileSync(new URL('../native/QuantumARExplorer/Assets/Scripts/QuantumCore/quantum.js', import.meta.url), 'utf8'), quantum);
  const context = { module: { exports: {} }, require: id => {
    assert.equal(id, '../QuantumCore/quantum.js'); return quantum.module.exports;
  } };
  vm.runInNewContext(native, context);
  for (const name of ['zero', 'plusI', 'minus']) {
    let a = prepare(name), b = prepare(name);
    for (const g of ['H', 'Z', 'H', 'X', 'Z']) {
      a = applyGate(a, g); b = context.module.exports.applyGate(b, g); stateClose(a, b);
    }
  }
});
