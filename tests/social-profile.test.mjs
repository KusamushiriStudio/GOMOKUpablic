import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryStore } from './helpers/memory-social-store.mjs';

const { constants, rules } = await import('../supabase/functions/api/game-core.js');
const { socialRoute, historyRowOf, summarizeHistory } = await import('../supabase/functions/api/social.ts');

const ME = 'u_me';
const FRIEND = 'u_friend';
const STRANGER = 'u_stranger';

/** 3人の席を作る。userId だけ差し替えられればよい。 */
function seatsOf(ids, charIds = ['hibana', 'mamori', 'hayate']) {
  return ids.map((id, i) => ({
    seat: i + 1, userId: id, name: `P${i + 1}`, charId: charIds[i], kind: 'human',
  }));
}

function matchOf({ ids = [ME, FRIEND, STRANGER], status = 'finished', result, ply = 12, skillUses, matchId = 'm_1' } = {}) {
  const seats = seatsOf(ids);
  const state = rules.createMatch({ matchId, mode: 'online', seats, startSeat: 1 });
  return {
    matchId,
    seatSnapshot: seats,
    status,
    state: {
      ...state,
      status: status === 'playing' ? 'playing' : 'finished',
      result: result ?? { kind: 'win', winner: 1, winners: [1], line: [], reason: 'five' },
      ply,
      finishedAt: 1_700_000_000_000,
      skillUses: skillUses ?? { 1: { spark: 2 }, 2: {}, 3: {} },
    },
  };
}

function store(extra = {}) {
  return createMemoryStore({
    players: [
      { id: ME, name: 'わたし', playerCode: 'TRIAD-AAA111', game: { playerXp: 0, lastCharId: 'hibana' } },
      { id: FRIEND, name: 'ともだち', playerCode: 'TRIAD-BBB222', game: { playerXp: 250, lastCharId: 'mamori' } },
      { id: STRANGER, name: 'たにん', playerCode: 'TRIAD-CCC333', game: { playerXp: 0 } },
    ],
    friendships: [[ME, FRIEND]],
    ...extra,
  });
}

/* ───────── 履歴の素 ───────── */

test('履歴1行は自分の席から見た結果・相手・使った技をまとめる', () => {
  const row = historyRowOf(matchOf(), ME);
  assert.equal(row.outcome, 'win');
  assert.equal(row.charName, 'ヒバナ');
  assert.equal(row.reason, 'five');
  assert.equal(row.turns, 12);
  assert.deepEqual(row.skills, [{ name: '火花', count: 2 }]);
  assert.deepEqual(row.opponents.map((o) => o.charName), ['マモリ', 'ハヤテ']);
});

test('技を使わなかった対戦は技欄が空になる', () => {
  const row = historyRowOf(matchOf({ skillUses: { 1: {}, 2: {}, 3: {} } }), ME);
  assert.deepEqual(row.skills, []);
});

test('古い形式（席ごとの回数が数値）でも技名を補って読める', () => {
  const row = historyRowOf(matchOf({ skillUses: { 1: 3, 2: 0, 3: 0 } }), ME);
  assert.deepEqual(row.skills, [{ name: '火花', count: 3 }]);
});

test('出ていない対戦は履歴にならない', () => {
  assert.equal(historyRowOf(matchOf({ ids: [FRIEND, STRANGER, 'u_x'] }), ME), null);
});

test('中止した対戦は勝率と平均手数から外れ、件数だけ残る', () => {
  const rows = [
    historyRowOf(matchOf({ matchId: 'm_1', ply: 10 }), ME),
    historyRowOf(matchOf({ matchId: 'm_2', status: 'aborted', ply: 4 }), ME),
  ];
  const s = summarizeHistory(rows);
  assert.equal(s.total, 1, '中止は母数に入らない');
  assert.equal(s.aborted, 1);
  assert.equal(s.wins, 1);
  assert.equal(s.winRate, 100);
  assert.equal(s.avgTurns, 10, '中止の4手は平均に混ざらない');
});

