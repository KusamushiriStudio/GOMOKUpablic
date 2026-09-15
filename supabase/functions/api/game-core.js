// Generated from index.html by tools/extract-edge-core.mjs. Do not edit directly.
const __mods = new Map();
const __def = (id, factory) => __mods.set(id, { factory, exports: null });
const __req = (id) => { const m = __mods.get(id); if (!m) throw new Error('Missing module: ' + id); if (m.exports) return m.exports; const box = {}; const value = m.factory(__req, box) ?? box; m.exports = value; return value; };

__def("../../shared/constants.js", function (__req) {
/**
 * TRIAD — 超次元五目 / 共有定数
 *
 * このファイルはブラウザ・Node の双方から素の ES Module として読み込まれる。
 * DOM / Node 固有 API を一切参照しないこと。
 */

/* ────────────────────────────── 盤面 ────────────────────────────── */

const BOARD_W = 11; // A〜K
const BOARD_H = 17; // 1〜17
const BOARD_SIZE = BOARD_W * BOARD_H; // 187 交点
const CENTER_INDEX = 8 * BOARD_W + 5; // F9
const WIN_LENGTH = 5; // 5 個以上で勝利（6 個以上も勝ち）

const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

/** 旧バージョン(15×15)判定用 */
const LEGACY_BOARD_W = 15;
const LEGACY_BOARD_H = 15;

const SEATS = [1, 2, 3];
const SEAT_COLORS = {
  1: '#1f6f4a', // 深緑
  2: '#b5462f', // 朱
  3: '#2f5d94', // 藍
};

const MAX_ENERGY = 6;

/** 隣接 8 方向 (dCol, dRow) */
const NEIGHBOR_DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/** 連続判定に使う 4 方向 (dCol, dRow) */
const LINE_DIRS = [
  [1, 0],  // 横
  [0, 1],  // 縦
  [1, 1],  // 右下がり斜め
  [1, -1], // 右上がり斜め
];

/* ────────────────────────── レアリティ ────────────────────────── */

const RARITIES = ['SSR', 'SR', 'R', 'N'];

/** 内部重み。合計 10000 の整数。 */
const RARITY_WEIGHTS = Object.freeze({
  SSR: 300,
  SR: 1200,
  R: 3500,
  N: 5000,
});
const RARITY_WEIGHT_TOTAL = 10000;

const RARITY_LABEL = Object.freeze({
  SSR: 'SSR',
  SR: 'SR',
  R: 'R',
  N: 'N',
});

/* ────────────────────────── キャラクター ────────────────────────── */

/**
 * スキルは全て「1 手番につき通常着手の代わりに 1 回」。
 * targets: 確定までにユーザーが選ぶ交点の種類（順番通り）。
 */
const CHARACTERS = Object.freeze([
  {
    id: 'hibana',
    name: 'ヒバナ',
    rarity: 'R',
    starter: true,
    color: '#d2622c',
    skill: {
      id: 'spark',
      name: '火花',
      cost: 4,
      uses: 2,
      targets: ['enemyStone'],
      desc: '守りのない相手の石を1個消す。',
    },
  },
  {
    id: 'mamori',
    name: 'マモリ',
    rarity: 'N',
    starter: true,
    color: '#3f8f5c',
    skill: {
      id: 'ward',
      name: '結界',
      cost: 2,
      uses: 2,
      targets: ['ownStone'],
      desc: '自分の石1個に、試合終了まで続く守りを付ける。',
    },
  },
  {
    id: 'hayate',
    name: 'ハヤテ',
    rarity: 'R',
    starter: true,
    color: '#4a9fc4',
    skill: {
      id: 'windwalk',
      name: '風渡り',
      cost: 3,
      uses: 2,
      targets: ['ownStone', 'adjacentEmpty'],
      desc: '自分の石1個を隣接8方向の空き交点へ移動する。守りは維持。',
    },
  },
  {
    id: 'yukine',
    name: 'ユキネ',
    rarity: 'N',
    starter: false,
    color: '#6fa8c9',
    skill: {
      id: 'freeze',
      name: '氷結',
      cost: 2,
      uses: 2,
      targets: ['empty'],
      desc: '空き交点1つを自分の次の手番開始まで封鎖する。',
    },
  },
  {
    id: 'kuon',
    name: 'クオン',
    rarity: 'SR',
    starter: false,
    color: '#7a5aa8',
    skill: {
      id: 'pull',
      name: '引力',
      cost: 4,
      uses: 2,
      targets: ['enemyStone', 'adjacentEmpty'],
      desc: '守りのない相手の石を隣接8方向の空き交点へ移動する。所有者は変わらない。',
    },
  },
  {
    id: 'akari',
    name: 'アカリ',
    rarity: 'SSR',
    starter: false,
    color: '#c9a227',
    skill: {
      id: 'transmute',
      name: '転光',
      cost: 6,
      uses: 1,
      targets: ['enemyStone'],
      desc: '守りのない相手の石1個を自分の石に変える。',
    },
  },
]);

const CHARACTER_BY_ID = Object.freeze(
  Object.fromEntries(CHARACTERS.map((c) => [c.id, c])),
);

const STARTER_CHARACTER_IDS = Object.freeze(
  // 対戦キャラクターはガチャ解放ではなく、最初から全員使用できる。
  CHARACTERS.map((c) => c.id),
);

/** 技IDから技定義を引く（物語は席が複数の技を持つため、キャラを経由せずに引く） */
const SKILL_BY_ID = Object.freeze(
  Object.fromEntries(CHARACTERS.map((c) => [c.skill.id, c.skill])),
);

const SKILL_BY_CHARACTER = Object.freeze(
  Object.fromEntries(CHARACTERS.map((c) => [c.id, c.skill])),
);

/* ────────────────────────── 着せ替え ────────────────────────── */

/** スロット種別 */
const COSMETIC_SLOTS = Object.freeze(['outfit', 'accessory', 'board', 'stone']);

/** 標準装備（ガチャ排出対象外・常時所持） */
const DEFAULT_EQUIP = Object.freeze({
  outfit: 'outfit-plain',
  accessory: 'acc-none',
  board: 'board-wood',
  stone: 'stone-classic',
});

/**
 * 全コスメ定義。gachaPool:false は標準装備（排出対象外）。
 * style は描画パラメータ（CSS 変数 / Canvas 描画に使用）。
 */
const COSMETICS = Object.freeze([
  // ── 標準装備 4 点（排出対象外）
  { id: 'outfit-plain', slot: 'outfit', name: '旅の着物', rarity: 'N', gachaPool: false, style: { base: '#cfc6ae', trim: '#8a7f63', pattern: 'plain' } },
  { id: 'acc-none', slot: 'accessory', name: '飾りなし', rarity: 'N', gachaPool: false, style: { kind: 'none' } },
  { id: 'board-wood', slot: 'board', name: '白木の碁盤', rarity: 'N', gachaPool: false, style: { bg: '#e8dcbe', bg2: '#dccfa9', line: '#8d7748', ink: '#4d4026', motif: 'none' } },
  { id: 'stone-classic', slot: 'stone', name: 'つや石', rarity: 'N', gachaPool: false, style: { pattern: 'gloss' } },

  // ── ファッション 12 点（衣装 6 / 飾り 6）
  { id: 'outfit-asanoha', slot: 'outfit', name: '麻の葉の小袖', rarity: 'N', gachaPool: true, style: { base: '#cbd8c4', trim: '#5d7a5a', pattern: 'asanoha' } },
  { id: 'outfit-aizome', slot: 'outfit', name: '藍染の羽織', rarity: 'N', gachaPool: true, style: { base: '#2f4f76', trim: '#c9d7e8', pattern: 'shibori' } },
  { id: 'acc-hachimaki', slot: 'accessory', name: '白い鉢巻', rarity: 'N', gachaPool: true, style: { kind: 'band', color: '#f6f3e7', accent: '#b5462f' } },

  { id: 'outfit-sakura', slot: 'outfit', name: '桜色の袴', rarity: 'R', gachaPool: true, style: { base: '#e8b7c4', trim: '#8f4f63', pattern: 'petal' } },
  { id: 'acc-tsubaki', slot: 'accessory', name: '椿の髪飾り', rarity: 'R', gachaPool: true, style: { kind: 'flower', color: '#c0362c', accent: '#f2d16b' } },
  { id: 'acc-kasa', slot: 'accessory', name: '旅人の笠', rarity: 'R', gachaPool: true, style: { kind: 'hat', color: '#c8ab72', accent: '#7a6136' } },

  { id: 'outfit-raijin', slot: 'outfit', name: '雷神の装束', rarity: 'SR', gachaPool: true, style: { base: '#3b3f57', trim: '#e6c74d', pattern: 'bolt' } },
  { id: 'acc-kitsune', slot: 'accessory', name: '狐のお面', rarity: 'SR', gachaPool: true, style: { kind: 'mask', color: '#f6f0e2', accent: '#c0362c' } },
  { id: 'acc-moon', slot: 'accessory', name: '三日月の冠', rarity: 'SR', gachaPool: true, style: { kind: 'crown', color: '#dfe6ef', accent: '#8fa8c8' } },

  { id: 'outfit-houou', slot: 'outfit', name: '鳳凰の錦衣', rarity: 'SSR', gachaPool: true, style: { base: '#8c2f2a', trim: '#e8c561', pattern: 'phoenix' } },
  { id: 'outfit-galaxy', slot: 'outfit', name: '星詠みの正装', rarity: 'SSR', gachaPool: true, style: { base: '#1d2144', trim: '#9fb6e8', pattern: 'stars' } },
  { id: 'acc-crown', slot: 'accessory', name: '天照の光輪', rarity: 'SSR', gachaPool: true, style: { kind: 'halo', color: '#f5d976', accent: '#fff3c4' } },

  // ── 盤面 8 点
  { id: 'board-bamboo', slot: 'board', name: '若竹の庭', rarity: 'N', gachaPool: true, style: { bg: '#dce7cf', bg2: '#c7d9b6', line: '#5f7a4c', ink: '#3c4d31', motif: 'bamboo' } },
  { id: 'board-sand', slot: 'board', name: '枯山水', rarity: 'N', gachaPool: true, style: { bg: '#ece5d6', bg2: '#ddd3bd', line: '#96876a', ink: '#4a4234', motif: 'sand' } },
  { id: 'board-sakura', slot: 'board', name: '桜の庭園', rarity: 'R', gachaPool: true, style: { bg: '#f4dfe4', bg2: '#e8c8d2', line: '#a86a80', ink: '#5c3646', motif: 'sakura' } },
  { id: 'board-ocean', slot: 'board', name: '青海波', rarity: 'R', gachaPool: true, style: { bg: '#d8e6ef', bg2: '#bcd3e4', line: '#4f7899', ink: '#274155', motif: 'seigaiha' } },
  { id: 'board-moon', slot: 'board', name: '月夜の竹林', rarity: 'SR', gachaPool: true, style: { bg: '#2b3448', bg2: '#1e2536', line: '#7f93b5', ink: '#dfe7f5', motif: 'moonbamboo', dark: true } },
  { id: 'board-maple', slot: 'board', name: '紅葉の山道', rarity: 'SR', gachaPool: true, style: { bg: '#f0dcc6', bg2: '#e0bd9a', line: '#9a5a32', ink: '#5a2f1a', motif: 'maple' } },
  { id: 'board-galaxy', slot: 'board', name: '天の川', rarity: 'SSR', gachaPool: true, style: { bg: '#161a33', bg2: '#0e1124', line: '#6f7fbf', ink: '#e6ecff', motif: 'galaxy', dark: true } },
  { id: 'board-gold', slot: 'board', name: '金箔の御殿', rarity: 'SSR', gachaPool: true, style: { bg: '#f0dda0', bg2: '#dcc271', line: '#9c7a24', ink: '#4a3a10', motif: 'goldleaf' } },

  // ── 碁石 8 点
  { id: 'stone-ring', slot: 'stone', name: '輪紋', rarity: 'N', gachaPool: true, style: { pattern: 'ring' } },
  { id: 'stone-stripe', slot: 'stone', name: '縞模様', rarity: 'N', gachaPool: true, style: { pattern: 'stripe' } },
  { id: 'stone-sakura', slot: 'stone', name: '桜紋', rarity: 'R', gachaPool: true, style: { pattern: 'sakura' } },
  { id: 'stone-wave', slot: 'stone', name: '波紋', rarity: 'R', gachaPool: true, style: { pattern: 'wave' } },
  { id: 'stone-crystal', slot: 'stone', name: '氷晶', rarity: 'SR', gachaPool: true, style: { pattern: 'crystal' } },
  { id: 'stone-lightning', slot: 'stone', name: '雷紋', rarity: 'SR', gachaPool: true, style: { pattern: 'lightning' } },
  { id: 'stone-galaxy', slot: 'stone', name: '星河', rarity: 'SSR', gachaPool: true, style: { pattern: 'galaxy' } },
  { id: 'stone-gold', slot: 'stone', name: '金の縁取り', rarity: 'SSR', gachaPool: true, style: { pattern: 'gold' } },

  // ── 物語のボス専用品 18 点（ガチャ排出対象外。既存34種の排出率へ混ぜない）
  { id: 'acc-oni-sakura', slot: 'accessory', name: '桜鬼の半面', rarity: 'R', gachaPool: false, storyDrop: 5, style: { kind: 'mask', color: '#f6dfe4', accent: '#8f2f45' } },
  { id: 'outfit-hanamori', slot: 'outfit', name: '花守の羽織', rarity: 'R', gachaPool: false, storyDrop: 5, style: { base: '#d9c3cf', trim: '#7a4257', pattern: 'petal' } },
  { id: 'board-yozakura', slot: 'board', name: '夜桜の参道', rarity: 'R', gachaPool: false, storyDrop: 5, style: { bg: '#2a2436', bg2: '#1b1726', line: '#8f6f92', ink: '#f0e2ef', motif: 'sakura', dark: true } },

  { id: 'stone-raiko', slot: 'stone', name: '雷鼓紋', rarity: 'SR', gachaPool: false, storyDrop: 10, style: { pattern: 'lightning' } },
  { id: 'acc-raikaku', slot: 'accessory', name: '雷角の飾り', rarity: 'SR', gachaPool: false, storyDrop: 10, style: { kind: 'crown', color: '#e8c561', accent: '#4a4a6a' } },
  { id: 'board-ameagari', slot: 'board', name: '雨上がりの社', rarity: 'SR', gachaPool: false, storyDrop: 10, style: { bg: '#dfe8e4', bg2: '#c3d3cd', line: '#5f7f76', ink: '#2c3f39', motif: 'sand' } },

  { id: 'outfit-enryu', slot: 'outfit', name: '炎竜の陣羽織', rarity: 'SR', gachaPool: false, storyDrop: 15, style: { base: '#8f3320', trim: '#e8a13c', pattern: 'bolt' } },
  { id: 'stone-yogan', slot: 'stone', name: '溶岩の鱗紋', rarity: 'SR', gachaPool: false, storyDrop: 15, style: { pattern: 'crystal' } },
  { id: 'acc-enryu-tsuno', slot: 'accessory', name: '炎竜の角飾り', rarity: 'SR', gachaPool: false, storyDrop: 15, style: { kind: 'crown', color: '#e8703c', accent: '#5c1e10' } },

  { id: 'acc-kyubi', slot: 'accessory', name: '紅葉九尾の面', rarity: 'SSR', gachaPool: false, storyDrop: 20, style: { kind: 'mask', color: '#f7ece0', accent: '#a3282f' } },
  { id: 'board-shugetsu', slot: 'board', name: '朱月の幻庭', rarity: 'SSR', gachaPool: false, storyDrop: 20, style: { bg: '#3a1f24', bg2: '#25141a', line: '#a8546a', ink: '#f6dfe0', motif: 'maple', dark: true } },
  { id: 'outfit-oboro', slot: 'outfit', name: '朧舞の衣', rarity: 'SSR', gachaPool: false, storyDrop: 20, style: { base: '#7a2d3a', trim: '#e8b96b', pattern: 'phoenix' } },

  { id: 'stone-hakugin', slot: 'stone', name: '白銀竜の氷紋', rarity: 'SSR', gachaPool: false, storyDrop: 25, style: { pattern: 'crystal' } },
  { id: 'outfit-yukiboshi', slot: 'outfit', name: '雪星の竜衣', rarity: 'SSR', gachaPool: false, storyDrop: 25, style: { base: '#dfe8f2', trim: '#5f7fa8', pattern: 'stars' } },
  { id: 'board-kyokko', slot: 'board', name: '極光の氷庭', rarity: 'SSR', gachaPool: false, storyDrop: 25, style: { bg: '#16233a', bg2: '#0d1526', line: '#6fa8c9', ink: '#e6f2ff', motif: 'galaxy', dark: true } },

  { id: 'outfit-shiki', slot: 'outfit', name: '四季の継承衣', rarity: 'SSR', gachaPool: false, storyDrop: 30, style: { base: '#e8dcc0', trim: '#c9a227', pattern: 'phoenix' } },
  { id: 'acc-akatsuki', slot: 'accessory', name: '暁の六印冠', rarity: 'SSR', gachaPool: false, storyDrop: 30, style: { kind: 'halo', color: '#f5d976', accent: '#fff3c4' } },
  { id: 'board-meguru', slot: 'board', name: '巡る四季の庭', rarity: 'SSR', gachaPool: false, storyDrop: 30, style: { bg: '#eae6d4', bg2: '#d6d8be', line: '#7f8a5f', ink: '#3d452c', motif: 'sakura' } },
]);

const COSMETIC_BY_ID = Object.freeze(
  Object.fromEntries(COSMETICS.map((c) => [c.id, c])),
);

const SLOT_LABEL = Object.freeze({
  outfit: '衣装',
  accessory: '飾り',
  board: '盤面',
  stone: '碁石',
});

/* ────────────────────────── ガチャ排出表 ────────────────────────── */

/** 抽選用 ID：キャラは char:<id>、コスメはコスメ ID そのまま。 */
const CHARACTER_DRAW_PREFIX = 'char:';

function characterDrawId(characterId) {
  return CHARACTER_DRAW_PREFIX + characterId;
}

function parseDrawId(drawId) {
  if (typeof drawId !== 'string') return null;
  if (drawId.startsWith(CHARACTER_DRAW_PREFIX)) {
    return { kind: 'character', id: drawId.slice(CHARACTER_DRAW_PREFIX.length) };
  }
  const cos = COSMETIC_BY_ID[drawId];
  if (cos) return { kind: 'cosmetic', id: drawId, slot: cos.slot };
  return null;
}

/** ガチャ排出対象 28 種（ファッション 12 + 盤面 8 + 碁石 8）。キャラは全員初期解放。 */
const GACHA_POOL = Object.freeze([
  ...COSMETICS.filter((c) => c.gachaPool).map((c) => ({
    drawId: c.id,
    kind: 'cosmetic',
    refId: c.id,
    name: c.name,
    rarity: c.rarity,
    slot: c.slot,
  })),
]);

const GACHA_POOL_BY_RARITY = Object.freeze(
  Object.fromEntries(RARITIES.map((r) => [r, GACHA_POOL.filter((i) => i.rarity === r)])),
);

const GACHA_POOL_BY_ID = Object.freeze(
  Object.fromEntries(GACHA_POOL.map((i) => [i.drawId, i])),
);

/* ────────────────────────── 経済 ────────────────────────── */

const GACHA_COST_SINGLE = 1;
const GACHA_COST_MULTI = 10;
const GACHA_PULL_COUNT_MULTI = 11;

const REWARD_PERICA = Object.freeze({ win: 3, lose: 1, draw: 1, aborted: 0 });
const REWARD_PLAYER_XP = Object.freeze({ win: 60, lose: 30, draw: 30, aborted: 0 });
const REWARD_CHAR_XP = Object.freeze({ win: 40, lose: 20, draw: 20, aborted: 0 });

const PLAYER_XP_PER_LEVEL = 100;
const CHAR_XP_PER_LEVEL = 80;

const TRAIN_COST_PERICA = 1;
const TRAIN_CHAR_XP = 40;

const DUP_CHAR_XP = 20;
const DUP_PLAYER_XP = 20;

/* ────────────────────────── ミッション ────────────────────────── */

const MISSIONS = Object.freeze([
  { id: 'first-match', name: '初陣', desc: '対戦を1回完了する', playerXp: 50, goal: 1, counter: 'matchesCompleted' },
  { id: 'stones-10', name: '布石', desc: '自分の石を合計10個置く', playerXp: 30, goal: 10, counter: 'stonesPlaced' },
  { id: 'skills-3', name: '技巧', desc: 'スキルを合計3回使う', playerXp: 40, goal: 3, counter: 'skillsUsed' },
  { id: 'first-win', name: '初勝利', desc: '1回勝利する', playerXp: 50, goal: 1, counter: 'wins' },
  { id: 'three-chars', name: '三者三様', desc: '3種類のキャラで対戦を完了する', playerXp: 60, goal: 3, counter: 'distinctCharsUsed' },
]);

const MISSION_BY_ID = Object.freeze(
  Object.fromEntries(MISSIONS.map((m) => [m.id, m])),
);

/* ────────────────────────── オンライン ────────────────────────── */

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_ALPHABET = '0123456789ABCDEF';
const ROOM_CAPACITY = 3;
const DISCONNECT_GRACE_MS = 180_000; // 180 秒
const DISCONNECT_WATCH_INTERVAL_MS = 15_000; // 監視 15 秒
const SSE_HEARTBEAT_MS = 20_000;

/* ────────────────────────── 演出・音 ────────────────────────── */

const FX_DURATION_MS = 1100; // 通常演出は約 1.1 秒
const DEFAULT_AUDIO = Object.freeze({ bgm: 0.24, sfx: 0.40, ambient: 0.30, muted: false });
/** 季節エフェクトの量（物語の天候表現）。OFF でも固定背景から季節が分かる。 */
const EFFECT_LEVELS = Object.freeze(['off', 'low', 'normal']);
const DEFAULT_EFFECT_LEVEL = 'normal';
const STORAGE_EFFECT_KEY = 'triad.effects.v1';
const BPM_HOME = 84;
const BPM_MATCH = 108;

/* ────────────────────────── 保存キー ────────────────────────── */

const STORAGE_KEY = 'triad.local.v1';
const STORAGE_AUDIO_KEY = 'triad.audio.v1';
const STORAGE_UI_KEY = 'triad.ui.v1';
const STORAGE_LOCK_KEY = 'triad.lock.v1';
const LEGACY_STORAGE_KEYS = Object.freeze(['triad.save', 'triad.local.v0', 'gomoku3.save']);
/**
 * 保存の版。
 * 統合仕様書 A-14 は「SaveV4 → SaveV5」と書いているが、
 * 着手前の実コードは SAVE_VERSION = 3 だった（docs/SPEC_GAP_AUDIT.md X13）。
 * 仕様の呼び方に合わせて V5 とし、V3・V4 のどちらからでも移行できるようにしている。
 */
const SAVE_VERSION = 5; // 物語（story 領域）を持つ版
const SAVE_VERSION_PREV = 3; // 実コード上の直前の版
const SAVE_VERSIONS_MIGRATABLE = Object.freeze([3, 4, 5]);
const GACHA_HISTORY_LIMIT = 100;

/* ────────────────────────── 位置表記 ────────────────────────── */

function indexToCoord(index) {
  return { col: index % BOARD_W, row: Math.floor(index / BOARD_W) };
}

function coordToIndex(col, row) {
  return row * BOARD_W + col;
}

function inBoard(col, row) {
  return col >= 0 && col < BOARD_W && row >= 0 && row < BOARD_H;
}

/** 例: index 92 → "F9" */
function indexToLabel(index) {
  const { col, row } = indexToCoord(index);
  return `${COLUMN_LABELS[col]}${row + 1}`;
}

return { BOARD_W, BOARD_H, BOARD_SIZE, CENTER_INDEX, WIN_LENGTH, COLUMN_LABELS, LEGACY_BOARD_W, LEGACY_BOARD_H, SEATS, SEAT_COLORS, MAX_ENERGY, NEIGHBOR_DIRS, LINE_DIRS, RARITIES, RARITY_WEIGHTS, RARITY_WEIGHT_TOTAL, RARITY_LABEL, CHARACTERS, CHARACTER_BY_ID, STARTER_CHARACTER_IDS, SKILL_BY_ID, SKILL_BY_CHARACTER, COSMETIC_SLOTS, DEFAULT_EQUIP, COSMETICS, COSMETIC_BY_ID, SLOT_LABEL, CHARACTER_DRAW_PREFIX, characterDrawId, parseDrawId, GACHA_POOL, GACHA_POOL_BY_RARITY, GACHA_POOL_BY_ID, GACHA_COST_SINGLE, GACHA_COST_MULTI, GACHA_PULL_COUNT_MULTI, REWARD_PERICA, REWARD_PLAYER_XP, REWARD_CHAR_XP, PLAYER_XP_PER_LEVEL, CHAR_XP_PER_LEVEL, TRAIN_COST_PERICA, TRAIN_CHAR_XP, DUP_CHAR_XP, DUP_PLAYER_XP, MISSIONS, MISSION_BY_ID, ROOM_CODE_LENGTH, ROOM_CODE_ALPHABET, ROOM_CAPACITY, DISCONNECT_GRACE_MS, DISCONNECT_WATCH_INTERVAL_MS, SSE_HEARTBEAT_MS, FX_DURATION_MS, DEFAULT_AUDIO, EFFECT_LEVELS, DEFAULT_EFFECT_LEVEL, STORAGE_EFFECT_KEY, BPM_HOME, BPM_MATCH, STORAGE_KEY, STORAGE_AUDIO_KEY, STORAGE_UI_KEY, STORAGE_LOCK_KEY, LEGACY_STORAGE_KEYS, SAVE_VERSION, SAVE_VERSION_PREV, SAVE_VERSIONS_MIGRATABLE, GACHA_HISTORY_LIMIT, indexToCoord, coordToIndex, inBoard, indexToLabel };
});

