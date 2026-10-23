import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLesson, transition as step, viewModel } from '../src/lesson.js';
test('full learning flow, retry, completion and reset', () => {
  let state = initialLesson();
  const old = structuredClone(state);
  state = step(state, {type:'TOGGLE_BIT'});
  assert.equal(state.bit, 1);
  assert.deepEqual(old, initialLesson());
  state = step(state, {type:'NEXT'});
  state = step(state, {type:'PREPARE',name:'plus'});
  assert.ok(Math.abs(viewModel(state).bloch.x - 1) < 1e-12);
  state = step(state, {type:'NEXT'});
  state = step(state, {type:'MEASURE'}, () => 0.9);
  state = step(state, {type:'MEASURE'}, () => 0.1);
  assert.deepEqual(state.counts, [0,2]);
  state = step(state, {type:'PREPARE',name:'zero'});
  assert.equal(state.outcome, null);
  state = step(state, {type:'MEASURE'}, () => 0.9);
  assert.deepEqual(state.counts, [1,2]);
  state = step(state, {type:'NEXT'});
  state = step(state, {type:'ANSWER',answer:'always-zero'});
  assert.equal(state.challenge, 'retry');
  assert.throws(() => step(state, {type:'NEXT'}));
  state = step(state, {type:'ANSWER',answer:'half-each'});
  state = step(state, {type:'NEXT'});
  assert.equal(state.stage, 'complete');
  assert.deepEqual(step(state, {type:'RESET'}), initialLesson());
});
test('out-of-stage and unsupported actions are rejected without mutation', () => {
  const state = initialLesson();
  for (const action of [{type:'MEASURE'},{type:'PREPARE',name:'plus'},
    {type:'ANSWER',answer:'half-each'},{type:'UNKNOWN'},null]) {
    assert.throws(() => step(state, action));
    assert.deepEqual(state, initialLesson());
  }
  assert.throws(() => step(step(state,{type:'NEXT'}),{type:'PREPARE',name:'minus'}));
});
