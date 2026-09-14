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
