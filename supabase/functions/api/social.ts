/**
 * フレンド・検索・通知。
 *
 * データの出し入れは SocialStore ごしにだけ行う。こうしておくと、本番は
 * Supabase の表を読む実装を、試験は素の連想配列を、同じ入口に差せる。
 * 画面が必要とする形（view.friends / view.friendRequests / view.search /
 * view.notifications）はこの file が決める。
 */

import { constants, profile as profileLogic } from './game-core.js';

/** 相手がいまどうしているか。画面の色と文言はこの3つだけを見る。 */
export type PresenceStatus = 'ONLINE' | 'IN_MATCH' | 'OFFLINE';

/** 自分から見た相手との関係。申請ボタンの出し分けに使う。 */
export type Relation = 'SELF' | 'FRIEND' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';

/** 表から読んだままの1人分。ゲーム資産（level や使用キャラ）は game に入る。 */
export type PlayerRow = {
  id: string;
  name: string;
  playerCode: string;
  lastSeenAt: number | null;
  activeMatchId: string | null;
  game?: any;
};

export type SocialStore = {
  findById(id: string): Promise<PlayerRow | null>;
  findByCode(code: string): Promise<PlayerRow | null>;
  searchPlayers(q: string, limit: number): Promise<PlayerRow[]>;
  friendIdsOf(userId: string): Promise<string[]>;
  pendingRequests(userId: string): Promise<Array<{ requestId: string; senderId: string; receiverId: string }>>;
  createRequest(senderId: string, receiverId: string): Promise<string>;
  findRequest(requestId: string): Promise<{ requestId: string; senderId: string; receiverId: string; status: string } | null>;
  settleRequest(requestId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<void>;
  addFriendship(a: string, b: string): Promise<void>;
  removeFriendship(a: string, b: string): Promise<void>;
  notify(row: {
    userId: string; type: string; senderId: string | null;
    requestId?: string | null; inviteId?: string | null; roomCode?: string | null;
    payload: Record<string, unknown>; expiresAt?: number | null;
  }): Promise<void>;
  listNotifications(userId: string, limit: number): Promise<Array<{
    id: string; type: string; senderId: string | null; requestId: string | null;
    inviteId: string | null; roomCode: string | null; payload: any;
    isRead: boolean; at: number; expiresAt: number | null;
  }>>;
  markNotificationsRead(userId: string, ids: string[] | null): Promise<void>;
};

/** 名前が消えている相手でも画面が崩れないようにする。 */
const ONLINE_WINDOW_MS = 60_000;
const SEARCH_LIMIT = 20;
const NOTIFICATION_LIMIT = 50;

export function statusOf(row: PlayerRow, now = Date.now()): PresenceStatus {
  if (row.activeMatchId) return 'IN_MATCH';
  if (row.lastSeenAt && now - row.lastSeenAt < ONLINE_WINDOW_MS) return 'ONLINE';
  return 'OFFLINE';
}

export function relationOf(
  viewerId: string,
  targetId: string,
  friendIds: Set<string>,
  pending: Array<{ senderId: string; receiverId: string }>,
): Relation {
  if (viewerId === targetId) return 'SELF';
  if (friendIds.has(targetId)) return 'FRIEND';
  if (pending.some((r) => r.senderId === viewerId && r.receiverId === targetId)) return 'REQUEST_SENT';
  if (pending.some((r) => r.senderId === targetId && r.receiverId === viewerId)) return 'REQUEST_RECEIVED';
  return 'NONE';
}

/** 画面の1行分。居場所や連絡先のような情報は載せない。 */
export function playerCard(row: PlayerRow, opts: { relation?: Relation; now?: number } = {}) {
  const game = row.game || null;
  const charId = game?.lastCharId || null;
  return {
    playerCode: row.playerCode,
    name: row.name || '旅人',
    charId,
    charName: charId ? (constants.CHARACTER_BY_ID[charId]?.name ?? null) : null,
    status: statusOf(row, opts.now),
    lastSeenAt: row.lastSeenAt,
    // playerLevel は経験値を受け取る（プロフィールではない）。
    level: profileLogic.playerLevel(Number(game?.playerXp) || 0),
    self: opts.relation === 'SELF',
    relation: opts.relation ?? 'NONE',
  };
}

function fail(code: string, message: string) {
  return { fail: { code, message } };
}

/* ───────────────────────── フレンド ───────────────────────── */

async function friendsList(store: SocialStore, userId: string) {
  const ids = await store.friendIdsOf(userId);
  const rows = (await Promise.all(ids.map((id) => store.findById(id)))).filter(Boolean) as PlayerRow[];
  const pending = await store.pendingRequests(userId);
  const friends = rows
    .map((r) => playerCard(r, { relation: 'FRIEND' }))
    .sort((a, b) => {
      const rank = (s: PresenceStatus) => (s === 'IN_MATCH' ? 0 : s === 'ONLINE' ? 1 : 2);
      const d = rank(a.status) - rank(b.status);
      return d !== 0 ? d : (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
    });
  return { view: { friends: { friends, pendingIn: pending.filter((r) => r.receiverId === userId).length } } };
}

async function friendRequests(store: SocialStore, userId: string) {
  const pending = await store.pendingRequests(userId);
  const incoming = [];
  const outgoing = [];
  for (const r of pending) {
    const otherId = r.receiverId === userId ? r.senderId : r.receiverId;
    const row = await store.findById(otherId);
    if (!row) continue;
    const entry = {
      requestId: r.requestId,
      player: playerCard(row, { relation: r.receiverId === userId ? 'REQUEST_RECEIVED' : 'REQUEST_SENT' }),
    };
    if (r.receiverId === userId) incoming.push(entry);
    else outgoing.push(entry);
  }
  return { view: { friendRequests: { incoming, outgoing } } };
}

async function friendRequest(store: SocialStore, userId: string, body: any) {
  const code = String(body?.playerCode || '').trim().toUpperCase();
  if (!code) return fail('bad_code', 'プレイヤーコードを入力してください。');
  const target = await store.findByCode(code);
  if (!target) return fail('no_player', 'そのプレイヤーコードは見つかりません。');
  if (target.id === userId) return fail('self', '自分には申請できません。');

  const friendIds = new Set(await store.friendIdsOf(userId));
  if (friendIds.has(target.id)) return fail('already_friend', 'すでにフレンドです。');

  const pending = await store.pendingRequests(userId);
  const relation = relationOf(userId, target.id, friendIds, pending);
  if (relation === 'REQUEST_SENT') return fail('already_sent', 'すでに申請を送っています。');
  if (relation === 'REQUEST_RECEIVED') return fail('already_received', '相手から申請が届いています。申請一覧から承認してください。');

  const me = await store.findById(userId);
  const requestId = await store.createRequest(userId, target.id);
  await store.notify({
    userId: target.id,
    type: 'FRIEND_REQUEST',
    senderId: userId,
    requestId,
    payload: { name: me?.name || '旅人', playerCode: me?.playerCode || '' },
  });
  return { result: { requestId } };
}

async function friendRespond(store: SocialStore, userId: string, body: any) {
  const requestId = String(body?.requestId || '');
  if (!requestId) return fail('bad_request', '申請が指定されていません。');
  const req = await store.findRequest(requestId);
  if (!req) return fail('no_request', 'その申請は見つかりません。');
  if (req.receiverId !== userId) return fail('not_yours', 'その申請には応答できません。');
  if (req.status !== 'PENDING') return fail('already_settled', 'その申請はすでに処理されています。');

  const accept = body?.accept === true;
  await store.settleRequest(requestId, accept ? 'ACCEPTED' : 'REJECTED');
  if (!accept) return { result: { accepted: false } };

  await store.addFriendship(userId, req.senderId);
  const me = await store.findById(userId);
  await store.notify({
    userId: req.senderId,
    type: 'FRIEND_ACCEPTED',
    senderId: userId,
    requestId,
    payload: { name: me?.name || '旅人', playerCode: me?.playerCode || '' },
  });
  return { result: { accepted: true } };
}

async function friendRemove(store: SocialStore, userId: string, body: any) {
  const code = String(body?.playerCode || '').trim().toUpperCase();
  const target = code ? await store.findByCode(code) : null;
  if (!target) return fail('no_player', 'その相手は見つかりません。');
  const friendIds = new Set(await store.friendIdsOf(userId));
  if (!friendIds.has(target.id)) return fail('not_friend', 'フレンドではありません。');
  await store.removeFriendship(userId, target.id);
  return { result: { removed: true } };
}

/* ───────────────────────── 検索 ───────────────────────── */

async function playerSearch(store: SocialStore, userId: string, body: any) {
  const q = String(body?.q || '').trim();
  if (q.length < 2) return fail('too_short', '2文字以上で検索してください。');

  const rows = await store.searchPlayers(q, SEARCH_LIMIT);
  const friendIds = new Set(await store.friendIdsOf(userId));
  const pending = await store.pendingRequests(userId);
  const players = rows.map((row) => playerCard(row, { relation: relationOf(userId, row.id, friendIds, pending) }));
  return { view: { search: { players } } };
}

/* ───────────────────────── 通知 ───────────────────────── */

async function notifications(store: SocialStore, userId: string) {
  const rows = await store.listNotifications(userId, NOTIFICATION_LIMIT);
  const senderIds = [...new Set(rows.map((n) => n.senderId).filter(Boolean))] as string[];
  const senders = new Map<string, PlayerRow>();
  for (const id of senderIds) {
    const row = await store.findById(id);
    if (row) senders.set(id, row);
  }
  const list = rows.map((n) => {
    const from = n.senderId ? senders.get(n.senderId) : null;
    return {
      id: n.id,
      type: n.type,
      at: n.at,
      isRead: n.isRead,
      requestId: n.requestId,
      inviteId: n.inviteId,
      roomCode: n.roomCode,
      expiresAt: n.expiresAt,
      payload: n.payload || {},
      from: from ? { name: from.name || '旅人', playerCode: from.playerCode } : null,
    };
  });
  return { view: { notifications: { notifications: list, unread: list.filter((n) => !n.isRead).length } } };
}

async function notificationsRead(store: SocialStore, userId: string, body: any) {
  const all = body?.all === true;
  const ids = Array.isArray(body?.ids) ? body.ids.map((x: unknown) => String(x)) : null;
  if (!all && (!ids || ids.length === 0)) return fail('bad_target', '既読にする通知が指定されていません。');
  await store.markNotificationsRead(userId, all ? null : ids);
  return { result: { read: true } };
}

/* ───────────────────────── 入口 ───────────────────────── */

export type SocialOutcome =
  | { view?: Record<string, unknown>; result?: unknown }
  | { fail: { code: string; message: string } };

/** この file が扱う経路なら結果を、そうでなければ null を返す。 */
export async function socialRoute(
  store: SocialStore,
  userId: string,
  path: string,
  body: any,
): Promise<SocialOutcome | null> {
  switch (path) {
    case '/friends/list': return friendsList(store, userId);
    case '/friends/requests': return friendRequests(store, userId);
    case '/friends/request': return friendRequest(store, userId, body);
    case '/friends/respond': return friendRespond(store, userId, body);
    case '/friends/remove': return friendRemove(store, userId, body);
    case '/player/search': return playerSearch(store, userId, body);
    case '/notifications': return notifications(store, userId);
    case '/notifications/read': return notificationsRead(store, userId, body);
    default: return null;
  }
}
