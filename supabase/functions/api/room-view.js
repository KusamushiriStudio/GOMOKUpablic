/**
 * ルームを「画面が読める形」にして返す。
 *
 * なぜ要るのか
 *   待合室の画面（views/online.js の renderLobby）は、dbnet が組み立てる形
 *   （userId / isYou / connected / youAreHost / capacity）を前提に書かれている。
 *   一方サーバは長らく保存した生のルームをそのまま返していて、そこには
 *   playerId しか無く connected も isYou も無かった。
 *
 *   その結果 online（Supabase）では
 *     members.every((m) => m.ready && m.connected)  → connected が undefined
 *     room.youAreHost                               → undefined
 *   となり、3人そろって全員が準備完了にしても開始ボタンが有効にならなかった。
 *   表示も全員「切断中・準備中」になっていた。
 *
 *   ここが唯一の変換点。画面とサーバのどちらを直すか迷ったら、
 *   「誰から見たルームか」を知っているのはサーバなので、サーバで作る。
 *   matchView が同じ理由で userId を受け取っているのと揃えてある。
 *
 * .js にしてあるのは、Deno（index.ts）と Node（tests/）の両方から
 * そのまま読めるようにするため。game-core.js と同じ扱い。
 */
import { constants } from './game-core.js';

const { ROOM_CAPACITY, DISCONNECT_GRACE_MS } = constants;

/**
 * その人が「まだ居る」と見なせるか。
 *
 * 自分自身は、いま要求を出しているのだから必ず接続中。
 * 他人は最後に見かけた時刻で測る。lastSeenAt をまだ持たない古いルームは
 * ルームの更新時刻で代用し、それも無ければ「居る」とみなす。
 * ここを厳しくすると、記録が無いだけで永久に開始できなくなる。
 */
export function isConnected(member, room, userId, now = Date.now()) {
  if (member.playerId === userId) return true;
  const seen = Number(member.lastSeenAt ?? room?.updatedAt ?? 0);
  if (!seen) return true;
  return now - seen < DISCONNECT_GRACE_MS;
}

/** 最後に見かけた時刻を書き直すべきか。毎回書くと poll のたびに revision が上がる。 */
export function presenceStale(member, now = Date.now()) {
  return now - Number(member?.lastSeenAt ?? 0) >= DISCONNECT_GRACE_MS / 3;
}

/**
 * @param {object} room  保存されているルーム
 * @param {string} userId 見ている人
 * @returns {object|null} 画面が読める形
 */
export function roomView(room, userId, now = Date.now()) {
  if (!room) return null;
  return {
    code: room.code,
    hostId: room.hostId,
    visibility: room.visibility,
    status: room.status,
    matchId: room.matchId || null,
    createdAt: room.createdAt,
    capacity: ROOM_CAPACITY,
    youAreHost: room.hostId === userId,
    members: (room.members || []).map((m) => ({
      userId: m.playerId,
      name: m.name,
      charId: m.charId,
      ready: !!m.ready,
      isYou: m.playerId === userId,
      connected: isConnected(m, room, userId, now),
      joinedAt: m.joinedAt ?? room.createdAt ?? null,
    })),
  };
}

/**
 * 公開ルーム（世界対戦）が自動で始まる条件（§「3人そろうと自動で始まります」）。
 *
 * 画面はこの文言を出し、/world/join は参加時点で ready を立てているのに、
 * サーバ側に自動開始が無かった。だから公開ルームは3人そろっても永久に
 * 待機画面のままだった。
 *
 * 接続は見ない。待っている人はポーリングしているから接続中に決まっており、
 * ここで落とすと「3人いるのに始まらない」を作り直すことになる。
 */
export function shouldAutoStart(room) {
  return !!room
    && room.visibility === 'public'
    && room.status === 'lobby'
    && !room.matchId
    && (room.members || []).length === ROOM_CAPACITY
    && room.members.every((m) => m.ready);
}

/**
 * ホストが押して始められるか。画面の開始ボタンと同じ条件をサーバでも持つ。
 * 返すのは失敗の理由。始められるなら null。
 */
export function startBlockedReason(room, userId, now = Date.now()) {
  if (!room) return { code: 'no_room', message: 'ルームに参加していません。' };
  if (room.hostId !== userId) return { code: 'not_host', message: '開始できるのはホストだけです。' };
  if (room.status !== 'lobby') return { code: 'in_progress', message: 'すでに対戦中です。' };
  if ((room.members || []).length !== ROOM_CAPACITY) return { code: 'not_full', message: '3人そろっていません。' };
  if (!room.members.every((m) => m.ready)) return { code: 'not_ready', message: '全員の準備が完了していません。' };
  const offline = room.members.filter((m) => !isConnected(m, room, userId, now));
  if (offline.length) return { code: 'not_connected', message: '接続が切れているプレイヤーがいます。' };
  return null;
}
