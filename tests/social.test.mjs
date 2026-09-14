import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryStore } from './helpers/memory-social-store.mjs';

const { constants } = await import('../supabase/functions/api/game-core.js');
const { socialRoute, statusOf, relationOf, playerCard } = await import('../supabase/functions/api/social.ts');

const ME = 'u_me';
const OTHER = 'u_other';
const THIRD = 'u_third';

function store(extra = {}) {
  return createMemoryStore({
    players: [
      { id: ME, name: 'わたし', playerCode: 'TRIAD-AAA111', game: { playerXp: 120, lastCharId: 'hibana' } },
      { id: OTHER, name: 'あいて', playerCode: 'TRIAD-BBB222', game: { playerXp: 0 } },
      { id: THIRD, name: 'みっつめ', playerCode: 'TRIAD-CCC333', game: { playerXp: 0 } },
    ],
    ...extra,
  });
}

/* ───────── 表示の素 ───────── */

test('在席は対戦中・オンライン・オフラインの3つに落ちる', () => {
  const now = 1_000_000;
  assert.equal(statusOf({ activeMatchId: 'm1', lastSeenAt: 0 }, now), 'IN_MATCH');
  assert.equal(statusOf({ activeMatchId: null, lastSeenAt: now - 5_000 }, now), 'ONLINE');
  assert.equal(statusOf({ activeMatchId: null, lastSeenAt: now - 120_000 }, now), 'OFFLINE');
  assert.equal(statusOf({ activeMatchId: null, lastSeenAt: null }, now), 'OFFLINE');
});

test('関係は自分・フレンド・申請中・受信中・なしを見分ける', () => {
  const friends = new Set([OTHER]);
  const pending = [{ senderId: ME, receiverId: THIRD }];
  assert.equal(relationOf(ME, ME, friends, pending), 'SELF');
  assert.equal(relationOf(ME, OTHER, friends, pending), 'FRIEND');
  assert.equal(relationOf(ME, THIRD, friends, pending), 'REQUEST_SENT');
  assert.equal(relationOf(ME, THIRD, friends, [{ senderId: THIRD, receiverId: ME }]), 'REQUEST_RECEIVED');
  assert.equal(relationOf(ME, 'u_x', friends, []), 'NONE');
});

test('プレイヤー表示はレベルを経験値から出し、キャラ名を引く', () => {
  const card = playerCard({
    id: ME, name: 'わたし', playerCode: 'TRIAD-AAA111', lastSeenAt: null, activeMatchId: null,
    game: { playerXp: 120, lastCharId: 'hibana' },
  }, { relation: 'FRIEND' });
  assert.equal(card.charName, 'ヒバナ');
  // 段位の刻みは constants 側の持ち物なので、そこから期待値を出す。
  assert.equal(card.level, 1 + Math.floor(120 / constants.PLAYER_XP_PER_LEVEL));
  assert.equal(card.playerCode, 'TRIAD-AAA111');
  assert.equal(card.relation, 'FRIEND');
});

/* ───────── フレンド ───────── */

test('フレンド一覧は対戦中・オンラインを先に並べ、届いている申請数を添える', async () => {
  const s = store({
    friendships: [[ME, OTHER], [ME, THIRD]],
    requests: [{ senderId: THIRD, receiverId: ME }],
  });
  s._state.players.get(OTHER).lastSeenAt = Date.now();
  s._state.players.get(THIRD).activeMatchId = 'm_1';

  const out = await socialRoute(s, ME, '/friends/list', {});
  const { friends, pendingIn } = out.view.friends;
  assert.deepEqual(friends.map((f) => f.playerCode), ['TRIAD-CCC333', 'TRIAD-BBB222']);
  assert.equal(friends[0].status, 'IN_MATCH');
  assert.equal(friends[1].status, 'ONLINE');
  assert.equal(pendingIn, 1);
});

test('申請一覧は届いた分と送った分を分ける', async () => {
  const s = store({ requests: [{ senderId: OTHER, receiverId: ME }, { senderId: ME, receiverId: THIRD }] });
  const { view } = await socialRoute(s, ME, '/friends/requests', {});
  assert.equal(view.friendRequests.incoming.length, 1);
  assert.equal(view.friendRequests.incoming[0].player.playerCode, 'TRIAD-BBB222');
  assert.equal(view.friendRequests.outgoing.length, 1);
  assert.equal(view.friendRequests.outgoing[0].player.playerCode, 'TRIAD-CCC333');
});

test('フレンド申請は相手に通知を残す', async () => {
  const s = store();
  const out = await socialRoute(s, ME, '/friends/request', { playerCode: 'TRIAD-BBB222' });
  assert.ok(out.result.requestId);

  const sent = s._state.notifications.filter((n) => n.userId === OTHER);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'FRIEND_REQUEST');
  assert.equal(sent[0].payload.playerCode, 'TRIAD-AAA111');
});

test('小文字で入力されたプレイヤーコードでも申請できる', async () => {
  const s = store();
  const out = await socialRoute(s, ME, '/friends/request', { playerCode: 'triad-bbb222' });
  assert.ok(out.result?.requestId, '大文字小文字で取りこぼさない');
});

