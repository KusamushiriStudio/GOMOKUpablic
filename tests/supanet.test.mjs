import test from 'node:test';
import assert from 'node:assert/strict';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const { SupaNet } = requireModule('supanet.js');

const SUPABASE_CONFIG = {
  url: 'https://supabase.example.test',
  anonKey: 'public-anon-key',
};

const BASE_TOKEN = jwtFor('user-1').split('.').slice(0, 2).join('.');
const OLD_TOKEN = `${BASE_TOKEN}.old-signature`;
const NEW_TOKEN = `${BASE_TOKEN}.new-signature`;
const FUTURE_EXPIRY = Math.floor(Date.now() / 1000) + 3600;

class IdleWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  send() {}

  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    for (const listener of this.listeners.get('close') || []) listener({ type: 'close' });
  }
}

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
  return {
    getItem(key) { return values.get(String(key)) ?? null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
  };
}

function createEventTarget(extra = {}) {
  const listeners = new Map();
  return {
    ...extra,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    dispatchEvent(event) {
      for (const listener of [...(listeners.get(event.type) || [])]) listener.call(this, event);
    },
  };
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return structuredClone(body); },
  };
}

function jwtFor(sub) {
  const payload = Buffer.from(JSON.stringify({ sub })).toString('base64url');
  return `header.${payload}.signature`;
}

function installBrowserGlobals(fetchImpl, WebSocketImpl) {
  const localStorage = createStorage();
  const navigator = { onLine: true };
  const document = createEventTarget({ visibilityState: 'visible' });
  const window = createEventTarget({
    __TRIAD_SUPABASE__: SUPABASE_CONFIG,
    localStorage,
    navigator,
    document,
  });
  window.window = window;
  window.self = window;

  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = localStorage;
  globalThis.fetch = fetchImpl;
  globalThis.WebSocket = WebSocketImpl;
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: navigator,
  });
  return { window, document, localStorage };
}

function makeClient(fetchImpl, options = {}) {
  const browser = installBrowserGlobals(fetchImpl, options.WebSocket || IdleWebSocket);
  const client = new SupaNet();
  client.session = {
    access_token: OLD_TOKEN,
    refresh_token: 'refresh-old',
    expires_at: FUTURE_EXPIRY,
  };
  return { ...browser, client };
}

function refreshedSession() {
  return {
    access_token: NEW_TOKEN,
    refresh_token: 'refresh-new',
    expires_at: FUTURE_EXPIRY,
  };
}

function isAuthRefresh(url) {
  return String(url).includes('/auth/v1/token?grant_type=refresh_token');
}

function isFunctionCall(url) {
  return String(url).includes('/functions/v1/api');
}

function authorization(options) {
  return options?.headers?.Authorization;
}

