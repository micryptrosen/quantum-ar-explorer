import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparison, describeComparison } from '../src/comparison.js';
import { createGateLab } from '../src/gates.js';
import { prepare, validateState } from '../src/quantum.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);
const stateClose = (a, b) => {
  for (const basis of ['alpha', 'beta']) for (const part of ['re', 'im']) close(a[basis][part], b[basis][part]);
};
const act = (model, action) => model.dispatch(action, model.snapshot().revision);
const ready = model => { for (let i = 0; i < 3; i++) assert.equal(act(model, 'next').ok, true); };

test('comparison instruments begin in equivalent but independent zero states', () => {
  const model = createComparison(), first = model.snapshot();
  assert.equal(first.step, 0); assert.equal(first.trials, 0);
  stateClose(first.a.state, prepare('zero')); stateClose(first.b.state, prepare('zero'));
  assert.notEqual(first.a.state, first.b.state);
  first.a.state.alpha.re = 0; first.b.counts[0] = 100;
  stateClose(model.snapshot().a.state, prepare('zero'));
  assert.deepEqual(model.snapshot().b.counts, [0, 0]);
});

test('both H operations produce analytical plus states and positive X directions', () => {
  const model = createComparison(), out = act(model, 'next');
  for (const instrument of [out.a, out.b]) {
    stateClose(instrument.state, prepare('plus'));
    close(instrument.probabilities.zero, 0.5); close(instrument.probabilities.one, 0.5);
    close(instrument.phaseRadians, 0); close(instrument.bloch.x, 1); close(instrument.bloch.z, 0);
  }
});

test('Z on A changes relative phase and arrow, while B waits with the same immediate odds', () => {
  const model = createComparison(); act(model, 'next'); const out = act(model, 'next');
  stateClose(out.a.state, prepare('minus')); stateClose(out.b.state, prepare('plus'));
  close(out.a.phaseRadians, Math.PI); close(out.b.phaseRadians, 0);
  close(out.a.probabilities.zero, out.b.probabilities.zero);
  close(out.a.bloch.x, -1); close(out.b.bloch.x, 1);
  assert.deepEqual(out.a.history, ['H', 'Z']); assert.deepEqual(out.b.history, ['H', 'Wait']);
  assert.equal(out.presentation.id, 'different-phase');
});

test('final H operations produce analytical A=one and B=zero before sampling', () => {
  let draws = 0; const model = createComparison({ random: () => { draws++; return 0.4; } }); ready(model);
  const out = model.snapshot(); assert.equal(draws, 0);
  stateClose(out.a.state, prepare('one')); stateClose(out.b.state, prepare('zero'));
  close(out.a.probabilities.one, 1); close(out.b.probabilities.zero, 1);
  assert.equal(out.a.phaseRadians, null); assert.equal(out.b.phaseRadians, null);
  assert.equal(out.a.result, null); assert.equal(out.b.result, null);
});

test('normal authoritative measurements confirm final predictions across the full draw interval', () => {
  for (const draw of [0, 0.1, 0.5, 0.9999999999999999]) {
    let draws = 0;
    const model = createComparison({ random: () => { draws++; return draw; } }); ready(model);
    const out = act(model, 'measure');
    assert.equal(out.ok, true); assert.equal(draws, 2);
    assert.equal(out.a.result, 1); assert.equal(out.b.result, 0);
    assert.deepEqual(out.a.counts, [0, 1]); assert.deepEqual(out.b.counts, [1, 0]);
    assert.equal(out.trials, 1); assert.equal(out.step, 4);
  }
});

test('repeat measurements preserve collapsed states and separate correct counts', () => {
  const model = createComparison({ random: () => 0.4 }); ready(model);
  for (let i = 1; i <= 20; i++) {
    const out = act(model, 'measure'); assert.equal(out.trials, i);
    assert.deepEqual(out.a.counts, [0, i]); assert.deepEqual(out.b.counts, [i, 0]);
    validateState(out.a.state); validateState(out.b.state);
    assert.ok(out.a.history.length <= 16 && out.b.history.length <= 16);
  }
});

