// Generated from src/lesson.js by tools/build-lens-core.mjs. Do not edit.
'use strict';
const { prepare, measure, probabilities, bloch, validateState } = require('./quantum.js');

const HISTORY_LIMIT = 100;
const MAX_BATCH_TRIALS = 1000;
const STAGES = Object.freeze(['bit', 'qubit', 'measurement', 'challenge', 'complete']);
const PREPARATIONS = Object.freeze(['zero', 'one', 'plus']);
const freshCounts = () => ({ zero: [0, 0], one: [0, 0], plus: [0, 0] });
const integer = value => Number.isSafeInteger(value) && value >= 0;

class LessonError extends Error {
  constructor(code, message) { super(message); this.name = 'LessonError'; this.code = code; }
}
const requireLesson = (condition, code, message) => {
  if (!condition) throw new LessonError(code, message);
};

function initialLesson() {
  return { version: 1, stage: 'bit', bit: 0, qubit: prepare('zero'),
    preparation: 'zero', preparationId: 0, outcome: null, counts: [0, 0],
    trials: 0, history: [], freshCounts: freshCounts(), challenge: 'pending',
    challengeAttempts: 0, challengeFeedback: null };
}

function validateLessonState(state) {
  requireLesson(state && state.version === 1 && STAGES.includes(state.stage), 'INVALID_STATE', 'Unknown lesson state');
  requireLesson([0, 1].includes(state.bit) && PREPARATIONS.includes(state.preparation) &&
    integer(state.preparationId) && [null, 0, 1].includes(state.outcome), 'INVALID_STATE', 'Invalid preparation');
  try { validateState(state.qubit); } catch { throw new LessonError('INVALID_STATE', 'Invalid qubit'); }
  requireLesson(Array.isArray(state.counts) && state.counts.length === 2 && state.counts.every(integer) &&
    integer(state.trials) && state.counts[0] + state.counts[1] === state.trials, 'INVALID_STATE', 'Invalid experiment totals');
  requireLesson(Array.isArray(state.history) && state.history.length === Math.min(state.trials, HISTORY_LIMIT),
    'INVALID_STATE', 'Invalid history length');
  for (let i = 0; i < state.history.length; i++) {
    const entry = state.history[i];
    requireLesson(entry && entry.id === state.trials - state.history.length + i + 1 &&
      PREPARATIONS.includes(entry.preparedAs) && integer(entry.preparationId) &&
      entry.preparationId <= state.preparationId && [0, 1].includes(entry.outcome) &&
      typeof entry.freshPreparation === 'boolean' && entry.probabilities &&
      Number.isFinite(entry.probabilities.zero) && entry.probabilities.zero >= 0 && entry.probabilities.zero <= 1 &&
      Number.isFinite(entry.probabilities.one) && entry.probabilities.one >= 0 && entry.probabilities.one <= 1 &&
      Math.abs(entry.probabilities.zero + entry.probabilities.one - 1) < 1e-12,
    'INVALID_STATE', 'Invalid history entry');
  }
  requireLesson(state.freshCounts && PREPARATIONS.every(name => Array.isArray(state.freshCounts[name]) &&
    state.freshCounts[name].length === 2 && state.freshCounts[name].every(integer)), 'INVALID_STATE', 'Invalid fresh-trial counters');
  const freshTotal = PREPARATIONS.reduce((sum, name) => sum + state.freshCounts[name][0] + state.freshCounts[name][1], 0);
  requireLesson(Number.isSafeInteger(freshTotal) && freshTotal <= state.trials &&
    ['pending', 'retry', 'passed'].includes(state.challenge) && integer(state.challengeAttempts) &&
    (state.challengeFeedback === null || typeof state.challengeFeedback === 'string'), 'INVALID_STATE', 'Invalid challenge or statistics');
  const expected = bloch(prepare(state.outcome === null ? state.preparation : state.outcome === 0 ? 'zero' : 'one'));
  const actual = bloch(state.qubit);
  requireLesson(['x', 'y', 'z'].every(axis => Math.abs(actual[axis] - expected[axis]) < 1e-12),
    'INVALID_STATE', 'Preparation/result disagrees with current qubit');
  if (state.outcome !== null) {
    const last = state.history[state.history.length - 1];
    requireLesson(last && last.outcome === state.outcome && last.preparationId === state.preparationId &&
      last.preparedAs === state.preparation, 'INVALID_STATE', 'Current result disagrees with history');
  }
  for (const outcome of [0, 1]) {
    const retained = state.history.filter(entry => entry.outcome === outcome).length;
    requireLesson(retained <= state.counts[outcome] &&
      (state.trials > HISTORY_LIMIT || retained === state.counts[outcome]), 'INVALID_STATE', 'History disagrees with counters');
    for (const name of PREPARATIONS) {
      const retainedFresh = state.history.filter(entry => entry.outcome === outcome && entry.preparedAs === name && entry.freshPreparation).length;
      requireLesson(retainedFresh <= state.freshCounts[name][outcome] &&
        (state.trials > HISTORY_LIMIT || retainedFresh === state.freshCounts[name][outcome]), 'INVALID_STATE', 'Fresh history disagrees with counters');
    }
  }
  return state;
}

// Plain-data copying avoids assuming a host-provided structuredClone API.
function copy(state) {
  return { ...state, qubit: { alpha: { ...state.qubit.alpha }, beta: { ...state.qubit.beta } },
    counts: [...state.counts], freshCounts: Object.fromEntries(PREPARATIONS.map(name => [name, [...state.freshCounts[name]]])),
    history: state.history.map(entry => ({ ...entry, probabilities: { ...entry.probabilities } })) };
}

