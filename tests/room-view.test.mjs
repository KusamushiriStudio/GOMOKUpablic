import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { constants } from '../supabase/functions/api/game-core.js';
import {
  isConnected, presenceStale, roomView, shouldAutoStart, startBlockedReason,
} from '../supabase/functions/api/room-view.js';

const { ROOM_CAPACITY, DISCONNECT_GRACE_MS } = constants;
const NOW = 1_700_000_000_000;

const member = (id, over = {}) => ({
  playerId: id, name: id, charId: 'hibana', ready: true,
  joinedAt: NOW - 60_000, lastSeenAt: NOW - 1_000, ...over,
});

const room = (over = {}) => ({
  code: 'ABC123', hostId: 'u1', visibility: 'private', status: 'lobby', matchId: null,
  createdAt: NOW - 120_000, updatedAt: NOW - 1_000,
  members: [member('u1'), member('u2'), member('u3')],
  memberIds: ['u1', 'u2', 'u3'], _revision: 7, ...over,
});

/**
 * 待合室の画面（views/online.js の renderLobby）が実際に書いている条件。
 * ここが false のままだったので、3人そろっても開始ボタンが押せなかった。
 */
const lobbyCanStart = (view) =>
  view.members.length === ROOM_CAPACITY
  && view.members.every((m) => m.ready && m.connected)
  && !!view.youAreHost;

/* ───────────── 形 ───────────── */

test('ルームは画面が読む名前で返る（userId / isYou / youAreHost / capacity）', () => {
  const view = roomView(room(), 'u2', NOW);
  assert.equal(view.capacity, ROOM_CAPACITY);
  assert.equal(view.youAreHost, false, 'u2 はホストではない');
  assert.deepEqual(view.members.map((m) => m.userId), ['u1', 'u2', 'u3'],
    'playerId ではなく userId で返すこと');
  assert.deepEqual(view.members.map((m) => m.isYou), [false, true, false]);
  assert.equal(roomView(room(), 'u1', NOW).youAreHost, true);
  assert.equal(roomView(null, 'u1', NOW), null);
});

test('内部だけの項目は外へ出さない', () => {
  const view = roomView(room(), 'u1', NOW);
  assert.equal('memberIds' in view, false);
  assert.equal('_revision' in view, false);
});

/* ───────────── 在席 ───────────── */

test('自分は必ず接続中。他人は最後に見かけた時刻で測る', () => {
  const r = room();
  assert.equal(isConnected(member('u1', { lastSeenAt: 0 }), r, 'u1', NOW), true, '自分は常に接続中');
  assert.equal(isConnected(member('u2', { lastSeenAt: NOW - 1_000 }), r, 'u1', NOW), true);
  assert.equal(isConnected(member('u2', { lastSeenAt: NOW - DISCONNECT_GRACE_MS - 1 }), r, 'u1', NOW), false);
});

test('lastSeenAt を持たない古いルームで、全員を切断中にしない', () => {
  // ここを厳しくすると、記録が無いだけで永久に開始できなくなる。
  const old = room({ updatedAt: NOW - 500, members: [member('u1', { lastSeenAt: undefined }), member('u2', { lastSeenAt: undefined }), member('u3', { lastSeenAt: undefined })] });
  const view = roomView(old, 'u1', NOW);
  assert.deepEqual(view.members.map((m) => m.connected), [true, true, true]);
  // 更新時刻も無いときも落とさない
  const bare = room({ updatedAt: undefined, members: [member('u2', { lastSeenAt: undefined })] });
  assert.equal(roomView(bare, 'u1', NOW).members[0].connected, true);
});

test('在席の書き直しは猶予の1/3より古いときだけ', () => {
  assert.equal(presenceStale({ lastSeenAt: NOW - 1_000 }, NOW), false, '毎回書くと revision が上がり続ける');
  assert.equal(presenceStale({ lastSeenAt: NOW - DISCONNECT_GRACE_MS }, NOW), true);
  assert.equal(presenceStale({}, NOW), true, '一度も押していなければ書く');
});

/* ───────────── これが直したかった不具合そのもの ───────────── */

test('3人そろって全員が準備完了なら、ホストの画面で開始ボタンが有効になる', () => {
  // 以前はサーバが生のルーム（playerId のみ・connected 無し）を返しており、
  // connected が undefined になるため、この条件が永久に false だった。
  const view = roomView(room(), 'u1', NOW);
  assert.equal(lobbyCanStart(view), true);
});

