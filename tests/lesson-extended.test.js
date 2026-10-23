import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLesson, transition as step, attemptTransition, validateLessonState,
  viewModel, HISTORY_LIMIT, MAX_BATCH_TRIALS } from '../src/lesson.js';
import { createSeededRandom } from '../src/random.js';
const at = stage => {
  let state = initialLesson();
  while (state.stage !== stage) state = step(state, { type: 'NEXT' });
  return state;
};

test('back navigation preserves measured scientific state and experiment totals', () => {
  let state = step(step(at('measurement'), { type: 'PREPARE', name: 'plus' }), { type: 'MEASURE' }, () => 0.9);
  const measured = structuredClone(state);
  state = step(step(state, { type: 'BACK' }), { type: 'BACK' });
  assert.equal(state.stage, 'bit');
  assert.deepEqual(state.qubit, measured.qubit);
  assert.deepEqual(state.history, measured.history);
  assert.equal(step(state, { type: 'BACK' }).stage, 'bit');
  assert.deepEqual(step(state, { type: 'RESTART' }), initialLesson());
});
test('fresh and repeated collapsed measurements are counted separately', () => {
  let state = step(at('measurement'), { type: 'PREPARE', name: 'plus' });
  state = step(state, { type: 'MEASURE' }, () => 0.9);
  state = step(state, { type: 'MEASURE' }, () => 0.1);
  assert.deepEqual(state.counts, [0, 2]);
  assert.deepEqual(state.freshCounts.plus, [0, 1]);
  assert.equal(state.history[0].freshPreparation, true);
  assert.equal(state.history[1].freshPreparation, false);
  assert.equal(state.history[1].probabilities.one, 1);
});
test('bounded history drops old rows while lifetime totals remain exact', () => {
  const state = step(at('measurement'), { type: 'RUN_TRIALS', count: HISTORY_LIMIT + 7, name: 'zero' }, () => 0.8);
  assert.equal(state.trials, HISTORY_LIMIT + 7);
  assert.deepEqual(state.counts, [HISTORY_LIMIT + 7, 0]);
  assert.equal(state.history.length, HISTORY_LIMIT);
  assert.equal(state.history[0].id, 8);
  assert.equal(state.history.at(-1).id, HISTORY_LIMIT + 7);
  assert.equal(viewModel(state).historyDropped, 7);
  assert.deepEqual(state.freshCounts.zero, [HISTORY_LIMIT + 7, 0]);
});
test('batch fresh trials are reproducible and equivalent to manual prepare/measure', () => {
  const batch = step(at('measurement'), { type: 'RUN_TRIALS', count: 50, name: 'plus' }, createSeededRandom(42));
  let manual = at('measurement'); const random = createSeededRandom(42);
  for (let i = 0; i < 50; i++) manual = step(step(manual, { type: 'PREPARE', name: 'plus' }), { type: 'MEASURE' }, random);
  assert.deepEqual(batch, manual);
});
test('clear experiment retains lesson position and prepares the selected state again', () => {
  let state = step(at('measurement'), { type: 'RUN_TRIALS', name: 'one', count: 8 }, () => 0);
  state = step(state, { type: 'RESET_EXPERIMENT' });
  assert.equal(state.stage, 'measurement'); assert.equal(state.preparation, 'one');
  assert.equal(state.outcome, null); assert.equal(state.trials, 0);
  assert.deepEqual(state.history, []); assert.deepEqual(state.freshCounts.one, [0, 0]);
  assert.equal(step(state, { type: 'MEASURE' }, () => 0).outcome, 1);
});
test('mid-batch sampler failure rolls back lesson state without hiding the failure', () => {
  const state = at('measurement'), before = structuredClone(state); let calls = 0;
  const result = attemptTransition(state, { type: 'RUN_TRIALS', name: 'plus', count: 4 }, () => ++calls === 3 ? NaN : 0.1);
  assert.equal(result.ok, false); assert.equal(result.error.code, 'SAMPLING_FAILED');
  assert.deepEqual(result.state, before); assert.deepEqual(state, before);
  assert.equal(calls, 3); // External RNG calls are consumed; rollback does not rewind it.
});
test('invalid batches and unavailable actions never consume random draws', () => {
  let calls = 0; const rng = () => { calls++; return 0; };
  for (const count of [0, -1, 1.5, MAX_BATCH_TRIALS + 1, Infinity, '10']) {
    assert.equal(attemptTransition(at('measurement'), { type: 'RUN_TRIALS', name: 'plus', count }, rng).ok, false);
  }
  assert.equal(attemptTransition(initialLesson(), { type: 'MEASURE' }, rng).ok, false);
  assert.equal(attemptTransition(at('measurement'), { type: 'RUN_TRIALS', name: 'unsupported', count: 1 }, rng).ok, false);
  assert.equal(calls, 0);
});
test('challenge gives distinct misconception feedback, retries and completion', () => {
  let state = at('challenge');
  state = step(state, { type: 'ANSWER', answer: 'alternating' });
  assert.match(state.challengeFeedback, /do not have to alternate/);
  assert.equal(attemptTransition(state, { type: 'NEXT' }).error.code, 'CHALLENGE_INCOMPLETE');
  state = step(state, { type: 'ANSWER', answer: 'always-zero' });
  assert.match(state.challengeFeedback, /either result/);
  state = step(state, { type: 'ANSWER', answer: 'half-each' });
  assert.equal(state.challengeAttempts, 3); assert.equal(state.challenge, 'passed');
  state = step(state, { type: 'NEXT' }); assert.equal(state.stage, 'complete');
  assert.equal(step(state, { type: 'NEXT' }).stage, 'complete');
  assert.equal(step(state, { type: 'BACK' }).stage, 'challenge');
});
test('unknown answer is rejected without marking a quiz attempt', () => {
  const state = at('challenge');
  const result = attemptTransition(state, { type: 'ANSWER', answer: 'invented' });
  assert.equal(result.error.code, 'INVALID_ANSWER'); assert.deepEqual(result.state, state);
});
test('corrupt external states fail closed and explicit restart recovers', () => {
  for (const change of [{ stage: 'missing' }, { counts: [1, 0] }, { history: [{}] },
    { challengeAttempts: -1 }, { qubit: { alpha: { re: 2, im: 0 }, beta: { re: 0, im: 0 } } }]) {
    const invalid = { ...initialLesson(), ...change };
    assert.throws(() => validateLessonState(invalid));
    const result = attemptTransition(invalid, { type: 'NEXT' });
    assert.equal(result.state, null); assert.deepEqual(result.error.recoveryAction, { type: 'RESTART' });
    assert.deepEqual(step(invalid, { type: 'RESTART' }), initialLesson());
  }
});
test('physically inconsistent current result or forged history statistics are rejected', () => {
  const state = step(at('measurement'), { type: 'RUN_TRIALS', name: 'plus', count: 2 }, () => 0.9);
  const wrongQubit = structuredClone(state); wrongQubit.qubit = initialLesson().qubit;
  const wrongResult = structuredClone(state); wrongResult.outcome = 0;
  const wrongCounts = structuredClone(state); wrongCounts.counts = [1, 1];
  const wrongFresh = structuredClone(state); wrongFresh.freshCounts.plus = [1, 1];
  for (const invalid of [wrongQubit, wrongResult, wrongCounts, wrongFresh]) assert.throws(() => validateLessonState(invalid));
});
test('views and transition results cannot mutate prior history/counters', () => {
  const original = step(at('measurement'), { type: 'RUN_TRIALS', name: 'plus', count: 2 }, () => 0.1);
  const next = step(original, { type: 'BACK' });
  next.history[0].probabilities.zero = 0; next.freshCounts.plus[0] = 99;
  assert.ok(original.history[0].probabilities.zero > 0.49); assert.equal(original.freshCounts.plus[0], 2);
});
test('seeded injection rejects invalid seeds and returns reproducible bounded draws', () => {
  for (const seed of [-1, 2 ** 32, 0.5, NaN, '42']) assert.throws(() => createSeededRandom(seed));
  const a = createSeededRandom(0), b = createSeededRandom(0);
  for (let i = 0; i < 100; i++) { const v = a(); assert.equal(v, b()); assert.ok(v >= 0 && v < 1); }
});
