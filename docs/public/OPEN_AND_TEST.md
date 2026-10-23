# Open and test

Current status: an offline JavaScript educational core, not yet a native Lens Studio
project. No .esproj, working AR preview, CLAD build or LEAF result is included yet.

Install requirements for the eventual Lens: Lens Studio 5.22 or newer, a SPECS Base
Template project, Snap CLAD, Lens Studio MCP, and the Devpost Learn skill pack.
Follow the official setup at https://learn-specs.devpost.com/resources.
The pack is at https://github.com/challengepost/learn-specs.
The official planning workflow has not yet been executed for this project.

For the available core, use Node.js 24 or newer. No dependencies are required.
From the repository directory, run:

```sh
node --test tests/*.test.js
node examples/offline-walkthrough.mjs
```

src/quantum.js provides state preparation, Z-basis probabilities, Bloch coordinates
and simulated measurement/collapse. src/lesson.js provides the lesson reducer and
a rendering-neutral view model. Tests use injected random values and a reproducible
seeded sample. Node success does not establish Lens runtime compatibility.

The lesson engine includes back/restart, fresh batches, bounded history, separate
fresh-preparation counters and challenge feedback. presentation.js, session.js and
focus.js supply app-owned display/input contracts and failure recovery. See LESSON_API.md.

Future native project instructions must identify the actual .esproj and required
SDK/plugin versions after integration. Scene, hands-free input and rendering remain
to be implemented and checked in the actual Lens Studio preview.
