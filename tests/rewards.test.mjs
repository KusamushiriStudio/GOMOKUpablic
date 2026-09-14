import assert from 'node:assert/strict';
import test from 'node:test';

const { constants, profile, rules } = await import('../supabase/functions/api/game-core.js');
const { isSettled, rewardsForMatch } = await import('../supabase/functions/api/rewards.ts');

/** 3人対戦をひとつ組み、決着の形だけを差し替えて使う。 */
function matchWith(result, status = 'finished') {
  const seats = constants.CHARACTERS.slice(0, 3).map((c, i) => ({
    seat: i + 1, charId: c.id, name: c.name, kind: 'human', userId: `u${i + 1}`,
  }));
  const state = rules.createMatch({ matchId: 'm_test', mode: 'online', seats, startSeat: 1 });
  return {
    matchId: 'm_test',
    seatSnapshot: seats,
    status,
    state: { ...state, status: 'finished', result },
  };
}

test('決着していない対戦は報酬を確定しない', () => {
  assert.equal(isSettled({ status: 'playing' }), false);
  assert.equal(isSettled({ status: 'finished' }), true);
  assert.equal(isSettled({ status: 'aborted' }), true);
});

const fiveWin = (seat) => ({ kind: 'win', winner: seat, winners: [seat], line: [], reason: 'five' });

test('勝った席だけが勝利報酬を受け取り、他は敗北報酬になる', () => {
  const rewards = rewardsForMatch(matchWith(fiveWin(2)));
  assert.equal(rewards.length, 3);

  const bySeat = Object.fromEntries(rewards.map((r) => [r.seat, r]));
  assert.equal(bySeat[2].outcome, 'win');
  assert.equal(bySeat[2].perica, constants.REWARD_PERICA.win);
  assert.equal(bySeat[2].playerXp, constants.REWARD_PLAYER_XP.win);
  assert.equal(bySeat[2].charXp, constants.REWARD_CHAR_XP.win);

  for (const seat of [1, 3]) {
    assert.equal(bySeat[seat].outcome, 'lose');
    assert.equal(bySeat[seat].perica, constants.REWARD_PERICA.lose);
  }
});

test('最少石数などで複数が同率勝利したときは全員が勝利報酬になる', () => {
  const result = { kind: 'win', winners: [1, 3], line: [], reason: 'min_stones' };
  const bySeat = Object.fromEntries(rewardsForMatch(matchWith(result)).map((r) => [r.seat, r]));
  assert.equal(bySeat[1].outcome, 'win');
  assert.equal(bySeat[3].outcome, 'win');
  assert.equal(bySeat[2].outcome, 'lose');
});

test('引き分けは全員が引き分け報酬になる', () => {
  const rewards = rewardsForMatch(matchWith({ kind: 'draw', line: [], reason: 'full' }));
  for (const r of rewards) {
    assert.equal(r.outcome, 'draw');
    assert.equal(r.perica, constants.REWARD_PERICA.draw);
  }
});

test('中止になった対戦は勝敗を見ず、全員が報酬なしになる', () => {
  const rewards = rewardsForMatch(matchWith(fiveWin(1), 'aborted'));
  assert.equal(rewards.length, 3);
  for (const r of rewards) {
    assert.equal(r.outcome, 'aborted');
    assert.equal(r.perica, 0);
    assert.equal(r.playerXp, 0);
    assert.equal(r.charXp, 0);
  }
});

test('報酬にはプロフィールへ加算するのに必要な席・利用者・キャラが揃っている', () => {
  const rewards = rewardsForMatch(matchWith(fiveWin(1)));
  for (const r of rewards) {
    assert.ok(r.userId, 'userId がないと誰に加算するか決まらない');
    assert.ok(r.charId, 'charId がないとキャラXPを加算できない');
    assert.ok(Number.isInteger(r.seat));
  }
});

test('報酬額は grantMatchReward が実際に加算する額と一致する', () => {
  const rewards = rewardsForMatch(matchWith(fiveWin(2)));
  for (const r of rewards) {
    const p = profile.createProfile({ id: r.userId });
    const before = { perica: p.perica, playerXp: p.playerXp, charXp: p.chars[r.charId].xp };
    const out = profile.grantMatchReward(p, {
      matchId: 'm_test', outcome: r.outcome, charId: r.charId,
    });
    assert.equal(out.ok, true);
    assert.equal(p.perica - before.perica, r.perica);
    assert.equal(p.playerXp - before.playerXp, r.playerXp);
    assert.equal(p.chars[r.charId].xp - before.charXp, r.charXp);
  }
});

test('同じ対戦IDでは二度目の加算が起きない', () => {
  const [r] = rewardsForMatch(matchWith(fiveWin(1)));
  const p = profile.createProfile({ id: r.userId });

  profile.grantMatchReward(p, { matchId: 'm_test', outcome: r.outcome, charId: r.charId });
  const afterFirst = p.perica;
  const second = profile.grantMatchReward(p, { matchId: 'm_test', outcome: r.outcome, charId: r.charId });

  assert.equal(second.ok, true);
  assert.equal(second.result.duplicated, true);
  assert.equal(p.perica, afterFirst, '二重付与はプロフィール側でも防がれる');
});
