/**
 * api 関数を1ファイルに束ねる。
 *
 * Supabase へ関数を送る経路はファイルの中身を呼び出しに直接載せる形で、
 * この関数の元ファイルは合計 230KB ほどあり1回に収まらない。esbuild で
 * index.ts / social.ts / rewards.ts / game-core.js を1本にまとめ、
 * リポジトリに置いた成果物を CDN 越しに取り込めるようにする。
 * 出力は build/api-bundle.js。生成物なので手で編集しない。
 */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'build/api-bundle.js');

// game-core.js は index.html から生成する。ここで作り直しておかないと、
// 共有ロジックに足した関数が入らないまま束ねてしまう（実際に一度そうなった）。
execFileSync(process.execPath, [resolve(root, 'tools/extract-edge-core.mjs')], { stdio: 'inherit' });

execFileSync('npx', [
  '--yes', 'esbuild@0.24.0',
  resolve(root, 'supabase/functions/api/index.ts'),
  '--bundle', '--format=esm', '--platform=neutral', '--target=deno1',
  '--alias:@supabase/supabase-js=jsr:@supabase/supabase-js@2',
  '--external:jsr:*',
  `--outfile=${out}`,
], { stdio: 'inherit', shell: process.platform === 'win32' });

console.log(`generated ${out}`);
