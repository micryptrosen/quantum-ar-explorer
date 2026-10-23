import { createLessonSession } from '../src/session.js';
import { createSeededRandom } from '../src/random.js';

const lesson = createLessonSession({ random: createSeededRandom(42),
  render: model => console.log(model.title + ' | ' + model.accessibility.announcement.text) });
lesson.refresh();
for (const action of [
  { type: 'TOGGLE_BIT' }, { type: 'NEXT' }, { type: 'PREPARE', name: 'plus' },
  { type: 'NEXT' }, { type: 'MEASURE' }, { type: 'MEASURE' },
  { type: 'RUN_TRIALS', name: 'plus', count: 10 }, { type: 'NEXT' },
  { type: 'ANSWER', answer: 'alternating' }, { type: 'ANSWER', answer: 'half-each' },
  { type: 'NEXT' }
]) {
  const result = lesson.dispatch(action);
  if (!result.ok) throw new Error('Walkthrough failed: ' + result.error.code);
}
const state = lesson.getState();
console.log(JSON.stringify({ stage: state.stage, totalMeasurements: state.trials,
  allCounts: state.counts, freshPlusCounts: state.freshCounts.plus,
  challengeAttempts: state.challengeAttempts }));
