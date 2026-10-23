import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { buildLensCore, commonJSModule, MODULES } from '../tools/build-lens-core.mjs';
import * as quantum from '../src/quantum.js';
import { createLessonSession } from '../src/session.js';
import { createSeededRandom } from '../src/random.js';
import { createLessonControls } from '../src/controls.js';

const plain = value => JSON.parse(JSON.stringify(value));
test('published native core preserves generated scientific code with only module suffix changes', async () => {
  const files = await buildLensCore();
  for (const name of MODULES) {
    const expected = files[`${name}.cjs`].replace(/require\('\.\/([a-z]+)\.cjs'\)/g,
      "require('./$1.js')");
    const actual = await readFile(new URL(
      `../native/QuantumARExplorer/Assets/Scripts/QuantumCore/${name}.js`, import.meta.url), 'utf8');
    assert.equal(actual, expected, `${name}: regenerate the native core before publishing`);
  }
  // Native compiler, rendering and SIK interaction are separately checked in Lens Studio.
});

async function generatedCore() {
  const files = await buildLensCore(), cache = new Map();
  // Remove the newer helper that ES2019 does not promise. Never change the host.
  const context = vm.createContext({});
  vm.runInContext('delete Object.hasOwn', context);
  function load(name) {
    const key = name.replace(/^\.\//, '');
    if (!Object.hasOwn(files, key) || !key.endsWith('.cjs')) throw new Error('Unexpected module request');
    if (!cache.has(key)) {
      const module = { exports: {} };
      cache.set(key, module);
      const factory = vm.runInContext(`(function(module, require) {\n${files[key]}\n})`, context);
      factory(module, load);
    }
    return cache.get(key).exports;
  }
  return { files, load };
}

test('CommonJS export is reproducible and exposes every core module API', async () => {
  const { files, load } = await generatedCore();
  assert.deepEqual(files, await buildLensCore());
  for (const name of MODULES) {
    const source = await import(`../src/${name}.js`);
    assert.deepEqual(Object.keys(load(`${name}.cjs`)).sort(), Object.keys(source).sort());
  }
  const manifest = JSON.parse(files['core-manifest.json']);
  assert.equal(manifest.nativeVerification, 'pending');
  assert.equal(manifest.modules.length, MODULES.length);
});

test('generated quantum module works without Object.hasOwn and preserves phase/collapse', async () => {
  const q = (await generatedCore()).load('quantum.cjs');
  for (const name of ['zero', 'one', 'plus', 'minus', 'plusI']) {
    assert.deepEqual(plain(q.bloch(q.prepare(name))), quantum.bloch(quantum.prepare(name)));
    for (const draw of [0, 0.49, 0.51, 0.999999]) {
      const actual = q.measure(q.prepare(name), () => draw);
      assert.deepEqual(plain(actual), quantum.measure(quantum.prepare(name), () => draw));
      assert.equal(q.measure(actual.state, () => 1 - 1e-9).outcome, actual.outcome);
    }
  }
  for (const name of ['constructor', '__proto__', 'toString', 'unknown']) {
    assert.throws(() => q.prepare(name), /Unknown preparation/);
  }
});

test('generated session matches original across experiments, recovery, challenge and restart', async () => {
  const { load } = await generatedCore();
  const createGenerated = load('session.cjs').createLessonSession;
  const seeded = load('random.cjs').createSeededRandom;
  let broken = false;
  const render = () => { if (broken) throw new Error('renderer failure'); };
  const a = createLessonSession({ random: createSeededRandom(42), render });
  const b = createGenerated({ random: seeded(42), render });
  const actions = [
    { type: 'MEASURE' }, { type: 'TOGGLE_BIT' }, { type: 'NEXT' },
    { type: 'PREPARE', name: 'plus' }, { type: 'NEXT' },
    { type: 'RUN_TRIALS', name: 'plus', count: 250 }, { type: 'MEASURE' },
    { type: 'BACK' }, { type: 'NEXT' }, { type: 'NEXT' },
    { type: 'ANSWER', answer: 'alternating' }, { type: 'NEXT' },
    { type: 'ANSWER', answer: 'half-each' }, { type: 'NEXT' }, { type: 'RESTART' }
  ];
  for (let i = 0; i < actions.length; i++) {
    broken = i === 6;
    assert.deepEqual(plain(b.dispatch(actions[i])), plain(a.dispatch(actions[i])));
    assert.deepEqual(plain(b.getPresentation()), plain(a.getPresentation()));
    if (broken) {
      broken = false;
      assert.deepEqual(plain(b.refresh()), plain(a.refresh()));
      assert.equal(b.getState().trials, 251);
    }
  }
  assert.equal(b.getState().stage, 'bit');
  assert.equal(b.getState().trials, 0);
});

test('module conversion rejects unsupported syntax and imports instead of guessing', () => {
  for (const source of ['export default function run() {}', 'export { value };',
    "import { readFile } from 'node:fs';\nexport const value = 1;",
    "import { value as renamed } from './quantum.js';\nexport const result = 1;"]) {
    assert.throws(() => commonJSModule(source, 'session'));
  }
  assert.throws(() => commonJSModule('export const value = 1;', '../unrelated'));
});

test('generated control session preserves live action mapping and stale-callback rejection', async () => {
  const { load } = await generatedCore();
  const a = createLessonControls({ random: createSeededRandom(19) });
  const b = load('controls.cjs').createLessonControls({ random: load('random.cjs').createSeededRandom(19) });
  for (const available of [false, true]) {
    assert.deepEqual(plain(b.setInputAvailable(available)), plain(a.setInputAvailable(available)));
  }
  for (const id of ['toggle-bit', 'next', 'prepare-plus', 'next', 'fresh-plus-ten',
    'measure', 'next', 'answer-alternating', 'next', 'answer-half-each', 'next', 'restart']) {
    const oldA = a.getPresentation(), oldB = b.getPresentation();
    assert.deepEqual(plain(b.activate(id, oldB.revision)), plain(a.activate(id, oldA.revision)));
    assert.deepEqual(plain(b.getPresentation()), plain(a.getPresentation()));
    if (id === 'measure') {
      assert.deepEqual(plain(b.activate(id, oldB.revision)), plain(a.activate(id, oldA.revision)));
      assert.equal(b.getState().trials, 11);
    }
  }
  assert.equal(b.getState().stage, 'bit');
  assert.equal(b.getState().trials, 0);
});
