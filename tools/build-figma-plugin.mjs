/**
 * Figma プラグインを組み立てる。
 *
 *   node tools/build-figma-plugin.mjs
 *     figma/triad-ui-kit/src/*.js  +  figma/triad-ui-kit/tokens.json
 *       → figma/triad-ui-kit/code.js
 *       → figma/triad-ui-kit/manifest.json（無ければ作る。あれば id を残して直す）
 *
 * なぜ束ねるのか
 *   Figma のプラグインは main に指定した 1 ファイルしか読まない。import も
 *   fetch も使えない（ローカルファイルは取りに行けない）。だから元を分けて書き、
 *   ここで 1 本に繋ぐ。tools/extract-edge-core.mjs が Edge 用に同じことをしている。
 *
 *   tokens.json も同じ理由で code.js の中へ埋める。プラグインから読めないため。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const kit = resolve(root, 'figma/triad-ui-kit');
const srcDir = join(kit, 'src');

/* トークンは index.html が正。束ねる前に必ず作り直す
   （古い tokens.json をプラグインへ焼き込むと、Figma と Web が静かにずれる）。 */
execFileSync(process.execPath, [resolve(root, 'tools/extract-design-tokens.mjs')], { stdio: 'inherit' });

const tokens = JSON.parse(readFileSync(join(kit, 'tokens.json'), 'utf8'));

/* src/ のファイルを名前順に繋ぐ。10- 20- … の番号が読み込み順。 */
const parts = readdirSync(srcDir).filter((f) => f.endsWith('.js')).sort();
if (!parts.length) throw new Error(`${srcDir} に元ファイルがない`);

const head = `/* ═══════════════════════════════════════════════════════════════════════
 * TRIAD UI Kit — Figma のデザインファイルを作るプラグイン
 *
 * これは生成物。直接編集しない。
 *   元  : figma/triad-ui-kit/src/*.js
 *   値  : figma/triad-ui-kit/tokens.json（index.html の :root から抽出）
 *   作り直し: node tools/build-figma-plugin.mjs
 *
 * 束ねた元ファイル: ${parts.join(' → ')}
 * ═══════════════════════════════════════════════════════════════════════ */

const DATA = ${JSON.stringify({ tokens }, null, 2)};
`;

const body = parts
  .map((f) => `\n/* ────────── src/${f} ────────── */\n\n${readFileSync(join(srcDir, f), 'utf8').trim()}\n`)
  .join('\n');

const code = `${head}${body}`;
writeFileSync(join(kit, 'code.js'), code);

/* manifest は「あれば id を残す」。Figma が発番した id を消さないため。 */
const manifestPath = join(kit, 'manifest.json');
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const manifest = {
  name: 'TRIAD UI Kit',
  ...(previous.id ? { id: previous.id } : {}),
  api: '1.0.0',
  main: 'code.js',
  editorType: ['figma'],
  documentAccess: 'dynamic-page',
  // 外へは一切出ない。値はすべて code.js の中にある。
  networkAccess: { allowedDomains: ['none'] },
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`code.js ${kb(code.length)}（元 ${parts.length} 本 + トークン ${kb(JSON.stringify(tokens).length)}）`);
console.log(`→ ${join(kit, 'code.js')}`);
