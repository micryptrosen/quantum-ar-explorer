import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// This is a deliberately limited module conversion, not a JavaScript transpiler.
// Snap documents ES2019 + CommonJS for Lens runtime Script Modules. The generated
// files contain the same core logic; actual Lens compilation/preview remains required.
export const MODULES = Object.freeze(['quantum', 'lesson', 'presentation', 'session', 'focus', 'random']);
const identifier = /^[A-Za-z_$][\w$]*$/;
const sha256 = text => createHash('sha256').update(text).digest('hex');

export function commonJSModule(source, name) {
  if (!MODULES.includes(name)) throw new Error('Unknown core module');
  const exported = [];
  let body = source.replace(/^import \{ ([^\r\n]+) \} from '\.\/([a-z]+)\.js';\r?$/gm,
    (_, names, dependency) => {
      if (!MODULES.includes(dependency) || !names.split(',').every(value => identifier.test(value.trim()))) {
        throw new Error('Unsupported core import');
      }
      return `const { ${names} } = require('./${dependency}.cjs');`;
    });
  body = body.replace(/^export (function|class|const) ([A-Za-z_$][\w$]*)/gm, (_, kind, key) => {
    if (exported.includes(key)) throw new Error('Duplicate core export');
    exported.push(key);
    return `${kind} ${key}`;
  });
  if (!exported.length || /^\s*(?:import|export)\b/m.test(body)) throw new Error('Unsupported module syntax');
  return `// Generated from src/${name}.js by tools/build-lens-core.mjs. Do not edit.\n`
    + `'use strict';\n${body.replace(/\r\n/g, '\n').trimEnd()}\n`
    + `module.exports = { ${exported.join(', ')} };\n`;
}

export async function buildLensCore() {
  const root = new URL('../src/', import.meta.url);
  const files = {};
  const manifest = { format: 1, target: 'ES2019/CommonJS', nativeVerification: 'pending', modules: [] };
  for (const name of MODULES) {
    const source = await readFile(new URL(`${name}.js`, root), 'utf8');
    const generated = commonJSModule(source, name);
    files[`${name}.cjs`] = generated;
    manifest.modules.push({ source: `src/${name}.js`, sourceSHA256: sha256(source),
      output: `${name}.cjs`, outputSHA256: sha256(generated) });
  }
  files['core-manifest.json'] = JSON.stringify(manifest, null, 2) + '\n';
  return files;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.length !== 4 || process.argv[2] !== '--out') {
    throw new Error('Usage: node tools/build-lens-core.mjs --out <verified-output-directory>');
  }
  const destination = path.resolve(process.argv[3]);
  const files = await buildLensCore();
  await mkdir(destination, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(path.join(destination, name), content);
  console.log(`Wrote ${MODULES.length} core modules and source hashes to ${destination}`);
  console.log('Native Lens compilation and preview verification are still required.');
}