__def("../../shared/gacha.js", function (__req) {
/**
 * TRIAD — ガチャ抽選（純粋ロジック）
 *
 * ・キャラと着せ替えを混ぜた常設ガチャ 1 本、排出対象 34 種
 * ・まずレアリティを抽選し、そのレアリティ内の全アイテムから均等に 1 つ選ぶ
 * ・カテゴリを先に等確率で選ばない
 * ・全抽選は独立（保証枠・天井・確率上昇なし）
 */

const { RARITIES, RARITY_WEIGHTS, RARITY_WEIGHT_TOTAL, GACHA_POOL, GACHA_POOL_BY_RARITY } = __req("../../shared/constants.js");
const { secureRandomInt } = __req("../../shared/rng.js");

/** 標準の内部重み（合計 10000 の整数） */
function defaultWeights() {
  return { ...RARITY_WEIGHTS };
}

/** 標準の表示用パーセント */
function defaultRatesPercent() {
  return Object.fromEntries(
    RARITIES.map((r) => [r, (RARITY_WEIGHTS[r] / RARITY_WEIGHT_TOTAL) * 100]),
  );
}

/**
 * パーセント表記のレートを検証し、合計 10000 の整数重みへ変換する。
 * 0〜100%、小数第 2 位まで、合計 100% を要求する。
 * @returns {{ok:true, weights:object} | {ok:false, message:string}}
 */
function ratesToWeights(rates) {
  const weights = {};
  let sum = 0;
  for (const r of RARITIES) {
    const v = Number(rates?.[r]);
    if (!Number.isFinite(v)) return { ok: false, message: `${r} の確率が数値ではありません。` };
    if (v < 0 || v > 100) return { ok: false, message: `${r} の確率は 0〜100% の範囲で入力してください。` };
    const scaled = Math.round(v * 100);
    if (Math.abs(scaled - v * 100) > 1e-6) {
      return { ok: false, message: `${r} の確率は小数第2位までで入力してください。` };
    }
    weights[r] = scaled; // 100% = 10000
    sum += scaled;
  }
  if (sum !== RARITY_WEIGHT_TOTAL) {
    return { ok: false, message: `確率の合計が 100% になっていません（現在 ${(sum / 100).toFixed(2)}%）。` };
  }
  const zeroPool = RARITIES.find((r) => weights[r] > 0 && GACHA_POOL_BY_RARITY[r].length === 0);
  if (zeroPool) return { ok: false, message: `${zeroPool} に排出対象がありません。` };
  return { ok: true, weights };
}

function weightsToRates(weights) {
  return Object.fromEntries(RARITIES.map((r) => [r, (weights[r] ?? 0) / 100]));
}

/** レアリティごと・アイテムごとの提供割合（%） */
function offerRates(weights = RARITY_WEIGHTS) {
  const total = RARITIES.reduce((a, r) => a + (weights[r] ?? 0), 0) || RARITY_WEIGHT_TOTAL;
  const byRarity = {};
  const byItem = {};
  for (const r of RARITIES) {
    const pct = ((weights[r] ?? 0) / total) * 100;
    byRarity[r] = pct;
    const pool = GACHA_POOL_BY_RARITY[r];
    for (const item of pool) byItem[item.drawId] = pool.length ? pct / pool.length : 0;
  }
  return { byRarity, byItem, poolSize: GACHA_POOL.length };
}

/**
 * 1 回抽選する。randomInt は [0,n) の安全な一様乱数を返す関数。
 * @param {object} weights
 * @param {(n:number)=>number} randomInt
 */
function drawOne(weights = RARITY_WEIGHTS, randomInt = secureRandomInt) {
  const total = RARITIES.reduce((a, r) => a + (weights[r] ?? 0), 0);
  if (total <= 0) throw new Error('排出重みが不正です。');
  const roll = randomInt(total);
  let acc = 0;
  let chosen = null;
  for (const r of RARITIES) {
    acc += weights[r] ?? 0;
    if (roll < acc) { chosen = r; break; }
  }
  if (!chosen) chosen = RARITIES[RARITIES.length - 1];
  const pool = GACHA_POOL_BY_RARITY[chosen];
  if (!pool || pool.length === 0) throw new Error(`${chosen} に排出対象がありません。`);
  const item = pool[randomInt(pool.length)];
  return { ...item, roll, rarity: chosen };
}

/**
 * n 回抽選する。抽選そのものは副作用を持たない。
 * 途中で乱数が取得できない場合は例外を投げ、呼び出し側は何も消費しない。
 */
function drawMany(n, weights = RARITY_WEIGHTS, randomInt = secureRandomInt) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(drawOne(weights, randomInt));
  return out;
}

return { defaultWeights, defaultRatesPercent, ratesToWeights, weightsToRates, offerRates, drawOne, drawMany };
});

__def("../../shared/profile.js", function (__req) {
/**
 * TRIAD — プロフィール（所持・経済・装備・ミッション）の純粋ロジック。
 * ローカル(localStorage) とサーバー(JSON) の双方で同じ関数を使う。
 */

const { CHARACTERS, CHARACTER_BY_ID, STARTER_CHARACTER_IDS, COSMETICS, COSMETIC_BY_ID, DEFAULT_EQUIP, COSMETIC_SLOTS, MISSIONS, MISSION_BY_ID, PLAYER_XP_PER_LEVEL, CHAR_XP_PER_LEVEL, REWARD_PERICA, REWARD_PLAYER_XP, REWARD_CHAR_XP, TRAIN_COST_PERICA, TRAIN_CHAR_XP, DUP_CHAR_XP, DUP_PLAYER_XP, GACHA_COST_SINGLE, GACHA_COST_MULTI, GACHA_PULL_COUNT_MULTI, GACHA_HISTORY_LIMIT, SAVE_VERSION, parseDrawId } = __req("../../shared/constants.js");
const { drawMany, defaultWeights, ratesToWeights, weightsToRates, offerRates } = __req("../../shared/gacha.js");
const { STAGE_BY_ID, STORY_STAGE_COUNT, STORY_TOTAL_PERICA, SKILL_UNLOCKS, SKILL_UNLOCK_BY_STAGE, SEAL_BY_STAGE, STAGE_REWARD, STORY_XP, DUPLICATE_DROP_XP } = __req("../../shared/story/stages.js");

/* ───────────────────────── 生成・検証 ───────────────────────── */

function createProfile(opts = {}) {
  const now = Date.now();
  const chars = {};
  for (const c of CHARACTERS) {
    chars[c.id] = { owned: true, count: 1, xp: 0 };
  }
  const cosmetics = {};
  for (const id of Object.values(DEFAULT_EQUIP)) cosmetics[id] = 1;

  const equipByChar = {};
  for (const c of CHARACTERS) {
    equipByChar[c.id] = { outfit: DEFAULT_EQUIP.outfit, accessory: DEFAULT_EQUIP.accessory };
  }

  return {
    version: SAVE_VERSION,
    id: opts.id || 'local',
    name: opts.name || 'あなた',
    perica: 0,
    playerXp: 0,
    chars,
    cosmetics,
    equipByChar,
    equipCommon: { board: DEFAULT_EQUIP.board, stone: DEFAULT_EQUIP.stone },
    lastCharId: STARTER_CHARACTER_IDS[0],
    missions: Object.fromEntries(MISSIONS.map((m) => [m.id, { claimed: false }])),
    counters: {
      matchesCompleted: 0, stonesPlaced: 0, skillsUsed: 0, wins: 0, charsUsed: [],
    },
    gachaHistory: [],
    gachaRates: null, // ローカル試作用のみ。null は標準。
    ledger: {},        // requestId -> {hash, result, at}（結果まで保持する直近分）
    ledgerIds: {},     // requestId -> hash（結果は保持しない長期の重複検出用）
    rewardedMatches: {},
    legacyCoins: null, // 旧コインは退避のみ。ペリカへ変換しない。
    story: createStoryArea(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 物語の保存領域。
 * 3人対戦の戦績・報酬とは別に持ち、混ぜない。
 *   cleared   … stageId -> { first:number(初回制覇時刻), clears:number }
 *   rewarded  … stageId -> true（初回報酬を渡し済み）
 *   drops     … 物語でしか手に入らない着せ替えの取得記録
 *   skills    … 習得済みの術ID（spark / ward / windwalk / freeze / pull / transmute）
 *   seals     … 手に入れた碁印ID（harume / wakaba / enyo / shugetsu / yukiboshi / akatsuki）
 *   readTalks … 既読の会話（"<stageId>:intro" / "<stageId>:clear"）
 *   activeMatchId … 進行中の物語の試合（同時進行の防止に使う）
 */
function createStoryArea() {
  return {
    cleared: {},
    rewarded: {},
    drops: {},
    skills: [],
    seals: [],
    readTalks: {},
    maxStage: 0,
    lastStage: 1,
    activeMatchId: null,
  };
}

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/**
 * 破損・旧形式のデータを検証しつつ現行形式へ移行する。
 * 復元不能な場合のみ null を返す（呼び出し側が上書き可否をユーザーに確認する）。
 */
function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const base = createProfile({ id: typeof raw.id === 'string' ? raw.id : 'local' });

  if (typeof raw.name === 'string' && raw.name.trim()) base.name = raw.name.slice(0, 24);
  base.perica = clampInt(raw.perica, 0, 1e9, 0);
  base.playerXp = clampInt(raw.playerXp ?? raw.xp, 0, 1e12, 0);
  base.createdAt = clampInt(raw.createdAt, 0, Number.MAX_SAFE_INTEGER, base.createdAt);

  // 旧コインは退避のみ（ペリカへ変換しない）
  if (raw.coins != null && Number.isFinite(Number(raw.coins))) {
    base.legacyCoins = clampInt(raw.coins, 0, 1e9, 0);
  } else if (raw.legacyCoins != null) {
    base.legacyCoins = clampInt(raw.legacyCoins, 0, 1e9, 0);
  }

  // キャラ（旧形式: 配列 or {id:true}）
  if (Array.isArray(raw.chars) || Array.isArray(raw.unlockedChars)) {
    for (const id of (raw.chars || raw.unlockedChars)) {
      if (CHARACTER_BY_ID[id]) { base.chars[id].owned = true; base.chars[id].count = Math.max(1, base.chars[id].count); }
    }
  } else if (raw.chars && typeof raw.chars === 'object') {
    for (const [id, v] of Object.entries(raw.chars)) {
      if (!CHARACTER_BY_ID[id]) continue;
      if (typeof v === 'boolean') {
        base.chars[id].owned = base.chars[id].owned || v;
        if (v) base.chars[id].count = Math.max(1, base.chars[id].count);
      } else if (v && typeof v === 'object') {
        const owned = base.chars[id].owned || !!v.owned || Number(v.count) > 0;
        base.chars[id].owned = owned;
        base.chars[id].count = Math.max(owned ? 1 : 0, clampInt(v.count, 0, 1e6, owned ? 1 : 0));
        base.chars[id].xp = clampInt(v.xp, 0, 1e12, 0);
      }
    }
  }
  // 全キャラを初期所持にする。既存セーブのXP・重複数は上書きしない。
  for (const id of STARTER_CHARACTER_IDS) {
    base.chars[id].owned = true;
    base.chars[id].count = Math.max(1, base.chars[id].count);
  }

  // コスメ（旧形式: 配列）
  if (Array.isArray(raw.cosmetics)) {
    for (const id of raw.cosmetics) if (COSMETIC_BY_ID[id]) base.cosmetics[id] = (base.cosmetics[id] || 0) + 1;
  } else if (raw.cosmetics && typeof raw.cosmetics === 'object') {
    for (const [id, v] of Object.entries(raw.cosmetics)) {
      if (!COSMETIC_BY_ID[id]) continue;
      const n = typeof v === 'boolean' ? (v ? 1 : 0) : clampInt(v, 0, 1e6, 0);
      base.cosmetics[id] = Math.max(base.cosmetics[id] || 0, n);
    }
  }
  for (const id of Object.values(DEFAULT_EQUIP)) base.cosmetics[id] = Math.max(1, base.cosmetics[id] || 0);

  // 装備（旧形式: 単一 equip オブジェクト）
  const legacyEquip = raw.equip && typeof raw.equip === 'object' ? raw.equip : null;
  if (raw.equipByChar && typeof raw.equipByChar === 'object') {
    for (const [charId, eq] of Object.entries(raw.equipByChar)) {
      if (!CHARACTER_BY_ID[charId] || !eq || typeof eq !== 'object') continue;
      for (const slot of ['outfit', 'accessory']) {
        const id = eq[slot];
        if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
          base.equipByChar[charId][slot] = id;
        }
      }
    }
  } else if (legacyEquip) {
    for (const charId of Object.keys(base.equipByChar)) {
      for (const slot of ['outfit', 'accessory']) {
        const id = legacyEquip[slot];
        if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
          base.equipByChar[charId][slot] = id;
        }
      }
    }
  }
  const commonSrc = (raw.equipCommon && typeof raw.equipCommon === 'object') ? raw.equipCommon : legacyEquip;
  if (commonSrc) {
    for (const slot of ['board', 'stone']) {
      const id = commonSrc[slot];
      if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
        base.equipCommon[slot] = id;
      }
    }
  }

  if (typeof raw.lastCharId === 'string' && CHARACTER_BY_ID[raw.lastCharId] && base.chars[raw.lastCharId].owned) {
    base.lastCharId = raw.lastCharId;
  }

  // ミッション・カウンタ
  if (raw.missions && typeof raw.missions === 'object') {
    for (const [id, v] of Object.entries(raw.missions)) {
      if (!MISSION_BY_ID[id]) continue;
      base.missions[id].claimed = !!(typeof v === 'boolean' ? v : v?.claimed);
    }
  }
  if (raw.counters && typeof raw.counters === 'object') {
    const c = raw.counters;
    base.counters.matchesCompleted = clampInt(c.matchesCompleted, 0, 1e9, 0);
    base.counters.stonesPlaced = clampInt(c.stonesPlaced, 0, 1e9, 0);
    base.counters.skillsUsed = clampInt(c.skillsUsed, 0, 1e9, 0);
    base.counters.wins = clampInt(c.wins, 0, 1e9, 0);
    if (Array.isArray(c.charsUsed)) {
      base.counters.charsUsed = [...new Set(c.charsUsed.filter((x) => CHARACTER_BY_ID[x]))];
    }
  }

  // ガチャ履歴（検証付き移行）
  if (Array.isArray(raw.gachaHistory)) {
    base.gachaHistory = raw.gachaHistory
      .filter((h) => h && typeof h === 'object' && typeof h.drawId === 'string')
      .map((h) => ({
        at: clampInt(h.at, 0, Number.MAX_SAFE_INTEGER, 0),
        drawId: h.drawId,
        name: typeof h.name === 'string' ? h.name.slice(0, 40) : h.drawId,
        rarity: ['SSR', 'SR', 'R', 'N'].includes(h.rarity) ? h.rarity : 'N',
        isNew: !!h.isNew,
        rates: (h.rates && typeof h.rates === 'object') ? h.rates : weightsToRates(defaultWeights()),
      }))
      .slice(-GACHA_HISTORY_LIMIT);
  }

  if (raw.ledger && typeof raw.ledger === 'object') {
    for (const [reqId, v] of Object.entries(raw.ledger)) {
      if (typeof reqId !== 'string' || reqId.length > 128) continue;
      if (!v || typeof v !== 'object') continue;
      base.ledger[reqId] = { hash: String(v.hash ?? ''), result: v.result ?? null, at: clampInt(v.at, 0, Number.MAX_SAFE_INTEGER, 0) };
    }
  }
  if (raw.ledgerIds && typeof raw.ledgerIds === 'object') {
    for (const [reqId, h] of Object.entries(raw.ledgerIds)) {
      if (typeof reqId !== 'string' || reqId.length > 128) continue;
      if (typeof h !== 'string' || h.length > 64) continue;
      base.ledgerIds[reqId] = h;
    }
  }
  for (const [reqId, v] of Object.entries(base.ledger)) base.ledgerIds[reqId] = String(v.hash ?? '');
  if (raw.rewardedMatches && typeof raw.rewardedMatches === 'object') {
    for (const k of Object.keys(raw.rewardedMatches)) if (typeof k === 'string') base.rewardedMatches[k] = true;
  }
  if (raw.gachaRates && typeof raw.gachaRates === 'object') {
    const v = ratesToWeights(raw.gachaRates);
    if (v.ok) base.gachaRates = { ...raw.gachaRates };
  }

  // ── 物語（V3 → V4 の移行）
  // V3 までの保存には story が無い。既定値を入れるだけで、
  // 既存のペリカ・所持・装備・戦績には一切触れない。
  base.story = migrateStory(raw.story, base);

  base.updatedAt = Date.now();
  return base;
}

/**
 * 物語領域の検証つき移行。V3 以前（story が無い）は既定値で作る。
 * 不正な値は捨てるだけで、プロフィール全体を壊さない。
 */
function migrateStory(rawStory, base) {
  const story = createStoryArea();
  if (!rawStory || typeof rawStory !== 'object') return story;

  const inRange = (n) => Number.isInteger(n) && n >= 1 && n <= STORY_STAGE_COUNT;

  if (rawStory.cleared && typeof rawStory.cleared === 'object') {
    for (const [k, v] of Object.entries(rawStory.cleared)) {
      const id = Number(k);
      if (!inRange(id)) continue;
      if (v === true) { story.cleared[id] = { first: 0, clears: 1 }; continue; }
      if (!v || typeof v !== 'object') continue;
      story.cleared[id] = {
        first: clampInt(v.first, 0, Number.MAX_SAFE_INTEGER, 0),
        clears: clampInt(v.clears, 1, 1e6, 1),
      };
    }
  }
  if (rawStory.rewarded && typeof rawStory.rewarded === 'object') {
    for (const k of Object.keys(rawStory.rewarded)) {
      const id = Number(k);
      // 報酬済みの記録は、制覇の記録があるものだけ引き継ぐ（二重取りも取りこぼしも防ぐ）
      if (inRange(id) && story.cleared[id]) story.rewarded[id] = true;
    }
  }
  if (rawStory.drops && typeof rawStory.drops === 'object') {
    for (const k of Object.keys(rawStory.drops)) {
      const c = COSMETIC_BY_ID[k];
      if (c && c.storyDrop) story.drops[k] = true;
    }
  }
  const SKILL_IDS = new Set(SKILL_UNLOCKS.map((u) => u.skillId));
  const SEAL_IDS = new Set(Object.values(SEAL_BY_STAGE).map((x) => x.id));
  if (Array.isArray(rawStory.skills)) {
    story.skills = [...new Set(rawStory.skills.filter((x) => SKILL_IDS.has(x)))];
  }
  if (Array.isArray(rawStory.seals)) {
    // 旧形式（キャラクターIDで保存していた版）からの引き継ぎ
    for (const x of rawStory.seals) {
      if (SEAL_IDS.has(x)) story.seals.push(x);
      else {
        const u = SKILL_UNLOCKS.find((k) => k.charId === x);
        if (u && !story.skills.includes(u.skillId)) story.skills.push(u.skillId);
      }
    }
    story.seals = [...new Set(story.seals)];
  }
  if (rawStory.readTalks && typeof rawStory.readTalks === 'object') {
    for (const k of Object.keys(rawStory.readTalks)) {
      if (/^\d{1,2}:(intro|clear)$/.test(k)) story.readTalks[k] = true;
    }
  }
  // 習得済みの術と碁印は、制覇済みステージから引き直せる（記録が壊れていても復元できる）
  for (const u of SKILL_UNLOCKS) {
    if (story.cleared[u.stage] && !story.skills.includes(u.skillId)) story.skills.push(u.skillId);
  }
  for (const [stage, seal] of Object.entries(SEAL_BY_STAGE)) {
    if (story.cleared[stage] && !story.seals.includes(seal.id)) story.seals.push(seal.id);
  }
  const ids = Object.keys(story.cleared).map(Number);
  story.maxStage = ids.length ? Math.min(STORY_STAGE_COUNT, Math.max(...ids)) : 0;
  story.lastStage = inRange(Number(rawStory.lastStage))
    ? Number(rawStory.lastStage)
    : Math.min(STORY_STAGE_COUNT, story.maxStage + 1) || 1;
  story.activeMatchId = null; // 進行中の試合はセッションをまたいで引き継がない

  // 物語で得た着せ替えは所持にも反映しておく（V3 保存には入っていないため）
  for (const id of Object.keys(story.drops)) {
    base.cosmetics[id] = Math.max(1, base.cosmetics[id] || 0);
  }
  return story;
}

/* ───────────────────────── レベル ───────────────────────── */

function playerLevel(xp) {
  return 1 + Math.floor(Math.max(0, xp) / PLAYER_XP_PER_LEVEL);
}
function charLevel(xp) {
  return 1 + Math.floor(Math.max(0, xp) / CHAR_XP_PER_LEVEL);
}
function playerLevelProgress(xp) {
  const into = Math.max(0, xp) % PLAYER_XP_PER_LEVEL;
  return { into, need: PLAYER_XP_PER_LEVEL, ratio: into / PLAYER_XP_PER_LEVEL };
}
function charLevelProgress(xp) {
  const into = Math.max(0, xp) % CHAR_XP_PER_LEVEL;
  return { into, need: CHAR_XP_PER_LEVEL, ratio: into / CHAR_XP_PER_LEVEL };
}

/* ───────────────────────── 所持・装備 ───────────────────────── */

function ownedCharacters(profile) {
  return CHARACTERS.filter((c) => profile.chars[c.id]?.owned);
}
function ownsCharacter(profile, id) {
  return !!profile.chars[id]?.owned;
}
function ownsCosmetic(profile, id) {
  return (profile.cosmetics?.[id] || 0) > 0;
}
function ownedCosmetics(profile, slot) {
  return COSMETICS.filter((c) => (!slot || c.slot === slot) && ownsCosmetic(profile, c.id));
}

/**
 * 装備を変更する。未所持 / 存在しない ID / 別スロットは拒否する。
 * @returns {{ok:true} | {ok:false, message:string}}
 */
function equipCosmetic(profile, { slot, id, charId }) {
  if (!COSMETIC_SLOTS.includes(slot)) return { ok: false, message: 'そのスロットは存在しません。' };
  const cos = COSMETIC_BY_ID[id];
  if (!cos) return { ok: false, message: 'そのアイテムは存在しません。' };
  if (cos.slot !== slot) return { ok: false, message: `「${cos.name}」は${slot}スロットには装備できません。` };
  if (!ownsCosmetic(profile, id)) return { ok: false, message: `「${cos.name}」を所持していません。` };

  if (slot === 'outfit' || slot === 'accessory') {
    if (!CHARACTER_BY_ID[charId]) return { ok: false, message: '対象キャラクターが不正です。' };
    if (!ownsCharacter(profile, charId)) return { ok: false, message: 'そのキャラクターを所持していません。' };
    profile.equipByChar[charId] = profile.equipByChar[charId] || { ...DEFAULT_EQUIP };
    profile.equipByChar[charId][slot] = id;
  } else {
    profile.equipCommon[slot] = id;
  }
  profile.updatedAt = Date.now();
  return { ok: true };
}

function resetEquipToDefault(profile, { scope = 'all', charId = null } = {}) {
  if (scope === 'all' || scope === 'char') {
    const targets = charId ? [charId] : Object.keys(profile.equipByChar);
    for (const id of targets) {
      profile.equipByChar[id] = { outfit: DEFAULT_EQUIP.outfit, accessory: DEFAULT_EQUIP.accessory };
    }
  }
  if (scope === 'all' || scope === 'common') {
    profile.equipCommon = { board: DEFAULT_EQUIP.board, stone: DEFAULT_EQUIP.stone };
  }
  profile.updatedAt = Date.now();
  return { ok: true };
}

/** 対戦で使う見た目一式 */
function appearanceFor(profile, charId) {
  const eq = profile.equipByChar?.[charId] || { outfit: DEFAULT_EQUIP.outfit, accessory: DEFAULT_EQUIP.accessory };
  return {
    charId,
    outfit: ownsCosmetic(profile, eq.outfit) ? eq.outfit : DEFAULT_EQUIP.outfit,
    accessory: ownsCosmetic(profile, eq.accessory) ? eq.accessory : DEFAULT_EQUIP.accessory,
    stone: ownsCosmetic(profile, profile.equipCommon?.stone) ? profile.equipCommon.stone : DEFAULT_EQUIP.stone,
    board: ownsCosmetic(profile, profile.equipCommon?.board) ? profile.equipCommon.board : DEFAULT_EQUIP.board,
  };
}

/* ───────────────────────── 台帳（二重処理防止） ───────────────────────── */

/** 依存のない簡易ハッシュ（本文一致の検出用。暗号用途ではない） */
function bodyHash(obj) {
  const s = JSON.stringify(obj ?? null);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c + i, 2654435761) >>> 0;
  }
  return `${h1.toString(16)}-${h2.toString(16)}-${s.length}`;
}

const LEDGER_ERR_CONFLICT = 'ledger_conflict';

/**
 * 台帳は 2 段構え。
 *  ledger    … 結果まで保持する直近分（同じ内容を返し直せる）
 *  ledgerIds … requestId → 本文ハッシュのみの長期記録（結果は返せないが二重処理は防ぐ）
 * @returns {{state:'new'} | {state:'replay', result:any} | {state:'processed'} | {state:'conflict'}}
 */
function ledgerLookup(profile, requestId, body) {
  if (!requestId) return { state: 'new' };
  const hash = bodyHash(body);
  const hit = profile.ledger?.[requestId];
  if (hit) return hit.hash !== hash ? { state: 'conflict' } : { state: 'replay', result: hit.result };
  const known = profile.ledgerIds?.[requestId];
  if (known != null) return known !== hash ? { state: 'conflict' } : { state: 'processed' };
  return { state: 'new' };
}

function ledgerRecord(profile, requestId, body, result, limits) {
  if (!requestId) return;
  const hash = bodyHash(body);
  profile.ledger = profile.ledger || {};
  profile.ledgerIds = profile.ledgerIds || {};
  profile.ledger[requestId] = { hash, result, at: Date.now() };
  profile.ledgerIds[requestId] = hash;
  pruneLedger(profile, limits);
}

/**
 * 保持上限を整える。結果つきの記録は容量の都合で絞るが、
 * 二重処理の判定に使う ID 記録は「直近 100 件」よりはるかに長く保つ。
 */
