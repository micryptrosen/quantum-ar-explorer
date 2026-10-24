// Build a separate rendering helper; the seven scientific modules stay unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, '.local/qar009-import-stage');
// Explicitly authorized project descendant. Reject links and direct storage markers.
function check(dir, writing = false) {
  for (let p = dir; ; p = path.dirname(p)) {
    if (fs.lstatSync(p).isSymbolicLink()) throw new Error('Linked directory');
    const markers = fs.readdirSync(p, { withFileTypes: true }).filter(e =>
      e.isDirectory() && e.name.toLowerCase() === 'unauthorized location');
    if (writing && p === dir && markers.length) throw new Error('Direct storage marker');
    if (path.dirname(p) === p) break;
  }
}
check(path.join(root, 'src'));
const source = fs.readFileSync(path.join(root, 'src/visual-transition.js'), 'utf8');
if (!fs.existsSync(path.dirname(output))) {
  check(root, true); fs.mkdirSync(path.dirname(output));
}
check(path.dirname(output), true);
if (!fs.existsSync(output)) fs.mkdirSync(output);
check(output, true);
const result = '// Generated from src/visual-transition.js; rendering only.\n' +
  source.replaceAll('export function ', 'function ') +
  '\nmodule.exports = { interpolateDirection, createVisualTransition };\n';
fs.writeFileSync(path.join(output, 'transition.js'), result);
console.log('Generated rendering helper; import through Lens Studio before native use.');
