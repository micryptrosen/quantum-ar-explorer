// Export a staging file. Lens Studio imports it and creates real resource metadata.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function check(dir, writing = false) {
  for (let p = dir; ; p = path.dirname(p)) {
    if (fs.lstatSync(p).isSymbolicLink()) throw new Error('Linked directory');
    const markers = fs.readdirSync(p, { withFileTypes: true }).some(e =>
      e.isDirectory() && e.name.toLowerCase() === 'unauthorized location');
    if (writing && p === dir && markers) throw new Error('Direct storage marker');
    if (path.dirname(p) === p) break;
  }
}
check(path.join(root, 'src'));
const source = fs.readFileSync(path.join(root, 'src/gates.js'), 'utf8');
const imported = "import { validateState, prepare, probabilities, bloch, measure } from './quantum.js';";
if (!source.includes(imported)) throw new Error('Unexpected optional module imports');
const output = path.join(root, '.local/qar009-import-stage');
if (!fs.existsSync(path.dirname(output))) { check(root, true); fs.mkdirSync(path.dirname(output)); }
check(path.dirname(output), true);
if (!fs.existsSync(output)) fs.mkdirSync(output);
check(output, true);
const result = '// Generated from src/gates.js; optional isolated gate laboratory.\n' +
  source.replace(imported, "const { validateState, prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');")
    .replaceAll('export function ', 'function ') +
  '\nmodule.exports = { applyGate, relativePhase, createGateLab };\n';
fs.writeFileSync(path.join(output, 'gates.js'), result);
console.log('Generated staged gates.js; import to QuantumOptional through Lens Studio.');
