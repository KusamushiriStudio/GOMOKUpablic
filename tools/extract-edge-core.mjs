import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const roots = ['../../shared/constants.js', '../../shared/gacha.js', '../../shared/profile.js', '../../shared/rules.js', '../../shared/story/engine.js', '../../shared/story/stages.js'];

function moduleSource(name) {
  const marker = `__def(${JSON.stringify(name)}, function (__req) {`;
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`module not found: ${name}`);
  let pos = start + marker.length;
  let depth = 1;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (; pos < html.length; pos += 1) {
    const c = html[pos];
    const n = html[pos + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; pos += 1; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; pos += 1; continue; }
    if (c === '/' && n === '*') { blockComment = true; pos += 1; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return html.slice(start, pos + 1) + ');';
    }
  }
  throw new Error(`unterminated module: ${name}`);
}

const found = new Map();
const queue = [...roots];
while (queue.length) {
  const name = queue.shift();
  if (found.has(name)) continue;
  const source = moduleSource(name);
  found.set(name, source);
  for (const match of source.matchAll(/__req\((['"])(.*?)\1\)/g)) queue.push(match[2]);
}

const out = `// Generated from index.html by tools/extract-edge-core.mjs. Do not edit directly.\n`
  + `const __mods = new Map();\nconst __def = (id, factory) => __mods.set(id, { factory, exports: null });\n`
  + `const __req = (id) => { const m = __mods.get(id); if (!m) throw new Error('Missing module: ' + id); if (m.exports) return m.exports; const box = {}; const value = m.factory(__req, box) ?? box; m.exports = value; return value; };\n\n`
  + [...found.values()].join('\n\n')
  + `\n\nexport const constants = __req('../../shared/constants.js');\n`
  + `export const profile = __req('../../shared/profile.js');\n`
  + `export const rules = __req('../../shared/rules.js');\n`
  + `export const storyEngine = __req('../../shared/story/engine.js');\n`
  + `export const stages = __req('../../shared/story/stages.js');\n`;

const target = resolve(root, 'supabase/functions/api/game-core.js');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out);
console.log(`generated ${target} (${found.size} modules)`);
