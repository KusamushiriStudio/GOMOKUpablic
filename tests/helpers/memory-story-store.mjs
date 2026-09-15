/**
 * StoryStore の試験用実装。表の代わりに素の連想配列を持つ。
 *
 * 本番（Supabase）では triad_commit_story_run が run と資産を1つの
 * トランザクションで書く。ここでも同じ約束を守り、
 *  ・requestId が既出なら replay（何も書かない）
 *  ・盤面の版が合わなければ stale（何も書かない）
 *  ・進行中の run が既にあるのに新規作成を頼まれたら busy
 * を再現する。
 */
export function createMemoryStoryStore(seed = {}) {
  const runs = new Map();          // runId -> row
  const requests = new Map();      // `${userId}:${requestId}` -> { bodyHash, response }
  const profiles = new Map();      // userId -> { profile, revision }
  let liveMatch = !!seed.liveMatch;
  /** 抽選は試験の間ずっと同じ結果になるようにする */
  let rolls = seed.rolls ? [...seed.rolls] : null;
  /** 書き込み順（直近の run を選ぶのに使う） */
  let seq = 0;

  for (const [userId, profile] of Object.entries(seed.profiles || {})) {
    profiles.set(userId, { profile, revision: seed.revisions?.[userId] ?? 0 });
  }
  for (const row of seed.runs || []) runs.set(row.runId, { ...row });

  const clone = (v) => structuredClone(v);

  const store = {
    async loadProfile(userId) {
      const rec = profiles.get(userId);
      if (!rec) throw new Error(`no profile for ${userId}`);
      return { profile: clone(rec.profile), revision: rec.revision };
    },
    async activeRun(userId) {
      for (const row of runs.values()) {
        if (row.userId === userId && row.status === 'playing') return clone(row);
      }
      return null;
    },
    async latestRun(userId) {
      let latest = null;
      for (const row of runs.values()) {
        if (row.userId !== userId) continue;
        if (!latest || row.at >= latest.at) latest = row;
      }
      return latest ? clone(latest) : null;
    },
    async findRun(runId) {
      const row = runs.get(runId);
      return row ? clone(row) : null;
    },
    async commit(input) {
      const key = `${input.userId}:${input.requestId}`;
      const prior = requests.get(key);
      if (prior) {
        if (prior.bodyHash !== input.bodyHash) return { status: 'conflict' };
        return { status: 'replay', response: prior.response };
      }
      if (input.expectedRevision < 0) {
        if (await store.activeRun(input.userId)) return { status: 'busy' };
        runs.set(input.runId, {
          runId: input.runId,
          userId: input.userId,
          stageId: input.stageId,
          status: input.status,
          state: clone(input.state),
          revision: 1,
          at: ++seq,
        });
      } else {
        const row = runs.get(input.runId);
        if (!row || row.userId !== input.userId) return { status: 'missing' };
        if (row.revision !== input.expectedRevision) return { status: 'stale' };
        row.state = clone(input.state);
        row.status = input.status;
        row.stageId = input.stageId;
        row.revision += 1;
        row.at = ++seq;
      }
      if (input.profile) {
        const rec = profiles.get(input.userId) || { profile: null, revision: 0 };
        if (rec.revision !== input.profileRevision) return { status: 'stale' };
        profiles.set(input.userId, { profile: clone(input.profile), revision: rec.revision + 1 });
      }
      requests.set(key, { bodyHash: input.bodyHash, response: input.response });
      return { status: 'committed', response: input.response };
    },
    async hasLiveMatch() { return liveMatch; },
    randomInt(max) {
      if (rolls && rolls.length) return rolls.shift() % Math.max(1, max);
      return 0;
    },
    bodyHash(path, body) { return `${path}:${JSON.stringify(body ?? null)}`; },

    /* ── 試験から覗くための入口 ── */
    _profile(userId) { return profiles.get(userId)?.profile ?? null; },
    _profileRevision(userId) { return profiles.get(userId)?.revision ?? 0; },
    _runs() { return [...runs.values()]; },
    _setLiveMatch(v) { liveMatch = v; },
  };
  return store;
}
