# Open and test

## Start with the public source

Clone or download this repository. Open
`native/QuantumARExplorer/QuantumARExplorer.esproj` in **Lens Studio 5.23.2**.
Keep its Assets, Packages, project file and metadata together. Wait for package
import and TypeScript compilation to finish. Select **SPECS 27 Interactive Preview**
with **Sunlit Outdoor**, then refresh the preview. The first screen is
**1 / 3 Meet the Bit**, with value 0 and zero measurements.

The saved project includes SIK, UIKit, Leaf and the official preview-agent
packages. Lens Studio, the CLAD plugin, Lens Studio MCP and LeafPlugin are separate
vendor prerequisites for the automated preview workflow. Install/configure them
through their official distribution and follow their applicable terms; executables,
sign-in state and private configuration are not included. See
[third-party notices](../../THIRD_PARTY_NOTICES.md) for package provenance and terms.
No private project files or previously generated cache are needed.

## Use the verified preview input

The reproducible desktop route is **CLAD/Lens Studio MCP coordinate pinch**, or
the supplied **LEAF simulated IK** scenarios. With the Lens Studio MCP connected:

1. Query the running preview for the visible control, for example `QAR toggle-bit`.
   Read its current `transform.worldPosition` with `QueryRuntimeSceneTool`.
2. Call `PreviewInteractTool` with `action: "Pinch"` and that `worldPosition`.
   Use the active preview name if more than one preview is open. The verified
   ordinary journeys use a 650 ms pinch duration where the tool exposes duration.
3. Let the selection finish and inspect the visible value: 0 becomes 1. After
   navigation, reveal, preview refresh or placement, discover the next control
   again. Positions and runtime IDs can change. Allow newly revealed controls and
   the placement guard to settle before selecting them. After returning between
   lesson, lab and comparison modes, allow at least 600 ms before a new selection.
4. Run interactions serially and verify their visible effect. If an action errors,
   inspect state before retrying; an action can have landed before a timeout.

This route uses the actual SIK/UIKit events and application input guards, without
calling lesson callbacks directly. Coordinate targeting omits the tool's named
target preflight, so use the freshly observed visible center and check the result.
Named-target automation reported a button's own child collider as obstructing its
target. Do not disable colliders or cancellation/stale-event guards to force it.

The installed SIK MouseInteractor documents mouse/touch selection, but ordinary
Windows short-click probes in this landscape preview did not activate the bit.
Hover alone is not selection evidence. QAR-010 traced TouchStart/TouchEnd reaching
the Lens without the expected Interactable/UIKit selection events. That routing
boundary remains unresolved; use the verified routes above for evaluation.
Injected touch tests and simulated pinch are distinct from a real Windows click.
No keyboard, phone or handheld controller is required by the lesson's intended
SPECS input design. Physical glasses input has not been tested.

## QAR-016 test and Details protocol

Run the eleven original LEAF scenarios serially, using a supported fresh preview
reset between completed scenarios to isolate their test interactors. The final
canonical and source-only runs used this protocol. Within each scenario, all
cancel, outside-release, stale-selection, mode-boundary and exact-return checks
remain unchanged. An earlier run timed out; it is preserved as an unsuccessful
attempt. Do not reset a pending run and relabel it as a pass. A separate ordinary
coordinate-pinch journey verifies the continuous lesson and discovery route.

Details retains every amplitude, phase, history and intermediate-state value.
Its diagrams are 10 cm while open and return to 15 cm on close. Current phase is
undefined after collapse; the retained intermediate phases are historical values.
Look back toward the world station before using Recenter if it leaves view.

## Try the short optional discovery

The three-stage lesson remains the primary path. From **Meet the Bit**, you can
instead choose **Discover phase (optional)**:

1. `QAR enter-discovery` deliberately prepares the two experiments with identical
   50/50 odds, opposite arrows and no measurements. Read the question: will the
   same operation give the same result?
2. Choose **Try same operation** (`QAR compare-step`). The computed probabilities
   change to A predicting 1 and B predicting 0. Both still say **Predicted, not
   measured**. The intermediate 50/50 states did not already have these certain
   different outcomes.
3. Choose **Measure both** (the same current `QAR compare-step` target, rediscovered
   after the repaint). Ordinary measurement confirms A=1 and B=0. The explanation
   connects the difference to quantum phase and the initial odds.

**Details** shows current amplitudes, relative phase, actual gate/measurement
history and the retained intermediate values. It changes no experiment state.
**Reset** starts the full preparation sequence at both zero. **Return lesson**
restores the exact entry lesson; allow at least 600 ms before the next selection.
The comparison remains optional and can also be reached later through the Lab.

The final development route took 14.177 seconds for three coordinate selections,
including fresh queries, state readbacks and tool overhead. This is an observed
simulated-input wall time, not a novice completion or comprehension result.
A human observation protocol is [provided separately](NOVICE_TEST_PROTOCOL.md).

## Explore the lesson

1. **Meet the Bit:** change 0 / 1, then choose Next. A classical bit has one
   definite value.
2. **Meet the Qubit:** prepare 0, 1 and equal superposition. Compare the state
   arrow and the displayed Z-measurement probabilities. Choose Next.
3. **Make a Measurement:** prepare a state, then Measure. Prepare 0 or 1 for a
   certain result, or equal superposition for 50% theoretical odds of either
   result. Measure again without preparing: collapse keeps the same result.
   Ten fresh trials each prepare equal superposition again for independent
   measurements. Ten fair trials need not split five/five. Counters accumulate
   actual outcomes.
