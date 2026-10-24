import test from 'node:test';
import assert from 'node:assert/strict';
import { createGateLab, describeGateLab } from '../src/gates.js';
import { prepare, probabilities } from '../src/quantum.js';

function experiment(actions) {
  const lab = createGateLab({ random: () => 0.7 });
  for (const action of actions) {
    assert.equal(lab.dispatch(action, lab.snapshot().revision).ok, true);
  }
  return lab;
}

test('initial prompt explains X and reset without an extra control or sample', () => {
  let draws = 0;
  const lab = createGateLab({ random: () => { draws++; return 0.5; } });
  const before = lab.snapshot();
  assert.match(describeGateLab(before).text, /X swaps 0 \/ 1/);
  assert.match(describeGateLab(before).text, /Reset Lab/);
  assert.deepEqual(lab.snapshot(), before);
  assert.equal(draws, 0);
});

test('X from 0 explains the observed certain 1 and reversal', () => {
  const state = experiment(['X']).snapshot();
  assert.equal(state.probabilities.one, 1);
  assert.match(describeGateLab(state).text, /X changed 0 to 1/);
  assert.match(describeGateLab(state).text, /X again for 0/);
});

test('two X operations explain the return to basis 0', () => {
  const state = experiment(['X', 'X']).snapshot();
  assert.equal(state.probabilities.zero, 1);
  assert.match(describeGateLab(state).text, /twice returned to 0/);
});

test('H from 0 introduces a prediction about phase and Z odds', () => {
  const state = experiment(['H']).snapshot();
  assert.ok(Math.abs(state.probabilities.zero - 0.5) < 1e-12);
  assert.equal(state.phaseRadians, 0);
  assert.match(describeGateLab(state).text, /equal superposition/);
  assert.match(describeGateLab(state).text, /Do 0 \/ 1 odds change/);
});

test('H then Z explains changed phase with unchanged immediate odds', () => {
  const first = experiment(['H']).snapshot();
  const second = experiment(['H', 'Z']).snapshot();
  assert.deepEqual(first.probabilities, second.probabilities);
  assert.equal(second.phaseRadians, Math.PI);
  assert.match(describeGateLab(second).text, /Phase changed; odds did not/);
  assert.match(describeGateLab(second).text, /Predict the result first/);
});

test('H-Z-H predicts 1 before it is measured', () => {
  const state = experiment(['H', 'Z', 'H']).snapshot();
  assert.equal(state.result, null);
  assert.equal(state.probabilities.one, 1);
  assert.match(describeGateLab(state).text, /predicts 1/);
  assert.match(describeGateLab(state).text, /Reset Lab; compare H, H/);
});

test('H-H predicts 0 before it is measured', () => {
  const state = experiment(['H', 'H']).snapshot();
  assert.equal(state.result, null);
  assert.equal(state.probabilities.zero, 1);
  assert.match(describeGateLab(state).text, /predicts 0/);
});

test('actual H-Z-H result guides a reset before the comparison', () => {
  const state = experiment(['H', 'Z', 'H', 'measure']).snapshot();
  assert.equal(state.result, 1);
  assert.match(describeGateLab(state).text, /Result 1, as predicted/);
  assert.match(describeGateLab(state).text, /Reset Lab; try H, H, Measure/);
});

test('actual H-H result explains the contrast and safe lesson return', () => {
  const state = experiment(['H', 'H', 'measure']).snapshot();
  assert.equal(state.result, 0);
  assert.match(describeGateLab(state).text, /Phase can change a later result/);
  assert.match(describeGateLab(state).text, /Return lesson keeps progress/);
});

test('arbitrary measurement feedback describes repeat and fresh preparation', () => {
  const state = experiment(['X', 'measure']).snapshot();
  assert.equal(state.result, 1);
  assert.match(describeGateLab(state).text, /Measure again keeps this result/);
  assert.match(describeGateLab(state).text, /Reset Lab starts a new test/);
});

test('truncated history never implies that a suffix began from 0', () => {
  const lab = experiment(Array(25).fill('X').concat(['H', 'H']));
  const state = lab.snapshot();
  assert.equal(state.history.length, 16);
  assert.equal(state.probabilities.one, 1);
  assert.doesNotMatch(describeGateLab(state).text, /predicts 0|returned to 0/);
  assert.match(describeGateLab(state).text, /Reset Lab/);
});

test('prompt classification uses actual complex state instead of stale probability fields', () => {
  const state = experiment(['H']).snapshot();
  const complex = prepare('plusI');
  const model = { ...state, state: complex, probabilities: { zero: 1, one: 0 } };
  assert.ok(Math.abs(probabilities(complex).zero - 0.5) < 1e-12);
  assert.doesNotMatch(describeGateLab(model).text, /H made equal superposition|predicts 1|predicts 0/);
  assert.match(describeGateLab(model).text, /Reset Lab/);
});

test('reset discards earlier guidance and starts the new experiment honestly', () => {
  const lab = experiment(['H', 'Z', 'H', 'measure', 'reset']);
  const state = lab.snapshot();
  assert.equal(state.result, null);
  assert.equal(state.trials, 0);
  assert.match(describeGateLab(state).text, /Start at 0/);
});

test('view derivation accepts frozen input and cannot mutate science or history', () => {
  const state = experiment(['H', 'Z']).snapshot();
  const freeze = value => {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const before = JSON.stringify(state);
  const guide = describeGateLab(freeze(state));
  assert.equal(JSON.stringify(state), before);
  assert.ok(Object.isFrozen(guide));
  assert.throws(() => { guide.text = 'changed'; }, TypeError);
});
