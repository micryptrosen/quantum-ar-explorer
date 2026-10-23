# Native Lens integration readiness — checked 2026-10-23

No native adapter, .esproj, scene or package manifest is fabricated here. The pure
session/presentation/focus contracts are app-owned and remain unverified in Lens Studio.

## Core module export

Snap's [scripting overview](https://developers.snap.com/lens-studio/features/scripting/script-overview)
documents ES2019 JavaScript. Its [Script Modules guide](https://developers.snap.com/lens-studio/features/scripting/script-modules)
documents CommonJS with literal relative `require` paths and `module.exports`.
The core now avoids the newer `Object.hasOwn` helper.

Run `npm run build:lens-core -- --out .local/lens-core` to generate six CommonJS
modules and a manifest of source/output hashes. The converter only handles this
repository's explicit named imports and declaration exports; unsupported module
syntax fails. It does not transpile arbitrary JavaScript or generate native assets.
Choose an authorized output directory before invoking it. The generated files may
later be copied into an authentic Lens project's Assets directory after reviewing
its structure. They must be imported as modules rather than attached as components.

Node tests compare the generated exports, quantum states, seeded experiment flow,
history, challenge, restart and render recovery against the original ESM modules.
The isolated test context removes `Object.hasOwn`. These checks establish module
conversion parity; Lens compilation, actual runtime support and preview remain pending.

## Verified setup references

Snap requires Lens Studio 5.22+ and a SPECS Base Template saved through File > Save As.
See [Setup Lens Studio](https://developers.specs.com/docs/clad/setup/setup-lens-studio).

Keep the prepared project open before starting the agent in that folder. Snap's
[Codex setup](https://developers.specs.com/docs/clad/setup/setup-ai/codex-setup)
describes the ls-extensions marketplace, ls-clad plugin and checking the lens-studio
MCP connection. These steps have not been executed here; no approval/security settings
were changed. Existing coding-agent availability alone is not Lens connectivity.

The [SIK setup guide](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/get-started)
describes a preconfigured Base Template. For manual setup it identifies world Device
Tracking, Spectacles targeting/preview override and a compiled SIK prefab. Prefer the
actual current SPECS template and inspect its versions instead of duplicating packages.

## Smallest proposed native scene

| App-owned logical object | Native work still required |
|---|---|
| Lesson root/panel | Inspect template root/camera/tracking; choose a comfortable placement mechanism |
| Title, explanation, status, feedback | Native text objects and verified label binding |
| Bit value | Labeled 0/1 display and a supported interactable |
| Bloch sphere, 0/1 poles, arrow | Native mesh/material/transform mapping; verify axes and scale |
| Preparation, measure, navigation, quiz controls | SIK interactables with stable names and one action per activation |
| Probability bars/counts/history summary | Native render bindings; distinguish current theoretical probabilities from observed counts |
| Focus feedback | Wire a verified focus source, disabled-state checks and loss-of-tracking cancellation |

No remote assets are required for this proposed minimal scene. Record exact template,
SIK, SDK and any later asset licenses/versions before redistribution. The source
modules use modern JavaScript; confirm the native loader/compiler before porting them.

Snap's [positioning guide](https://developers.snap.com/spectacles/best-practices/design-for-spectacles/positioning-sizing-content)
ties content size to viewing distance, binocular overlap and head comfort. It recommends
targetable elements at least 2 degrees wide and at least 1 degree apart. These are
design references, not evidence that a particular anchor, distance or dwell input has
been implemented. Persistent spatial anchoring is not needed for the current lesson;
the initial placement/recentering mechanism remains a native integration decision.

## Actual preview and LEAF gates

The [preview guide](https://developers.snap.com/spectacles/get-started/start-building/preview-panel)
documents interactive Spectacles simulation and stereo views. Verify the intended
SPECS template's current preview mode rather than treating older device rendering as
physical-device evidence.

[LEAF](https://developers.specs.com/docs/clad/tools/test-your-lens-with-leaf)
uses a SPECS project with SIK interactables, compatible Leaf/SIK packages, registered
scenarios and an attached scenario index. Its trigger/drag/hover interactions simulate
SIK inputs. Reset preview, run scenarios and preserve actual Logger results. Native
non-SIK focus input may require a custom interactor; Node focus tests are not LEAF.

Future adapter acceptance: compile without errors; render all stages; show correct
state/probability/collapse; verify focus cancellation and single activation; exercise
back/restart/recovery; run all declared LEAF criteria and the complete preview flow.
Hardware comfort, hands-free tracking support and rendering remain unverified.
