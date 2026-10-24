// Generated from src/comparison.js; independent optional phase comparison.
// Optional phase comparison. Each instrument owns a separate quantum state.
const { prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');
const { applyGate, relativePhase } = require('./gates.js');

const clone = state => ({ alpha: { ...state.alpha }, beta: { ...state.beta } });
const fresh = () => ({ state: prepare('zero'), result: null, counts: [0, 0], history: [] });
const sequence = [['H', 'H'], ['Z', null], ['H', 'H']];

function describeComparison(step) {
  if (!Number.isInteger(step) || step < 0 || step > 4) throw new RangeError('Invalid comparison step');
  return Object.freeze([
    { id: 'same-start', nextAction: 'next', nextLabel: 'Apply H to both',
      text: 'Two tests, both starting at 0.\nCan a phase change affect a later result?' },
    { id: 'same-superposition', nextAction: 'next', nextLabel: 'Apply Z to A',
      text: 'Both have equal 0 / 1 odds.\nNext, change only A with Z. B waits.' },
    { id: 'different-phase', nextAction: 'next', nextLabel: 'Apply H to both',
      text: 'Same immediate odds; different phase.\nWatch the arrows. What will H reveal?' },
    { id: 'different-predictions', nextAction: 'measure', nextLabel: 'Measure both',
      text: 'A now predicts 1; B predicts 0.\nMeasure both to test these predictions.' },
    { id: 'revealed', nextAction: null, nextLabel: 'Comparison complete',
      text: 'H-Z-H gives 1. H-H gives 0.\nPhase changed a later result. Reset to explore again.' }
  ][step]);
}

function createComparison({ random = Math.random } = {}) {
  if (typeof random !== 'function') throw new TypeError('Expected sampler function');
  let a = fresh(), b = fresh(), step = 0, revision = 0, trials = 0, busy = false;
  function instrument(value) {
    return { state: clone(value.state), result: value.result, counts: [...value.counts],
      history: [...value.history], probabilities: probabilities(value.state),
      bloch: bloch(value.state), phaseRadians: relativePhase(value.state) };
  }
  function snapshot() {
    return { step, revision, trials, a: instrument(a), b: instrument(b),
      presentation: describeComparison(step) };
  }
  const deny = code => ({ ok: false, committed: false, code, ...snapshot() });
  return {
    snapshot,
    dispatch(action, renderedRevision) {
      if (busy) return deny('COMPARISON_BUSY');
      if (!Number.isSafeInteger(renderedRevision) || renderedRevision < 0) return deny('INVALID_REVISION');
      if (renderedRevision !== revision) return deny('STALE_CONTROL');
      if (!['next', 'measure', 'reset'].includes(action)) return deny('INVALID_ACTION');
      if ((action === 'next' && step >= 3) || (action === 'measure' && step < 3)) return deny('INVALID_STEP');
      if (revision === Number.MAX_SAFE_INTEGER || trials === Number.MAX_SAFE_INTEGER) return deny('COMPARISON_LIMIT');
      busy = true;
      revision++;
      try {
        if (action === 'reset') {
          a = fresh(); b = fresh(); step = 0; trials = 0;
        } else if (action === 'next') {
          const [gateA, gateB] = sequence[step];
          const nextA = applyGate(a.state, gateA);
          const nextB = gateB === null ? clone(b.state) : applyGate(b.state, gateB);
          a = { ...a, state: nextA, history: a.history.concat(gateA) };
          b = { ...b, state: nextB, history: b.history.concat(gateB === null ? 'Wait' : gateB) };
          step++;
        } else {
          // Validate BOTH draws before committing either instrument. A failed
          // second draw cannot leave a partially measured comparison.
          const resultA = measure(a.state, random);
          const resultB = measure(b.state, random);
          const record = (value, result) => {
            const counts = [...value.counts]; counts[result.outcome]++;
            return { state: result.state, result: result.outcome, counts,
              history: value.history.concat('Z measurement: ' + result.outcome).slice(-16) };
          };
          a = record(a, resultA); b = record(b, resultB);
          trials++; step = 4;
        }
        return { ok: true, committed: true, ...snapshot() };
      } catch (_) {
        return deny('INVALID_SAMPLE');
      } finally { busy = false; }
    }
  };
}

module.exports = { describeComparison, createComparison };
