// Generated from src/visual-transition.js; rendering only.
// Rendering-only direction interpolation. Scientific state commits separately.
// The arc is illustrative feedback, never a simulated physical qubit trajectory.
const copy = p => ({ x: p.x, y: p.y, z: p.z });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const unit = p => {
  const n = Math.hypot(p.x, p.y, p.z);
  return { x: p.x / n, y: p.y / n, z: p.z / n };
};
function point(p) {
  if (!p || !['x', 'y', 'z'].every(k => Number.isFinite(p[k]))) {
    throw new TypeError('Expected a finite Bloch direction');
  }
  if (Math.abs(Math.hypot(p.x, p.y, p.z) - 1) > 1e-6) {
    throw new RangeError('Expected a unit Bloch direction');
  }
  return copy(p);
}
function time(value) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Expected nonnegative time');
  return value;
}
function interpolateDirection(from, to, fraction) {
  const a = point(from), b = point(to);
  if (!Number.isFinite(fraction)) throw new TypeError('Expected finite progress');
  const t = Math.max(0, Math.min(1, fraction));
  if (t === 0) return a;
  if (t === 1) return b;
  const d = Math.max(-1, Math.min(1, dot(a, b)));
  if (d > 0.9995) return unit({ x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
  // A unique shortest arc does not exist for antipodes. Choose a stable display
  // plane, explicitly without inferring any preparation Hamiltonian.
  let tangent;
  if (d < -1 + 1e-10) {
    const seed = Math.abs(a.x) < 0.8 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
    const projection = dot(seed, a);
    tangent = unit({ x: seed.x - a.x * projection, y: seed.y - a.y * projection,
      z: seed.z - a.z * projection });
  } else tangent = unit({ x: b.x - a.x * d, y: b.y - a.y * d, z: b.z - a.z * d });
  const angle = Math.acos(d) * t, c = Math.cos(angle), s = Math.sin(angle);
  return unit({ x: a.x * c + tangent.x * s, y: a.y * c + tangent.y * s,
    z: a.z * c + tangent.z * s });
}

function createVisualTransition({ duration = 0.35, reducedMotion = false } = {}) {
  if (!Number.isFinite(duration) || duration < 0 || duration > 1) throw new RangeError('Duration must be 0..1 seconds');
  if (typeof reducedMotion !== 'boolean') throw new TypeError('Expected reducedMotion boolean');
  let revision = -1, from = { x: 0, y: 0, z: 1 }, target = copy(from);
  let started = 0, clock = 0, visible = false, moving = false, kind = 'reset';
  function sample(now) {
    clock = Math.max(clock, time(now));
    const raw = !moving || duration === 0 ? 1 : Math.min(1, (clock - started) / duration);
    const eased = raw * raw * (3 - 2 * raw);
    if (raw === 1) moving = false;
    return { point: moving ? interpolateDirection(from, target, eased) : copy(target),
      active: moving, progress: raw, revision, kind, visible,
      notice: moving ? 'Illustrative transition; current probabilities shown separately.' : '' };
  }
  return {
    sample,
    set(p, nextRevision, now, { instant = false, shown = true, event = 'prepare' } = {}) {
      const next = point(p); time(now);
      if (!Number.isSafeInteger(nextRevision) || nextRevision < 0) throw new RangeError('Expected valid revision');
      if (typeof instant !== 'boolean' || typeof shown !== 'boolean') throw new TypeError('Expected visibility/motion booleans');
      if (!['prepare', 'measurement', 'trials', 'navigation', 'reset'].includes(event)) throw new RangeError('Unknown visual event');
      if (nextRevision <= revision) return { accepted: false, ...sample(now) };
      const current = sample(now);
      const first = revision < 0 || !visible;
      const changed = Math.hypot(next.x - target.x, next.y - target.y, next.z - target.z) > 1e-9;
      revision = nextRevision; visible = shown; kind = event;
      if (!changed && shown && !first && !instant && !reducedMotion) {
        return { accepted: true, ...sample(now) };
      }
      from = current.point; target = next; started = clock;
      moving = shown && !first && changed && !instant && !reducedMotion && duration > 0;
      return { accepted: true, ...sample(now) };
    }
  };
}

module.exports = { interpolateDirection, createVisualTransition };
