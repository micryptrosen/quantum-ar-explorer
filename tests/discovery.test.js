import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparison } from '../src/comparison.js';
import { describeDiscovery } from '../src/discovery.js';
const act = (m, action) => m.dispatch(action, m.snapshot().revision);
const at = step => { const m = createComparison({ random: () => 0.4 }); for (let i = 0; i < Math.min(step, 3); i++) act(m, 'next'); if (step === 4) act(m, 'measure'); return m; };

test('default discovery uses ordinary language and actual computed odds at every step', () => {
  for (let step = 0; step <= 4; step++) {
    const s = at(step).snapshot(), v = describeDiscovery(s);
    assert.ok(!/\b[HZ]\b|matrix|α|β/.test(v.guide + v.title + v.nextLabel));
    assert.ok(v.a.odds.includes(`${Math.round(100 * s.a.probabilities.zero)}%`));
    assert.equal(v.technical, false); assert.ok(Object.isFrozen(v));
  }
});
test('same 50/50 odds remain distinct from later certain predictions', () => {
  for (const step of [1, 2]) {
    const v = describeDiscovery(at(step).snapshot());
    assert.equal(v.equalSuperpositionOdds, true); assert.equal(v.distinctCertainPredictions, false);
    assert.equal(v.measuredConfirmation, false); assert.ok(!v.guide.includes('predicts 1'));
  }
  const v = describeDiscovery(at(3).snapshot());
  assert.equal(v.equalSuperpositionOdds, false); assert.equal(v.distinctCertainPredictions, true);
  assert.equal(v.measuredConfirmation, false); assert.match(v.guide, /A now predicts 1; B predicts 0/);
});
test('measurement confirmation is shown only after actual sampling commits', () => {
  const m = at(3); assert.equal(describeDiscovery(m.snapshot()).measuredConfirmation, false);
  act(m, 'measure'); const v = describeDiscovery(m.snapshot());
  assert.equal(v.measuredConfirmation, true); assert.match(v.guide, /Measured A: 1; B: 0/);
});
test('technical details expose actual complex amplitudes, relative phase and operations', () => {
  const v = describeDiscovery(at(2).snapshot(), { technical: true });
  assert.match(v.a.technical, /α=0.707\+0i  β=-0.707\+0i/);
  assert.match(v.a.technical, /Phase: 1π/); assert.match(v.b.technical, /Phase: 0π/);
  assert.match(v.a.technical, /H → Z/); assert.match(v.b.technical, /H → Wait/);
  assert.match(v.explanation, /not entanglement/);
  const measured = describeDiscovery(at(4).snapshot(), { technical: true });
  assert.match(measured.a.technical, /Phase: undefined/); assert.match(measured.a.status, /Measured: 1/);
});
test('view and detail toggling never sample, revise, or mutate either experiment', () => {
  let draws = 0; const m = createComparison({ random: () => { draws++; return 0.4; } });
  act(m, 'next'); act(m, 'next'); const before = m.snapshot();
  for (let i = 0; i < 10; i++) describeDiscovery(before, { technical: i % 2 === 0 });
  assert.deepEqual(m.snapshot(), before); assert.equal(draws, 0);
});
test('reset and repeated measurements describe the current authoritative state', () => {
  const m = at(4); act(m, 'measure'); assert.equal(describeDiscovery(m.snapshot()).measuredConfirmation, true);
  act(m, 'reset'); const v = describeDiscovery(m.snapshot());
  assert.equal(v.measuredConfirmation, false); assert.equal(v.distinctCertainPredictions, false);
  assert.match(v.a.status, /Next measurement/); assert.match(v.nextLabel, /Prepare/);
});
test('failed second draw cannot be described as a successful observed result', () => {
  let n = 0; const m = createComparison({ random: () => ++n === 1 ? 0.4 : NaN });
  for (let i = 0; i < 3; i++) act(m, 'next');
  assert.equal(act(m, 'measure').ok, false); const v = describeDiscovery(m.snapshot());
  assert.equal(v.measuredConfirmation, false); assert.match(v.a.status, /Next measurement/);
});
test('unexpected state data never receives a canned certainty claim', () => {
  const s = at(3).snapshot(); s.a.probabilities = { zero: 0.5, one: 0.5 };
  const v = describeDiscovery(s); assert.equal(v.distinctCertainPredictions, false);
  assert.ok(!v.guide.includes('predicts 1'));
});
test('equal phases are not described as different, and rounded negative imaginary zero retains its separator', () => {
  const s = at(2).snapshot(); s.a.phaseRadians = s.b.phaseRadians;
  s.a.state.alpha.im = -1e-14;
  const v = describeDiscovery(s, { technical: true });
  assert.equal(v.distinctPhase, false); assert.ok(!v.guide.includes('Different arrow'));
  assert.equal(v.title, 'Compare current states'); assert.match(v.a.technical, /α=0.707\+0i/);
});
test('invalid snapshot fields fail closed before presenting results', () => {
  for (const s of [null, {}, { step: -1 }, { step: 5 }]) assert.throws(() => describeDiscovery(s));
  for (const change of [s => s.a.probabilities.zero = NaN, s => s.b.probabilities.one = 2,
    s => s.a.result = 7, s => s.a.phaseRadians = Infinity, s => s.b.state.alpha.re = NaN]) {
    const s = at(2).snapshot(); change(s); assert.throws(() => describeDiscovery(s));
  }
});
