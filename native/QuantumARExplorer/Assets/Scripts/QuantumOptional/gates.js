// Generated from src/gates.js; optional isolated gate laboratory.
// Optional single-qubit laboratory; it owns no beginner-lesson state.
const { validateState, prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');
const clone = s => ({ alpha: { ...s.alpha }, beta: { ...s.beta } });
function applyGate(state, gate) {
  validateState(state);
  const a = state.alpha, b = state.beta, q = Math.SQRT1_2;
  let out;
  if (gate === 'X') out = { alpha: { ...b }, beta: { ...a } };
  else if (gate === 'Z') out = { alpha: { ...a }, beta: { re: -b.re, im: -b.im } };
  else if (gate === 'H') out = {
    alpha: { re: (a.re + b.re) * q, im: (a.im + b.im) * q },
    beta: { re: (a.re - b.re) * q, im: (a.im - b.im) * q }
  };
  else throw new RangeError('Unknown single-qubit gate');
  // Remove only floating-point norm drift, never relative or global phase.
  const norm = Math.hypot(out.alpha.re, out.alpha.im, out.beta.re, out.beta.im);
  for (const z of [out.alpha, out.beta]) { z.re /= norm; z.im /= norm; }
  validateState(out);
  return out;
}
function relativePhase(state) {
  validateState(state);
  if ((state.alpha.re === 0 && state.alpha.im === 0) ||
      (state.beta.re === 0 && state.beta.im === 0)) return null;
  let phi = Math.atan2(state.beta.im, state.beta.re) - Math.atan2(state.alpha.im, state.alpha.re);
  while (phi > Math.PI) phi -= 2 * Math.PI;
  while (phi <= -Math.PI) phi += 2 * Math.PI;
  return phi;
}
function createGateLab({ random = Math.random } = {}) {
  if (typeof random !== 'function') throw new TypeError('Expected sampler function');
  let state = prepare('zero'), revision = 0, result = null, trials = 0;
  let counts = [0, 0], history = [], lastOperation = 'Reset to 0', busy = false;
  function snapshot() {
    return { state: clone(state), revision, result, trials, counts: [...counts],
      probabilities: probabilities(state), bloch: bloch(state), phaseRadians: relativePhase(state),
      history: [...history], lastOperation };
  }
  const deny = code => ({ ok: false, committed: false, code, ...snapshot() });
  return {
    snapshot,
    dispatch(action, renderedRevision) {
      if (busy) return deny('LAB_BUSY');
      if (!Number.isSafeInteger(renderedRevision) || renderedRevision < 0) return deny('INVALID_REVISION');
      if (renderedRevision !== revision) return deny('STALE_CONTROL');
      if (!['X', 'H', 'Z', 'measure', 'reset'].includes(action)) return deny('INVALID_ACTION');
      if (revision === Number.MAX_SAFE_INTEGER || trials === Number.MAX_SAFE_INTEGER) return deny('LAB_LIMIT');
      busy = true; revision++;
      try {
        if (action === 'reset') {
          state = prepare('zero'); result = null; trials = 0; counts = [0, 0]; history = [];
          lastOperation = 'Reset to 0';
        } else if (action === 'measure') {
          const next = measure(state, random); // Commit only after sampler validation.
          state = next.state; result = next.outcome; trials++; counts[result]++;
          lastOperation = 'Z measurement: ' + result;
        } else {
          state = applyGate(state, action); result = null; lastOperation = action + ' gate';
        }
        history = history.concat(lastOperation).slice(-16);
        return { ok: true, committed: true, ...snapshot() };
      } catch (_) { return deny('INVALID_SAMPLE'); }
      finally { busy = false; }
    }
  };
}

module.exports = { applyGate, relativePhase, createGateLab };
