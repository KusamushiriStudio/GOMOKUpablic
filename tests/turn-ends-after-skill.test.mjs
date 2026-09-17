import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { constants, rules } = await import('../supabase/functions/api/game-core.js');

/** 席1をユキネ（氷結）にする。氷結は空き交点だけを対象にするので、初手から使える。 */
function freshMatch(order = ['yukine', 'hibana', 'mamori']) {
  const seats = order.map((charId, i) => ({
    seat: i + 1, charId, name: constants.CHARACTER_BY_ID[charId].name, kind: 'human',
  }));
  return rules.createMatch({ matchId: 'turn-test', mode: 'online', seats, startSeat: 1 });
}

const skillIdOf = (charId) => constants.CHARACTER_BY_ID[charId].skill.id;

/* ───────────── これが直したかった不具合 ───────────── */

test('スキルを使ったら、その時点で手番が終わる', () => {
  const state = freshMatch();
  assert.equal(state.turn, 1);

  const out = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'freeze', index: 40 });
  assert.equal(out.ok, true, out.message);
  // 以前はここで pending が残り、同じ人がもう1個置けてしまっていた
  assert.equal(out.state.pending, null, 'スキルのあとに追加配置を残さないこと');
  assert.notEqual(out.state.turn, 1, '手番が次の人へ回ること');
  assert.equal(out.state.turn, 2);
});

test('スキルの直後に石を置こうとしても、自分の手番ではない', () => {
  const state = freshMatch();
  const used = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'freeze', index: 40 });
  assert.equal(used.ok, true);
  const again = rules.applyAction(used.state, { type: 'place', seat: 1, index: 41 });
  assert.equal(again.ok, false, 'スキルのあとに石を置けてはいけない');
});

test('石を置いたら、その時点で手番が終わる', () => {
  const state = freshMatch();
  const out = rules.applyAction(state, { type: 'place', seat: 1, index: 40 });
  assert.equal(out.ok, true, out.message);
  assert.equal(out.state.pending, null);
  assert.equal(out.state.turn, 2);
});

test('6人全員、どの行動順でも追加配置は 0', () => {
  for (const c of constants.CHARACTERS) {
    // 1番手〜3番手のすべてで確かめる（以前は行動順で 1 減る作りだった）
    for (let pos = 0; pos < 3; pos += 1) {
      const order = ['hibana', 'mamori', 'hayate'];
      order[pos] = c.id;
      const state = freshMatch(order);
      const form = rules.v99FormOf(state, pos + 1, skillIdOf(c.id));
      assert.equal(form.extra, 0, `${c.id} の ${pos + 1}番手で追加配置が ${form.extra} になっている`);
      assert.equal(form.locked, false);
    }
  }
});

/* ───────────── 進行中の対戦を壊していないか ───────────── */

test('追加配置が残っている進行中の対戦は、最後まで進められる', () => {
  // 仕組みごと消すと、いま追加配置を持っている対戦が詰む。
  // 新しい対戦では pending は作られないが、受け口は残してある。
  const state = freshMatch();
  const placed = rules.applyAction(state, { type: 'place', seat: 1, index: 40 });
  assert.equal(placed.ok, true);

  const live = structuredClone(placed.state);
  live.turn = 2;
  live.pending = { seat: 2, remaining: 1, banned: null, skillId: 'spark' };

  const extra = rules.applyAction(live, { type: 'extra', seat: 2, index: 41 });
  assert.equal(extra.ok, true, '古い対戦の追加配置は今までどおり置けること');
  assert.equal(extra.state.stones[41], 2);
  assert.equal(extra.state.pending, null, '置き終えたら手番が終わること');
  assert.equal(extra.state.turn, 3);
});

/* ───────────── 説明文と動きが一致しているか ───────────── */

test('あそびかたの説明文と、エンジンの動きが食い違っていない', () => {
  // 説明文は最初から「スキルの後に石を追加で置くことはできません」と
  // 書いてあったのに、V99 の設定だけが 2〜3 個の追加配置を与えていた。
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /どちらか一方だけを行えます。スキルの後に石を追加で置くことはできません/);

  // sparkCanRefill は bannedFor の中にも出るので、V99 の定義以降から探す
  const start = html.indexOf('const V99 = Object.freeze');
  const block = html.slice(start, html.indexOf('sparkCanRefill', start));
  assert.doesNotMatch(block, /extra: [1-9]/, '追加配置を与えている設定が残っている');
  assert.match(block, /orderPenalty: Object\.freeze\(\[0, 0, 0\]\)/);
});
