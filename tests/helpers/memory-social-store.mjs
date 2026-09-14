/**
 * SocialStore の試験用実装。表の代わりに素の配列を持つ。
 * 本番実装（Supabase）と同じ入口を満たすことだけを目的にしている。
 */
export function createMemoryStore(seed = {}) {
  const players = new Map();      // id -> PlayerRow
  const friendships = [];         // { a, b }
  const requests = [];            // { requestId, senderId, receiverId, status }
  const notifications = [];       // { id, userId, type, senderId, ... }
  let seq = 0;
  const nextId = (p) => `${p}_${++seq}`;

  for (const p of seed.players || []) players.set(p.id, { lastSeenAt: null, activeMatchId: null, ...p });
  for (const f of seed.friendships || []) friendships.push({ a: f[0], b: f[1] });
  for (const r of seed.requests || []) requests.push({ status: 'PENDING', requestId: nextId('req'), ...r });

  const pairHas = (f, x, y) => (f.a === x && f.b === y) || (f.a === y && f.b === x);

  const store = {
    async findById(id) { return players.get(id) || null; },
    async findByCode(code) {
      for (const p of players.values()) if (p.playerCode === code) return p;
      return null;
    },
    async searchPlayers(q, limit) {
      const needle = q.toLowerCase();
      return [...players.values()]
        .filter((p) => p.playerCode.toLowerCase().includes(needle) || (p.name || '').toLowerCase().includes(needle))
        .slice(0, limit);
    },
    async friendIdsOf(userId) {
      return friendships.filter((f) => f.a === userId || f.b === userId)
        .map((f) => (f.a === userId ? f.b : f.a));
    },
    async pendingRequests(userId) {
      return requests
        .filter((r) => r.status === 'PENDING' && (r.senderId === userId || r.receiverId === userId))
        .map((r) => ({ requestId: r.requestId, senderId: r.senderId, receiverId: r.receiverId }));
    },
    async createRequest(senderId, receiverId) {
      const requestId = nextId('req');
      requests.push({ requestId, senderId, receiverId, status: 'PENDING' });
      return requestId;
    },
    async findRequest(requestId) {
      return requests.find((r) => r.requestId === requestId) || null;
    },
    async settleRequest(requestId, status) {
      const r = requests.find((x) => x.requestId === requestId);
      if (r) r.status = status;
    },
    async addFriendship(a, b) {
      if (!friendships.some((f) => pairHas(f, a, b))) friendships.push({ a, b });
    },
    async removeFriendship(a, b) {
      const i = friendships.findIndex((f) => pairHas(f, a, b));
      if (i >= 0) friendships.splice(i, 1);
    },
    async notify(row) {
      notifications.push({
        id: nextId('ntf'), at: Date.now(), isRead: false,
        requestId: null, inviteId: null, roomCode: null, expiresAt: null,
        ...row,
      });
    },
    async listNotifications(userId, limit) {
      return notifications.filter((n) => n.userId === userId).slice(-limit).reverse();
    },
    async markNotificationsRead(userId, ids) {
      for (const n of notifications) {
        if (n.userId !== userId) continue;
        if (ids === null || ids.includes(n.id)) n.isRead = true;
      }
    },
  };

  // 試験から中身を覗くための補助（本番実装は持たない）
  store._state = { players, friendships, requests, notifications };
  return store;
}
