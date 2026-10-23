// Generated from src/session.js by tools/build-lens-core.mjs. Do not edit.
'use strict';
const { initialLesson, snapshotLesson, attemptTransition } = require('./lesson.js');
const { presentationModel } = require('./presentation.js');

// A host supplies a renderer and optional deterministic sampler. No Snap APIs assumed.
function createLessonSession({ random = Math.random, render = () => {}, reducedMotion = true } = {}) {
  if (typeof random !== 'function' || typeof render !== 'function' || typeof reducedMotion !== 'boolean') {
    throw new TypeError('Expected sampler/renderer functions and a boolean motion preference');
  }
  let state = initialLesson(), busy = false, lastError = null;
  const model = () => presentationModel(state, { reducedMotion, error: lastError });
  const snapshot = () => snapshotLesson(state);
  const busyResult = () => ({ ok: false, committed: false, state: snapshot(),
    error: { code: 'SESSION_BUSY', message: 'Wait for the current action to finish.' } });
  function paint(committed, actionOk) {
    try { render(model()); }
    catch {
      lastError = { code: 'RENDER_FAILED', message: 'Display update failed. Refresh the display; do not repeat the last measurement.' };
      return { ok: false, committed, state: snapshot(), error: { ...lastError }, recovery: 'refresh' };
    }
    return { ok: actionOk, committed, state: snapshot(), error: lastError ? { ...lastError } : null };
  }
  return {
    getState: snapshot,
    getPresentation: model,
    dispatch(action) {
      if (busy) return busyResult();
      busy = true;
      try {
        const result = attemptTransition(state, action, random);
        if (result.ok) state = result.state;
        lastError = result.error;
        return paint(result.ok, result.ok);
      } finally { busy = false; }
    },
    refresh() {
      if (busy) return busyResult();
      busy = true;
      try {
        lastError = null;
        return paint(false, true);
      } finally { busy = false; }
    }
  };
}
module.exports = { createLessonSession };
