import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createComparison } from '../src/comparison.js';
import { describeDiscovery } from '../src/discovery.js';
const raw = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const plain = value => Array.isArray(value) ? Array.from(value, plain) :
  value !== null && typeof value === 'object' ?
    Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, plain(entry)])) : value;
function native() {
  const module = { exports: {} }, context = vm.createContext({ module });
  vm.runInContext('delete Object.hasOwn', context);
  vm.runInContext(raw('native/QuantumARExplorer/Assets/Scripts/QuantumOptional/discovery.js'), context);
  return module.exports;
}
test('genuine native discovery presentation equals its root source generation', () => {
  const expected = '// Generated from src/discovery.js; read-only optional discovery presentation.\n' +
    raw('src/discovery.js').replaceAll('export function ', 'function ') +
    '\nmodule.exports = { describeDiscovery };\n';
  assert.equal(raw('native/QuantumARExplorer/Assets/Scripts/QuantumOptional/discovery.js'), expected);
  assert.deepEqual(Object.keys(native()), ['describeDiscovery']);
});
test('actual native presentation matches both explanation levels through preparation, prediction, sampling, repeat and reset', () => {
  const api = native(), model = createComparison({ random: () => 0.7 });
  for (const action of [null, 'next', 'next', 'next', 'measure', 'measure', 'reset']) {
    if (action) assert.equal(model.dispatch(action, model.snapshot().revision).ok, true);
    const before = model.snapshot();
    for (const technical of [false, true]) {
      assert.deepEqual(plain(api.describeDiscovery(before, { technical })), describeDiscovery(before, { technical }));
    }
    assert.deepEqual(model.snapshot(), before);
  }
});