function pruneLedger(profile, limits = {}) {
  const full = Number.isFinite(limits.full) ? limits.full : 20000;
  const ids = Number.isFinite(limits.ids) ? limits.ids : 50000;
  const maxAgeMs = Number.isFinite(limits.maxAgeMs) ? limits.maxAgeMs : 90 * 24 * 3600 * 1000;

  const entries = Object.entries(profile.ledger || {});
  if (entries.length > full || entries.length >= 2000) {
    const cutoff = Date.now() - maxAgeMs;
    const kept = entries.filter(([, v]) => (v.at || 0) >= cutoff);
    kept.sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
    profile.ledger = Object.fromEntries(kept.slice(0, full));
  }
  const idKeys = Object.keys(profile.ledgerIds || {});
  if (idKeys.length > ids) {
    // 挿入順に古いものから落とす
    const drop = idKeys.slice(0, idKeys.length - ids);
    for (const k of drop) delete profile.ledgerIds[k];
  }
}

/* ───────────────────────── ガチャ実行 ───────────────────────── */

function effectiveWeights(profile) {
  if (profile.gachaRates) {
    const v = ratesToWeights(profile.gachaRates);
    if (v.ok) return v.weights;
  }
  return defaultWeights();
}

function currentOfferRates(profile) {
  return offerRates(effectiveWeights(profile));
}

/**
 * ガチャを引く。残高消費・所持追加・XP・履歴を一括で確定する。
 * 例外時は profile を一切変更しない（内部で複製してから差し替える）。
 *
 * @returns {{ok:true, result:object} | {ok:false, code:string, message:string}}
 */
function pullGacha(profile, { count, requestId, randomInt, ledgerLimits }) {
  const n = Number(count);
  if (![1, 10].includes(n)) return { ok: false, code: 'bad_count', message: 'ガチャは1回または10+1回だけ実行できます。' };
  const body = { op: 'gacha', count: n };

  const look = ledgerLookup(profile, requestId, body);
  if (look.state === 'replay') return { ok: true, result: look.result, replay: true };
  if (look.state === 'processed') {
    return { ok: true, processed: true, result: null, replay: true, message: 'この操作はすでに確定済みです（結果の詳細は保持期間を過ぎています）。' };
  }
  if (look.state === 'conflict') return { ok: false, code: LEDGER_ERR_CONFLICT, message: '同じ操作IDで内容の異なる要求が届きました。' };

  // API上の count=10 は従来の複数回商品IDとして維持する。
  // 料金は10回分のまま、共通抽選処理だけを11回走らせる。
  const drawCount = n === 10 ? GACHA_PULL_COUNT_MULTI : 1;
  const cost = n === 10 ? GACHA_COST_MULTI : GACHA_COST_SINGLE;
  if (profile.perica < cost) {
    return { ok: false, code: 'insufficient', message: `ペリカが足りません（必要 ${cost} / 所持 ${profile.perica}）。` };
  }

  const weights = effectiveWeights(profile);
  const rates = weightsToRates(weights);

  let items;
  try {
    // 抽選を先に全て済ませる。途中で失敗しても何も消費しない。
    items = drawMany(drawCount, weights, randomInt);
  } catch (e) {
    return { ok: false, code: e.code || 'draw_failed', message: e.message || '抽選に失敗しました。' };
  }

  // ここから確定処理（同期・例外なし）
  const seenNew = new Set();
  const entries = [];
  let dupPlayerXp = 0;
  const now = Date.now();

  for (const item of items) {
    const parsed = parseDrawId(item.drawId);
    let isNew = false;
    if (parsed.kind === 'character') {
      const rec = profile.chars[parsed.id];
      isNew = !rec.owned && !seenNew.has(item.drawId);
      if (isNew) { rec.owned = true; seenNew.add(item.drawId); }
      rec.count += 1;
      if (!isNew) rec.xp += DUP_CHAR_XP;
    } else {
      const had = (profile.cosmetics[parsed.id] || 0) > 0;
      isNew = !had && !seenNew.has(item.drawId);
      if (isNew) seenNew.add(item.drawId);
      profile.cosmetics[parsed.id] = (profile.cosmetics[parsed.id] || 0) + 1;
      if (!isNew) { profile.playerXp += DUP_PLAYER_XP; dupPlayerXp += DUP_PLAYER_XP; }
    }
    entries.push({
      drawId: item.drawId, kind: parsed.kind, refId: parsed.id,
      name: item.name, rarity: item.rarity, slot: item.slot ?? null, isNew,
      at: now, rates,
    });
  }

  profile.perica -= cost;
  profile.gachaHistory.push(...entries.map((e) => ({
    at: e.at, drawId: e.drawId, name: e.name, rarity: e.rarity, isNew: e.isNew, rates: e.rates,
  })));
  if (profile.gachaHistory.length > GACHA_HISTORY_LIMIT) {
    profile.gachaHistory = profile.gachaHistory.slice(-GACHA_HISTORY_LIMIT);
  }
  profile.updatedAt = now;

  const result = {
    count: drawCount,
    purchaseCount: n,
    bonusCount: n === 10 ? drawCount - 10 : 0,
    cost,
    entries,
    balance: profile.perica,
    dupPlayerXp,
    rates,
  };
  ledgerRecord(profile, requestId, body, result, ledgerLimits);
  return { ok: true, result };
}

/* ───────────────────────── 育成 ───────────────────────── */

function trainCharacter(profile, { charId, requestId, ledgerLimits }) {
  const body = { op: 'train', charId };
  const look = ledgerLookup(profile, requestId, body);
  if (look.state === 'replay') return { ok: true, result: look.result, replay: true };
  if (look.state === 'processed') {
    return { ok: true, processed: true, result: null, replay: true, message: 'この操作はすでに確定済みです。' };
  }
  if (look.state === 'conflict') return { ok: false, code: LEDGER_ERR_CONFLICT, message: '同じ操作IDで内容の異なる要求が届きました。' };

  if (!CHARACTER_BY_ID[charId]) return { ok: false, code: 'bad_char', message: 'そのキャラクターは存在しません。' };
  if (!ownsCharacter(profile, charId)) return { ok: false, code: 'not_owned', message: 'そのキャラクターを所持していません。' };
  if (profile.perica < TRAIN_COST_PERICA) {
    return { ok: false, code: 'insufficient', message: `ペリカが足りません（必要 ${TRAIN_COST_PERICA}）。` };
  }
  profile.perica -= TRAIN_COST_PERICA;
  profile.chars[charId].xp += TRAIN_CHAR_XP;
  profile.updatedAt = Date.now();

  const result = { charId, xp: profile.chars[charId].xp, level: charLevel(profile.chars[charId].xp), balance: profile.perica };
  ledgerRecord(profile, requestId, body, result, ledgerLimits);
  return { ok: true, result };
}

/* ───────────────────────── 対戦報酬 ───────────────────────── */

/**
 * 試合報酬を付与する。matchId ＋ ユーザーで一度だけ。
 * @param {'win'|'lose'|'draw'|'aborted'} outcome
 */
function grantMatchReward(profile, { matchId, outcome, charId, stonesPlaced = 0, skillsUsed = 0 }) {
  if (!matchId) return { ok: false, code: 'bad_match', message: '試合IDがありません。' };
  if (profile.rewardedMatches[matchId]) {
    return { ok: true, result: { duplicated: true, perica: 0, playerXp: 0, charXp: 0, balance: profile.perica } };
  }
  const kind = ['win', 'lose', 'draw', 'aborted'].includes(outcome) ? outcome : 'aborted';
  const perica = REWARD_PERICA[kind];
  const pXp = REWARD_PLAYER_XP[kind];
  const cXp = REWARD_CHAR_XP[kind];

  profile.perica += perica;
  profile.playerXp += pXp;
  if (charId && profile.chars[charId]) profile.chars[charId].xp += cXp;

  // カウンタ（ミッション用）
  profile.counters.stonesPlaced += Math.max(0, Math.floor(stonesPlaced));
  profile.counters.skillsUsed += Math.max(0, Math.floor(skillsUsed));
  if (kind !== 'aborted') {
    profile.counters.matchesCompleted += 1;
    if (charId && !profile.counters.charsUsed.includes(charId)) profile.counters.charsUsed.push(charId);
  }
  if (kind === 'win') profile.counters.wins += 1;

  profile.rewardedMatches[matchId] = true;
  profile.updatedAt = Date.now();
  return { ok: true, result: { duplicated: false, outcome: kind, perica, playerXp: pXp, charXp: cXp, balance: profile.perica } };
}

/* ───────────────────────── 物語 ───────────────────────── */

/** 挑戦できるステージか（前のステージを制覇していること） */
function canEnterStage(profile, stageId) {
  const id = Number(stageId);
  if (!STAGE_BY_ID[id]) return { ok: false, code: 'no_stage', message: 'そのステージはありません。' };
  if (id === 1) return { ok: true };
  if (profile.story?.cleared[id - 1]) return { ok: true };
  return { ok: false, code: 'locked', message: '前のステージを先に越えてください。' };
}

/**
 * 物語を開始する。3人対戦と同時には進めない。
 * @param {{stageId:number, matchId:string, online?:boolean}} opts
 */
function beginStoryMatch(profile, { stageId, matchId, onlineMatchId = null }) {
  const gate = canEnterStage(profile, stageId);
  if (!gate.ok) return gate;
  if (onlineMatchId) {
    return { ok: false, code: 'online_busy', message: 'オンライン対戦の途中は、物語を始められません。' };
  }
  if (!matchId) return { ok: false, code: 'bad_match', message: '試合IDがありません。' };
  profile.story.activeMatchId = String(matchId);
  profile.story.lastStage = Number(stageId);
  profile.updatedAt = Date.now();
  return { ok: true, result: { stageId: Number(stageId), matchId: String(matchId) } };
}

function endStoryMatch(profile, matchId) {
  if (profile.story?.activeMatchId === String(matchId)) {
    profile.story.activeMatchId = null;
    profile.updatedAt = Date.now();
  }
  return { ok: true };
}

/**
 * 物語の1試合の報酬（統合仕様書 A-12）。
 *
 *  通常ステージ：勝利3／敗北1／引き分け1／中断0
 *  ボス：勝利は「初回合計」または「再勝利」。いずれも基本3を含む合計
 *  XP：勝利 プレイヤー60・キャラ40／敗北・引き分け 30・20／中断 0
 *  ボス勝利では毎回100%で着せ替えを1個ドロップする。
 *    初回はそのボスの先頭品を必ず付与。
 *    2回目以降は未所持品から均等抽選。すべて所持後はその3品から均等抽選。
 *    重複したときは所持数+1、プレイヤーXP+20。
 *
 * @param {{stageId:number, outcome:'win'|'lose'|'draw'|'aborted',
 *          charId?:string, randomInt?:(n:number)=>number}} opts
 */
function grantStoryClear(profile, { stageId, outcome = 'win', charId = null, randomInt = null }) {
  const stage = STAGE_BY_ID[Number(stageId)];
  if (!stage) return { ok: false, code: 'no_stage', message: 'そのステージはありません。' };
  const kind = ['win', 'lose', 'draw', 'aborted'].includes(outcome) ? outcome : 'aborted';
  const id = stage.id;

  // 中断は何も付与しない（記録も進めない）
  if (kind === 'aborted') {
    profile.story.activeMatchId = null;
    profile.updatedAt = Date.now();
    return {
      ok: true,
      result: {
        cleared: false, first: false, stageId: id, outcome: kind,
        perica: 0, playerXp: 0, charXp: 0, drops: [], duplicate: null, seal: null,
        balance: profile.perica, total: storyTotals(profile),
      },
    };
  }

  const rec = profile.story.cleared[id];
  const first = kind === 'win' && !rec;

  // ── ペリカ
  let perica;
  if (kind === 'win') perica = first ? stage.reward.first : stage.reward.repeat;
  else perica = STAGE_REWARD[kind];   // 敗北1／引き分け1
  profile.perica += perica;

  // ── XP
  const xp = STORY_XP[kind];
  let playerXp = xp.player;
  const charXp = xp.char;
  if (charId && profile.chars[charId]) profile.chars[charId].xp += charXp;

  // ── 制覇の記録（勝ったときだけ）
  let seal = null;
  const drops = [];
  let duplicate = null;
  if (kind === 'win') {
    profile.story.cleared[id] = { first: rec?.first || Date.now(), clears: (rec?.clears || 0) + 1 };
    profile.story.maxStage = Math.max(profile.story.maxStage, id);
    profile.story.lastStage = Math.min(STORY_STAGE_COUNT, id + 1) || id;
    if (first) profile.story.rewarded[id] = true;

    // 碁印（ボスを解放するたびに1つ）
    const s = SEAL_BY_STAGE[id];
    if (s && !profile.story.seals.includes(s.id)) {
      profile.story.seals.push(s.id);
      seal = s;
    }
    // 術の習得
    const unlock = SKILL_UNLOCK_BY_STAGE[id];
    if (unlock && !profile.story.skills.includes(unlock.skillId)) {
      profile.story.skills.push(unlock.skillId);
    }

    // ── ボスの着せ替えドロップ（毎回100%で1個）
    if (stage.boss && stage.drops.length) {
      const got = pickStoryDrop(profile, stage, { first, randomInt });
      if (got) {
        const had = (profile.cosmetics[got] || 0) > 0;
        profile.cosmetics[got] = (profile.cosmetics[got] || 0) + 1;
        profile.story.drops[got] = true;
        if (had) {
          duplicate = got;
          playerXp += DUPLICATE_DROP_XP;
        } else {
          drops.push(got);
        }
      }
    }
  }

  profile.playerXp += playerXp;
  profile.story.activeMatchId = null;
  profile.updatedAt = Date.now();
  return {
    ok: true,
    result: {
      cleared: kind === 'win', first, stageId: id, outcome: kind,
      perica, playerXp, charXp, drops, duplicate, seal,
      balance: profile.perica,
      total: storyTotals(profile),
    },
  };
}

/** ボスのドロップを1個選ぶ。初回は先頭品固定、以降は未所持から均等、全所持後は3品から均等。 */
function pickStoryDrop(profile, stage, { first, randomInt }) {
  const list = stage.drops.filter((cid) => COSMETIC_BY_ID[cid]);
  if (!list.length) return null;
  if (first) return list[0];
  const unowned = list.filter((cid) => !(profile.cosmetics[cid] > 0));
  const pool = unowned.length ? unowned : list;
  if (pool.length === 1) return pool[0];
  const pick = typeof randomInt === 'function' ? randomInt(pool.length) : Math.floor(Math.random() * pool.length);
  return pool[Math.min(pool.length - 1, Math.max(0, pick))];
}

function storyTotals(profile) {
  const cleared = Object.keys(profile.story?.cleared || {}).length;
  const earned = Object.keys(profile.story?.rewarded || {})
    .reduce((n, k) => n + (STAGE_BY_ID[Number(k)]?.reward.first || 0), 0);
  return {
    clearedStages: cleared,
    totalStages: STORY_STAGE_COUNT,
    earnedPerica: earned,
    maxPerica: STORY_TOTAL_PERICA,
    skills: [...(profile.story?.skills || [])],
    seals: [...(profile.story?.seals || [])],
  };
}

/** 会話を既読にする（報酬・解放には一切影響しない） */
function markTalkRead(profile, stageId, kind) {
  if (!profile.story) return { ok: false };
  const key = `${Number(stageId)}:${kind === 'clear' ? 'clear' : 'intro'}`;
  profile.story.readTalks[key] = true;
  profile.updatedAt = Date.now();
  return { ok: true };
}

function isTalkRead(profile, stageId, kind) {
  return !!profile.story?.readTalks?.[`${Number(stageId)}:${kind === 'clear' ? 'clear' : 'intro'}`];
}

/* ───────────────────────── ミッション ───────────────────────── */

function missionProgress(profile) {
  return MISSIONS.map((m) => {
    const current = m.counter === 'distinctCharsUsed'
      ? profile.counters.charsUsed.length
      : (profile.counters[m.counter] || 0);
    const done = current >= m.goal;
    return {
      ...m,
      current: Math.min(current, m.goal),
      raw: current,
      done,
      claimed: !!profile.missions[m.id]?.claimed,
      claimable: done && !profile.missions[m.id]?.claimed,
    };
  });
}

function claimMission(profile, missionId) {
  const m = MISSION_BY_ID[missionId];
  if (!m) return { ok: false, message: 'そのミッションは存在しません。' };
  const p = missionProgress(profile).find((x) => x.id === missionId);
  if (!p.done) return { ok: false, message: 'まだ達成していません。' };
  if (p.claimed) return { ok: false, message: 'すでに受け取り済みです。' };
  profile.missions[missionId].claimed = true;
  profile.playerXp += m.playerXp; // ミッション報酬でペリカは増やさない
  profile.updatedAt = Date.now();
  return { ok: true, result: { playerXp: m.playerXp, total: profile.playerXp } };
}

/* ───────────────────────── 概要 ───────────────────────── */

function summarize(profile) {
  return {
    id: profile.id,
    name: profile.name,
    perica: profile.perica,
    playerXp: profile.playerXp,
    playerLevel: playerLevel(profile.playerXp),
    ownedChars: ownedCharacters(profile).map((c) => c.id),
    cosmeticCount: Object.values(profile.cosmetics).reduce((a, b) => a + b, 0),
    equipCommon: { ...profile.equipCommon },
  };
}

return { createProfile, createStoryArea, normalizeProfile, playerLevel, charLevel, playerLevelProgress, charLevelProgress, ownedCharacters, ownsCharacter, ownsCosmetic, ownedCosmetics, equipCosmetic, resetEquipToDefault, appearanceFor, bodyHash, LEDGER_ERR_CONFLICT, ledgerLookup, ledgerRecord, pruneLedger, effectiveWeights, currentOfferRates, pullGacha, trainCharacter, grantMatchReward, canEnterStage, beginStoryMatch, endStoryMatch, grantStoryClear, storyTotals, markTalkRead, isTalkRead, missionProgress, claimMission, summarize };
});

