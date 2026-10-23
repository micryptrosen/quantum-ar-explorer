// Generated from src/focus.js by tools/build-lens-core.mjs. Do not edit.
'use strict';
// Logical focus/dwell policy only. A verified native input adapter must supply IDs/time.
function createFocusActivation({ dwellMs = 1200, onActivate } = {}) {
  if (!Number.isFinite(dwellMs) || dwellMs <= 0 || dwellMs > 60000 || typeof onActivate !== 'function') {
    throw new TypeError('Expected a bounded dwell duration and activation callback');
  }
  let target = null, entered = 0, fired = false, lastTime = -Infinity;
  return {
    cancel() { target = null; entered = 0; fired = false; },
    update(nextTarget, nowMs) {
      if ((nextTarget !== null && (typeof nextTarget !== 'string' || !nextTarget.length)) ||
        !Number.isFinite(nowMs) || nowMs < 0 || nowMs < lastTime) {
        throw new RangeError('Expected a target ID/null and monotonic nonnegative milliseconds');
      }
      lastTime = nowMs;
      if (nextTarget !== target) { target = nextTarget; entered = nowMs; fired = false; }
      const progress = target === null ? 0 : Math.min(1, (nowMs - entered) / dwellMs);
      let activated = false;
      if (target !== null && !fired && progress >= 1) {
        // Latch before the callback: an exception or reentrant callback cannot double fire.
        fired = true; activated = true; onActivate(target);
      }
      return { target, progress, activated, latched: fired };
    }
  };
}
module.exports = { createFocusActivation };
