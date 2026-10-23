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

The native preview and three LEAF scenarios verified:

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
