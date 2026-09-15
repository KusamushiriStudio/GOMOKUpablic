import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const INDEX_URL = new URL('../index.html', import.meta.url);

// Use the shared loader for constants and pure fixture builders. App/localStore
// tests need a fresh embedded-module cache per browser tab, so they use the
// same extraction strategy below without changing the shared cached helper.
const sharedRequire = await loadTriadBundle();
const {
  STORAGE_KEY,
  STORAGE_LOCK_KEY,
  SAVE_VERSION,
} = sharedRequire('../../shared/constants.js');
const { createProfile, beginStoryMatch } = sharedRequire('../../shared/profile.js');
const { createMatch, legalPlacements } = sharedRequire('../../shared/rules.js');
const { createStoryMatch, applyPlayerAction } = sharedRequire('../../shared/story/engine.js');
const { STAGE_BY_ID } = sharedRequire('../../shared/story/stages.js');

let bundleSourcePromise;

async function bundleSource() {
  if (!bundleSourcePromise) {
    bundleSourcePromise = readFile(INDEX_URL, 'utf8').then((html) => {
      const configAt = html.indexOf('__TRIAD_NO_PATH_ROUTING__');
      const scriptStart = html.indexOf('(function () {', configAt);
      const scriptEnd = html.lastIndexOf('</script>');
      const bootCall = '__req("app.js");';
      if (configAt < 0 || scriptStart < 0 || scriptEnd <= scriptStart) {
        throw new Error('index.html の埋め込みモジュールを見つけられませんでした。');
      }
      const bundle = html.slice(scriptStart, scriptEnd);
      const bootAt = bundle.lastIndexOf(bootCall);
      if (bootAt < 0) throw new Error('app.js の起動箇所を見つけられませんでした。');
      return `${bundle.slice(0, bootAt)}return __req;${bundle.slice(bootAt + bootCall.length)}`;
    });
  }
  return bundleSourcePromise;
}

function exposePersistenceFlowHooks(source) {
  const playExport = 'return { legalPlacements, renderMatch, resetSelection, getBoardView, clearCpuTimer, renderPlay };';
  const storyExport = 'return { storyViewState: view, STAGES, resetStoryView, renderStory, ambientKindOf };';
  assert.equal(source.includes(playExport), true, 'play.js のテスト用公開位置を特定できる');
  assert.equal(source.includes(storyExport), true, 'story.js のテスト用公開位置を特定できる');
  return source
    .replace(playExport,
      'return { legalPlacements, renderMatch, resetSelection, getBoardView, clearCpuTimer, renderPlay, __persistenceTest: { startLocalMatch, buildLocalSession, finishLocal, scheduleCpu } };')
    .replace(storyExport,
      'return { storyViewState: view, STAGES, resetStoryView, renderStory, ambientKindOf, __persistenceTest: { startMatchNow, buildStorySession, finishStory } };');
}

async function loadFreshBundle({ exposePersistenceFlows = false } = {}) {
  let source = await bundleSource();
  if (exposePersistenceFlows) source = exposePersistenceFlowHooks(source);
  const requireModule = Function(`"use strict"; return ${source}`)();
  assert.equal(typeof requireModule, 'function');
  return requireModule;
}

function clone(value) {
  return structuredClone(value);
}

function quotaError() {
  const error = new Error('storage quota exceeded');
  error.name = 'QuotaExceededError';
  return error;
}

function createStorage(initial = {}, hooks = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) {
      const normalized = String(key);
      hooks.beforeGet?.(normalized, values);
      return values.has(normalized) ? values.get(normalized) : null;
    },
    setItem(key, value) {
      const normalized = String(key);
      const text = String(value);
      hooks.beforeSet?.(normalized, text, values);
      values.set(normalized, text);
      hooks.afterSet?.(normalized, text, values);
    },
    removeItem(key) {
      const normalized = String(key);
      hooks.beforeRemove?.(normalized, values);
      values.delete(normalized);
      hooks.afterRemove?.(normalized, values);
    },
    clear() { values.clear(); },
    directSet(key, value) { values.set(String(key), String(value)); },
    directDelete(key) { values.delete(String(key)); },
    values,
  };
}

function eventTarget(extra = {}) {
  const listeners = new Map();
  const target = {
    ...extra,
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add({ listener, once: !!options?.once });
    },
    removeEventListener(type, listener) {
      const bucket = listeners.get(type);
      if (!bucket) return;
      for (const record of bucket) {
        if (record.listener === listener) bucket.delete(record);
      }
    },
    dispatchEvent(event) {
      if (!event || !event.type) throw new TypeError('event.type is required');
      for (const record of [...(listeners.get(event.type) || [])]) {
        record.listener.call(target, event);
        if (record.once) listeners.get(event.type)?.delete(record);
      }
      return true;
    },
    _listeners: listeners,
  };
  return target;
}

function domNode(tagName = 'div') {
  const classes = new Set();
  const node = eventTarget({
    nodeType: tagName === '#text' ? 3 : 1,
    tagName: tagName === '#text' ? undefined : String(tagName).toUpperCase(),
    parentNode: null,
    isConnected: true,
    children: [],
    style: {},
    dataset: {},
    attributes: {},
    hidden: false,
    disabled: false,
    className: '',
    textContent: '',
    innerHTML: '',
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        if (force === true || (force === undefined && !classes.has(name))) classes.add(name);
        else classes.delete(name);
      },
    },
    appendChild(child) {
      if (child == null) return child;
      child.parentNode = node;
      child.isConnected = node.isConnected;
      node.children.push(child);
      return child;
    },
    removeChild(child) {
      const index = node.children.indexOf(child);
      if (index >= 0) node.children.splice(index, 1);
      child.parentNode = null;
      child.isConnected = false;
      return child;
    },
    remove() { node.parentNode?.removeChild(node); },
    setAttribute(name, value) {
      node.attributes[name] = String(value);
      if (name === 'class') node.className = String(value);
    },
    getAttribute(name) { return node.attributes[name] ?? null; },
    querySelector(selector) {
      if (selector === '.btn:last-child') return node.children.at(-1) || null;
      return null;
    },
    querySelectorAll() { return []; },
    scrollTo() {},
    focus() {},
    select() {},
  });
  Object.defineProperties(node, {
    firstChild: { get: () => node.children[0] ?? null },
    firstElementChild: { get: () => node.children.find((child) => child.nodeType === 1) ?? null },
    lastChild: { get: () => node.children.at(-1) ?? null },
  });
  return node;
}

