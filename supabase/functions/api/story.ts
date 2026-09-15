/**
 * 物語（1対1）のサーバー側。
 *
 * これまで物語は端末の保存だけで進み、褒美もクライアントの申告で決まっていた。
 * 正式な資産（ペリカ・XP・術・碁印・着せ替え）が動く以上、盤面・合法手・勝敗は
 * すべてここで確かめる（統合仕様書 §16〜§17・§40）。
 *
 * 進め方
 *  ・/story/begin で run を作る。盤面はサーバーが createStoryMatch で組む。
 *  ・/story/action は「自分の1手」だけを受け取り、敵の手番は同じ応答の中で
 *    サーバーが解決する。クライアントが敵の手番を飛ばすことはできない。
 *  ・決着した手番では、盤面の保存と褒美の確定を1つのトランザクションで書く。
 *  ・データの出し入れは StoryStore ごしにだけ行う。本番は Supabase の表を、
 *    試験は素の連想配列を同じ入口へ差せる（social.ts と同じ作り）。
 */

import { profile as profileLogic, stages, storyEngine } from './game-core.js';

const { PLAYER_SEAT, createStoryMatch, applyPlayerAction, runEnemyTurn, storySnapshot, storyOutcome } = storyEngine;

export type StoryRunRow = {
  runId: string;
  userId: string;
  stageId: number;
  status: 'playing' | 'finished' | 'aborted';
  state: any;
  revision: number;
};

export type CommitInput = {
  userId: string;
  runId: string;
  /** 負なら新規作成 */
  expectedRevision: number;
  stageId: number;
  status: 'playing' | 'finished' | 'aborted';
  state: any;
  /** 資産も同時に確定する場合だけ渡す */
  profile: any | null;
  profileRevision: number;
  requestId: string;
  bodyHash: string;
  response: any;
};

export type CommitResult = {
  status: 'committed' | 'stale' | 'replay' | 'conflict' | 'missing' | 'busy';
  response?: any;
};

export type StoryStore = {
  loadProfile(userId: string): Promise<{ profile: any; revision: number }>;
  /** 進行中の run（1アカウント1本）。無ければ null。 */
  activeRun(userId: string): Promise<StoryRunRow | null>;
  findRun(runId: string): Promise<StoryRunRow | null>;
  commit(input: CommitInput): Promise<CommitResult>;
  /** 進行中のオンライン対戦があるか（§32 同時進行の禁止） */
  hasLiveMatch(userId: string): Promise<boolean>;
  /** 着せ替えの抽選に使う乱数 */
  randomInt(max: number): number;
  bodyHash(path: string, body: unknown): string;
};

const fail = (code: string, message: string) => ({ fail: { code, message } });
const clone = <T>(value: T): T => structuredClone(value);

/** 画面へ返す run の姿。盤面は公開スナップショットに通してから渡す。 */
function runView(row: { runId: string; stageId: number; status: string; state: any; revision: number } | null) {
  if (!row) return null;
  return {
    runId: row.runId,
    stageId: row.stageId,
    status: row.status,
    revision: row.revision,
    state: storySnapshot(row.state),
  };
}

/** 進行中の物語を画面へ載せる（再接続のときはこれだけで盤へ戻れる）。 */
export async function storyView(store: StoryStore, userId: string) {
  const run = await store.activeRun(userId);
  return { story: runView(run) };
}

/**
 * 物語の経路。扱わない path では null を返し、呼び出し側を素通りさせる。
 */
export async function storyRoute(store: StoryStore, userId: string, path: string, body: any) {
  if (path === '/story/run') {
    return { view: await storyView(store, userId) };
  }

  if (path === '/story/begin') return begin(store, userId, body);
  if (path === '/story/action') return action(store, userId, body);
  if (path === '/story/abort') return abort(store, userId, body);
  return null;
}

async function begin(store: StoryStore, userId: string, body: any) {
  const stageId = Number(body?.stageId);
  const requestId = String(body?.requestId || '');
  if (!requestId) return fail('bad_request', '操作IDがありません。');
  if (!stages.STAGE_BY_ID[stageId]) return fail('no_stage', 'そのステージはありません。');
  if (await store.hasLiveMatch(userId)) {
    return fail('online_busy', 'オンライン対戦の途中は、物語を始められません。');
  }

  const existing = await store.activeRun(userId);
  if (existing) {
    // 進行中があるなら、新しく始めずにそれへ戻す（§32）。
    return { view: { story: runView(existing) }, result: { resumed: true } };
  }

  const { profile, revision } = await store.loadProfile(userId);
  const gate = profileLogic.canEnterStage(profile, stageId);
  if (!gate.ok) return fail(gate.code || 'locked', gate.message);

  const runId = `story_${crypto.randomUUID()}`;
  const draft = clone(profile);
  const begun = profileLogic.beginStoryMatch(draft, { stageId, matchId: runId });
  if (!begun.ok) return fail(begun.code || 'story_rejected', begun.message);

  const state = createStoryMatch({
    stageId,
    matchId: runId,
    playerName: draft.name || 'あなた',
    charId: draft.lastCharId,
    cosmetics: profileLogic.appearanceFor(draft, draft.lastCharId),
  });

  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: -1,
    stageId,
    status: 'playing',
    state,
    profile: draft,
    profileRevision: revision,
    requestId,
    bodyHash: store.bodyHash('/story/begin', { stageId }),
    response: { runId, stageId },
  });
  if (committed.status === 'busy') {
    const live = await store.activeRun(userId);
    return { view: { story: runView(live) }, result: { resumed: true } };
  }
  if (committed.status === 'replay') {
    const live = await store.activeRun(userId);
    return { view: { story: runView(live) }, result: { ...committed.response, replay: true } };
  }
  if (committed.status !== 'committed') return fail('busy', 'いま保存が混み合っています。もう一度お試しください。');

  return {
    view: { story: runView({ runId, stageId, status: 'playing', state, revision: 1 }) },
    result: { runId, stageId },
  };
}

