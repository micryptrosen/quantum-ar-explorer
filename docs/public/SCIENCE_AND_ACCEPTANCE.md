# Scientific behavior and preview criteria

Audience: the general public with no quantum computing background.
Sequence: meet a classical bit, meet a qubit on a Bloch sphere, prepare and measure
a state, then answer a probability challenge.

For alpha|0> + beta|1>, normalized so |alpha|²+|beta|²=1, Z-basis probabilities
are |alpha|² and |beta|². The implementation simulates this distribution and replaces
the state with the measured basis state. Another measurement without preparation
returns the same result. Independent equal-superposition trials require a fresh
preparation each time; short runs need not split evenly. The sphere represents state,
not a particle's path. This is a classical simulation of a single qubit.

Offline tests cover basis certainty, superposition, collapse, phase, sphere coordinates,
input validation and lesson flow. The seeded 10,000-trial smoke test uses an interval
of 4,700–5,300 ones. It is a regression check rather than proof of randomness quality.

The original native preview scenarios verify:

- All three teaching stages work without runtime errors.
- Preparation labels, probabilities, sphere arrow and outcomes agree.
- Basis states are certain; repeated measurements preserve the collapsed result.
- Challenge feedback, completion and reset work without stale state.
- Supported UIKit selection and simulated IK input change the bit value.
- Text remains readable, key information does not rely on color or audio, and
  the complete sequence works twice without duplicate events.

The native controls capture the displayed revision when a press starts, so stale
callbacks cannot repeat a measurement or skip stages. Offline tests additionally
cover lost-input recovery and deterministic injected trials. An offline test is not
a native tracking or physical-device test. No physical glasses comfort, persistent
real-world anchor or automatic surface detection is claimed.

The optional single-qubit lab adds the exact Pauli-X, Hadamard and Pauli-Z matrices.
X swaps basis states. H maps 0 to positive equal superposition and 1 to negative
equal superposition. Z changes relative phase without changing Z-basis odds.
Starting at 0, H-Z-H gives a certain 1; H-H gives a certain 0. This contrast makes
phase observable through a subsequent gate, without describing phase as an
immediate change in Z-measurement probabilities. Relative phase is undefined when
one amplitude is zero. Displayed amplitudes and percentages are explicitly rounded.

Tests independently check Bloch rotation identities for 59 complex states,
involutions, global-phase invariance, normalization over 12,000 operations,
phase-sensitive sequences, collapse, injected sampling, stale input and recovery.
The native lab imports generated copies of the same mathematical functions.
There are no two-qubit or entanglement claims.

Brief arrow motion is rendering feedback. The model commits atomically, and
probability text describes that committed state during the illustrative arc.
It does not depict a classical object oscillating between 0 and 1. Reduced motion
shows the final state directly. Inspect Z adds a real 3D axis and projection: for
the authoritative Bloch height z, P(0)=(1+z)/2 and P(1)=(1-z)/2. Moving the preview
camera changes the view while leaving the world station and scientific state fixed.

See [current verification](VERIFICATION.md) for actual native results and limits.
