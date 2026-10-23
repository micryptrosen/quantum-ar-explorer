# Native Lens integration — checked 2026-10-23

The native SPECS Base Template has been extended through actual CLAD and Lens
Studio MCP operations. Lens Studio 5.23.2 compiled and ran the three-stage lesson.
The first working milestone was a supported preview pinch changing the bit from 0
to 1. Three native LEAF scenarios passed lesson flow, simulated IK selection and
navigation/experiment preservation with stale/canceled input checks.
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
handedness with mathematical north displayed upward. The initial diameter is 16 cm.
This is a mathematical state diagram and classical simulation, not a particle path
or the physical shape of a qubit. Probability labels describe the current state;
experiment counts describe observed measurements.

The native LEAF scenario index registers visible-text lesson assertions and
simulated IK selection. Native preview calls additionally inspect real scene bounds,
rendered screenshots and fresh logs. Offline conversion tests supply regression
coverage and do not substitute for those native checks.

## Placement and interaction targets

The approved design calls for explicitly labeled manual placement of a stable
world-space teaching station, an initial distance of 110 cm, a 16 cm Bloch sphere,
and approximately 6 cm interactive targets. The scene does not recognize tables.
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