test('ホスト以外の画面では開始ボタンは有効にならない', () => {
  assert.equal(lobbyCanStart(roomView(room(), 'u3', NOW)), false);
});

test('1人が切れていれば開始できない', () => {
  const r = room({ members: [member('u1'), member('u2', { lastSeenAt: NOW - DISCONNECT_GRACE_MS - 1 }), member('u3')] });
  assert.equal(lobbyCanStart(roomView(r, 'u1', NOW)), false);
});

/* ───────────── 公開ルームの自動開始 ───────────── */

test('公開ルームは3人そろって全員 ready なら自動で始まる', () => {
  assert.equal(shouldAutoStart(room({ visibility: 'public' })), true);
});

test('自動で始まらない場合', () => {
  assert.equal(shouldAutoStart(room({ visibility: 'private' })), false, '非公開はホストが押す');
  assert.equal(shouldAutoStart(room({ visibility: 'public', members: [member('u1'), member('u2')] })), false, '2人では始めない');
  assert.equal(shouldAutoStart(room({ visibility: 'public', status: 'playing' })), false);
  assert.equal(shouldAutoStart(room({ visibility: 'public', matchId: 'm_1' })), false, '二重に起こさない');
  assert.equal(shouldAutoStart(room({ visibility: 'public', members: [member('u1'), member('u2'), member('u3', { ready: false })] })), false);
  assert.equal(shouldAutoStart(null), false);
});

test('自動開始は接続を見ない', () => {
  // 待っている人はポーリングしているから接続中に決まっている。
  // ここで接続を見ると「3人いるのに始まらない」を作り直すことになる。
  const r = room({ visibility: 'public', members: [member('u1'), member('u2', { lastSeenAt: 0 }), member('u3')] });
  assert.equal(shouldAutoStart(r), true);
});

/* ───────────── ホストが押す経路 ───────────── */

test('開始できない理由は、画面の条件と同じ順で返る', () => {
  assert.equal(startBlockedReason(room(), 'u1', NOW), null);
  assert.equal(startBlockedReason(null, 'u1', NOW).code, 'no_room');
  assert.equal(startBlockedReason(room(), 'u2', NOW).code, 'not_host');
  assert.equal(startBlockedReason(room({ status: 'playing' }), 'u1', NOW).code, 'in_progress');
  assert.equal(startBlockedReason(room({ members: [member('u1'), member('u2')] }), 'u1', NOW).code, 'not_full');
  assert.equal(startBlockedReason(room({ members: [member('u1'), member('u2'), member('u3', { ready: false })] }), 'u1', NOW).code, 'not_ready');
  const offline = room({ members: [member('u1'), member('u2', { lastSeenAt: NOW - DISCONNECT_GRACE_MS - 1 }), member('u3')] });
  assert.equal(startBlockedReason(offline, 'u1', NOW).code, 'not_connected');
});

/* ───────────── 実装が元へ戻っていないか ───────────── */

test('Edge Function は生のルームをそのまま返さない', () => {
  const src = readFileSync(new URL('../supabase/functions/api/index.ts', import.meta.url), 'utf8');
  assert.match(src, /room:\s*roomView\(room, userId\)/,
    'viewOf は roomView を通すこと。生のルームを返すと connected も isYou も無い。');
  assert.doesNotMatch(src, /function publicRoom/, '古い変換が残っている');
});

test('対戦を起こす場所はひとつで、ホスト開始と自動開始の両方から呼ぶ', () => {
  const src = readFileSync(new URL('../supabase/functions/api/index.ts', import.meta.url), 'utf8');
  assert.match(src, /async function startRoomMatch\(/);
  // 片方にだけ書くと、必ずもう片方が抜ける
  assert.match(src, /startRoomMatch\(ctx\.db, room\)/, 'ホストの /room/start から');
  assert.match(src, /await startRoomMatch\(db, room\)/, '自動開始から');
  assert.match(src, /maybeAutoStart\(ctx\.db, mine\)/, '取得の経路から');
  assert.match(src, /maybeAutoStart\(ctx\.db, candidate\)/, '3人目の参加から');
});

test('参加すると joinedAt と lastSeenAt が必ず押される', () => {
  const src = readFileSync(new URL('../supabase/functions/api/index.ts', import.meta.url), 'utf8');
  assert.match(src, /function newMember\([\s\S]*?joinedAt: now, lastSeenAt: now/);
  // 生のオブジェクトで席を足している箇所が残っていないこと
  assert.doesNotMatch(src, /members\.push\(\{\s*playerId:/);
});
