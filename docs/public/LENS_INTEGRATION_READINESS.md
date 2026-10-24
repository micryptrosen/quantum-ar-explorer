# Native Lens integration — checked 2026-10-23

The native SPECS Base Template has been extended through actual CLAD and Lens
Studio MCP operations. Lens Studio 5.23.2 compiled and ran the three-stage lesson.
The first working milestone was a supported preview pinch changing the bit from 0
to 1. Three native LEAF scenarios passed lesson flow, simulated IK selection and
navigation/experiment preservation with stale/canceled input checks.
The QAR-009 evolution adds rendering transitions, spatial axis inspection, a
project-owned UIKit theme, an isolated optional gate lab and two new native
scenarios. [Verification](VERIFICATION.md) reports the current exact results.
QAR-010 adds state-derived lab instructions, clearer beginner feedback and a sixth
scenario for the judge journey, including measurement during an active visual
transition. The [judge walkthrough](OPEN_AND_TEST.md) documents the tested preview
input routes and the unresolved ordinary Windows mouse-selection boundary.
Hardware comfort and hand tracking remain untested.

## Architecture

The seven modules in `src/` own scientific and educational state independently of
Lens Studio. `tools/build-lens-core.mjs` generates their CommonJS equivalents.
`Assets/Scripts/QuantumCore/` in the native project contains the same code, changing
relative dependency suffixes from `.cjs` to `.js` for the Lens module loader.
No Node filesystem, process or networking API is used by these runtime modules.

`QuantumARExplorerBitMain.ts` binds the existing `createLessonControls` session to
native view components. Despite its first-milestone name it runs the full lesson.
`QuantumARExplorerBitUI.ts` uses SIK/UIKit controls and reports action IDs with the
revision captured at press start. The session consumes that revision before an
activation, preventing a queued stale release from repeating a measurement.
Stable objects are reused during redraw to avoid destroying SIK's active target.

`QuantumARExplorerBlochMesh.ts` renders parametric circles and a state vector.
Mathematical Bloch coordinates `(x,y,z)` map to Lens world `(x,z,-y)`, preserving
handedness with mathematical north displayed upward. The current diameter is 18 cm,
refined from the original 16 cm target under the owner's QAR-009 visual scope.
This is a mathematical state diagram and classical simulation, not a particle path
or the physical shape of a qubit. Probability labels describe the current state;
experiment counts describe observed measurements.

`visual-transition.js` and its generated native helper interpolate only the display
direction. Scientific probabilities commit immediately. The native UpdateEvent
disables after motion/brief feedback; it rotates an existing arrow mesh.
`QuantumARExplorerGateLab.ts` owns the optional lab's separate generated `gates.js`
controller. Native display epochs bridge its revision namespace and the beginner
controller. UIKit theme registration uses project-owned styles and the public
ThemeService API without editing the vendor package. The original core and
beginner controller remain intact.
The pure `describeGateLab` helper derives a short prompt from the actual complex
state and credible bounded history. It samples nothing and changes no state,
counts or revisions; ambiguous truncated histories receive general guidance.

The native LEAF scenario index registers visible-text lesson assertions and
simulated IK selection. Native preview calls additionally inspect real scene bounds,
rendered screenshots and fresh logs. Offline conversion tests supply regression
coverage and do not substitute for those native checks.

## Placement and interaction targets

The approved design calls for explicitly labeled manual placement of a stable
world-space teaching station, an initial distance of 110 cm and approximately
6 cm interactive targets. The original 16 cm sphere target and subsequent 18 cm
implementation refinement are recorded in the preserved brief and
[QAR-009 addendum](../../native/QuantumARExplorer/devpost/QAR009_EVOLUTION.md).
The scene does not recognize tables.
SIK/UIKit selection is used; gaze-only activation is not a dependency. The main
lesson is designed for supported hand selection without a phone or keyboard.

Snap's [positioning guide](https://developers.snap.com/spectacles/best-practices/design-for-spectacles/positioning-sizing-content)
recommends targets at least 2 degrees wide with at least 1 degree spacing. The
implementation is checked against those dimensions in actual preview. Physical
wearer comfort and tracking stability require separate hardware evaluation.

## Official tooling

The project was opened from the authentic SPECS Base Template and targeted
Spectacles. Authoring used the official CLAD standalone builder procedures and
native MCP scene, asset, TypeScript compile, preview and LEAF tools. The official
Devpost plan-lens workflow produced a brief approved with refinements; the public
planning edition is included under the native `devpost/` folder.

See [opening and tests](OPEN_AND_TEST.md) for the saved project and scenario IDs,
[package notices](../../THIRD_PARTY_NOTICES.md) for version/provenance distinctions,
and the [official competition resources](https://learn-specs.devpost.com/resources)
for the supported CLAD/MCP setup. Account credentials and machine configuration are
local setup and are not part of this source distribution.

A preview pass does not prove automatic surface detection, a persistent anchor
across sessions, physical glasses comfort, gaze-only interaction or submission.