function snapshotLesson(state) { return copy(validateLessonState(state)); }

function prepareNext(next, name) {
  requireLesson(PREPARATIONS.includes(name), 'INVALID_PREPARATION', 'Choose 0, 1 or equal superposition');
  requireLesson(next.preparationId < Number.MAX_SAFE_INTEGER, 'COUNTER_LIMIT', 'Restart before preparing more states');
  next.qubit = prepare(name); next.preparation = name; next.preparationId++; next.outcome = null;
}

function measureNext(next, random) {
  requireLesson(next.trials < Number.MAX_SAFE_INTEGER, 'COUNTER_LIMIT', 'Restart the experiment before continuing');
  const before = probabilities(next.qubit);
  const freshPreparation = next.outcome === null;
  const result = measure(next.qubit, random);
  next.trials++; next.counts[result.outcome]++;
  if (freshPreparation) next.freshCounts[next.preparation][result.outcome]++;
  next.history.push({ id: next.trials, preparedAs: next.preparation, preparationId: next.preparationId,
    freshPreparation, probabilities: before, outcome: result.outcome });
  if (next.history.length > HISTORY_LIMIT) next.history.shift();
  next.qubit = result.state; next.outcome = result.outcome;
}

function transition(current, action, random = Math.random) {
  requireLesson(action && typeof action.type === 'string', 'INVALID_ACTION', 'Action required');
  if (action.type === 'RESET' || action.type === 'RESTART') return initialLesson();
  validateLessonState(current);
  const next = copy(current);
  switch (action.type) {
    case 'NEXT':
      requireLesson(current.stage !== 'challenge' || current.challenge === 'passed', 'CHALLENGE_INCOMPLETE', 'Answer the challenge before completing');
      next.stage = STAGES[Math.min(STAGES.indexOf(current.stage) + 1, STAGES.length - 1)];
      break;
    case 'BACK':
      next.stage = STAGES[Math.max(0, STAGES.indexOf(current.stage) - 1)];
      break;
    case 'TOGGLE_BIT':
      requireLesson(current.stage === 'bit', 'ACTION_UNAVAILABLE', 'Bit stage required');
      next.bit = 1 - current.bit;
      break;
    case 'PREPARE':
      requireLesson(['qubit', 'measurement'].includes(current.stage), 'ACTION_UNAVAILABLE', 'Preparation unavailable');
      prepareNext(next, action.name);
      break;
    case 'MEASURE':
      requireLesson(current.stage === 'measurement', 'ACTION_UNAVAILABLE', 'Measurement stage required');
      measureNext(next, random);
      break;
    case 'RUN_TRIALS':
      requireLesson(current.stage === 'measurement', 'ACTION_UNAVAILABLE', 'Measurement stage required');
      requireLesson(Number.isInteger(action.count) && action.count >= 1 && action.count <= MAX_BATCH_TRIALS,
        'INVALID_TRIAL_COUNT', 'Choose 1 to 1000 trials');
      requireLesson(PREPARATIONS.includes(action.name), 'INVALID_PREPARATION', 'Choose a supported preparation');
      for (let i = 0; i < action.count; i++) { prepareNext(next, action.name); measureNext(next, random); }
      break;
    case 'RESET_EXPERIMENT':
      requireLesson(current.stage === 'measurement', 'ACTION_UNAVAILABLE', 'Measurement stage required');
      next.counts = [0, 0]; next.trials = 0; next.history = []; next.freshCounts = freshCounts();
      prepareNext(next, current.preparation);
      break;
    case 'ANSWER':
      requireLesson(current.stage === 'challenge', 'ACTION_UNAVAILABLE', 'Challenge stage required');
      requireLesson(['half-each', 'always-zero', 'alternating'].includes(action.answer), 'INVALID_ANSWER', 'Choose a displayed answer');
      requireLesson(next.challengeAttempts < Number.MAX_SAFE_INTEGER, 'COUNTER_LIMIT', 'Restart before more attempts');
      next.challengeAttempts++;
      next.challenge = action.answer === 'half-each' ? 'passed' : 'retry';
      next.challengeFeedback = action.answer === 'half-each'
        ? 'Correct. Each fresh equal superposition has a 50% chance of 0 and a 50% chance of 1.'
        : action.answer === 'alternating'
          ? 'Try again. Independent results do not have to alternate or split evenly in a short run.'
          : 'Try again. Equal superposition can produce either result, each with a 50% chance.';
      break;
    default: throw new LessonError('INVALID_ACTION', 'Unknown action');
  }
  return validateLessonState(next);
}

function viewModel(state) {
  validateLessonState(state);
  return { ...copy(state), probabilities: probabilities(state.qubit), bloch: bloch(state.qubit),
    preparationProbabilities: probabilities(prepare(state.preparation)),
    historyDropped: state.trials - state.history.length,
    challengeQuestion: 'For freshly prepared equal superpositions, what are the chances of 0 and 1?' };
}

function attemptTransition(current, action, random = Math.random) {
  try { return { ok: true, state: transition(current, action, random), error: null }; }
  catch (error) {
    let state = null;
    try { state = copy(validateLessonState(current)); } catch { /* Explicit restart is required. */ }
    return { ok: false, state, error: { code: error instanceof LessonError ? error.code : 'SAMPLING_FAILED',
      message: state ? 'That action could not finish. Your lesson is unchanged.' : 'The lesson state is invalid. Restart to recover.',
      recoveryAction: state ? null : { type: 'RESTART' } } };
  }
}
module.exports = { HISTORY_LIMIT, MAX_BATCH_TRIALS, STAGES, PREPARATIONS, LessonError, initialLesson, validateLessonState, snapshotLesson, transition, viewModel, attemptTransition };
