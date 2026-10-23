---
status: approved
---

# Design brief: Quantum AR Explorer — public edition

## The one spatial moment
I'm standing at an ordinary table, wearing SPECS glasses, with both hands free. That everyday surface becomes a miniature quantum laboratory: a glowing three-dimensional qubit sphere responds to state preparation and measurement, until a beginner says, "Oh! Now I get it!"

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free and eyes up.
- The learner walks around a spatial mathematical visualization in their surroundings and experiments with it, rather than watching a lecture.

## Product or overlay
- Type: product: the virtual laboratory is the experience.
- What the real version would sense: no recognition is required for this version.
- Stand-in for the preview: fixed manual laboratory placement, visibly labeled "Manual placement - table stand-in" (default). This does not detect a real table.

## Where things live
- The learner looks slightly down toward the laboratory in front of them.
- Laboratory: stable world-anchored teaching station at the learner's chosen position. Initial viewing distance is 110 cm, approved as an implementation target; verify visibility, comfort and targeting in the actual SPECS preview.
- Bloch sphere: initial diameter 16 cm, approved. Adjust only as necessary for legibility and space for controls.
- Provide accessible Recenter/Reposition controls. Placement is explicitly manual; moving/recentering the station must not silently track the head during the lesson.
- Status: above the experiment, 44 by 12 cm (default).
- Controls: below the experiment, initial panel size 44 by 16 cm (default); target approximately 6 cm interactive controls at 110 cm, with Snap's minimum target size and spacing respected. Verify the complete layout in preview and adjust layout for visibility. No head-locked main teaching panel.

## Hands and input
- Toggle bit, prepare 0/1/equal superposition, Next, Measure, challenge, Restart and placement: approved standard SIK/UIKit selection, mouse-based desktop preview testing and the applicable supported pinch interaction. The main learning experience requires no keyboard or handheld controller on supported SPECS hardware.
- Targets are big and provide visible targeting feedback. Use clear labels, high contrast and concise, scientifically accurate explanations.
- Do not depend on unverified gaze-only activation. Supported hardware selection must require no keyboard or handheld controller; actual glasses comfort/hand tracking remain unproven until tested on hardware.
- No voice is required; all explanations remain legible without audio.

## When things show
- Meet the Bit: display a definite 0 or 1 and one switch control.
- Meet the Qubit: show the sphere and preparation choices, explaining this is a mathematical visualization, not the physical shape of a qubit.
- Make a Measurement: show outcome, probability explanation, accumulated counts, repeat preparation and a short challenge.
- Completion: show feedback and Restart. Hide controls irrelevant to the current stage.
- No required task is placed behind the learner (default).

## Done criteria
Each one can be checked in Lens Studio's preview.
1. A visible classical bit switches between 0 and 1 using a supported control, with no blocking runtime error.
2. Next reaches the qubit stage; prepare 0, 1 and equal superposition and see a corresponding state vector and probabilities.
3. Measurement yields 0 or 1, collapses the state correctly, updates counts and explains the result; preparation enables repetition.
4. Complete the short challenge and reach completion; Restart restores the initial lesson and counts.
5. Walk around the laboratory and read instructions and controls without audio; manual placement stays explicitly labeled.
6. Recenter/reposition the teaching station using accessible supported controls; after placement it remains stable in world space while the preview camera moves. Verify visibility, target size/spacing, high contrast and scientific labels at the initial 110 cm distance.

## Out of scope
- Real table recognition, live vision, custom gestures, voice dependency, persistent sessions, multiplayer and recording people.

## Risks and open questions
- Feel unproven: physical glasses comfort and hand tracking.
- Owner approved with refinements on 2026-10-23. The initial 110 cm distance, 16 cm sphere and approximately 6 cm controls are approved targets, subject to actual preview verification. No unexecuted preview is represented as verified.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