function createDocument({ bootable = false } = {}) {
  const ids = new Map();
  const document = eventTarget({
    readyState: 'loading',
    visibilityState: 'visible',
    hidden: false,
    body: domNode('body'),
    documentElement: domNode('html'),
    createElement: (tag) => domNode(tag),
    createTextNode(text) {
      const node = domNode('#text');
      node.textContent = String(text);
      return node;
    },
    getElementById(id) { return ids.get(id) || null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    _ids: ids,
  });
  if (bootable) {
    for (const id of ['view-root', 'perica-value', 'mode-badge', 'mute-btn', 'toast-layer', 'dialog-layer', 'fx-layer']) {
      ids.set(id, domNode(id === 'view-root' ? 'main' : 'div'));
    }
  }
  return document;
}

function createLocation(input) {
  let current = new URL(input);
  const location = {
    assign(value) { current = new URL(value, current.href); },
    replace(value) { current = new URL(value, current.href); },
    reload() {},
    _set(value) { current = new URL(value, current.href); },
  };
  for (const key of ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash']) {
    Object.defineProperty(location, key, {
      enumerable: true,
      get: () => current[key],
      set: (value) => {
        if (key === 'href') current = new URL(value, current.href);
        else current[key] = value;
      },
    });
  }
  return location;
}

let nextFakeUuid = 0;

function fakeCrypto() {
  return {
    randomUUID() {
      nextFakeUuid += 1;
      return `00000000-0000-4000-8000-${String(nextFakeUuid).padStart(12, '0')}`;
    },
    getRandomValues(array) {
      array.fill(0);
      return array;
    },
  };
}

function createBrowser(options = {}) {
  const storage = options.storage || createStorage();
  const location = createLocation(options.url || 'https://example.test/index.html');
  const historyCalls = [];
  const history = {
    state: null,
    replaceState(state, _title, next) {
      this.state = state;
      historyCalls.push(String(next));
      location._set(new URL(String(next), location.href));
    },
  };
  const document = options.document || createDocument({ bootable: !!options.bootable });
  const intervals = new Map();
  let nextInterval = 1;
  const setIntervalStub = (callback, delay) => {
    const id = nextInterval++;
    intervals.set(id, { callback, delay });
    return id;
  };
  const clearIntervalStub = (id) => intervals.delete(id);
  const navigator = options.navigator || { userAgent: '', vendor: '' };
  const window = eventTarget({
    document,
    location,
    history,
    localStorage: storage,
    navigator,
    innerWidth: 390,
    innerHeight: 844,
    scrollTo() {},
    setInterval: setIntervalStub,
    clearInterval: clearIntervalStub,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (callback) => callback(0),
    cancelAnimationFrame() {},
  });
  window.window = window;
  window.self = window;
  window.__TRIAD_SUPABASE__ = options.supabaseConfig ?? null;
  window.__TRIAD_LOCAL_ONLY__ = !!options.localOnly;
  window.__TRIAD_NO_PATH_ROUTING__ = !!options.noPathRouting;
  const fetchCalls = [];
  const fetchStub = options.fetch || (async (url) => {
    fetchCalls.push(String(url));
    return { ok: false, status: 404, async json() { return { ok: false }; } };
  });
  return {
    window,
    document,
    location,
    history,
    historyCalls,
    storage,
    navigator,
    fetch: fetchStub,
    fetchCalls,
    intervals,
    setInterval: setIntervalStub,
    clearInterval: clearIntervalStub,
    crypto: options.crypto || fakeCrypto(),
  };
}

async function withBrowser(options, operation) {
  const browser = createBrowser(options);
  const replacements = {
    window: browser.window,
    self: browser.window,
    document: browser.document,
    location: browser.location,
    history: browser.history,
    localStorage: browser.storage,
    navigator: browser.navigator,
    crypto: browser.crypto,
    fetch: browser.fetch,
    WebSocket: class WebSocketStub {},
    EventSource: class EventSourceStub {},
    requestAnimationFrame: browser.window.requestAnimationFrame,
    cancelAnimationFrame: browser.window.cancelAnimationFrame,
    setInterval: browser.setInterval,
    clearInterval: browser.clearInterval,
    claude: undefined,
  };
  const previous = new Map();
  for (const [name, value] of Object.entries(replacements)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  try {
    return await operation(browser);
  } finally {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

function savedPayload(profile, { match = null, storyMatch = null } = {}) {
  return JSON.stringify({
    version: SAVE_VERSION,
    profile,
    match,
    storyMatch,
    savedAt: Date.now(),
  });
}

function assertUnchanged(actual, expected, message) {
  assert.equal(JSON.stringify(actual) === JSON.stringify(expected), true, message);
}

function persistedState(localStore) {
  return clone({
    profile: localStore.profile,
    match: localStore.match,
    storyMatch: localStore.storyMatch,
  });
}

function quotaControlledStorage(initial = {}) {
  let failing = false;
  const storage = createStorage(initial, {
    beforeSet(key) {
      if (failing && key === STORAGE_KEY) throw quotaError();
    },
  });
  return {
    storage,
    failDataWrites() { failing = true; },
  };
}

function localSeats() {
  return [
    { seat: 1, name: 'P1', charId: 'hibana', kind: 'human', cosmetics: null },
    { seat: 2, name: 'CPU 2', charId: 'mamori', kind: 'cpu', cosmetics: null },
    { seat: 3, name: 'CPU 3', charId: 'hayate', kind: 'cpu', cosmetics: null },
  ];
}

function makeLocalState({ matchId = `local_fixture_${Date.now()}`, startSeat = 1 } = {}) {
  return createMatch({ matchId, mode: 'local', seats: localSeats(), startSeat });
}

function installStoryFixture(localStore, { stageId = 1, state = null } = {}) {
  const matchId = state?.matchId || `story_fixture_${Date.now()}`;
  const nextState = state || createStoryMatch({
    stageId,
    matchId,
    playerName: localStore.profile.name,
    charId: localStore.profile.lastCharId,
    cosmetics: {},
  });
  const installed = localStore.transaction((draft) => {
    const begun = beginStoryMatch(draft.profile, { stageId, matchId });
    if (!begun.ok) return begun;
    draft.storyMatch = { state: nextState };
    return { ok: true };
  });
  assert.equal(installed.ok, true, '物語テストfixtureを保存できる');
  return localStore.storyMatch;
}

function walkNodes(root) {
  const out = [];
  const visit = (node) => {
    if (!node) return;
    out.push(node);
    for (const child of node.children || []) visit(child);
  };
  visit(root);
  return out;
}

function findNode(root, predicate, message = '対象DOMが見つかる') {
  const found = walkNodes(root).find(predicate);
  assert.ok(found, message);
  return found;
}

function findButton(root, text) {
  return findNode(root,
    (node) => node.tagName === 'BUTTON' && node.textContent === text,
    `「${text}」ボタンが見つかる`);
}

function triggerNode(node, type, extra = {}) {
  const event = { type, target: node, currentTarget: node, preventDefault() {}, ...extra };
  const pending = [];
  for (const record of [...(node._listeners.get(type) || [])]) {
    pending.push(Promise.resolve(record.listener.call(node, event)));
    if (record.once) node._listeners.get(type)?.delete(record);
  }
  return Promise.all(pending);
}

async function confirmOpenDialog(document) {
  const layer = document.getElementById('dialog-layer');
  const box = layer?.firstElementChild;
  const row = box?.children?.[2];
  const confirm = row?.children?.[1];
  assert.ok(confirm, '確認ダイアログの実行ボタンが見つかる');
  await triggerNode(confirm, 'click');
}

function freshOtherLock(tabId = 'other-tab') {
  return JSON.stringify({ tabId, ts: Date.now() });
}

async function flushAsync(rounds = 5) {
  for (let i = 0; i < rounds; i += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

test('TEST-009: locked/corrupt LOCAL mutations are rejected before profile changes', async (t) => {
  await t.test('another tab owns the lock', async () => {
    const storage = createStorage({ [STORAGE_LOCK_KEY]: freshOtherLock() });
    await withBrowser({ storage }, async (browser) => {
      const requireModule = await loadFreshBundle();
      requireModule('app.js');
      const { ctx, localStore } = browser.window.__triad;
      const before = clone(localStore.profile);

      const result = await ctx.api.setName('書き換えてはいけない');

      assert.equal(result.ok, false);
      assertUnchanged(localStore.profile, before,
        'locked状態ではメモリ上のprofileも変更してはいけない');
    });
  });

  await t.test('corrupt save data blocks mutation too', async () => {
    await withBrowser({}, async (browser) => {
      const requireModule = await loadFreshBundle();
      requireModule('app.js');
      const { ctx, localStore } = browser.window.__triad;
      localStore.corrupt = true;
      const before = clone(localStore.profile);

      const result = await ctx.api.setName('破損中の更新');

      assert.equal(result.ok, false);
      assertUnchanged(localStore.profile, before,
        'corrupt状態ではメモリ上のprofileも変更してはいけない');
    });
  });
});

test('LOCAL 10+1 gacha rolls back every profile field when persistence fails', async () => {
  let rejectDataWrites = false;
  const storage = createStorage({}, {
    beforeSet(key) {
      if (rejectDataWrites && key === STORAGE_KEY) throw quotaError();
    },
  });
  await withBrowser({ storage }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx, localStore } = browser.window.__triad;
    localStore.profile.perica = 10;
    const before = clone(localStore.profile);
    rejectDataWrites = true;

    const result = await ctx.api.gacha(10);

    assert.equal(result.ok, false, '保存できない抽選を成立扱いにしない');
    assertUnchanged(localStore.profile, before,
      '残高・所持・XP・履歴・ledgerをまとめてrollbackする');
    assert.equal(storage.getItem(STORAGE_KEY), null);
  });
});

test('TEST-010: two ordinary tabs expose one LOCAL writer', async () => {
  const storage = createStorage();
  let first;
  let second;
  await withBrowser({ storage }, async (browser) => {
    const requireModule = await loadFreshBundle();
    first = requireModule('localstore.js').localStore;
    assert.equal(first.writable, true);
    assert.equal(JSON.parse(storage.getItem(STORAGE_LOCK_KEY)).tabId, first.tabId);
    assert.equal(browser.window._listeners.has('storage'), true);
  });
  await withBrowser({ storage }, async () => {
    const requireModule = await loadFreshBundle();
    second = requireModule('localstore.js').localStore;
  });

  assert.equal([first, second].filter((store) => store.writable).length, 1);
});

test('fallback lock acquisition verifies ownership after writing', async () => {
  let replaceFirstLockWrite = true;
  const storage = createStorage({}, {
    afterSet(key, _value, values) {
      if (key === STORAGE_LOCK_KEY && replaceFirstLockWrite) {
        replaceFirstLockWrite = false;
        values.set(STORAGE_LOCK_KEY, freshOtherLock('racing-tab'));
      }
    },
  });
  await withBrowser({ storage }, async () => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    assert.equal(localStore.writable, false,
      '自分が書いた直後に他tabが取ったlockを見落とさない');
  });
});

test('lock storage events revoke stale writable state immediately', async () => {
  const storage = createStorage();
  await withBrowser({ storage }, async (browser) => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    assert.equal(localStore.writable, true);
    const rival = freshOtherLock('new-owner');
    storage.directSet(STORAGE_LOCK_KEY, rival);

    browser.window.dispatchEvent({
      type: 'storage',
      key: STORAGE_LOCK_KEY,
      oldValue: null,
      newValue: rival,
      storageArea: storage,
    });

    assert.equal(localStore.writable, false);
  });
});

test('save rechecks the live lock owner immediately before persistence', async () => {
  const storage = createStorage();
  await withBrowser({ storage }, async () => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    assert.equal(localStore.writable, true);
    storage.directSet(STORAGE_LOCK_KEY, freshOtherLock('stolen-before-save'));
    localStore.profile.name = 'メモリ上だけの名前';

    const result = localStore.save();

    assert.equal(result.ok, false);
    assert.equal(storage.getItem(STORAGE_KEY), null);
    assert.equal(localStore.writable, false);
  });
});

test('BFCache lifecycle releases, reacquires, and revalidates the LOCAL lock', async () => {
  const storage = createStorage();
  await withBrowser({ storage }, async (browser) => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    assert.equal(localStore.writable, true);

    browser.window.dispatchEvent({ type: 'pagehide', persisted: true });
    assert.equal(localStore.writable, false);
    assert.equal(storage.getItem(STORAGE_LOCK_KEY), null);

    browser.window.dispatchEvent({ type: 'pageshow', persisted: true });
    assert.equal(localStore.writable, true);
    assert.equal(JSON.parse(storage.getItem(STORAGE_LOCK_KEY)).tabId, localStore.tabId);

    browser.window.dispatchEvent({ type: 'pagehide', persisted: true });
    storage.directSet(STORAGE_LOCK_KEY, freshOtherLock('owner-during-bfcache'));
    browser.window.dispatchEvent({ type: 'pageshow', persisted: true });
    assert.equal(localStore.writable, false);
  });
});

