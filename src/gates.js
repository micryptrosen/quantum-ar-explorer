// Optional single-qubit laboratory; it owns no beginner-lesson state.
import { validateState, prepare, probabilities, bloch, measure } from './quantum.js';
const clone = s => ({ alpha: { ...s.alpha }, beta: { ...s.beta } });
export function applyGate(state, gate) {
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
export function relativePhase(state) {
  validateState(state);
  if ((state.alpha.re === 0 && state.alpha.im === 0) ||
      (state.beta.re === 0 && state.beta.im === 0)) return null;
  let phi = Math.atan2(state.beta.im, state.beta.re) - Math.atan2(state.alpha.im, state.alpha.re);
  while (phi > Math.PI) phi -= 2 * Math.PI;
  while (phi <= -Math.PI) phi += 2 * Math.PI;
  return phi;
}
export function createGateLab({ random = Math.random } = {}) {
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

// Read-only educational prompts. They never dispatch, sample or alter either lesson.
export function describeGateLab(snapshot) {
  validateState(snapshot.state);
  const p = probabilities(snapshot.state), phase = relativePhase(snapshot.state);
  const near = (a, b) => Math.abs(a - b) < 1e-12;
  const zero = near(p.zero, 1), one = near(p.one, 1);
  const half = near(p.zero, 0.5) && near(p.one, 0.5);
  const history = Array.isArray(snapshot.history) ? snapshot.history : [];
  const reset = history.lastIndexOf('Reset to 0');
  // A truncated history does not establish what state an earlier sequence began in.
  const ops = reset >= 0 ? history.slice(reset + 1) : history.length < 16 ? history : null;
  const route = ops === null ? null : ops.join('|');
  const view = (id, text) => Object.freeze({ id, text });
  if (route === '' && zero && snapshot.result === null)
    return view('start', 'Start at 0. X swaps 0 / 1.\nTry X, then Measure.\nReset Lab starts at 0 again.');
  if (route === 'X gate' && one && snapshot.result === null)
    return view('x-one', 'X changed 0 to 1.\nMeasure, or X again for 0.\nReset Lab, then try H.');
  if (route === 'X gate|X gate' && zero && snapshot.result === null)
    return view('x-zero', 'X twice returned to 0.\nReset Lab, then try H.\nWatch the probabilities.');
  if (route === 'H gate' && half && phase !== null && near(phase, 0))
    return view('h-plus', 'H made equal superposition.\nTry Z. Do 0 / 1 odds change?\nWatch phase and the arrow.');
  if (route === 'H gate|Z gate' && half && phase !== null && near(Math.abs(phase), Math.PI))
    return view('z-phase', 'Phase changed; odds did not.\nTry H again, then Measure.\nPredict the result first.');
  if (route === 'H gate|Z gate|H gate' && one && snapshot.result === null)
    return view('hzh-ready', 'H, Z, H from 0 predicts 1.\nMeasure to test it.\nThen Reset Lab; compare H, H.');
  if (route === 'H gate|H gate' && zero && snapshot.result === null)
    return view('hh-ready', 'H, H from 0 predicts 0.\nMeasure to test it.\nCompare with H, Z, H.');
  if (route === 'H gate|Z gate|H gate|Z measurement: 1' && one && snapshot.result === 1)
    return view('hzh-result', 'Result 1, as predicted.\nReset Lab; try H, H, Measure.\nCompare the two results.');
  if (route === 'H gate|H gate|Z measurement: 0' && zero && snapshot.result === 0)
    return view('hh-result', 'H, H gave 0; H, Z, H gives 1.\nPhase can change a later result.\nReturn lesson keeps progress.');
  if (snapshot.result === 0 || snapshot.result === 1)
    return view('measured', 'Measure again keeps this result.\nReset Lab starts a new test.\nReturn lesson keeps progress.');
  return view('explore', 'X swaps; H mixes; Z shifts phase.\nReset Lab, then compare\nH, Z, H with H, H from 0.');
}
