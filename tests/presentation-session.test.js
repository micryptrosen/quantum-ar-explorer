import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLesson, transition } from '../src/lesson.js';
import { presentationModel } from '../src/presentation.js';
import { createLessonSession } from '../src/session.js';
import { createFocusActivation } from '../src/focus.js';

test('presentation supports text/focus without depending on color, audio or animation', () => {
  const vm = presentationModel(initialLesson());
  assert.equal(vm.progress.step, 1); assert.equal(vm.progress.total, 3);
  assert.equal(vm.accessibility.reducedMotion, true);
  assert.equal(vm.accessibility.informationRequiresColor, false);
  assert.equal(vm.accessibility.informationRequiresAudio, false);
  assert.equal(vm.accessibility.timedChallenge, false);
  assert.ok(!vm.focusOrder.includes('back'));
  assert.ok(vm.controls.every(c => c.label && c.accessibleName && c.action.type));
  assert.equal(new Set(vm.controls.map(c => c.id)).size, vm.controls.length);
});
test('sphere positions and probability text reflect current state and collapse', () => {
  let state = transition(initialLesson(), { type: 'NEXT' });
  state = transition(state, { type: 'PREPARE', name: 'plus' });
  let model = presentationModel(state);
  assert.ok(Math.abs(model.visual.sphere.arrow.to.x - 1) < 1e-12);
  assert.equal(model.measurement.probabilityText, '50% chance of 0; 50% chance of 1');
  state = transition(transition(state, { type: 'NEXT' }), { type: 'MEASURE' }, () => 0.9);
  model = presentationModel(state);
  assert.equal(model.visual.sphere.arrow.to.z, -1);
  assert.equal(model.measurement.collapsed, true);
  assert.equal(model.measurement.probabilityText, '0% chance of 0; 100% chance of 1');
  assert.ok(Math.abs(model.measurement.freshPreparationProbabilities.zero - 0.5) < 1e-12);
  assert.match(model.measurement.repeatHint, /Prepare again/);
  assert.equal(model.experiment.freshPlusTrials, 1);
});
test('challenge navigation and focus order agree with reducer gates', () => {
  let state = initialLesson(); for (let i = 0; i < 3; i++) state = transition(state, { type: 'NEXT' });
  let vm = presentationModel(state); assert.ok(!vm.focusOrder.includes('next'));
  assert.ok(vm.controls.find(c => c.id === 'next').disabledReason);
  state = transition(state, { type: 'ANSWER', answer: 'half-each' });
  vm = presentationModel(state); assert.ok(vm.focusOrder.includes('next'));
  assert.match(vm.accessibility.announcement.text, /Correct/);
});
test('announcements identify bit changes and avoid stale quiz feedback on back', () => {
  let state = initialLesson(); const first = presentationModel(state).accessibility.announcement;
  state = transition(state, { type: 'TOGGLE_BIT' });
  const second = presentationModel(state).accessibility.announcement;
  assert.notEqual(first.key, second.key); assert.equal(second.text, 'Classical bit: 1.');
  for (let i = 0; i < 3; i++) state = transition(state, { type: 'NEXT' });
  state = transition(state, { type: 'ANSWER', answer: 'half-each' });
  state = transition(state, { type: 'BACK' });
  assert.ok(!presentationModel(state).accessibility.announcement.text.includes('Correct'));
});
test('session rejects invalid actions without consuming RNG or changing state', () => {
  let calls = 0; const session = createLessonSession({ random: () => { calls++; return 0; } });
  const result = session.dispatch({ type: 'MEASURE' });
  assert.equal(result.ok, false); assert.equal(result.committed, false);
  assert.equal(calls, 0); assert.deepEqual(session.getState(), initialLesson());
  assert.equal(session.getPresentation().error.code, 'ACTION_UNAVAILABLE');
  session.dispatch({ type: 'NEXT' }); assert.equal(session.getPresentation().error, null);
});
test('render failure preserves a committed measurement; refresh never resamples', () => {
  let broken = false, draws = 0, paintedError;
  const session = createLessonSession({ random: () => { draws++; return 0.9; }, render: vm => { paintedError = vm.error; if (broken) throw Error('private renderer detail'); } });
  session.dispatch({ type: 'NEXT' }); session.dispatch({ type: 'NEXT' });
  session.dispatch({ type: 'PREPARE', name: 'plus' }); broken = true;
  const result = session.dispatch({ type: 'MEASURE' });
  assert.equal(result.ok, false); assert.equal(result.committed, true); assert.equal(result.recovery, 'refresh');
  assert.equal(result.error.code, 'RENDER_FAILED'); assert.ok(!JSON.stringify(result).includes('private renderer detail'));
  assert.equal(session.getState().trials, 1); broken = false;
  assert.equal(session.refresh().ok, true); assert.equal(draws, 1); assert.equal(session.getState().trials, 1);
  assert.equal(paintedError, null); assert.equal(session.getPresentation().error, null);
});
test('reentrant render dispatch is denied and snapshots are isolated', () => {
  let session, nested;
  session = createLessonSession({ render: vm => { nested = session.dispatch({ type: 'NEXT' }); vm.experiment.counts[0] = 99; } });
  session.dispatch({ type: 'NEXT' });
  assert.equal(nested.error.code, 'SESSION_BUSY'); assert.equal(session.getState().stage, 'qubit');
  const state = session.getState(); state.qubit.alpha.re = 42;
  assert.equal(session.getState().qubit.alpha.re, 1); assert.deepEqual(session.getState().counts, [0, 0]);
});
test('session can run all teaching stages, retry, finish and restart', () => {
  const session = createLessonSession({ random: () => 0.1 });
  session.dispatch({ type: 'TOGGLE_BIT' }); session.dispatch({ type: 'NEXT' });
  session.dispatch({ type: 'PREPARE', name: 'plus' }); session.dispatch({ type: 'NEXT' });
  session.dispatch({ type: 'RUN_TRIALS', name: 'plus', count: 10 });
  assert.equal(session.getPresentation().experiment.freshPlusTrials, 10);
  session.dispatch({ type: 'NEXT' }); session.dispatch({ type: 'ANSWER', answer: 'alternating' });
  assert.equal(session.dispatch({ type: 'NEXT' }).ok, false);
  session.dispatch({ type: 'ANSWER', answer: 'half-each' }); session.dispatch({ type: 'NEXT' });
  assert.equal(session.getPresentation().progress.complete, true);
  session.dispatch({ type: 'RESTART' }); assert.deepEqual(session.getState(), initialLesson());
});
test('focus policy cancels, fires once while held, and rearms only on a new cycle', () => {
  const fired = [], focus = createFocusActivation({ dwellMs: 100, onActivate: id => fired.push(id) });
  assert.equal(focus.update('measure', 0).progress, 0);
  assert.equal(focus.update('measure', 99).activated, false);
  focus.update(null, 99); focus.update('measure', 100);
  assert.equal(focus.update('measure', 200).activated, true);
  assert.equal(focus.update('measure', 1000).activated, false);
  focus.cancel(); focus.update('measure', 1001); focus.update('measure', 1101);
  assert.deepEqual(fired, ['measure', 'measure']);
});
test('focus callback failure stays latched and invalid time never activates', () => {
  let calls = 0; const focus = createFocusActivation({ dwellMs: 10, onActivate: () => { calls++; throw Error('host failure'); } });
  focus.update('next', 0); assert.throws(() => focus.update('next', 10));
  assert.equal(focus.update('next', 11).activated, false); assert.equal(calls, 1);
  for (const time of [-1, NaN, 9]) assert.throws(() => focus.update('next', time));
  assert.throws(() => focus.update('', 12)); assert.equal(calls, 1);
});
test('public constructors reject unsupported host configuration', () => {
  assert.throws(() => createLessonSession({ random: 1 }));
  assert.throws(() => createLessonSession({ render: null }));
  assert.throws(() => presentationModel(initialLesson(), { reducedMotion: 'yes' }));
  for (const dwellMs of [0, -1, Infinity, 60001]) assert.throws(() => createFocusActivation({ dwellMs, onActivate: () => {} }));
});