__def("../../shared/rules.js", function (__req) {
/**
 * TRIAD — 超次元五目 / ルールエンジン（純粋ロジック）
 *
 * 表示・音・保存・通信から完全に分離する。ローカル対戦とサーバーで同一の
 * このモジュールを使うことで、判定の食い違いを防ぐ。
 */

const { BOARD_W, BOARD_H, BOARD_SIZE, WIN_LENGTH, MAX_ENERGY, NEIGHBOR_DIRS, LINE_DIRS, SEATS, COLUMN_LABELS, CHARACTER_BY_ID, SKILL_BY_CHARACTER, SKILL_BY_ID, indexToLabel } = __req("../../shared/constants.js");
const { RULESET, DEFAULT_PVP_RULESET, rulesetOf, rulesetOfState } = __req("../../shared/rulesets.js");
const { secureRandomInt } = __req("../../shared/rng.js");

/*
 * 盤面の寸法は必ず state.width / state.height から読む。
 * これにより、旧バージョン(15×15)の進行中の対戦もそのまま再開できる。
 */
const W = (s) => s.width || BOARD_W;
const H = (s) => s.height || BOARD_H;
/** 席数。既存の3人対戦は 3、ストーリーの1対1は 2。 */
const SEAT_COUNT = (s) => (Array.isArray(s.seats) && s.seats.length ? s.seats.length : 3);
/** 氷結の解除は「使用前 ply + 席数」。3人戦は +3、1対1は +2 になる。 */
const ICE_OFFSET = (s) => rulesetOfState(s).iceOffset || SEAT_COUNT(s);
const seatNumbers = (s) => Array.from({ length: SEAT_COUNT(s) }, (_, i) => i + 1);
const SIZE = (s) => s.stones.length;
const toCoord = (s, i) => ({ col: i % W(s), row: Math.floor(i / W(s)) });
const toIndex = (s, col, row) => row * W(s) + col;
const within = (s, col, row) => col >= 0 && col < W(s) && row >= 0 && row < H(s);

/** 盤面サイズに応じた交点の表記（例: F9） */
function labelOf(state, index) {
  const { col, row } = toCoord(state, index);
  const c = COLUMN_LABELS[col] || String.fromCharCode(65 + col);
  return `${c}${row + 1}`;
}

const ERR = Object.freeze({
  NOT_PLAYING: 'not_playing',
  NOT_YOUR_TURN: 'not_your_turn',
  BAD_INDEX: 'bad_index',
  OCCUPIED: 'occupied',
  FROZEN: 'frozen',
  NO_SKILL: 'no_skill',
  NOT_ENOUGH_ENERGY: 'not_enough_energy',
  NO_USES_LEFT: 'no_uses_left',
  BAD_TARGET: 'bad_target',
  GUARDED: 'guarded',
  NOT_ADJACENT: 'not_adjacent',
  PASS_NOT_ALLOWED: 'pass_not_allowed',
  BAD_ACTION: 'bad_action',
  SKILL_LOCKED: 'skill_locked',
  NEED_EXTRA: 'need_extra',
  GUARDED_TRANSMUTE: 'guarded_transmute',
});

const ERR_MESSAGE_JA = Object.freeze({
  [ERR.NOT_PLAYING]: 'この対戦はすでに終了しています。',
  [ERR.NOT_YOUR_TURN]: 'いまはあなたの手番ではありません。',
  [ERR.BAD_INDEX]: '盤面の外は選べません。',
  [ERR.OCCUPIED]: 'そこにはすでに石があります。',
  [ERR.FROZEN]: 'そこは氷結で封鎖されています。',
  [ERR.NO_SKILL]: 'そのスキルはこのキャラクターにはありません。',
  [ERR.NOT_ENOUGH_ENERGY]: 'エナジーが足りません。',
  [ERR.NO_USES_LEFT]: 'このスキルの使用回数を使い切りました。',
  [ERR.BAD_TARGET]: 'その対象にはスキルを使えません。',
  [ERR.GUARDED]: '守りのある石には効果がありません。',
  [ERR.NOT_ADJACENT]: '移動先は隣接する8方向の空き交点だけです。',
  [ERR.PASS_NOT_ALLOWED]: '置ける交点があるためパスはできません。',
  [ERR.BAD_ACTION]: '不正な操作です。',
  [ERR.SKILL_LOCKED]: 'この技は現在使用できません。',
  [ERR.NEED_EXTRA]: '追加配置が残っています。先に置いてください。',
  [ERR.GUARDED_TRANSMUTE]: '結界に守られているため転光できません。',
});

function errorMessage(code) {
  return ERR_MESSAGE_JA[code] || ERR_MESSAGE_JA[ERR.BAD_ACTION];
}

class RuleError extends Error {
  constructor(code) {
    super(errorMessage(code));
    this.code = code;
  }
}

/* ─────────────────────────── 生成 ─────────────────────────── */

/**
 * @param {{matchId:string, mode?:string, seats:Array<{seat:number,name:string,charId:string,kind?:string,userId?:string}>, startedAt?:number}} opts
 */
function createMatch(opts) {
  const ruleset = opts.ruleset || DEFAULT_PVP_RULESET;
  const seatCount = opts.seats?.length || SEATS.length;
  const seatList = Array.from({ length: seatCount }, (_, i) => i + 1);
  const seats = seatList.map((seat) => {
    const s = opts.seats.find((x) => Number(x.seat) === seat);
    if (!s) throw new Error(`seat ${seat} が指定されていません`);
    if (!CHARACTER_BY_ID[s.charId]) throw new Error(`未知のキャラクター: ${s.charId}`);
    return {
      seat,
      name: String(s.name ?? `P${seat}`),
      charId: s.charId,
      kind: s.kind === 'cpu' ? 'cpu' : 'human',
      userId: s.userId ?? null,
      cosmetics: s.cosmetics ?? null,
      // 物語の主人公は複数の術を持つ。3人対戦では指定しない（＝null。キャラの技1つ）。
      // 空配列は「術なし」を意味する（物語の第1〜2段）。
      skills: Array.isArray(s.skills) ? s.skills.filter((id) => SKILL_BY_ID[id]) : null,
    };
  });

  const rs = rulesetOf(ruleset);
  const v99 = rs.v99 || null;
  // 毎試合ランダムな開始プレイヤー（V99 §3）。P1/P2/P3 の識別・色・戦績IDは変えない。
  let startSeat = Number(opts.startSeat);
  if (!seatList.includes(startSeat)) startSeat = seatList[0];
  const order = v99
    ? seatList.map((_, i) => seatList[(seatList.indexOf(startSeat) + i) % seatList.length])
    : null;

  const zeros = (v) => Object.fromEntries(seatList.map((n) => [n, v]));
  return {
    matchId: String(opts.matchId),
    mode: opts.mode || 'local',
    ruleset,
    width: BOARD_W,
    height: BOARD_H,
    stones: new Array(BOARD_SIZE).fill(0),
    guards: new Array(BOARD_SIZE).fill(0),
    ice: new Array(BOARD_SIZE).fill(0), // 0 or release opCount
    iceOwner: new Array(BOARD_SIZE).fill(0),
    seats,
    turn: v99 ? startSeat : 1,
    // V99：今回の行動順と、各自の手番回数。全体手数では判定しない。
    startSeat: v99 ? startSeat : null,
    order,
    orderPos: v99 ? 0 : null,
    turnsTaken: v99 ? { ...zeros(0), [startSeat]: 1 } : null,
    /** 解決した手番の総数（3人合計）。追加配置を含む1手番で1増える。 */
    ply: 0,
    /** 追加配置の途中状態。{seat, remaining, banned} */
    pending: null,
    /** V99：全スキルを初手から強化形・十分な使用枠で使える。 */
    usesCap: v99 ? Object.fromEntries(seatList.map((n) => {
      const st = seats.find((x) => x.seat === n);
      const sk = st ? SKILL_BY_CHARACTER[st.charId] : null;
      const enhanced = st ? v99.enhance[st.charId] : null;
      return [n, sk ? Math.max(sk.uses, enhanced?.usesFloor || 0) : 0];
    })) : null,
    // 先手だけ開始時に 1。これは初回の手番分であり、最初の手番開始で加算しない。
    energy: { ...zeros(0), [v99 ? startSeat : 1]: 1 },
    // 複数の術を持つ席は技ごとに数える。1つだけの席は今までどおり数値。
    skillUses: Object.fromEntries(seatList.map((n) => {
      const s = seats.find((x) => x.seat === n);
      return [n, s && Array.isArray(s.skills) ? {} : 0];
    })),
    stats: Object.fromEntries(seatList.map((n) => [n, { placed: 0, skills: 0 }])),
    opCount: 0,
    revision: 0,
    eventSeq: 0,
    status: 'playing',
    result: null,
    lastAction: null,
    events: [],
    startedAt: opts.startedAt ?? Date.now(),
    finishedAt: null,
  };
}

/**
 * 新しい3人対戦の開始プレイヤーを選ぶ（V99 §3）。
 * 抽選なので暗号学的乱数を使う。Math.random へは落とさない。
 * V99 でないルールセットでは常に 1（従来どおり P1 先手）。
 */
function pickStartSeat(rulesetId = DEFAULT_PVP_RULESET, randomInt = null) {
  const rs = rulesetOf(rulesetId);
  const n = rs.seats || 3;
  if (!rs.randomStartSeat) return 1;
  const roll = randomInt || secureRandomInt;
  return roll(n) + 1;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

/* ─────────────────────────── 盤面問い合わせ ─────────────────────────── */

function isFrozen(state, index) {
  return state.ice[index] > 0 && turnClock(state) < state.ice[index];
}

function frozenIndices(state) {
  const out = [];
  for (let i = 0; i < SIZE(state); i += 1) if (isFrozen(state, i)) out.push(i);
  return out;
}

function canPlaceAt(state, index) {
  return index >= 0 && index < SIZE(state) && state.stones[index] === 0 && !isFrozen(state, index);
}

function legalPlacements(state) {
  const out = [];
  for (let i = 0; i < SIZE(state); i += 1) if (canPlaceAt(state, i)) out.push(i);
  return out;
}

function emptyCount(state) {
  let n = 0;
  for (let i = 0; i < SIZE(state); i += 1) if (state.stones[i] === 0) n += 1;
  return n;
}

function neighborsOf(state, index) {
  const { col, row } = toCoord(state, index);
  const out = [];
  for (const [dc, dr] of NEIGHBOR_DIRS) {
    const c = col + dc;
    const r = row + dr;
    if (within(state, c, r)) out.push(toIndex(state, c, r));
  }
  return out;
}

function isAdjacent(state, a, b) {
  if (a === b) return false;
  const A = toCoord(state, a);
  const B = toCoord(state, b);
  return Math.abs(A.col - B.col) <= 1 && Math.abs(A.row - B.row) <= 1;
}

/* ─────────────────────────── 勝敗判定 ─────────────────────────── */

/**
 * 盤面全体を走査し、5 個以上の連続を持つ所有者を返す。
 * 行末と次行の折り返しを連続扱いしないよう、必ず (col,row) 座標で辿る。
 * @returns {null | {owner:number, line:number[]}}
 */
function findWinningLine(state, preferOwner = 0) {
  const found = [];
  for (let row = 0; row < H(state); row += 1) {
    for (let col = 0; col < W(state); col += 1) {
      const idx = toIndex(state, col, row);
      const owner = state.stones[idx];
      if (!owner) continue;
      for (const [dc, dr] of LINE_DIRS) {
        // 連の始点だけを処理する
        const pc = col - dc;
        const pr = row - dr;
        if (within(state, pc, pr) && state.stones[toIndex(state, pc, pr)] === owner) continue;
        const line = [idx];
        let c = col + dc;
        let r = row + dr;
        while (within(state, c, r) && state.stones[toIndex(state, c, r)] === owner) {
          line.push(toIndex(state, c, r));
          c += dc;
          r += dr;
        }
        if (line.length >= WIN_LENGTH) found.push({ owner, line });
      }
    }
  }
  if (found.length === 0) return null;
  if (preferOwner) {
    const mine = found.find((f) => f.owner === preferOwner);
    if (mine) return mine;
  }
  // 複数同時成立時は席番号の小さい方を勝者とする（仮設定・記録済み）
  found.sort((a, b) => a.owner - b.owner || b.line.length - a.line.length);
  return found[0];
}

/**
 * そのルールセットで有効な技の値（消費・回数）を返す。
 * 調整の入っていないルールセットでは、定義そのままを返す。
 */
function effectiveSkill(state, skill) {
  if (!skill) return skill;
  const t = rulesetOfState(state).skillTuning;
  if (!t) return skill;
  const cost = t.costs?.[skill.id];
  const uses = t.uses?.[skill.id];
  if (cost == null && uses == null) return skill;
  return {
    ...skill,
    cost: Number.isFinite(cost) ? cost : skill.cost,
    uses: Number.isFinite(uses) ? uses : skill.uses,
  };
}

/** 表示用：ルールセットを指定して技の値を引く（対戦を作る前の画面で使う） */
function skillInRuleset(rulesetId, skill) {
  return effectiveSkill({ ruleset: rulesetId }, skill);
}

/** 表示用：その席がいま使える技（調整後の値） */
function skillForSeat(state, seat) {
  const s = state.seats?.find((x) => x.seat === Number(seat));
  return s ? effectiveSkill(state, SKILL_BY_CHARACTER[s.charId]) : null;
}

/**
 * 最少石数判定。
 * 盤が埋まって五連が無いとき、自分の石が最も少ない席の勝ちとする。
 * 同数のときはその全員が勝者（共同勝利）。
 *
 * ルールセット pvp_min_stones（＝これから始まる3人対戦）でのみ働く。
 * 進行中の対戦は ruleset が pvp_current のままなので、途中で条件は変わらない。
 */
function minStoneResult(state) {
  const counts = {};
  for (const n of seatNumbers(state)) counts[n] = 0;
  for (const v of state.stones) if (counts[v] != null) counts[v] += 1;
  const min = Math.min(...Object.values(counts));
  const winners = seatNumbers(state).filter((n) => counts[n] === min);
  return {
    kind: winners.length === 1 ? 'win' : 'co_win',
    winner: winners.length === 1 ? winners[0] : 0,
    winners,
    stoneCounts: counts,
    line: [],
    reason: 'min_stones',
  };
}

/** その席が勝者か（五連・最少石数・共同勝利のいずれでも同じ判定にする） */
function isWinnerSeat(result, seat) {
  if (!result) return false;
  if (Array.isArray(result.winners)) return result.winners.includes(Number(seat));
  return result.kind === 'win' && Number(result.winner) === Number(seat);
}

/** 決着の内容から、その席の報酬区分を返す */
function outcomeForSeat(result, seat) {
  if (!result) return 'draw';
  if (result.kind === 'aborted') return 'aborted';
  if (result.kind === 'draw') return 'draw';
  return isWinnerSeat(result, seat) ? 'win' : 'lose';
}

/* ─────────────────────────── V99：初手から全スキル解放 ─────────────────────────── */

/** そのルールセットの V99 設定（V99 でなければ null） */
function v99Of(state) {
  return rulesetOfState(state).v99 || null;
}

/** 手番の数え方。V99 は「解決した手番の総数」、それ以外は従来どおり操作数。 */
function turnClock(state) {
  return v99Of(state) ? (state.ply || 0) : state.opCount;
}

/** その席の行動順（0＝1番手）。V99 でなければ席番号−1。 */
function orderIndexOf(state, seat) {
  if (Array.isArray(state.order)) {
    const i = state.order.indexOf(Number(seat));
    return i < 0 ? 0 : i;
  }
  return Number(seat) - 1;
}

/** 互換用の解放手番。現行V99は0なので開始時から解放済み。 */
function unlockTurnOf(state, seat) {
  const v = v99Of(state);
  if (!v) return Infinity;
  return v.unlockTurn + (v.unlockOffsetByOrder[orderIndexOf(state, seat)] || 0);
}

/** その席が攻勢強化に達しているか */
function isEnhanced(state, seat) {
  const v = v99Of(state);
  if (!v) return false;
  return (state.turnsTaken?.[seat] || 0) >= unlockTurnOf(state, seat);
}

/** V99：その技をいまどの形で使えるか。使えないなら locked を返す。 */
function v99FormOf(state, seat, skillId) {
  const v = v99Of(state);
  if (!v) return null;
  const s = seatOf(state, seat);
  const base = effectiveSkill(state, SKILL_BY_ID[skillId]);
  if (!s || !base) return null;
  if (isEnhanced(state, seat)) {
    const e = v.enhance[s.charId];
    if (!e) return { form: 'normal', cost: base.cost, extra: 0, locked: false };
    const pen = v.orderPenalty[orderIndexOf(state, seat)] || 0;
    return { form: 'enhanced', cost: e.cost, extra: Math.max(0, e.extra - pen), locked: false };
  }
  // 旧ルール互換。現行V99は開始時から強化済みなので locked は常に false。
  const locked = v.lockedSkills.includes(skillId);
  return { form: 'normal', cost: base.cost, extra: 0, locked };
}

/** V99：その席の技の使用可能回数（下限保証の補充を反映した上限） */
function usesCapOf(state, seat, skillId) {
  const v = v99Of(state);
  const base = effectiveSkill(state, SKILL_BY_ID[skillId]);
  if (!v) return base ? base.uses : 0;
  const cap = state.usesCap?.[seat];
  const current = Number.isFinite(cap) ? cap : (base ? base.uses : 0);
  // 公開更新前から継続中の対戦も、再開直後から初期解放後の使用枠へ揃える。
  if (v.unlockTurn <= 0) {
    const charId = seatOf(state, seat)?.charId;
    return Math.max(current, v.enhance[charId]?.usesFloor || 0);
  }
  return current;
}

/** 手番開始の処理（エナジー・手番回数・旧進行中データの補充） */
function beginTurnFor(state, seat) {
  state.energy[seat] = Math.min(MAX_ENERGY, state.energy[seat] + 1);
  const v = v99Of(state);
  if (!v || !state.turnsTaken) return;
  state.turnsTaken[seat] = (state.turnsTaken[seat] || 0) + 1;
  const n = state.turnsTaken[seat];
  const s = seatOf(state, seat);
  const e = s ? v.enhance[s.charId] : null;
  if (!e) return;
  const used = usesOf(state, seat, SKILL_BY_CHARACTER[s.charId]?.id);
  // 使用回数の補充は「下限保証」であって加算ではない（V99 §9）
  if (n === unlockTurnOf(state, seat)) {
    state.usesCap[seat] = Math.max(state.usesCap[seat] || 0, used + e.usesFloor);
  }
  // 長期戦：対象キャラだけ最低1回へ回復（V99 §14）
  if (n === v.longTurn && v.longRecover.includes(s.charId)) {
    state.usesCap[seat] = Math.max(state.usesCap[seat] || 0, used + 1);
  }
}

/** 画面表示用のまとめ */
function v99Info(state, seat) {
  const v = v99Of(state);
  if (!v) return null;
  const s = seatOf(state, seat);
  const skillId = SKILL_BY_CHARACTER[s?.charId]?.id;
  const form = skillId ? v99FormOf(state, seat, skillId) : null;
  const turns = state.turnsTaken?.[seat] || 0;
  const unlock = unlockTurnOf(state, seat);
  return {
    seat,
    startSeat: state.startSeat,
    orderIndex: orderIndexOf(state, seat),
    turnsTaken: turns,
    unlockTurn: unlock,
    turnsToUnlock: Math.max(0, unlock - turns),
    enhanced: isEnhanced(state, seat),
    locked: !!form?.locked,
    cost: form?.cost ?? null,
    extra: form?.extra ?? 0,
    usesLeft: skillId ? Math.max(0, usesCapOf(state, seat, skillId) - usesOf(state, seat, skillId)) : 0,
    pending: state.pending && state.pending.seat === seat ? state.pending.remaining : 0,
  };
}

/* ─────────────────────────── 内部ヘルパ ─────────────────────────── */

function requirePlaying(state) {
  if (state.status !== 'playing') throw new RuleError(ERR.NOT_PLAYING);
}

function requireTurn(state, seat) {
  if (Number(seat) !== state.turn) throw new RuleError(ERR.NOT_YOUR_TURN);
}

function requireIndex(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= SIZE(state)) throw new RuleError(ERR.BAD_INDEX);
}

function seatOf(state, seat) {
  return state.seats.find((s) => s.seat === Number(seat));
}

function skillOf(state, seat) {
  const s = seatOf(state, seat);
  return s ? SKILL_BY_CHARACTER[s.charId] : null;
}

/**
 * その席が使える技の一覧。
 *  ・3人対戦：キャラの技1つ。
 *  ・物語：席が持つ習得済みの術（最大6）。共有エナジーで使う。
 * seat.skills（技IDの配列）があればそちらを優先する。
 */
function skillsOf(state, seat) {
  const s = seatOf(state, seat);
  if (!s) return [];
  if (Array.isArray(s.skills)) {
    return s.skills.map((id) => effectiveSkill(state, SKILL_BY_ID[id])).filter(Boolean);
  }
  const one = effectiveSkill(state, SKILL_BY_CHARACTER[s.charId]);
  return one ? [one] : [];
}

/** 席が技IDで技を引く（未習得なら null） */
function skillOfId(state, seat, skillId) {
  return skillsOf(state, seat).find((sk) => sk.id === skillId) || null;
}

/** その技をこの試合で何回使ったか。物語は技ごと、3人対戦は席ごとの1つの数。 */
function usesOf(state, seat, skillId) {
  const u = state.skillUses[seat];
  if (u && typeof u === 'object') return Number(u[skillId] || 0);
  return Number(u || 0);
}

function addUse(state, seat, skillId) {
  const u = state.skillUses[seat];
  if (u && typeof u === 'object') u[skillId] = Number(u[skillId] || 0) + 1;
  else state.skillUses[seat] = Number(u || 0) + 1;
}

function pushEvent(state, ev) {
  state.eventSeq += 1;
  const full = {
    ...ev,
    id: `${state.matchId}#${state.opCount}`,
    seq: state.eventSeq,
    at: ev.at ?? Date.now(),
  };
  state.events.push(full);
  if (state.events.length > 40) state.events.splice(0, state.events.length - 40);
  return full;
}

function advanceTurn(state) {
  if (Array.isArray(state.order) && state.order.length) {
    state.orderPos = ((state.orderPos || 0) + 1) % state.order.length;
    state.turn = state.order[state.orderPos];
  } else {
    state.turn = (state.turn % SEAT_COUNT(state)) + 1;
  }
  beginTurnFor(state, state.turn);
  // 期限切れの氷を掃除（判定自体は isFrozen が手番の時計で行う）
  for (let i = 0; i < SIZE(state); i += 1) {
    if (state.ice[i] > 0 && turnClock(state) >= state.ice[i]) {
      state.ice[i] = 0;
      state.iceOwner[i] = 0;
    }
  }
}

function finalizeAfterOperation(state, actorSeat, event) {
  state.opCount += 1;
  state.revision += 1;

  const win = findWinningLine(state, 0);
  if (win) {
    state.ply += 1;
    state.pending = null;
    state.status = 'finished';
    state.result = { kind: 'win', winner: win.owner, winners: [win.owner], line: win.line, reason: 'five' };
    state.finishedAt = Date.now();
    return;
  }
  // V99：追加配置が残っているあいだは、同じ人の手番が続く（全体で1手）
  if (state.pending && state.pending.remaining > 0) {
    if (legalPlacements(state).length > 0) return;
    state.pending = null;   // 置ける交点が無くなったら打ち切る
  }
  state.pending = null;
  state.ply += 1;
  if (emptyCount(state) === 0) {
    state.status = 'finished';
    state.result = rulesetOfState(state).minStoneJudgement
      ? minStoneResult(state)
      : { kind: 'draw', winner: 0, line: [], reason: 'board_full' };
    state.finishedAt = Date.now();
    return;
  }
  advanceTurn(state);
  void actorSeat;
  void event;
}

/* ─────────────────────────── 行動 ─────────────────────────── */

/**
 * 単一の確定操作を適用する。
 * 不正な操作では state を一切変更しない（呼び出し側の state を直接触らないため）。
 *
 * @param {object} state
 * @param {{type:'place'|'skill'|'pass', seat:number, index?:number, from?:number, to?:number}} action
 * @returns {{ok:true, state:object, event:object} | {ok:false, code:string, message:string}}
 */
function applyAction(state, action) {
  const next = cloneState(state);
  try {
    const event = perform(next, action);
    return { ok: true, state: next, event };
  } catch (e) {
    if (e instanceof RuleError) {
      return { ok: false, code: e.code, message: e.message };
    }
    throw e;
  }
}

function perform(state, action) {
  if (!action || typeof action !== 'object') throw new RuleError(ERR.BAD_ACTION);
  requirePlaying(state);
  const seat = Number(action.seat);
  if (!Number.isInteger(seat) || seat < 1 || seat > SEAT_COUNT(state)) throw new RuleError(ERR.BAD_ACTION);
  requireTurn(state, seat);

  if (state.pending && state.pending.remaining > 0) {
    if (state.pending.seat !== seat) throw new RuleError(ERR.NOT_YOUR_TURN);
    if (action.type !== 'extra') throw new RuleError(ERR.NEED_EXTRA);
    return doExtra(state, seat, Number(action.index));
  }

  switch (action.type) {
    case 'place': return doPlace(state, seat, Number(action.index));
    case 'pass': return doPass(state, seat);
    case 'skill': return doSkill(state, seat, action);
    case 'extra': throw new RuleError(ERR.BAD_ACTION);
    default: throw new RuleError(ERR.BAD_ACTION);
  }
}

function doPlace(state, seat, index) {
  requireIndex(state, index);
  if (state.stones[index] !== 0) throw new RuleError(ERR.OCCUPIED);
  if (isFrozen(state, index)) throw new RuleError(ERR.FROZEN);

  state.stones[index] = seat;
  state.guards[index] = 0;
  state.stats[seat].placed += 1;
  state.lastAction = { type: 'place', seat, index };

  const ev = pushEvent(state, {
    type: 'place', seat, index, charId: seatOf(state, seat).charId,
    label: labelOf(state, index),
  });
  finalizeAfterOperation(state, seat, ev);
  return ev;
}

function doPass(state, seat) {
  if (legalPlacements(state).length > 0) throw new RuleError(ERR.PASS_NOT_ALLOWED);
  state.lastAction = { type: 'pass', seat };
  const ev = pushEvent(state, { type: 'pass', seat, charId: seatOf(state, seat).charId });
  finalizeAfterOperation(state, seat, ev);
  return ev;
}

function doSkill(state, seat, action) {
  const seatInfo = seatOf(state, seat);
  const list = skillsOf(state, seat);
  if (!list.length) throw new RuleError(ERR.NO_SKILL);
  // 技が1つだけの席では skillId 省略を許す（既存3人対戦の呼び出しをそのまま通す）
  const skill = action.skillId
    ? list.find((sk) => sk.id === action.skillId)
    : (list.length === 1 ? list[0] : null);
  if (!skill) throw new RuleError(ERR.NO_SKILL);

  // V99：現行ルールでは初手から強化時の消費・回数・追加配置を使う。
  const v = v99Of(state);
  const form = v ? v99FormOf(state, seat, skill.id) : null;
  if (form && form.locked) throw new RuleError(ERR.SKILL_LOCKED);
  const cost = form ? form.cost : skill.cost;
  const maxUses = v ? usesCapOf(state, seat, skill.id) : skill.uses;

  if (state.energy[seat] < cost) throw new RuleError(ERR.NOT_ENOUGH_ENERGY);
  if (usesOf(state, seat, skill.id) >= maxUses) throw new RuleError(ERR.NO_USES_LEFT);

  // 効果の適用（各ハンドラは失敗時に RuleError を投げ、state を変更しない）
  const detail = SKILL_HANDLERS[skill.id](state, seat, action);

  state.energy[seat] -= cost;
  // 結界付き石を火花で壊したときだけエナジーを回復する（§3）。上限は超えない。
  if (detail.brokeWard && v && v.wardBreakEnergy) {
    state.energy[seat] = Math.min(MAX_ENERGY, state.energy[seat] + v.wardBreakEnergy);
  }
  addUse(state, seat, skill.id);
  state.stats[seat].skills += 1;
  state.lastAction = { type: 'skill', seat, skillId: skill.id, ...detail };

  const ev = pushEvent(state, {
    type: 'skill',
    seat,
    charId: seatInfo.charId,
    charName: CHARACTER_BY_ID[seatInfo.charId].name,
    skillId: skill.id,
    skillName: skill.name,
    extra: form ? form.extra : 0,
    ...detail,
  });
  if (form && form.extra > 0) {
    state.pending = { seat, remaining: form.extra, banned: bannedFor(state, skill.id, detail), skillId: skill.id };
  }
  finalizeAfterOperation(state, seat, ev);
  return ev;
}

/** 追加配置を置けない交点（§12 火花で消した点／§13 移動先） */
function bannedFor(state, skillId, detail) {
  const v = v99Of(state);
  switch (skillId) {
    case 'spark': return (v && v.sparkCanRefill) ? null : detail.index;
    case 'windwalk': return detail.to;
    case 'pull': return detail.to;
    case 'freeze': return detail.index;
    default: return null;
  }
}

/** 追加配置を1つ置く。1手番のうちの1操作で、手番はまだ終わらない。 */
function doExtra(state, seat, index) {
  requireIndex(state, index);
  const p = state.pending;
  if (!p || p.seat !== seat || p.remaining <= 0) throw new RuleError(ERR.BAD_ACTION);
  if (p.banned != null && index === p.banned) throw new RuleError(ERR.BAD_TARGET);
  if (state.stones[index] !== 0) throw new RuleError(ERR.OCCUPIED);
  if (isFrozen(state, index)) throw new RuleError(ERR.FROZEN);

  state.stones[index] = seat;
  state.guards[index] = 0;
  state.stats[seat].placed += 1;
  state.pending = { ...p, remaining: p.remaining - 1 };
  state.lastAction = { type: 'extra', seat, index };

  const ev = pushEvent(state, {
    type: 'extra', seat, index, charId: seatOf(state, seat).charId,
    label: labelOf(state, index), remaining: state.pending.remaining,
  });
  finalizeAfterOperation(state, seat, ev);
  return ev;
}

/* ── 各スキル ── */

/**
 * 相手の石であることを確かめる。
 * @param {{allowGuarded?:boolean, guardedError?:string}} opts
 *   allowGuarded … 結界付きでも対象にできる（火花のみ）
 *   guardedError … 結界で拒否するときのエラー種別（転光は専用の文言）
 */
function requireEnemyStone(state, seat, index, opts = {}) {
  requireIndex(state, index);
  const owner = state.stones[index];
  if (owner === 0 || owner === seat) throw new RuleError(ERR.BAD_TARGET);
  // 守りは「防がれる操作そのものを拒否」する。回数・エナジーは消費しない。
  if (!opts.allowGuarded && state.guards[index]) {
    throw new RuleError(opts.guardedError || ERR.GUARDED);
  }
  return owner;
}

function requireEnemyUnguardedStone(state, seat, index) {
  return requireEnemyStone(state, seat, index);
}

/** 火花が結界を破れるルールセットか */
function sparkBreaksWard(state) {
  const v = v99Of(state);
  return !!(v && v.sparkBreaksWard);
}

function requireOwnStone(state, seat, index) {
  requireIndex(state, index);
  if (state.stones[index] !== seat) throw new RuleError(ERR.BAD_TARGET);
}

function requireMoveDestination(state, from, to) {
  requireIndex(state, to);
  if (from === to) throw new RuleError(ERR.NOT_ADJACENT);
  if (!isAdjacent(state, from, to)) throw new RuleError(ERR.NOT_ADJACENT);
  if (state.stones[to] !== 0) throw new RuleError(ERR.OCCUPIED);
  if (isFrozen(state, to)) throw new RuleError(ERR.FROZEN);
}

const SKILL_HANDLERS = {
  // ヒバナ / 火花
  spark(state, seat, action) {
    const index = Number(action.index);
    const breaks = sparkBreaksWard(state);
    const owner = requireEnemyStone(state, seat, index, { allowGuarded: breaks });
    // 結界だけを消すのではなく、結界と石をまとめて削除する（§2）
    const warded = !!state.guards[index];
    state.stones[index] = 0;
    state.guards[index] = 0;
    return { index, targetOwner: owner, brokeWard: breaks && warded };
  },

  // マモリ / 結界
  ward(state, seat, action) {
    const index = Number(action.index);
    requireOwnStone(state, seat, index);
    if (state.guards[index]) throw new RuleError(ERR.BAD_TARGET);
    state.guards[index] = 1;
    return { index, targetOwner: seat };
  },

  // ハヤテ / 風渡り
  windwalk(state, seat, action) {
    const from = Number(action.from);
    const to = Number(action.to);
    requireOwnStone(state, seat, from);
    requireMoveDestination(state, from, to);
    const guard = state.guards[from];
    state.stones[from] = 0;
    state.guards[from] = 0;
    state.stones[to] = seat;
    state.guards[to] = guard; // 守りは維持
    return { from, to, targetOwner: seat };
  },

  // ユキネ / 氷結
  freeze(state, seat, action) {
    const index = Number(action.index);
    requireIndex(state, index);
    if (state.stones[index] !== 0) throw new RuleError(ERR.BAD_TARGET);
    if (isFrozen(state, index)) throw new RuleError(ERR.FROZEN);
    // 使用直前の操作数 n に対し n+席数 で解除（＝使用者の次の手番開始）
    state.ice[index] = turnClock(state) + ICE_OFFSET(state);
    state.iceOwner[index] = seat;
    return { index, releaseAt: state.ice[index] };
  },

  // クオン / 引力
  pull(state, seat, action) {
    const from = Number(action.from);
    const to = Number(action.to);
    const owner = requireEnemyUnguardedStone(state, seat, from);
    requireMoveDestination(state, from, to);
    state.stones[from] = 0;
    state.guards[from] = 0;
    state.stones[to] = owner; // 所有者は変更しない
    state.guards[to] = 0;
    return { from, to, targetOwner: owner };
  },

  // アカリ / 転光
  transmute(state, seat, action) {
    const index = Number(action.index);
    // 結界付きの石は転光できない（§8）。座標は変えず、所有者だけを変える（§7）。
    // 専用の文言は V99 だけ。進行中の旧ルールセットの挙動は変えない。
    const owner = requireEnemyStone(state, seat, index, {
      guardedError: v99Of(state) ? ERR.GUARDED_TRANSMUTE : ERR.GUARDED,
    });
    state.stones[index] = seat;
    state.guards[index] = 0;
    return { index, targetOwner: owner, newOwner: seat };
  },
};

/* ─────────────────────────── スキル対象の候補 ─────────────────────────── */

/** UI 用：現在の席が第 1 対象として選べる交点の一覧 */
function skillFirstTargets(state, seat, skillId = null) {
  const list = skillsOf(state, seat);
  const skill = skillId ? list.find((sk) => sk.id === skillId) : list[0];
  if (!skill) return [];
  const out = [];
  for (let i = 0; i < SIZE(state); i += 1) {
    const owner = state.stones[i];
    switch (skill.targets[0]) {
      case 'enemyStone':
        // 火花だけは結界付きの相手石も選べる（§2・§4）
        if (owner !== 0 && owner !== seat
          && (!state.guards[i] || (skill.id === 'spark' && sparkBreaksWard(state)))) out.push(i);
        break;
      case 'ownStone':
        if (owner === seat && !(skill.id === 'ward' && state.guards[i])) out.push(i);
        break;
      case 'empty':
        if (owner === 0 && !isFrozen(state, i)) out.push(i);
        break;
      default:
        break;
    }
  }
  if (skill.targets.length > 1) {
    // 移動系は移動先がある石だけを候補にする
    return out.filter((i) => skillSecondTargets(state, i).length > 0);
  }
  return out;
}


/** UI 用：移動系スキルの移動先候補 */
function skillSecondTargets(state, fromIndex) {
  return neighborsOf(state, fromIndex).filter((i) => state.stones[i] === 0 && !isFrozen(state, i));
}

/** UI 用：その席が使える技を、使えるかどうかの理由つきで並べる */
function usableSkills(state, seat) {
  const v = v99Of(state);
  return skillsOf(state, seat).map((skill) => {
    const form = v ? v99FormOf(state, seat, skill.id) : null;
    const cost = form ? form.cost : skill.cost;
    const maxUses = v ? usesCapOf(state, seat, skill.id) : skill.uses;
    const left = Math.max(0, maxUses - usesOf(state, seat, skill.id));
    let code = null;
    if (state.status !== 'playing') code = ERR.NOT_PLAYING;
    else if (state.turn !== Number(seat)) code = ERR.NOT_YOUR_TURN;
    else if (state.pending && state.pending.remaining > 0) code = ERR.NEED_EXTRA;
    else if (form && form.locked) code = ERR.SKILL_LOCKED;
    else if (left <= 0) code = ERR.NO_USES_LEFT;
    else if (state.energy[seat] < cost) code = ERR.NOT_ENOUGH_ENERGY;
    else if (skillFirstTargets(state, seat, skill.id).length === 0) code = ERR.BAD_TARGET;
    return {
      skill, left, used: usesOf(state, seat, skill.id), ok: !code, code,
      cost, extra: form ? form.extra : 0, locked: !!form?.locked,
      turnsToUnlock: v ? Math.max(0, unlockTurnOf(state, seat) - (state.turnsTaken?.[seat] || 0)) : 0,
    };
  });
}

/**
 * その席がスキルを使えるか。
 * skillId を渡すとその技だけを見る。省略するとどれか1つでも使えれば ok。
 */
function canUseSkill(state, seat, skillId = null) {
  const list = usableSkills(state, seat);
  if (!list.length) return { ok: false, code: ERR.NO_SKILL };
  if (skillId) {
    const one = list.find((x) => x.skill.id === skillId);
    if (!one) return { ok: false, code: ERR.NO_SKILL };
    return one.ok ? { ok: true } : { ok: false, code: one.code };
  }
  const usable = list.find((x) => x.ok);
  if (usable) return { ok: true };
  return { ok: false, code: list[0].code };
}

function mustPass(state) {
  return state.status === 'playing' && legalPlacements(state).length === 0;
}

/* ─────────────────────────── CPU ─────────────────────────── */

const SCORE_TABLE = { 1: 1, 2: 12, 3: 140, 4: 1800 };

function runScoreFor(state, index, owner) {
  let best = 0;
  let total = 0;
  const { col, row } = toCoord(state, index);
  for (const [dc, dr] of LINE_DIRS) {
    let count = 1;
    let openEnds = 0;
    for (const sign of [1, -1]) {
      let c = col + dc * sign;
      let r = row + dr * sign;
      while (within(state, c, r) && state.stones[toIndex(state, c, r)] === owner) {
        count += 1;
        c += dc * sign;
        r += dr * sign;
      }
      if (within(state, c, r) && state.stones[toIndex(state, c, r)] === 0) openEnds += 1;
    }
    best = Math.max(best, count);
    if (count >= WIN_LENGTH) {
      total += 1_000_000;
    } else {
      const base = SCORE_TABLE[Math.min(count, 4)] || 1;
      total += base * (openEnds === 2 ? 3 : openEnds === 1 ? 1 : 0.15);
    }
  }
  return { total, best };
}

/**
 * CPU の着手を選ぶ。通常着手と、必要な場合のパスのみ（スキルは使わない）。
 * @returns {{type:'place', seat:number, index:number} | {type:'pass', seat:number} | null}
 */
/* ── V99：窓（5連の候補）を使う探索 ── */

const WINDOW_CACHE = new Map();

/** その盤面サイズの「5つ並びの窓」一覧 */
function windowsOf(state) {
  const w = W(state); const h = H(state);
  const key = `${w}x${h}`;
  if (WINDOW_CACHE.has(key)) return WINDOW_CACHE.get(key);
  const out = [];
  for (const [dc, dr] of LINE_DIRS) {
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        const cells = [];
        let ok = true;
        for (let k = 0; k < WIN_LENGTH; k += 1) {
          const cc = c + dc * k; const rr = r + dr * k;
          if (!within(state, cc, rr)) { ok = false; break; }
          cells.push(toIndex(state, cc, rr));
        }
        if (ok) out.push(cells);
      }
    }
  }
  WINDOW_CACHE.set(key, out);
  return out;
}

