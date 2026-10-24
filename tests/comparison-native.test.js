import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createComparison } from '../src/comparison.js';

const raw = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
// Copy cross-realm containers without JSON's loss of negative zero.
const plain = value => Array.isArray(value) ? Array.from(value, plain) :
  value !== null && typeof value === 'object' ?
    Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, plain(entry)])) : value;

function actualNative() {
  const context = vm.createContext({});
  vm.runInContext('delete Object.hasOwn', context);
  const run = (source, require) => {
    const module = { exports: {} };
    vm.runInContext('(function(module,require){\n' + source + '\n})', context)(module, require);
    return module.exports;
  };
  const quantum = run(raw('native/QuantumARExplorer/Assets/Scripts/QuantumCore/quantum.js'), () => {
    throw Error('Unexpected core dependency');
  });
  const gates = run(raw('native/QuantumARExplorer/Assets/Scripts/QuantumOptional/gates.js'), name => {
    assert.equal(name, '../QuantumCore/quantum.js'); return quantum;
  });
  return run(raw('native/QuantumARExplorer/Assets/Scripts/QuantumOptional/comparison.js'), name => {
    if (name === '../QuantumCore/quantum.js') return quantum;
    assert.equal(name, './gates.js'); return gates;
  });
}

test('genuine native comparison source matches generation and all staged experiment snapshots', () => {
  const source = raw('src/comparison.js');
  const expected = '// Generated from src/comparison.js; independent optional phase comparison.\n' +
    source.replace("import { prepare, probabilities, bloch, measure } from './quantum.js';",
      "const { prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');")
      .replace("import { applyGate, relativePhase } from './gates.js';",
        "const { applyGate, relativePhase } = require('./gates.js');")
      .replaceAll('export function ', 'function ') +
    '\nmodule.exports = { describeComparison, createComparison };\n';
  assert.equal(raw('native/QuantumARExplorer/Assets/Scripts/QuantumOptional/comparison.js'), expected);
  const native = actualNative();
  for (const draw of [0, 0.5, 0.9999999999999999]) {
    const a = createComparison({ random: () => draw });
    const b = native.createComparison({ random: () => draw });
    for (const action of ['measure', 'next', 'next', 'next', 'next', 'measure', 'measure',
      'reset', 'next', 'reset', 'next', 'next', 'next', 'measure']) {
      const revision = a.snapshot().revision;
      assert.deepEqual(plain(b.snapshot()), a.snapshot());
      assert.deepEqual(plain(b.dispatch(action, revision)), a.dispatch(action, revision));
      assert.deepEqual(plain(b.dispatch(action, revision)), a.dispatch(action, revision), 'stale callback parity');
    }
    assert.equal(b.snapshot().a.result, 1); assert.equal(b.snapshot().b.result, 0);
  }
});

test('actual native comparison rolls back an invalid second sample and recovers without partial counts', () => {
  let samples = 0;
  const model = actualNative().createComparison({ random: () => ++samples === 2 ? NaN : 0.8 });
  for (let i = 0; i < 3; i++) assert.equal(model.dispatch('next', model.snapshot().revision).ok, true);
  const before = plain(model.snapshot()), bad = plain(model.dispatch('measure', before.revision));
  assert.equal(bad.code, 'INVALID_SAMPLE'); assert.equal(bad.trials, 0);
  assert.deepEqual(bad.a, before.a); assert.deepEqual(bad.b, before.b);
  const recovered = plain(model.dispatch('measure', bad.revision));
  assert.equal(recovered.ok, true); assert.equal(recovered.trials, 1);
  assert.deepEqual(recovered.a.counts, [0, 1]); assert.deepEqual(recovered.b.counts, [1, 0]);
});