test('visible restoration revalidates LOCAL lock ownership without waiting for heartbeat', async () => {
  const storage = createStorage();
  await withBrowser({ storage }, async (browser) => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    storage.directSet(STORAGE_LOCK_KEY, freshOtherLock('owner-while-hidden'));
    browser.document.hidden = false;
    browser.document.visibilityState = 'visible';

    browser.document.dispatchEvent({ type: 'visibilitychange' });

    assert.equal(localStore.writable, false);
  });
});

test('TEST-011: GitHub Pages room query survives reload and leave preserves unrelated URL data', async () => {
  const initialUrl = 'https://example.test/GOMOKUpablic/index.html?campaign=autumn#rules';
  let roomUrl;

  await withBrowser({ url: initialUrl, noPathRouting: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    triad.app.onlineKind = 'supabase';
    triad.supaNet.view = { room: { code: 'ABCDEF' } };

    triad.ctx.setView('online');

    assert.equal(browser.location.pathname, '/GOMOKUpablic/index.html');
    assert.equal(new URLSearchParams(browser.location.search).get('campaign'), 'autumn');
    assert.equal(new URLSearchParams(browser.location.search).get('room'), 'ABCDEF');
    assert.equal(browser.location.hash, '#rules');
    roomUrl = browser.location.href;

    triad.supaNet.view = { room: null };
    triad.app.pendingRoomCode = null;
    triad.ctx.setView('online');
    assert.equal(new URLSearchParams(browser.location.search).has('room'), false);
    assert.equal(new URLSearchParams(browser.location.search).get('campaign'), 'autumn');
    assert.equal(browser.location.hash, '#rules');
  });

  await withBrowser({
    url: roomUrl,
    noPathRouting: true,
    localOnly: true,
    bootable: true,
  }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    assert.equal(browser.window.__triad.app.view, 'online');
    assert.equal(browser.window.__triad.app.pendingRoomCode, 'ABCDEF');
  });
});

