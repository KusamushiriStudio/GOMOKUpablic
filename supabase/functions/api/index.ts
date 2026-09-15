import { createClient } from '@supabase/supabase-js';
import { constants, profile as profileLogic, rules } from './game-core.js';
import { isSettled, rewardsForMatch } from './rewards.ts';
import { socialRoute, type SocialStore } from './social.ts';
import { storyRoute, storyView, type CommitInput, type StoryStore } from './story.ts';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (code: string, message: string, view?: unknown, status = 400) => json({ ok: false, code, message, view }, status);
const success = (view: unknown, extra: Record<string, unknown> = {}) => json({ ok: true, view, ...extra });
const clone = <T>(value: T): T => structuredClone(value);
const cleanName = (value: unknown) => String(value ?? '').replace(/[<>&"'`\\]/g, '').trim().slice(0, 16);
const requestHash = (path: string, body: unknown) => profileLogic.bodyHash({ path, body });
const randomHex = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function context(req: Request) {
  const url = env('SUPABASE_URL');
  const anon = env('SUPABASE_ANON_KEY');
  const service = env('SUPABASE_SERVICE_ROLE_KEY');
  const auth = req.headers.get('authorization') || '';
  const authClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;
  return { user, db: createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

async function loadProfile(db: any, userId: string) {
  const { data, error } = await db.from('triad_profiles').select('data,revision').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const normalized = data ? profileLogic.normalizeProfile(data.data) : profileLogic.createProfile({ id: userId });
  if (!normalized) throw new Error('profile_corrupt');
  normalized.id = userId;
  // normalizeProfile is the backward-compatible migration: every character becomes owned.
  for (const c of constants.CHARACTERS) {
    normalized.chars[c.id] ||= { owned: true, count: 1, xp: 0 };
    normalized.chars[c.id].owned = true;
    normalized.chars[c.id].count = Math.max(1, normalized.chars[c.id].count || 0);
  }
  return { profile: normalized, revision: Number(data?.revision || 0) };
}

async function findRoom(db: any, userId: string) {
  const { data, error } = await db.from('triad_rooms').select('data,revision').contains('data', { memberIds: [userId] }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? { ...data.data, _revision: Number(data.revision) } : null;
}

async function findMatch(db: any, room: any) {
  if (!room?.matchId) return null;
  const { data, error } = await db.from('triad_matches').select('data,revision').eq('match_id', room.matchId).maybeSingle();
  if (error) throw error;
  return data ? { ...data.data, revision: Number(data.revision), state: { ...data.data.state, revision: Number(data.revision) } } : null;
}

async function viewOf(db: any, userId: string, knownProfile?: any) {
  const loaded = knownProfile ? { profile: knownProfile } : await loadProfile(db, userId);
  const room = await findRoom(db, userId);
  const match = await findMatch(db, room);
  // 進行中の物語も一緒に載せる。再接続したときはこれだけで盤へ戻れる（§28）。
  const story = await storyView(createStoryStore(db), userId);
  return {
    profile: loaded.profile,
    room: room ? publicRoom(room) : null,
    match: match ? matchView(match, userId) : null,
    queue: null,
    ...story,
  };
}

/* ───────────────────── 物語の保管庫 ───────────────────── */

function storyRowOf(row: any) {
  if (!row) return null;
  return {
    runId: row.run_id,
    userId: row.user_id,
    stageId: Number(row.stage_id),
    status: row.status,
    state: row.data?.state ?? row.data,
    revision: Number(row.revision || 0),
  };
}

/**
 * 物語の表とやりとりする窓口。run の読み書きと、資産との同時確定を受け持つ。
 */
function createStoryStore(db: any): StoryStore {
  return {
    loadProfile: (userId: string) => loadProfile(db, userId),
    async activeRun(userId: string) {
      const { data, error } = await db.from('triad_story_runs')
        .select('run_id,user_id,stage_id,status,data,revision')
        .eq('user_id', userId).eq('status', 'playing').maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async latestRun(userId: string) {
      const { data, error } = await db.from('triad_story_runs')
        .select('run_id,user_id,stage_id,status,data,revision')
        .eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async findRun(runId: string) {
      const { data, error } = await db.from('triad_story_runs')
        .select('run_id,user_id,stage_id,status,data,revision')
        .eq('run_id', runId).maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async commit(input: CommitInput) {
      const { data, error } = await db.rpc('triad_commit_story_run', {
        p_user_id: input.userId,
        p_run_id: input.runId,
        p_expected_revision: input.expectedRevision,
        p_stage_id: input.stageId,
        p_status: input.status,
        p_run_data: { state: input.state },
        p_profile_data: input.profile,
        p_profile_revision: input.profileRevision,
        p_request_id: input.requestId,
        p_body_hash: input.bodyHash,
        p_response: input.response,
      });
      if (error) throw error;
      const row = data?.[0];
      return { status: row?.status || 'busy', response: row?.response ?? null };
    },
    async hasLiveMatch(userId: string) {
      const match = await findMatch(db, await findRoom(db, userId));
      return !!match && match.state?.status === 'playing';
    },
    randomInt: (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % Math.max(1, Math.floor(max)),
    bodyHash: (path: string, body: unknown) => requestHash(path, body),
  };
}

/**
 * 対戦の公開ビュー。
 * publicSnapshot は盤面（state）だけを写すため、見る人ごとに変わる自席と、
 * 対戦の入れ物側に持つ報酬をここで足す。クライアントはこの2つを使って
 * 操作可否の判定と結果画面の表示を行う。
 */
function matchView(match: any, userId: string) {
  const seat = (match.seatSnapshot || []).find((s: any) => s.userId === userId);
  return {
    ...rules.publicSnapshot(match.state),
    yourSeat: seat ? seat.seat : 0,
    seatSnapshot: match.seatSnapshot || [],
    rewards: match.rewards || null,
    disconnect: match.disconnect || [],
  };
}

function publicRoom(room: any) {
  const copy = clone(room);
  delete copy.memberIds;
  delete copy._revision;
  return copy;
}

async function commitProfile(db: any, userId: string, revision: number, draft: any, requestId: string, hash: string, response: any) {
  const { data, error } = await db.rpc('triad_commit_profile', {
    p_user_id: userId, p_expected_revision: revision, p_data: draft,
    p_request_id: requestId, p_body_hash: hash, p_response: response,
  });
  if (error) throw error;
  return data?.[0];
}

/* ───────────────────── 対戦報酬 ───────────────────── */

/**
 * 決着した対戦の報酬を、各自のプロフィールへ実際に加算する。
 *
 * 二重付与はふたつの仕組みで防ぐ。grantMatchReward が profile.rewardedMatches に
 * 対戦IDを記録し、さらに triad_commit_profile が (user_id, request_id) で
 * 同じ確定を弾く。どちらから先に届いても結果は変わらない。
 *
 * @param onlyUserId 指定するとその人の分だけ確定する（取得のたびに全員分を
 *   読み書きしないよう、定期取得の経路ではこれを使う）。
 */
async function settleMatchRewards(db: any, match: any, onlyUserId?: string) {
  if (!match || !Array.isArray(match.rewards)) return;
  const targets = onlyUserId ? match.rewards.filter((r: any) => r.userId === onlyUserId) : match.rewards;
  for (const reward of targets) {
    if (!reward?.userId) continue;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await loadProfile(db, reward.userId);
      if (current.profile.rewardedMatches?.[match.matchId]) break;
      const draft = clone(current.profile);
      const granted = profileLogic.grantMatchReward(draft, {
        matchId: match.matchId,
        outcome: reward.outcome,
        charId: reward.charId,
        stonesPlaced: match.state?.stats?.[reward.seat]?.placed || 0,
        skillsUsed: match.state?.stats?.[reward.seat]?.skills || 0,
      });
      if (!granted?.ok) break;
      const committed = await commitProfile(
        db, reward.userId, current.revision, draft,
        `reward:${match.matchId}`,
        requestHash('/match/reward', { matchId: match.matchId }),
        { result: granted.result ?? null, replay: false, processed: false },
      );
      if (committed?.status === 'stale') continue;
      break;
    }
  }
}

/* ───────────────────── 交友まわりの保管庫 ───────────────────── */

/** プレイヤーコードは見間違えやすい文字（I・O・0・1）を外す。 */
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function newPlayerCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `TRIAD-${Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')}`;
}

/**
 * 名札（profiles）を用意する。資産は triad_profiles が持ち、こちらは
 * 表示名・プレイヤーコード・最終接続だけを預かる交友用の台帳。
 */
async function ensureIdentity(db: any, userId: string) {
  const now = new Date().toISOString();
  const { data } = await db.from('profiles').select('player_code').eq('id', userId).maybeSingle();
  if (data?.player_code) {
    // 在席の判定はこの時刻だけを見るので、毎回そっと進めておく。
    await db.from('profiles').update({ last_online_at: now }).eq('id', userId);
    return;
  }
  // 名札が要るのは初回だけ。ここでだけ資産側から表示名を借りる。
  const { profile } = await loadProfile(db, userId);
  const display_name = String(profile?.name || '旅人').slice(0, 16);
  // 重複したら引き直す。桁数から見て数回で必ず空きが見つかる。
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await db.from('profiles')
      .upsert({ id: userId, display_name, player_code: newPlayerCode(), last_online_at: now });
    if (!error) return;
  }
}

const asMillis = (value: any) => (value ? new Date(value).getTime() : null);

function createSocialStore(db: any): SocialStore {
  /** 名札とゲーム資産を1人分にまとめる。 */
  const rowsToPlayers = async (rows: any[]) => {
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const { data: games } = await db.from('triad_profiles').select('user_id,data').in('user_id', ids);
    const byId = new Map((games || []).map((g: any) => [g.user_id, g.data]));
    return rows.map((r) => ({
      id: r.id,
      name: r.display_name || '旅人',
      playerCode: r.player_code || '',
      lastSeenAt: asMillis(r.last_online_at),
      activeMatchId: r.active_match_id || null,
      game: byId.get(r.id) || null,
    }));
  };
  const one = async (rows: any[]) => (await rowsToPlayers(rows))[0] || null;
  const PROFILE_COLS = 'id,display_name,player_code,last_online_at,active_match_id';

  /** 自分が出ている対戦を新しい順に。件数が少ないうちは取得してから絞る。 */
  const matchesOf = async (userId: string, playing: boolean, limit: number) => {
    const { data } = await db.from('triad_matches').select('data').order('updated_at', { ascending: false }).limit(200);
    return (data || [])
      .map((r: any) => r.data)
      .filter((m: any) => (playing ? m?.status === 'playing' : m?.status !== 'playing'))
      .filter((m: any) => (m?.seatSnapshot || []).some((s: any) => s.userId === userId))
      .slice(0, limit);
  };

  return {
    async findById(id) {
      const { data } = await db.from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle();
      return data ? one([data]) : null;
    },
    async findByCode(code) {
      const { data } = await db.from('profiles').select(PROFILE_COLS).eq('player_code', code).maybeSingle();
      return data ? one([data]) : null;
    },
    async searchPlayers(q, limit) {
      const like = `%${q.replace(/[%_]/g, '')}%`;
      const { data } = await db.from('profiles').select(PROFILE_COLS)
        .or(`player_code.ilike.${like},display_name.ilike.${like}`).limit(limit);
      return rowsToPlayers(data || []);
    },
    async friendIdsOf(userId) {
      const { data } = await db.from('friendships').select('user_a,user_b').or(`user_a.eq.${userId},user_b.eq.${userId}`);
      return (data || []).map((f: any) => (f.user_a === userId ? f.user_b : f.user_a));
    },
    async pendingRequests(userId) {
      const { data } = await db.from('friend_requests').select('id,sender_id,receiver_id')
        .eq('status', 'PENDING').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      return (data || []).map((r: any) => ({ requestId: r.id, senderId: r.sender_id, receiverId: r.receiver_id }));
    },
    async createRequest(senderId, receiverId) {
      const { data, error } = await db.from('friend_requests')
        .insert({ sender_id: senderId, receiver_id: receiverId, status: 'PENDING' }).select('id').single();
      if (error) throw error;
      return data.id;
    },
    async findRequest(requestId) {
      const { data } = await db.from('friend_requests').select('id,sender_id,receiver_id,status').eq('id', requestId).maybeSingle();
      return data ? { requestId: data.id, senderId: data.sender_id, receiverId: data.receiver_id, status: data.status } : null;
    },
    async settleRequest(requestId, status) {
      await db.from('friend_requests').update({ status, responded_at: new Date().toISOString() }).eq('id', requestId);
    },
    async addFriendship(a, b) {
      const [user_a, user_b] = [a, b].sort();
      await db.from('friendships').upsert({ user_a, user_b }, { onConflict: 'user_a,user_b' });
    },
    async removeFriendship(a, b) {
      const [x, y] = [a, b].sort();
      await db.from('friendships').delete().eq('user_a', x).eq('user_b', y);
    },
    async notify(row) {
      await db.from('notifications').insert({
        user_id: row.userId,
        type: row.type,
        sender_id: row.senderId,
        request_id: row.requestId ?? null,
        invite_id: row.inviteId ?? null,
        room_code: row.roomCode ?? null,
        payload: row.payload || {},
        is_read: false,
        expires_at: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
      });
    },
    async listNotifications(userId, limit) {
      const { data } = await db.from('notifications')
        .select('id,type,sender_id,request_id,invite_id,room_code,payload,is_read,created_at,expires_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
      return (data || []).map((n: any) => ({
        id: n.id, type: n.type, senderId: n.sender_id, requestId: n.request_id,
        inviteId: n.invite_id, roomCode: n.room_code, payload: n.payload,
        isRead: !!n.is_read, at: asMillis(n.created_at) || 0, expiresAt: asMillis(n.expires_at),
      }));
    },
    async markNotificationsRead(userId, ids) {
      let q = db.from('notifications').update({ is_read: true }).eq('user_id', userId);
      if (ids) q = q.in('id', ids);
      await q;
    },
    async statsOf(userId) {
      const { data } = await db.from('player_stats').select('*').eq('player_id', userId).maybeSingle();
      return data || null;
    },
    async recentMatches(userId, limit) { return matchesOf(userId, false, limit); },
    async liveMatchOf(userId) { return (await matchesOf(userId, true, 1))[0] || null; },
    async findMatchById(matchId) {
      const { data } = await db.from('triad_matches').select('data').eq('match_id', matchId).maybeSingle();
      return data?.data || null;
    },
    async roomOf(userId) { return findRoom(db, userId); },
    async addRoomMember(room, userId, charId) {
      const { data } = await db.from('profiles').select('display_name').eq('id', userId).maybeSingle();
      room.members.push({ playerId: userId, name: data?.display_name || '旅人', charId, ready: false });
      await saveRoom(db, room);
    },
    async createInvite(senderId, receiverId, roomCode, expiresAt) {
      const { data, error } = await db.from('match_invites').insert({
        sender_id: senderId, receiver_id: receiverId, room_code: roomCode,
        status: 'PENDING', expires_at: new Date(expiresAt).toISOString(),
      }).select('id').single();
      if (error) throw error;
      return data.id;
    },
    async findInvite(inviteId) {
      const { data } = await db.from('match_invites').select('id,sender_id,receiver_id,room_code,status,expires_at').eq('id', inviteId).maybeSingle();
      return data ? {
        inviteId: data.id, senderId: data.sender_id, receiverId: data.receiver_id,
        roomCode: data.room_code, status: data.status, expiresAt: asMillis(data.expires_at),
      } : null;
    },
    async settleInvite(inviteId, status) {
      await db.from('match_invites').update({ status }).eq('id', inviteId);
    },
  };
}

async function mutateProfile(ctx: any, path: string, body: any, mutator: (draft: any) => any) {
  const requestId = String(body.requestId || '').slice(0, 128);
  if (!requestId) return { error: fail('request_id_required', '操作IDがありません。') };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await loadProfile(ctx.db, ctx.user.id);
    const draft = clone(current.profile);
    const result = mutator(draft);
    if (!result?.ok) return { error: fail(result?.code || 'rejected', result?.message || '操作できませんでした.', await viewOf(ctx.db, ctx.user.id, current.profile)) };
    const response = { result: result.result ?? null, replay: false, processed: false };
    const committed = await commitProfile(ctx.db, ctx.user.id, current.revision, draft, requestId, requestHash(path, { ...body, requestId: undefined }), response);
    if (committed?.status === 'stale') continue;
    if (committed?.status === 'conflict') return { error: fail('request_conflict', '同じ操作IDで異なる要求が届きました。') };
    if (committed?.status === 'replay') return { profile: current.profile, ...committed.response, replay: true };
    return { profile: draft, ...response };
  }
  return { error: fail('busy', '同時更新を処理中です。もう一度お試しください。') };
}

async function saveRoom(db: any, room: any) {
  room.memberIds = room.members.map((m: any) => m.playerId);
  room.updatedAt = Date.now();
  const row = { code: room.code, data: room, revision: Number(room._revision || 0) + 1, updated_at: new Date().toISOString() };
  delete row.data._revision;
  const { error } = await db.from('triad_rooms').upsert(row);
  if (error) throw error;
  room._revision = row.revision;
}

async function route(ctx: any, path: string, body: any) {
  const userId = ctx.user.id;
  // 名札の用意と在席の記録。交友の画面はこの2つだけを頼りにしている。
  await ensureIdentity(ctx.db, userId);

  // フレンド・検索・通知・招待・観戦。扱わない経路では null が返るので素通りする。
  const social = await socialRoute(createSocialStore(ctx.db), userId, path, body);
  if (social) {
    if ('fail' in social) return fail(social.fail.code, social.fail.message, await viewOf(ctx.db, userId));
    const view = { ...await viewOf(ctx.db, userId), ...(social.view || {}) };
    return success(view, social.result === undefined ? {} : { result: social.result });
  }

  // 物語。扱わない経路では null が返るので素通りする。
  const story = await storyRoute(createStoryStore(ctx.db), userId, path, body);
  if (story) {
    const view = { ...await viewOf(ctx.db, userId), ...(story.view || {}) };
    if ('fail' in story && story.fail) return fail(story.fail.code, story.fail.message, view);
    return success(view, story.result === undefined ? {} : { result: story.result });
  }

  if (path === '/me' || path === '/world/poll') {
    // 決着の手を打てなかった人（負け・引き分け・回線が切れていた人）も、
    // 次の定期取得で自分の報酬を受け取れるようにする。
    const pending = await findMatch(ctx.db, await findRoom(ctx.db, userId));
    if (pending && Array.isArray(pending.rewards)) await settleMatchRewards(ctx.db, pending, userId);
    return success(await viewOf(ctx.db, userId));
  }

  if (path === '/name') {
    const name = cleanName(body.name);
    if (!name) return fail('bad_name', '名前を入力してください。');
    const out = await mutateProfile(ctx, path, body, (draft) => { draft.name = name; return { ok: true, result: { name } }; });
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }

  if (path === '/gacha') {
    const out = await mutateProfile(ctx, path, body, (draft) => profileLogic.pullGacha(draft, {
      count: Number(body.count), requestId: String(body.requestId), randomInt: (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n,
    }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { gacha: out.result, replay: out.replay, processed: out.processed });
  }

  if (path === '/train') {
    const out = await mutateProfile(ctx, path, body, (draft) => profileLogic.trainCharacter(draft, { charId: String(body.charId), requestId: String(body.requestId) }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { train: out.result, replay: out.replay });
  }

  if (path === '/equip' || path === '/equip/reset') {
    const out = await mutateProfile(ctx, path, body, (draft) => path === '/equip'
      ? profileLogic.equipCosmetic(draft, { slot: body.slot, id: body.id, charId: body.charId })
      : profileLogic.resetEquipToDefault(draft, { scope: body.scope, charId: body.charId }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: { equipped: true }, replay: out.replay });
  }

  if (path === '/settings') {
    // 端末をまたいで持ち歩く操作設定（§24）。資産には影響しない。
    const out = await mutateProfile(ctx, path, body, (draft) => profileLogic.applySettings(draft, body.settings));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }

  if (path === '/mission/claim') {
    const out = await mutateProfile(ctx, path, body, (draft) => profileLogic.claimMission(draft, String(body.missionId)));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }

  if (path === '/room/create' || path === '/world/join') {
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail('bad_char', 'そのキャラクターは存在しません。');
    if (await findRoom(ctx.db, userId)) return fail('already_in_room', 'すでにルームへ参加しています。');
    const p = (await loadProfile(ctx.db, userId)).profile;
    if (path === '/world/join') {
      const { data: candidates } = await ctx.db.from('triad_rooms').select('data,revision').contains('data', { visibility: 'public', status: 'lobby' }).limit(20);
      const candidate = (candidates || []).map((x: any) => ({ ...x.data, _revision: Number(x.revision) })).find((x: any) => x.members.length < 3);
      if (candidate) {
        candidate.members.push({ playerId: userId, name: p.name, charId: body.charId, ready: true });
        await saveRoom(ctx.db, candidate);
        return success(await viewOf(ctx.db, userId), { result: { code: candidate.code, queued: candidate.members.length < 3 } });
      }
    }
    for (let i = 0; i < 12; i += 1) {
      const code = randomHex(3);
      const isWorld = path === '/world/join';
      const room = { code, hostId: userId, visibility: isWorld ? 'public' : (body.visibility || 'private'), status: 'lobby', matchId: null,
        createdAt: Date.now(), members: [{ playerId: userId, name: p.name, charId: body.charId, ready: isWorld }] };
      try { await saveRoom(ctx.db, room); return success(await viewOf(ctx.db, userId), { result: { code } }); } catch { /* code collision */ }
    }
    return fail('no_code', 'ルームを作成できませんでした。');
  }

  if (path === '/room/join') {
    const code = String(body.code || '').trim().toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(code)) return fail('bad_code', 'ルームコードが不正です。');
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail('bad_char', 'そのキャラクターは存在しません。');
    const { data } = await ctx.db.from('triad_rooms').select('data,revision').eq('code', code).maybeSingle();
    if (!data) return fail('no_room', 'そのルームは見つかりません。');
    const room = { ...data.data, _revision: Number(data.revision) };
    if (room.status !== 'lobby' || room.members.length >= 3) return fail('full', 'そのルームには参加できません。');
    const p = (await loadProfile(ctx.db, userId)).profile;
    if (!room.members.some((m: any) => m.playerId === userId)) room.members.push({ playerId: userId, name: p.name, charId: body.charId, ready: false });
    await saveRoom(ctx.db, room);
    return success(await viewOf(ctx.db, userId), { result: { code } });
  }

  const room = await findRoom(ctx.db, userId);
  if (path.startsWith('/room/') && !room) return fail('no_room', 'ルームに参加していません。');
  if (path === '/room/char') {
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail('bad_char', 'そのキャラクターは存在しません。');
    room.members = room.members.map((m: any) => m.playerId === userId ? { ...m, charId: body.charId, ready: false } : m);
    await saveRoom(ctx.db, room); return success(await viewOf(ctx.db, userId));
  }
  if (path === '/room/ready') {
    room.members = room.members.map((m: any) => m.playerId === userId ? { ...m, ready: !!body.ready } : m);
    await saveRoom(ctx.db, room); return success(await viewOf(ctx.db, userId));
  }
  if (path === '/room/leave' || path === '/world/leave') {
    room.members = room.members.filter((m: any) => m.playerId !== userId);
    if (!room.members.length) await ctx.db.from('triad_rooms').delete().eq('code', room.code);
    else { if (room.hostId === userId) room.hostId = room.members[0].playerId; room.status = 'lobby'; room.matchId = null; await saveRoom(ctx.db, room); }
    return success(await viewOf(ctx.db, userId));
  }
  if (path === '/room/start') {
    if (room.hostId !== userId) return fail('not_host', '開始できるのはホストだけです。');
    if (room.members.length !== 3 || !room.members.every((m: any) => m.ready)) return fail('not_ready', '3人全員の準備が必要です。');
    const matchId = `m_${randomHex(8).toLowerCase()}`;
    const seats = room.members.map((m: any, i: number) => ({ seat: i + 1, name: m.name, charId: m.charId, kind: 'human', userId: m.playerId }));
    const state = rules.createMatch({ matchId, mode: 'online', seats, startSeat: rules.pickStartSeat() });
    const match = { matchId, roomCode: room.code, seatSnapshot: seats, state, status: 'playing', rewards: null, createdAt: Date.now() };
    const { error } = await ctx.db.from('triad_matches').insert({ match_id: matchId, room_code: room.code, data: match, revision: 0 });
    if (error) throw error;
    room.matchId = matchId; room.status = 'playing'; await saveRoom(ctx.db, room);
    return success(await viewOf(ctx.db, userId), { result: { matchId } });
  }
  if (path === '/match/action') {
    const match = await findMatch(ctx.db, room);
    if (!match || match.matchId !== body.matchId) return fail('no_match', 'その対戦は見つかりません。');
    const seat = match.seatSnapshot.find((s: any) => s.userId === userId);
    if (!seat || match.state.turn !== seat.seat) return fail('not_your_turn', 'いまはあなたの手番ではありません。');
    if (Number(body.revision) !== match.revision) return fail('stale_revision', '盤面が更新されています。');
    const applied = rules.applyAction(match.state, { ...body.action, seat: seat.seat });
    if (!applied.ok) return fail(applied.code, applied.message);
    const next = { ...match, state: applied.state, status: applied.state.status };
    // 決着した手と同じ確定で報酬額を残す。盤面から決まる値なので、
    // あとから誰が読んでも同じ結果になる。
    const finished = isSettled(next);
    if (finished && !Array.isArray(next.rewards)) next.rewards = rewardsForMatch(next);
    const response = { result: { matchId: match.matchId, revision: match.revision + 1 } };
    const { data, error } = await ctx.db.rpc('triad_commit_match', {
      p_user_id: userId, p_match_id: match.matchId, p_expected_revision: match.revision, p_data: next,
      p_request_id: String(body.requestId), p_body_hash: requestHash(path, body.action), p_response: response,
    });
    if (error) throw error;
    const committed = data?.[0];
    if (committed?.status === 'stale') return fail('stale_revision', '盤面が更新されています。');
    if (committed?.status === 'conflict') return fail('request_conflict', '同じ操作IDで異なる要求が届きました。');
    // 決着した手を打った人が、3人分の報酬をまとめて確定する。
    // ここで落ちても、各自の定期取得が同じ確定をやり直せる。
    if (finished) await settleMatchRewards(ctx.db, next);
    return success(await viewOf(ctx.db, userId), { ...response, replay: committed?.status === 'replay' });
  }
  if (path === '/ranking') return success(await viewOf(ctx.db, userId), { ranking: [] });
  return fail('not_found', 'その操作はありません。', await viewOf(ctx.db, userId), 404);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return fail('method_not_allowed', 'POSTを使用してください。', undefined, 405);
  try {
    const ctx = await context(req);
    if (!ctx) return fail('unauthorized', '認証が必要です。', undefined, 401);
    const body = await req.json().catch(() => ({}));
    const path = new URL(req.url).pathname.replace(/^.*\/api(?=\/|$)/, '') || '/me';
    return await route(ctx, path, body);
  } catch (error) {
    console.error(error);
    return fail('server_error', 'サーバー処理に失敗しました。', undefined, 500);
  }
});
