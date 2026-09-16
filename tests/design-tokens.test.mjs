import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildTokens, rootRules, declarations, asColor, asShadow, splitTop,
  evalClamp, appliesAtWidth, figmaName, stripComments,
} from '../tools/extract-design-tokens.mjs';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const tokens = buildTokens(html);

const byToken = (list, name) => list.find((x) => x.token === name);

/* ───────────────── 部品 ───────────────── */

test('色は #rgb も #rrggbbaa も rgba() も 0〜1 にする', () => {
  assert.deepEqual(asColor('#fff'), { r: 1, g: 1, b: 1, a: 1 });
  assert.deepEqual(asColor('#000000'), { r: 0, g: 0, b: 0, a: 1 });
  assert.deepEqual(asColor('rgba(255, 0, 0, .5)'), { r: 1, g: 0, b: 0, a: 0.5 });
  // 前置ゼロの無い小数（CSS でよく書かれる .20）
  assert.equal(asColor('rgba(244, 238, 226, .20)').a, 0.2);
  assert.equal(asColor('linear-gradient(180deg, #fff, #000)'), null);
});

test('影は inset を内側の影にし、広がりまで読む', () => {
  assert.deepEqual(asShadow('0 4px 14px rgba(20, 45, 30, .16)'), {
    type: 'DROP_SHADOW',
    color: { r: 0.078431, g: 0.176471, b: 0.117647, a: 0.16 },
    offset: { x: 0, y: 4 }, radius: 14, spread: 0,
    blendMode: 'NORMAL', visible: true,
  });
  assert.equal(asShadow('inset 0 1px 0 rgba(255,255,255,.70)').type, 'INNER_SHADOW');
  assert.equal(asShadow('0 0 0 1px rgba(165,129,31,.45)').spread, 1);
  assert.equal(asShadow('none'), null);
});

test('括弧の中の , では割らない', () => {
  assert.deepEqual(splitTop('0 0 0 1px rgba(1,2,3,.4), 0 0 12px rgba(5,6,7,.8)'),
    ['0 0 0 1px rgba(1,2,3,.4)', '0 0 12px rgba(5,6,7,.8)']);
});

test('clamp は幅ごとの実寸になる', () => {
  // 4.2vw は 320px で 13.44 → 下限 14 に張り付く。390px では 16.38 → 上限 16。
  assert.deepEqual(evalClamp('clamp(14px, 4.2vw, 16px)'), { 320: 14, 390: 16, 430: 16 });
  assert.equal(evalClamp('16px'), null);
  // % は基準が無いので読めない
  assert.equal(evalClamp('clamp(10%, 20%, 30%)'), null);
});

test('@media の幅条件は、その幅で成り立つかを返す', () => {
  assert.equal(appliesAtWidth('@media (max-width: 360px)', 320), true);
  assert.equal(appliesAtWidth('@media (max-width: 360px)', 390), false);
  assert.equal(appliesAtWidth('@media (min-width: 900px)', 430), false);
  // 幅以外の条件は判定しない
  assert.equal(appliesAtWidth('@media (prefers-reduced-motion: reduce)', 390), null);
});

test('宣言の読み取りは値の中の ; 以外で割らない', () => {
  const decls = declarations('--a: 1px; --b: rgba(1, 2, 3, .4); color: red; --c: a, b;');
  assert.deepEqual(decls, [['--a', '1px'], ['--b', 'rgba(1, 2, 3, .4)'], ['--c', 'a, b']]);
});

test('@media の中の :root は at に条件が付く', () => {
  const rules = rootRules(stripComments('@media (max-width: 360px) { :root { --x: 1px; } } :root { --y: 2px; }'));
  assert.equal(rules.length, 2);
  assert.equal(rules[0].at, '@media (max-width: 360px)');
  assert.equal(rules[1].at, null);
});

/* ───────────────── index.html に対して ───────────────── */

test('墨と和紙の両方の値を持つ', () => {
  assert.deepEqual(tokens.modes, ['washi', 'sumi']);
  const kin = byToken(tokens.colors, '--kin');
  assert.ok(kin, '--kin が無い');
  assert.equal(kin.themed, true);
  // 明は #a5811f、暗は #d9b75c
  assert.equal(Math.round(kin.values.washi.r * 255), 165);
  assert.equal(Math.round(kin.values.sumi.r * 255), 217);
});

