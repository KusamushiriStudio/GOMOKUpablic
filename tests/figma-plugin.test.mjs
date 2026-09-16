import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

import { createFakeFigma } from './helpers/fake-figma.mjs';

const root = resolve(import.meta.dirname, '..');
const code = readFileSync(resolve(root, 'figma/triad-ui-kit/code.js'), 'utf8');
const tokens = JSON.parse(readFileSync(resolve(root, 'figma/triad-ui-kit/tokens.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'figma/triad-ui-kit/manifest.json'), 'utf8'));

/**
 * code.js を偽の Figma の上で最後まで走らせる。
 * プラグインは main() を呼びっぱなしにして closePlugin で終わるので、
 * それを待つ。失敗したときは notify(error) に理由が入る。
 */
async function run(options = {}) {
  const fake = createFakeFigma(options);
  const sandbox = { figma: fake.figma, console: { log() {}, error() {} } };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'code.js' });

  const deadline = Date.now() + 20000;
  while (fake.figma.__closed === undefined && Date.now() < deadline) {
    await new Promise((r) => setImmediate(r));
  }
  const failure = fake.notices.find((n) => n.error);
  return { ...fake, failure, closed: fake.figma.__closed };
}

const pageNames = (fake) => fake.figma.root.children.map((p) => p.name);
const walk = function* (node) {
  for (const child of node.children || []) { yield child; yield* walk(child); }
};
const findAll = (node, fn) => [...walk(node)].filter(fn);

/* ───────────────── manifest ───────────────── */

test('manifest が Figma の要る形になっている', () => {
  assert.equal(manifest.api, '1.0.0');
  assert.equal(manifest.main, 'code.js');
  assert.deepEqual(manifest.editorType, ['figma']);
  // dynamic-page を宣言していないと、既存ページの中身を触れない
  assert.equal(manifest.documentAccess, 'dynamic-page');
  // 外へ出ない。値は全部 code.js の中にある。
  assert.deepEqual(manifest.networkAccess, { allowedDomains: ['none'] });
});

test('code.js は生成物で、直接編集しないと書いてある', () => {
  assert.match(code.slice(0, 600), /これは生成物。直接編集しない/);
  assert.match(code, /const DATA = \{/);
});

/* ───────────────── 走らせる ───────────────── */

test('最後まで例外なく走る', async () => {
  const fake = await run();
  assert.equal(fake.failure, undefined, `失敗: ${fake.failure?.message}`);
  assert.notEqual(fake.closed, undefined, 'closePlugin まで届いていない（途中で止まった）');
});

test('§0-4 のページが順番どおりにそろう', async () => {
  const fake = await run();
  const names = pageNames(fake);
  const wanted = ['00_DesignSystem', '01_Home', '02_Battle', '03_Online', '04_Practice',
    '05_Story', '06_Gacha', '07_DressUp', '08_Friends', '09_Spectator',
    '10_Settings', '11_Result', '12_Components', '13_Prototype'];
  assert.deepEqual(names.slice(0, wanted.length), wanted);
});

test('色・寸法・書体の変数が tokens.json の数だけできる', async () => {
  const fake = await run();
  const colors = fake.created.variables.filter((v) => v.resolvedType === 'COLOR');
  const floats = fake.created.variables.filter((v) => v.resolvedType === 'FLOAT');
  const strings = fake.created.variables.filter((v) => v.resolvedType === 'STRING');
  assert.equal(colors.length, tokens.colors.length);
  assert.equal(floats.length, tokens.numbers.length + tokens.responsive.length);
  assert.equal(strings.length, tokens.strings.length);

  // 墨と和紙の 2 つのモードに値が入っていること
  const kin = colors.find((v) => v.name === '色/金/kin');
  assert.ok(kin, '色/金/kin が無い');
  assert.equal(Object.keys(kin.valuesByMode).length, 2, '金の値が 1 モードしか無い');
});

test('モードを 1 つしか持てないプランでも、墨を捨てずに別集合へ逃がす', async () => {
  const fake = await run({ modeLimit: 1 });
  assert.equal(fake.failure, undefined, `失敗: ${fake.failure?.message}`);
  const names = fake.created.collections.map((c) => c.name);
  assert.ok(names.includes('TRIAD 色'), '色の集合が無い');
  assert.ok(names.includes('TRIAD 色（sumi）'), '墨の逃がし先が作られていない');
  const sumiCol = fake.created.collections.find((c) => c.name === 'TRIAD 色（sumi）');
  const sumiVars = fake.created.variables.filter((v) => v.variableCollectionId === sumiCol.id);
  assert.equal(sumiVars.length, tokens.colors.length, '墨側に全色が入っていない');
});

test('文字スタイル 6 種が、実装の値で作られる', async () => {
  const fake = await run();
  const names = fake.created.textStyles.map((s) => s.name);
  assert.deepEqual(names, ['TRIAD/タイトル', 'TRIAD/大見出し', 'TRIAD/見出し',
    'TRIAD/本文', 'TRIAD/補助', 'TRIAD/数字']);

  const byName = Object.fromEntries(fake.created.textStyles.map((s) => [s.name, s]));
  // .brush-title-main は --fs-title。390px での実寸 32.76px。
  assert.equal(byName['TRIAD/タイトル'].fontSize,
    tokens.responsive.find((r) => r.token === '--fs-title').px['390']);
  // .mokufuda .fuda-main は CSS 側が直値 23px
  assert.equal(byName['TRIAD/大見出し'].fontSize, 23);
  // .card > h2 は直値 15px。--fs-* を通っていないので、そこへ寄せない。
  assert.equal(byName['TRIAD/見出し'].fontSize, 15);
  assert.equal(byName['TRIAD/本文'].fontSize, 16);
  assert.equal(byName['TRIAD/補助'].fontSize, 12);

  // どのスタイルにも、対応する CSS の場所が書いてある
  for (const s of fake.created.textStyles) assert.match(s.description, /[.（]/);
});

test('効果と塗りは和紙・墨の 2 本ずつ（Figma のスタイルにモードが無いため）', async () => {
  const fake = await run();
  assert.equal(fake.created.effectStyles.length, tokens.effectStyles.length * 2);
  for (const entry of tokens.effectStyles) {
    for (const label of ['和紙', '墨']) {
      assert.ok(fake.created.effectStyles.some((s) => s.name === `TRIAD/${entry.name}/${label}`),
        `${entry.token} の ${label} が無い`);
    }
  }
  assert.equal(fake.created.paintStyles.length, tokens.gradients.length * 2,
    'グラデーションが塗りに直せていないものがある');
});

test('層を重ねたグラデは塗りに数えない（--washi-grain）', () => {
  // repeating-linear-gradient を 4 層重ねた値は Figma の塗り 1 つにできない。
  // 「グラデだから塗りにできる」と一括りにするとプラグインが落ちるので、
  // 抽出の段階で gradients から外し、理由を notVariable に残す。
  assert.ok(!tokens.gradients.some((g) => g.token === '--washi-grain'));
  const entry = tokens.notVariable.find((n) => n.token === '--washi-grain');
  assert.ok(entry, '--washi-grain が notVariable にも無い（黙って消えている）');
  assert.match(entry.why, /写せない/);
  // 単層の --fill-* は塗りにできる
  assert.ok(tokens.gradients.some((g) => g.token === '--fill-gold'));
});

test('部品が 11 個そろい、どれも Auto Layout になっている', async () => {
  const fake = await run();
  const comps = findAll(fake.figma.root, (n) => n.type === 'COMPONENT');
  const names = comps.map((c) => c.name).sort();
  assert.deepEqual(names, [
    'TRIAD_CharacterCard', 'TRIAD_Currency', 'TRIAD_Dialog', 'TRIAD_Navigation',
    'TRIAD_NotificationBadge', 'TRIAD_PlayerCard', 'TRIAD_PrimaryButton',
    'TRIAD_RailButton', 'TRIAD_ResultPanel', 'TRIAD_SecondaryButton', 'TRIAD_SkillButton',
  ]);
  for (const c of comps) {
    assert.ok(c.layoutMode === 'VERTICAL' || c.layoutMode === 'HORIZONTAL',
      `${c.name} が Auto Layout でない（§0-9）`);
    assert.ok(c.description, `${c.name} に説明が無い`);
  }
});

test('操作する部品は最小タップ 44px を割らない', async () => {
  const fake = await run();
  const comps = findAll(fake.figma.root, (n) => n.type === 'COMPONENT');
  const tap = tokens.numbers.find((n) => n.token === '--tap').value;
  // 押させないもの（赤丸の報せ）と、入れ物（窓・結果・札・帯・ナビ）は除く
  for (const c of comps.filter((c) => !['TRIAD_NotificationBadge', 'TRIAD_Dialog',
    'TRIAD_ResultPanel', 'TRIAD_CharacterCard', 'TRIAD_PlayerCard', 'TRIAD_Navigation'].includes(c.name))) {
    assert.ok(c.width >= tap, `${c.name} の幅 ${c.width}px が ${tap}px を割っている`);
    assert.ok(c.height >= tap, `${c.name} の高さ ${c.height}px が ${tap}px を割っている`);
  }
  // ナビは 1 つあたりの幅で見る
  const nav = comps.find((c) => c.name === 'TRIAD_Navigation');
  assert.ok(nav.width / 6 >= 44, `ナビ1つ ${(nav.width / 6).toFixed(1)}px が 44px を割っている`);
});

test('ホームが 390 の上下・320・430 の 4 枚できる', async () => {
  const fake = await run();
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  const frames = home.children.filter((n) => n.type === 'FRAME');
  const names = frames.map((f) => f.name);
  assert.deepEqual(names.sort(), ['01_Home/320', '01_Home/390', '01_Home/390／送り', '01_Home/430'].sort());
  for (const f of frames) {
    const width = Number(/\/(\d+)/.exec(f.name)[1]);
    assert.equal(f.width, width);
    assert.equal(f.height, { 320: 780, 390: 844, 430: 932 }[width]);
  }
});

test('ホームは固定座標で並べず、前景を Auto Layout で積む（§0-9）', async () => {
  const fake = await run();
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  for (const f of home.children.filter((n) => n.type === 'FRAME')) {
    const fg = f.children.find((c) => c.name === '前景');
    assert.ok(fg, `${f.name} に前景が無い`);
    assert.equal(fg.layoutMode, 'VERTICAL', `${f.name} の前景が Auto Layout でない`);
    assert.ok(fg.children.length >= 3, `${f.name} の前景の中身が少なすぎる`);
  }
});

test('ホームの左右の余白は --gutter の幅ごとの実寸に合う', async () => {
  const fake = await run();
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  const gutter = tokens.responsive.find((r) => r.token === '--gutter');
  for (const f of home.children.filter((n) => n.type === 'FRAME' && !n.name.includes('送り'))) {
    const width = String(/\/(\d+)/.exec(f.name)[1]);
    const fg = f.children.find((c) => c.name === '前景');
    assert.equal(fg.paddingLeft, Math.round(gutter.px[width]),
      `${f.name} の左余白が --gutter(${gutter.px[width]}) と合わない`);
    assert.equal(fg.paddingLeft, fg.paddingRight);
  }
});

test('主要ボタンは 4 隅とも画面に収まり、幅は等分される', async () => {
  const fake = await run();
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  const gutter = tokens.responsive.find((r) => r.token === '--gutter');
  for (const f of home.children.filter((n) => n.type === 'FRAME' && !n.name.includes('送り'))) {
    const width = Number(/\/(\d+)/.exec(f.name)[1]);
    const row = findAll(f, (n) => n.name === '主要ボタン')[0];
    assert.ok(row, `${f.name} に主要ボタンの列が無い`);
    assert.equal(row.children.length, 2);
    const inner = width - Math.round(gutter.px[String(width)]) * 2;
    const each = (inner - row.itemSpacing) / 2;
    assert.ok(each >= 100, `${f.name} で主要ボタン 1 枚が ${each.toFixed(1)}px しかない`);
    for (const b of row.children) {
      assert.equal(b.height, Math.round(width * 0.28),
        `${f.name} の主要ボタンの高さが画面幅の 28% でない`);
    }
  }
});

test('副ボタンは 4 枚で、320px でも 1 枚 60px を確保できる', async () => {
  const fake = await run();
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  const gutter = tokens.responsive.find((r) => r.token === '--gutter');
  for (const f of home.children.filter((n) => n.type === 'FRAME' && !n.name.includes('送り'))) {
    const width = Number(/\/(\d+)/.exec(f.name)[1]);
    const row = findAll(f, (n) => n.name === '副ボタン')[0];
    assert.ok(row, `${f.name} に副ボタンの列が無い`);
    assert.equal(row.children.length, 4, '完成イメージは 世界／ガチャ／衣／鍛 の 4 枚');
    const inner = width - Math.round(gutter.px[String(width)]) * 2;
    const each = (inner - row.itemSpacing * 3) / 4;
    assert.ok(each >= 60, `${f.name} で副ボタン 1 枚が ${each.toFixed(1)}px しかない`);
  }
});

test('試作の線が 5 本張られ、行き先が実在する', async () => {
  const fake = await run();
  const withReactions = findAll(fake.figma.root, (n) => n.reactions && n.reactions.length);
  assert.equal(withReactions.length, 5, `試作の線が ${withReactions.length} 本しかない`);
  const ids = new Set(findAll(fake.figma.root, () => true).map((n) => n.id));
  for (const node of withReactions) {
    for (const r of node.reactions) {
      assert.equal(r.trigger.type, 'ON_CLICK');
      assert.ok(ids.has(r.actions[0].destinationId), `${node.name} の行き先が見つからない`);
    }
  }
});

test('二度続けて実行しても、同じ数にしかならない', async () => {
  // Figma は実行のたびに新しい領域で code.js を動かすが、ファイルの中身は残る。
  // それを写すため、入れ物は毎回作り直し、figma だけ同じものを渡す。
  const fake = createFakeFigma();
  for (let i = 0; i < 2; i += 1) {
    fake.figma.__closed = undefined;
    const sandbox = { figma: fake.figma, console: { log() {}, error() {} } };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: `code.js#${i + 1}` });
    const deadline = Date.now() + 20000;
    while (fake.figma.__closed === undefined && Date.now() < deadline) {
      await new Promise((r) => setImmediate(r));
    }
    assert.equal(fake.notices.find((n) => n.error), undefined,
      `${i + 1} 回目で失敗: ${fake.notices.find((n) => n.error)?.message}`);
  }
  assert.equal(fake.created.textStyles.length, 6, '文字スタイルが二重にできている');
  assert.equal(fake.created.variables.filter((v) => v.resolvedType === 'COLOR').length,
    tokens.colors.length, '色の変数が二重にできている');
  const comps = findAll(fake.figma.root, (n) => n.type === 'COMPONENT');
  assert.equal(comps.length, 11, '部品が二重にできている');
  const home = fake.figma.root.children.find((p) => p.name === '01_Home');
  assert.equal(home.children.filter((n) => n.type === 'FRAME').length, 4, 'ホームが二重にできている');
});

test('書体が少ない端末でも止まらない', async () => {
  // 日本語書体が 1 つも無い環境。pickFont が Inter へ落ちる。
  const fake = await run({ fonts: [['Inter', 'Regular'], ['Inter', 'Bold'], ['Inter', 'Medium']] });
  assert.equal(fake.failure, undefined, `失敗: ${fake.failure?.message}`);
  assert.equal(fake.created.textStyles.length, 6);
  for (const s of fake.created.textStyles) assert.equal(s.fontName.family, 'Inter');
});