/**
 * seat が「置ける空点を k 個まで埋めて」五連にできる窓を探す。
 * @returns {number[]|null} 埋めるべき空点（少ない順に最良の1つ）
 */
function fillWinCells(state, seat, k, banned = null) {
  if (k < 1) return null;
  let best = null;
  for (const win of windowsOf(state)) {
    let mine = 0; const gaps = [];
    let ok = true;
    for (const i of win) {
      const v = state.stones[i];
      if (v === seat) { mine += 1; continue; }
      if (v !== 0) { ok = false; break; }
      if (isFrozen(state, i)) { ok = false; break; }
      if (banned != null && i === banned) { ok = false; break; }
      gaps.push(i);
      if (gaps.length > k) { ok = false; break; }
    }
    if (!ok || mine + gaps.length < WIN_LENGTH || gaps.length === 0) continue;
    if (!best || gaps.length < best.length) best = gaps;
    if (best.length === 1) break;
  }
  return best;
}

/** その席が1手で五連にできる空点 */
function immediateWinCells(state, seat) {
  const out = [];
  for (const win of windowsOf(state)) {
    let mine = 0; let gap = -1; let ok = true;
    for (const i of win) {
      const v = state.stones[i];
      if (v === seat) { mine += 1; continue; }
      if (v !== 0) { ok = false; break; }
      if (gap >= 0) { ok = false; break; }
      gap = i;
    }
    if (ok && mine === WIN_LENGTH - 1 && gap >= 0 && canPlaceAt(state, gap)) out.push(gap);
  }
  return out;
}

/** 相手石も氷結も無い窓のうち、自石がいちばん多いものの空点 */
function bestCleanWindowCell(state, seat, banned = null) {
  let best = -1; let bestKey = -Infinity;
  for (const win of windowsOf(state)) {
    let mine = 0; const gaps = [];
    let ok = true;
    for (const i of win) {
      const v = state.stones[i];
      if (v === seat) { mine += 1; continue; }
      if (v !== 0) { ok = false; break; }
      if (isFrozen(state, i)) { ok = false; break; }
      gaps.push(i);
    }
    if (!ok || gaps.length === 0) continue;
    const key = mine * 100 - gaps.length * 10;
    if (key <= bestKey) continue;
    for (const g of gaps) {
      if (!canPlaceAt(state, g) || g === banned) continue;
      bestKey = key; best = g; break;
    }
  }
  return best >= 0 ? best : null;
}

/** 追加配置の置き先を1つ決める */
function chooseExtraIndex(state, seat) {
  const banned = state.pending?.banned ?? null;
  const win = fillWinCells(state, seat, 1, banned);
  if (win && win.length === 1) return win[0];
  const remaining = state.pending?.remaining ?? 1;
  const reach = fillWinCells(state, seat, remaining, banned);
  if (reach) { for (const c of reach) if (canPlaceAt(state, c) && c !== banned) return c; }
  const danger = dangerMap(state, seat);
  if (danger.size) {
    let best = -1; let bestV = -Infinity;
    for (const [cell, v] of danger) {
      if (!canPlaceAt(state, cell) || cell === banned) continue;
      if (v > bestV) { bestV = v; best = cell; }
    }
    if (best >= 0 && bestV >= 3) return best;
  }
  const clean = bestCleanWindowCell(state, seat, banned);
  if (clean != null) return clean;
  for (let i = 0; i < SIZE(state); i += 1) if (canPlaceAt(state, i) && i !== banned) return i;
  return null;
}

/**
 * その相手石が、自分の五連の窓をどれだけ塞いでいるか。
 * 「その石を取り除けば、自分の石と空きだけになる窓」のうち、
 * 自分の石が最も多い窓の自石数を返す（塞いでいなければ 0）。
 */
function blockerValue(state, seat, index) {
  const owner = state.stones[index];
  if (owner === 0 || owner === seat) return 0;
  let best = 0;
  for (const win of windowsOf(state)) {
    if (!win.includes(index)) continue;
    let mine = 0; let ok = true;
    for (const i of win) {
      if (i === index) continue;
      const v = state.stones[i];
      if (v === seat) { mine += 1; continue; }
      if (v !== 0) { ok = false; break; }
      if (isFrozen(state, i)) { ok = false; break; }
    }
    if (ok && mine > best) best = mine;
  }
  return best;
}

/** V99：技を使うときの「勝ちに直結しない本体」 */
function neutralSkillBody(state, seat, skillId) {
  const pick = (test, score) => {
    let best = -1; let bestS = -Infinity;
    for (let i = 0; i < SIZE(state); i += 1) {
      if (!test(i)) continue;
      const v = score(i);
      if (v > bestS) { bestS = v; best = i; }
    }
    return best;
  };
  switch (skillId) {
    case 'spark': {
      const breaks = sparkBreaksWard(state);
      const i = pick(
        (x) => state.stones[x] !== 0 && state.stones[x] !== seat && (breaks || !state.guards[x]),
        (x) => blockerValue(state, seat, x) * 10000
          + (breaks && state.guards[x] ? 5000 : 0)
          + runScoreFor(state, x, state.stones[x]).total,
      );
      return i < 0 ? null : { index: i };
    }
    case 'transmute': {
      const i = pick((x) => state.stones[x] !== 0 && state.stones[x] !== seat && !state.guards[x],
        (x) => runScoreFor(state, x, seat).total);
      return i < 0 ? null : { index: i };
    }
    case 'ward': {
      const i = pick((x) => state.stones[x] === seat && !state.guards[x],
        (x) => runScoreFor(state, x, seat).total);
      return i < 0 ? null : { index: i };
    }
    case 'freeze': {
      const i = pick((x) => state.stones[x] === 0 && !isFrozen(state, x), (x) => {
        let m = -Infinity;
        for (const o of seatNumbers(state)) if (o !== seat) m = Math.max(m, runScoreFor(state, x, o).total);
        return m;
      });
      return i < 0 ? null : { index: i };
    }
    case 'windwalk': {
      for (let i = 0; i < SIZE(state); i += 1) {
        if (state.stones[i] !== seat) continue;
        for (const to of neighborsOf(state, i)) {
          if (state.stones[to] === 0 && !isFrozen(state, to)) return { from: i, to };
        }
      }
      return null;
    }
    case 'pull': {
      for (let i = 0; i < SIZE(state); i += 1) {
        const v = state.stones[i];
        if (!v || v === seat || state.guards[i]) continue;
        for (const to of neighborsOf(state, i)) {
          if (state.stones[to] === 0 && !isFrozen(state, to)) return { from: i, to };
        }
      }
      return null;
    }
    default: return null;
  }
}

/** 相手が「次の自分の手番」で置ける石の数（まとめ置きの見積り） */
function burstOf(state, seat) {
  const v = v99Of(state);
  if (!v) return 1;
  const n = (state.turnsTaken?.[seat] || 0) + 1;
  if (n < unlockTurnOf(state, seat)) return 1;
  const st = seatOf(state, seat);
  const e = st ? v.enhance[st.charId] : null;
  if (!e) return 1;
  const pen = v.orderPenalty[orderIndexOf(state, seat)] || 0;
  const extra = Math.max(0, e.extra - pen);
  if (extra <= 0) return 1;
  const energy = Math.min(MAX_ENERGY, state.energy[seat] + 1);
  const skillId = SKILL_BY_CHARACTER[st.charId]?.id;
  let cap = usesCapOf(state, seat, skillId);
  if (n === unlockTurnOf(state, seat)) cap = Math.max(cap, usesOf(state, seat, skillId) + e.usesFloor);
  if (cap - usesOf(state, seat, skillId) <= 0 || energy < e.cost) return 1;
  return extra;
}

/**
 * 相手の脅威マップ。
 * 通常配置による即勝ちと、まとめ置きで届く窓の両方を数える。
 */
function dangerMap(state, seat) {
  const danger = new Map();
  const bump = (cell, v) => danger.set(cell, (danger.get(cell) || 0) + v);
  for (const o of seatNumbers(state)) {
    if (o === seat) continue;
    for (const c of immediateWinCells(state, o)) bump(c, 100);
    const burst = burstOf(state, o);
    if (burst < 2) continue;
    for (const win of windowsOf(state)) {
      let mine = 0; const gaps = [];
      let ok = true;
      for (const i of win) {
        const v = state.stones[i];
        if (v === o) { mine += 1; continue; }
        if (v !== 0 || isFrozen(state, i)) { ok = false; break; }
        gaps.push(i);
        if (gaps.length > burst) { ok = false; break; }
      }
      if (!ok || mine + gaps.length < WIN_LENGTH) continue;
      for (const g of gaps) bump(g, WIN_LENGTH + 1 - gaps.length);
    }
  }
  return danger;
}

/**
 * 技そのもので五連に届く手を探す。
 *  転光：窓の中の相手石1個を自分の石に変える
 *  引力：窓の中の相手石1個を窓の外へどかし、空いた交点を追加配置で埋める
 *  風渡り：窓の外の自石を窓の中へ動かし、残りを追加配置で埋める
 */
function skillWinPlan(state, seat, u) {
  const k = u.extra;
  const id = u.skill.id;
  if (id !== 'transmute' && id !== 'pull' && id !== 'windwalk') return null;

  for (const win of windowsOf(state)) {
    let mine = 0; const gaps = []; const foes = [];
    let ok = true;
    for (const i of win) {
      const v = state.stones[i];
      if (v === seat) { mine += 1; continue; }
      if (v !== 0) {
        if (state.guards[i]) { ok = false; break; }
        foes.push(i);
        if (foes.length > 1) { ok = false; break; }
        continue;
      }
      if (isFrozen(state, i)) { ok = false; break; }
      gaps.push(i);
    }
    if (!ok || mine + foes.length + gaps.length < WIN_LENGTH) continue;

    if (id === 'transmute' && foes.length === 1 && gaps.length <= k) {
      return { type: 'skill', seat, skillId: 'transmute', index: foes[0] };
    }
    if (id === 'pull' && foes.length === 1 && gaps.length + 1 <= k) {
      for (const to of neighborsOf(state, foes[0])) {
        if (win.includes(to)) continue;
        if (state.stones[to] !== 0 || isFrozen(state, to)) continue;
        return { type: 'skill', seat, skillId: 'pull', from: foes[0], to };
      }
    }
    if (id === 'windwalk' && foes.length === 0 && gaps.length === k + 1) {
      for (const g of gaps) {
        for (const nb of neighborsOf(state, g)) {
          if (state.stones[nb] !== seat || win.includes(nb)) continue;
          return { type: 'skill', seat, skillId: 'windwalk', from: nb, to: g };
        }
      }
    }
  }
  return null;
}

/** V99 のCPU。初期解放済みスキルと追加配置を扱う。 */
function chooseCpuActionV99(state, seat, rand) {
  // 追加配置の途中
  if (state.pending && state.pending.remaining > 0 && state.pending.seat === seat) {
    const i = chooseExtraIndex(state, seat);
    return i == null ? null : { type: 'extra', seat, index: i };
  }
  const spots = legalPlacements(state);
  if (spots.length === 0) return { type: 'pass', seat };

  // 1. 通常配置で勝てる
  const one = fillWinCells(state, seat, 1);
  if (one && one.length === 1) return { type: 'place', seat, index: one[0] };

  // 2. 技を使って勝てる
  const usable = usableSkills(state, seat).filter((u) => u.ok);
  for (const u of usable) {
    if (u.extra > 0) {
      const cells = fillWinCells(state, seat, u.extra);
      if (cells) {
        const body = neutralSkillBody(state, seat, u.skill.id);
        if (body) return { type: 'skill', seat, skillId: u.skill.id, ...body };
      }
    }
    const direct = skillWinPlan(state, seat, u);
    if (direct) return direct;
  }

  // 3. 相手の脅威を塞ぐ（即勝ちと、まとめ置きで届く窓の両方）
  const danger = dangerMap(state, seat);
  if (danger.size) {
    let best = -1; let bestV = -Infinity;
    for (const [cell, v] of danger) {
      if (!canPlaceAt(state, cell)) continue;
      const sc = v * 10000 + runScoreFor(state, cell, seat).total;
      if (sc > bestV) { bestV = sc; best = cell; }
    }
    if (best >= 0) {
      // 氷結なら自石を増やさずに塞げる（最少石数判定に有利）
      const fz = usable.find((u) => u.skill.id === 'freeze' && u.extra === 0);
      if (fz && state.stones[best] === 0 && !isFrozen(state, best)) {
        return { type: 'skill', seat, skillId: 'freeze', index: best };
      }
      return { type: 'place', seat, index: best };
    }
  }

  // 4. 強化形が使えるなら使って攻めを伸ばす
  const strong = usable.find((u) => u.extra > 0);
  if (strong) {
    const body = neutralSkillBody(state, seat, strong.skill.id);
    if (body) return { type: 'skill', seat, skillId: strong.skill.id, ...body };
  }

  // 5. いちばん育っている窓へ置く
  const clean = bestCleanWindowCell(state, seat);
  if (clean != null) return { type: 'place', seat, index: clean };
  return { type: 'place', seat, index: spots[Math.floor(rand() * spots.length) % spots.length] };
}

function chooseCpuAction(state, seat, rand = Math.random) {
  if (state.status !== 'playing' || state.turn !== seat) return null;
  if (v99Of(state)) return chooseCpuActionV99(state, seat, rand);
  const spots = legalPlacements(state);
  if (spots.length === 0) return { type: 'pass', seat };

  const opponents = seatNumbers(state).filter((s) => s !== seat);

  // 1. 自分が勝てる手
  for (const idx of spots) {
    if (runScoreFor(state, idx, seat).best >= WIN_LENGTH) return { type: 'place', seat, index: idx };
  }
  // 2. 相手の五連阻止
  for (const opp of opponents) {
    for (const idx of spots) {
      if (runScoreFor(state, idx, opp).best >= WIN_LENGTH) return { type: 'place', seat, index: idx };
    }
  }
  // 3. 評価値
  let bestScore = -Infinity;
  let bestList = [];
  const center = { col: (W(state) - 1) / 2, row: (H(state) - 1) / 2 };
  for (const idx of spots) {
    const mine = runScoreFor(state, idx, seat).total;
    let threat = 0;
    for (const opp of opponents) threat = Math.max(threat, runScoreFor(state, idx, opp).total);
    const { col, row } = toCoord(state, idx);
    const dist = Math.abs(col - center.col) + Math.abs(row - center.row);
    const score = mine * 1.15 + threat * 0.95 - dist * 0.6;
    if (score > bestScore + 1e-9) {
      bestScore = score;
      bestList = [idx];
    } else if (Math.abs(score - bestScore) <= 1e-9) {
      bestList.push(idx);
    }
  }
  const pick = bestList[Math.floor(rand() * bestList.length) % bestList.length];
  return { type: 'place', seat, index: pick };
}

/* ─────────────────────────── 公開ビュー ─────────────────────────── */

/** サーバーがクライアントへ配信するスナップショット（秘密値を含まない） */
function publicSnapshot(state) {
  return {
    matchId: state.matchId,
    mode: state.mode,
    ruleset: state.ruleset || RULESET.PVP_CURRENT,
    width: state.width,
    height: state.height,
    stones: state.stones,
    guards: state.guards,
    ice: state.ice,
    iceOwner: state.iceOwner,
    seats: state.seats.map((s) => ({
      seat: s.seat, name: s.name, charId: s.charId, kind: s.kind,
      userId: s.userId, cosmetics: s.cosmetics,
    })),
    turn: state.turn,
    energy: state.energy,
    skillUses: state.skillUses,
    stats: state.stats,
    opCount: state.opCount,
    ply: state.ply,
    startSeat: state.startSeat,
    order: state.order,
    orderPos: state.orderPos,
    turnsTaken: state.turnsTaken,
    usesCap: state.usesCap,
    pending: state.pending,
    revision: state.revision,
    eventSeq: state.eventSeq,
    status: state.status,
    result: state.result,
    lastAction: state.lastAction,
    events: state.events.slice(-6),
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
  };
}



return { BOARD_W, BOARD_H, BOARD_SIZE, indexToLabel, labelOf, ERR, ERR_MESSAGE_JA, errorMessage, createMatch, pickStartSeat, cloneState, isFrozen, frozenIndices, canPlaceAt, legalPlacements, emptyCount, neighborsOf, isAdjacent, findWinningLine, effectiveSkill, skillInRuleset, skillForSeat, minStoneResult, isWinnerSeat, outcomeForSeat, v99Of, orderIndexOf, unlockTurnOf, isEnhanced, v99FormOf, usesCapOf, v99Info, skillsOf, skillOfId, usesOf, applyAction, skillFirstTargets, skillSecondTargets, usableSkills, canUseSkill, mustPass, fillWinCells, immediateWinCells, chooseExtraIndex, chooseCpuAction, publicSnapshot };
});

