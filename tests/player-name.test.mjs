import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  NAME_FALLBACK, NAME_MAX, displayNameOf, needsNameSync, sanitizeName,
} from '../supabase/functions/api/identity.js';

const src = () => readFileSync(new URL('../supabase/functions/api/index.ts', import.meta.url), 'utf8');

/* ───────────── 名札の決まり ───────────── */

test('日本語の名前はそのまま通る', () => {
  assert.equal(sanitizeName('テスト太郎'), 'テスト太郎');
  assert.equal(sanitizeName('ヒバナ'), 'ヒバナ');
});

test('紛らわしい記号は落とす', () => {
  assert.equal(sanitizeName('<script>あ</script>'), 'scriptあ/script');
  assert.equal(sanitizeName('a"b\'c`d\\e&f'), 'abcdef');
});

test('制御文字と幅を持たない字は名札に入れない', () => {
  // 見た目が同じ別名を作られると、一覧でも検索でも見分けが付かなくなる。
  // 実物を書くと編集のたびに壊れるので、符号位置から組み立てる。
  const ZWSP = String.fromCharCode(0x200b);   // 幅の無い空白
  const RLO = String.fromCharCode(0x202e);    // 書字方向の上書き
  const NUL = String.fromCharCode(0x00);
  assert.equal(sanitizeName('あ' + ZWSP + 'い'), 'あい');
  assert.equal(sanitizeName('あ' + RLO + 'い'), 'あい');
  assert.equal(sanitizeName('あ' + NUL + 'い'), 'あい');
});

test('前後の空白は落とし、16文字で切る', () => {
  assert.equal(sanitizeName('  なまえ  '), 'なまえ');
  assert.equal(sanitizeName('あ'.repeat(30)).length, NAME_MAX);
  assert.equal(sanitizeName('   '), '', '空白だけは名前として認めない');
});

test('交友側の名札は空にならない', () => {
  assert.equal(displayNameOf(''), NAME_FALLBACK);
  assert.equal(displayNameOf('   '), NAME_FALLBACK);
  assert.equal(displayNameOf(null), NAME_FALLBACK);
  assert.equal(displayNameOf('テスト太郎'), 'テスト太郎');
});

test('同じ名前なら書き直さない', () => {
  assert.equal(needsNameSync('テスト太郎', 'テスト太郎'), false);
  assert.equal(needsNameSync('あなた', 'テスト太郎'), true);
  // 記号を落とした結果が同じなら書かない
  assert.equal(needsNameSync('なまえ', ' なまえ '), false);
  // 未設定は書く
  assert.equal(needsNameSync(null, 'なまえ'), true);
});

/* ───────────── これが直したかった不具合そのもの ───────────── */

test('/name は資産側と交友側の両方を書き換える', () => {
  // 本番では triad_profiles.data.name が「テスト太郎」、
  // profiles.display_name が「あなた」のまま残っていた。
  // 自分の画面だけ名前が変わり、他人からは前の名前で見えていた。
  const s = src();
  const block = s.slice(s.indexOf("if (path === '/name')"), s.indexOf("if (path === '/gacha')"));
  assert.match(block, /await syncDisplayName\(ctx\.db, userId, name\)/, '交友側の名札を直すこと');
  assert.match(block, /await syncRoomMemberName\(ctx\.db, userId, name\)/, '待合室の席の名前も直すこと');
});

test('名札の同期は、同じなら書かない', () => {
  const s = src();
  const fn = s.slice(s.indexOf('async function syncDisplayName'), s.indexOf('async function syncRoomMemberName'));
  assert.match(fn, /needsNameSync\(/, '毎回の取得で更新を投げないこと');
});

test('対戦が始まった席の名前は書き換えない', () => {
  // seatSnapshot は履歴。あとから名前を変えても過去の対戦は変えない。
  const s = src();
  const fn = s.slice(s.indexOf('async function syncRoomMemberName'), s.indexOf('const asMillis'));
  assert.match(fn, /room\.status !== 'lobby'/, '待合室のときだけ直すこと');
});

test('取得のたびに、ずれた名札が自分で直る', () => {
  const s = src();
  const block = s.slice(s.indexOf("if (path === '/me' || path === '/world/poll')"), s.indexOf("if (path === '/name')"));
  assert.match(block, /syncDisplayName\(ctx\.db, userId, loaded\.profile\.name\)/,
    '/name を直す前に名前を変えた人も、次の取得で他人に新しい名前が見えること');
  assert.match(block, /const loaded = await loadProfile\(ctx\.db, userId\)/);
  assert.match(block, /viewOf\(ctx\.db, userId, loaded\.profile\)/, '読み直しを増やさないこと');
});

test('名札の作り方が2か所に分かれていない', () => {
  const s = src();
  assert.match(s, /const cleanName = \(value: unknown\) => sanitizeName\(value\)/);
  assert.match(s, /const display_name = displayNameOf\(profile\?\.name\)/);
  // 生の slice(0, 16) が残っていると、そこだけ別の決まりになる
  assert.doesNotMatch(s, /\.slice\(0, 16\)/);
});
