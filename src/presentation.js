import { viewModel } from './lesson.js';

const TITLES = { bit: 'Meet the Bit', qubit: 'Meet the Qubit', measurement: 'Make a Measurement',
  challenge: 'Try the Probability Challenge', complete: 'Lesson Complete' };
const COPY = {
  bit: 'A classical bit has one of two values: 0 or 1. Try changing the value.',
  qubit: 'The arrow represents a qubit state. Choose 0, 1 or equal superposition. The sphere is a state diagram, not a particle path.',
  measurement: 'Prepare a state, then measure it. After measurement, measuring again gives the same result until you prepare a new state.',
  challenge: 'Think about a fresh equal superposition each time, rather than repeating a measurement of an already collapsed state.',
  complete: 'You explored a bit, prepared a qubit and used probabilities to understand measurement.'
};
const percent = value => Math.round(value * 10000) / 100;
const control = (id, label, action, enabled = true, disabledReason = null) =>
  ({ id, role: 'button', label, accessibleName: label, action, enabled, disabledReason });

// App-owned logical contract. This describes data, not Snap SceneObject APIs or AR units.
export function presentationModel(state, { reducedMotion = true, error = null } = {}) {
  if (typeof reducedMotion !== 'boolean') throw new TypeError('reducedMotion must be boolean');
  const vm = viewModel(state);
  const controls = [];
  if (vm.stage === 'bit') controls.push(control('toggle-bit', 'Change bit to ' + (1 - vm.bit), { type: 'TOGGLE_BIT' }));
  if (['qubit', 'measurement'].includes(vm.stage)) {
    for (const [name, label] of [['zero', 'Prepare 0'], ['one', 'Prepare 1'], ['plus', 'Prepare equal superposition']]) {
      controls.push({ ...control('prepare-' + name, label, { type: 'PREPARE', name }), selected: vm.preparation === name && vm.outcome === null });
    }
  }
  if (vm.stage === 'measurement') controls.push(
    control('measure', 'Measure current state', { type: 'MEASURE' }),
    control('fresh-plus-ten', 'Prepare equal superposition and measure, 10 fresh trials', { type: 'RUN_TRIALS', name: 'plus', count: 10 }),
    control('clear-experiment', 'Clear experiment counts and prepare again', { type: 'RESET_EXPERIMENT' }));
  if (vm.stage === 'challenge') for (const [answer, label] of [
    ['half-each', '50% chance of 0 and 50% chance of 1'], ['always-zero', 'Always 0'], ['alternating', 'Results must alternate']]) {
    controls.push(control('answer-' + answer, label, { type: 'ANSWER', answer }));
  }
  controls.push(control('back', 'Back', { type: 'BACK' }, vm.stage !== 'bit', vm.stage === 'bit' ? 'You are at the first step.' : null));
  if (vm.stage !== 'complete') controls.push(control('next', vm.stage === 'challenge' ? 'Finish lesson' : 'Next', { type: 'NEXT' },
    vm.stage !== 'challenge' || vm.challenge === 'passed', vm.stage === 'challenge' && vm.challenge !== 'passed' ? 'Answer the challenge correctly first.' : null));
  controls.push(control('restart', 'Restart lesson and clear all results', { type: 'RESTART' }));
  const probabilityText = percent(vm.probabilities.zero) + '% chance of 0; ' + percent(vm.probabilities.one) + '% chance of 1';
  const status = vm.outcome === null ? 'No result for the current preparation.' : 'Measurement result: ' + vm.outcome + '.';
  const announcement = vm.stage === 'bit' ? 'Classical bit: ' + vm.bit + '.'
    : vm.stage === 'challenge' ? vm.challengeFeedback || vm.challengeQuestion
      : vm.stage === 'complete' ? 'Lesson complete. You can restart to explore again.'
        : status + ' ' + probabilityText + '.';
  return {
    contractVersion: 1, stage: vm.stage, title: TITLES[vm.stage], explanation: COPY[vm.stage],
    progress: { step: vm.stage === 'bit' ? 1 : vm.stage === 'qubit' ? 2 : 3, total: 3, complete: vm.stage === 'complete' },
    controls, focusOrder: controls.filter(item => item.enabled).map(item => item.id),
    accessibility: { reducedMotion, essentialMotion: false, informationRequiresColor: false,
      informationRequiresAudio: false, timedChallenge: false, focusIndicator: 'outline-and-text',
      activationPolicy: 'one-per-focus-cycle; cancel-on-focus-exit',
      announcement: { key: [vm.stage, vm.bit, vm.trials, vm.preparationId, vm.challengeAttempts, error ? error.code : ''].join(':'),
        politeness: 'polite', text: error ? error.message : announcement } },
    visual: { coordinateSystem: 'bloch-unit-sphere; mathematical-positive-z-is-state-zero',
      bit: { id: 'classical-bit', visible: vm.stage === 'bit', value: vm.bit, label: 'Classical bit: ' + vm.bit },
      sphere: { id: 'bloch-sphere', visible: vm.stage !== 'bit', radius: 1, representation: 'state-diagram',
        poles: [{ label: '0', point: { x: 0, y: 0, z: 1 } }, { label: '1', point: { x: 0, y: 0, z: -1 } }],
        arrow: { from: { x: 0, y: 0, z: 0 }, to: { ...vm.bloch }, label: 'Current qubit state' },
        animateTransitions: !reducedMotion },
      probabilityBars: [{ label: '0', fraction: vm.probabilities.zero }, { label: '1', fraction: vm.probabilities.one }] },
    measurement: { status, probabilities: { ...vm.probabilities }, probabilityText,
      probabilityLabel: 'Current state probabilities in the Z basis',
      freshPreparationProbabilities: { ...vm.preparationProbabilities },
      collapsed: vm.outcome !== null, preparation: vm.preparation,
      result: vm.outcome, repeatHint: vm.outcome === null ? 'Measure to see one outcome.' : 'Prepare again for a fresh probability trial.' },
    experiment: { trials: vm.trials, counts: [...vm.counts], label: 'All measurements, including repeated collapsed states',
      freshByPreparation: vm.freshCounts, freshPlusTrials: vm.freshCounts.plus[0] + vm.freshCounts.plus[1],
      history: vm.history, historyDropped: vm.historyDropped,
      historyNotice: vm.historyDropped ? 'Showing the latest ' + vm.history.length + ' measurements; totals include earlier trials.' : 'All measurements are shown.' },
    challenge: { question: vm.challengeQuestion, status: vm.challenge, attempts: vm.challengeAttempts, feedback: vm.challengeFeedback },
    error: error ? { code: error.code, message: error.message } : null,
    nativeIntegration: 'UNVERIFIED: logical model only'
  };
}
