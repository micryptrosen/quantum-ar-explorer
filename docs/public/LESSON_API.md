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
| controls.js | Live control-ID routing, rendered revisions, input availability and callback invalidation |
| visual-transition.js | Rendering-only, interruptible Bloch-arrow interpolation with separate display revisions |
| gates.js | Isolated optional X/H/Z laboratory, complex amplitudes, phase and Z measurement |

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
The host-independent presentation model defaults to reduced motion. The native
view starts with Motion on and provides a Motion off control; color, audio and
animation are never required to read state.

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

## Binding controls to a host

`createLessonControls` owns a lesson session and exposes `activate(id, revision)`,
`refresh()`, `setInputAvailable(boolean)`, `getState()` and `getPresentation()`.
The renderer receives the presentation model plus a monotonic `revision` and
`inputAvailable`. Capture that revision when creating a callback:

```js
import { createLessonControls } from './src/controls.js';
const lesson = createLessonControls();
const frame = lesson.getPresentation();
lesson.activate('next', frame.revision);
```

Only IDs in the current enabled controls resolve to actions. The host does not send
arbitrary action payloads. Each accepted activation consumes its frame revision
before invoking the sampler or renderer. A queued duplicate using the old revision
returns `STALE_CONTROL` without changing state or consuming randomness. This prevents
a retained Next callback from skipping a stage and an old Measure callback from
sampling twice. Use this controller as the sole owner of that lesson's input flow.

When the host reports input loss, call `setInputAvailable(false)`: all controls and
focus targets become unavailable, pending callbacks expire, and lesson state remains
intact. Restoring input produces a fresh revision. Bind new callbacks to the fresh
display. A render failure after measurement still requires `refresh()`; it does not
authorize replaying the old measurement. Reentrant input during rendering is denied.
Native input events and tracking availability still require a verified SDK adapter;
this module does not provide or claim gaze, hand tracking or SIK integration.

## Visual transitions and optional gates

`createVisualTransition` interpolates unit directions over 0.35 seconds by default.
Its arc illustrates a change between committed states; it does not simulate a
physical trajectory or a preparation Hamiltonian. Probabilities and measurement
results always come from the authoritative model. New targets interrupt from the
currently displayed pose. Duplicate/stale revisions cannot replay a transition;
hidden, reset and reduced-motion updates can snap directly to the real endpoint.
Native display epochs remain monotonic when switching between lesson and lab,
whose scientific revision counters are independent.

`applyGate(state, gate)` accepts `X`, `H` or `Z`, returning a new normalized complex
state. `relativePhase(state)` returns arg(beta) minus arg(alpha), in (-pi, pi], or
`null` if either amplitude is exactly zero. A tiny nonzero amplitude still has a
defined relative phase. Global phase does not affect probabilities or the Bloch
direction.

`createGateLab({random})` owns an independent state and exposes `snapshot()` and
`dispatch(action, renderedRevision)`. Actions are `X`, `H`, `Z`, `measure` and
`reset`. A stale revision consumes no randomness. Accepted operations expire that
revision before sampling; an invalid sampler preserves state and counts while
consuming the revision, and the lab can then reset and recover. Reentrant actions
are rejected. Snapshots cannot mutate internal state, and history retains at most
16 operations. Gates clear the previous result while retaining accumulated lab
counts; Reset Lab clears only that experiment.

The native lab is optional after beginner completion. Enter and Return preserve
the beginner lesson's state, revision, measurements and challenge. Its component
can be disabled or detached without changing the beginner controller. Motion and
axis inspection are display preferences and do not sample or advance either
scientific model. The lab sends no learner data to a service.