__def("../../shared/story/engine.js", function (__req) {
/**
 * TRIAD — 物語モードの進行エンジン（1対1 / ルールセット story_seasons）
 *
 * 方針
 *  ・盤面の基本ルールは shared/rules.js をそのまま使う。3人対戦の挙動は変えない。
 *  ・物語固有の要素（予告技・修練盤・ボスの段階変化）はこのファイルに閉じる。
 *  ・DOM / Node 固有 API を参照しない（ブラウザとサーバーで同じ結果になる）。
 *
 * 予告技の扱い（統合仕様書 A-6）
 *  ・宣言した手番では盤面は変わらない。宣言がその手番の行動になる。
 *  ・次の敵の手番は、**予約済み行動だけを解決する**。
 *    防がれても、通常着手や別スキルを追加で実行しない。
 *  ・守り・氷結・対象消失などで防がれた場合も不発として、
 *    予定のエナジー・回数・手番を**消費する**。
 *  ・予告後に対象や優先順を変更しない。撃ち直しもしない。
 *  ・予告狙撃の使用回数は、そのキャラの火花と同じ2回の枠を共有する。
 */

const { createMatch, applyAction, cloneState, findWinningLine, emptyCount, chooseCpuAction, publicSnapshot, isFrozen, neighborsOf, labelOf, skillsOf, usesOf } = __req("../../shared/rules.js");
const { RULESET } = __req("../../shared/rulesets.js");
const { CHARACTER_BY_ID, SKILL_BY_CHARACTER, MAX_ENERGY, WIN_LENGTH, LINE_DIRS, BOARD_W } = __req("../../shared/constants.js");
const { STAGE_BY_ID, TRAINING_BOARD_BY_ID, TRAINING_BOARD_BY_STAGE, TELEGRAPH, TELEGRAPHS, bossPhasesOfStage, unlockedSkillsAt, unlockedCharsAt } = __req("../../shared/story/stages.js");

const PLAYER_SEAT = 1;
const ENEMY_SEAT = 2;

/* ───────────────────────── 生成 ───────────────────────── */

/**
 * 物語の1試合を作る。
 * 主人公は、そのステージまでに習得した術（最大6）を共有エナジーで使う。
 */
function createStoryMatch(opts) {
  const stage = STAGE_BY_ID[Number(opts.stageId)];
  if (!stage) throw new Error(`未知のステージ: ${opts.stageId}`);

  const board = stage.training ? TRAINING_BOARD_BY_ID[stage.training] : TRAINING_BOARD_BY_STAGE[stage.id];
  // 使える術は、そのステージの解放予定まで。修練盤は盤ごとの指定を優先する。
  const skills = board && Array.isArray(board.skills)
    ? board.skills.filter((id) => unlockedSkillsAt(stage.id).includes(id))
    : unlockedSkillsAt(stage.id);

  // 見た目に使うキャラクター（術は skills が持つ）
  const masters = unlockedCharsAt(stage.id);
  let charId = opts.charId && CHARACTER_BY_ID[opts.charId] ? opts.charId : null;
  if (!charId) charId = masters[masters.length - 1] || 'hibana';

  const state = createMatch({
    matchId: String(opts.matchId || `story-${stage.id}-${opts.startedAt ?? Date.now()}`),
    mode: 'story',
    ruleset: RULESET.STORY,
    startedAt: opts.startedAt,
    seats: [
      {
        seat: PLAYER_SEAT,
        name: String(opts.playerName || 'あなた'),
        charId,
        kind: 'human',
        cosmetics: opts.cosmetics ?? null,
        skills,
      },
      {
        seat: ENEMY_SEAT,
        name: stage.enemy.name,
        charId: stage.enemy.charId,
        kind: 'cpu',
      },
    ],
  });

  state.story = {
    stageId: stage.id,
    chapter: stage.chapter,
    boss: !!stage.boss,
    level: stage.enemy.level,
    trainingId: board ? board.id : null,
    enemyTurns: 0,
    phase: 0,
    telegraph: null,
    telegraphUses: { [TELEGRAPH.SNIPE]: 0, [TELEGRAPH.SEIZE]: 0 },
    scriptIndex: 0,
    script: board ? [...(board.enemyScript || [])] : [],
    allowedTelegraphs: [...(stage.telegraphs || [])],
    skills: [...skills],
    cleared: false,
  };

  if (board) applyTrainingBoard(state, board);
  return state;
}

function applyTrainingBoard(state, board) {
  for (const i of board.player) state.stones[i] = PLAYER_SEAT;
  for (const i of board.enemy) state.stones[i] = ENEMY_SEAT;
  for (const i of board.playerGuards || []) {
    if (state.stones[i] === PLAYER_SEAT) state.guards[i] = 1;
  }
  for (const seat of [PLAYER_SEAT, ENEMY_SEAT]) {
    const v = Number(board.energy?.[seat] ?? 0);
    // 修練盤の指定値は初回の手番開始加算込み。ここへ重ねて加算しない。
    state.energy[seat] = Math.min(MAX_ENERGY, Math.max(0, v));
  }
  // 置いてある石は「打った石」として数えない（途中局面の再現のため）
  state.stats[PLAYER_SEAT].placed = 0;
  state.stats[ENEMY_SEAT].placed = 0;
  if (board.telegraph) {
    state.story.telegraph = {
      id: board.telegraph.id,
      targets: [...(board.telegraph.targets || [])],
      seat: Number(board.telegraph.by ?? ENEMY_SEAT),
      declaredAt: -1, // 開始前に予告済み。敵の最初の手番で解決する。
    };
  }
  state.turn = PLAYER_SEAT;
}

/* ───────────────────────── 内部ヘルパ ───────────────────────── */

function pushStoryEvent(state, ev) {
  state.eventSeq += 1;
  const full = { ...ev, id: `${state.matchId}#s${state.eventSeq}`, seq: state.eventSeq, at: ev.at ?? Date.now() };
  state.events.push(full);
  if (state.events.length > 40) state.events.splice(0, state.events.length - 40);
  return full;
}

/** 盤面を変えたあとの決着判定。手番は進めない（予告の解決で使う）。 */
function settleBoard(state) {
  state.opCount += 1;
  state.revision += 1;
  const win = findWinningLine(state, 0);
  if (win) {
    state.status = 'finished';
    state.result = { kind: 'win', winner: win.owner, winners: [win.owner], line: win.line, reason: 'five' };
    state.finishedAt = Date.now();
    return true;
  }
  if (emptyCount(state) === 0) {
    state.status = 'finished';
    state.result = { kind: 'draw', winner: 0, winners: [], line: [], reason: 'board_full' };
    state.finishedAt = Date.now();
    return true;
  }
  return false;
}

/** 予告狙撃と火花は同じ2回の枠を共有する */
function usedForTelegraph(state, id) {
  const tg = TELEGRAPHS[id];
  const own = state.story.telegraphUses[id] || 0;
  // 旧保存では、技を1つだけ持つ席の skillUses は数値になっている。
  // そのため、実際に共有先の技を持つ敵だけ通常技の使用分を足す。
  if (tg.sharesUsesWith
    && skillsOf(state, ENEMY_SEAT).some((skill) => skill.id === tg.sharesUsesWith)) {
    return own + usesOf(state, ENEMY_SEAT, tg.sharesUsesWith);
  }
  return own;
}

function canTelegraph(state, id) {
  const tg = TELEGRAPHS[id];
  if (!tg) return false;
  if (!state.story.allowedTelegraphs.includes(id)) return false;
  if (state.story.telegraph) return false;               // 同時に1つだけ
  if (state.energy[ENEMY_SEAT] < tg.cost) return false;
  if (usedForTelegraph(state, id) >= tg.uses) return false;
  return true;
}

/** 予告の消費。防がれても不発でも、必ずここを通す（A-6）。 */
function consumeTelegraph(state, id) {
  const tg = TELEGRAPHS[id];
  state.energy[ENEMY_SEAT] = Math.max(0, state.energy[ENEMY_SEAT] - tg.cost);
  state.story.telegraphUses[id] = (state.story.telegraphUses[id] || 0) + 1;
}

/* ───────────────────────── 予告の解決 ───────────────────────── */

/**
 * 予告狙撃の対象を、予告した優先順から選ぶ。
 * 空の候補は飛ばし、最初に「相手の石がある」候補を対象にする。
 * その石が守られていても、別の石へ撃ち直さない（A-6・修練盤5）。
 */
function snipeTarget(state, targets) {
  for (const idx of targets) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= state.stones.length) continue;
    if (state.stones[idx] === PLAYER_SEAT) return idx;
  }
  return null;
}

/**
 * 敵の手番開始時に呼ぶ。予告があれば解決する。
 * 解決した手番は、それだけで敵の行動となる（通常着手を追加しない）。
 * @returns {{resolved:boolean, outcome:string|null, finished:boolean, event:object|null}}
 */
function resolveTelegraph(state) {
  const t = state.story.telegraph;
  if (!t) return { resolved: false, outcome: null, finished: false, event: null };
  // 宣言した手番と同じ手番では解決しない
  if (t.declaredAt >= 0 && t.declaredAt >= state.story.enemyTurns) {
    return { resolved: false, outcome: null, finished: false, event: null };
  }

  const tg = TELEGRAPHS[t.id];
  const targets = Array.isArray(t.targets) ? t.targets : [];
  state.story.telegraph = null;

  // 破損した旧保存や手編集データが紛れても、例外や盤外書込を起こさず
  // この敵手番だけを安全に消費する。未知の技は資源を消費しない。
  if (!tg) return { resolved: true, outcome: 'invalid', finished: false, event: null };

  // 消費は結果によらず必ず行う（防がれても不発でも）
  consumeTelegraph(state, t.id);

  const done = (outcome, text, index, finished = false) => {
    const ev = pushStoryEvent(state, {
      type: 'telegraph',
      phase: outcome,
      seat: ENEMY_SEAT,
      telegraphId: t.id,
      telegraphName: tg.name,
      index: index ?? null,
      label: index != null ? labelOf(state, index) : null,
      text,
    });
    return { resolved: true, outcome, finished, event: ev };
  };

  if (t.id === TELEGRAPH.SNIPE) {
    const idx = snipeTarget(state, targets);
    if (idx == null) return done('missed', `${tg.name}は空を撃った。`, targets[0] ?? null);
    if (state.guards[idx]) return done('blocked', `${tg.name}は守りに防がれた。`, idx);
    state.stones[idx] = 0;
    state.guards[idx] = 0;
    const finished = settleBoard(state);
    return done('hit', `${tg.name}が命中した。`, idx, finished);
  }

  // 予告占領：予告した地点1つを見る
  const idx = targets[0];
  if (!Number.isInteger(idx) || idx < 0 || idx >= state.stones.length) {
    return done('missed', `${tg.name}は的を失った。`, null);
  }
  if (isFrozen(state, idx)) return done('frozen', `${tg.name}は氷結に阻まれた。`, idx);
  if (state.stones[idx] === ENEMY_SEAT) return done('missed', `${tg.name}はすでに自分の石だった。`, idx);
  if (state.stones[idx] === PLAYER_SEAT) {
    if (state.guards[idx]) return done('blocked', `${tg.name}は守りに防がれた。`, idx);
    state.stones[idx] = ENEMY_SEAT;
    state.guards[idx] = 0;
    const finished = settleBoard(state);
    return done('hit', `${tg.name}で石を奪われた。`, idx, finished);
  }
  // 空き交点なら敵の石を置く
  state.stones[idx] = ENEMY_SEAT;
  state.guards[idx] = 0;
  state.stats[ENEMY_SEAT].placed += 1;
  const finished = settleBoard(state);
  return done('hit', `${tg.name}で ${labelOf(state, idx)} を占領された。`, idx, finished);
}

/* ───────────────────────── ボスの段階変化 ───────────────────────── */

/**
 * 敵の n 手目開始時の見た目変化。
 * 見た目と台詞だけを変え、盤面・エナジー・使用回数・予告状態には一切触れない。
 */
function applyBossPhase(state) {
  if (!state.story.boss) return null;
  const phases = bossPhasesOfStage(state.story.stageId);
  const turn = state.story.enemyTurns + 1; // これから始まる手番
  const hit = phases.find((p) => p.atEnemyTurn === turn);
  if (!hit) return null;
  const step = phases.indexOf(hit) + 1;
  if (state.story.phase >= step) return null;
  state.story.phase = step;
  return pushStoryEvent(state, {
    type: 'boss_phase', seat: ENEMY_SEAT, phase: step,
    look: hit.look, text: hit.line,
  });
}

/* ───────────────────────── 敵の思考 ───────────────────────── */

function lineRun(state, index, owner) {
  let best = 1;
  const col = index % BOARD_W;
  const row = Math.floor(index / BOARD_W);
  for (const [dc, dr] of LINE_DIRS) {
    let count = 1;
    for (const sign of [1, -1]) {
      let c = col + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < BOARD_W && r >= 0 && r < state.height
        && state.stones[r * BOARD_W + c] === owner) {
        count += 1; c += dc * sign; r += dr * sign;
      }
    }
    best = Math.max(best, count);
  }
  return best;
}

/** その点を敵が取ると五連になるか（空点・主人公の石の両方を見る） */
function seizeWins(state, index) {
  if (state.guards[index]) return false;
  if (state.stones[index] === ENEMY_SEAT) return false;
  if (isFrozen(state, index)) return false;
  const probe = cloneState(state);
  probe.stones[index] = ENEMY_SEAT;
  return lineRun(probe, index, ENEMY_SEAT) >= WIN_LENGTH;
}

/** 主人公の「あと1手で五」を作っている石のうち、消せば止まるもの */
function sniperTarget(state) {
  const cands = [];
  for (let i = 0; i < state.stones.length; i += 1) {
    if (state.stones[i] !== PLAYER_SEAT || state.guards[i]) continue;
    const run = lineRun(state, i, PLAYER_SEAT);
    if (run >= WIN_LENGTH - 1) cands.push({ index: i, run });
  }
  cands.sort((a, b) => b.run - a.run || a.index - b.index);
  return cands.length ? cands[0] : null;
}

function chooseEnemyAction(state, rand = Math.random) {
  const st = state.story;

  // 1. 修練盤の指定手順
  while (st.scriptIndex < st.script.length) {
    const idx = st.script[st.scriptIndex];
    st.scriptIndex += 1;
    if (state.stones[idx] === 0 && !isFrozen(state, idx)) {
      return { kind: 'action', action: { type: 'place', seat: ENEMY_SEAT, index: idx } };
    }
  }

  const level = st.level || 1;

  // 2. 予告技（レベル5以上・そのステージで許可されている場合のみ）
  if (level >= 5) {
    if (canTelegraph(state, TELEGRAPH.SEIZE)) {
      for (let i = 0; i < state.stones.length; i += 1) {
        if (seizeWins(state, i)) return { kind: 'telegraph', id: TELEGRAPH.SEIZE, targets: [i] };
      }
    }
    if (canTelegraph(state, TELEGRAPH.SNIPE)) {
      const t = sniperTarget(state);
      if (t && t.run >= WIN_LENGTH - 1) return { kind: 'telegraph', id: TELEGRAPH.SNIPE, targets: [t.index] };
    }
  }

  // 3. 自分のキャラのスキル（レベル4以上）
  if (level >= 4) {
    const skillAction = chooseEnemySkill(state);
    if (skillAction) return { kind: 'action', action: skillAction };
  }

  // 4. 通常の思考
  const action = chooseCpuAction(state, ENEMY_SEAT, rand);
  return action ? { kind: 'action', action } : { kind: 'none' };
}

function chooseEnemySkill(state) {
  const list = skillsOf(state, ENEMY_SEAT);
  const skill = list[0];
  if (!skill) return null;
  if (state.energy[ENEMY_SEAT] < skill.cost) return null;
  if (usesOf(state, ENEMY_SEAT, skill.id) >= skill.uses) return null;

  const size = state.stones.length;
  switch (skill.id) {
    case 'transmute': {
      for (let i = 0; i < size; i += 1) {
        if (state.stones[i] === PLAYER_SEAT && seizeWins(state, i)) {
          return { type: 'skill', seat: ENEMY_SEAT, skillId: 'transmute', index: i };
        }
      }
      return null;
    }
    case 'spark': {
      const t = sniperTarget(state);
      if (t && t.run >= WIN_LENGTH - 1) return { type: 'skill', seat: ENEMY_SEAT, skillId: 'spark', index: t.index };
      return null;
    }
    case 'ward': {
      for (let i = 0; i < size; i += 1) {
        if (state.stones[i] !== ENEMY_SEAT || state.guards[i]) continue;
        if (lineRun(state, i, ENEMY_SEAT) >= WIN_LENGTH - 1) return { type: 'skill', seat: ENEMY_SEAT, skillId: 'ward', index: i };
      }
      return null;
    }
    case 'pull': {
      const t = sniperTarget(state);
      if (!t) return null;
      const dest = neighborsOf(state, t.index).find((d) => state.stones[d] === 0 && !isFrozen(state, d));
      if (dest === undefined) return null;
      return { type: 'skill', seat: ENEMY_SEAT, skillId: 'pull', from: t.index, to: dest };
    }
    case 'windwalk':
      return null; // 通常の着手のほうが強いので使わない
    case 'freeze': {
      for (let i = 0; i < size; i += 1) {
        if (state.stones[i] !== 0 || isFrozen(state, i)) continue;
        if (lineRun(state, i, PLAYER_SEAT) >= WIN_LENGTH) return { type: 'skill', seat: ENEMY_SEAT, skillId: 'freeze', index: i };
      }
      return null;
    }
    default:
      return null;
  }
}

/* ───────────────────────── 手番の実行 ───────────────────────── */

function applyPlayerAction(state, action) {
  if (Number(action?.seat ?? PLAYER_SEAT) !== PLAYER_SEAT) {
    return { ok: false, code: 'not_your_turn', message: 'あなたの手番ではありません。' };
  }
  const res = applyAction(state, { ...action, seat: PLAYER_SEAT });
  if (!res.ok) return res;
  res.state.story = cloneStory(state.story);
  return res;
}

function cloneStory(story) {
  return JSON.parse(JSON.stringify(story));
}

/** 盤面を変えずに手番だけ渡す（予告の宣言・解決で使う） */
function passTurnToPlayer(state) {
  state.opCount += 1;
  state.revision += 1;
  state.turn = PLAYER_SEAT;
  state.energy[PLAYER_SEAT] = Math.min(MAX_ENERGY, state.energy[PLAYER_SEAT] + 1);
  for (let i = 0; i < state.ice.length; i += 1) {
    if (state.ice[i] > 0 && state.opCount >= state.ice[i]) {
      state.ice[i] = 0;
      state.iceOwner[i] = 0;
    }
  }
}

/**
 * 敵の手番を1つ進める。
 *  ① ボスの段階変化（見た目のみ）
 *  ② 予告があれば解決する。**解決したらその手番は終わり**（通常着手はしない）
 *  ③ 予告が無ければ、通常の行動を1つ
 */
function runEnemyTurn(state, rand = Math.random) {
  let next = cloneState(state);
  next.story = cloneStory(state.story);
  const events = [];
  if (next.status !== 'playing' || next.turn !== ENEMY_SEAT) return { state: next, events };

  // ① 見た目の段階変化（盤面・エナジー・使用回数には触れない）
  const phaseEv = applyBossPhase(next);
  if (phaseEv) events.push(phaseEv);

  // ② 予告の解決。解決した場合、この手番はそれで終わり。
  const tg = resolveTelegraph(next);
  if (tg.resolved) {
    if (tg.event) events.push(tg.event);
    next.story.enemyTurns += 1;
    if (!tg.finished) {
      // 命中して盤面が変わった場合、settleBoard で opCount は進んでいる。
      // 不発の場合も1手番を消費するので、手番だけを渡す。
      if (tg.outcome === 'hit') {
        next.turn = PLAYER_SEAT;
        next.energy[PLAYER_SEAT] = Math.min(MAX_ENERGY, next.energy[PLAYER_SEAT] + 1);
        for (let i = 0; i < next.ice.length; i += 1) {
          if (next.ice[i] > 0 && next.opCount >= next.ice[i]) { next.ice[i] = 0; next.iceOwner[i] = 0; }
        }
      } else {
        passTurnToPlayer(next);
      }
    }
    return { state: next, events };
  }

  // ③ 行動
  const choice = chooseEnemyAction(next, rand);
  if (choice.kind === 'telegraph') {
    const def = TELEGRAPHS[choice.id];
    next.story.telegraph = {
      id: choice.id,
      targets: [...choice.targets],
      seat: ENEMY_SEAT,
      declaredAt: next.story.enemyTurns,
    };
    events.push(pushStoryEvent(next, {
      type: 'telegraph', phase: 'declared', seat: ENEMY_SEAT,
      telegraphId: choice.id, telegraphName: def.name,
      index: choice.targets[0],
      label: choice.targets.map((i) => labelOf(next, i)).join('→'),
      text: `${def.name}。次の手番で ${choice.targets.map((i) => labelOf(next, i)).join(' → ')} を狙う。`,
    }));
    // 宣言はその手番の行動。盤面は変えずに手番を渡す。
    next.story.enemyTurns += 1;
    passTurnToPlayer(next);
    return { state: next, events };
  }

  if (choice.kind === 'none') {
    next.story.enemyTurns += 1;
    return { state: next, events };
  }

  const res = applyAction(next, choice.action);
  if (!res.ok) {
    const fallback = chooseCpuAction(next, ENEMY_SEAT, rand);
    const res2 = fallback ? applyAction(next, fallback) : { ok: false };
    if (!res2.ok) {
      next.story.enemyTurns += 1;
      return { state: next, events };
    }
    res2.state.story = next.story;
    next = res2.state;
    events.push(res2.event);
  } else {
    res.state.story = next.story;
    next = res.state;
    events.push(res.event);
  }
  next.story.enemyTurns += 1;
  return { state: next, events };
}

/* ───────────────────────── 表示用 ───────────────────────── */

function storySnapshot(state) {
  const base = publicSnapshot(state);
  const st = state.story || null;
  return {
    ...base,
    story: st && {
      stageId: st.stageId,
      chapter: st.chapter,
      boss: st.boss,
      trainingId: st.trainingId,
      enemyTurns: st.enemyTurns,
      phase: st.phase,
      skills: [...(st.skills || [])],
      // 予告は隠さない。プレイヤーが対処できることが前提の技のため。
      telegraph: st.telegraph
        ? { id: st.telegraph.id, targets: [...st.telegraph.targets] }
        : null,
      cleared: st.cleared,
    },
  };
}

function storyOutcome(state) {
  if (state.status !== 'finished') return null;
  const r = state.result;
  if (!r) return null;
  if (r.kind === 'win') return { outcome: r.winner === PLAYER_SEAT ? 'win' : 'lose', line: r.line };
  if (r.kind === 'aborted') return { outcome: 'aborted', line: [] };
  return { outcome: 'draw', line: [] };
}



return { TELEGRAPH, TELEGRAPHS, PLAYER_SEAT, ENEMY_SEAT, createStoryMatch, canTelegraph, resolveTelegraph, applyBossPhase, chooseEnemyAction, applyPlayerAction, runEnemyTurn, storySnapshot, storyOutcome };
});

