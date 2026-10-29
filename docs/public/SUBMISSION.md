# Quantum AR Explorer

Prepared English submission copy. The owner reviews and submits this material.
No competition entry or video upload is represented as complete.

## Short description

Turn a familiar space into a miniature quantum laboratory. Prepare a qubit,
measure it, and discover why one result is certain while another is a probability.

## Product description

Quantum computing often starts with unfamiliar notation. Quantum AR Explorer
starts with an experiment. Designed for curious beginners, the Lens introduces
one idea at a time: Meet the Bit, Meet the Qubit, and Make a Measurement.

First, switch a classical bit between its two definite values. Then explore a
three-dimensional Bloch sphere: a mathematical diagram of a single qubit's state.
Prepare 0, 1, or an equal superposition and compare the displayed probabilities.
Measure the state to obtain a definite 0 or 1. Measure again without preparing
to see the same collapsed result. Finally, run fresh independent trials, inspect
the counters, and test your understanding in a short challenge with feedback.

The teaching station stays in world space until the learner deliberately moves
it. Manual placement, Recenter, and small repositioning steps let the learner
choose a useful location. Placement does not detect a table or physical surface.
Large labeled controls use supported SIK/UIKit selection. The lesson's input
design needs no keyboard, phone, or handheld controller on supported SPECS
hardware; desktop verification uses simulated input.

The diagram occupies open space beside a compact explanation card, with labeled
0/1 poles, prominent stage progress and a separate interaction dock. This keeps
the quantum state at the center of attention while its explanation stays readable.
Inspect Z adds an axis and height projection that connect the 3D arrow to the
probabilities. Brief arrow transitions can be turned off. After completing the
beginner lesson, an optional X/H/Z gate lab offers a further discovery: states with
the same Z-measurement odds can have different phase and produce different later
outcomes. Returning preserves the beginner experiment exactly.
Short prompts follow the learner's actual lab state: try X, observe H's equal
superposition, apply Z without changing the immediate odds, then compare H-Z-H
with H-H. The learner predicts, measures and compares using the same controls.

An optional Discover phase entry offers a short discovery alongside the beginner
journey. It deliberately prepares two compact 15 cm instruments with the same
50/50 measurement odds but different arrow directions. Will the same operation
give the same result? After applying it, the computed probabilities become
certain but different: A predicts 1; B predicts 0. Ordinary measurement confirms
those predictions. The initially identical odds did not describe the whole state:
the difference was quantum phase. The final operation changes the probabilities
before the different certain results are measured.

The default explanation uses ordinary language. Curious learners can open Details
for complex amplitudes, relative phase and the actual H/Z history, or Reset to
follow the full preparation sequence. These are two independent qubits, not
entanglement. Returning restores the entry lesson or lab without changing its
experiment. Larger labels, contextual Help and a visible measurement Next support
the complete three-stage beginner path; comparison remains optional.

## Problem and audience

Beginners can confuse a quantum probability with a hidden classical value, or
assume ten fair trials must produce five of each result. The Lens makes these
misconceptions testable through preparation, measurement, repetition, and feedback.
It is intended for the general public, informal learning, and introductory
demonstrations. No quantum background is required.

## Why spatial AR

The state diagram and controls form a small laboratory in the learner's
surroundings. A three-dimensional arrow makes the relation between basis states
and a superposition visible in space. The station remains fixed as the viewpoint
changes, while preparation and measurement connect that diagram to observable
results. The goal is a brief moment of understanding through direct experimentation.

## Features

- Three guided teaching stages with Back and Restart.
- Classical bit switching and qubit preparation in 0, 1, and equal superposition.
- An 18 cm Bloch diagram with state direction, labels, and probabilities.
- Interruptible 350 ms illustrative transitions and a motion-off control.
- A spatial Z-axis/projection tool relating height to measurement probabilities.
- Z-basis measurement, collapse, repeat measurement, and fresh-trial experiments.
- Outcome counters, bounded history, a ten-trial action, and Clear Counts.
- A probability challenge with explanatory feedback and a completion state.
- Explicit manual world placement, Recenter, and reposition controls.
- High contrast text, large targets, and information conveyed beyond color.
- Protection against duplicate, canceled, stale, and remapped selections.
- An optional isolated X/H/Z lab with complex amplitudes, phase and its own counts.
- An optional plain-language phase discovery, technical Details, reset and exact return.

## Technical implementation and required tools

Lens Studio 5.23.2 hosts the real SPECS Base Template project. An AI coding agent
used the official CLAD plugin and Lens Studio MCP to construct and inspect the
native experience. The official Devpost Learn `plan-lens` workflow produced a
brief, refined through owner review; its public edition is in the native
project's `devpost` folder.

Seven dependency-free JavaScript modules own the scientific model, lesson,
presentation, session, focus, random injection, and controls. Generated CommonJS
copies run inside the Lens. TypeScript components adapt that model to UIKit/SIK
and draw the parametric Bloch diagram. Separate rendering and gate modules add
display interpolation and exact single-qubit matrices. Render and input behavior remain separate
from scientific state. Native LEAF scenarios exercise real preview interactions,
navigation, experiment preservation, and cancellation/recovery.

This is a classical simulation of a single qubit, not a quantum processor.
Equal-superposition Z measurements have theoretical probabilities of 50% each;
a small sample need not divide evenly. The sphere represents mathematical state,
not an electron, orbit, or particle trajectory.

## Innovation and what was learned