/**
 * 自分の1手。決着していなければ、続けて敵の手番をサーバーで解決する。
 *
 * クライアントは expectedRevision を添える。古い版から届いた手は拒否し、
 * 最新の盤面を返す（§42）。
 */
async function action(store: StoryStore, userId: string, body: any) {
  const runId = String(body?.runId || '');
  const requestId = String(body?.requestId || '');
  const expected = Number(body?.revision);
  if (!runId || !requestId) return fail('bad_request', '操作IDがありません。');
  if (!Number.isInteger(expected)) return fail('bad_request', '盤面の版がありません。');

  const run = await store.findRun(runId);
  if (!run || run.userId !== userId) return fail('no_run', 'その物語の盤面は見つかりません。');
  if (run.status !== 'playing') return fail('finished', 'その段はすでに終わっています。');
  if (run.revision !== expected) {
    return { view: { story: runView(run) }, fail: { code: 'stale', message: '盤面が更新されています。最新の盤面を表示しました。' } };
  }

  const played = applyPlayerAction(clone(run.state), { ...body.action, seat: PLAYER_SEAT });
  if (!played.ok) return fail(played.code || 'illegal', played.message || 'その操作は行えません。');

  const events = [played.event].filter(Boolean);
  let state = played.state;
  if (state.status === 'playing') {
    const enemy = runEnemyTurn(state, () => store.randomInt(1_000_000) / 1_000_000);
    state = enemy.state;
    events.push(...enemy.events);
  }

  const finished = state.status === 'finished';
  const stage = stages.STAGE_BY_ID[run.stageId];
  let reward: any = null;
  let profileDraft: any = null;
  let profileRevision = 0;

  if (finished) {
    const outcome = storyOutcome(state)?.outcome || 'lose';
    const loaded = await store.loadProfile(userId);
    profileRevision = loaded.revision;
    profileDraft = clone(loaded.profile);
    const before = new Set(profileDraft.story.skills);
    const granted = profileLogic.grantStoryClear(profileDraft, {
      stageId: stage.id,
      outcome,
      charId: state.seats[PLAYER_SEAT - 1]?.charId || null,
      randomInt: (n: number) => store.randomInt(n),
    });
    if (!granted.ok) return fail(granted.code || 'story_rejected', granted.message);
    const learned = profileDraft.story.skills.find((id: string) => !before.has(id)) || null;
    profileLogic.endStoryMatch(profileDraft, runId);
    reward = { ...granted.result, skill: learned, outcome };
  }

  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: run.revision,
    stageId: run.stageId,
    status: finished ? 'finished' : 'playing',
    state,
    profile: profileDraft,
    profileRevision,
    requestId,
    bodyHash: store.bodyHash('/story/action', { runId, revision: expected, action: body.action }),
    response: { reward, finished },
  });
  if (committed.status === 'replay') {
    const live = await store.findRun(runId);
    return { view: { story: runView(live) }, result: { ...committed.response, replay: true } };
  }
  if (committed.status === 'stale') {
    const live = await store.findRun(runId);
    return { view: { story: runView(live) }, fail: { code: 'stale', message: '盤面が更新されています。最新の盤面を表示しました。' } };
  }
  if (committed.status !== 'committed') return fail('busy', 'いま保存が混み合っています。もう一度お試しください。');

  return {
    view: { story: runView({ runId, stageId: run.stageId, status: finished ? 'finished' : 'playing', state, revision: run.revision + 1 }) },
    result: { events, reward, finished },
  };
}

/** 段をやめる。褒美は付けず、進行中の印だけを外す。 */
async function abort(store: StoryStore, userId: string, body: any) {
  const runId = String(body?.runId || '');
  const requestId = String(body?.requestId || '');
  if (!runId || !requestId) return fail('bad_request', '操作IDがありません。');

  const run = await store.findRun(runId);
  if (!run || run.userId !== userId) return fail('no_run', 'その物語の盤面は見つかりません。');
  if (run.status !== 'playing') return { view: { story: null }, result: { aborted: true } };

  const loaded = await store.loadProfile(userId);
  const draft = clone(loaded.profile);
  const granted = profileLogic.grantStoryClear(draft, { stageId: run.stageId, outcome: 'aborted' });
  if (!granted.ok) return fail(granted.code || 'story_rejected', granted.message);
  profileLogic.endStoryMatch(draft, runId);

  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: run.revision,
    stageId: run.stageId,
    status: 'aborted',
    state: run.state,
    profile: draft,
    profileRevision: loaded.revision,
    requestId,
    bodyHash: store.bodyHash('/story/abort', { runId }),
    response: { aborted: true },
  });
  if (committed.status === 'replay') return { view: { story: null }, result: { aborted: true, replay: true } };
  if (committed.status !== 'committed') return fail('busy', 'いま保存が混み合っています。もう一度お試しください。');
  return { view: { story: null }, result: { aborted: true } };
}
