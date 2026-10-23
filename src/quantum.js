// Pure single-qubit model. No Lens APIs, rendering, networking, or dependencies.
// Complex amplitudes are { re, im }; the computational basis is the Z basis.
const EPSILON = 1e-12;
const magnitude2 = ({ re, im }) => re * re + im * im;

export function validateState(state) {
  if (!state || !['alpha', 'beta'].every(key =>
    state[key] && Number.isFinite(state[key].re) && Number.isFinite(state[key].im))) {
    throw new TypeError('Expected two finite complex amplitudes');
  }
  if (Math.abs(magnitude2(state.alpha) + magnitude2(state.beta) - 1) > EPSILON) {
    throw new RangeError('State must be normalized');
  }
  return state;
}

export function prepare(name) {
  const q = Math.SQRT1_2;
  const states = {
    zero: [1, 0, 0, 0], one: [0, 0, 1, 0],
    plus: [q, 0, q, 0], minus: [q, 0, -q, 0],
    plusI: [q, 0, 0, q]
  };
  if (!Object.prototype.hasOwnProperty.call(states, name)) throw new RangeError('Unknown preparation');
  const [ar, ai, br, bi] = states[name];
  return { alpha: { re: ar, im: ai }, beta: { re: br, im: bi } };
}

export function probabilities(state) {
  validateState(state);
  const p0 = Math.min(1, Math.max(0, magnitude2(state.alpha)));
  return { zero: p0, one: 1 - p0 };
}

export function bloch(state) {
  validateState(state);
  const { alpha: a, beta: b } = state;
  return {
    x: 2 * (a.re * b.re + a.im * b.im),
    y: 2 * (a.re * b.im - a.im * b.re),
    z: magnitude2(a) - magnitude2(b)
  };
}

export function measure(state, random = Math.random) {
  const p = probabilities(state);
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) {
    throw new RangeError('Random draw must be in [0, 1)');
  }
  const outcome = draw < p.zero ? 0 : 1;
  return { outcome, state: prepare(outcome === 0 ? 'zero' : 'one') };
}
