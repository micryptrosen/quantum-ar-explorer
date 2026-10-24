# Verification of the immersive product checkpoint

QAR-009, October 23, 2026. The QAR-008 source build and 2:45 landscape video
remain preserved. This report distinguishes native preview, mathematical checks
and work requiring physical glasses.

## Product changes

The open 3D station retains a compact explanation card and separate controls.
The Bloch cage grows from 16 to 18 cm; pole labels gain vertical space. The
station is 52 cm wide, initially 110 cm away. Controls retain 6 cm height and at
least 2.2 cm gaps. Project-owned charcoal/cyan styles add clear borders, brighter
hover and gold press feedback through the public UIKit theme API. Label size
increases from 39 to 43 Lens units. Vendor packages remain byte-identical.

Preparation and measurement have brief, interruptible 350 ms arrow transitions.
The scientific model commits immediately; probability text remains authoritative,
and an on-screen notice identifies the illustrative arc. The path is not a
physical evolution simulation. Motion off snaps to the current state. Measurement
results persist until the appropriate next operation. Fresh-trial feedback
explicitly distinguishes preparing again from repeating a collapsed measurement.

Inspect Z adds a real 3D measurement axis, projection and height tick. The current
Bloch height relates to P(0)=(1+z)/2 and P(1)=(1-z)/2. Viewpoint motion changes the
view of the fixed station, while manual Recenter deliberately moves it. Neither
axis inspection nor the motion preference changes scientific state or samples.

After the three-stage beginner lesson and challenge, the optional Gate Lab offers
X, H, Z, Measure, Reset Lab and Return Lesson. It owns separate state, counts and
revisions, and preserves the beginner snapshot on return. Complex amplitudes,
rounded probabilities and relative phase are shown explicitly. H-Z-H from 0 gives
1, while H-H gives 0; the intervening Z changes phase without changing Z-basis
odds. Relative phase is undefined when either amplitude is zero. The component
can be disabled or detached to retain the full beginner experience.

## Completed checks

| Check | Result |
|---|---|
| Offline application suite | 82 passed, 0 failed, none skipped |
| Local publication-guard suite | 127 passed, 0 failed |
| Original native scientific modules | All seven match source exactly |
| Additional native-model checks | 20 model cases and 11 stale-callback comparisons passed |
| Final canonical native LEAF | 5 passed, 0 failed |
| Fresh source-only reconstruction LEAF | 5 passed, 0 failed |
| Canonical/reconstruction parity after tests | All 68 files match byte for byte |
| Independent source review | No material findings in the scoped implementation/control files |

The original scenario IDs and sources remain unchanged: `qar006-lesson-flow`,
`qar006-ik-bit-selection`, and `qar006-native-preservation`. New scenarios are
`qar009-visual-spatial-contracts` and `qar009-optional-gate-lab`. They cover
interruption and endpoints, reduced motion, display-only tools, X/H/Z and collapse,
cancellation, held input across mode boundaries, exact beginner-state restoration,
and the feature-disabled beginner path. The new source manifest includes
`.gitattributes`, the public planning brief and the implementation addendum;
QAR-008's earlier 53-file runtime/project proof omitted the first two, which were
already published. Counts therefore use explicitly different inventory scopes.

The mathematical gate checks include independent Bloch identities for 59 complex
states, global-phase invariance, involutions, H-Z-H versus H-H, tiny nonzero phase,
12,000-operation normalization, immutable snapshots, stale sampling, reentrancy,
invalid-sampler rollback and recovery. Separate native parity checks compare the
generated rendering and gate helpers with source.

Early native lab runs exposed an unsupported display event name and a Return path
that advanced the beginner revision. Both were corrected before the final five
scenario runs. Original assertions were preserved. Failed attempts and diagnostic
captures are retained locally rather than counted as successful verification.

## Performance observations

The authored diagram topology has 3,528 triangles and 3,528 vertices, 36 more than
QAR-008. The optional lab adds no diagram geometry. Idle ABC and lab-enabled
comparison previews returned 249 and 250 scene objects, respectively, with the
same 31 exposed RenderMeshVisual labels. The additional lab controller explains
the extra object. Inspector labels are not a physical component census.

Meshes are built once and transformed during motion. The display UpdateEvent
disables after animation or brief feedback; it does not run continuously while
idle. No frame-time, input-latency, allocation, battery or device benchmark was
measured. Passing preview interactions and small static budgets are not an FPS
or hardware-performance guarantee.

## Demonstration and limits

The current retained fallback is `Quantum-AR-Explorer-QAR008-demo-final-v2.mp4`:
165 seconds, 1920 by 1080, H.264, 30 fps, silent with English captions. Its full
export decoded successfully and remains hash-verified. It depicts the earlier
QAR-008 product. A new genuine QAR-009 demonstration is being prepared; it is not
yet represented as recorded or validated by this product checkpoint.

Coordinate pinch at fresh visible control centers and LEAF simulated IK are the
verified native input routes. Named-target automation reported the button's own
child collider as obstructing the target; it was not forced through. Mouse probes
showed hover without activation in the landscape setup. Mouse activation remains
unverified. Timed native render-target captures show differing arrow poses, but
those diagnostic images contain LEAF overlays and distorted target aspect; they
are not the public demonstration or proof that request metadata and pixels share
an exact instant.

No physical SPECS test or novice user study has occurred. Real hand tracking,
wearer comfort, additive-display contrast, lighting robustness and device
performance remain untested. Charcoal simulation surfaces do not establish an
opaque black backing on an additive display. Look back toward world controls if
the station leaves view. Placement is manual, with no table recognition or
cross-session physical anchor. No Lens, YouTube video or Devpost entry has been
uploaded or submitted. Public source excludes local evidence and private setup.

See [Open and test](OPEN_AND_TEST.md), [science criteria](SCIENCE_AND_ACCEPTANCE.md),
[submission copy](SUBMISSION.md) and [third-party notices](../../THIRD_PARTY_NOTICES.md).
