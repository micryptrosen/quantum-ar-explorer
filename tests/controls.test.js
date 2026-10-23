import test from 'node:test';
import assert from 'node:assert/strict';
import { createLessonControls } from '../src/controls.js';

const press = (controls, id) => controls.activate(id, controls.getPresentation().revision);

test('queued old Next callbacks cannot skip a teaching stage', () => {
  const controls = createLessonControls();
  const frame = controls.getPresentation();
  assert.equal(controls.activate('next', frame.revision).ok, true);
  assert.equal(controls.getState().stage, 'qubit');
  assert.equal(controls.activate('next', frame.revision).error.code, 'STALE_CONTROL');
  assert.equal(controls.getState().stage, 'qubit');
  assert.equal(press(controls, 'next').ok, true);
  assert.equal(controls.getState().stage, 'measurement');
});

test('unknown, disabled and malformed controls preserve state without sampling', () => {
  let draws = 0;
  const controls = createLessonControls({ random: () => { draws++; return 0.1; } });
  const before = controls.getState(), revision = controls.getPresentation().revision;
  for (const id of ['back', 'measure', '__proto__', 'missing']) {
    assert.equal(controls.activate(id, revision).error.code, 'CONTROL_UNAVAILABLE');
  }
  for (const [id, token] of [[{}, revision], ['', revision], ['next', NaN], ['next', -1], ['next', '0']]) {
    assert.equal(controls.activate(id, token).error.code, 'INVALID_CONTROL');
  }
  assert.equal(controls.getPresentation().revision, revision);
  assert.deepEqual(controls.getState(), before);
  assert.equal(draws, 0);
});

test('duplicate measurement callback and display recovery never resample', () => {
  let broken = false, draws = 0;
  const controls = createLessonControls({ random: () => { draws++; return 0.9; },
    render: () => { if (broken) throw new Error('display failed'); } });
  press(controls, 'next'); press(controls, 'next'); press(controls, 'prepare-plus');
  const oldFrame = controls.getPresentation(); broken = true;
  const result = controls.activate('measure', oldFrame.revision);
  assert.equal(result.ok, false); assert.equal(result.committed, true);
  assert.equal(result.recovery, 'refresh');
  assert.equal(controls.activate('measure', oldFrame.revision).error.code, 'STALE_CONTROL');
  broken = false; assert.equal(controls.refresh().ok, true);
  assert.equal(draws, 1); assert.equal(controls.getState().trials, 1);
  assert.equal(controls.getState().outcome, 1);
});

test('input loss disables targets and invalidates pending callbacks through recovery', () => {
  const controls = createLessonControls();
  const before = controls.getState(), oldFrame = controls.getPresentation();
  assert.equal(controls.setInputAvailable(false).ok, true);
  let frame = controls.getPresentation();
  assert.ok(frame.controls.every(item => !item.enabled && item.disabledReason));
  assert.deepEqual(frame.focusOrder, []);
  assert.equal(controls.activate('next', oldFrame.revision).error.code, 'STALE_CONTROL');
  assert.equal(controls.activate('next', frame.revision).error.code, 'INPUT_UNAVAILABLE');
  assert.equal(controls.setInputAvailable(true).ok, true);
  assert.equal(controls.activate('next', frame.revision).error.code, 'STALE_CONTROL');
  frame = controls.getPresentation();
  assert.ok(frame.focusOrder.includes('next')); assert.ok(!frame.focusOrder.includes('back'));
  assert.deepEqual(controls.getState(), before);
  assert.equal(press(controls, 'next').ok, true);
});

test('all lesson controls reach feedback, completion and a cleared restart', () => {
  const controls = createLessonControls({ random: () => 0.1 });
  for (const id of ['toggle-bit', 'next', 'prepare-plus', 'next', 'fresh-plus-ten', 'next', 'answer-alternating']) {
    assert.equal(press(controls, id).ok, true, id);
  }
  assert.equal(controls.getState().trials, 10);
  assert.match(controls.getPresentation().challenge.feedback, /do not have to alternate/);
  assert.equal(press(controls, 'next').error.code, 'CONTROL_UNAVAILABLE');
  press(controls, 'answer-half-each'); press(controls, 'next');
  assert.equal(controls.getPresentation().progress.complete, true);
  const finalRevision = controls.getPresentation().revision;
  press(controls, 'restart');
  assert.equal(controls.getState().stage, 'bit'); assert.equal(controls.getState().trials, 0);
  assert.equal(controls.activate('restart', finalRevision).error.code, 'STALE_CONTROL');
});

test('renderer reentrancy cannot advance or change input during an action', () => {
  let controls, nested, availability;
  controls = createLessonControls({ render: model => {
    nested = controls.activate('next', model.revision);
    availability = controls.setInputAvailable(false);
  } });
  press(controls, 'next');
  assert.equal(nested.error.code, 'CONTROLS_BUSY');
  assert.equal(availability.error.code, 'CONTROLS_BUSY');
  assert.equal(controls.getState().stage, 'qubit');
  assert.equal(controls.getPresentation().inputAvailable, true);
});

test('control constructor and availability reject invalid host configuration', () => {
  assert.throws(() => createLessonControls({ render: true }), /renderer/);
  assert.throws(() => createLessonControls({ random: 1 }));
  const controls = createLessonControls(), before = controls.getPresentation();
  assert.equal(controls.setInputAvailable('false').error.code, 'INVALID_INPUT_STATE');
  assert.deepEqual(controls.getPresentation(), before);
});
