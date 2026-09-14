/**
 * フレンド・検索・通知。
 *
 * データの出し入れは SocialStore ごしにだけ行う。こうしておくと、本番は
 * Supabase の表を読む実装を、試験は素の連想配列を、同じ入口に差せる。
 * 画面が必要とする形（view.friends / view.friendRequests / view.search /
 * view.notifications）はこの file が決める。
 */

import { constants, profile as profileLogic, rules } from './game-core.js';

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

  /** 通算成績（player_stats の1行）。無ければ null。 */
  statsOf(userId: string): Promise<Record<string, number> | null>;
  /** 決着済みの対戦を新しい順に。中身は triad_matches の data と同じ形。 */
  recentMatches(userId: string, limit: number): Promise<any[]>;
  /** 進行中の対戦。観戦できるかの判断に使う。 */
  liveMatchOf(userId: string): Promise<any | null>;
  findMatchById(matchId: string): Promise<any | null>;

  /** 招待。部屋は本体（index.ts）が持っているので、そこ越しに触る。 */
  roomOf(userId: string): Promise<any | null>;
  addRoomMember(room: any, userId: string, charId: string): Promise<void>;
  createInvite(senderId: string, receiverId: string, roomCode: string, expiresAt: number): Promise<string>;
  findInvite(inviteId: string): Promise<{ inviteId: string; senderId: string; receiverId: string; roomCode: string; status: string; expiresAt: number | null } | null>;
  settleInvite(inviteId: string, status: 'ACCEPTED' | 'DECLINED' | 'EXPIRED'): Promise<void>;
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

/* ───────────────────────── 対戦記録 ───────────────────────── */

const HISTORY_LIMIT = 20;
const INVITE_TTL_MS = 5 * 60_000;

/** その席が使った技を「名前と回数」に均す。skillUses は数でも連想でも来る。 */
function skillUsageOf(state: any, seat: number, charId: string) {
  const used = state?.skillUses?.[seat];
  if (used && typeof used === 'object') {
    return Object.entries(used)
      .map(([skillId, count]) => ({ name: constants.SKILL_BY_ID[skillId]?.name || skillId, count: Number(count) || 0 }))
      .filter((x) => x.count > 0);
  }
  const count = Number(used) || 0;
  if (count <= 0) return [];
  const skill = constants.SKILL_BY_CHARACTER?.[charId];
  return [{ name: skill?.name || '技', count }];
}

/** 履歴カード1行分。相手の席も名前とキャラだけに絞る。 */
export function historyRowOf(match: any, userId: string) {
  const seats = match?.seatSnapshot || [];
  const mine = seats.find((s: any) => s.userId === userId);
  if (!mine) return null;
  const state = match.state || {};
  const outcome = match.status === 'aborted' ? 'aborted' : rules.outcomeForSeat(state.result, mine.seat);
  return {
    matchId: match.matchId,
    charName: constants.CHARACTER_BY_ID[mine.charId]?.name || '—',
    charId: mine.charId,
    finishedAt: state.finishedAt || match.finishedAt || null,
    outcome,
    reason: state.result?.reason || match.abortReason || null,
    turns: Number(state.ply) || 0,
    skills: skillUsageOf(state, mine.seat, mine.charId),
    opponents: seats
      .filter((s: any) => s.userId !== userId)
      .map((s: any) => ({ name: s.name || '旅人', charName: constants.CHARACTER_BY_ID[s.charId]?.name || '—' })),
  };
}

/** 直近の戦績。中止した対戦は勝率と平均手数から外す（画面の注記どおり）。 */
export function summarizeHistory(rows: Array<ReturnType<typeof historyRowOf>>) {
  const list = rows.filter(Boolean) as any[];
  const counted = list.filter((r) => r.outcome !== 'aborted');
  const wins = counted.filter((r) => r.outcome === 'win').length;
  const losses = counted.filter((r) => r.outcome === 'lose').length;
  const total = counted.length;

  const byChar = new Map<string, number>();
  for (const r of list) byChar.set(r.charName, (byChar.get(r.charName) || 0) + 1);
  const usage = [...byChar.entries()]
    .map(([charName, n]) => ({ charName, percent: list.length ? Math.round((n / list.length) * 100) : 0 }))
    .sort((a, b) => b.percent - a.percent);

  const avg = (pick: (r: any) => number) =>
    (total ? Math.round((counted.reduce((sum, r) => sum + pick(r), 0) / total) * 10) / 10 : 0);

  return {
    total,
    wins,
    losses,
    aborted: list.length - counted.length,
    winRate: total ? Math.round((wins / total) * 100) : 0,
    avgTurns: avg((r) => r.turns),
    avgSkills: avg((r) => r.skills.reduce((n: number, s: any) => n + s.count, 0)),
    usage,
    topChar: usage[0] || null,
  };
}

/* ───────────────────────── プロフィール・観戦 ───────────────────────── */