The contribution is a focused learning interaction: prepare, predict, measure,
repeat, and explain, in a stable spatial laboratory. The project combines a
scientifically testable model with a short beginner lesson rather than asking
the learner to interpret an unexplained animation. It does not claim to be the
first quantum learning application.

The description and demonstration stand on their own. A comprehensive engineering
article is optional supplemental evidence; no article upload or publication is
represented as complete.

The design process emphasized deliberate world placement, readable targets,
concise explanations, and the difference between a probability before measurement
and a definite state afterward. The axis projection makes a spatial relationship
inspectable. The optional H-Z-H versus H-H experiment gives phase a visible
consequence. Native testing also exposed the need to preserve all controls when
paging, reject releases from a changed view, and isolate independent revision
counters when returning from the lab.

## Future Applications and Scalability

The working Lens separates scientific simulation, lesson progression, presentation
models, interaction routing, state management, tests, and native spatial rendering.
The dependency-free scientific model can be tested independently of UIKit/SIK;
native adapters turn its state into spatial diagrams and guarded interactions.
This separation supports investigation of other learning experiences without
treating the current Lens as an already reusable commercial platform.

Future opportunities include interactive technical instruction and assessments
for **Veristio Training**, educational book companions for **Veristio Press**,
visual writing education, story development and guided workshops for **Authors
Resort**, and product onboarding, guidance and workflow demonstrations for
**Veristio Software**. These are proposed adaptations, not completed integrations.
The Lens does not currently run on websites, mobile devices, or inside Authors
Resort. Broader integration work is deferred until after the hackathon.

## Verification and limits

The scientific suite includes complex-state gate identities, phase-sensitive
sequences, normalization, collapse, animation interruption and recovery. The
original native scenarios and added visual/lab scenarios exercise the real preview.
The current product checkpoint and its exact results are reported in
[verification](VERIFICATION.md). The [judge walkthrough](OPEN_AND_TEST.md) explains
the verified CLAD/MCP coordinate-pinch route and eleven LEAF scenarios.
The current protected local V8 review movie is 169 seconds, 1920 x 1080,
H.264 at 30 fps, silent with English captions. The [timed script](DEMO_SCRIPT.md)
matches its SRT. Genuine Lens Studio 5.23.2 SPECS 27 Sunlit Outdoor footage uses
CLAD/MCP simulated pinch. QAR-016 has since improved native Details layout and
backing; this protected movie has not been replaced or uploaded by this tranche.

The phase predictions and actual recorded outcomes remain valid. No new voice,
video upload, legal declaration or final competition submission is claimed.
Current coordinate-pinch input and LEAF are the verified preview routes; ordinary
Windows short-click activation remains unresolved before the application guard.

No physical SPECS glasses test has occurred. Preview testing establishes simulated
behavior; it does not establish real hand tracking, comfort, lighting robustness,
automatic surface recognition, or persistence across sessions. Recenter controls
belong to the world station: look back toward it if it leaves the field of view.

## Links and technologies

Repository: [micryptrosen/quantum-ar-explorer](https://github.com/micryptrosen/quantum-ar-explorer).

Video URL: **OWNER TO INSERT THE ACTUAL PUBLIC YOUTUBE URL AFTER UPLOAD.**

Technologies: Lens Studio 5.23.2; SPECS Base Template; CLAD; Lens Studio MCP;
Devpost Learn; JavaScript; TypeScript; SpectaclesInteractionKit;
SpectaclesUIKit; MeshBuilder; LEAF; Node.js; Git; GitHub.

## Attribution, rights, and development disclosure

Project-authored code was developed with AI coding assistance for Veristio
Intelligence Technologies, LLC. Repository commits document project-specific
implementation beginning on October 23, 2026. Standard vendor template, render resources,
and SDK/test packages predate this project and remain vendor-owned. See
[third-party notices](../../THIRD_PARTY_NOTICES.md) for exact resources, versions,
and applicable terms. No other project's application source is identified as
incorporated in the public project. The owner must confirm this disclosure and
the original-work attestation before submission.

Project-authored code retains its stated copyright; no new general open-source
license is declared here. Public availability is distinct from a license grant.
The owner handles the competition's required judging permissions and legal
attestations. No music, user avatar artwork, or third-party promotional logo was
added to the lesson.

## Owner submission checklist

- Review the final working preview, submission text, and demonstration.
- Choose the actual entrant and, where applicable, authorized representative.
- Confirm eligibility, development dates, disclosures, resource rights, and
  required judging access/permissions under the current official rules.
- Publish the reviewed real demonstration publicly on YouTube; check playback,
  duration below three minutes, privacy, and rights. Replace the video placeholder.
- Open the public repository while signed out; check the native project and
  public planning brief are available.
- Enter the approved English description, actual repository URL, technology list,
  and real YouTube URL in Devpost. Perform all account and legal attestations.
- Submit personally by the owner's earlier target: November 9, 2026, 2:00 PM
  Arizona. The [official deadline](https://learn-specs.devpost.com/rules) is
  5:00 PM EST that day, which converts to 3:00 PM Arizona. Keep the one-hour buffer
  and retain the platform confirmation.

Current requirement sources, checked October 24, 2026:
[official rules](https://learn-specs.devpost.com/rules) and
[resources](https://learn-specs.devpost.com/resources). The rules require a new
SPECS Lens using the stated workflow, a public source repository, English materials,
and a working demonstration publicly available on YouTube. Owner submission is
still required.
