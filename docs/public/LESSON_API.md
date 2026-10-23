# Offline application contract

All modules are dependency-free JavaScript ES modules. They are tested in Node 24+.
They make no network calls and do not depend on Snap APIs. Lens scripting imports,
language support, coordinate conversion and rendering still require native validation.

## Modules

| Module | Responsibility |
|---|---|
| quantum.js | Normalized complex state, Born probabilities, Bloch vector, Z measurement/collapse |
| lesson.js | Validated immutable lesson state, navigation, experiments, challenge and restart |
| presentation.js | Accessible labels, focus order, logical scene descriptions and feedback |
| session.js | Host renderer/sampler injection, transactional dispatch and display recovery |
| focus.js | Optional host-independent focus/dwell policy; no native tracking source provided |
| random.js | Repeatable seeded simulation; not cryptographic or physical randomness |

## State and navigation

The three teaching stages are `bit`, `qubit`, `measurement`; the challenge and
completion are subsequent substates. NEXT advances and BACK revisits without
changing scientific state or erasing history. NEXT from challenge requires a correct
answer. RESTART (or RESET) starts a new lesson and clears all results.

PREPARE accepts `zero`, `one`, or `plus` in qubit/measurement stages. MEASURE works
only in measurement. It collapses the state; another measurement is not an independent
superposition trial. RUN_TRIALS takes a preparation name and count from 1 through 1000
and explicitly prepares a fresh state before each measurement. RESET_EXPERIMENT
clears statistics while retaining the lesson stage and freshly preparing the selected state.

History retains the latest 100 measurements, with monotonic trial/preparation IDs,
prior probabilities, outcomes and a fresh-preparation flag. Lifetime counters remain
exact. `freshCounts` separates independent prepared trials from repeated collapsed
measurements, grouped by preparation. Presentation labels disclose mixed totals and
history truncation. No learner data is persisted or transmitted.

ANSWER accepts `half-each`, `always-zero`, or `alternating`; incorrect choices provide
specific feedback and retry. Unknown actions/answers and inconsistent state are rejected.

## Rendering and recovery

```js
import { createLessonSession } from './src/session.js';
import { createSeededRandom } from './src/random.js';

const session = createLessonSession({
  random: createSeededRandom(42),
  render: model => console.log(model.title, model.measurement.status)
});
session.refresh();
session.dispatch({ type: 'NEXT' });
```

The renderer receives a fresh presentation model with text alternatives, enabled
controls, stable IDs, focus order, progress, logical sphere/arrow descriptions and
reduced-motion settings. Coordinates are unit Bloch coordinates, not Lens scene units.
Adapters must map mathematical +Z to the displayed 0 pole and verify handedness.
Reduced motion defaults on; color, audio and animation are never required to read state.

Invalid actions preserve the lesson. A failed batch preserves application state;
external sampler calls already made are not rewound. A renderer failure after a valid
measurement reports `committed: true` and recovery `refresh`. Call `session.refresh()`
to redraw; replaying MEASURE would be a new experiment. Reentrant dispatch is denied.
Snapshots and presentation data cannot mutate stored state. An invalid externally
supplied reducer state requires explicit RESTART rather than silently repairing science.

The optional focus controller consumes logical target IDs and monotonic milliseconds.
It cancels on focus exit and fires once per focus cycle. Its default 1200 ms is a
provisional application setting, not a verified Snap recommendation. Callback failure
stays latched to prevent accidental repeat actions. No gaze/head-tracking SDK support
is implied. A native adapter must honor disabled controls, cancel on tracking loss,
deduplicate announcement keys, and wire a verified supported input source.
