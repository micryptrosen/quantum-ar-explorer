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

The supplied native LEAF scenario index registers `qar006-lesson-flow`,
`qar006-ik-bit-selection` and `qar006-native-preservation`. Open the official LEAF panel in Lens Studio to run them
in preview. The first checks visible native text and real UIKit events through the
complete lesson; the second uses a simulated IK interactor to select the bit control.
The preservation scenario checks Back, fresh-ten batches, Clear Counts, control
pages, stale releases, SIK cancellation/end-outside and placement without state loss.
All three passed in canonical preview. Preview success establishes simulated
behavior, not physical glasses comfort or hand-tracking reliability.

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

The seven modules in `src/` own quantum and lesson state, presentation, session,
focus, controls and random injection. The native CommonJS copies preserve that
logic, changing only the relative dependency extension from `.cjs` to `.js`.
The TypeScript components own rendering and supported native interaction.
The Node suite checks that the published native core copies exactly match the
generated science modules apart from the required module filename suffixes.
See [the lesson API](LESSON_API.md) and [science criteria](SCIENCE_AND_ACCEPTANCE.md).

The approved planning workflow produced the native design brief. Its public edition
is `native/QuantumARExplorer/devpost/PUBLIC_DESIGN_BRIEF.md`; only administrative
provenance and private approval-routing notes are omitted. Functional requirements
and the official build/review guidance are retained.

No Lens, competition entry or demonstration video has been uploaded or submitted.
