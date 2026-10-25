// Read-only language for the optional discovery. Scientific state stays in comparison.js.
const near = (a, b) => Math.abs(a - b) < 1e-10;
const percent = value => `${Math.round(100 * value)}%`;
const number = value => Math.abs(value) < 1e-10 ? '0' : Number(value.toFixed(3)).toString();
const complex = value => {
  const imaginary = number(value.im);
  return `${number(value.re)}${imaginary.startsWith('-') ? '' : '+'}${imaginary}i`;
};

export function describeDiscovery(snapshot, { technical = false } = {}) {
  if (!snapshot || !Number.isInteger(snapshot.step) || snapshot.step < 0 || snapshot.step > 4) {
    throw new RangeError('Invalid discovery snapshot');
  }
  for (const key of ['a', 'b']) {
    const s = snapshot[key], p = s?.probabilities;
    if (!p || ![p.zero, p.one].every(v => Number.isFinite(v) && v >= 0 && v <= 1) ||
        !near(p.zero + p.one, 1) || ![null, 0, 1].includes(s.result) ||
        ![s.state?.alpha?.re, s.state?.alpha?.im, s.state?.beta?.re, s.state?.beta?.im].every(Number.isFinite) ||
        !(s.phaseRadians === null || Number.isFinite(s.phaseRadians)) || !Array.isArray(s.history)) {
      throw new TypeError('Invalid discovery instrument');
    }
  }
  const { a, b, step } = snapshot;
  const sameOdds = near(a.probabilities.zero, b.probabilities.zero);
  const half = sameOdds && near(a.probabilities.zero, 0.5);
  const distinctPhase = a.phaseRadians !== null && b.phaseRadians !== null &&
    !near(Math.cos(a.phaseRadians - b.phaseRadians), 1);
  const split = near(a.probabilities.one, 1) && near(b.probabilities.zero, 1);
  const confirmed = step === 4 && a.result === 1 && b.result === 0 && split;
  const titles = ['Start two experiments', 'Equal odds', 'Same odds. Different states.', 'Different predictions', 'Phase changes what comes next'];
  let guide = 'Read the current odds below. Predictions describe the next measurement.';
  if (step === 0) guide = 'Both start at zero. Prepare both with equal chances of zero and one.';
  if (step === 1 && half) guide = 'Both now have 50/50 odds. Next, change only A. B waits.';
  if (step === 2 && half && distinctPhase) guide = 'Same odds. Different arrow directions.\nWill the same operation give the same result?';
  if (step === 3 && split) guide = 'A now predicts 1; B predicts 0.\nThe same operation revealed quantum phase.';
  if (confirmed) guide = 'Measured A: 1; B: 0.\nQuantum information is more than the initial odds.';
  const nextLabel = step === 0 ? 'Prepare equal odds' : step === 1 ? 'Change A only' :
    step === 2 ? 'Try the same operation' : step === 3 ? 'Measure both' : 'Measure again';
  const instrument = (s, key) => ({
    title: `Experiment ${key.toUpperCase()}`,
    odds: `0: ${percent(s.probabilities.zero)}   1: ${percent(s.probabilities.one)}`,
    status: s.result === null ? 'Next measurement odds' : `Measured: ${s.result} · current odds`,
    technical: `α=${complex(s.state.alpha)}  β=${complex(s.state.beta)}\n` +
      `Phase: ${s.phaseRadians === null ? 'undefined' : number(s.phaseRadians / Math.PI) + 'π'}\n` +
      `Path: ${s.history.length ? s.history.join(' → ') : '0'}`
  });
  return Object.freeze({
    title: step === 2 && !distinctPhase ? 'Compare current states' : titles[step], guide, nextLabel, sameOdds, distinctPhase, equalSuperpositionOdds: half,
    distinctCertainPredictions: split, measuredConfirmation: confirmed,
    a: instrument(a, 'a'), b: instrument(b, 'b'), technical,
    explanation: technical ?
      'H on both; Z on A while B waits; H on both.\nThe intermediate relative phases are π and 0.\nTwo independent qubits; this is not entanglement.' : guide
  });
}
