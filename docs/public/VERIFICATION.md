# Verification of the finishing pass

QAR-007, October 23, 2026. This report distinguishes native preview results from
offline checks and physical-device work.

## Visual and educational review

The finishing pass added clearer stage headings and three-step progress, teal
headings and counters, a blue classical bit, and stronger teal/gold diagram strokes.
The qubit explanation explicitly identifies the Bloch sphere as a mathematical
state diagram. Completion has a clear title, explanation, Back, and Restart.

The 110 cm initial placement, 16 cm sphere, 6 cm control height, minimum 2.2 cm
gaps, both control pages, and manual placement functions remain. A custom button
fill rendered poorly and was removed; established neutral UIKit controls remain.
Default UIKit interaction feedback is retained. No frame-rate benchmark is claimed.

Scientific source is unchanged. Preparation, Z-basis probabilities, collapse,
repeat measurement, independent trials, and challenge explanations were reviewed.
Fresh trials explicitly reprepare the state. A small sample is not promised to
split evenly. This is a classical simulation, not a quantum processor.

## Completed checks

| Check | Result |
|---|---|
| Offline application suite | 49 passed, 0 failed |
| Local publication-guard suite | 89 passed, 0 failed |
| Generated native scientific modules | All seven match source |
| Additional native-module model checks | 20 phase/probability/collapse cases; 11 stale-callback comparisons passed |
| Canonical Lens Studio preview | Compiled and running; final refresh had no reported errors |
| Canonical LEAF suite | 3 passed, 0 failed |
| Fresh native reconstruction LEAF suite | 3 passed, 0 failed |
| Native resource preservation | All 53 authored resources match the tested reconstruction byte for byte |
| Separate read-only Codex source review | No material findings; it did not run tests or validate hardware |

Native scenarios are `qar006-lesson-flow`, `qar006-ik-bit-selection`, and
`qar006-native-preservation`. They retain their original IDs. Assertions for
visible headings were updated for the intentional progress text; scientific and
state-preservation assertions remain in place. An early old-heading assertion
failure and a reset-interrupted run were corrected and retained in local evidence.
The table reports final runs, rather than treating interrupted attempts as passes.

Recording QA exposed an extra cross-target callback after moving the station.
A shared 0.5-second settling interval now rejects placement input while the
station settles. A new native regression verifies rejection of the immediate
cross-target press, acceptance of a later deliberate press, unchanged state and
counts, Recenter, and input recovery. Two ordinary pinch cycles also passed.
The final canonical and reconstructed suites both passed after this correction.

The native checks cover all teaching stages, both control pages, preparation,
measurements, ten fresh trials, Clear Counts, Back, every challenge answer,
completion, restart, stale releases, cancellation/end-outside, and valid recovery.
Desktop move/start/end input changed the bit from 0 to 1. Ordinary supported pinch
and hover succeeded after resetting leftover synthetic LEAF input state.

Moving the preview camera 18 cm left the station fixed. Deliberate Recenter moved
the station to the new viewpoint. Manual repositioning preserved state and counts.
The reconstructed project generated its own private editor settings and cache;
those are excluded from public source.

## Demonstration and publication

The English narration, recording procedure, and owner submission copy are complete.
A genuine local demonstration is recorded and validated: 165.000 seconds (2:45),
H.264, 1392 by 2160, 30 frames per second, 4,950 frames. It is silent and captioned;
no recorded narration or music is claimed. The full file decoded without errors.

The edit trims idle time from real Lens Studio preview recordings. Lesson footage
uses the unchanged scientific/rendering implementation; manual placement footage
comes from the corrected final build. The original preview image is uncropped,
with title and captions in added margins. No Lens footage or outcomes were
fabricated, and playback speed is unchanged. Original takes are preserved locally.
The media is held outside public source for owner review. No YouTube upload or
Devpost submission has occurred.

## Practical limits

No physical SPECS glasses test has occurred. Real hand tracking, comfort, lighting,
and additive-display contrast remain untested. Translucent controls depend on the
environment. The world station's controls require looking back if it leaves view.
There is no automatic table detection or persistent cross-session physical anchor.

The authentic Learn planning brief and its public edition remain separate from
source-code test evidence. See [Open and test](OPEN_AND_TEST.md),
[the submission package](SUBMISSION.md), and [third-party notices](../../THIRD_PARTY_NOTICES.md).
