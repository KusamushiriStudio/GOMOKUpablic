import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

test('Turnstile retry keeps one pending record and the same requestId', async () => {
  const requireModule = await loadTriadBundle();
  requireModule('turnstile.js').requestHumanCheck = async () => ({ ok: true, token: 'human-token' });
  const { Net } = requireModule('net.js');
  const net = new Net();
  const added = [];
  const removed = [];
  net._addPending = (record) => added.push(record);
  net._removePending = (requestId) => removed.push(requestId);

  const previousFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (path, options) => {
    const body = JSON.parse(options.body);
    calls.push({ path, body });
    if (path === '/api/turnstile') {
      return { json: async () => ({ ok: true }) };
    }
    const operationCalls = calls.filter((call) => call.path === '/api/gacha');
    if (operationCalls.length === 1) {
      return {
        ok: false,
        status: 428,
        json: async () => ({ code: 'turnstile_required', turnstile: { siteKey: 'site-key' } }),
      };
    }
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };

  try {
    const result = await net.post('/api/gacha', { count: 1 }, { requestId: 'turnstile-retry-id' });
    assert.equal(result.ok, true);
    assert.equal(added.length, 1, '人間確認後の再送でpendingを二重登録しない');
    assert.deepEqual(
      calls.filter((call) => call.path === '/api/gacha').map((call) => call.body.requestId),
      ['turnstile-retry-id', 'turnstile-retry-id'],
    );
    assert.deepEqual(removed, ['turnstile-retry-id']);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
