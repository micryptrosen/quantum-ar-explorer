# Quantum AR Explorer

An educational augmented-reality project for the general public, including people
with no quantum computing background. Intended for Snap SPECS and the Learn AR with
SPECS competition.

The experience introduces a classical bit, a qubit on a Bloch sphere, then
state preparation, measurement and a short probability challenge.

## Current development status

This repository contains a dependency-free scientific simulation, complete offline lesson
engine, accessible presentation models and a host session/focus boundary. It supports
back/restart, fresh-trial experiments, bounded history, challenge feedback and recovery.
The native SPECS project is in `native/QuantumARExplorer`. The three stages,
measurement, counts, challenge, completion and restart have run in Lens Studio
5.23.2 preview using SIK/UIKit controls. Three native LEAF scenarios passed for
lesson flow, simulated IK selection and preservation/cancellation. Physical glasses comfort and
hand tracking have not been tested. This is not a completed competition submission.

## Run the available tests

Use Node.js 24 or newer. No package installation is required.

```sh
node --test tests/*.test.js
node examples/offline-walkthrough.mjs
```

See [open and test instructions](docs/public/OPEN_AND_TEST.md) and
[scientific behavior and acceptance criteria](docs/public/SCIENCE_AND_ACCEPTANCE.md).
The [lesson API](docs/public/LESSON_API.md) describes the implemented contracts and
[native integration guide](docs/public/LENS_INTEGRATION_READINESS.md) describes the
module boundary and verified tooling. The CLI walkthrough is an offline demo,
not a Lens Studio preview.

## Open the Lens

Open `native/QuantumARExplorer/QuantumARExplorer.esproj` with Lens Studio 5.23.2.
Use the SPECS interactive preview. The laboratory uses explicitly labeled manual
placement; it does not recognize tables. Select controls with the supported
coordinate-pinch preview interaction. Mouse activation was not verified in the
current landscape setup; see the verification limits. See the [open and test guide](docs/public/OPEN_AND_TEST.md)
for native scenarios, package provenance and current limits, and the
[public planning brief](native/QuantumARExplorer/devpost/PUBLIC_DESIGN_BRIEF.md).

## Demonstration and submission materials

<img src="docs/public/preview-spatial.png" width="880" alt="Genuine Lens Studio SPECS preview showing the mathematical Bloch sphere and manual placement controls" />

Genuine desktop preview in Lens Studio's simulated Sunlit Outdoor environment.
The open diagram, compact state card and separate controls share a world station.
Physical glasses testing has not occurred.

The [submission package](docs/public/SUBMISSION.md) explains the product, audience,
spatial design, implementation, disclosures, and remaining owner steps. Use the
[timed demonstration script](docs/public/DEMO_SCRIPT.md) and
[recording guide](docs/public/RECORDING_GUIDE.md) with the real preview.
[Verification](docs/public/VERIFICATION.md) distinguishes completed checks from
physical-device work and platform uploads.

## Rights and attribution

Copyright 2026 Veristio Intelligence Technologies, LLC. All rights reserved.
No permissive open-source license has been authorized. See
[third-party notices](THIRD_PARTY_NOTICES.md) for provenance and redistribution status.