__def("../../shared/story/stages.js", function (__req) {
/**
 * TRIAD — 物語「六つの碁印と失われた四季」ステージ表
 *
 * このファイルはデータのみ。DOM / Node 固有 API を参照しない。
 * 盤面ルールは shared/rules.js（ルールセット story_seasons）が扱う。
 *
 * ── 出典 ────────────────────────────────────────────────────
 *  統合仕様書 1.0 の A章に従う。
 *  仕様で確定している内容：
 *    ・全30ステージ／6章、ボスは 5・10・15・20・25・30
 *    ・各ステージの名称・敵名・季節・天候・時間帯・情景・学習内容（A-8）
 *    ・碁印の習得は 3・6・11・16・21・26（A-4）
 *    ・修練盤8面の配石・エナジー・基準手順（A-7）
 *    ・予告狙撃は Stage6・11・Boss10・Boss15、予告占領は Stage16・Boss20（A-6）
 *    ・報酬（通常3／ボスは再勝利と初回合計の二段）とドロップ表（A-12）
 *  仕様に明示が無く、こちらで補った内容（＝補足案。確定仕様ではない）：
 *    ・会話文の具体的な文言（物語・季節・学習内容は仕様どおり）
 *    ・各敵が使うキャラクター（＝敵の技構成）と強さの数値
 *    ・BGM の割り当てキー
 *  補足案は docs/STORY_SPEC_GAPS.md に一覧化してある。
 * ────────────────────────────────────────────────────────────
 */

const { BOARD_W } = __req("../../shared/constants.js");

/**
 * ステージデータの版。進行中 run を再開するときに、
 * 保存した盤が「どの版のステージ表で作られたか」を突き合わせるために持つ（A-14）。
 */
const STORY_DATA_VERSION = 2;

/** 表示座標（列 A〜K, 行 1〜17）から交点番号へ。index = (row-1) * 11 + col */
function ix(col, row) {
  const c = typeof col === 'string' ? col.toUpperCase().charCodeAt(0) - 65 : Number(col);
  return (Number(row) - 1) * BOARD_W + c;
}

/* ───────────────────────── 敵専用の予告技 ───────────────────────── */

/**
 * 予告技は「敵だけ」が使う（A-6）。
 *  ・宣言した手番では盤面が変わらない。宣言がその手番の行動。
 *  ・次の敵の手番は、予約済み行動だけを解決する。
 *    防がれても通常着手や別スキルを追加実行しない。
 *  ・守り・氷結・対象消失で防がれた場合も不発として、
 *    予定のエナジー・回数・手番を消費する。
 *  ・予告後に対象や優先順を変更しない。撃ち直しもしない。
 */
const TELEGRAPH = Object.freeze({
  SNIPE: 'snipe',
  SEIZE: 'seize',
});

const TELEGRAPHS = Object.freeze({
  [TELEGRAPH.SNIPE]: Object.freeze({
    id: TELEGRAPH.SNIPE,
    name: '予告狙撃',
    cost: 4,
    uses: 2,
    // 通常の火花と、合計2回までの枠を共有する
    sharesUsesWith: 'spark',
    resolve: 'nextEnemyTurnStart',
    desc: '予告した範囲の相手の石を1個消す。守りがあれば不発。',
  }),
  [TELEGRAPH.SEIZE]: Object.freeze({
    id: TELEGRAPH.SEIZE,
    name: '予告占領',
    cost: 6,
    uses: 1,
    sharesUsesWith: null,
    resolve: 'nextEnemyTurnStart',
    desc: '予告地点が空なら敵の石を置く。無防備な相手の石なら敵の石に変える。氷結中・守り付き・すでに敵の石なら不発。',
  }),
});

/* ───────────────────────── 碁印（習得） ───────────────────────── */

const SKILL_UNLOCKS = Object.freeze([
  { stage: 3, charId: 'hibana', skillId: 'spark', sealName: '火花', master: 'ヒバナ' },
  { stage: 6, charId: 'mamori', skillId: 'ward', sealName: '結界', master: 'マモリ' },
  { stage: 11, charId: 'hayate', skillId: 'windwalk', sealName: '風渡り', master: 'ハヤテ' },
  { stage: 16, charId: 'yukine', skillId: 'freeze', sealName: '氷結', master: 'ユキネ' },
  { stage: 21, charId: 'kuon', skillId: 'pull', sealName: '引力', master: 'クオン' },
  { stage: 26, charId: 'akari', skillId: 'transmute', sealName: '転光', master: 'アカリ' },
]);

const SKILL_UNLOCK_BY_STAGE = Object.freeze(
  Object.fromEntries(SKILL_UNLOCKS.map((u) => [u.stage, u])),
);

/** 集める碁印（A-2）。ボスを解放するたびに1つ灯る。 */
const SEALS = Object.freeze([
  { stage: 5, id: 'harume', name: '春芽の碁印' },
  { stage: 10, id: 'wakaba', name: '若葉の碁印' },
  { stage: 15, id: 'enyo', name: '炎陽の碁印' },
  { stage: 20, id: 'shugetsu', name: '秋月の碁印' },
  { stage: 25, id: 'yukiboshi', name: '雪星の碁印' },
  { stage: 30, id: 'akatsuki', name: '暁の碁印' },
]);
const SEAL_BY_STAGE = Object.freeze(Object.fromEntries(SEALS.map((s) => [s.stage, s])));

/** ステージ n の開始時点で習得済みのキャラクター（師） */
function unlockedCharsAt(stage) {
  return SKILL_UNLOCKS.filter((u) => u.stage <= Number(stage)).map((u) => u.charId);
}

/**
 * ステージ n で使える術のID一覧。
 * 主人公は習得済みの術（最大6）を共有エナジーで使う。
 * そのステージの解放予定までに制限する（後半で覚えた術を前半へ持ち込まない）。
 */
function unlockedSkillsAt(stage) {
  return SKILL_UNLOCKS.filter((u) => u.stage <= Number(stage)).map((u) => u.skillId);
}

/* ───────────────────────── 章 ───────────────────────── */

const CHAPTERS = Object.freeze([
  {
    id: 1, name: '春の里と盗まれた暦', stages: [1, 2, 3, 4, 5], boss: 5,
    season: 'spring', bgm: 'story-spring',
    lead: '春の寺で五目を学ぶ日々のさなか、季節暦が盗まれた。',
  },
  {
    id: 2, name: '若葉の結界と雷の社', stages: [6, 7, 8, 9, 10], boss: 10,
    season: 'rainy', bgm: 'story-rain',
    lead: '若葉の森を抜け、鳴りやまぬ雷の社へ向かう。',
  },
  {
    id: 3, name: '炎陽の山と竜の翼', stages: [11, 12, 13, 14, 15], boss: 15,
    season: 'summer', bgm: 'story-summer',
    lead: '夏の山は風が要る。翼を持つものたちの領域へ。',
  },
  {
    id: 4, name: '秋月の森と時知らずの霜', stages: [16, 17, 18, 19, 20], boss: 20,
    season: 'autumn', bgm: 'story-autumn',
    lead: '秋のただなかに、季節はずれの霜が降りはじめた。',
  },
  {
    id: 5, name: '雪星の峰と古龍の誓い', stages: [21, 22, 23, 24, 25], boss: 25,
    season: 'winter', bgm: 'story-winter',
    lead: '雪の峰の上には、星と、古い誓いが残っている。',
  },
  {
    id: 6, name: '暁の城と還る四季', stages: [26, 27, 28, 29, 30], boss: 30,
    season: 'all', bgm: 'story-final',
    lead: '六つの術を携えて、四季を止めた者の城へ。',
  },
]);

const CHAPTER_BY_ID = Object.freeze(
  Object.fromEntries(CHAPTERS.map((c) => [c.id, c])),
);

/* ───────────────────────── 修練盤（A-7） ───────────────────────── */

/**
 * 修練盤は「配置・エナジーを準備した練習」。
 *  player / enemy … 交点番号の配列（seat1 = 主人公, seat2 = 敵）
 *  playerGuards   … 開始時に守りが付いている主人公の石
 *  energy         … 開始時のエナジー（初回の手番開始加算込みの値）
 *  skills         … その盤で主人公が使える術（省略時はステージの習得済み）
 *  enemyScript    … 敵の着手を順に固定する（尽きたら通常の思考へ）
 *  telegraph      … 開始時点で予告済みの技。targets は優先順の並び
 *  reference      … 基準手順（表示・自動検証に使う）
 *
 * 基準手順の記法：
 *   { by:'player', type:'place', index }
 *   { by:'player', type:'skill', skillId, index }        … 火花 / 結界 / 氷結 / 転光
 *   { by:'player', type:'skill', skillId, from, to }     … 風渡り / 引力
 *   { by:'enemy',  type:'place', index }
 *   { by:'enemy',  type:'telegraph', id }                … 予告の解決
 */
const TRAINING_BOARDS = Object.freeze([
  {
    id: 'tb-01',
    stage: 1,
    title: '一の修練盤 ── 五つ並べる',
    goal: '横に並んだ四つの石を、五つにする。',
    hint: 'D9 から G9 まで自分の石が四つ並んでいる。両端の H9 と C9 のどちらでも五つになる。',
    player: [ix('D', 9), ix('E', 9), ix('F', 9), ix('G', 9)],
    enemy: [ix('A', 3), ix('C', 3), ix('E', 3)],
    playerGuards: [],
    energy: { 1: 1, 2: 0 },
    skills: [],                       // Stage1〜2 は術なし
    telegraph: null,
    enemyScript: [],
    winPoints: [ix('H', 9), ix('C', 9)],
    reference: [
      { by: 'player', type: 'place', index: ix('H', 9), note: 'H9 に置いて D9〜H9 の五つ。' },
    ],
  },
  {
    id: 'tb-02',
    stage: 2,
    title: '二の修練盤 ── 相手の四を先に止める',
    goal: '相手の四連を止めてから、自分の五を作る。',
    hint: '相手は E5 から H5 まで四つ。左は自分の D5 が塞いでいるので、伸びる先は I5 だけ。',
    player: [ix('D', 5), ix('D', 11), ix('E', 11), ix('F', 11)],
    enemy: [ix('E', 5), ix('F', 5), ix('G', 5), ix('H', 5)],
    playerGuards: [],
    energy: { 1: 1, 2: 0 },
    skills: [],
    telegraph: null,
    enemyScript: [ix('A', 2), ix('C', 11)],
    winPoints: [],
    reference: [
      { by: 'player', type: 'place', index: ix('I', 5), note: 'I5 を塞ぐ。左は D5 なので相手の列は死ぬ。' },
      { by: 'enemy', type: 'place', index: ix('A', 2) },
      { by: 'player', type: 'place', index: ix('G', 11), note: 'D11〜G11 で四つ。' },
      { by: 'enemy', type: 'place', index: ix('C', 11) },
      { by: 'player', type: 'place', index: ix('H', 11), note: 'H11 で五つ。' },
    ],
  },
  {
    id: 'tb-03',
    stage: 3,
    title: '三の修練盤 ── 火花',
    goal: '両端が空いた相手の四連を、火花で崩す。',
    hint: '相手の D5〜G5 は C5 と H5 の両方が空いている。石を1個置いても両方は止められない。',
    player: [ix('D', 11), ix('E', 11), ix('F', 11)],
    enemy: [ix('D', 5), ix('E', 5), ix('F', 5), ix('G', 5)],
    playerGuards: [],
    energy: { 1: 4, 2: 0 },
    skills: ['spark'],
    telegraph: null,
    enemyScript: [ix('A', 2), ix('C', 11)],
    winPoints: [],
    reference: [
      { by: 'player', type: 'skill', skillId: 'spark', index: ix('E', 5), note: 'E5 を消して四連を割る。' },
      { by: 'enemy', type: 'place', index: ix('A', 2) },
      { by: 'player', type: 'place', index: ix('G', 11), note: 'D11〜G11 で四つ。' },
      { by: 'enemy', type: 'place', index: ix('C', 11) },
      { by: 'player', type: 'place', index: ix('H', 11), note: 'H11 で五つ。' },
    ],
  },
  {
    id: 'tb-04',
    stage: 6,
    title: '四の修練盤 ── 結界',
    goal: '予告された狙撃を結界で防ぎ、そのまま五つを作る。',
    hint: '結界を張った石は消せない。予告狙撃はそのまま不発になり、相手はその手番を失う。',
    player: [ix('D', 9), ix('E', 9), ix('G', 9)],
    enemy: [ix('A', 3), ix('C', 3), ix('E', 3)],
    playerGuards: [],
    energy: { 1: 2, 2: 4 },
    skills: ['spark', 'ward'],
    telegraph: { id: TELEGRAPH.SNIPE, targets: [ix('E', 9)], by: 2 },
    enemyScript: [ix('C', 9)],
    winPoints: [],
    reference: [
      { by: 'player', type: 'skill', skillId: 'ward', index: ix('E', 9), note: '狙われている E9 に結界を張る。' },
      { by: 'enemy', type: 'telegraph', id: TELEGRAPH.SNIPE, note: '守りで不発。エナジー・回数・手番を消費する。' },
      { by: 'player', type: 'place', index: ix('F', 9), note: 'D9〜G9 で四つ。' },
      { by: 'enemy', type: 'place', index: ix('C', 9) },
      { by: 'player', type: 'place', index: ix('H', 9), note: 'H9 で五つ。' },
    ],
  },
  {
    id: 'tb-05',
    stage: 11,
    title: '五の修練盤 ── 風渡り',
    goal: '守り付きの石を、狙われている場所へ動かす。',
    hint: '狙撃の範囲は F9 と G9、優先順は G9 → F9。守り付きの石を F9 へ運べば不発になる。',
    player: [ix('D', 9), ix('E', 9), ix('H', 9), ix('F', 8)],
    enemy: [ix('A', 3), ix('C', 3), ix('E', 3)],
    playerGuards: [ix('F', 8)],
    energy: { 1: 3, 2: 4 },
    skills: ['spark', 'ward', 'windwalk'],
    telegraph: { id: TELEGRAPH.SNIPE, targets: [ix('G', 9), ix('F', 9)], by: 2 },
    enemyScript: [],
    winPoints: [],
    reference: [
      { by: 'player', type: 'skill', skillId: 'windwalk', from: ix('F', 8), to: ix('F', 9), note: '守りごと F9 へ動かす。' },
      { by: 'enemy', type: 'telegraph', id: TELEGRAPH.SNIPE, note: 'G9 は空。次の候補 F9 は守り付きなので不発。撃ち直しはしない。' },
      { by: 'player', type: 'place', index: ix('G', 9), note: 'D9〜H9 で五つ。' },
    ],
  },
  {
    id: 'tb-06',
    stage: 16,
    title: '六の修練盤 ── 氷結',
    goal: '占領される地点を凍らせてから、自分の石で塞ぐ。',
    hint: 'いま I5 に置くと、予告占領で敵の石に変えられて相手の五連になる。先に凍らせる。',
    player: [ix('D', 5), ix('D', 11), ix('E', 11), ix('F', 11)],
    enemy: [ix('E', 5), ix('F', 5), ix('G', 5), ix('H', 5)],
    playerGuards: [ix('D', 5)],
    energy: { 1: 2, 2: 6 },
    skills: ['spark', 'ward', 'windwalk', 'freeze'],
    telegraph: { id: TELEGRAPH.SEIZE, targets: [ix('I', 5)], by: 2 },
    enemyScript: [ix('A', 2), ix('C', 11)],
    winPoints: [],
    reference: [
      { by: 'player', type: 'skill', skillId: 'freeze', index: ix('I', 5), note: 'I5 を凍らせる。' },
      { by: 'enemy', type: 'telegraph', id: TELEGRAPH.SEIZE, note: '氷結中なので不発。エナジー・回数・手番を消費する。' },
      { by: 'player', type: 'place', index: ix('I', 5), note: '自分の手番開始で解凍。改めて塞ぐ。' },
      { by: 'enemy', type: 'place', index: ix('A', 2) },
      { by: 'player', type: 'place', index: ix('G', 11), note: 'D11〜G11 で四つ。' },
      { by: 'enemy', type: 'place', index: ix('C', 11) },
      { by: 'player', type: 'place', index: ix('H', 11), note: 'H11 で五つ。' },
    ],
  },
  {
    id: 'tb-07',
    stage: 21,
    title: '七の修練盤 ── 引力',
    goal: '間に居座る相手の石を、隣へどかす。',
    hint: '引力は相手の石を動かすだけで、自分のものにはしない。空いた場所へは次の手番で置く。',
    player: [ix('D', 9), ix('E', 9), ix('G', 9), ix('H', 9)],
    enemy: [ix('F', 9), ix('A', 3), ix('C', 3), ix('E', 3)],
    playerGuards: [],
    energy: { 1: 4, 2: 0 },
    skills: ['spark', 'ward', 'windwalk', 'freeze', 'pull'],
    telegraph: null,
    enemyScript: [ix('A', 2)],
    winPoints: [ix('F', 9)],
    reference: [
      { by: 'player', type: 'skill', skillId: 'pull', from: ix('F', 9), to: ix('F', 8), note: 'F9 の相手の石を F8 へ。持ち主は相手のまま。' },
      { by: 'enemy', type: 'place', index: ix('A', 2) },
      { by: 'player', type: 'place', index: ix('F', 9), note: 'D9〜H9 で五つ。' },
    ],
  },
  {
    id: 'tb-08',
    stage: 26,
    title: '八の修練盤 ── 転光',
    goal: '列の中の相手の石を自分の石に変え、その一手で五つにする。',
    hint: '転光は置く手番を使わない。変えた瞬間に列がつながる。',
    player: [ix('D', 9), ix('E', 9), ix('G', 9), ix('H', 9)],
    enemy: [ix('F', 9), ix('D', 4), ix('E', 4), ix('F', 4), ix('G', 4)],
    playerGuards: [],
    energy: { 1: 6, 2: 0 },
    skills: ['spark', 'ward', 'windwalk', 'freeze', 'pull', 'transmute'],
    telegraph: null,
    enemyScript: [],
    winPoints: [ix('F', 9)],
    reference: [
      { by: 'player', type: 'skill', skillId: 'transmute', index: ix('F', 9), note: 'F9 を自分の石に変えて、その場で五つ。' },
    ],
  },
]);

const TRAINING_BOARD_BY_ID = Object.freeze(
  Object.fromEntries(TRAINING_BOARDS.map((b) => [b.id, b])),
);
const TRAINING_BOARD_BY_STAGE = Object.freeze(
  Object.fromEntries(TRAINING_BOARDS.map((b) => [b.stage, b])),
);

/* ───────────────────────── ボス演出の段階（A-10） ───────────────────────── */

const BOSS_PHASES = Object.freeze({
  5: [{ atEnemyTurn: 4, look: 'kagai-awake', line: '面の下から、桜の香が濃くなる。' }],
  10: [{ atEnemyTurn: 4, look: 'narukami-awake', line: '太鼓がひとりでに拍を速める。' }],
  15: [{ atEnemyTurn: 4, look: 'guren-awake', line: '翼が広がり、空が赤く灼ける。' }],
  20: [{ atEnemyTurn: 4, look: 'oboro-awake', line: '尾が増えたのか、影が増えたのか分からない。' }],
  25: [{ atEnemyTurn: 4, look: 'souga-awake', line: '古龍が身を起こし、氷が軋む。' }],
  30: [
    { atEnemyTurn: 4, look: 'muki-second', line: '玉座の奥で、閉じ込められた季節が身じろぎした。' },
    { atEnemyTurn: 8, look: 'muki-final', line: '影が六つの碁印を映し返す。' },
  ],
});

/**
 * ボスの登場・勝利演出（A-10）。文言と見た目キーだけを持つ。
 * 盤面・資源には一切影響しない。スキップできる。
 */
const BOSS_SHOW = Object.freeze({
  5: { look: 'kagai', entry: ['鳥居をまたぐ大きさの桜面が、夜の空を塞いだ。'], win: ['面が割れ、桜が普通の花に戻っていく。'] },
  10: { look: 'narukami', entry: ['浮かんだ巨大な太鼓が、雷雲ごと打ち鳴らされる。'], win: ['太鼓が裂け、雲の切れ間から星が落ちてきた。'] },
  15: { look: 'guren', entry: ['画面の外まで翼が広がる。溶岩が脈を打っている。'], win: ['翼が下り、火の粉が雪のように静まった。'] },
  20: { look: 'oboro', entry: ['九本の尾が紅葉を巻き上げ、朱い月を隠した。'], win: ['尾が一本ずつほどけ、月が白く戻る。'] },
  25: { look: 'souga', entry: ['山のような角。氷の鱗の向こうでオーロラが揺れる。'], win: ['古龍が身を横たえ、氷が水の音を取り戻した。'] },
  30: { look: 'muki', entry: ['巨大な影と玉座。四つの季節が、閉じ込められたまま並んでいる。'], win: ['影が薄れ、六つの碁印が順に灯っていく。'] },
});

/* ───────────────────────── 報酬（A-12） ───────────────────────── */

/** 通常ステージの報酬。数値は基本のペリカ。 */
const STAGE_REWARD = Object.freeze({ win: 3, lose: 1, draw: 1, aborted: 0 });

/** ボスの報酬。いずれも基本3を含む合計。 */
const BOSS_REWARD = Object.freeze({
  5: { repeat: 5, first: 10 },
  10: { repeat: 8, first: 15 },
  15: { repeat: 12, first: 20 },
  20: { repeat: 16, first: 25 },
  25: { repeat: 22, first: 35 },
  30: { repeat: 30, first: 50 },
});

/** 物語の XP（A-12） */
const STORY_XP = Object.freeze({
  win: { player: 60, char: 40 },
  lose: { player: 30, char: 20 },
  draw: { player: 30, char: 20 },
  aborted: { player: 0, char: 0 },
});
/** 着せ替えが重複したときのプレイヤーXP */
const DUPLICATE_DROP_XP = 20;

/* ───────────────────────── ステージ表（A-8） ───────────────────────── */

const boss = (id) => ({ repeat: BOSS_REWARD[id].repeat, first: BOSS_REWARD[id].first });
const normal = () => ({ repeat: STAGE_REWARD.win, first: STAGE_REWARD.win });

const STAGES = Object.freeze([
  /* ── 第1章 春の里と盗まれた暦 ── */
  {
    id: 1, chapter: 1, name: 'はじめの一石', boss: false,
    enemy: { name: '小僧・三吉', charId: 'mamori', level: 1 },
    season: 'spring', weather: 'fog', time: 'morning',
    scenery: '若草、梅のつぼみ、柔らかな朝霧。',
    ambience: '早春の鳥の声と、遠い読経。', bgm: 'story-spring',
    learn: '選択・取消・確定と五連。',
    intro: [
      '春の寺。朝の勤めのあと、盤の前に座らされた。',
      '「まずは置き方から。石を選んで、確かめて、それから決めるんだ」',
      '── 昨夜、寺から季節暦が盗まれた。庭の梅は、つぼみのまま止まっている。',
    ],
    clear: ['「うん、それでいい」', '三吉は盤の向こうで、少しだけ胸を張った。'],
    next: '暦を追う者の足跡は、参道の石段へ続いていた。',
    reward: normal(), drops: [],
  },
  {
    id: 2, chapter: 1, name: '参道の待った', boss: false,
    enemy: { name: '小僧・六助', charId: 'hibana', level: 1 },
    season: 'spring', weather: 'rain', time: 'day',
    scenery: '濡れた石段、若芽、水の輪。',
    ambience: '細い春雨が石を打つ音。', bgm: 'story-spring',
    learn: '相手の四連を先に止める。',
    intro: ['「並べるより先に、止めるほうを覚えたほうがいい」', '六助は雨のなかで、もう四つ並べていた。'],
    clear: ['「止められる形と、止められない形がある。覚えとけよ」'],
    next: '石段の上から、灯のような赤い光が見えた。',
    reward: normal(), drops: [],
  },
  {
    id: 3, chapter: 1, name: '火花の修練', boss: false,
    enemy: { name: '火種の小鬼', charId: 'hibana', level: 2 },
    season: 'spring', weather: 'petals', time: 'evening',
    scenery: '舞う桜、行灯、青みの残る夕空。',
    ambience: '花冷えの風と、行灯の紙が鳴る音。', bgm: 'story-spring',
    learn: '両端が空いた四連は、消して崩す。',
    intro: [
      'ヒバナが行灯の火を指先に移した。',
      '「両側が空いた四つは、石ひとつじゃ止まらない。だったら消す」',
      '── 火花を習得する。',
    ],
    clear: ['「消すのは道を空けるため。忘れるな」', 'ヒバナは火を、こちらの手のひらへ落とした。'],
    next: '桜の向こうに、花を抱えて走る影が見える。',
    reward: normal(), drops: [],
  },
  {
    id: 4, chapter: 1, name: '花を奪うもの', boss: false,
    enemy: { name: '花盗みの山賊', charId: 'hibana', level: 3 },
    season: 'spring', weather: 'petals', time: 'day',
    scenery: '菜の花、満開の桜、流れる花びら。',
    ambience: '花風と、遠くの牛の鳴き声。', bgm: 'story-spring',
    learn: '火花を使う時機と、置いて勝つ場合を選び分ける。',
    intro: ['「花も暦も、置いてある方が悪いのさ」'],
    clear: ['山賊は花束を落として逃げた。暦は持っていなかった。'],
    next: '夜。桜の下に、山ほどの大きさの面が浮かんでいた。',
    reward: normal(), drops: [],
  },
  {
    id: 5, chapter: 1, name: '夜桜の大入道', boss: true,
    enemy: { name: '桜面の大入道・花骸', charId: 'hibana', level: 5 },
    season: 'spring', weather: 'petals', time: 'night',
    scenery: '巨大な桜面、提灯、月明かりの花吹雪。',
    ambience: '花びらが降りつづける音だけが残る。', bgm: 'story-spring-boss',
    learn: '四連への対処と火花の総復習。',
    telegraphs: [],
    intro: [
      '満開の夜桜が、ひとつの面になって見下ろしている。',
      '「散らぬ春をやろう。永遠に、この夜のままで」',
    ],
    clear: [
      '面が割れ、なかから小さな桜の枝が落ちた。呪いが解けたのだ。',
      '── 春芽の碁印を得た。',
    ],
    next: '若葉の匂いがする。次は結界の社だ。',
    reward: boss(5),
    drops: ['acc-oni-sakura', 'outfit-hanamori', 'board-yozakura'],
  },

  /* ── 第2章 若葉の結界と雷の社 ── */
  {
    id: 6, chapter: 2, name: '若葉を守る結界', boss: false,
    enemy: { name: 'いたずら子狸', charId: 'mamori', level: 4 },
    season: 'rainy', weather: 'clear', time: 'morning',
    scenery: '透ける若葉、苔、緑の光。',
    ambience: '木漏れ日のなか、葉ずれと小鳥。', bgm: 'story-rain',
    learn: '予告された消去から、要となる石を守る。',
    telegraphs: [TELEGRAPH.SNIPE],
    intro: [
      'マモリが若葉を一枚、盤の上に置いた。',
      '「狙われる前に囲えばいい。囲われた石は、誰にも動かせない」',
      '── 結界を習得する。',
    ],
    clear: ['「守った石は、そのまま勝ち筋になる。守るだけで終わらせないこと」'],
    next: '森を抜けると、麦畑の向こうに幟が並んでいた。',
    reward: normal(), drops: [],
  },
  {
    id: 7, chapter: 2, name: '麦畑の番人', boss: false,
    enemy: { name: '竹槍の足軽', charId: 'hibana', level: 5 },
    season: 'rainy', weather: 'clear', time: 'day',
    scenery: '青空、伸びる麦、風に揺れる幟。',
    ambience: '五月晴れの風と、幟の布音。', bgm: 'story-rain',
    learn: '妨害に備えて、守る石を自分で選ぶ。',
    intro: ['「この道は通さん。麦を踏むな」'],
    clear: ['足軽は槍を下ろし、畦道を指した。'],
    next: '雨。紫陽花の咲く川べりに、水車が回っている。',
    reward: normal(), drops: [],
  },
  {
    id: 8, chapter: 2, name: '紫陽花の水鏡', boss: false,
    enemy: { name: '河童の川番', charId: 'yukine', level: 5 },
    season: 'rainy', weather: 'rain', time: 'day',
    scenery: '紫陽花、水車、水面の波紋。',
    ambience: 'しとしと雨と、水車の軋み。', bgm: 'story-rain',
    learn: '守られた石には火花が効かない。別の筋を探す。',
    intro: ['「囲われた石を燃やそうとしても、無駄だよ」'],
    clear: ['川番は水に潜り、道を開けた。'],
    next: '空が暗い。遠くで太鼓のような雷が鳴っている。',
    reward: normal(), drops: [],
  },
  {
    id: 9, chapter: 2, name: '雷雲の石段', boss: false,
    enemy: { name: '雷太鼓の赤鬼', charId: 'hayate', level: 6 },
    season: 'rainy', weather: 'thunder', time: 'evening',
    scenery: '黒い雲、濡れた幟、遠い稲妻。',
    ambience: '遠雷と、濡れた石段を打つ雨。', bgm: 'story-rain',
    learn: '攻めと守りの資源配分。予告を読みながら四連を作る。',
    intro: ['「守ってばかりじゃ、四つは並ばんぞ」'],
    clear: ['赤鬼は太鼓を背負い直し、社の方角へ道を譲った。'],
    next: '社の奥から、誰も打っていない太鼓の音がする。',
    reward: normal(), drops: [],
  },
  {
    id: 10, chapter: 2, name: '雷の社を解く', boss: true,
    enemy: { name: '雷将・鳴神', charId: 'hayate', level: 8 },
    season: 'rainy', weather: 'storm', time: 'night',
    scenery: '雷雲、巨大太鼓、勝利後の雲間の星。',
    ambience: '雷雨。勝利のあと、雨音だけが残る。', bgm: 'story-rain-boss',
    learn: '予告狙撃に結界で対抗する。',
    telegraphs: [TELEGRAPH.SNIPE],
    intro: [
      '巨大な太鼓が、社殿ごと震えている。',
      '「梅雨を止めておけば、夏は来ぬ。誰も別れずに済む」',
    ],
    clear: [
      '太鼓が割れ、雲の切れ間から星が見えた。',
      '── 若葉の碁印を得た。',
    ],
    next: '雨があがった。乾いた熱が、山の方から流れてくる。',
    reward: boss(10),
    drops: ['stone-raiko', 'acc-raikaku', 'board-ameagari'],
  },

  /* ── 第3章 炎陽の山と竜の翼 ── */
  {
    id: 11, chapter: 3, name: '守りを運ぶ風', boss: false,
    enemy: { name: '火守りの天狗', charId: 'hayate', level: 7 },
    season: 'summer', weather: 'clear', time: 'morning',
    scenery: '風鈴、海の反射、揺れる青葉。',
    ambience: '海風と風鈴。', bgm: 'story-summer',
    learn: '守り付きの石を、狙われている位置へ運ぶ。',
    telegraphs: [TELEGRAPH.SNIPE],
    intro: [
      'ハヤテが風鈴を鳴らした。',
      '「囲った石は動かせる。守りごと運べばいい」',
      '── 風渡りを習得する。',
    ],
    clear: ['「置くだけが手じゃない。動かすのも一手だ」'],
    next: '山道に入ると、地面から陽炎が立ちのぼっていた。',
    reward: normal(), drops: [],
  },
  {
    id: 12, chapter: 3, name: '陽炎を追い越せ', boss: false,
    enemy: { name: '砂走りの狼', charId: 'hayate', level: 8 },
    season: 'summer', weather: 'haze', time: 'day',
    scenery: '陽炎、濃い影、乾いた土。',
    ambience: '強い日差しと、乾いた砂の音。', bgm: 'story-summer',
    learn: '移動元と移動先を選ぶ操作を実戦で復習する。',
    intro: ['狼は影のように速い。「置く場所を、迷うな」'],
    clear: ['狼は日陰へ退き、道を空けた。'],
    next: '空に入道雲。赤い岩が湯気を立てている。',
    reward: normal(), drops: [],
  },
  {
    id: 13, chapter: 3, name: '竜の最初の炎', boss: false,
    enemy: { name: '若火竜', charId: 'hibana', level: 9 },
    season: 'summer', weather: 'thunder', time: 'day',
    scenery: '積乱雲、濡れた赤岩、蒸気。',
    ambience: '夕立と、岩に落ちる雨の弾ける音。', bgm: 'story-summer',
    learn: '相手の予告と、自分の勝ち筋を同時に見る。',
    intro: ['「熱いだろう。まだ本気じゃない」'],
    clear: ['若火竜は湯気の中へ翼をたたんだ。'],
    next: '夜。山の祭りの提灯が、尾根づたいに灯っていく。',
    reward: normal(), drops: [],
  },
  {
    id: 14, chapter: 3, name: '灯の上を飛ぶ影', boss: false,
    enemy: { name: '黒翼の飛竜', charId: 'kuon', level: 10 },
    season: 'summer', weather: 'clear', time: 'night',
    scenery: '提灯、遠い打ち上げ花火、夜の山影。',
    ambience: '祭り囃子が遠く、羽ばたきが近い。', bgm: 'story-summer',
    learn: '二つの勝ち筋を作り、守りを動かして維持する。',
    intro: ['提灯の列を、大きな影が横切った。'],
    clear: ['飛竜は火の粉を散らして、山の向こうへ消えた。'],
    next: '尾根の先が明るい。空そのものが灼けている。',
    reward: normal(), drops: [],
  },
  {
    id: 15, chapter: 3, name: '炎嶺を越える一手', boss: true,
    enemy: { name: '炎嶺竜・紅蓮', charId: 'kuon', level: 12 },
    season: 'summer', weather: 'firestorm', time: 'evening',
    scenery: '巨大な翼、溶岩、火の粉、焼けた夕空。',
    ambience: '炎の唸りと、翼が空気を裂く音。', bgm: 'story-summer-boss',
    learn: '火花・結界・風渡りを組み合わせる。',
    telegraphs: [TELEGRAPH.SNIPE],
    intro: [
      '翼が画面の外まで広がっている。',
      '「夏を灼き止めておけば、秋は来ぬ。枯れるものも無い」',
    ],
    clear: [
      '翼が下り、溶岩が黒く固まっていく。',
      '── 炎陽の碁印を得た。',
    ],
    next: '峠を越えると、すすきの原に露が降りていた。……霜も。',
    reward: boss(15),
    drops: ['outfit-enryu', 'stone-yogan', 'acc-enryu-tsuno'],
  },

  /* ── 第4章 秋月の森と時知らずの霜 ── */
  {
    id: 16, chapter: 4, name: '秋に降る霜', boss: false,
    enemy: { name: '霜占いの狐童', charId: 'yukine', level: 10 },
    season: 'autumn', weather: 'fog', time: 'dawn',
    scenery: 'すすき、露、一部だけ凍った葉。',
    ambience: '明け方の静けさと、葉の上で氷が鳴る音。', bgm: 'story-autumn',
    learn: '置くと奪われる地点を凍らせ、予告占領を不発にする。',
    telegraphs: [TELEGRAPH.SEIZE],
    intro: [
      'ユキネが、まだ秋なのに凍った葉をつまみ上げた。',
      '「置けば奪われる場所がある。なら、誰にも置けなくすればいい」',
      '── 氷結を習得する。冬の欠片が、秋へ運ばれている。',
    ],
    clear: ['「凍らせても、解ける。解ける前に自分で塞ぐこと」'],
    next: '稲穂の原に出た。刈り入れの風が吹いている。',
    reward: normal(), drops: [],
  },
  {
    id: 17, chapter: 4, name: '実りの道を守れ', boss: false,
    enemy: { name: '鎌風の野武士', charId: 'hayate', level: 11 },
    season: 'autumn', weather: 'clear', time: 'evening',
    scenery: '稲穂、稲架掛け、赤とんぼ。',
    ambience: '収穫の風と、乾いた稲の音。', bgm: 'story-autumn',
    learn: '氷結の解除時機を見て、次の手を先に考える。',
    intro: ['「凍らせた先を、もう決めてあるか？」'],
    clear: ['野武士は鎌を収め、稲架の間を通してくれた。'],
    next: '月が出た。大きすぎるほどの、名月だ。',
    reward: normal(), drops: [],
  },
  {
    id: 18, chapter: 4, name: '名月の狙い', boss: false,
    enemy: { name: '化け猫の弓師', charId: 'hibana', level: 11 },
    season: 'autumn', weather: 'clear', time: 'night',
    scenery: '大きな月、すすき、静かな虫の光。',
    ambience: '虫の音と、弦の張る音。', bgm: 'story-autumn',
    learn: '消去・防御・封鎖の違いを選び分ける。',
    intro: ['「消すのか、囲うのか、凍らせるのか。ひとつしか選べぬぞ」'],
    clear: ['弓師は月へ向かって一礼し、姿を消した。'],
    next: '落葉が深い。踏むと、下から霜の音がする。',
    reward: normal(), drops: [],
  },
  {
    id: 19, chapter: 4, name: '落葉の鎧', boss: false,
    enemy: { name: '落葉鎧の鬼武者', charId: 'mamori', level: 12 },
    season: 'autumn', weather: 'fog', time: 'day',
    scenery: '赤や金の落葉、白い霜、冷たい山影。',
    ambience: '落葉を踏む音と、初霜の軋み。', bgm: 'story-autumn',
    learn: '守り付き石を避け、複数の脅威を比べる。',
    intro: ['「囲った石は貰えぬ。ならば、どこを狙う？」'],
    clear: ['鎧が落葉に崩れ、下から霜だけが残った。'],
    next: '森の奥。月が朱い。尾のような影が九つ揺れている。',
    reward: normal(), drops: [],
  },
  {
    id: 20, chapter: 4, name: '朱月と九つの影', boss: true,
    enemy: { name: '紅葉の九尾・朧', charId: 'akari', level: 15 },
    season: 'autumn', weather: 'maple-storm', time: 'night',
    scenery: '九本の尾、紅葉の渦、朱月。',
    ambience: '葉の渦が声のように鳴る。', bgm: 'story-autumn-boss',
    learn: '氷結と予告対策。',
    telegraphs: [TELEGRAPH.SEIZE],
    intro: [
      '九つの尾が、紅葉ごと渦を巻いている。',
      '「秋で止めましょう。実ったまま、落ちないまま」',
      '（幻は見た目だけ。盤の石は、いつもどおりそこにある）',
    ],
    clear: [
      '尾が一本ずつ落葉に還り、朱い月が白く戻った。',
      '── 秋月の碁印を得た。',
    ],
    next: '息が白い。峰へ続く道に、霜柱が立っていた。',
    reward: boss(20),
    drops: ['acc-kyubi', 'board-shugetsu', 'outfit-oboro'],
  },

  /* ── 第5章 雪星の峰と古龍の誓い ── */
  {
    id: 21, chapter: 5, name: '雪の向こうの星', boss: false,
    enemy: { name: '星拾いの雪小鬼', charId: 'kuon', level: 14 },
    season: 'winter', weather: 'clear', time: 'dawn',
    scenery: '霜柱、まばらな雪、澄んだ星。',
    ambience: '霜柱を踏む音。風は無い。', bgm: 'story-winter',
    learn: '邪魔な相手石を、安全な隣接点へ移す。',
    intro: [
      'クオンが、盤の上の石を指先で引き寄せた。',
      '「消さなくていい。どかせば済むことがある」',
      '── 引力を習得する。',
    ],
    clear: ['「どかした先で相手が勝つこともある。行き先をよく見ろ」'],
    next: '尾根に出たとたん、視界が白一色になった。',
    reward: normal(), drops: [],
  },
  {
    id: 22, chapter: 5, name: '白い鎧の足跡', boss: false,
    enemy: { name: '氷甲の狼', charId: 'mamori', level: 15 },
    season: 'winter', weather: 'blizzard', time: 'day',
    scenery: '吹雪、白樺、青い氷甲。',
    ambience: '吹雪の唸り。足跡はすぐ消える。', bgm: 'story-winter',
    learn: '引力は守り付き石には効かない。',
    intro: ['「凍った鎧は、引いても動かん」'],
    clear: ['狼は氷甲を鳴らして、道の端へ退いた。'],
    next: '風がやんだ。樹氷が朝日で光っている。',
    reward: normal(), drops: [],
  },
  {
    id: 23, chapter: 5, name: '樹氷の翼', boss: false,
    enemy: { name: '氷翼の飛竜', charId: 'kuon', level: 15 },
    season: 'winter', weather: 'clear', time: 'morning',
    scenery: '樹氷、青空、きらめく雪。',
    ambience: '冬晴れの静寂と、氷の割れる高い音。', bgm: 'story-winter',
    learn: '移動で相手を勝たせないよう、移動先を確認する。',
    intro: ['「引いた先が、私の五つ目でないと言えるか」'],
    clear: ['飛竜は樹氷を散らして舞い上がり、去った。'],
    next: '雪嵐。巨大な足跡が、門のように並んでいる。',
    reward: normal(), drops: [],
  },
  {
    id: 24, chapter: 5, name: '雪原の門', boss: false,
    enemy: { name: '雪原の巨人', charId: 'yukine', level: 16 },
    season: 'winter', weather: 'blizzard', time: 'evening',
    scenery: '巨大な足跡、雪煙、霜の門。',
    ambience: '雪嵐。低い唸りが地面から伝わる。', bgm: 'story-winter',
    learn: '5種類の術から必要なものだけを選び、エナジーを残す。',
    intro: ['「全部使えば勝てると思うな。残す手を決めておけ」'],
    clear: ['巨人は膝をつき、門のかたちに雪が崩れた。'],
    next: '空にオーロラ。その下に、山のような角が見える。',
    reward: normal(), drops: [],
  },
  {
    id: 25, chapter: 5, name: '白銀古龍の誓い', boss: true,
    enemy: { name: '白銀古龍・霜牙', charId: 'yukine', level: 18 },
    season: 'winter', weather: 'aurora', time: 'night',
    scenery: '巨大な角、氷晶、オーロラ、白い吐息。',
    ambience: '極寒の静けさ。吐息が凍る音まで聞こえる。', bgm: 'story-winter-boss',
    learn: '封鎖・防御・引力を状況で使い分ける。',
    telegraphs: [],
    intro: [
      '古龍は目を開けずに言った。',
      '「冬で止めると誓った。誰も溶けぬように、失わぬように」',
    ],
    clear: [
      '古龍は誓いを解き、氷晶が水の音を取り戻した。',
      '── 雪星の碁印を得た。',
    ],
    next: '峰の向こうに、城。窓が凍ったまま、金色に光っている。',
    reward: boss(25),
    drops: ['stone-hakugin', 'outfit-yukiboshi', 'board-kyokko'],
  },

  /* ── 第6章 暁の城と還る四季 ── */
  {
    id: 26, chapter: 6, name: '夜明けを塗り替える', boss: false,
    enemy: { name: '暁門の影法師', charId: 'akari', level: 18 },
    season: 'all', weather: 'shifting', time: 'dawn',
    scenery: '凍った窓、細い金の光、梅の一輪。',
    ambience: '凍った光。音がひとつも無い。', bgm: 'story-final',
    learn: '列の中の相手石を変え、その一手で五連にする。',
    telegraphs: [],
    intro: [
      'アカリが、凍った窓に光を通した。',
      '「消すのでも動かすのでもない。こちらのものにする」',
      '── 転光を習得する。六つ、すべて揃った。',
    ],
    clear: ['「一度きりだ。使いどころを間違えるな」'],
    next: '回廊の先で、こちらと同じ背格好の影が待っていた。',
    reward: normal(), drops: [],
  },
  {
    id: 27, chapter: 6, name: '春を待つ影', boss: false,
    enemy: { name: '魔王の影武者', charId: 'akari', level: 19 },
    season: 'all', weather: 'clear', time: 'evening',
    scenery: '枯木、梅の花、融け始めた小さな水面。',
    ambience: '雫の落ちる音がひとつ、またひとつ。', bgm: 'story-final',
    learn: '6術から解法を選ぶ。転光を無駄遣いしない。',
    intro: ['「六つ持っていても、使えるのは一手にひとつだ」'],
    clear: ['影武者は梅の花びらになって散った。'],
    next: '足元の残雪が、みるみる溶けていく。',
    reward: normal(), drops: [],
  },
  {
    id: 28, chapter: 6, name: '雪解けの双頭竜', boss: false,
    enemy: { name: '虚無の双頭竜', charId: 'kuon', level: 20 },
    season: 'all', weather: 'snow', time: 'day',
    scenery: '残雪、水滴、二つの巨大な首。',
    ambience: '雪解けの水音と、二重の唸り。', bgm: 'story-final',
    learn: '二方向の脅威を読む。',
    intro: ['首が二つ。だが打つ手は一つずつだ。'],
    clear: ['二つの首は水面に溶け、ただの雪解け水になった。'],
    next: '回廊の区画ごとに、桜、雨、紅葉、雪が並んでいる。',
    reward: normal(), drops: [],
  },
  {
    id: 29, chapter: 6, name: '四季の最後の門番', boss: false,
    enemy: { name: '四季衛兵長・玄暦', charId: 'mamori', level: 21 },
    season: 'all', weather: 'shifting', time: 'night',
    scenery: '桜、雨、紅葉、雪が回廊の別区画に並ぶ。',
    ambience: '四つの季節の音が、区画ごとに切り替わる。', bgm: 'story-final',
    learn: '最終復習。相手の勝ちを止め、自分の五連を結ぶ。',
    intro: ['「新しい術は無い。ここまでのすべてで来い」'],
    clear: ['玄暦は槍を引き、最後の扉を開けた。'],
    next: '玉座の間。四季が、閉じ込められたまま並んでいる。',
    reward: normal(), drops: [],
  },
  {
    id: 30, chapter: 6, name: '四季を還す五つの光', boss: true,
    enemy: { name: '四季喰らいの魔王・無季', charId: 'akari', level: 25 },
    season: 'all', weather: 'shifting', time: 'dawn',
    scenery: '巨大な影と玉座、閉じ込めた四季、六つの碁印。',
    ambience: '無音。石を置く音だけが響く。', bgm: 'story-final-boss',
    learn: '既習6術の総合戦。',
    telegraphs: [],
    intro: [
      '「季節が移ろえば、別れが来る」',
      '「止めておけば、誰も失わずに済む。私はそう決めた」',
      '玉座の四方で、四つの季節が凍りついたまま震えている。',
    ],
    clear: [
      '影が薄れ、閉じ込められていた季節が順に流れ出した。',
      '春が来て、雨が降り、夏が灼け、紅葉が散り、雪が積もり、また春が来る。',
      '── 暁の碁印が灯った。四季が、ふたたび巡りはじめる。',
      '',
      '寺へ戻ると、三吉と六助が盤を出して待っていた。',
      '「三人で一局、どうだ」',
    ],
    next: '',
    reward: boss(30),
    drops: ['outfit-shiki', 'acc-akatsuki', 'board-meguru'],
  },
].map((s) => Object.freeze({ ...s, telegraphs: Object.freeze(s.telegraphs || []) })));

const STAGE_BY_ID = Object.freeze(
  Object.fromEntries(STAGES.map((s) => [s.id, s])),
);

const STORY_STAGE_COUNT = STAGES.length;
const BOSS_STAGES = Object.freeze(STAGES.filter((s) => s.boss).map((s) => s.id));

/** 全ステージを初回制覇したときのペリカ合計（通常24×3 ＋ ボス初回合計） */
const STORY_TOTAL_PERICA = STAGES.reduce((n, s) => n + s.reward.first, 0);

/** ボス限定の着せ替え（ガチャ排出対象外）。各ボスの先頭が初回固定品。 */
const STORY_DROP_IDS = Object.freeze(STAGES.flatMap((s) => s.drops));

/* ───────────────────────── 参照用ヘルパ ───────────────────────── */

function stageById(id) {
  return STAGE_BY_ID[Number(id)] || null;
}

function stagesOfChapter(chapterId) {
  return STAGES.filter((s) => s.chapter === Number(chapterId));
}

function trainingBoardOfStage(stageId) {
  return TRAINING_BOARD_BY_STAGE[Number(stageId)] || null;
}

function bossPhasesOfStage(stageId) {
  return BOSS_PHASES[Number(stageId)] || [];
}

function nextStageId(id) {
  const n = Number(id) + 1;
  return STAGE_BY_ID[n] ? n : null;
}

return { STORY_DATA_VERSION, ix, TELEGRAPH, TELEGRAPHS, SKILL_UNLOCKS, SKILL_UNLOCK_BY_STAGE, SEALS, SEAL_BY_STAGE, unlockedCharsAt, unlockedSkillsAt, CHAPTERS, CHAPTER_BY_ID, TRAINING_BOARDS, TRAINING_BOARD_BY_ID, TRAINING_BOARD_BY_STAGE, BOSS_PHASES, BOSS_SHOW, STAGE_REWARD, BOSS_REWARD, STORY_XP, DUPLICATE_DROP_XP, STAGES, STAGE_BY_ID, STORY_STAGE_COUNT, BOSS_STAGES, STORY_TOTAL_PERICA, STORY_DROP_IDS, stageById, stagesOfChapter, trainingBoardOfStage, bossPhasesOfStage, nextStageId };
});

