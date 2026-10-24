import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createVisualTransition, interpolateDirection } from '../src/visual-transition.js';
const north = { x: 0, y: 0, z: 1 }, south = { x: 0, y: 0, z: -1 }, plus = { x: 1, y: 0, z: 0 };
const near = (a, b) => ['x', 'y', 'z'].forEach(k => assert.ok(Math.abs(a[k] - b[k]) < 1e-9));
test('visual arcs preserve endpoints and never mutate scientific inputs', () => {
  const a = Object.freeze({ ...north }), b = Object.freeze({ ...plus });
  near(interpolateDirection(a, b, -1), north); near(interpolateDirection(a, b, 2), plus);
  for (let t = 0; t <= 1; t += 0.05) assert.ok(Math.abs(Math.hypot(...Object.values(interpolateDirection(a, b, t))) - 1) < 1e-12);
});
test('antipodal preparation has a deterministic finite display arc', () => {
  const middle = interpolateDirection(north, south, 0.5);
  near(middle, plus); near(interpolateDirection(north, south, 1), south);
  for (const a of [north, plus, { x: 0, y: 1, z: 0 }]) {
    const b = { x: -a.x, y: -a.y, z: -a.z };
    for (let i = 0; i <= 100; i++) assert.ok(Math.abs(Math.hypot(...Object.values(interpolateDirection(a, b, i / 100))) - 1) < 1e-12);
  }
});
test('nearly antipodal directions approach the true endpoint continuously', () => {
  const b = { x: 0.02, y: 0, z: -Math.sqrt(1 - 0.02 ** 2) };
  const p = interpolateDirection(north, b, 1 - 1e-7);
  assert.ok(Math.hypot(p.x - b.x, p.y - b.y, p.z - b.z) < 1e-6);
});
test('first appearance snaps to actual state with no invented transition', () => {
  const v = createVisualTransition(); const r = v.set(plus, 0, 0);
  assert.equal(r.active, false); near(r.point, plus);
});
test('preparation ends exactly at authoritative target after brief feedback', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 1, 1);
  assert.equal(v.sample(1.1).active, true); assert.match(v.sample(1.1).notice, /Illustrative/);
  near(v.sample(1.35).point, plus); assert.equal(v.sample(1.5).active, false);
});
test('a newer measurement interrupts preparation from the currently displayed point', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 1, 1);
  const before = v.sample(1.1).point;
  const next = v.set(south, 2, 1.1, { event: 'measurement' });
  near(next.point, before); assert.equal(next.kind, 'measurement'); near(v.sample(2).point, south);
});
test('stale and repeated revisions cannot restart or retarget an animation', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 2, 1);
  assert.equal(v.set(south, 1, 1.1).accepted, false); assert.equal(v.set(south, 2, 1.2).accepted, false);
  near(v.sample(1.4).point, plus); assert.equal(v.sample(1.4).revision, 2);
});
test('same-target refresh preserves in-flight timing rather than jumping or restarting', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 1, 1);
  const before = v.sample(1.1).point;
  const r = v.set(plus, 2, 1.1, { event: 'navigation' });
  assert.equal(r.active, true); near(r.point, before); near(v.sample(1.35).point, plus);
});
test('hidden/restart state cancels motion and reappearance uses the real target', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 1, 1);
  const r = v.set(north, 2, 1.1, { shown: false, event: 'reset' });
  assert.equal(r.active, false); assert.equal(r.visible, false);
  const shown = v.set(south, 3, 2); assert.equal(shown.active, false); near(shown.point, south);
});
test('reduced motion and instant updates bypass movement without changing final state', () => {
  for (const options of [{ reducedMotion: true }, { duration: 0 }]) {
    const v = createVisualTransition(options); v.set(north, 0, 0); near(v.set(plus, 1, 1).point, plus); assert.equal(v.sample(1).active, false);
  }
  const v = createVisualTransition(); v.set(north, 0, 0); near(v.set(south, 1, 1, { instant: true }).point, south);
});
test('backward timestamps cannot reverse an existing visual transition', () => {
  const v = createVisualTransition(); v.set(north, 0, 0); v.set(plus, 1, 1);
  const r = v.sample(1.2); near(v.sample(1.1).point, r.point); near(v.sample(2).point, plus);
});
test('returned display points cannot mutate the next sample', () => {
  const v = createVisualTransition(); const r = v.set(north, 0, 0); r.point.z = 0;
  near(v.sample(0).point, north);
});
test('invalid inputs fail before replacing the last valid display state', () => {
  const v = createVisualTransition(); v.set(north, 0, 0);
  for (const p of [null, { x: NaN, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }]) assert.throws(() => v.set(p, 1, 1));
  assert.throws(() => v.set(plus, -1, 1)); assert.throws(() => v.set(plus, 1, Infinity));
  assert.throws(() => v.set(plus, 1, 1, { event: 'physics' })); near(v.sample(1).point, north);
});
test('invalid animation configuration is rejected explicitly', () => {
  for (const duration of [-1, 2, NaN, Infinity]) assert.throws(() => createVisualTransition({ duration }));
  assert.throws(() => createVisualTransition({ reducedMotion: 'yes' }));
});
test('native rendering helper matches source and interruption behavior', () => {
  const source = fs.readFileSync(new URL('../src/visual-transition.js', import.meta.url), 'utf8');
  const native = fs.readFileSync(new URL('../native/QuantumARExplorer/Assets/Scripts/QuantumVisual/transition.js', import.meta.url), 'utf8');
  assert.equal(native, '// Generated from src/visual-transition.js; rendering only.\n' +
    source.replaceAll('export function ', 'function ') +
    '\nmodule.exports = { interpolateDirection, createVisualTransition };\n');
  const sandbox = { module: { exports: {} } }; vm.runInNewContext(native, sandbox);
  const a = createVisualTransition(), b = sandbox.module.exports.createVisualTransition();
  for (const v of [a, b]) { v.set(north, 0, 0); v.set(plus, 1, 1); v.set(south, 2, 1.1, { event: 'measurement' }); }
  for (const t of [1.1, 1.2, 1.3, 1.45, 2]) near(a.sample(t).point, b.sample(t).point);
});