test('popstate clears a stale pendingRoomCode when the destination URL has no room', async () => {
  await withBrowser({
    url: 'https://example.test/GOMOKUpablic/index.html?room=ABCDEF',
    noPathRouting: true,
    localOnly: true,
    bootable: true,
  }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    assert.equal(browser.window.__triad.app.pendingRoomCode, 'ABCDEF');

    browser.location._set('https://example.test/GOMOKUpablic/index.html');
    browser.window.dispatchEvent({ type: 'popstate' });

    assert.equal(browser.window.__triad.app.pendingRoomCode, null);
  });
});

test('TEST-012: GitHub Pages skips nonexistent same-origin API probes', async () => {
  const calls = [];
  await withBrowser({
    url: 'https://example.test/GOMOKUpablic/index.html',
    noPathRouting: true,
    bootable: true,
    fetch: async (url) => {
      calls.push(String(url));
      return { ok: false, status: 404, async json() { return { ok: false }; } };
    },
  }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await flushAsync();
  });

  assert.equal(calls.some((url) => url === '/api/config' || url === '/api/health'), false);
});

test('resize does not rebuild the whole play view or reset its DOM state', async () => {
  await withBrowser({ localOnly: true, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await flushAsync();
    const { ctx } = browser.window.__triad;
    ctx.setView('play');
    const root = browser.document.getElementById('view-root');
    const firstRender = root.firstChild;
    assert.ok(firstRender, '対戦設定画面が描画されている');

    browser.window.dispatchEvent({ type: 'resize' });
    await new Promise((resolve) => setTimeout(resolve, 250));

    assert.equal(root.firstChild === firstRender, true,
      'resizeはview-rootをclearせず、盤面レイアウトだけに任せる');
  });
});