__def("../../shared/rng.js", function (__req) {
/**
 * 暗号学的乱数のみを使う整数乱数。
 * 安全な乱数が使えない場合はエラーにし、Math.random へフォールバックしない。
 */

class InsecureRandomError extends Error {
  constructor() {
    super('安全な乱数が利用できないため、抽選を実行できません。');
    this.code = 'insecure_random';
  }
}

function getCryptoObj() {
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === 'function') return c;
  return null;
}

function hasSecureRandom() {
  return getCryptoObj() !== null;
}

/**
 * [0, maxExclusive) の一様乱数整数。剰余バイアスを除去するため棄却法を使う。
 * @param {number} maxExclusive
 */
function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError('maxExclusive は 1 以上の整数である必要があります');
  }
  const c = getCryptoObj();
  if (!c) throw new InsecureRandomError();
  if (maxExclusive === 1) return 0;

  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    c.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % maxExclusive;
  }
  throw new InsecureRandomError();
}

/** 16 進の大文字ランダム文字列（ルームコード等） */
function secureHexUpper(length) {
  const c = getCryptoObj();
  if (!c) throw new InsecureRandomError();
  const bytes = new Uint8Array(Math.ceil(length / 2));
  c.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s.slice(0, length).toUpperCase();
}

/** URL 安全なトークン（セッション秘密値・requestId 等） */
function secureToken(bytes = 32) {
  const c = getCryptoObj();
  if (!c) throw new InsecureRandomError();
  const arr = new Uint8Array(bytes);
  c.getRandomValues(arr);
  let s = '';
  for (const b of arr) s += b.toString(16).padStart(2, '0');
  return s;
}

return { InsecureRandomError, hasSecureRandom, secureRandomInt, secureHexUpper, secureToken };
});

__def("../../shared/rulesets.js", function (__req) {
/**
 * ルールセットの分離。
 *
 * モードごとに「別のルール」であることをコード上で識別できるようにする。
 * 共通の可変設定で、スキル効果・併用可否・コスト・回数・勝敗条件・報酬・
 * 戦績・保存先を上書きしないこと。
 *
 *  pvp_current    … 既存3人対戦（公開中の挙動。変更しない）
 *  story_seasons  … ストーリー専用の1対1
 *  pvp_balance_v2 … 3人対戦の調整・検証用（検証コピーでのみ使用）
 */

const RULESET = Object.freeze({
  PVP_CURRENT: 'pvp_current',
  PVP_MIN_STONES: 'pvp_min_stones',
  PVP_V99: 'pvp_v99',
  STORY: 'story_seasons',
  PVP_BALANCE_V2: 'pvp_balance_v2',
});

/**
 * V99 の全スキル解放・強化設定。
 * 2026-09-14：手番回数による解放制限を撤廃し、強化形を初手から利用可能にした。
 * 防御系の結界・氷結は攻撃系より追加配置を1つ多くして相対的な防御力を維持する。
 *
 * ここに書いてあるのは「消費」「回数の下限」「追加配置の数」だけで、
 * 五目を強制的に完成させる処理・自動補完・強制決着は一切含まない。
 */
const V99 = Object.freeze({
  /** 0＝全員が試合開始時から解放済み。 */
  unlockTurn: 0,
  /** 解放時期に行動順差を設けない。 */
  unlockOffsetByOrder: Object.freeze([0, 0, 0]),
  /** 長期戦の回復が入る「自分の手番回数」 */
  longTurn: 44,
  /** 長期戦で回数が回復するキャラ */
  longRecover: Object.freeze(['hayate', 'kuon', 'akari']),
  /** 全スキルを最初から利用可能にする。 */
  lockedSkills: Object.freeze([]),
  /** 初期状態の消費・回数の下限・追加配置の数（キャラ別） */
  enhance: Object.freeze({
    hibana: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
    mamori: Object.freeze({ cost: 1, usesFloor: 12, extra: 3 }),
    hayate: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
    yukine: Object.freeze({ cost: 1, usesFloor: 12, extra: 3 }),
    kuon: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
    akari: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
  }),
  /** 行動順ごとの追加配置の減算（実際の1番手・2番手・3番手） */
  orderPenalty: Object.freeze([1, 1, 0]),
  /**
   * 火花で消した交点にも追加配置できるようにするか。
   *
   * 2026-09-08：ヒバナ・アカリ仕様書 §5 は「置けない」だったが、
   * 実測でヒバナの勝率が 8.6% まで落ちたため、指示により §5 を外して true とした
   * （同条件3000局で 8.6% → 35.7%。docs/V99_HIBANA_AKARI_REPORT.md 4章）。
   * アカリとの差別化は、結界を破れるかどうか（sparkBreaksWard）と、
   * 消す／奪うという盤面に残る結果の違いで保つ。
   */
  sparkCanRefill: true,
  /**
   * 火花が結界付きの相手石も破壊できるか（ヒバナ・アカリ仕様書 §2）。
   * 結界だけを消すのではなく、結界と石をまとめて削除する。
   */
  sparkBreaksWard: true,
  /**
   * 結界付き石を火花で破壊したときのエナジー回復量（同 §3）。
   * 上限（6）は超えない。結界の無い石を壊したときは回復しない。
   */
  wardBreakEnergy: 2,
});

/**
 * これから始まる3人対戦が使うルールセット。
 *
 * 2026-09-05：検証結果（docs/BALANCE_VERIFY_REPORT.md 案B）を受けて
 * 最少石数判定を入れた pvp_min_stones へ切り替えた。
 * 2026-09-07：V99（docs/V99_BALANCE_REPORT.md 推奨案 V99-G）を採用し pvp_v99 へ。
 * すでに進行中の対戦は state.ruleset に前のIDが入ったままなので、
 * 途中で条件が変わることはない（新規対戦からのみ適用）。
 */
const DEFAULT_PVP_RULESET = RULESET.PVP_V99;

/**
 * 各ルールセットの構造。
 * seats        … 参加人数（席数）
 * iceOffset    … 氷結の解除に使う ply 加算（使用前 ply + iceOffset）
 * skillPlusPlace … スキルと通常着手の併用を認めるか
 * telegraph    … 敵専用の予告技を使うか
 * minStoneJudgement … 満盤時に最少石数判定を行うか
 * rewards      … 報酬の系統（保存先・戦績の分離に使う）
 */
const RULESETS = Object.freeze({
  [RULESET.PVP_CURRENT]: Object.freeze({
    id: RULESET.PVP_CURRENT,
    label: '3人対戦（現行）',
    seats: 3,
    iceOffset: 3,
    skillPlusPlace: false,
    telegraph: false,
    minStoneJudgement: false,
    rewards: 'pvp',
    stats: 'pvp',
  }),
  [RULESET.PVP_MIN_STONES]: Object.freeze({
    id: RULESET.PVP_MIN_STONES,
    label: '3人対戦',
    seats: 3,
    iceOffset: 3,
    skillPlusPlace: false,
    telegraph: false,
    // 盤が埋まって五が無いとき、石が最も少ない席の勝ち（同数は全員勝者）
    minStoneJudgement: true,
    /**
     * 妨害技の消費・回数の調整（検証の案H／docs/BALANCE_VERIFY_REPORT.md）。
     * ここに書いた技だけが上書きされ、書いていない技は既定のまま。
     * 進行中の対戦（pvp_current）には適用されない。
     *
     * 転光（transmute）は意図して据え置き。
     * 案C では 6→5 に下げたが、実測で案H（据え置き）と結果が完全に一致し、
     * 下げる意味が測れなかった。転光は塞がれた列を貫ける唯一の技で、
     * 五連決着の 94% を占めるため、効果の無い割引で更に強くしない。
     */
    skillTuning: Object.freeze({
      costs: Object.freeze({ spark: 3, pull: 3 }),
      uses: Object.freeze({ spark: 3, pull: 3 }),
    }),
    rewards: 'pvp',
    stats: 'pvp',
  }),
  [RULESET.PVP_V99]: Object.freeze({
    id: RULESET.PVP_V99,
    label: '3人対戦',
    seats: 3,
    iceOffset: 3,
    skillPlusPlace: false,
    telegraph: false,
    minStoneJudgement: true,
    /** 毎試合、開始プレイヤーをランダムに選ぶ（P1/P2/P3 の識別は変えない） */
    randomStartSeat: true,
    /** 全スキル初期解放・強化。詳細は上の V99 定数。 */
    v99: V99,
    rewards: 'pvp',
    stats: 'pvp',
  }),
  [RULESET.STORY]: Object.freeze({
    id: RULESET.STORY,
    label: 'ストーリー（1対1）',
    seats: 2,
    iceOffset: 2,
    skillPlusPlace: false,
    telegraph: true,
    minStoneJudgement: false,
    rewards: 'story',
    stats: 'story',
  }),
  [RULESET.PVP_BALANCE_V2]: Object.freeze({
    id: RULESET.PVP_BALANCE_V2,
    label: '3人対戦（調整検証 v2.0）',
    seats: 3,
    iceOffset: 3,
    // 候補として「配置＋効果」を持つが、有効化は検証コピー側の調整案が決める
    skillPlusPlace: true,
    telegraph: false,
    minStoneJudgement: true,
    rewards: 'none',      // 検証版は本番の通貨・戦績へ一切書き込まない
    stats: 'verify',
  }),
});

function rulesetOf(id) {
  return RULESETS[id] || RULESETS[RULESET.PVP_CURRENT];
}

/** 状態からルールセットを引く（未設定の古い保存は現行3人対戦とみなす） */
function rulesetOfState(state) {
  return rulesetOf(state?.ruleset);
}

return { RULESET, V99, DEFAULT_PVP_RULESET, RULESETS, rulesetOf, rulesetOfState };
});

export const constants = __req('../../shared/constants.js');
export const profile = __req('../../shared/profile.js');
export const rules = __req('../../shared/rules.js');
export const storyEngine = __req('../../shared/story/engine.js');
export const stages = __req('../../shared/story/stages.js');
