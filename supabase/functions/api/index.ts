import { createClient } from '@supabase/supabase-js';
import { constants, profile as profileLogic, rules } from './game-core.js';
import { isSettled, rewardsForMatch } from './rewards.ts';

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
  return { profile: loaded.profile, room: room ? publicRoom(room) : null, match: match ? matchView(match, userId) : null, queue: null };
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