test('saved story state rejects unknown telegraphs and out-of-range targets', async (t) => {
  async function loadCorruptStory(mutate) {
    const profile = createProfile({ id: 'local' });
    const state = createStoryMatch({
      stageId: 6,
      matchId: 'story_corrupt_fixture',
      playerName: 'あなた',
      charId: profile.lastCharId,
      cosmetics: {},
    });
    mutate(state);
    const storage = createStorage({
      [STORAGE_KEY]: savedPayload(profile, { storyMatch: { state } }),
    });
    return withBrowser({ storage }, async () => {
      const requireModule = await loadFreshBundle();
      const { localStore } = requireModule('localstore.js');
      const loaded = localStore.load();
      assert.equal(loaded.ok, true);
      return localStore.storyMatch;
    });
  }

  await t.test('unknown telegraph id', async () => {
    const storyMatch = await loadCorruptStory((state) => {
      state.story.telegraph = { id: 'not-a-telegraph', targets: [0], seat: 2, declaredAt: 0 };
    });
    assert.equal(storyMatch == null, true,
      '未知の予告技を含む破損ストーリー保存は破棄する');
  });

  await t.test('target outside the board', async () => {
    const storyMatch = await loadCorruptStory((state) => {
      state.story.telegraph = { id: 'snipe', targets: [state.stones.length], seat: 2, declaredAt: 0 };
    });
    assert.equal(storyMatch == null, true,
      '盤面外targetを含む破損ストーリー保存は破棄する');
  });
});

test('saved local match rejects board layers with inconsistent lengths', async () => {
  const profile = createProfile();
  const state = makeLocalState();
  state.guards.pop();
  const storage = createStorage({
    [STORAGE_KEY]: savedPayload(profile, { match: { state, setup: {} } }),
  });

  await withBrowser({ storage }, async () => {
    const requireModule = await loadFreshBundle();
    const { localStore } = requireModule('localstore.js');
    assert.equal(localStore.load().ok, true);
    assert.equal(localStore.match, null,
      '盤面サイズと一致しない補助配列を含む途中対戦は再開しない');
  });
});

test('local match action and reward do not commit when persistence fails', async () => {
  let rejectDataWrites = false;
  const storage = createStorage({}, {
    beforeSet(key) {
      if (rejectDataWrites && key === STORAGE_KEY) throw quotaError();
    },
  });
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx, localStore } = browser.window.__triad;
    ctx.refresh = () => {};
    const play = requireModule('views/play.js');
    assert.equal(play.startLocalMatch(ctx), true);

    const beforeAction = clone({ profile: localStore.profile, match: localStore.match });
    const session = play.buildLocalSession(ctx, localStore.match);
    const seat = localStore.match.state.turn;
    const index = localStore.match.state.stones.findIndex((stone) => stone === 0);
    rejectDataWrites = true;
    const moved = await session.submit({ type: 'place', seat, index });
    assert.equal(moved, false);
    assertUnchanged({ profile: localStore.profile, match: localStore.match }, beforeAction,
      '保存失敗した着手は盤面・報酬を確定しない');

    const finished = clone(localStore.match.state);
    finished.status = 'finished';
    finished.result = { kind: 'win', winner: 1, winners: [1], line: [0, 1, 2, 3, 4], reason: 'five' };
    const rewarded = play.finishLocal(ctx, finished, localStore.match.setup);
    assert.equal(rewarded.ok, false);
    assertUnchanged({ profile: localStore.profile, match: localStore.match }, beforeAction,
      '終了盤面と対戦報酬は同じ保存単位でrollbackする');
  });
});

test('story start, action, and clear reward are atomic with persistence', async () => {
  let rejectDataWrites = false;
  const storage = createStorage({}, {
    beforeSet(key) {
      if (rejectDataWrites && key === STORAGE_KEY) throw quotaError();
    },
  });
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx, localStore } = browser.window.__triad;
    ctx.refresh = () => {};
    const storyView = requireModule('views/story.js');
    const { STAGE_BY_ID } = requireModule('../../shared/story/stages.js');
    assert.equal(await storyView.startMatchNow(ctx, 1), true);

    const beforeAction = clone({ profile: localStore.profile, storyMatch: localStore.storyMatch });
    const session = storyView.buildStorySession(ctx, localStore.storyMatch, STAGE_BY_ID[1]);
    const index = localStore.storyMatch.state.stones.findIndex((stone) => stone === 0);
    rejectDataWrites = true;
    const moved = await session.submit({ type: 'place', seat: 1, index });
    assert.equal(moved, false);
    assertUnchanged({ profile: localStore.profile, storyMatch: localStore.storyMatch }, beforeAction,
      '保存失敗した物語の着手を確定しない');

    const finished = clone(localStore.storyMatch.state);
    finished.status = 'finished';
    finished.result = { kind: 'win', winner: 1, winners: [1], line: [0, 1, 2, 3, 4], reason: 'five' };
    const rewarded = await storyView.finishStory(ctx, finished, STAGE_BY_ID[1]);
    assert.equal(rewarded.ok, false);
    assertUnchanged({ profile: localStore.profile, storyMatch: localStore.storyMatch }, beforeAction,
      '物語の終了盤面・解放・報酬をまとめてrollbackする');
  });
});

