import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryStoryStore } from './helpers/memory-story-store.mjs';

const { profile: profileLogic, stages, storyEngine } = await import('../supabase/functions/api/game-core.js');
const { storyRoute } = await import('../supabase/functions/api/story.ts');

const ME = 'u_me';

function freshStore(extra = {}) {
  return createMemoryStoryStore({
    profiles: { [ME]: profileLogic.createProfile({ id: ME, name: '旅人' }) },
    ...extra,
  });
}

/** 空いている交点。修練盤の石から離れた末尾側から取る。 */
function emptyIndex(state, skip = 0) {
  let seen = 0;
  for (let i = state.stones.length - 1; i >= 0; i -= 1) {
    if (state.stones[i] !== 0 || state.guards[i] || state.ice[i]) continue;
    if (seen === skip) return i;
    seen += 1;
  }
  throw new Error('空いている交点が見つかりません');
}

/** 第1段の修練盤は「横に並んだ四つの石を五つにする」。その五つ目の交点を探す。 */
function winningIndex(state) {
  const w = state.width;
  const mine = state.stones.map((v, i) => [v, i]).filter(([v]) => v === 1).map(([, i]) => i);
  const last = Math.max(...mine);
  return last + 1 < state.stones.length && Math.floor((last + 1) / w) === Math.floor(last / w)
    ? last + 1
    : Math.min(...mine) - 1;
}

test('物語の開始はサーバーが盤面を作り、進行中の印を資産へ残す', async () => {
  const store = freshStore();

  const out = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });

  assert.equal(out.fail, undefined);
  assert.equal(out.view.story.stageId, 1);
  assert.equal(out.view.story.status, 'playing');
  assert.equal(out.view.story.revision, 1);
  assert.equal(store._profile(ME).story.activeMatchId, out.result.runId);
  assert.equal(store._runs().length, 1);
});

test('前の段を越えていない段は、サーバーが開始を拒む', async () => {
  const store = freshStore();

  const out = await storyRoute(store, ME, '/story/begin', { stageId: 5, requestId: 'r1' });

  assert.equal(out.fail.code, 'locked');
  assert.equal(store._runs().length, 0);
});

test('オンライン対戦の最中は物語を始められない', async () => {
  const store = freshStore({ liveMatch: true });

  const out = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });

  assert.equal(out.fail.code, 'online_busy');
  assert.equal(store._runs().length, 0);
});

test('進行中の段があるときの開始は、新しく作らず同じ盤へ戻す', async () => {
  const store = freshStore();
  const first = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });

  const again = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r2' });

  assert.equal(again.result.resumed, true);
  assert.equal(again.view.story.runId, first.result.runId);
  assert.equal(store._runs().length, 1);
});

test('自分の手を受けたら、敵の手番も同じ応答の中でサーバーが解決する', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const empty = emptyIndex(store._runs()[0].state);

  const out = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a1',
    action: { type: 'place', index: empty },
  });

  assert.equal(out.fail, undefined);
  assert.equal(out.view.story.revision, 2);
  assert.ok(out.result.events.length >= 1, '自分の手と敵の手が記録される');
  assert.equal(store._runs()[0].state.stones[empty], 1);
});

test('合法でない手はサーバーが弾き、盤面も資産も動かない', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const taken = store._runs()[0].state.stones.findIndex((v) => v !== 0);
  const beforeRevision = store._runs()[0].revision;

  const out = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a1',
    action: { type: 'place', index: taken },
  });

  assert.ok(out.fail, '占有された交点への着手は拒否される');
  assert.equal(store._runs()[0].revision, beforeRevision);
});

test('古い版から届いた手は拒否し、最新の盤面を返す', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const empty = emptyIndex(store._runs()[0].state);
  const other = emptyIndex(store._runs()[0].state, 2);
  const played = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a1', action: { type: 'place', index: empty },
  });
  assert.equal(played.fail, undefined, '前提の1手は通る');

  const stale = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a2', action: { type: 'place', index: other },
  });

  assert.equal(stale.fail.code, 'stale');
  assert.equal(stale.view.story.revision, 2, '最新の盤面を添えて返す');
});

test('勝利の褒美はサーバーが確定し、同じ操作IDの再送では二重に入らない', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const run = store._runs()[0];
  const index = winningIndex(run.state);
  const beforePerica = store._profile(ME).perica;

  const win = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a1',
    action: { type: 'place', index },
  });

  assert.equal(win.result.finished, true);
  assert.equal(win.result.reward.outcome, 'win');
  assert.equal(win.view.story.status, 'finished');
  const afterPerica = store._profile(ME).perica;
  assert.ok(afterPerica > beforePerica, '勝利でペリカが増える');
  assert.equal(store._profile(ME).story.cleared[1].clears, 1);
  assert.equal(store._profile(ME).story.activeMatchId, null);

  const resent = await storyRoute(store, ME, '/story/action', {
    runId: begun.result.runId, revision: 1, requestId: 'a1',
    action: { type: 'place', index },
  });

  assert.ok(resent.fail || resent.result?.replay, '同じ操作IDの再送は処理し直さない');
  assert.equal(store._profile(ME).perica, afterPerica, '褒美は二重に入らない');
  assert.equal(store._profile(ME).story.cleared[1].clears, 1);
});

test('中止では褒美を付けず、進行中の印だけを外す', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const beforePerica = store._profile(ME).perica;

  const out = await storyRoute(store, ME, '/story/abort', { runId: begun.result.runId, requestId: 'x1' });

  assert.equal(out.result.aborted, true);
  assert.equal(store._profile(ME).perica, beforePerica);
  assert.deepEqual(store._profile(ME).story.cleared, {});
  assert.equal(store._profile(ME).story.activeMatchId, null);
  assert.equal(store._runs()[0].status, 'aborted');
});

test('他人の run は触れない', async () => {
  const store = freshStore();
  const begun = await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });

  const out = await storyRoute(store, 'u_other', '/story/abort', { runId: begun.result.runId, requestId: 'x1' });

  assert.equal(out.fail.code, 'no_run');
  assert.equal(store._runs()[0].status, 'playing');
});

test('/story/run は進行中の盤面を返し、無ければ null を返す', async () => {
  const store = freshStore();
  const empty = await storyRoute(store, ME, '/story/run', {});
  assert.equal(empty.view.story, null);

  await storyRoute(store, ME, '/story/begin', { stageId: 1, requestId: 'r1' });
  const live = await storyRoute(store, ME, '/story/run', {});

  assert.equal(live.view.story.stageId, 1);
  assert.equal(live.view.story.state.story.stageId, 1, '公開スナップショットに通してから返す');
});

test('物語の経路でないものは素通りさせる', async () => {
  const store = freshStore();
  assert.equal(await storyRoute(store, ME, '/gacha', {}), null);
});

test('サーバー側のコアは物語の30段とエンジンを持っている', () => {
  assert.equal(stages.STORY_STAGE_COUNT, 30);
  assert.equal(typeof storyEngine.createStoryMatch, 'function');
  assert.equal(typeof storyEngine.applyPlayerAction, 'function');
  assert.equal(typeof storyEngine.runEnemyTurn, 'function');
});