function sentMessage(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function topicClient() {
  const { client } = makeClient(async () => {
    throw new Error('Realtime topic tests must not use fetch');
  });
  client.session = {
    access_token: jwtFor('user-1'),
    refresh_token: 'refresh-topic',
    expires_at: FUTURE_EXPIRY,
  };
  const messages = [];
  client._ws = {
    readyState: 1,
    send(raw) { messages.push(sentMessage(raw)); },
  };
  return { client, messages };
}

test('TEST-005: 401 forces refresh even when the JWT expiry is far in the future', async () => {
  const functionAuthorizations = [];
  let refreshCalls = 0;
  const { client } = makeClient(async (url, options) => {
    if (isAuthRefresh(url)) {
      refreshCalls += 1;
      return jsonResponse(200, refreshedSession());
    }
    if (isFunctionCall(url)) {
      const auth = authorization(options);
      functionAuthorizations.push(auth);
      if (auth === `Bearer ${OLD_TOKEN}`) {
        return jsonResponse(401, { ok: false, code: 'invalid_jwt' });
      }
      if (auth === `Bearer ${NEW_TOKEN}`) {
        return jsonResponse(200, { ok: true, result: { accepted: true } });
      }
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await client.post('/api/gacha', { count: 1 }, { requestId: 'req-test-005' });

  assert.equal(result.ok, true);
  assert.equal(refreshCalls, 1);
  assert.deepEqual(functionAuthorizations, [
    `Bearer ${OLD_TOKEN}`,
    `Bearer ${NEW_TOKEN}`,
  ]);
  assert.equal(client.session.access_token, NEW_TOKEN);
});

test('TEST-006: the 401 retry keeps the exact same requestId and request body', async () => {
  const bodies = [];
  let functionCalls = 0;
  const { client } = makeClient(async (url, options) => {
    if (isAuthRefresh(url)) return jsonResponse(200, refreshedSession());
    if (isFunctionCall(url)) {
      functionCalls += 1;
      bodies.push(JSON.parse(options.body));
      return functionCalls === 1
        ? jsonResponse(401, { ok: false, code: 'invalid_jwt' })
        : jsonResponse(200, { ok: true, result: { accepted: true } });
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await client.post(
    '/api/match/action',
    { matchId: 'match-1', revision: 7, action: { type: 'place', index: 12 } },
    { requestId: 'req-test-006' },
  );

  assert.equal(result.ok, true);
  assert.equal(result.requestId, 'req-test-006');
  assert.equal(bodies.length, 2);
  assert.deepEqual(bodies[0], bodies[1]);
  assert.equal(bodies[0].requestId, 'req-test-006');
});

test('a second 401 is returned after one retry instead of starting an infinite retry loop', { timeout: 1000 }, async () => {
  let functionCalls = 0;
  let refreshCalls = 0;
  const { client } = makeClient(async (url) => {
    if (isAuthRefresh(url)) {
      refreshCalls += 1;
      return jsonResponse(200, refreshedSession());
    }
    if (isFunctionCall(url)) {
      functionCalls += 1;
      return jsonResponse(401, { ok: false, code: 'invalid_jwt' });
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  const result = await client.post('/api/gacha', { count: 10 }, { requestId: 'req-two-401s' });

  assert.equal(result.ok, false);
  assert.equal(functionCalls, 2);
  assert.equal(refreshCalls, 1);
});

test('simultaneous 401 responses share one refresh request', { timeout: 2000 }, async () => {
  let oldTokenCalls = 0;
  let functionCalls = 0;
  let refreshCalls = 0;
  let releaseFirstWave;
  const firstWave = new Promise((resolve) => { releaseFirstWave = resolve; });

  const { client } = makeClient(async (url, options) => {
    if (isAuthRefresh(url)) {
      refreshCalls += 1;
      await new Promise((resolve) => globalThis.setTimeout(resolve, 10));
      return jsonResponse(200, refreshedSession());
    }
    if (isFunctionCall(url)) {
      functionCalls += 1;
      if (authorization(options) === `Bearer ${OLD_TOKEN}`) {
        oldTokenCalls += 1;
        if (oldTokenCalls === 2) releaseFirstWave();
        if (oldTokenCalls <= 2) await firstWave;
        return jsonResponse(401, { ok: false, code: 'invalid_jwt' });
      }
      if (authorization(options) === `Bearer ${NEW_TOKEN}`) {
        return jsonResponse(200, { ok: true, result: { accepted: true } });
      }
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  const [first, second] = await Promise.all([
    client.post('/api/gacha', { count: 1 }, { requestId: 'req-concurrent-a' }),
    client.post('/api/train', { charId: 'hibana' }, { requestId: 'req-concurrent-b' }),
  ]);

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(refreshCalls, 1);
  assert.equal(functionCalls, 4);
});

test('TEST-007: adding a room updates Realtime topics without a match revision change', () => {
  const { client, messages } = topicClient();
  client.view = { room: null, match: null };
  client._syncSocketTopics();
  messages.length = 0;

  client._applyView({ room: { code: 'AAAAAA' }, match: null });

  const joins = messages
    .filter((message) => message.event === 'phx_join')
    .map((message) => message.topic);
  assert.deepEqual(joins, ['realtime:room:AAAAAA']);
  assert.deepEqual([...client._wsTopics].sort(), ['room:AAAAAA', 'user:user-1']);
});

test('TEST-008: room and match changes leave obsolete Realtime topics', () => {
  const { client, messages } = topicClient();
  client.view = { room: { code: 'AAAAAA' }, match: null };
  client._syncSocketTopics();
  messages.length = 0;

  client._applyView({ room: null, match: null });
  client._applyView({ room: { code: 'BBBBBB' }, match: null });
  client._applyView({
    room: { code: 'BBBBBB' },
    match: { matchId: 'match-1', revision: 0 },
  });
  client._applyView({ room: null, match: null });

  const joins = messages
    .filter((message) => message.event === 'phx_join')
    .map((message) => message.topic)
    .sort();
  const leaves = messages
    .filter((message) => message.event === 'phx_leave')
    .map((message) => message.topic)
    .sort();

  assert.deepEqual(joins, ['realtime:match:match-1', 'realtime:room:BBBBBB']);
  assert.deepEqual(leaves, [
    'realtime:match:match-1',
    'realtime:room:AAAAAA',
    'realtime:room:BBBBBB',
  ]);
  assert.deepEqual([...client._wsTopics], ['user:user-1']);
});

test('connect is idempotent after polling and socket startup have begun', async (t) => {
  let pollCalls = 0;
  const { client } = makeClient(async (url) => {
    if (isFunctionCall(url)) {
      pollCalls += 1;
      return jsonResponse(200, {
        ok: true,
        view: { profile: {}, room: null, match: null },
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  t.after(() => client.disconnect());

  await client.connect();
  await client.connect();

  assert.equal(pollCalls, 1);
  assert.equal(client.status, 'online');
});

test('an older revision for the same match cannot roll the current view backward', () => {
  const { client } = makeClient(async () => {
    throw new Error('Revision ordering test must not use fetch');
  });

  client._applyView({
    room: { code: 'AAAAAA' },
    match: { matchId: 'match-1', revision: 8 },
  });
  client._applyView({
    room: { code: 'AAAAAA' },
    match: { matchId: 'match-1', revision: 7 },
  });

  assert.equal(client.view.match.revision, 8);
});

test('a final 401 is exposed as auth_error instead of online', async () => {
  const { client } = makeClient(async (url) => {
    if (isAuthRefresh(url)) return jsonResponse(200, refreshedSession());
    if (isFunctionCall(url)) return jsonResponse(401, { ok: false, code: 'invalid_jwt' });
    throw new Error(`Unexpected request: ${url}`);
  });
  client._stopped = false;
  client.status = 'connecting';

  await client.refresh();

  assert.equal(client.status, 'auth_error');
});

test('an HTTP 500 is exposed as server_error instead of online', async () => {
  const { client } = makeClient(async (url) => {
    if (isFunctionCall(url)) return jsonResponse(500, { ok: false, code: 'server_failure' });
    throw new Error(`Unexpected request: ${url}`);
  });
  client._stopped = false;
  client.status = 'connecting';

  await client.refresh();

  assert.equal(client.status, 'server_error');
});