async function friendProfile(store: SocialStore, userId: string, body: any) {
  const code = String(body?.playerCode || '').trim().toUpperCase();
  if (!code) return fail('bad_code', 'プレイヤーコードがありません。');
  const target = await store.findByCode(code);
  if (!target) return fail('no_player', 'そのプレイヤーは見つかりません。');

  const self = target.id === userId;
  const friendIds = new Set(await store.friendIdsOf(userId));
  // 戦績を見せるのは自分とフレンドだけ（§28 の方針）。
  if (!self && !friendIds.has(target.id)) return fail('not_friend', 'フレンドの戦績だけを見られます。');

  const rows = (await store.recentMatches(target.id, HISTORY_LIMIT))
    .map((m) => historyRowOf(m, target.id))
    .filter(Boolean);
  const live = await store.liveMatchOf(target.id);

  return {
    view: {
      friendProfile: {
        player: playerCard(target, { relation: self ? 'SELF' : 'FRIEND' }),
        spectatable: !self && !!live,
        stats: (await store.statsOf(target.id)) || {},
        summary: summarizeHistory(rows),
        recent: rows,
      },
    },
  };
}

async function spectate(store: SocialStore, userId: string, body: any) {
  const friendIds = new Set(await store.friendIdsOf(userId));
  let match: any = null;

  if (body?.matchId) {
    match = await store.findMatchById(String(body.matchId));
  } else if (body?.playerCode) {
    const target = await store.findByCode(String(body.playerCode).trim().toUpperCase());
    if (!target) return fail('no_player', 'そのプレイヤーは見つかりません。');
    if (!friendIds.has(target.id)) return fail('not_friend', 'フレンドの対戦だけを観戦できます。');
    match = await store.liveMatchOf(target.id);
  }
  if (!match) return fail('no_match', 'いま観戦できる対戦はありません。');

  const seats = match.seatSnapshot || [];
  // 席のうち誰か一人でもフレンドなら観戦を許す。自分が出ている対戦も見られる。
  const allowed = seats.some((s: any) => s.userId === userId || friendIds.has(s.userId));
  if (!allowed) return fail('not_friend', 'フレンドの対戦だけを観戦できます。');

  return {
    view: {
      spectate: {
        matchId: match.matchId,
        status: match.status,
        state: rules.publicSnapshot(match.state),
        players: seats.map((s: any) => ({
          seat: s.seat,
          name: s.name || '旅人',
          charId: s.charId,
          charName: constants.CHARACTER_BY_ID[s.charId]?.name || '—',
        })),
      },
    },
  };
}

/* ───────────────────────── 招待 ───────────────────────── */

async function inviteSend(store: SocialStore, userId: string, body: any) {
  const code = String(body?.playerCode || '').trim().toUpperCase();
  const target = code ? await store.findByCode(code) : null;
  if (!target) return fail('no_player', 'その相手は見つかりません。');
  if (target.id === userId) return fail('self', '自分は招待できません。');

  const friendIds = new Set(await store.friendIdsOf(userId));
  if (!friendIds.has(target.id)) return fail('not_friend', 'フレンドだけを招待できます。');

  const room = await store.roomOf(userId);
  if (!room) return fail('no_room', '先に部屋を作ってください。');
  if ((room.members || []).some((m: any) => m.playerId === target.id)) {
    return fail('already_in_room', 'その相手はすでに部屋にいます。');
  }
  if ((room.members || []).length >= constants.ROOM_CAPACITY) return fail('room_full', '部屋に空きがありません。');

  const me = await store.findById(userId);
  const expiresAt = Date.now() + INVITE_TTL_MS;
  const inviteId = await store.createInvite(userId, target.id, room.code, expiresAt);
  await store.notify({
    userId: target.id,
    type: 'MATCH_INVITE',
    senderId: userId,
    inviteId,
    roomCode: room.code,
    expiresAt,
    payload: { name: me?.name || '旅人', playerCode: me?.playerCode || '', roomCode: room.code },
  });
  return { result: { inviteId } };
}

async function inviteRespond(store: SocialStore, userId: string, body: any) {
  const inviteId = String(body?.inviteId || '');
  if (!inviteId) return fail('bad_invite', '招待が指定されていません。');
  const invite = await store.findInvite(inviteId);
  if (!invite) return fail('no_invite', 'その招待は見つかりません。');
  if (invite.receiverId !== userId) return fail('not_yours', 'その招待には応答できません。');
  if (invite.status !== 'PENDING') return fail('already_settled', 'その招待はすでに処理されています。');
  if (invite.expiresAt && invite.expiresAt < Date.now()) {
    await store.settleInvite(inviteId, 'EXPIRED');
    return fail('expired', 'この招待は期限切れです。');
  }

  if (body?.accept !== true) {
    await store.settleInvite(inviteId, 'DECLINED');
    return { result: { accepted: false } };
  }

  const charId = String(body?.charId || '');
  if (!constants.CHARACTER_BY_ID[charId]) return fail('bad_char', 'そのキャラクターは存在しません。');

  const room = await store.roomOf(invite.senderId);
  if (!room || room.code !== invite.roomCode) return fail('no_room', '招待された部屋はもうありません。');
  if ((room.members || []).length >= constants.ROOM_CAPACITY) return fail('room_full', '部屋に空きがありません。');

  await store.addRoomMember(room, userId, charId);
  await store.settleInvite(inviteId, 'ACCEPTED');
  return { result: { accepted: true, roomCode: room.code } };
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
    case '/friends/profile': return friendProfile(store, userId, body);
    case '/spectate': return spectate(store, userId, body);
    case '/invite/send': return inviteSend(store, userId, body);
    case '/invite/respond': return inviteRespond(store, userId, body);
    default: return null;
  }
}
