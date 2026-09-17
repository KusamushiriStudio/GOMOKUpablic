import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { NAME_MAX, sanitizeName } from '../supabase/functions/api/identity.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

/**
 * 孤立したサロゲート（対の片割れ）が残っているか。
 * 残っていると UTF-8 にできず、保存された名前が U+FFFD（�）へ化ける。
 */
function hasLoneSurrogate(s) {
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = s.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      i += 1;
    } else if (c >= 0xdc00 && c <= 0xdfff) return true;
  }
  return false;
}

/* ───────── 入力中に画面を作り直さない ───────── */

test('入力中は画面を作り直さない', () => {
  // 8秒ごとの取得のたびに render() が clear(root) していたため、
  // 名前を打っている最中に入力欄ごと差し替わり、打ちかけの文字が消え、
  // フォーカスも外れていた。これが「変更できる人とできない人がいる」の正体。
  assert.match(html, /function render\(\) \{[\s\S]{0,200}?if \(isTyping\(root\)\) \{ renderDeferred = true; return; \}/);
});

test('守るのは文字を打つ欄だけで、ボタンや選択肢は対象にしない', () => {
  const fn = html.slice(html.indexOf('function isTyping('), html.indexOf('let renderDeferred'));
  assert.match(fn, /TEXTAREA/);
  assert.match(fn, /isContentEditable/);
  assert.match(fn, /'text', 'search', 'email', 'password', 'tel', 'url', 'number', ''/);
  // 盤面には文字の入力欄が無いので、対局中の更新は止まらない
  assert.match(fn, /root\.contains\(el\)/, '画面の外の要素で止めないこと');
});

test('見送った作り直しは、入力欄から離れたときに流す', () => {
  // 流さないと、打ち終わったあとの画面が古いまま止まる。
  assert.match(html, /addEventListener\('focusout'[\s\S]{0,400}?renderDeferred && root && !isTyping\(root\)\) render\(\)/);
});

/* ───────── 名前が化けない ───────── */

test('切り詰めで絵文字を割らない（サーバ側）', () => {
  for (const input of ['あ' + '🎮'.repeat(8), 'あいう' + '🎲'.repeat(7), '🎮'.repeat(20)]) {
    const out = sanitizeName(input);
    assert.equal(hasLoneSurrogate(out), false, `${JSON.stringify(input.slice(0, 8))} で対が割れている`);
    assert.ok([...out].length <= NAME_MAX);
    // UTF-8 へ往復しても化けない
    assert.equal(Buffer.from(out, 'utf8').toString('utf8'), out);
  }
});

test('切り詰めで絵文字を割らない（画面側）', () => {
  // 画面側も同じ決まりで切る。片方だけ直しても、もう片方で割れる。
  assert.match(html, /const v = \[\.\.\.cleaned\]\.slice\(0, 16\)\.join\(''\)/);
  assert.doesNotMatch(html, /nameInput\.value \|\| ''\)\.replace\(\/\[<>&"'`\\\\\]\/g, ''\)\.trim\(\)\.slice\(0, 16\)/,
    '単位で切る古い書き方が残っている');
});

test('文字数は「文字」で数える', () => {
  assert.equal([...sanitizeName('🎮'.repeat(20))].length, NAME_MAX);
  assert.equal([...sanitizeName('あ'.repeat(20))].length, NAME_MAX);
});
