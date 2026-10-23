import { prepare, measure, probabilities, bloch } from './quantum.js';

// Logical actions only: an eventual Lens adapter maps supported inputs here.
export function initialLesson() {
  return { stage: 'bit', bit: 0, qubit: prepare('zero'), outcome: null,
    counts: [0, 0], trials: 0, challenge: 'pending' };
}

export function transition(current, action, random = Math.random) {
  if (!action || typeof action.type !== 'string') throw new TypeError('Action required');
  if (action.type === 'RESET') return initialLesson();
  const next = structuredClone(current);
  switch (action.type) {
    case 'NEXT':
      next.stage = { bit: 'qubit', qubit: 'measurement', measurement: 'challenge',
        challenge: 'complete', complete: 'complete' }[current.stage];
      if (current.stage === 'challenge' && current.challenge !== 'passed') {
        throw new Error('Answer the challenge before completing');
      }
      break;
    case 'TOGGLE_BIT':
      if (current.stage !== 'bit') throw new Error('Bit stage required');
      next.bit = 1 - current.bit;
      break;
    case 'PREPARE':
      if (!['qubit', 'measurement'].includes(current.stage)) throw new Error('Preparation unavailable');
      if (!['zero', 'one', 'plus'].includes(action.name)) throw new RangeError('Unsupported lesson state');
      next.qubit = prepare(action.name);
      next.outcome = null;
      break;
    case 'MEASURE': {
      if (current.stage !== 'measurement') throw new Error('Measurement stage required');
      const result = measure(current.qubit, random);
      next.qubit = result.state;
      next.outcome = result.outcome;
      next.counts[result.outcome]++;
      next.trials++;
      break;
    }
    case 'ANSWER':
      if (current.stage !== 'challenge') throw new Error('Challenge stage required');
      next.challenge = action.answer === 'half-each' ? 'passed' : 'retry';
      break;
    default: throw new RangeError('Unknown action');
  }
  return next;
}

export function viewModel(state) {
  return { ...structuredClone(state), probabilities: probabilities(state.qubit),
    bloch: bloch(state.qubit), challengeQuestion:
      'For freshly prepared equal superpositions, what are the chances of 0 and 1?' };
}
