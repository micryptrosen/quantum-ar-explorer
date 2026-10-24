# Open and test

Open `native/QuantumARExplorer/QuantumARExplorer.esproj` in Lens Studio **5.23.2**.
It is a saved SPECS Base Template project targeting Spectacles. Let package import
and TypeScript compilation finish, then select the **SPECS 27 Interactive Preview**
and refresh it. Project resources and package metadata must remain together.

Select the large UIKit buttons with supported simulated pinch input. The verified
automated route uses a visible control's world center. Named-target automation
reported the button's own child collider as blocking; mouse probes showed hover
but did not activate controls in the landscape setup. Neither route is reported
as passing for this build. LEAF simulated IK and coordinate pinch passed. No
keyboard, phone or handheld controller is required by the lesson's hardware input
design. Desktop movement controls are only for inspecting the simulated room.
Manual placement is a stand-in; the project performs no table recognition.

The flow is Meet the Bit, Meet the Qubit, Make a Measurement, then a short challenge
and completion. Prepare 0 or 1 for a certain outcome, or equal superposition for
50% theoretical probabilities. Measure again without preparing to observe collapse.
Prepare a fresh state to start another independent trial. Short runs need not divide
evenly. Restart clears the lesson and experiment counts.

Select **Inspect Z** to relate the arrow's height to measurement probabilities.
Move the simulated viewpoint to inspect the real 3D diagram while the station stays
fixed. **Motion** turns the brief illustrative arrow arc on or off; neither display
control changes scientific state. The 18 cm sphere begins 110 cm away, beside a
compact state card. Controls remain 6 cm high with at least 2.2 cm gaps. Recenter
and Reposition are deliberate manual placement, with a short settling guard.

After completion, choose **Optional Gate Lab**. Starting at 0, try H, Z, H, then
Measure: the outcome is certainly 1. Reset Lab and compare H, H: certainly 0.
The intermediate positive and negative superpositions have the same Z-measurement
odds but different relative phase. Complex amplitudes, phase and probabilities are
shown with stated rounding. Lab counts are separate. Return Lesson restores the
completed beginner snapshot, and its Restart clears that lesson. The optional
component can be disabled or detached to run only the beginner experience.

The supplied native LEAF scenario index registers `qar006-lesson-flow`,
`qar006-ik-bit-selection`, `qar006-native-preservation`,
`qar009-visual-spatial-contracts` and `qar009-optional-gate-lab`.
Open the official LEAF panel in Lens Studio to run them
in preview. The first checks visible native text and real UIKit events through the
complete lesson; the second uses a simulated IK interactor to select the bit control.
The preservation scenario checks Back, fresh-ten batches, Clear Counts, control
pages, stale releases, SIK cancellation/end-outside and placement without state loss.
The new visual scenario checks interruption, endpoints and display-only controls;
the lab scenario checks phase-sensitive operations, cancellation, exact lesson
preservation across mode boundaries and the feature-disabled path. See
[verification](VERIFICATION.md) for final run results. Preview success establishes
simulated behavior, not physical glasses comfort or hand-tracking reliability.

The native project includes SIK, UIKit, Leaf and the dependencies added by official
preview tooling. Package ownership and terms are listed in
[third-party notices](../../THIRD_PARTY_NOTICES.md). Lens Studio, the CLAD plugin and
owner sign-in are separate official tools; their executables and account configuration
are not distributed here. CLAD/MCP are needed for the automated authoring/test workflow,
not for the mathematical JavaScript tests.

For the dependency-free core, use Node.js 24 or newer. From the repository root:

```sh
node --test tests/*.test.js
node examples/offline-walkthrough.mjs
```

The seven original core modules in `src/` own quantum and lesson state, presentation, session,
focus, controls and random injection. The native CommonJS copies preserve that
logic, changing only the relative dependency extension from `.cjs` to `.js`.
The TypeScript components own rendering and supported native interaction.
The Node suite checks that the published native core copies exactly match the
generated science modules apart from the required module filename suffixes.
The new rendering helper and isolated gate module have separate generators and
native parity tests. They do not replace the original beginner controller.
See [the lesson API](LESSON_API.md) and [science criteria](SCIENCE_AND_ACCEPTANCE.md).

The approved planning workflow produced the native design brief. Its public edition
is `native/QuantumARExplorer/devpost/PUBLIC_DESIGN_BRIEF.md`; only administrative
provenance and private approval-routing notes are omitted. Functional requirements
and the official build/review guidance are retained.
The accompanying `devpost/QAR009_EVOLUTION.md` records the implementation
evolution under the owner's expanded QAR-009 scope; the original approved brief
remains preserved.

No Lens, competition entry or demonstration video has been uploaded or submitted.