test('story cannot begin in memory when the initial save fails', async () => {
  const storage = createStorage({}, {
    beforeSet(key) { if (key === STORAGE_KEY) throw quotaError(); },
  });
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx, localStore } = browser.window.__triad;
    ctx.refresh = () => {};
    const storyView = requireModule('views/story.js');
    const before = clone(localStore.profile);

    assert.equal(await storyView.startMatchNow(ctx, 1), false);
    assert.equal(localStore.storyMatch, null);
    assertUnchanged(localStore.profile, before, 'activeMatchIdも保存成功前に変更しない');
  });
});

test('着手前確認は初期値ONで、OFF/ONを端末設定へ保存する', async () => {
  const storage = createStorage();
  await withBrowser({ storage }, async () => {
    let requireModule = await loadFreshBundle();
    let { preferences } = requireModule('preferences.js');
    assert.equal(preferences.values.confirmMove, true, '設定が無い既存ユーザーはON');

    assert.equal(preferences.set({ confirmMove: false }).ok, true);
    requireModule = await loadFreshBundle();
    ({ preferences } = requireModule('preferences.js'));
    assert.equal(preferences.values.confirmMove, false, '再起動相当でもOFFを維持');

    assert.equal(preferences.set({ confirmMove: true }).ok, true);
    requireModule = await loadFreshBundle();
    ({ preferences } = requireModule('preferences.js'));
    assert.equal(preferences.values.confirmMove, true, '再起動相当でもONを維持');
  });
});

test('対戦ページはオンライン対戦と練習モードから既存機能へ遷移できる', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { ctx } = triad;
    onlineAccount(triad, { profile: createProfile({ id: 'p_online', name: '旅人' }) });
    ctx.setView('play');
    const root = browser.document.getElementById('view-root');
    const buttonWithHeading = (text) => findNode(root, (node) => (
      node.tagName === 'BUTTON'
      && walkNodes(node).some((child) => child.tagName === 'STRONG' && child.textContent === text)
    ), `「${text}」主要ボタンが見つかる`);

    buttonWithHeading('オンライン対戦');
    await triggerNode(buttonWithHeading('練習モード'), 'click');
    const computer = buttonWithHeading('コンピュータ対戦');
    buttonWithHeading('同一端末対戦');
    findButton(root, '戻る');

    await triggerNode(computer, 'click');
    findNode(root, (node) => node.textContent === 'コンピュータ対戦設定');
    await triggerNode(findButton(root, '練習モードへ戻る'), 'click');
    await triggerNode(findButton(root, '戻る'), 'click');
    buttonWithHeading('オンライン対戦');
    buttonWithHeading('練習モード');
  });
});

test('AI形勢評価はコンピュータ対戦セッションだけに表示する', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx } = browser.window.__triad;
    const play = requireModule('views/play.js');
    const { clear } = requireModule('util.js');
    const root = browser.document.getElementById('view-root');
    ctx.refresh = () => {};

    const cpu = { state: makeLocalState({ matchId: 'cpu-eval' }), setup: { mode: 'cpu' } };
    play.renderMatch(root, ctx, play.buildLocalSession(ctx, cpu));
    findNode(root, (node) => node.dataset?.testid === 'ai-evaluation', 'CPU戦にはAI評価がある');

    clear(root);
    const hotseat = { state: makeLocalState({ matchId: 'hotseat-no-eval' }), setup: { mode: 'hotseat' } };
    play.renderMatch(root, ctx, play.buildLocalSession(ctx, hotseat));
    assert.equal(walkNodes(root).some((node) => node.dataset?.testid === 'ai-evaluation'), false,
      '同一端末対戦にはAI評価を表示しない');

    clear(root);
    const state = makeLocalState({ matchId: 'online-no-eval' });
    play.renderMatch(root, ctx, {
      kind: 'online', state, yourSeat: 1, controllable: (seat) => seat === 1,
      boardId: 'board-default', stoneBySeat: {}, busy: false,
      submit: async () => false, abort: async () => false,
    });
    assert.equal(walkNodes(root).some((node) => node.dataset?.testid === 'ai-evaluation'), false,
      'オンライン対戦にはAI評価を表示しない');
  });
});

test('着手前確認ONは仮選択、OFFは合法点を即時着手する', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const { ctx, localStore } = browser.window.__triad;
    const play = requireModule('views/play.js');
    const { preferences } = requireModule('preferences.js');
    ctx.refresh = () => {};

    const local = { state: makeLocalState({ matchId: 'confirm-move' }), setup: { mode: 'hotseat' } };
    assert.equal(localStore.setMatch(local).ok, true);
    const session = play.buildLocalSession(ctx, local);
    const first = local.state.stones.findIndex((stone) => stone === 0);

    play.onPick(ctx, session, first);
    assert.equal(local.state.stones[first], 0, 'ONでは確定前に正式盤面を変えない');
    play.resetSelection(false);

    assert.equal(preferences.set({ confirmMove: false }).ok, true);
    play.onPick(ctx, session, first);
    await flushAsync();
    assert.equal(local.state.stones[first], 1, 'OFFでは合法点タップで着手する');
    const revision = local.state.revision;

    play.onPick(ctx, session, first);
    await flushAsync();
    assert.equal(local.state.revision, revision, '相手手番や使用済み交点では追加着手しない');
  });
});

