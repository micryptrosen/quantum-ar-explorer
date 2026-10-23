import test from 'node:test';
import assert from 'node:assert/strict';
import { validateState, probabilities, bloch, measure, prepare } from '../src/quantum.js';
import { initialLesson, transition, viewModel } from '../src/lesson.js';
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-12, `${a} != ${b}`);

test('normalized complex-state sweep obeys Born rule and sphere geometry', () => {
  for (let t=0;t<=24;t++) for (let p=0;p<24;p++) {
    const theta=t*Math.PI/24, phi=p*2*Math.PI/24;
    const state={alpha:{re:Math.cos(theta/2),im:0},
      beta:{re:Math.sin(theta/2)*Math.cos(phi),im:Math.sin(theta/2)*Math.sin(phi)}};
    validateState(state);
    const prob=probabilities(state), point=bloch(state);
    near(prob.zero+prob.one,1);
    near(prob.zero, Math.cos(theta/2)**2);
    near(point.x, Math.sin(theta)*Math.cos(phi));
    near(point.y, Math.sin(theta)*Math.sin(phi));
    near(point.z, Math.cos(theta));
    near(point.x**2+point.y**2+point.z**2,1);
    near(prob.zero,(1+point.z)/2);
  }
});
test('measurement sampling threshold implements the stated half-open rule', () => {
  const state=prepare('plus'), threshold=probabilities(state).zero;
  assert.equal(measure(state,()=>threshold-Number.EPSILON).outcome,0);
  assert.equal(measure(state,()=>threshold).outcome,1);
  const before=structuredClone(state);
  measure(state,()=>0.9);
  assert.deepEqual(state,before);
});
test('fresh preparation is needed for independent trials in the actual lesson', () => {
  let state=transition(transition(initialLesson(),{type:'NEXT'}),{type:'NEXT'});
  for (const draw of [0.1,0.9,0.1,0.9]) {
    state=transition(state,{type:'PREPARE',name:'plus'});
    state=transition(state,{type:'MEASURE'},()=>draw);
  }
  assert.deepEqual(state.counts,[2,2]);
  assert.equal(state.trials,4);
  const view=viewModel(state);
  view.qubit.alpha.re=42;
  view.counts[0]=99;
  assert.notDeepEqual(view.qubit,state.qubit);
  assert.deepEqual(state.counts,[2,2]);
});
test('reset clears state and statistics from every reachable lesson stage', () => {
  let state=initialLesson();
  for (let i=0;i<5;i++) {
    assert.deepEqual(transition(state,{type:'RESET'}),initialLesson());
    if(state.stage==='challenge') state=transition(state,{type:'ANSWER',answer:'half-each'});
    state=transition(state,{type:'NEXT'});
  }
});