test('キャラ使用割合は履歴全体から出し、最多を先頭に置く', () => {
  const rows = [
    historyRowOf(matchOf({ matchId: 'm_1' }), ME),
    historyRowOf(matchOf({ matchId: 'm_2' }), ME),
    historyRowOf(matchOf({ matchId: 'm_3', ids: [ME, FRIEND, STRANGER] }), FRIEND),
  ].filter(Boolean);
  const s = summarizeHistory(rows);
  assert.equal(s.usage[0].charName, 'ヒバナ');
  assert.equal(s.usage[0].percent, 67);
  assert.equal(s.topChar.charName, 'ヒバナ');
});

test('記録が無くても集計は0で壊れない', () => {
  const s = summarizeHistory([]);
  assert.deepEqual(
    { total: s.total, winRate: s.winRate, avgTurns: s.avgTurns, topChar: s.topChar },
    { total: 0, winRate: 0, avgTurns: 0, topChar: null },
  );
});

/* ───────── プロフィール ───────── */

test('フレンドのプロフィールは通算・直近・履歴を返す', async () => {
  const s = store({
    matches: [matchOf({ matchId: 'm_1' })],
    stats: { [FRIEND]: { total_matches: 5, wins: 2, losses: 3, gomoku_wins: 1, min_stone_wins: 1 } },
  });
  const { view } = await socialRoute(s, ME, '/friends/profile', { playerCode: 'TRIAD-BBB222' });
  const d = view.friendProfile;
  assert.equal(d.player.playerCode, 'TRIAD-BBB222');
  assert.equal(d.player.self, false);
  assert.equal(d.stats.total_matches, 5);
  assert.equal(d.summary.total, 1);
  assert.equal(d.recent.length, 1);
  assert.equal(d.recent[0].outcome, 'lose', '勝ったのは席1のわたし');
  assert.equal(d.spectatable, false, '進行中の対戦が無ければ観戦できない');
});

test('進行中の対戦があるフレンドは観戦できる印がつく', async () => {
  const s = store({ matches: [matchOf({ matchId: 'm_live', status: 'playing' })] });
  const { view } = await socialRoute(s, ME, '/friends/profile', { playerCode: 'TRIAD-BBB222' });
  assert.equal(view.friendProfile.spectatable, true);
});

test('自分のプロフィールは見られるが、観戦の勧めは出ない', async () => {
  const s = store({ matches: [matchOf({ matchId: 'm_live', status: 'playing' })] });
  const { view } = await socialRoute(s, ME, '/friends/profile', { playerCode: 'TRIAD-AAA111' });
  assert.equal(view.friendProfile.player.self, true);
  assert.equal(view.friendProfile.spectatable, false);
});

test('フレンドでない人の戦績は見られない', async () => {
  const out = await socialRoute(store(), ME, '/friends/profile', { playerCode: 'TRIAD-CCC333' });
  assert.equal(out.fail.code, 'not_friend');
});

test('通算成績がまだ無くても空で返す', async () => {
  const { view } = await socialRoute(store(), ME, '/friends/profile', { playerCode: 'TRIAD-BBB222' });
  assert.deepEqual(view.friendProfile.stats, {});
});

/* ───────── 観戦 ───────── */

test('フレンドの進行中の対戦を観戦できる', async () => {
  const s = store({ matches: [matchOf({ matchId: 'm_live', status: 'playing' })] });
  const { view } = await socialRoute(s, ME, '/spectate', { playerCode: 'TRIAD-BBB222' });
  assert.equal(view.spectate.matchId, 'm_live');
  assert.equal(view.spectate.status, 'playing');
  assert.equal(view.spectate.players.length, 3);
  assert.equal(view.spectate.players[0].charName, 'ヒバナ');
  assert.ok(view.spectate.state.stones, '盤面は公開用の形で渡す');
});

test('フレンドが誰も出ていない対戦は観戦できない', async () => {
  const s = store({ matches: [matchOf({ matchId: 'm_x', status: 'playing', ids: ['u_a', 'u_b', 'u_c'] })] });
  const out = await socialRoute(s, ME, '/spectate', { matchId: 'm_x' });
  assert.equal(out.fail.code, 'not_friend');
});

test('観戦できる対戦が無ければその旨を返す', async () => {
  assert.equal((await socialRoute(store(), ME, '/spectate', { playerCode: 'TRIAD-BBB222' })).fail.code, 'no_match');
});