4. The visible measurement **Next** leads to the probability challenge. It is
   available even before measuring, matching the lesson progression rules.
   An incorrect answer gives feedback and
   permits another attempt. Choose the answer describing 50% for each outcome
   of a fresh equal superposition, then continue to completion.
5. Restart clears the beginner lesson and its experiment counts. Back and control
   pages retain the experiment where applicable.

**Inspect Z** relates the arrow's height to probabilities. **Motion** turns the
brief illustrative arrow arc off or on; neither display control changes the
scientific state. The scientific model updates immediately, including when a
measurement interrupts a visual transition. Probability/result text is authoritative.

The sphere is 18 cm in diameter, initially 110 cm away, in a 52 cm station.
Controls are 6 cm high with at least 2.2 cm gaps. Move the simulated viewpoint to
inspect the actual 3D diagram; the station stays fixed. **Reposition**, its small
step controls, **Done** and **Recenter** provide deliberate manual placement.
There is no tabletop detection or persistent physical anchor. Look back toward
the world controls if they leave view.

## Try the optional phase experiment

After completion, choose **Optional Gate Lab**. Its prompts follow your actual
state and history; its state and counters are separate from the beginner lesson.

1. From 0, try X: it swaps to 1. Reset Lab.
2. Try H: equal superposition gives 50/50 odds. Apply Z: relative phase and the
   arrow change while immediate Z-measurement odds stay 50/50.
3. Apply another H, predict the result, then Measure: H–Z–H from 0 gives 1.
4. Reset Lab, apply H then H, and Measure: the result is 0. Compare the two paths.
5. Choose **Compare phase** to open the optional two-instrument chamber. Both
   experiments retain their own comparison state. Choose **Reset** to start both
   at 0. **Prepare equal odds** applies H to both; **Change A only** applies Z to A
   while B waits. Both still show 50/50 Z odds but different phases and arrows.
   **Try same operation** applies H to both again: predictions become A=1/B=0.
   **Measure both** observes those basis results through the ordinary sampler.
   Open Details for the actual mathematics.
6. **Return Lab** restores the exact lab snapshot. Allow the mode boundary to
   settle before a new selection; inspect the actual visible page and discover
   its controls again. The chamber's 15 cm diagrams share the 52 cm station.
7. **Return Lesson** restores the exact completed beginner snapshot. Its Restart
   clears that lesson. The optional component can be disabled/detached to retain
   the complete beginner experience.

Complex amplitudes, probabilities and phase have stated rounding. Phase is
undefined when either amplitude is zero. Arbitrary exploration receives general
guidance rather than assuming a sequence that a bounded history cannot establish.

## Run the native scenarios

Open the official **LEAF panel** with LeafPlugin enabled. Refresh the preview,
wait for registration, list scenarios, then run these **one at a time**:

| Scenario | What it checks |
|---|---|
| `qar006-lesson-flow` | Complete lesson through visible text and real UIKit events |
| `qar006-ik-bit-selection` | Simulated IK selection changes the bit |
| `qar006-native-preservation` | Back, batches, clear counts, paging, stale/canceled/end-outside releases and placement |
| `qar009-visual-spatial-contracts` | Visual interruption, endpoints, motion off and display-only controls |
| `qar009-optional-gate-lab` | Complex gates, collapse, cancellation, exact return and feature-disabled path |
| `qar010-judge-experience` | Visible instructions, guided X/H/Z comparison, challenge recovery and measurement during active animation |
| `qar011-phase-comparison` | Actual intermediate gates/phase/odds, final A1/B0, reset and exact lab/lesson preservation |
| `qar011-comparison-guards` | Cancellation, stale events, mode settling, error recovery, feature-disabled fallback and visible measurement navigation |
| `qar011-comparison-ik` | Simulated IK reach, comparison selection and return |
| `qar012-discovery` | Immediate deliberate preparation, plain/technical explanation, exact nontrivial return, repeat history, Reset and Motion off |
| `qar012-discovery-guards-ik` | New-entry cancellation/outside/stale/held/mode guards, fallback and actual simulated IK confirmation |

Wait for each run's result before starting another: a new run resets the scene.
Refresh afterward to remove diagnostic avatars/overlays before ordinary exploration
or recording. If a run fails, retain the scenario-manager error and investigate it.
Do not treat a tool timeout or UI-side completion message alone as a pass.
See [verification](VERIFICATION.md) for actual run results and scope.

## Optional offline checks

Use Node.js 24 or newer from the repository root; no package install is required:

```sh
node --test tests/*.test.js
node examples/offline-walkthrough.mjs
```

The seven original core modules own quantum and lesson state, presentation,
session, focus, controls and random injection. Native CommonJS copies preserve
that logic, changing only relative dependency suffixes from `.cjs` to `.js`.
Separate rendering and gate helpers have native parity tests. TypeScript owns
rendering and supported native interaction. See [lesson API](LESSON_API.md) and
[science criteria](SCIENCE_AND_ACCEPTANCE.md).

The authentic planning workflow's public brief is
`native/QuantumARExplorer/devpost/PUBLIC_DESIGN_BRIEF.md`. QAR-009 through QAR-012
addenda record authorized implementation evolution; the original approved brief
is preserved. Desktop preview does not establish physical hand tracking,
additive-display contrast, comfort or device performance. No Lens, competition
entry or demonstration video has been uploaded or submitted.