test('演出を切った状態の値を既定として拾わない', () => {
  // :root[data-fx="off"] と @media (prefers-reduced-motion) が 0 にしている。
  // これを既定として写すと、Figma に「演出を切った画面」が写る。
  assert.equal(byToken(tokens.numbers, '--dur-scale').value, 1);
  assert.equal(byToken(tokens.numbers, '--shake-amp').value, 6);
  assert.equal(byToken(tokens.numbers, '--washi-grain'), undefined);
  // 和紙のざらつきは層を重ねたグラデなので Figma の塗りにはできないが、
  // :root[data-fx="off"] の `none` を拾ってしまっていないことは確かめる。
  const grain = tokens.notVariable.find((n) => n.token === '--washi-grain');
  assert.ok(grain, '--washi-grain が消えている');
  assert.ok(!/none/.test(grain.washi), '--washi-grain が none で上書きされている');
  assert.match(grain.washi, /repeating-linear-gradient/);
});

test('@media の上書きは別に、効く幅つきで残す', () => {
  const small = tokens.mediaOverrides.filter((m) => m.condition === '@media (max-width: 360px)');
  assert.ok(small.length >= 1, '360px 以下の上書きが拾えていない');
  const stage = small.find((m) => m.token === '--stage-h');
  assert.deepEqual(stage.appliesTo, [320]);
  assert.ok(stage.px, '幅ごとの実寸が出ていない');

  const wide = tokens.mediaOverrides.find((m) => m.condition === '@media (min-width: 900px)');
  assert.deepEqual(wide.appliesTo, [], '900px 以上は 320/390/430 のどれにも効かない');

  const motion = tokens.mediaOverrides.find((m) => m.condition.includes('reduced-motion'));
  assert.equal(motion.widthConditional, false);
});

test('別名は参照先の値まで解決する', () => {
  // --danger: var(--shu)。別名のままだと Figma で色が抜ける。
  const danger = byToken(tokens.colors, '--danger');
  assert.ok(danger, '--danger が色として出ていない');
  assert.equal(danger.aliasOf, '--shu');
  assert.deepEqual(danger.values, byToken(tokens.colors, '--shu').values);
});

test('余白・角丸・文字サイズがそろっている', () => {
  for (const t of ['--sp-1', '--sp-3', '--sp-5', '--sp-7', '--r-1', '--r-3', '--r-pill', '--tap']) {
    assert.ok(byToken(tokens.numbers, t), `${t} が無い`);
  }
  assert.equal(byToken(tokens.numbers, '--sp-5').value, 16);
  assert.equal(byToken(tokens.numbers, '--tap').value, 44, '最小タップは 44px');
  // 行送りと字間は Figma の % に直す
  assert.equal(byToken(tokens.numbers, '--lh-base').value, 155);
  assert.equal(byToken(tokens.numbers, '--ls-brush').value, 16);
});

test('Figma に写せない値は黙って消さず、理由をつけて残す', () => {
  const why = (t) => tokens.notVariable.find((n) => n.token === t)?.why ?? '';
  assert.match(why('--safe-b'), /env\(\)/);
  assert.match(why('--dur-1'), /calc\(\)/);
  assert.match(why('--fill-gold'), /Paint Style/);
  // グラデーションは塗りの一覧にも入る
  assert.ok(byToken(tokens.gradients, '--fill-gold'));
});

test('名前は群に分かれていて、CSS 名がそのまま末尾に残る', () => {
  assert.equal(figmaName('--kin-bright'), '色/金/kin-bright');
  assert.equal(figmaName('--sp-5'), '寸法/余白/sp-5');
  assert.equal(figmaName('--seat-2-deep'), '色/盤/席/seat-2-deep');
  assert.equal(figmaName('--shadow-2'), '効果/影/shadow-2');
  // 群に当たらないものは捨てずに その他 へ
  assert.match(figmaName('--nonexistent-token'), /^その他\//);
});

test('生成物に重複した名前が無い', () => {
  const names = [
    ...tokens.colors, ...tokens.numbers, ...tokens.strings, ...tokens.effectStyles,
  ].map((x) => x.name);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dup, [], `Figma の変数名が重複している: ${dup.join(', ')}`);
});

test('書き出し済みの tokens.json が index.html と一致している', () => {
  // 手で直されていないこと。ずれたら node tools/extract-design-tokens.mjs を流す。
  const onDisk = JSON.parse(readFileSync(resolve(root, 'figma/triad-ui-kit/tokens.json'), 'utf8'));
  assert.deepEqual(onDisk, tokens,
    'figma/triad-ui-kit/tokens.json が古い。node tools/extract-design-tokens.mjs を実行すること');
});