/* ───────── 招待 ───────── */

const roomOf = (hostId) => ({
  code: 'ABC123', hostId, status: 'lobby', matchId: null,
  members: [{ playerId: hostId, name: 'わたし', charId: 'hibana', ready: false }],
});

test('部屋にいるとフレンドを招待でき、期限つきの通知が届く', async () => {
  const s = store({ rooms: [roomOf(ME)] });
  const out = await socialRoute(s, ME, '/invite/send', { playerCode: 'TRIAD-BBB222' });
  assert.ok(out.result.inviteId);

  const n = s._state.notifications.find((x) => x.userId === FRIEND);
  assert.equal(n.type, 'MATCH_INVITE');
  assert.equal(n.roomCode, 'ABC123');
  assert.ok(n.expiresAt > Date.now(), '期限が先にある');
});

test('部屋が無いとき・フレンド以外・満室では招待できない', async () => {
  assert.equal((await socialRoute(store(), ME, '/invite/send', { playerCode: 'TRIAD-BBB222' })).fail.code, 'no_room');

  const stranger = store({ rooms: [roomOf(ME)] });
  assert.equal((await socialRoute(stranger, ME, '/invite/send', { playerCode: 'TRIAD-CCC333' })).fail.code, 'not_friend');

  const full = store({ rooms: [{ ...roomOf(ME), members: seatsOf([ME, 'u_a', 'u_b']).map((s) => ({ playerId: s.userId, charId: s.charId })) }] });
  assert.equal((await socialRoute(full, ME, '/invite/send', { playerCode: 'TRIAD-BBB222' })).fail.code, 'room_full');
});

test('招待を受けると部屋に入り、招待は成立済みになる', async () => {
  const room = roomOf(ME);
  const s = store({ rooms: [room], invites: [{ senderId: ME, receiverId: FRIEND, roomCode: 'ABC123', expiresAt: Date.now() + 60_000 }] });
  const inviteId = s._state.invites[0].inviteId;

  const out = await socialRoute(s, FRIEND, '/invite/respond', { inviteId, accept: true, charId: 'mamori' });
  assert.equal(out.result.accepted, true);
  assert.equal(room.members.length, 2);
  assert.equal(room.members[1].playerId, FRIEND);
  assert.equal(s._state.invites[0].status, 'ACCEPTED');
});

test('断った招待では部屋に入らない', async () => {
  const room = roomOf(ME);
  const s = store({ rooms: [room], invites: [{ senderId: ME, receiverId: FRIEND, roomCode: 'ABC123', expiresAt: Date.now() + 60_000 }] });
  const inviteId = s._state.invites[0].inviteId;

  const out = await socialRoute(s, FRIEND, '/invite/respond', { inviteId, accept: false });
  assert.equal(out.result.accepted, false);
  assert.equal(room.members.length, 1);
  assert.equal(s._state.invites[0].status, 'DECLINED');
});

test('期限切れの招待は受けられず、期限切れとして畳まれる', async () => {
  const s = store({ rooms: [roomOf(ME)], invites: [{ senderId: ME, receiverId: FRIEND, roomCode: 'ABC123', expiresAt: Date.now() - 1 }] });
  const inviteId = s._state.invites[0].inviteId;

  assert.equal((await socialRoute(s, FRIEND, '/invite/respond', { inviteId, accept: true, charId: 'mamori' })).fail.code, 'expired');
  assert.equal(s._state.invites[0].status, 'EXPIRED');
});

test('他人あての招待と存在しないキャラは弾く', async () => {
  const s = store({ rooms: [roomOf(ME)], invites: [{ senderId: ME, receiverId: FRIEND, roomCode: 'ABC123', expiresAt: Date.now() + 60_000 }] });
  const inviteId = s._state.invites[0].inviteId;

  assert.equal((await socialRoute(s, STRANGER, '/invite/respond', { inviteId, accept: true, charId: 'mamori' })).fail.code, 'not_yours');
  assert.equal((await socialRoute(s, FRIEND, '/invite/respond', { inviteId, accept: true, charId: 'nope' })).fail.code, 'bad_char');
});