test('10+1ガチャ結果は11件すべてと11件目のおまけ表示を描画する', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { ctx } = triad;
    // ガチャはサーバー側の抽選を通る。アカウント接続の実装をそのまま使い、
    // 書き込み先だけを差し替える。
    const online = createProfile({ id: 'p_online', name: '旅人' });
    online.perica = 10;
    triad.app.onlineKind = 'account';
    triad.dbNet.ensure = async () => true;
    triad.dbNet.me = 'p_online';
    triad.dbNet.profile = online;
    triad.dbNet.db = { doc: () => ({ async set() {}, async get() { return { exists: false }; }, onSnapshot() { return () => {}; } }) };
    triad.dbNet._publish();
    const { clear } = requireModule('util.js');
    const { renderGacha } = requireModule('views/gacha.js');

    const pulled = await ctx.api.gacha(10);
    assert.equal(pulled.ok, true);
    ctx.app.gachaResult = pulled.result;
    const root = browser.document.getElementById('view-root');
    clear(root);
    renderGacha(root, ctx);

    const resultCells = walkNodes(root).filter((node) => (
      String(node.className || '').split(/\s+/).includes('gacha-cell')
    ));
    assert.equal(resultCells.length, 11);
    assert.equal(walkNodes(resultCells[10]).some((node) => node.textContent === 'おまけ'), true);
  });
});

/* ───────── 表示する資産の選び方（オンライン対戦後にローカルへ戻らないこと） ───────── */

test('接続先が見つかったら、表示する資産はオンラインになる', async () => {
  await withBrowser({
    bootable: true,
    fetch: async (url) => {
      const u = String(url);
      if (u === '/api/config') return { ok: true, async json() { return { ok: true, onlineEnabled: true }; } };
      if (u === '/api/health') return { ok: true, async json() { return { ok: true }; } };
      return { ok: false, status: 404, async json() { return { ok: false }; } };
    },
  }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await flushAsync();

    await flushAsync(20);

    // この試験用ブラウザには EventSource が無いので接続自体は完走しない。
    // 見たいのは「接続先が見つかった時点で資産表示がオンラインへ寄る」ことだけ。
    const { app } = browser.window.__triad;
    assert.equal(app.mode, 'ONLINE', '読み込み直後に端末側の残高を出さない');
  });
});

test('接続先が無ければ遊ばせず、端末の保存へ落とさない', async () => {
  await withBrowser({ localOnly: true, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await flushAsync();

    const { app } = browser.window.__triad;
    assert.equal(app.onlineKind, null);

    // 正式なデータはすべてアカウント側にあるので、つながるまで画面を進めない（§26・§27・§55）。
    const root = browser.document.getElementById('view-root');
    findNode(root, (node) => (
      node.tagName === 'H2' && /接続できません|インターネット接続が必要です/.test(node.textContent)
    ), 'オフラインの案内が出る');
    findButton(root, '再接続');
    assert.equal(
      walkNodes(root).some((node) => node.tagName === 'BUTTON' && node.textContent === '物語（1対1）'),
      false,
      'ホームの遊ぶ導線は出さない',
    );
  });
});

test('オンライン対戦が表示されている間は、端末に残った練習盤を開かない', async () => {
  await withBrowser({ localOnly: true, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    browser.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await flushAsync();

    const triad = browser.window.__triad;
    const { ctx, localStore } = triad;
    onlineAccount(triad, { profile: createProfile({ id: 'p_online', name: '旅人' }) });
    const rules = requireModule('../../shared/rules.js');
    const { CHARACTERS } = requireModule('../../shared/constants.js');
    const seats = CHARACTERS.slice(0, 3).map((c, i) => ({
      seat: i + 1, charId: c.id, name: `P${i + 1}`, kind: i === 0 ? 'human' : 'cpu',
    }));
    const saved = localStore.setMatch({
      state: rules.createMatch({ matchId: 'm_local', mode: 'local', seats, startSeat: 1 }),
      setup: { mode: 'cpu' },
    });
    assert.equal(saved.ok, true, '端末に途中の対戦がある状態を作る');

    const root = browser.document.getElementById('view-root');
    const atEntrance = () => walkNodes(root).some((node) => (
      node.tagName === 'STRONG' && node.textContent === 'オンライン対戦'
    ));

    // 正式なオンライン対戦が画面にある間は、練習盤へ勝手に移らない
    triad.dbNet.view = {
      ...triad.dbNet.view,
      match: rules.createMatch({ matchId: 'm_online', mode: 'online', seats, startSeat: 1 }),
    };
    ctx.setView('play');
    assert.equal(atEntrance(), false, 'オンライン対戦の盤が出る');
    assert.equal(
      walkNodes(browser.document.getElementById('view-root')).some((node) => node.textContent === '練習の対戦です。ペリカ・XP・戦績・ランキングは変わりません。'),
      false,
      '練習の盤ではない',
    );

    triad.dbNet.view = { ...triad.dbNet.view, match: null };
    ctx.refresh();
    assert.equal(atEntrance(), false, 'オンライン対戦が無くなれば、続きの練習盤へ戻る');
  });
});
/** アカウント接続のオンライン表示を作る。物語の通信は記録するだけにする。 */
function onlineAccount(triad, { profile }) {
  const posts = [];
  triad.app.mode = 'ONLINE';
  triad.app.onlineKind = 'account';
  triad.dbNet.view = { profile };
  triad.dbNet.post = async (path, body) => {
    posts.push({ path, body });
    if (path === '/api/story/finish') {
      return { ok: true, status: 'ok', data: { result: { story: { perica: 12, playerXp: 60, charXp: 40, first: true, drops: [], duplicate: null, seal: null, skill: null }, replay: false } } };
    }
    return { ok: true, status: 'ok', data: { result: {} } };
  };
  return posts;
}

