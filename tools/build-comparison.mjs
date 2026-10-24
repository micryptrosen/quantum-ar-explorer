// Export for genuine Lens Studio import; never hand-author native resource metadata.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function check(directory, writing = false) {
  for (let p = directory; ; p = path.dirname(p)) {
    if (fs.lstatSync(p).isSymbolicLink()) throw Error('Linked directory');
    const marker = fs.readdirSync(p, { withFileTypes: true }).some(e =>
      e.isDirectory() && e.name.toLowerCase() === 'unauthorized location');
    if (writing && p === directory && marker) throw Error('Direct storage marker');
    if (path.dirname(p) === p) break;
  }
}
check(path.join(root, 'src'));
const source = fs.readFileSync(path.join(root, 'src/comparison.js'), 'utf8');
const quantumImport = "import { prepare, probabilities, bloch, measure } from './quantum.js';";
const gatesImport = "import { applyGate, relativePhase } from './gates.js';";
if (!source.includes(quantumImport) || !source.includes(gatesImport)) throw Error('Unexpected comparison imports');
check(path.join(root, '.local'), true);
const output = path.join(root, '.local/qar011-import-stage');
if (!fs.existsSync(output)) fs.mkdirSync(output);
check(output, true);
const generated = '// Generated from src/comparison.js; independent optional phase comparison.\n' +
  source.replace(quantumImport, "const { prepare, probabilities, bloch, measure } = require('../QuantumCore/quantum.js');")
    .replace(gatesImport, "const { applyGate, relativePhase } = require('./gates.js');")
    .replaceAll('export function ', 'function ') +
  '\nmodule.exports = { describeComparison, createComparison };\n';
fs.writeFileSync(path.join(output, 'comparison.js'), generated);
console.log('Staged comparison.js for native import to QuantumOptional.');
