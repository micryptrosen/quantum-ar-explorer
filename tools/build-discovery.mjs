// Stage genuine runtime code for Lens Studio import. No native metadata is fabricated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function check(directory, writing = false) {
  for (let p = directory; ; p = path.dirname(p)) {
    if (fs.lstatSync(p).isSymbolicLink()) throw Error('Linked directory');
    const marker = fs.readdirSync(p, { withFileTypes: true }).some(e => e.isDirectory() && e.name.toLowerCase() === 'unauthorized location');
    if (writing && p === directory && marker) throw Error('Direct storage marker');
    if (path.dirname(p) === p) break;
  }
}
check(path.join(root, 'src')); check(path.join(root, '.local'), true);
const out = path.join(root, '.local/qar012-import-stage');
if (!fs.existsSync(out)) fs.mkdirSync(out);
check(out, true);
const source = fs.readFileSync(path.join(root, 'src/discovery.js'), 'utf8');
const generated = '// Generated from src/discovery.js; read-only optional discovery presentation.\n' +
  source.replaceAll('export function ', 'function ') + '\nmodule.exports = { describeDiscovery };\n';
fs.writeFileSync(path.join(out, 'discovery.js'), generated);
console.log('Staged discovery.js for supported native import.');
