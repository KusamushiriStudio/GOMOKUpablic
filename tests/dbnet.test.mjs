import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const { DbNet } = requireModule('dbnet.js');
const { createProfile } = requireModule('../../shared/profile.js');

test('DbNet connect is idempotent and publishes its initial state once', async () => {
  const net = new DbNet();
  let started = 0;
  let subscribed = 0;
  let published = 0;
  net.ensure = async () => true;
  net._startHeartbeat = () => { started += 1; };
  net._resubscribe = () => { subscribed += 1; };
  net._publish = () => { published += 1; };

  await Promise.all([net.connect(), net.connect(), net.connect()]);

  assert.equal(started, 1);
  assert.equal(subscribed, 1);
  assert.equal(published, 1);
  assert.equal(net.status, 'online');
});

test('DbNet heartbeat registers one visibility listener and removes it on disconnect', () => {
  const previousDocument = globalThis.document;
  const previousSetInterval = globalThis.setInterval;
  const previousClearInterval = globalThis.clearInterval;
  const listeners = new Set();
  globalThis.document = {
    hidden: false,
    addEventListener(type, listener) { if (type === 'visibilitychange') listeners.add(listener); },
    removeEventListener(type, listener) { if (type === 'visibilitychange') listeners.delete(listener); },
  };
  globalThis.setInterval = () => 1;
  globalThis.clearInterval = () => {};
  try {
    const net = new DbNet();
    net._connectionStarted = true;
    net._writePresence = async () => {};
    net._startHeartbeat();
    net._startHeartbeat();
    assert.equal(listeners.size, 1);
    net._stopHeartbeat();
    assert.equal(listeners.size, 0);
    net._startHeartbeat();
    assert.equal(listeners.size, 1);
    net._stopHeartbeat();
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    globalThis.setInterval = previousSetInterval;
    globalThis.clearInterval = previousClearInterval;
  }
});

test('DbNet post preserves a supplied requestId and creates one when absent', async () => {
  const net = new DbNet();
  net.ensure = async () => true;
  const received = [];
  net._gacha = async (body) => {
    received.push(body);
    return { ok: true };
  };

  await net.post('/api/gacha', { count: 1, requestId: 'retry-id' });
  await net.post('/api/gacha', { count: 10 });

  assert.equal(received[0].requestId, 'retry-id');
  assert.equal(received[0].count, 1);
  assert.equal(typeof received[1].requestId, 'string');
  assert.ok(received[1].requestId.length > 0);
});

test('DbNet profile mutation is rolled back when shared storage rejects the write', async () => {
  const net = new DbNet();
  net.me = 'player-test';
  net.profile = createProfile({ id: net.me, name: '変更前' });
  net.db = {
    doc() {
      return { async set() { throw new Error('write failed'); } };
    },
  };
  const before = JSON.stringify(net.profile);

  await assert.rejects(() => net._setName({ name: '保存されない名前' }));

  assert.equal(JSON.stringify(net.profile), before);
});

/** 物語の通信だけを見るための最小構成（共有ストアへの書き込みは記録するだけ） */
function storyNet() {
  const net = new DbNet();
  net.me = 'player-story';
  net.profile = createProfile({ id: net.me, name: '旅人' });
  net.available = true;
  net.ensure = async () => true;
  net._publish = () => {};
  const writes = [];
  net.db = {
    doc() {
      return { async set(value) { writes.push(value); } };
    },
  };
  return { net, writes };
}

test('DbNet story begin records the active match on the shared profile', async () => {
  const { net, writes } = storyNet();

  const r = await net.post('/api/story/begin', { stageId: 1, matchId: 'story_a' });

  assert.equal(r.ok, true);
  assert.equal(net.profile.story.activeMatchId, 'story_a');
  assert.equal(net.profile.story.lastStage, 1);
  assert.equal(writes.length, 1);
});

test('DbNet story begin refuses a stage whose previous stage is not cleared', async () => {
  const { net, writes } = storyNet();

  const r = await net.post('/api/story/begin', { stageId: 3, matchId: 'story_a' });

  assert.equal(r.ok, false);
  assert.equal(r.code, 'locked');
  assert.equal(net.profile.story.activeMatchId, null);
  assert.equal(writes.length, 0);
});

test('DbNet story finish grants the reward once and treats a resend as a replay', async () => {
  const { net } = storyNet();
  await net.post('/api/story/begin', { stageId: 1, matchId: 'story_a' });
  const beforePerica = net.profile.perica;

  const first = await net.post('/api/story/finish', { stageId: 1, matchId: 'story_a', outcome: 'win' });
  assert.equal(first.ok, true);
  assert.equal(first.data.result.replay, false);
  assert.equal(first.data.result.story.cleared, true);
  const afterPerica = net.profile.perica;
  assert.ok(afterPerica > beforePerica, '初回の勝利でペリカが増える');
  assert.equal(net.profile.story.activeMatchId, null);

  const again = await net.post('/api/story/finish', { stageId: 1, matchId: 'story_a', outcome: 'win' });
  assert.equal(again.ok, true);
  assert.equal(again.data.result.replay, true);
  assert.equal(net.profile.perica, afterPerica, '再送では褒美が二重に入らない');
  assert.equal(Object.keys(net.profile.story.cleared).length, 1);
});

test('DbNet story abort clears the active match without granting anything', async () => {
  const { net } = storyNet();
  await net.post('/api/story/begin', { stageId: 1, matchId: 'story_a' });
  const beforePerica = net.profile.perica;

  const r = await net.post('/api/story/abort', { stageId: 1, matchId: 'story_a' });

  assert.equal(r.ok, true);
  assert.equal(net.profile.story.activeMatchId, null);
  assert.equal(net.profile.perica, beforePerica);
  assert.deepEqual(net.profile.story.cleared, {});
});

test('DbNet story talk marks a conversation read once', async () => {
  const { net, writes } = storyNet();

  const first = await net.post('/api/story/talk', { stageId: 1, kind: 'intro' });
  const again = await net.post('/api/story/talk', { stageId: 1, kind: 'intro' });

  assert.equal(first.data.result.replay, false);
  assert.equal(again.data.result.replay, true);
  assert.equal(net.profile.story.readTalks['1:intro'], true);
  assert.equal(writes.length, 1, '既読は一度だけ書き込む');
});

test('DbNet settings are validated and kept on the shared profile', async () => {
  const { net } = storyNet();

  const ok = await net.post('/api/settings', {
    settings: { confirmMove: false, bgm: 0.5, sfx: 2, effectLevel: 'low', unknown: 'x' },
  });

  assert.equal(ok.ok, true);
  assert.equal(net.profile.settings.confirmMove, false);
  assert.equal(net.profile.settings.bgm, 0.5);
  assert.equal(net.profile.settings.sfx, 1, '範囲外は端で止める');
  assert.equal(net.profile.settings.effectLevel, 'low');
  assert.equal('unknown' in net.profile.settings, false, '知らない項目は持ち込ませない');
});