test('オンライン（アカウント接続）の物語は進行をオンラインへ書き、端末の資産を変えない', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { ctx, localStore } = triad;
    ctx.refresh = () => {};
    const storyView = requireModule('views/story.js');
    const online = createProfile({ id: 'p_online', name: '旅人' });
    const posts = onlineAccount(triad, { profile: online });
    const beforeLocal = clone(localStore.profile);

    assert.equal(await storyView.startMatchNow(ctx, 1), true);
    assert.deepEqual(posts.map((p) => p.path), ['/api/story/begin']);
    assert.equal(posts[0].body.stageId, 1);
    assert.equal(localStore.storyMatch.save, 'online', 'どの保存で始めた盤かを残す');
    assertUnchanged(localStore.profile, beforeLocal, '端末の資産は物語で変わらない');

    const finished = clone(localStore.storyMatch.state);
    finished.status = 'finished';
    finished.result = { kind: 'win', winner: 1, winners: [1], line: [0, 1, 2, 3, 4], reason: 'five' };
    const rewarded = await storyView.finishStory(ctx, finished, STAGE_BY_ID[1]);

    assert.equal(rewarded.ok, true);
    assert.equal(posts[1].path, '/api/story/finish');
    assert.equal(posts[1].body.matchId, finished.matchId);
    assert.equal(posts[1].body.outcome, 'win');
    assert.equal(storyView.storyViewState.lastResult.perica, 12, '褒美はオンラインの返答をそのまま出す');
    assertUnchanged(localStore.profile, beforeLocal, '褒美も端末の資産には入らない');
  });
});

test('保存先が変わったまま残った物語の盤面は、破棄するまで続けられない', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { ctx, localStore } = triad;
    const storyView = requireModule('views/story.js');
    const online = createProfile({ id: 'p_online', name: '旅人' });
    onlineAccount(triad, { profile: online });
    const refresh = ctx.refresh;
    ctx.refresh = () => {};
    assert.equal(await storyView.startMatchNow(ctx, 1), true);

    // オンラインを抜けた状態で物語を開く（盤面はオンラインで始めたもの）
    triad.app.mode = 'LOCAL';
    ctx.refresh = refresh;
    ctx.setView('story');
    const root = browser.document.getElementById('view-root');
    findNode(root, (node) => node.textContent === '進行中の盤面があります');
    assert.ok(localStore.storyMatch, '勝手に捨てない');

    const discard = triggerNode(findButton(root, 'この盤面を破棄する'), 'click');
    await confirmOpenDialog(browser.document);
    await discard;
    assert.equal(localStore.storyMatch, null);
  });
});

test('練習の対戦は褒美を出さない（1人で何人分でも操作できるため）', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { ctx, localStore } = triad;
    const online = createProfile({ id: 'p_online', name: '旅人' });
    onlineAccount(triad, { profile: online });
    ctx.refresh = () => {};

    const rules = requireModule('../../shared/rules.js');
    const { CHARACTERS } = requireModule('../../shared/constants.js');
    const playView = requireModule('views/play.js');
    const seats = CHARACTERS.slice(0, 3).map((c, i) => ({
      seat: i + 1, charId: c.id, name: `P${i + 1}`, kind: i === 0 ? 'human' : 'cpu',
    }));
    const state = rules.createMatch({ matchId: 'm_practice', mode: 'local', seats, startSeat: 1 });
    state.stats[1].placed = 5;
    state.status = 'finished';
    state.result = { kind: 'win', winner: 1, winners: [1], line: [0, 1, 2, 3, 4], reason: 'five' };
    assert.equal(localStore.setMatch({ state, setup: { mode: 'cpu' } }).ok, true);

    const beforeOnline = clone(online);
    const beforeLocal = clone(localStore.profile);

    const saved = playView.finishLocal(ctx, state, { mode: 'cpu' });

    assert.equal(saved.ok, true, '決着そのものは記録される');
    assert.equal(saved.outcome, 'win');
    assert.equal(localStore.match.state.status, 'finished', '盤面は端末に残る');
    assertUnchanged(online, beforeOnline, '練習ではアカウントの資産が動かない');
    assertUnchanged(localStore.profile, beforeLocal, '端末の資産にも褒美を入れない');
    assert.equal(triad.app.lastReward, null, '受け取る褒美は無い');
  });
});

test('設定画面に LOCAL / ONLINE の切り替えは無い', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    onlineAccount(triad, { profile: createProfile({ id: 'p_online', name: '旅人' }) });
    triad.ctx.setView('settings');

    const root = browser.document.getElementById('view-root');
    const labels = walkNodes(root).filter((n) => n.tagName === 'BUTTON').map((n) => n.textContent);
    assert.equal(labels.some((t) => t.includes('LOCAL')), false, 'LOCAL を選ぶ導線が無い');
    assert.equal(labels.some((t) => t.includes('ONLINE（サーバー）')), false, '資産の選択自体が無い');
    findNode(root, (n) => n.tagName === 'H2' && n.textContent === 'アカウント', 'アカウントの札が出る');
  });
});

test('アカウントに置いた設定は、読み込みのときにこの端末へ写す', async () => {
  const storage = createStorage();
  await withBrowser({ storage, bootable: true }, async (browser) => {
    const requireModule = await loadFreshBundle();
    requireModule('app.js');
    const triad = browser.window.__triad;
    const { preferences } = requireModule('preferences.js');
    const { effectLevel } = requireModule('util.js');
    const { audio } = requireModule('audio.js');

    const online = createProfile({ id: 'p_online', name: '旅人' });
    online.settings = {
      ...online.settings, confirmMove: false, bgm: 0.5, muted: true, effectLevel: 'off',
    };
    onlineAccount(triad, { profile: online });
    triad.ctx.refresh();

    assert.equal(preferences.values.confirmMove, false, '着手前確認がアカウント側に合う');
    assert.equal(audio.settings.bgm, 0.5);
    assert.equal(audio.settings.muted, true);
    assert.equal(effectLevel(), 'off');
  });
});