test('invalid actions, early measurements and invalid revisions leave both states unchanged', () => {
  let draws = 0; const model = createComparison({ random: () => { draws++; return 0; } });
  const before = model.snapshot();
  for (const [action, revision, code] of [['measure', 0, 'INVALID_STEP'], ['other', 0, 'INVALID_ACTION'],
    ['next', -1, 'INVALID_REVISION'], ['next', 0.5, 'INVALID_REVISION'], ['next', NaN, 'INVALID_REVISION']]) {
    assert.equal(model.dispatch(action, revision).code, code); assert.deepEqual(model.snapshot(), before);
  }
  assert.equal(draws, 0);
});

test('stale callbacks after a step or reset cannot apply extra gates or sample', () => {
  let draws = 0; const model = createComparison({ random: () => { draws++; return 0.2; } });
  act(model, 'next'); const before = model.snapshot();
  assert.equal(model.dispatch('next', 0).code, 'STALE_CONTROL'); assert.deepEqual(model.snapshot(), before);
  act(model, 'reset'); const reset = model.snapshot();
  assert.equal(model.dispatch('next', 1).code, 'STALE_CONTROL'); assert.deepEqual(model.snapshot(), reset);
  assert.equal(draws, 0);
});

test('a bad second measurement draw rolls back BOTH states, results and counters', () => {
  let calls = 0; const model = createComparison({ random: () => ++calls === 1 ? 0.3 : Infinity }); ready(model);
  const before = model.snapshot(), out = act(model, 'measure');
  assert.equal(out.code, 'INVALID_SAMPLE'); assert.equal(out.ok, false); assert.equal(out.committed, false);
  assert.deepEqual(out.a, before.a); assert.deepEqual(out.b, before.b);
  assert.equal(out.step, before.step); assert.equal(out.trials, 0); assert.equal(out.revision, before.revision + 1);
  assert.equal(act(model, 'reset').ok, true);
});

test('nonfinite, out-of-range and throwing samplers fail closed', () => {
  for (const sample of [() => NaN, () => -0.1, () => 1, () => { throw Error('unavailable'); }]) {
    const model = createComparison({ random: sample }); ready(model); const before = model.snapshot();
    const out = act(model, 'measure'); assert.equal(out.code, 'INVALID_SAMPLE');
    assert.deepEqual(out.a, before.a); assert.deepEqual(out.b, before.b); assert.equal(out.trials, 0);
  }
});

test('reentrant sampler callbacks cannot advance or reset comparison during a transaction', () => {
  const nested = []; let model;
  model = createComparison({ random: () => { nested.push(act(model, 'reset')); return 0.5; } }); ready(model);
  const out = act(model, 'measure'); assert.equal(out.ok, true);
  assert.equal(nested.length, 2); assert.ok(nested.every(r => r.code === 'COMPARISON_BUSY'));
  assert.equal(out.step, 4); assert.equal(out.trials, 1);
});

test('reset clears both experiments while preserving monotonically increasing stale-event revision', () => {
  const model = createComparison({ random: () => 0.2 }); ready(model); act(model, 'measure');
  const revision = model.snapshot().revision, out = act(model, 'reset');
  assert.equal(out.revision, revision + 1); assert.equal(out.step, 0); assert.equal(out.trials, 0);
  for (const instrument of [out.a, out.b]) {
    stateClose(instrument.state, prepare('zero')); assert.equal(instrument.result, null);
    assert.deepEqual(instrument.counts, [0, 0]); assert.deepEqual(instrument.history, []);
  }
});

test('comparison never mutates a separately active laboratory or another comparison', () => {
  const lab = createGateLab({ random: () => 0.3 }); lab.dispatch('H', 0); lab.dispatch('measure', 1);
  const before = lab.snapshot(), other = createComparison(), otherBefore = other.snapshot();
  const model = createComparison({ random: () => 0.3 }); ready(model); act(model, 'measure'); act(model, 'reset');
  assert.deepEqual(lab.snapshot(), before); assert.deepEqual(other.snapshot(), otherBefore);
});

test('comparison guidance has a clear next action and terminates at measured completion', () => {
  for (let step = 0; step <= 4; step++) {
    const view = describeComparison(step); assert.equal(Object.isFrozen(view), true);
    assert.ok(view.text.length > 20 && view.text.length < 160);
    assert.equal(view.nextAction, step < 3 ? 'next' : step === 3 ? 'measure' : null);
  }
  for (const step of [-1, 5, NaN, 1.1]) assert.throws(() => describeComparison(step));
  assert.throws(() => createComparison({ random: null }));
});
