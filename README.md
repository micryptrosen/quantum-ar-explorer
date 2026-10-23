# Quantum AR Explorer

An educational augmented-reality project for the general public, including people
with no quantum computing background. Intended for Snap SPECS and the Learn AR with
SPECS competition.

The planned experience introduces a classical bit, a qubit on a Bloch sphere, then
state preparation, measurement and a short probability challenge.

## Current development status

This repository contains a dependency-free scientific simulation, complete offline lesson
engine, accessible presentation models and a host session/focus boundary. It supports
back/restart, fresh-trial experiments, bounded history, challenge feedback and recovery.
The native Lens Studio scene and project files are not
implemented yet. A working Lens Studio preview, official planning workflow and LEAF
acceptance have not been verified. This is not a completed competition submission.

## Run the available tests

Use Node.js 24 or newer. No package installation is required.

```sh
node --test tests/*.test.js
node examples/offline-walkthrough.mjs
```

See [open and test instructions](docs/public/OPEN_AND_TEST.md) and
[scientific behavior and acceptance criteria](docs/public/SCIENCE_AND_ACCEPTANCE.md).
The [lesson API](docs/public/LESSON_API.md) describes the implemented contracts and
[Lens integration readiness](docs/public/LENS_INTEGRATION_READINESS.md) records verified
setup references and remaining native work. The CLI walkthrough is an offline demo,
not a Lens Studio preview.

## Planned Lens requirements

Lens Studio 5.22 or newer, an authentic SPECS Base Template project, Snap CLAD,
Lens Studio MCP, and the Devpost Learn skill pack. Follow the
[official competition resources](https://learn-specs.devpost.com/resources).
Actual native project opening/build instructions will be added after integration.

## Rights and attribution

Copyright 2026 Veristio Intelligence Technologies, LLC. All rights reserved.
No permissive open-source license has been authorized. See
[third-party notices](THIRD_PARTY_NOTICES.md) for provenance and redistribution status.