test('自分・重複・すでにフレンドへの申請は断る', async () => {
  const mine = store();
  assert.equal((await socialRoute(mine, ME, '/friends/request', { playerCode: 'TRIAD-AAA111' })).fail.code, 'self');

  const friend = store({ friendships: [[ME, OTHER]] });
  assert.equal((await socialRoute(friend, ME, '/friends/request', { playerCode: 'TRIAD-BBB222' })).fail.code, 'already_friend');

  const again = store({ requests: [{ senderId: ME, receiverId: OTHER }] });
  assert.equal((await socialRoute(again, ME, '/friends/request', { playerCode: 'TRIAD-BBB222' })).fail.code, 'already_sent');

  const incoming = store({ requests: [{ senderId: OTHER, receiverId: ME }] });
  assert.equal((await socialRoute(incoming, ME, '/friends/request', { playerCode: 'TRIAD-BBB222' })).fail.code, 'already_received');

  const missing = store();
  assert.equal((await socialRoute(missing, ME, '/friends/request', { playerCode: 'TRIAD-ZZZ999' })).fail.code, 'no_player');
});

test('承認するとフレンドになり、申請者へ通知が届く', async () => {
  const s = store({ requests: [{ senderId: OTHER, receiverId: ME }] });
  const requestId = s._state.requests[0].requestId;

  const out = await socialRoute(s, ME, '/friends/respond', { requestId, accept: true });
  assert.equal(out.result.accepted, true);
  assert.deepEqual(await s.friendIdsOf(ME), [OTHER]);
  assert.equal(s._state.requests[0].status, 'ACCEPTED');
  assert.equal(s._state.notifications.find((n) => n.userId === OTHER).type, 'FRIEND_ACCEPTED');
});

test('拒否ではフレンドにならず、通知も送らない', async () => {
  const s = store({ requests: [{ senderId: OTHER, receiverId: ME }] });
  const requestId = s._state.requests[0].requestId;

  const out = await socialRoute(s, ME, '/friends/respond', { requestId, accept: false });
  assert.equal(out.result.accepted, false);
  assert.deepEqual(await s.friendIdsOf(ME), []);
  assert.equal(s._state.requests[0].status, 'REJECTED');
  assert.equal(s._state.notifications.length, 0);
});

test('他人あての申請や処理済みの申請には応答できない', async () => {
  const s = store({ requests: [{ senderId: ME, receiverId: THIRD }] });
  const requestId = s._state.requests[0].requestId;
  assert.equal((await socialRoute(s, ME, '/friends/respond', { requestId, accept: true })).fail.code, 'not_yours');

  const settled = store({ requests: [{ senderId: OTHER, receiverId: ME }] });
  settled._state.requests[0].status = 'ACCEPTED';
  const id2 = settled._state.requests[0].requestId;
  assert.equal((await socialRoute(settled, ME, '/friends/respond', { requestId: id2, accept: true })).fail.code, 'already_settled');
});

test('フレンド解除は関係だけを消す', async () => {
  const s = store({ friendships: [[ME, OTHER]] });
  const out = await socialRoute(s, ME, '/friends/remove', { playerCode: 'TRIAD-BBB222' });
  assert.equal(out.result.removed, true);
  assert.deepEqual(await s.friendIdsOf(ME), []);

  assert.equal((await socialRoute(s, ME, '/friends/remove', { playerCode: 'TRIAD-BBB222' })).fail.code, 'not_friend');
});

/* ───────── 検索 ───────── */

test('検索は関係つきで返し、1文字では断る', async () => {
  const s = store({ friendships: [[ME, OTHER]] });
  assert.equal((await socialRoute(s, ME, '/player/search', { q: 'T' })).fail.code, 'too_short');

  const { view } = await socialRoute(s, ME, '/player/search', { q: 'TRIAD-' });
  const byCode = Object.fromEntries(view.search.players.map((p) => [p.playerCode, p]));
  assert.equal(byCode['TRIAD-BBB222'].relation, 'FRIEND');
  assert.equal(byCode['TRIAD-CCC333'].relation, 'NONE');
  assert.equal(byCode['TRIAD-AAA111'].self, true, '自分は自分として印がつく');
});

test('名前でも検索できる', async () => {
  const s = store();
  const { view } = await socialRoute(s, ME, '/player/search', { q: 'あいて' });
  assert.deepEqual(view.search.players.map((p) => p.playerCode), ['TRIAD-BBB222']);
});

/* ───────── 通知 ───────── */

test('通知は新しい順で、未読数を添える', async () => {
  const s = store();
  await s.notify({ userId: ME, type: 'FRIEND_REQUEST', senderId: OTHER, payload: {} });
  await s.notify({ userId: ME, type: 'FRIEND_ACCEPTED', senderId: THIRD, payload: {} });

  const { view } = await socialRoute(s, ME, '/notifications', {});
  assert.equal(view.notifications.unread, 2);
  assert.deepEqual(view.notifications.notifications.map((n) => n.type), ['FRIEND_ACCEPTED', 'FRIEND_REQUEST']);
  assert.equal(view.notifications.notifications[0].from.name, 'みっつめ', '送り主の名前を引いて渡す');
});

test('すべて既読にすると未読が0になり、他人の通知は触らない', async () => {
  const s = store();
  await s.notify({ userId: ME, type: 'FRIEND_REQUEST', senderId: OTHER, payload: {} });
  await s.notify({ userId: OTHER, type: 'FRIEND_REQUEST', senderId: ME, payload: {} });

  await socialRoute(s, ME, '/notifications/read', { all: true });
  const { view } = await socialRoute(s, ME, '/notifications', {});
  assert.equal(view.notifications.unread, 0);
  assert.equal(s._state.notifications.find((n) => n.userId === OTHER).isRead, false);
});

test('既読の対象が指定されていなければ断る', async () => {
  const s = store();
  assert.equal((await socialRoute(s, ME, '/notifications/read', {})).fail.code, 'bad_target');
});

test('扱わない経路には null を返して本体の処理へ渡す', async () => {
  assert.equal(await socialRoute(store(), ME, '/match/action', {}), null);
});
