// supabase/functions/api/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

// supabase/functions/api/game-core.js
var __mods = /* @__PURE__ */ new Map();
var __def = (id, factory) => __mods.set(id, { factory, exports: null });
var __req = (id) => {
  const m = __mods.get(id);
  if (!m) throw new Error("Missing module: " + id);
  if (m.exports) return m.exports;
  const box = {};
  const value = m.factory(__req, box) ?? box;
  m.exports = value;
  return value;
};
__def("../../shared/constants.js", function(__req2) {
  const BOARD_W = 11;
  const BOARD_H = 17;
  const BOARD_SIZE = BOARD_W * BOARD_H;
  const CENTER_INDEX = 8 * BOARD_W + 5;
  const WIN_LENGTH = 5;
  const COLUMN_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
  const LEGACY_BOARD_W = 15;
  const LEGACY_BOARD_H = 15;
  const SEATS = [1, 2, 3];
  const SEAT_COLORS = {
    1: "#1f6f4a",
    // 深緑
    2: "#b5462f",
    // 朱
    3: "#2f5d94"
    // 藍
  };
  const MAX_ENERGY = 6;
  const NEIGHBOR_DIRS = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];
  const LINE_DIRS = [
    [1, 0],
    // 横
    [0, 1],
    // 縦
    [1, 1],
    // 右下がり斜め
    [1, -1]
    // 右上がり斜め
  ];
  const RARITIES = ["SSR", "SR", "R", "N"];
  const RARITY_WEIGHTS = Object.freeze({
    SSR: 300,
    SR: 1200,
    R: 3500,
    N: 5e3
  });
  const RARITY_WEIGHT_TOTAL = 1e4;
  const RARITY_LABEL = Object.freeze({
    SSR: "SSR",
    SR: "SR",
    R: "R",
    N: "N"
  });
  const CHARACTERS = Object.freeze([
    {
      id: "hibana",
      name: "\u30D2\u30D0\u30CA",
      rarity: "R",
      starter: true,
      color: "#d2622c",
      skill: {
        id: "spark",
        name: "\u706B\u82B1",
        cost: 4,
        uses: 2,
        targets: ["enemyStone"],
        desc: "\u5B88\u308A\u306E\u306A\u3044\u76F8\u624B\u306E\u77F3\u30921\u500B\u6D88\u3059\u3002"
      }
    },
    {
      id: "mamori",
      name: "\u30DE\u30E2\u30EA",
      rarity: "N",
      starter: true,
      color: "#3f8f5c",
      skill: {
        id: "ward",
        name: "\u7D50\u754C",
        cost: 2,
        uses: 2,
        targets: ["ownStone"],
        desc: "\u81EA\u5206\u306E\u77F31\u500B\u306B\u3001\u8A66\u5408\u7D42\u4E86\u307E\u3067\u7D9A\u304F\u5B88\u308A\u3092\u4ED8\u3051\u308B\u3002"
      }
    },
    {
      id: "hayate",
      name: "\u30CF\u30E4\u30C6",
      rarity: "R",
      starter: true,
      color: "#4a9fc4",
      skill: {
        id: "windwalk",
        name: "\u98A8\u6E21\u308A",
        cost: 3,
        uses: 2,
        targets: ["ownStone", "adjacentEmpty"],
        desc: "\u81EA\u5206\u306E\u77F31\u500B\u3092\u96A3\u63A58\u65B9\u5411\u306E\u7A7A\u304D\u4EA4\u70B9\u3078\u79FB\u52D5\u3059\u308B\u3002\u5B88\u308A\u306F\u7DAD\u6301\u3002"
      }
    },
    {
      id: "yukine",
      name: "\u30E6\u30AD\u30CD",
      rarity: "N",
      starter: false,
      color: "#6fa8c9",
      skill: {
        id: "freeze",
        name: "\u6C37\u7D50",
        cost: 2,
        uses: 2,
        targets: ["empty"],
        desc: "\u7A7A\u304D\u4EA4\u70B91\u3064\u3092\u81EA\u5206\u306E\u6B21\u306E\u624B\u756A\u958B\u59CB\u307E\u3067\u5C01\u9396\u3059\u308B\u3002"
      }
    },
    {
      id: "kuon",
      name: "\u30AF\u30AA\u30F3",
      rarity: "SR",
      starter: false,
      color: "#7a5aa8",
      skill: {
        id: "pull",
        name: "\u5F15\u529B",
        cost: 4,
        uses: 2,
        targets: ["enemyStone", "adjacentEmpty"],
        desc: "\u5B88\u308A\u306E\u306A\u3044\u76F8\u624B\u306E\u77F3\u3092\u96A3\u63A58\u65B9\u5411\u306E\u7A7A\u304D\u4EA4\u70B9\u3078\u79FB\u52D5\u3059\u308B\u3002\u6240\u6709\u8005\u306F\u5909\u308F\u3089\u306A\u3044\u3002"
      }
    },
    {
      id: "akari",
      name: "\u30A2\u30AB\u30EA",
      rarity: "SSR",
      starter: false,
      color: "#c9a227",
      skill: {
        id: "transmute",
        name: "\u8EE2\u5149",
        cost: 6,
        uses: 1,
        targets: ["enemyStone"],
        desc: "\u5B88\u308A\u306E\u306A\u3044\u76F8\u624B\u306E\u77F31\u500B\u3092\u81EA\u5206\u306E\u77F3\u306B\u5909\u3048\u308B\u3002"
      }
    }
  ]);
  const CHARACTER_BY_ID = Object.freeze(
    Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))
  );
  const STARTER_CHARACTER_IDS = Object.freeze(
    // 対戦キャラクターはガチャ解放ではなく、最初から全員使用できる。
    CHARACTERS.map((c) => c.id)
  );
  const SKILL_BY_ID = Object.freeze(
    Object.fromEntries(CHARACTERS.map((c) => [c.skill.id, c.skill]))
  );
  const SKILL_BY_CHARACTER = Object.freeze(
    Object.fromEntries(CHARACTERS.map((c) => [c.id, c.skill]))
  );
  const COSMETIC_SLOTS = Object.freeze(["outfit", "accessory", "board", "stone"]);
  const DEFAULT_EQUIP = Object.freeze({
    outfit: "outfit-plain",
    accessory: "acc-none",
    board: "board-wood",
    stone: "stone-classic"
  });
  const COSMETICS = Object.freeze([
    // ── 標準装備 4 点（排出対象外）
    { id: "outfit-plain", slot: "outfit", name: "\u65C5\u306E\u7740\u7269", rarity: "N", gachaPool: false, style: { base: "#cfc6ae", trim: "#8a7f63", pattern: "plain" } },
    { id: "acc-none", slot: "accessory", name: "\u98FE\u308A\u306A\u3057", rarity: "N", gachaPool: false, style: { kind: "none" } },
    { id: "board-wood", slot: "board", name: "\u767D\u6728\u306E\u7881\u76E4", rarity: "N", gachaPool: false, style: { bg: "#e8dcbe", bg2: "#dccfa9", line: "#8d7748", ink: "#4d4026", motif: "none" } },
    { id: "stone-classic", slot: "stone", name: "\u3064\u3084\u77F3", rarity: "N", gachaPool: false, style: { pattern: "gloss" } },
    // ── ファッション 12 点（衣装 6 / 飾り 6）
    { id: "outfit-asanoha", slot: "outfit", name: "\u9EBB\u306E\u8449\u306E\u5C0F\u8896", rarity: "N", gachaPool: true, style: { base: "#cbd8c4", trim: "#5d7a5a", pattern: "asanoha" } },
    { id: "outfit-aizome", slot: "outfit", name: "\u85CD\u67D3\u306E\u7FBD\u7E54", rarity: "N", gachaPool: true, style: { base: "#2f4f76", trim: "#c9d7e8", pattern: "shibori" } },
    { id: "acc-hachimaki", slot: "accessory", name: "\u767D\u3044\u9262\u5DFB", rarity: "N", gachaPool: true, style: { kind: "band", color: "#f6f3e7", accent: "#b5462f" } },
    { id: "outfit-sakura", slot: "outfit", name: "\u685C\u8272\u306E\u88B4", rarity: "R", gachaPool: true, style: { base: "#e8b7c4", trim: "#8f4f63", pattern: "petal" } },
    { id: "acc-tsubaki", slot: "accessory", name: "\u693F\u306E\u9AEA\u98FE\u308A", rarity: "R", gachaPool: true, style: { kind: "flower", color: "#c0362c", accent: "#f2d16b" } },
    { id: "acc-kasa", slot: "accessory", name: "\u65C5\u4EBA\u306E\u7B20", rarity: "R", gachaPool: true, style: { kind: "hat", color: "#c8ab72", accent: "#7a6136" } },
    { id: "outfit-raijin", slot: "outfit", name: "\u96F7\u795E\u306E\u88C5\u675F", rarity: "SR", gachaPool: true, style: { base: "#3b3f57", trim: "#e6c74d", pattern: "bolt" } },
    { id: "acc-kitsune", slot: "accessory", name: "\u72D0\u306E\u304A\u9762", rarity: "SR", gachaPool: true, style: { kind: "mask", color: "#f6f0e2", accent: "#c0362c" } },
    { id: "acc-moon", slot: "accessory", name: "\u4E09\u65E5\u6708\u306E\u51A0", rarity: "SR", gachaPool: true, style: { kind: "crown", color: "#dfe6ef", accent: "#8fa8c8" } },
    { id: "outfit-houou", slot: "outfit", name: "\u9CF3\u51F0\u306E\u9326\u8863", rarity: "SSR", gachaPool: true, style: { base: "#8c2f2a", trim: "#e8c561", pattern: "phoenix" } },
    { id: "outfit-galaxy", slot: "outfit", name: "\u661F\u8A60\u307F\u306E\u6B63\u88C5", rarity: "SSR", gachaPool: true, style: { base: "#1d2144", trim: "#9fb6e8", pattern: "stars" } },
    { id: "acc-crown", slot: "accessory", name: "\u5929\u7167\u306E\u5149\u8F2A", rarity: "SSR", gachaPool: true, style: { kind: "halo", color: "#f5d976", accent: "#fff3c4" } },
    // ── 盤面 8 点
    { id: "board-bamboo", slot: "board", name: "\u82E5\u7AF9\u306E\u5EAD", rarity: "N", gachaPool: true, style: { bg: "#dce7cf", bg2: "#c7d9b6", line: "#5f7a4c", ink: "#3c4d31", motif: "bamboo" } },
    { id: "board-sand", slot: "board", name: "\u67AF\u5C71\u6C34", rarity: "N", gachaPool: true, style: { bg: "#ece5d6", bg2: "#ddd3bd", line: "#96876a", ink: "#4a4234", motif: "sand" } },
    { id: "board-sakura", slot: "board", name: "\u685C\u306E\u5EAD\u5712", rarity: "R", gachaPool: true, style: { bg: "#f4dfe4", bg2: "#e8c8d2", line: "#a86a80", ink: "#5c3646", motif: "sakura" } },
    { id: "board-ocean", slot: "board", name: "\u9752\u6D77\u6CE2", rarity: "R", gachaPool: true, style: { bg: "#d8e6ef", bg2: "#bcd3e4", line: "#4f7899", ink: "#274155", motif: "seigaiha" } },
    { id: "board-moon", slot: "board", name: "\u6708\u591C\u306E\u7AF9\u6797", rarity: "SR", gachaPool: true, style: { bg: "#2b3448", bg2: "#1e2536", line: "#7f93b5", ink: "#dfe7f5", motif: "moonbamboo", dark: true } },
    { id: "board-maple", slot: "board", name: "\u7D05\u8449\u306E\u5C71\u9053", rarity: "SR", gachaPool: true, style: { bg: "#f0dcc6", bg2: "#e0bd9a", line: "#9a5a32", ink: "#5a2f1a", motif: "maple" } },
    { id: "board-galaxy", slot: "board", name: "\u5929\u306E\u5DDD", rarity: "SSR", gachaPool: true, style: { bg: "#161a33", bg2: "#0e1124", line: "#6f7fbf", ink: "#e6ecff", motif: "galaxy", dark: true } },
    { id: "board-gold", slot: "board", name: "\u91D1\u7B94\u306E\u5FA1\u6BBF", rarity: "SSR", gachaPool: true, style: { bg: "#f0dda0", bg2: "#dcc271", line: "#9c7a24", ink: "#4a3a10", motif: "goldleaf" } },
    // ── 碁石 8 点
    { id: "stone-ring", slot: "stone", name: "\u8F2A\u7D0B", rarity: "N", gachaPool: true, style: { pattern: "ring" } },
    { id: "stone-stripe", slot: "stone", name: "\u7E1E\u6A21\u69D8", rarity: "N", gachaPool: true, style: { pattern: "stripe" } },
    { id: "stone-sakura", slot: "stone", name: "\u685C\u7D0B", rarity: "R", gachaPool: true, style: { pattern: "sakura" } },
    { id: "stone-wave", slot: "stone", name: "\u6CE2\u7D0B", rarity: "R", gachaPool: true, style: { pattern: "wave" } },
    { id: "stone-crystal", slot: "stone", name: "\u6C37\u6676", rarity: "SR", gachaPool: true, style: { pattern: "crystal" } },
    { id: "stone-lightning", slot: "stone", name: "\u96F7\u7D0B", rarity: "SR", gachaPool: true, style: { pattern: "lightning" } },
    { id: "stone-galaxy", slot: "stone", name: "\u661F\u6CB3", rarity: "SSR", gachaPool: true, style: { pattern: "galaxy" } },
    { id: "stone-gold", slot: "stone", name: "\u91D1\u306E\u7E01\u53D6\u308A", rarity: "SSR", gachaPool: true, style: { pattern: "gold" } },
    // ── 物語のボス専用品 18 点（ガチャ排出対象外。既存34種の排出率へ混ぜない）
    { id: "acc-oni-sakura", slot: "accessory", name: "\u685C\u9B3C\u306E\u534A\u9762", rarity: "R", gachaPool: false, storyDrop: 5, style: { kind: "mask", color: "#f6dfe4", accent: "#8f2f45" } },
    { id: "outfit-hanamori", slot: "outfit", name: "\u82B1\u5B88\u306E\u7FBD\u7E54", rarity: "R", gachaPool: false, storyDrop: 5, style: { base: "#d9c3cf", trim: "#7a4257", pattern: "petal" } },
    { id: "board-yozakura", slot: "board", name: "\u591C\u685C\u306E\u53C2\u9053", rarity: "R", gachaPool: false, storyDrop: 5, style: { bg: "#2a2436", bg2: "#1b1726", line: "#8f6f92", ink: "#f0e2ef", motif: "sakura", dark: true } },
    { id: "stone-raiko", slot: "stone", name: "\u96F7\u9F13\u7D0B", rarity: "SR", gachaPool: false, storyDrop: 10, style: { pattern: "lightning" } },
    { id: "acc-raikaku", slot: "accessory", name: "\u96F7\u89D2\u306E\u98FE\u308A", rarity: "SR", gachaPool: false, storyDrop: 10, style: { kind: "crown", color: "#e8c561", accent: "#4a4a6a" } },
    { id: "board-ameagari", slot: "board", name: "\u96E8\u4E0A\u304C\u308A\u306E\u793E", rarity: "SR", gachaPool: false, storyDrop: 10, style: { bg: "#dfe8e4", bg2: "#c3d3cd", line: "#5f7f76", ink: "#2c3f39", motif: "sand" } },
    { id: "outfit-enryu", slot: "outfit", name: "\u708E\u7ADC\u306E\u9663\u7FBD\u7E54", rarity: "SR", gachaPool: false, storyDrop: 15, style: { base: "#8f3320", trim: "#e8a13c", pattern: "bolt" } },
    { id: "stone-yogan", slot: "stone", name: "\u6EB6\u5CA9\u306E\u9C57\u7D0B", rarity: "SR", gachaPool: false, storyDrop: 15, style: { pattern: "crystal" } },
    { id: "acc-enryu-tsuno", slot: "accessory", name: "\u708E\u7ADC\u306E\u89D2\u98FE\u308A", rarity: "SR", gachaPool: false, storyDrop: 15, style: { kind: "crown", color: "#e8703c", accent: "#5c1e10" } },
    { id: "acc-kyubi", slot: "accessory", name: "\u7D05\u8449\u4E5D\u5C3E\u306E\u9762", rarity: "SSR", gachaPool: false, storyDrop: 20, style: { kind: "mask", color: "#f7ece0", accent: "#a3282f" } },
    { id: "board-shugetsu", slot: "board", name: "\u6731\u6708\u306E\u5E7B\u5EAD", rarity: "SSR", gachaPool: false, storyDrop: 20, style: { bg: "#3a1f24", bg2: "#25141a", line: "#a8546a", ink: "#f6dfe0", motif: "maple", dark: true } },
    { id: "outfit-oboro", slot: "outfit", name: "\u6727\u821E\u306E\u8863", rarity: "SSR", gachaPool: false, storyDrop: 20, style: { base: "#7a2d3a", trim: "#e8b96b", pattern: "phoenix" } },
    { id: "stone-hakugin", slot: "stone", name: "\u767D\u9280\u7ADC\u306E\u6C37\u7D0B", rarity: "SSR", gachaPool: false, storyDrop: 25, style: { pattern: "crystal" } },
    { id: "outfit-yukiboshi", slot: "outfit", name: "\u96EA\u661F\u306E\u7ADC\u8863", rarity: "SSR", gachaPool: false, storyDrop: 25, style: { base: "#dfe8f2", trim: "#5f7fa8", pattern: "stars" } },
    { id: "board-kyokko", slot: "board", name: "\u6975\u5149\u306E\u6C37\u5EAD", rarity: "SSR", gachaPool: false, storyDrop: 25, style: { bg: "#16233a", bg2: "#0d1526", line: "#6fa8c9", ink: "#e6f2ff", motif: "galaxy", dark: true } },
    { id: "outfit-shiki", slot: "outfit", name: "\u56DB\u5B63\u306E\u7D99\u627F\u8863", rarity: "SSR", gachaPool: false, storyDrop: 30, style: { base: "#e8dcc0", trim: "#c9a227", pattern: "phoenix" } },
    { id: "acc-akatsuki", slot: "accessory", name: "\u6681\u306E\u516D\u5370\u51A0", rarity: "SSR", gachaPool: false, storyDrop: 30, style: { kind: "halo", color: "#f5d976", accent: "#fff3c4" } },
    { id: "board-meguru", slot: "board", name: "\u5DE1\u308B\u56DB\u5B63\u306E\u5EAD", rarity: "SSR", gachaPool: false, storyDrop: 30, style: { bg: "#eae6d4", bg2: "#d6d8be", line: "#7f8a5f", ink: "#3d452c", motif: "sakura" } }
  ]);
  const COSMETIC_BY_ID = Object.freeze(
    Object.fromEntries(COSMETICS.map((c) => [c.id, c]))
  );
  const SLOT_LABEL = Object.freeze({
    outfit: "\u8863\u88C5",
    accessory: "\u98FE\u308A",
    board: "\u76E4\u9762",
    stone: "\u7881\u77F3"
  });
  const CHARACTER_DRAW_PREFIX = "char:";
  function characterDrawId(characterId) {
    return CHARACTER_DRAW_PREFIX + characterId;
  }
  function parseDrawId(drawId) {
    if (typeof drawId !== "string") return null;
    if (drawId.startsWith(CHARACTER_DRAW_PREFIX)) {
      return { kind: "character", id: drawId.slice(CHARACTER_DRAW_PREFIX.length) };
    }
    const cos = COSMETIC_BY_ID[drawId];
    if (cos) return { kind: "cosmetic", id: drawId, slot: cos.slot };
    return null;
  }
  const GACHA_POOL = Object.freeze([
    ...COSMETICS.filter((c) => c.gachaPool).map((c) => ({
      drawId: c.id,
      kind: "cosmetic",
      refId: c.id,
      name: c.name,
      rarity: c.rarity,
      slot: c.slot
    }))
  ]);
  const GACHA_POOL_BY_RARITY = Object.freeze(
    Object.fromEntries(RARITIES.map((r) => [r, GACHA_POOL.filter((i) => i.rarity === r)]))
  );
  const GACHA_POOL_BY_ID = Object.freeze(
    Object.fromEntries(GACHA_POOL.map((i) => [i.drawId, i]))
  );
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
  const MISSIONS = Object.freeze([
    { id: "first-match", name: "\u521D\u9663", desc: "\u5BFE\u6226\u30921\u56DE\u5B8C\u4E86\u3059\u308B", playerXp: 50, goal: 1, counter: "matchesCompleted" },
    { id: "stones-10", name: "\u5E03\u77F3", desc: "\u81EA\u5206\u306E\u77F3\u3092\u5408\u8A0810\u500B\u7F6E\u304F", playerXp: 30, goal: 10, counter: "stonesPlaced" },
    { id: "skills-3", name: "\u6280\u5DE7", desc: "\u30B9\u30AD\u30EB\u3092\u5408\u8A083\u56DE\u4F7F\u3046", playerXp: 40, goal: 3, counter: "skillsUsed" },
    { id: "first-win", name: "\u521D\u52DD\u5229", desc: "1\u56DE\u52DD\u5229\u3059\u308B", playerXp: 50, goal: 1, counter: "wins" },
    { id: "three-chars", name: "\u4E09\u8005\u4E09\u69D8", desc: "3\u7A2E\u985E\u306E\u30AD\u30E3\u30E9\u3067\u5BFE\u6226\u3092\u5B8C\u4E86\u3059\u308B", playerXp: 60, goal: 3, counter: "distinctCharsUsed" }
  ]);
  const MISSION_BY_ID = Object.freeze(
    Object.fromEntries(MISSIONS.map((m) => [m.id, m]))
  );
  const ROOM_CODE_LENGTH = 6;
  const ROOM_CODE_ALPHABET = "0123456789ABCDEF";
  const ROOM_CAPACITY2 = 3;
  const DISCONNECT_GRACE_MS2 = 18e4;
  const DISCONNECT_WATCH_INTERVAL_MS = 15e3;
  const SSE_HEARTBEAT_MS = 2e4;
  const FX_DURATION_MS = 1100;
  const DEFAULT_AUDIO = Object.freeze({ bgm: 0.24, sfx: 0.4, ambient: 0.3, muted: false });
  const EFFECT_LEVELS = Object.freeze(["off", "low", "normal", "high"]);
  const DEFAULT_EFFECT_LEVEL = "normal";
  const STORAGE_EFFECT_KEY = "triad.effects.v1";
  const BPM_HOME = 84;
  const BPM_MATCH = 108;
  const STORAGE_KEY = "triad.local.v1";
  const STORAGE_AUDIO_KEY = "triad.audio.v1";
  const STORAGE_UI_KEY = "triad.ui.v1";
  const STORAGE_LOCK_KEY = "triad.lock.v1";
  const LEGACY_STORAGE_KEYS = Object.freeze(["triad.save", "triad.local.v0", "gomoku3.save"]);
  const SAVE_VERSION = 5;
  const SAVE_VERSION_PREV = 3;
  const SAVE_VERSIONS_MIGRATABLE = Object.freeze([3, 4, 5]);
  const GACHA_HISTORY_LIMIT = 100;
  function indexToCoord(index) {
    return { col: index % BOARD_W, row: Math.floor(index / BOARD_W) };
  }
  function coordToIndex(col, row) {
    return row * BOARD_W + col;
  }
  function inBoard(col, row) {
    return col >= 0 && col < BOARD_W && row >= 0 && row < BOARD_H;
  }
  function indexToLabel(index) {
    const { col, row } = indexToCoord(index);
    return `${COLUMN_LABELS[col]}${row + 1}`;
  }
  return { BOARD_W, BOARD_H, BOARD_SIZE, CENTER_INDEX, WIN_LENGTH, COLUMN_LABELS, LEGACY_BOARD_W, LEGACY_BOARD_H, SEATS, SEAT_COLORS, MAX_ENERGY, NEIGHBOR_DIRS, LINE_DIRS, RARITIES, RARITY_WEIGHTS, RARITY_WEIGHT_TOTAL, RARITY_LABEL, CHARACTERS, CHARACTER_BY_ID, STARTER_CHARACTER_IDS, SKILL_BY_ID, SKILL_BY_CHARACTER, COSMETIC_SLOTS, DEFAULT_EQUIP, COSMETICS, COSMETIC_BY_ID, SLOT_LABEL, CHARACTER_DRAW_PREFIX, characterDrawId, parseDrawId, GACHA_POOL, GACHA_POOL_BY_RARITY, GACHA_POOL_BY_ID, GACHA_COST_SINGLE, GACHA_COST_MULTI, GACHA_PULL_COUNT_MULTI, REWARD_PERICA, REWARD_PLAYER_XP, REWARD_CHAR_XP, PLAYER_XP_PER_LEVEL, CHAR_XP_PER_LEVEL, TRAIN_COST_PERICA, TRAIN_CHAR_XP, DUP_CHAR_XP, DUP_PLAYER_XP, MISSIONS, MISSION_BY_ID, ROOM_CODE_LENGTH, ROOM_CODE_ALPHABET, ROOM_CAPACITY: ROOM_CAPACITY2, DISCONNECT_GRACE_MS: DISCONNECT_GRACE_MS2, DISCONNECT_WATCH_INTERVAL_MS, SSE_HEARTBEAT_MS, FX_DURATION_MS, DEFAULT_AUDIO, EFFECT_LEVELS, DEFAULT_EFFECT_LEVEL, STORAGE_EFFECT_KEY, BPM_HOME, BPM_MATCH, STORAGE_KEY, STORAGE_AUDIO_KEY, STORAGE_UI_KEY, STORAGE_LOCK_KEY, LEGACY_STORAGE_KEYS, SAVE_VERSION, SAVE_VERSION_PREV, SAVE_VERSIONS_MIGRATABLE, GACHA_HISTORY_LIMIT, indexToCoord, coordToIndex, inBoard, indexToLabel };
});
__def("../../shared/gacha.js", function(__req2) {
  const { RARITIES, RARITY_WEIGHTS, RARITY_WEIGHT_TOTAL, GACHA_POOL, GACHA_POOL_BY_RARITY } = __req2("../../shared/constants.js");
  const { secureRandomInt } = __req2("../../shared/rng.js");
  function defaultWeights() {
    return { ...RARITY_WEIGHTS };
  }
  function defaultRatesPercent() {
    return Object.fromEntries(
      RARITIES.map((r) => [r, RARITY_WEIGHTS[r] / RARITY_WEIGHT_TOTAL * 100])
    );
  }
  function ratesToWeights(rates) {
    const weights = {};
    let sum = 0;
    for (const r of RARITIES) {
      const v = Number(rates == null ? void 0 : rates[r]);
      if (!Number.isFinite(v)) return { ok: false, message: `${r} \u306E\u78BA\u7387\u304C\u6570\u5024\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002` };
      if (v < 0 || v > 100) return { ok: false, message: `${r} \u306E\u78BA\u7387\u306F 0\u301C100% \u306E\u7BC4\u56F2\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002` };
      const scaled = Math.round(v * 100);
      if (Math.abs(scaled - v * 100) > 1e-6) {
        return { ok: false, message: `${r} \u306E\u78BA\u7387\u306F\u5C0F\u6570\u7B2C2\u4F4D\u307E\u3067\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002` };
      }
      weights[r] = scaled;
      sum += scaled;
    }
    if (sum !== RARITY_WEIGHT_TOTAL) {
      return { ok: false, message: `\u78BA\u7387\u306E\u5408\u8A08\u304C 100% \u306B\u306A\u3063\u3066\u3044\u307E\u305B\u3093\uFF08\u73FE\u5728 ${(sum / 100).toFixed(2)}%\uFF09\u3002` };
    }
    const zeroPool = RARITIES.find((r) => weights[r] > 0 && GACHA_POOL_BY_RARITY[r].length === 0);
    if (zeroPool) return { ok: false, message: `${zeroPool} \u306B\u6392\u51FA\u5BFE\u8C61\u304C\u3042\u308A\u307E\u305B\u3093\u3002` };
    return { ok: true, weights };
  }
  function weightsToRates(weights) {
    return Object.fromEntries(RARITIES.map((r) => [r, (weights[r] ?? 0) / 100]));
  }
  function offerRates(weights = RARITY_WEIGHTS) {
    const total = RARITIES.reduce((a, r) => a + (weights[r] ?? 0), 0) || RARITY_WEIGHT_TOTAL;
    const byRarity = {};
    const byItem = {};
    for (const r of RARITIES) {
      const pct = (weights[r] ?? 0) / total * 100;
      byRarity[r] = pct;
      const pool = GACHA_POOL_BY_RARITY[r];
      for (const item of pool) byItem[item.drawId] = pool.length ? pct / pool.length : 0;
    }
    return { byRarity, byItem, poolSize: GACHA_POOL.length };
  }
  function drawOne(weights = RARITY_WEIGHTS, randomInt = secureRandomInt) {
    const total = RARITIES.reduce((a, r) => a + (weights[r] ?? 0), 0);
    if (total <= 0) throw new Error("\u6392\u51FA\u91CD\u307F\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    const roll = randomInt(total);
    let acc = 0;
    let chosen = null;
    for (const r of RARITIES) {
      acc += weights[r] ?? 0;
      if (roll < acc) {
        chosen = r;
        break;
      }
    }
    if (!chosen) chosen = RARITIES[RARITIES.length - 1];
    const pool = GACHA_POOL_BY_RARITY[chosen];
    if (!pool || pool.length === 0) throw new Error(`${chosen} \u306B\u6392\u51FA\u5BFE\u8C61\u304C\u3042\u308A\u307E\u305B\u3093\u3002`);
    const item = pool[randomInt(pool.length)];
    return { ...item, roll, rarity: chosen };
  }
  function drawMany(n, weights = RARITY_WEIGHTS, randomInt = secureRandomInt) {
    const out = [];
    for (let i = 0; i < n; i += 1) out.push(drawOne(weights, randomInt));
    return out;
  }
  return { defaultWeights, defaultRatesPercent, ratesToWeights, weightsToRates, offerRates, drawOne, drawMany };
});
__def("../../shared/profile.js", function(__req2) {
  const { CHARACTERS, CHARACTER_BY_ID, STARTER_CHARACTER_IDS, COSMETICS, COSMETIC_BY_ID, DEFAULT_EQUIP, COSMETIC_SLOTS, MISSIONS, MISSION_BY_ID, PLAYER_XP_PER_LEVEL, CHAR_XP_PER_LEVEL, REWARD_PERICA, REWARD_PLAYER_XP, REWARD_CHAR_XP, TRAIN_COST_PERICA, TRAIN_CHAR_XP, DUP_CHAR_XP, DUP_PLAYER_XP, GACHA_COST_SINGLE, GACHA_COST_MULTI, GACHA_PULL_COUNT_MULTI, GACHA_HISTORY_LIMIT, SAVE_VERSION, DEFAULT_AUDIO, EFFECT_LEVELS, DEFAULT_EFFECT_LEVEL, parseDrawId } = __req2("../../shared/constants.js");
  const { drawMany, defaultWeights, ratesToWeights, weightsToRates, offerRates } = __req2("../../shared/gacha.js");
  const { STAGE_BY_ID, STORY_STAGE_COUNT, STORY_TOTAL_PERICA, SKILL_UNLOCKS, SKILL_UNLOCK_BY_STAGE, SEAL_BY_STAGE, STAGE_REWARD, STORY_XP, DUPLICATE_DROP_XP } = __req2("../../shared/story/stages.js");
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
      id: opts.id || "local",
      name: opts.name || "\u3042\u306A\u305F",
      perica: 0,
      playerXp: 0,
      chars,
      cosmetics,
      equipByChar,
      equipCommon: { board: DEFAULT_EQUIP.board, stone: DEFAULT_EQUIP.stone },
      lastCharId: STARTER_CHARACTER_IDS[0],
      missions: Object.fromEntries(MISSIONS.map((m) => [m.id, { claimed: false }])),
      counters: {
        matchesCompleted: 0,
        stonesPlaced: 0,
        skillsUsed: 0,
        wins: 0,
        charsUsed: []
      },
      gachaHistory: [],
      gachaRates: null,
      // ローカル試作用のみ。null は標準。
      ledger: {},
      // requestId -> {hash, result, at}（結果まで保持する直近分）
      ledgerIds: {},
      // requestId -> hash（結果は保持しない長期の重複検出用）
      rewardedMatches: {},
      legacyCoins: null,
      // 旧コインは退避のみ。ペリカへ変換しない。
      story: createStoryArea(),
      settings: createSettingsArea(),
      createdAt: now,
      updatedAt: now
    };
  }
  function createSettingsArea() {
    return {
      confirmMove: true,
      bgm: DEFAULT_AUDIO.bgm,
      sfx: DEFAULT_AUDIO.sfx,
      ambient: DEFAULT_AUDIO.ambient,
      muted: DEFAULT_AUDIO.muted,
      effectLevel: DEFAULT_EFFECT_LEVEL,
      /**
       * 一度でもアカウントへ設定を保存したか。
       *
       * null のうちは「既定値が入っているだけ」なので、端末に残っている設定を
       * 上書きせず、逆にそれを持ち上げる（オンライン化前からの利用者の音量を
       * 初回だけ引き継ぐため）。
       */
      savedAt: null
    };
  }
  const clamp01 = (v, fallback) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(1, Math.max(0, n));
  };
  function applySettings(profile2, patch) {
    if (!patch || typeof patch !== "object") return { ok: false, code: "bad_settings", message: "\u8A2D\u5B9A\u306E\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\u3002" };
    const base = profile2.settings || createSettingsArea();
    const next = { ...createSettingsArea(), ...base };
    if ("confirmMove" in patch) next.confirmMove = !!patch.confirmMove;
    if ("muted" in patch) next.muted = !!patch.muted;
    for (const key of ["bgm", "sfx", "ambient"]) {
      if (key in patch) next[key] = clamp01(patch[key], next[key]);
    }
    if ("effectLevel" in patch && EFFECT_LEVELS.includes(patch.effectLevel)) next.effectLevel = patch.effectLevel;
    next.savedAt = Date.now();
    profile2.settings = next;
    profile2.updatedAt = Date.now();
    return { ok: true, result: { settings: { ...next } } };
  }
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
      activeMatchId: null
    };
  }
  function clampInt(v, min, max, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(n)));
  }
  function normalizeProfile(raw) {
    if (!raw || typeof raw !== "object") return null;
    const base = createProfile({ id: typeof raw.id === "string" ? raw.id : "local" });
    if (typeof raw.name === "string" && raw.name.trim()) base.name = raw.name.slice(0, 24);
    base.perica = clampInt(raw.perica, 0, 1e9, 0);
    base.playerXp = clampInt(raw.playerXp ?? raw.xp, 0, 1e12, 0);
    base.createdAt = clampInt(raw.createdAt, 0, Number.MAX_SAFE_INTEGER, base.createdAt);
    if (raw.coins != null && Number.isFinite(Number(raw.coins))) {
      base.legacyCoins = clampInt(raw.coins, 0, 1e9, 0);
    } else if (raw.legacyCoins != null) {
      base.legacyCoins = clampInt(raw.legacyCoins, 0, 1e9, 0);
    }
    if (Array.isArray(raw.chars) || Array.isArray(raw.unlockedChars)) {
      for (const id of raw.chars || raw.unlockedChars) {
        if (CHARACTER_BY_ID[id]) {
          base.chars[id].owned = true;
          base.chars[id].count = Math.max(1, base.chars[id].count);
        }
      }
    } else if (raw.chars && typeof raw.chars === "object") {
      for (const [id, v] of Object.entries(raw.chars)) {
        if (!CHARACTER_BY_ID[id]) continue;
        if (typeof v === "boolean") {
          base.chars[id].owned = base.chars[id].owned || v;
          if (v) base.chars[id].count = Math.max(1, base.chars[id].count);
        } else if (v && typeof v === "object") {
          const owned = base.chars[id].owned || !!v.owned || Number(v.count) > 0;
          base.chars[id].owned = owned;
          base.chars[id].count = Math.max(owned ? 1 : 0, clampInt(v.count, 0, 1e6, owned ? 1 : 0));
          base.chars[id].xp = clampInt(v.xp, 0, 1e12, 0);
        }
      }
    }
    for (const id of STARTER_CHARACTER_IDS) {
      base.chars[id].owned = true;
      base.chars[id].count = Math.max(1, base.chars[id].count);
    }
    if (Array.isArray(raw.cosmetics)) {
      for (const id of raw.cosmetics) if (COSMETIC_BY_ID[id]) base.cosmetics[id] = (base.cosmetics[id] || 0) + 1;
    } else if (raw.cosmetics && typeof raw.cosmetics === "object") {
      for (const [id, v] of Object.entries(raw.cosmetics)) {
        if (!COSMETIC_BY_ID[id]) continue;
        const n = typeof v === "boolean" ? v ? 1 : 0 : clampInt(v, 0, 1e6, 0);
        base.cosmetics[id] = Math.max(base.cosmetics[id] || 0, n);
      }
    }
    for (const id of Object.values(DEFAULT_EQUIP)) base.cosmetics[id] = Math.max(1, base.cosmetics[id] || 0);
    const legacyEquip = raw.equip && typeof raw.equip === "object" ? raw.equip : null;
    if (raw.equipByChar && typeof raw.equipByChar === "object") {
      for (const [charId, eq] of Object.entries(raw.equipByChar)) {
        if (!CHARACTER_BY_ID[charId] || !eq || typeof eq !== "object") continue;
        for (const slot of ["outfit", "accessory"]) {
          const id = eq[slot];
          if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
            base.equipByChar[charId][slot] = id;
          }
        }
      }
    } else if (legacyEquip) {
      for (const charId of Object.keys(base.equipByChar)) {
        for (const slot of ["outfit", "accessory"]) {
          const id = legacyEquip[slot];
          if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
            base.equipByChar[charId][slot] = id;
          }
        }
      }
    }
    const commonSrc = raw.equipCommon && typeof raw.equipCommon === "object" ? raw.equipCommon : legacyEquip;
    if (commonSrc) {
      for (const slot of ["board", "stone"]) {
        const id = commonSrc[slot];
        if (COSMETIC_BY_ID[id] && COSMETIC_BY_ID[id].slot === slot && (base.cosmetics[id] || 0) > 0) {
          base.equipCommon[slot] = id;
        }
      }
    }
    if (typeof raw.lastCharId === "string" && CHARACTER_BY_ID[raw.lastCharId] && base.chars[raw.lastCharId].owned) {
      base.lastCharId = raw.lastCharId;
    }
    if (raw.missions && typeof raw.missions === "object") {
      for (const [id, v] of Object.entries(raw.missions)) {
        if (!MISSION_BY_ID[id]) continue;
        base.missions[id].claimed = !!(typeof v === "boolean" ? v : v == null ? void 0 : v.claimed);
      }
    }
    if (raw.counters && typeof raw.counters === "object") {
      const c = raw.counters;
      base.counters.matchesCompleted = clampInt(c.matchesCompleted, 0, 1e9, 0);
      base.counters.stonesPlaced = clampInt(c.stonesPlaced, 0, 1e9, 0);
      base.counters.skillsUsed = clampInt(c.skillsUsed, 0, 1e9, 0);
      base.counters.wins = clampInt(c.wins, 0, 1e9, 0);
      if (Array.isArray(c.charsUsed)) {
        base.counters.charsUsed = [...new Set(c.charsUsed.filter((x) => CHARACTER_BY_ID[x]))];
      }
    }
    if (Array.isArray(raw.gachaHistory)) {
      base.gachaHistory = raw.gachaHistory.filter((h) => h && typeof h === "object" && typeof h.drawId === "string").map((h) => ({
        at: clampInt(h.at, 0, Number.MAX_SAFE_INTEGER, 0),
        drawId: h.drawId,
        name: typeof h.name === "string" ? h.name.slice(0, 40) : h.drawId,
        rarity: ["SSR", "SR", "R", "N"].includes(h.rarity) ? h.rarity : "N",
        isNew: !!h.isNew,
        rates: h.rates && typeof h.rates === "object" ? h.rates : weightsToRates(defaultWeights())
      })).slice(-GACHA_HISTORY_LIMIT);
    }
    if (raw.ledger && typeof raw.ledger === "object") {
      for (const [reqId, v] of Object.entries(raw.ledger)) {
        if (typeof reqId !== "string" || reqId.length > 128) continue;
        if (!v || typeof v !== "object") continue;
        base.ledger[reqId] = { hash: String(v.hash ?? ""), result: v.result ?? null, at: clampInt(v.at, 0, Number.MAX_SAFE_INTEGER, 0) };
      }
    }
    if (raw.ledgerIds && typeof raw.ledgerIds === "object") {
      for (const [reqId, h] of Object.entries(raw.ledgerIds)) {
        if (typeof reqId !== "string" || reqId.length > 128) continue;
        if (typeof h !== "string" || h.length > 64) continue;
        base.ledgerIds[reqId] = h;
      }
    }
    for (const [reqId, v] of Object.entries(base.ledger)) base.ledgerIds[reqId] = String(v.hash ?? "");
    if (raw.rewardedMatches && typeof raw.rewardedMatches === "object") {
      for (const k of Object.keys(raw.rewardedMatches)) if (typeof k === "string") base.rewardedMatches[k] = true;
    }
    if (raw.gachaRates && typeof raw.gachaRates === "object") {
      const v = ratesToWeights(raw.gachaRates);
      if (v.ok) base.gachaRates = { ...raw.gachaRates };
    }
    if (raw.settings && typeof raw.settings === "object") applySettings(base, raw.settings);
    base.story = migrateStory(raw.story, base);
    base.updatedAt = Date.now();
    return base;
  }
  function migrateStory(rawStory, base) {
    const story = createStoryArea();
    if (!rawStory || typeof rawStory !== "object") return story;
    const inRange = (n) => Number.isInteger(n) && n >= 1 && n <= STORY_STAGE_COUNT;
    if (rawStory.cleared && typeof rawStory.cleared === "object") {
      for (const [k, v] of Object.entries(rawStory.cleared)) {
        const id = Number(k);
        if (!inRange(id)) continue;
        if (v === true) {
          story.cleared[id] = { first: 0, clears: 1 };
          continue;
        }
        if (!v || typeof v !== "object") continue;
        story.cleared[id] = {
          first: clampInt(v.first, 0, Number.MAX_SAFE_INTEGER, 0),
          clears: clampInt(v.clears, 1, 1e6, 1)
        };
      }
    }
    if (rawStory.rewarded && typeof rawStory.rewarded === "object") {
      for (const k of Object.keys(rawStory.rewarded)) {
        const id = Number(k);
        if (inRange(id) && story.cleared[id]) story.rewarded[id] = true;
      }
    }
    if (rawStory.drops && typeof rawStory.drops === "object") {
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
      for (const x of rawStory.seals) {
        if (SEAL_IDS.has(x)) story.seals.push(x);
        else {
          const u = SKILL_UNLOCKS.find((k) => k.charId === x);
          if (u && !story.skills.includes(u.skillId)) story.skills.push(u.skillId);
        }
      }
      story.seals = [...new Set(story.seals)];
    }
    if (rawStory.readTalks && typeof rawStory.readTalks === "object") {
      for (const k of Object.keys(rawStory.readTalks)) {
        if (/^\d{1,2}:(intro|clear)$/.test(k)) story.readTalks[k] = true;
      }
    }
    for (const u of SKILL_UNLOCKS) {
      if (story.cleared[u.stage] && !story.skills.includes(u.skillId)) story.skills.push(u.skillId);
    }
    for (const [stage, seal] of Object.entries(SEAL_BY_STAGE)) {
      if (story.cleared[stage] && !story.seals.includes(seal.id)) story.seals.push(seal.id);
    }
    const ids = Object.keys(story.cleared).map(Number);
    story.maxStage = ids.length ? Math.min(STORY_STAGE_COUNT, Math.max(...ids)) : 0;
    story.lastStage = inRange(Number(rawStory.lastStage)) ? Number(rawStory.lastStage) : Math.min(STORY_STAGE_COUNT, story.maxStage + 1) || 1;
    story.activeMatchId = null;
    for (const id of Object.keys(story.drops)) {
      base.cosmetics[id] = Math.max(1, base.cosmetics[id] || 0);
    }
    return story;
  }
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
  function ownedCharacters(profile2) {
    return CHARACTERS.filter((c) => {
      var _a;
      return (_a = profile2.chars[c.id]) == null ? void 0 : _a.owned;
    });
  }
  function ownsCharacter(profile2, id) {
    var _a;
    return !!((_a = profile2.chars[id]) == null ? void 0 : _a.owned);
  }
  function ownsCosmetic(profile2, id) {
    var _a;
    return (((_a = profile2.cosmetics) == null ? void 0 : _a[id]) || 0) > 0;
  }
  function ownedCosmetics(profile2, slot) {
    return COSMETICS.filter((c) => (!slot || c.slot === slot) && ownsCosmetic(profile2, c.id));
  }
  function equipCosmetic(profile2, { slot, id, charId }) {
    if (!COSMETIC_SLOTS.includes(slot)) return { ok: false, message: "\u305D\u306E\u30B9\u30ED\u30C3\u30C8\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002" };
    const cos = COSMETIC_BY_ID[id];
    if (!cos) return { ok: false, message: "\u305D\u306E\u30A2\u30A4\u30C6\u30E0\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002" };
    if (cos.slot !== slot) return { ok: false, message: `\u300C${cos.name}\u300D\u306F${slot}\u30B9\u30ED\u30C3\u30C8\u306B\u306F\u88C5\u5099\u3067\u304D\u307E\u305B\u3093\u3002` };
    if (!ownsCosmetic(profile2, id)) return { ok: false, message: `\u300C${cos.name}\u300D\u3092\u6240\u6301\u3057\u3066\u3044\u307E\u305B\u3093\u3002` };
    if (slot === "outfit" || slot === "accessory") {
      if (!CHARACTER_BY_ID[charId]) return { ok: false, message: "\u5BFE\u8C61\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u304C\u4E0D\u6B63\u3067\u3059\u3002" };
      if (!ownsCharacter(profile2, charId)) return { ok: false, message: "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u3092\u6240\u6301\u3057\u3066\u3044\u307E\u305B\u3093\u3002" };
      profile2.equipByChar[charId] = profile2.equipByChar[charId] || { ...DEFAULT_EQUIP };
      profile2.equipByChar[charId][slot] = id;
    } else {
      profile2.equipCommon[slot] = id;
    }
    profile2.updatedAt = Date.now();
    return { ok: true };
  }
  function resetEquipToDefault(profile2, { scope = "all", charId = null } = {}) {
    if (scope === "all" || scope === "char") {
      const targets = charId ? [charId] : Object.keys(profile2.equipByChar);
      for (const id of targets) {
        profile2.equipByChar[id] = { outfit: DEFAULT_EQUIP.outfit, accessory: DEFAULT_EQUIP.accessory };
      }
    }
    if (scope === "all" || scope === "common") {
      profile2.equipCommon = { board: DEFAULT_EQUIP.board, stone: DEFAULT_EQUIP.stone };
    }
    profile2.updatedAt = Date.now();
    return { ok: true };
  }
  function appearanceFor(profile2, charId) {
    var _a, _b, _c;
    const eq = ((_a = profile2.equipByChar) == null ? void 0 : _a[charId]) || { outfit: DEFAULT_EQUIP.outfit, accessory: DEFAULT_EQUIP.accessory };
    return {
      charId,
      outfit: ownsCosmetic(profile2, eq.outfit) ? eq.outfit : DEFAULT_EQUIP.outfit,
      accessory: ownsCosmetic(profile2, eq.accessory) ? eq.accessory : DEFAULT_EQUIP.accessory,
      stone: ownsCosmetic(profile2, (_b = profile2.equipCommon) == null ? void 0 : _b.stone) ? profile2.equipCommon.stone : DEFAULT_EQUIP.stone,
      board: ownsCosmetic(profile2, (_c = profile2.equipCommon) == null ? void 0 : _c.board) ? profile2.equipCommon.board : DEFAULT_EQUIP.board
    };
  }
  function bodyHash(obj) {
    const s = JSON.stringify(obj ?? null);
    let h1 = 2166136261;
    let h2 = 16777619;
    for (let i = 0; i < s.length; i += 1) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 + c + i, 2654435761) >>> 0;
    }
    return `${h1.toString(16)}-${h2.toString(16)}-${s.length}`;
  }
  const LEDGER_ERR_CONFLICT = "ledger_conflict";
  function ledgerLookup(profile2, requestId, body) {
    var _a, _b;
    if (!requestId) return { state: "new" };
    const hash = bodyHash(body);
    const hit = (_a = profile2.ledger) == null ? void 0 : _a[requestId];
    if (hit) return hit.hash !== hash ? { state: "conflict" } : { state: "replay", result: hit.result };
    const known = (_b = profile2.ledgerIds) == null ? void 0 : _b[requestId];
    if (known != null) return known !== hash ? { state: "conflict" } : { state: "processed" };
    return { state: "new" };
  }
  function ledgerRecord(profile2, requestId, body, result, limits) {
    if (!requestId) return;
    const hash = bodyHash(body);
    profile2.ledger = profile2.ledger || {};
    profile2.ledgerIds = profile2.ledgerIds || {};
    profile2.ledger[requestId] = { hash, result, at: Date.now() };
    profile2.ledgerIds[requestId] = hash;
    pruneLedger(profile2, limits);
  }
  function pruneLedger(profile2, limits = {}) {
    const full = Number.isFinite(limits.full) ? limits.full : 2e4;
    const ids = Number.isFinite(limits.ids) ? limits.ids : 5e4;
    const maxAgeMs = Number.isFinite(limits.maxAgeMs) ? limits.maxAgeMs : 90 * 24 * 3600 * 1e3;
    const entries = Object.entries(profile2.ledger || {});
    if (entries.length > full || entries.length >= 2e3) {
      const cutoff = Date.now() - maxAgeMs;
      const kept = entries.filter(([, v]) => (v.at || 0) >= cutoff);
      kept.sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
      profile2.ledger = Object.fromEntries(kept.slice(0, full));
    }
    const idKeys = Object.keys(profile2.ledgerIds || {});
    if (idKeys.length > ids) {
      const drop = idKeys.slice(0, idKeys.length - ids);
      for (const k of drop) delete profile2.ledgerIds[k];
    }
  }
  function effectiveWeights(profile2) {
    if (profile2.gachaRates) {
      const v = ratesToWeights(profile2.gachaRates);
      if (v.ok) return v.weights;
    }
    return defaultWeights();
  }
  function currentOfferRates(profile2) {
    return offerRates(effectiveWeights(profile2));
  }
  function pullGacha(profile2, { count, requestId, randomInt, ledgerLimits }) {
    const n = Number(count);
    if (![1, 10].includes(n)) return { ok: false, code: "bad_count", message: "\u30AC\u30C1\u30E3\u306F1\u56DE\u307E\u305F\u306F10+1\u56DE\u3060\u3051\u5B9F\u884C\u3067\u304D\u307E\u3059\u3002" };
    const body = { op: "gacha", count: n };
    const look = ledgerLookup(profile2, requestId, body);
    if (look.state === "replay") return { ok: true, result: look.result, replay: true };
    if (look.state === "processed") {
      return { ok: true, processed: true, result: null, replay: true, message: "\u3053\u306E\u64CD\u4F5C\u306F\u3059\u3067\u306B\u78BA\u5B9A\u6E08\u307F\u3067\u3059\uFF08\u7D50\u679C\u306E\u8A73\u7D30\u306F\u4FDD\u6301\u671F\u9593\u3092\u904E\u304E\u3066\u3044\u307E\u3059\uFF09\u3002" };
    }
    if (look.state === "conflict") return { ok: false, code: LEDGER_ERR_CONFLICT, message: "\u540C\u3058\u64CD\u4F5CID\u3067\u5185\u5BB9\u306E\u7570\u306A\u308B\u8981\u6C42\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002" };
    const drawCount = n === 10 ? GACHA_PULL_COUNT_MULTI : 1;
    const cost = n === 10 ? GACHA_COST_MULTI : GACHA_COST_SINGLE;
    if (profile2.perica < cost) {
      return { ok: false, code: "insufficient", message: `\u30DA\u30EA\u30AB\u304C\u8DB3\u308A\u307E\u305B\u3093\uFF08\u5FC5\u8981 ${cost} / \u6240\u6301 ${profile2.perica}\uFF09\u3002` };
    }
    const weights = effectiveWeights(profile2);
    const rates = weightsToRates(weights);
    let items;
    try {
      items = drawMany(drawCount, weights, randomInt);
    } catch (e) {
      return { ok: false, code: e.code || "draw_failed", message: e.message || "\u62BD\u9078\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002" };
    }
    const seenNew = /* @__PURE__ */ new Set();
    const entries = [];
    let dupPlayerXp = 0;
    const now = Date.now();
    for (const item of items) {
      const parsed = parseDrawId(item.drawId);
      let isNew = false;
      if (parsed.kind === "character") {
        const rec = profile2.chars[parsed.id];
        isNew = !rec.owned && !seenNew.has(item.drawId);
        if (isNew) {
          rec.owned = true;
          seenNew.add(item.drawId);
        }
        rec.count += 1;
        if (!isNew) rec.xp += DUP_CHAR_XP;
      } else {
        const had = (profile2.cosmetics[parsed.id] || 0) > 0;
        isNew = !had && !seenNew.has(item.drawId);
        if (isNew) seenNew.add(item.drawId);
        profile2.cosmetics[parsed.id] = (profile2.cosmetics[parsed.id] || 0) + 1;
        if (!isNew) {
          profile2.playerXp += DUP_PLAYER_XP;
          dupPlayerXp += DUP_PLAYER_XP;
        }
      }
      entries.push({
        drawId: item.drawId,
        kind: parsed.kind,
        refId: parsed.id,
        name: item.name,
        rarity: item.rarity,
        slot: item.slot ?? null,
        isNew,
        at: now,
        rates
      });
    }
    profile2.perica -= cost;
    profile2.gachaHistory.push(...entries.map((e) => ({
      at: e.at,
      drawId: e.drawId,
      name: e.name,
      rarity: e.rarity,
      isNew: e.isNew,
      rates: e.rates
    })));
    if (profile2.gachaHistory.length > GACHA_HISTORY_LIMIT) {
      profile2.gachaHistory = profile2.gachaHistory.slice(-GACHA_HISTORY_LIMIT);
    }
    profile2.updatedAt = now;
    const result = {
      count: drawCount,
      purchaseCount: n,
      bonusCount: n === 10 ? drawCount - 10 : 0,
      cost,
      entries,
      balance: profile2.perica,
      dupPlayerXp,
      rates
    };
    ledgerRecord(profile2, requestId, body, result, ledgerLimits);
    return { ok: true, result };
  }
  function trainCharacter(profile2, { charId, requestId, ledgerLimits }) {
    const body = { op: "train", charId };
    const look = ledgerLookup(profile2, requestId, body);
    if (look.state === "replay") return { ok: true, result: look.result, replay: true };
    if (look.state === "processed") {
      return { ok: true, processed: true, result: null, replay: true, message: "\u3053\u306E\u64CD\u4F5C\u306F\u3059\u3067\u306B\u78BA\u5B9A\u6E08\u307F\u3067\u3059\u3002" };
    }
    if (look.state === "conflict") return { ok: false, code: LEDGER_ERR_CONFLICT, message: "\u540C\u3058\u64CD\u4F5CID\u3067\u5185\u5BB9\u306E\u7570\u306A\u308B\u8981\u6C42\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002" };
    if (!CHARACTER_BY_ID[charId]) return { ok: false, code: "bad_char", message: "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002" };
    if (!ownsCharacter(profile2, charId)) return { ok: false, code: "not_owned", message: "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u3092\u6240\u6301\u3057\u3066\u3044\u307E\u305B\u3093\u3002" };
    if (profile2.perica < TRAIN_COST_PERICA) {
      return { ok: false, code: "insufficient", message: `\u30DA\u30EA\u30AB\u304C\u8DB3\u308A\u307E\u305B\u3093\uFF08\u5FC5\u8981 ${TRAIN_COST_PERICA}\uFF09\u3002` };
    }
    profile2.perica -= TRAIN_COST_PERICA;
    profile2.chars[charId].xp += TRAIN_CHAR_XP;
    profile2.updatedAt = Date.now();
    const result = { charId, xp: profile2.chars[charId].xp, level: charLevel(profile2.chars[charId].xp), balance: profile2.perica };
    ledgerRecord(profile2, requestId, body, result, ledgerLimits);
    return { ok: true, result };
  }
  function grantMatchReward(profile2, { matchId, outcome, charId, stonesPlaced = 0, skillsUsed = 0 }) {
    if (!matchId) return { ok: false, code: "bad_match", message: "\u8A66\u5408ID\u304C\u3042\u308A\u307E\u305B\u3093\u3002" };
    if (profile2.rewardedMatches[matchId]) {
      return { ok: true, result: { duplicated: true, perica: 0, playerXp: 0, charXp: 0, balance: profile2.perica } };
    }
    const kind = ["win", "lose", "draw", "aborted"].includes(outcome) ? outcome : "aborted";
    const perica = REWARD_PERICA[kind];
    const pXp = REWARD_PLAYER_XP[kind];
    const cXp = REWARD_CHAR_XP[kind];
    profile2.perica += perica;
    profile2.playerXp += pXp;
    if (charId && profile2.chars[charId]) profile2.chars[charId].xp += cXp;
    profile2.counters.stonesPlaced += Math.max(0, Math.floor(stonesPlaced));
    profile2.counters.skillsUsed += Math.max(0, Math.floor(skillsUsed));
    if (kind !== "aborted") {
      profile2.counters.matchesCompleted += 1;
      if (charId && !profile2.counters.charsUsed.includes(charId)) profile2.counters.charsUsed.push(charId);
    }
    if (kind === "win") profile2.counters.wins += 1;
    profile2.rewardedMatches[matchId] = true;
    profile2.updatedAt = Date.now();
    return { ok: true, result: { duplicated: false, outcome: kind, perica, playerXp: pXp, charXp: cXp, balance: profile2.perica } };
  }
  function canEnterStage(profile2, stageId) {
    var _a;
    const id = Number(stageId);
    if (!STAGE_BY_ID[id]) return { ok: false, code: "no_stage", message: "\u305D\u306E\u30B9\u30C6\u30FC\u30B8\u306F\u3042\u308A\u307E\u305B\u3093\u3002" };
    if (id === 1) return { ok: true };
    if ((_a = profile2.story) == null ? void 0 : _a.cleared[id - 1]) return { ok: true };
    return { ok: false, code: "locked", message: "\u524D\u306E\u30B9\u30C6\u30FC\u30B8\u3092\u5148\u306B\u8D8A\u3048\u3066\u304F\u3060\u3055\u3044\u3002" };
  }
  function beginStoryMatch(profile2, { stageId, matchId, onlineMatchId = null }) {
    const gate = canEnterStage(profile2, stageId);
    if (!gate.ok) return gate;
    if (onlineMatchId) {
      return { ok: false, code: "online_busy", message: "\u30AA\u30F3\u30E9\u30A4\u30F3\u5BFE\u6226\u306E\u9014\u4E2D\u306F\u3001\u7269\u8A9E\u3092\u59CB\u3081\u3089\u308C\u307E\u305B\u3093\u3002" };
    }
    if (!matchId) return { ok: false, code: "bad_match", message: "\u8A66\u5408ID\u304C\u3042\u308A\u307E\u305B\u3093\u3002" };
    profile2.story.activeMatchId = String(matchId);
    profile2.story.lastStage = Number(stageId);
    profile2.updatedAt = Date.now();
    return { ok: true, result: { stageId: Number(stageId), matchId: String(matchId) } };
  }
  function endStoryMatch(profile2, matchId) {
    var _a;
    if (((_a = profile2.story) == null ? void 0 : _a.activeMatchId) === String(matchId)) {
      profile2.story.activeMatchId = null;
      profile2.updatedAt = Date.now();
    }
    return { ok: true };
  }
  function grantStoryClear(profile2, { stageId, outcome = "win", charId = null, randomInt = null }) {
    const stage = STAGE_BY_ID[Number(stageId)];
    if (!stage) return { ok: false, code: "no_stage", message: "\u305D\u306E\u30B9\u30C6\u30FC\u30B8\u306F\u3042\u308A\u307E\u305B\u3093\u3002" };
    const kind = ["win", "lose", "draw", "aborted"].includes(outcome) ? outcome : "aborted";
    const id = stage.id;
    if (kind === "aborted") {
      profile2.story.activeMatchId = null;
      profile2.updatedAt = Date.now();
      return {
        ok: true,
        result: {
          cleared: false,
          first: false,
          stageId: id,
          outcome: kind,
          perica: 0,
          playerXp: 0,
          charXp: 0,
          drops: [],
          duplicate: null,
          seal: null,
          balance: profile2.perica,
          total: storyTotals(profile2)
        }
      };
    }
    const rec = profile2.story.cleared[id];
    const first = kind === "win" && !rec;
    let perica;
    if (kind === "win") perica = first ? stage.reward.first : stage.reward.repeat;
    else perica = STAGE_REWARD[kind];
    profile2.perica += perica;
    const xp = STORY_XP[kind];
    let playerXp = xp.player;
    const charXp = xp.char;
    if (charId && profile2.chars[charId]) profile2.chars[charId].xp += charXp;
    let seal = null;
    const drops = [];
    let duplicate = null;
    if (kind === "win") {
      profile2.story.cleared[id] = { first: (rec == null ? void 0 : rec.first) || Date.now(), clears: ((rec == null ? void 0 : rec.clears) || 0) + 1 };
      profile2.story.maxStage = Math.max(profile2.story.maxStage, id);
      profile2.story.lastStage = Math.min(STORY_STAGE_COUNT, id + 1) || id;
      if (first) profile2.story.rewarded[id] = true;
      const s = SEAL_BY_STAGE[id];
      if (s && !profile2.story.seals.includes(s.id)) {
        profile2.story.seals.push(s.id);
        seal = s;
      }
      const unlock = SKILL_UNLOCK_BY_STAGE[id];
      if (unlock && !profile2.story.skills.includes(unlock.skillId)) {
        profile2.story.skills.push(unlock.skillId);
      }
      if (stage.boss && stage.drops.length) {
        const got = pickStoryDrop(profile2, stage, { first, randomInt });
        if (got) {
          const had = (profile2.cosmetics[got] || 0) > 0;
          profile2.cosmetics[got] = (profile2.cosmetics[got] || 0) + 1;
          profile2.story.drops[got] = true;
          if (had) {
            duplicate = got;
            playerXp += DUPLICATE_DROP_XP;
          } else {
            drops.push(got);
          }
        }
      }
    }
    profile2.playerXp += playerXp;
    profile2.story.activeMatchId = null;
    profile2.updatedAt = Date.now();
    return {
      ok: true,
      result: {
        cleared: kind === "win",
        first,
        stageId: id,
        outcome: kind,
        perica,
        playerXp,
        charXp,
        drops,
        duplicate,
        seal,
        balance: profile2.perica,
        total: storyTotals(profile2)
      }
    };
  }
  function pickStoryDrop(profile2, stage, { first, randomInt }) {
    const list = stage.drops.filter((cid) => COSMETIC_BY_ID[cid]);
    if (!list.length) return null;
    if (first) return list[0];
    const unowned = list.filter((cid) => !(profile2.cosmetics[cid] > 0));
    const pool = unowned.length ? unowned : list;
    if (pool.length === 1) return pool[0];
    const pick = typeof randomInt === "function" ? randomInt(pool.length) : Math.floor(Math.random() * pool.length);
    return pool[Math.min(pool.length - 1, Math.max(0, pick))];
  }
  function storyTotals(profile2) {
    var _a, _b, _c, _d;
    const cleared = Object.keys(((_a = profile2.story) == null ? void 0 : _a.cleared) || {}).length;
    const earned = Object.keys(((_b = profile2.story) == null ? void 0 : _b.rewarded) || {}).reduce((n, k) => {
      var _a2;
      return n + (((_a2 = STAGE_BY_ID[Number(k)]) == null ? void 0 : _a2.reward.first) || 0);
    }, 0);
    return {
      clearedStages: cleared,
      totalStages: STORY_STAGE_COUNT,
      earnedPerica: earned,
      maxPerica: STORY_TOTAL_PERICA,
      skills: [...((_c = profile2.story) == null ? void 0 : _c.skills) || []],
      seals: [...((_d = profile2.story) == null ? void 0 : _d.seals) || []]
    };
  }
  function markTalkRead(profile2, stageId, kind) {
    if (!profile2.story) return { ok: false };
    const key = `${Number(stageId)}:${kind === "clear" ? "clear" : "intro"}`;
    profile2.story.readTalks[key] = true;
    profile2.updatedAt = Date.now();
    return { ok: true };
  }
  function isTalkRead(profile2, stageId, kind) {
    var _a, _b;
    return !!((_b = (_a = profile2.story) == null ? void 0 : _a.readTalks) == null ? void 0 : _b[`${Number(stageId)}:${kind === "clear" ? "clear" : "intro"}`]);
  }
  function missionProgress(profile2) {
    return MISSIONS.map((m) => {
      var _a, _b;
      const current = m.counter === "distinctCharsUsed" ? profile2.counters.charsUsed.length : profile2.counters[m.counter] || 0;
      const done = current >= m.goal;
      return {
        ...m,
        current: Math.min(current, m.goal),
        raw: current,
        done,
        claimed: !!((_a = profile2.missions[m.id]) == null ? void 0 : _a.claimed),
        claimable: done && !((_b = profile2.missions[m.id]) == null ? void 0 : _b.claimed)
      };
    });
  }
  function claimMission(profile2, missionId) {
    const m = MISSION_BY_ID[missionId];
    if (!m) return { ok: false, message: "\u305D\u306E\u30DF\u30C3\u30B7\u30E7\u30F3\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002" };
    const p = missionProgress(profile2).find((x) => x.id === missionId);
    if (!p.done) return { ok: false, message: "\u307E\u3060\u9054\u6210\u3057\u3066\u3044\u307E\u305B\u3093\u3002" };
    if (p.claimed) return { ok: false, message: "\u3059\u3067\u306B\u53D7\u3051\u53D6\u308A\u6E08\u307F\u3067\u3059\u3002" };
    profile2.missions[missionId].claimed = true;
    profile2.playerXp += m.playerXp;
    profile2.updatedAt = Date.now();
    return { ok: true, result: { playerXp: m.playerXp, total: profile2.playerXp } };
  }
  function summarize(profile2) {
    return {
      id: profile2.id,
      name: profile2.name,
      perica: profile2.perica,
      playerXp: profile2.playerXp,
      playerLevel: playerLevel(profile2.playerXp),
      ownedChars: ownedCharacters(profile2).map((c) => c.id),
      cosmeticCount: Object.values(profile2.cosmetics).reduce((a, b) => a + b, 0),
      equipCommon: { ...profile2.equipCommon }
    };
  }
  return { createProfile, createStoryArea, createSettingsArea, applySettings, normalizeProfile, playerLevel, charLevel, playerLevelProgress, charLevelProgress, ownedCharacters, ownsCharacter, ownsCosmetic, ownedCosmetics, equipCosmetic, resetEquipToDefault, appearanceFor, bodyHash, LEDGER_ERR_CONFLICT, ledgerLookup, ledgerRecord, pruneLedger, effectiveWeights, currentOfferRates, pullGacha, trainCharacter, grantMatchReward, canEnterStage, beginStoryMatch, endStoryMatch, grantStoryClear, storyTotals, markTalkRead, isTalkRead, missionProgress, claimMission, summarize };
});
__def("../../shared/rules.js", function(__req2) {
  const { BOARD_W, BOARD_H, BOARD_SIZE, WIN_LENGTH, MAX_ENERGY, NEIGHBOR_DIRS, LINE_DIRS, SEATS, COLUMN_LABELS, CHARACTER_BY_ID, SKILL_BY_CHARACTER, SKILL_BY_ID, indexToLabel } = __req2("../../shared/constants.js");
  const { RULESET, DEFAULT_PVP_RULESET, rulesetOf, rulesetOfState } = __req2("../../shared/rulesets.js");
  const { secureRandomInt } = __req2("../../shared/rng.js");
  const W = (s) => s.width || BOARD_W;
  const H = (s) => s.height || BOARD_H;
  const SEAT_COUNT = (s) => Array.isArray(s.seats) && s.seats.length ? s.seats.length : 3;
  const ICE_OFFSET = (s) => rulesetOfState(s).iceOffset || SEAT_COUNT(s);
  const seatNumbers = (s) => Array.from({ length: SEAT_COUNT(s) }, (_, i) => i + 1);
  const SIZE = (s) => s.stones.length;
  const toCoord = (s, i) => ({ col: i % W(s), row: Math.floor(i / W(s)) });
  const toIndex = (s, col, row) => row * W(s) + col;
  const within = (s, col, row) => col >= 0 && col < W(s) && row >= 0 && row < H(s);
  function labelOf(state, index) {
    const { col, row } = toCoord(state, index);
    const c = COLUMN_LABELS[col] || String.fromCharCode(65 + col);
    return `${c}${row + 1}`;
  }
  const ERR = Object.freeze({
    NOT_PLAYING: "not_playing",
    NOT_YOUR_TURN: "not_your_turn",
    BAD_INDEX: "bad_index",
    OCCUPIED: "occupied",
    FROZEN: "frozen",
    NO_SKILL: "no_skill",
    NOT_ENOUGH_ENERGY: "not_enough_energy",
    NO_USES_LEFT: "no_uses_left",
    BAD_TARGET: "bad_target",
    GUARDED: "guarded",
    NOT_ADJACENT: "not_adjacent",
    PASS_NOT_ALLOWED: "pass_not_allowed",
    BAD_ACTION: "bad_action",
    SKILL_LOCKED: "skill_locked",
    NEED_EXTRA: "need_extra",
    GUARDED_TRANSMUTE: "guarded_transmute"
  });
  const ERR_MESSAGE_JA = Object.freeze({
    [ERR.NOT_PLAYING]: "\u3053\u306E\u5BFE\u6226\u306F\u3059\u3067\u306B\u7D42\u4E86\u3057\u3066\u3044\u307E\u3059\u3002",
    [ERR.NOT_YOUR_TURN]: "\u3044\u307E\u306F\u3042\u306A\u305F\u306E\u624B\u756A\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    [ERR.BAD_INDEX]: "\u76E4\u9762\u306E\u5916\u306F\u9078\u3079\u307E\u305B\u3093\u3002",
    [ERR.OCCUPIED]: "\u305D\u3053\u306B\u306F\u3059\u3067\u306B\u77F3\u304C\u3042\u308A\u307E\u3059\u3002",
    [ERR.FROZEN]: "\u305D\u3053\u306F\u6C37\u7D50\u3067\u5C01\u9396\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    [ERR.NO_SKILL]: "\u305D\u306E\u30B9\u30AD\u30EB\u306F\u3053\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306B\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    [ERR.NOT_ENOUGH_ENERGY]: "\u30A8\u30CA\u30B8\u30FC\u304C\u8DB3\u308A\u307E\u305B\u3093\u3002",
    [ERR.NO_USES_LEFT]: "\u3053\u306E\u30B9\u30AD\u30EB\u306E\u4F7F\u7528\u56DE\u6570\u3092\u4F7F\u3044\u5207\u308A\u307E\u3057\u305F\u3002",
    [ERR.BAD_TARGET]: "\u305D\u306E\u5BFE\u8C61\u306B\u306F\u30B9\u30AD\u30EB\u3092\u4F7F\u3048\u307E\u305B\u3093\u3002",
    [ERR.GUARDED]: "\u5B88\u308A\u306E\u3042\u308B\u77F3\u306B\u306F\u52B9\u679C\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
    [ERR.NOT_ADJACENT]: "\u79FB\u52D5\u5148\u306F\u96A3\u63A5\u3059\u308B8\u65B9\u5411\u306E\u7A7A\u304D\u4EA4\u70B9\u3060\u3051\u3067\u3059\u3002",
    [ERR.PASS_NOT_ALLOWED]: "\u7F6E\u3051\u308B\u4EA4\u70B9\u304C\u3042\u308B\u305F\u3081\u30D1\u30B9\u306F\u3067\u304D\u307E\u305B\u3093\u3002",
    [ERR.BAD_ACTION]: "\u4E0D\u6B63\u306A\u64CD\u4F5C\u3067\u3059\u3002",
    [ERR.SKILL_LOCKED]: "\u3053\u306E\u6280\u306F\u73FE\u5728\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093\u3002",
    [ERR.NEED_EXTRA]: "\u8FFD\u52A0\u914D\u7F6E\u304C\u6B8B\u3063\u3066\u3044\u307E\u3059\u3002\u5148\u306B\u7F6E\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
    [ERR.GUARDED_TRANSMUTE]: "\u7D50\u754C\u306B\u5B88\u3089\u308C\u3066\u3044\u308B\u305F\u3081\u8EE2\u5149\u3067\u304D\u307E\u305B\u3093\u3002"
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
  function createMatch(opts) {
    var _a;
    const ruleset = opts.ruleset || DEFAULT_PVP_RULESET;
    const seatCount = ((_a = opts.seats) == null ? void 0 : _a.length) || SEATS.length;
    const seatList = Array.from({ length: seatCount }, (_, i) => i + 1);
    const seats = seatList.map((seat) => {
      const s = opts.seats.find((x) => Number(x.seat) === seat);
      if (!s) throw new Error(`seat ${seat} \u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093`);
      if (!CHARACTER_BY_ID[s.charId]) throw new Error(`\u672A\u77E5\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC: ${s.charId}`);
      return {
        seat,
        name: String(s.name ?? `P${seat}`),
        charId: s.charId,
        kind: s.kind === "cpu" ? "cpu" : "human",
        userId: s.userId ?? null,
        cosmetics: s.cosmetics ?? null,
        // 物語の主人公は複数の術を持つ。3人対戦では指定しない（＝null。キャラの技1つ）。
        // 空配列は「術なし」を意味する（物語の第1〜2段）。
        skills: Array.isArray(s.skills) ? s.skills.filter((id) => SKILL_BY_ID[id]) : null
      };
    });
    const rs = rulesetOf(ruleset);
    const v99 = rs.v99 || null;
    let startSeat = Number(opts.startSeat);
    if (!seatList.includes(startSeat)) startSeat = seatList[0];
    const order = v99 ? seatList.map((_, i) => seatList[(seatList.indexOf(startSeat) + i) % seatList.length]) : null;
    const zeros = (v) => Object.fromEntries(seatList.map((n) => [n, v]));
    return {
      matchId: String(opts.matchId),
      mode: opts.mode || "local",
      ruleset,
      width: BOARD_W,
      height: BOARD_H,
      stones: new Array(BOARD_SIZE).fill(0),
      guards: new Array(BOARD_SIZE).fill(0),
      ice: new Array(BOARD_SIZE).fill(0),
      // 0 or release opCount
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
        return [n, sk ? Math.max(sk.uses, (enhanced == null ? void 0 : enhanced.usesFloor) || 0) : 0];
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
      status: "playing",
      result: null,
      lastAction: null,
      events: [],
      startedAt: opts.startedAt ?? Date.now(),
      finishedAt: null
    };
  }
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
  function findWinningLine(state, preferOwner = 0) {
    const found = [];
    for (let row = 0; row < H(state); row += 1) {
      for (let col = 0; col < W(state); col += 1) {
        const idx = toIndex(state, col, row);
        const owner = state.stones[idx];
        if (!owner) continue;
        for (const [dc, dr] of LINE_DIRS) {
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
    found.sort((a, b) => a.owner - b.owner || b.line.length - a.line.length);
    return found[0];
  }
  function effectiveSkill(state, skill) {
    var _a, _b;
    if (!skill) return skill;
    const t = rulesetOfState(state).skillTuning;
    if (!t) return skill;
    const cost = (_a = t.costs) == null ? void 0 : _a[skill.id];
    const uses = (_b = t.uses) == null ? void 0 : _b[skill.id];
    if (cost == null && uses == null) return skill;
    return {
      ...skill,
      cost: Number.isFinite(cost) ? cost : skill.cost,
      uses: Number.isFinite(uses) ? uses : skill.uses
    };
  }
  function skillInRuleset(rulesetId, skill) {
    return effectiveSkill({ ruleset: rulesetId }, skill);
  }
  function skillForSeat(state, seat) {
    var _a;
    const s = (_a = state.seats) == null ? void 0 : _a.find((x) => x.seat === Number(seat));
    return s ? effectiveSkill(state, SKILL_BY_CHARACTER[s.charId]) : null;
  }
  function minStoneResult(state) {
    const counts = {};
    for (const n of seatNumbers(state)) counts[n] = 0;
    for (const v of state.stones) if (counts[v] != null) counts[v] += 1;
    const min = Math.min(...Object.values(counts));
    const winners = seatNumbers(state).filter((n) => counts[n] === min);
    return {
      kind: winners.length === 1 ? "win" : "co_win",
      winner: winners.length === 1 ? winners[0] : 0,
      winners,
      stoneCounts: counts,
      line: [],
      reason: "min_stones"
    };
  }
  function isWinnerSeat(result, seat) {
    if (!result) return false;
    if (Array.isArray(result.winners)) return result.winners.includes(Number(seat));
    return result.kind === "win" && Number(result.winner) === Number(seat);
  }
  function outcomeForSeat(result, seat) {
    if (!result) return "draw";
    if (result.kind === "aborted") return "aborted";
    if (result.kind === "draw") return "draw";
    return isWinnerSeat(result, seat) ? "win" : "lose";
  }
  function v99Of(state) {
    return rulesetOfState(state).v99 || null;
  }
  function turnClock(state) {
    return v99Of(state) ? state.ply || 0 : state.opCount;
  }
  function orderIndexOf(state, seat) {
    if (Array.isArray(state.order)) {
      const i = state.order.indexOf(Number(seat));
      return i < 0 ? 0 : i;
    }
    return Number(seat) - 1;
  }
  function unlockTurnOf(state, seat) {
    const v = v99Of(state);
    if (!v) return Infinity;
    return v.unlockTurn + (v.unlockOffsetByOrder[orderIndexOf(state, seat)] || 0);
  }
  function isEnhanced(state, seat) {
    var _a;
    const v = v99Of(state);
    if (!v) return false;
    return (((_a = state.turnsTaken) == null ? void 0 : _a[seat]) || 0) >= unlockTurnOf(state, seat);
  }
  function v99FormOf(state, seat, skillId) {
    const v = v99Of(state);
    if (!v) return null;
    const s = seatOf(state, seat);
    const base = effectiveSkill(state, SKILL_BY_ID[skillId]);
    if (!s || !base) return null;
    if (isEnhanced(state, seat)) {
      const e = v.enhance[s.charId];
      if (!e) return { form: "normal", cost: base.cost, extra: 0, locked: false };
      const pen = v.orderPenalty[orderIndexOf(state, seat)] || 0;
      return { form: "enhanced", cost: e.cost, extra: Math.max(0, e.extra - pen), locked: false };
    }
    const locked = v.lockedSkills.includes(skillId);
    return { form: "normal", cost: base.cost, extra: 0, locked };
  }
  function usesCapOf(state, seat, skillId) {
    var _a, _b, _c;
    const v = v99Of(state);
    const base = effectiveSkill(state, SKILL_BY_ID[skillId]);
    if (!v) return base ? base.uses : 0;
    const cap = (_a = state.usesCap) == null ? void 0 : _a[seat];
    const current = Number.isFinite(cap) ? cap : base ? base.uses : 0;
    if (v.unlockTurn <= 0) {
      const charId = (_b = seatOf(state, seat)) == null ? void 0 : _b.charId;
      return Math.max(current, ((_c = v.enhance[charId]) == null ? void 0 : _c.usesFloor) || 0);
    }
    return current;
  }
  function beginTurnFor(state, seat) {
    var _a;
    state.energy[seat] = Math.min(MAX_ENERGY, state.energy[seat] + 1);
    const v = v99Of(state);
    if (!v || !state.turnsTaken) return;
    state.turnsTaken[seat] = (state.turnsTaken[seat] || 0) + 1;
    const n = state.turnsTaken[seat];
    const s = seatOf(state, seat);
    const e = s ? v.enhance[s.charId] : null;
    if (!e) return;
    const used = usesOf(state, seat, (_a = SKILL_BY_CHARACTER[s.charId]) == null ? void 0 : _a.id);
    if (n === unlockTurnOf(state, seat)) {
      state.usesCap[seat] = Math.max(state.usesCap[seat] || 0, used + e.usesFloor);
    }
    if (n === v.longTurn && v.longRecover.includes(s.charId)) {
      state.usesCap[seat] = Math.max(state.usesCap[seat] || 0, used + 1);
    }
  }
  function v99Info(state, seat) {
    var _a, _b;
    const v = v99Of(state);
    if (!v) return null;
    const s = seatOf(state, seat);
    const skillId = (_a = SKILL_BY_CHARACTER[s == null ? void 0 : s.charId]) == null ? void 0 : _a.id;
    const form = skillId ? v99FormOf(state, seat, skillId) : null;
    const turns = ((_b = state.turnsTaken) == null ? void 0 : _b[seat]) || 0;
    const unlock = unlockTurnOf(state, seat);
    return {
      seat,
      startSeat: state.startSeat,
      orderIndex: orderIndexOf(state, seat),
      turnsTaken: turns,
      unlockTurn: unlock,
      turnsToUnlock: Math.max(0, unlock - turns),
      enhanced: isEnhanced(state, seat),
      locked: !!(form == null ? void 0 : form.locked),
      cost: (form == null ? void 0 : form.cost) ?? null,
      extra: (form == null ? void 0 : form.extra) ?? 0,
      usesLeft: skillId ? Math.max(0, usesCapOf(state, seat, skillId) - usesOf(state, seat, skillId)) : 0,
      pending: state.pending && state.pending.seat === seat ? state.pending.remaining : 0
    };
  }
  function requirePlaying(state) {
    if (state.status !== "playing") throw new RuleError(ERR.NOT_PLAYING);
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
  function skillsOf(state, seat) {
    const s = seatOf(state, seat);
    if (!s) return [];
    if (Array.isArray(s.skills)) {
      return s.skills.map((id) => effectiveSkill(state, SKILL_BY_ID[id])).filter(Boolean);
    }
    const one = effectiveSkill(state, SKILL_BY_CHARACTER[s.charId]);
    return one ? [one] : [];
  }
  function skillOfId(state, seat, skillId) {
    return skillsOf(state, seat).find((sk) => sk.id === skillId) || null;
  }
  function usesOf(state, seat, skillId) {
    const u = state.skillUses[seat];
    if (u && typeof u === "object") return Number(u[skillId] || 0);
    return Number(u || 0);
  }
  function addUse(state, seat, skillId) {
    const u = state.skillUses[seat];
    if (u && typeof u === "object") u[skillId] = Number(u[skillId] || 0) + 1;
    else state.skillUses[seat] = Number(u || 0) + 1;
  }
  function pushEvent(state, ev) {
    state.eventSeq += 1;
    const full = {
      ...ev,
      id: `${state.matchId}#${state.opCount}`,
      seq: state.eventSeq,
      at: ev.at ?? Date.now()
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
      state.turn = state.turn % SEAT_COUNT(state) + 1;
    }
    beginTurnFor(state, state.turn);
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
      state.status = "finished";
      state.result = { kind: "win", winner: win.owner, winners: [win.owner], line: win.line, reason: "five" };
      state.finishedAt = Date.now();
      return;
    }
    if (state.pending && state.pending.remaining > 0) {
      if (legalPlacements(state).length > 0) return;
      state.pending = null;
    }
    state.pending = null;
    state.ply += 1;
    if (emptyCount(state) === 0) {
      state.status = "finished";
      state.result = rulesetOfState(state).minStoneJudgement ? minStoneResult(state) : { kind: "draw", winner: 0, line: [], reason: "board_full" };
      state.finishedAt = Date.now();
      return;
    }
    advanceTurn(state);
  }
  function applyAction(state, action2) {
    const next = cloneState(state);
    try {
      const event = perform(next, action2);
      return { ok: true, state: next, event };
    } catch (e) {
      if (e instanceof RuleError) {
        return { ok: false, code: e.code, message: e.message };
      }
      throw e;
    }
  }
  function perform(state, action2) {
    if (!action2 || typeof action2 !== "object") throw new RuleError(ERR.BAD_ACTION);
    requirePlaying(state);
    const seat = Number(action2.seat);
    if (!Number.isInteger(seat) || seat < 1 || seat > SEAT_COUNT(state)) throw new RuleError(ERR.BAD_ACTION);
    requireTurn(state, seat);
    if (state.pending && state.pending.remaining > 0) {
      if (state.pending.seat !== seat) throw new RuleError(ERR.NOT_YOUR_TURN);
      if (action2.type !== "extra") throw new RuleError(ERR.NEED_EXTRA);
      return doExtra(state, seat, Number(action2.index));
    }
    switch (action2.type) {
      case "place":
        return doPlace(state, seat, Number(action2.index));
      case "pass":
        return doPass(state, seat);
      case "skill":
        return doSkill(state, seat, action2);
      case "extra":
        throw new RuleError(ERR.BAD_ACTION);
      default:
        throw new RuleError(ERR.BAD_ACTION);
    }
  }
  function doPlace(state, seat, index) {
    requireIndex(state, index);
    if (state.stones[index] !== 0) throw new RuleError(ERR.OCCUPIED);
    if (isFrozen(state, index)) throw new RuleError(ERR.FROZEN);
    state.stones[index] = seat;
    state.guards[index] = 0;
    state.stats[seat].placed += 1;
    state.lastAction = { type: "place", seat, index };
    const ev = pushEvent(state, {
      type: "place",
      seat,
      index,
      charId: seatOf(state, seat).charId,
      label: labelOf(state, index)
    });
    finalizeAfterOperation(state, seat, ev);
    return ev;
  }
  function doPass(state, seat) {
    if (legalPlacements(state).length > 0) throw new RuleError(ERR.PASS_NOT_ALLOWED);
    state.lastAction = { type: "pass", seat };
    const ev = pushEvent(state, { type: "pass", seat, charId: seatOf(state, seat).charId });
    finalizeAfterOperation(state, seat, ev);
    return ev;
  }
  function doSkill(state, seat, action2) {
    const seatInfo = seatOf(state, seat);
    const list = skillsOf(state, seat);
    if (!list.length) throw new RuleError(ERR.NO_SKILL);
    const skill = action2.skillId ? list.find((sk) => sk.id === action2.skillId) : list.length === 1 ? list[0] : null;
    if (!skill) throw new RuleError(ERR.NO_SKILL);
    const v = v99Of(state);
    const form = v ? v99FormOf(state, seat, skill.id) : null;
    if (form && form.locked) throw new RuleError(ERR.SKILL_LOCKED);
    const cost = form ? form.cost : skill.cost;
    const maxUses = v ? usesCapOf(state, seat, skill.id) : skill.uses;
    if (state.energy[seat] < cost) throw new RuleError(ERR.NOT_ENOUGH_ENERGY);
    if (usesOf(state, seat, skill.id) >= maxUses) throw new RuleError(ERR.NO_USES_LEFT);
    const detail = SKILL_HANDLERS[skill.id](state, seat, action2);
    state.energy[seat] -= cost;
    if (detail.brokeWard && v && v.wardBreakEnergy) {
      state.energy[seat] = Math.min(MAX_ENERGY, state.energy[seat] + v.wardBreakEnergy);
    }
    addUse(state, seat, skill.id);
    state.stats[seat].skills += 1;
    state.lastAction = { type: "skill", seat, skillId: skill.id, ...detail };
    const ev = pushEvent(state, {
      type: "skill",
      seat,
      charId: seatInfo.charId,
      charName: CHARACTER_BY_ID[seatInfo.charId].name,
      skillId: skill.id,
      skillName: skill.name,
      extra: form ? form.extra : 0,
      ...detail
    });
    if (form && form.extra > 0) {
      state.pending = { seat, remaining: form.extra, banned: bannedFor(state, skill.id, detail), skillId: skill.id };
    }
    finalizeAfterOperation(state, seat, ev);
    return ev;
  }
  function bannedFor(state, skillId, detail) {
    const v = v99Of(state);
    switch (skillId) {
      case "spark":
        return v && v.sparkCanRefill ? null : detail.index;
      case "windwalk":
        return detail.to;
      case "pull":
        return detail.to;
      case "freeze":
        return detail.index;
      default:
        return null;
    }
  }
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
    state.lastAction = { type: "extra", seat, index };
    const ev = pushEvent(state, {
      type: "extra",
      seat,
      index,
      charId: seatOf(state, seat).charId,
      label: labelOf(state, index),
      remaining: state.pending.remaining
    });
    finalizeAfterOperation(state, seat, ev);
    return ev;
  }
  function requireEnemyStone(state, seat, index, opts = {}) {
    requireIndex(state, index);
    const owner = state.stones[index];
    if (owner === 0 || owner === seat) throw new RuleError(ERR.BAD_TARGET);
    if (!opts.allowGuarded && state.guards[index]) {
      throw new RuleError(opts.guardedError || ERR.GUARDED);
    }
    return owner;
  }
  function requireEnemyUnguardedStone(state, seat, index) {
    return requireEnemyStone(state, seat, index);
  }
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
    spark(state, seat, action2) {
      const index = Number(action2.index);
      const breaks = sparkBreaksWard(state);
      const owner = requireEnemyStone(state, seat, index, { allowGuarded: breaks });
      const warded = !!state.guards[index];
      state.stones[index] = 0;
      state.guards[index] = 0;
      return { index, targetOwner: owner, brokeWard: breaks && warded };
    },
    // マモリ / 結界
    ward(state, seat, action2) {
      const index = Number(action2.index);
      requireOwnStone(state, seat, index);
      if (state.guards[index]) throw new RuleError(ERR.BAD_TARGET);
      state.guards[index] = 1;
      return { index, targetOwner: seat };
    },
    // ハヤテ / 風渡り
    windwalk(state, seat, action2) {
      const from = Number(action2.from);
      const to = Number(action2.to);
      requireOwnStone(state, seat, from);
      requireMoveDestination(state, from, to);
      const guard = state.guards[from];
      state.stones[from] = 0;
      state.guards[from] = 0;
      state.stones[to] = seat;
      state.guards[to] = guard;
      return { from, to, targetOwner: seat };
    },
    // ユキネ / 氷結
    freeze(state, seat, action2) {
      const index = Number(action2.index);
      requireIndex(state, index);
      if (state.stones[index] !== 0) throw new RuleError(ERR.BAD_TARGET);
      if (isFrozen(state, index)) throw new RuleError(ERR.FROZEN);
      state.ice[index] = turnClock(state) + ICE_OFFSET(state);
      state.iceOwner[index] = seat;
      return { index, releaseAt: state.ice[index] };
    },
    // クオン / 引力
    pull(state, seat, action2) {
      const from = Number(action2.from);
      const to = Number(action2.to);
      const owner = requireEnemyUnguardedStone(state, seat, from);
      requireMoveDestination(state, from, to);
      state.stones[from] = 0;
      state.guards[from] = 0;
      state.stones[to] = owner;
      state.guards[to] = 0;
      return { from, to, targetOwner: owner };
    },
    // アカリ / 転光
    transmute(state, seat, action2) {
      const index = Number(action2.index);
      const owner = requireEnemyStone(state, seat, index, {
        guardedError: v99Of(state) ? ERR.GUARDED_TRANSMUTE : ERR.GUARDED
      });
      state.stones[index] = seat;
      state.guards[index] = 0;
      return { index, targetOwner: owner, newOwner: seat };
    }
  };
  function skillFirstTargets(state, seat, skillId = null) {
    const list = skillsOf(state, seat);
    const skill = skillId ? list.find((sk) => sk.id === skillId) : list[0];
    if (!skill) return [];
    const out = [];
    for (let i = 0; i < SIZE(state); i += 1) {
      const owner = state.stones[i];
      switch (skill.targets[0]) {
        case "enemyStone":
          if (owner !== 0 && owner !== seat && (!state.guards[i] || skill.id === "spark" && sparkBreaksWard(state))) out.push(i);
          break;
        case "ownStone":
          if (owner === seat && !(skill.id === "ward" && state.guards[i])) out.push(i);
          break;
        case "empty":
          if (owner === 0 && !isFrozen(state, i)) out.push(i);
          break;
        default:
          break;
      }
    }
    if (skill.targets.length > 1) {
      return out.filter((i) => skillSecondTargets(state, i).length > 0);
    }
    return out;
  }
  function skillSecondTargets(state, fromIndex) {
    return neighborsOf(state, fromIndex).filter((i) => state.stones[i] === 0 && !isFrozen(state, i));
  }
  function usableSkills(state, seat) {
    const v = v99Of(state);
    return skillsOf(state, seat).map((skill) => {
      var _a;
      const form = v ? v99FormOf(state, seat, skill.id) : null;
      const cost = form ? form.cost : skill.cost;
      const maxUses = v ? usesCapOf(state, seat, skill.id) : skill.uses;
      const left = Math.max(0, maxUses - usesOf(state, seat, skill.id));
      let code = null;
      if (state.status !== "playing") code = ERR.NOT_PLAYING;
      else if (state.turn !== Number(seat)) code = ERR.NOT_YOUR_TURN;
      else if (state.pending && state.pending.remaining > 0) code = ERR.NEED_EXTRA;
      else if (form && form.locked) code = ERR.SKILL_LOCKED;
      else if (left <= 0) code = ERR.NO_USES_LEFT;
      else if (state.energy[seat] < cost) code = ERR.NOT_ENOUGH_ENERGY;
      else if (skillFirstTargets(state, seat, skill.id).length === 0) code = ERR.BAD_TARGET;
      return {
        skill,
        left,
        used: usesOf(state, seat, skill.id),
        ok: !code,
        code,
        cost,
        extra: form ? form.extra : 0,
        locked: !!(form == null ? void 0 : form.locked),
        turnsToUnlock: v ? Math.max(0, unlockTurnOf(state, seat) - (((_a = state.turnsTaken) == null ? void 0 : _a[seat]) || 0)) : 0
      };
    });
  }
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
    return state.status === "playing" && legalPlacements(state).length === 0;
  }
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
        total += 1e6;
      } else {
        const base = SCORE_TABLE[Math.min(count, 4)] || 1;
        total += base * (openEnds === 2 ? 3 : openEnds === 1 ? 1 : 0.15);
      }
    }
    return { total, best };
  }
  const WINDOW_CACHE = /* @__PURE__ */ new Map();
  function windowsOf(state) {
    const w = W(state);
    const h = H(state);
    const key = `${w}x${h}`;
    if (WINDOW_CACHE.has(key)) return WINDOW_CACHE.get(key);
    const out = [];
    for (const [dc, dr] of LINE_DIRS) {
      for (let r = 0; r < h; r += 1) {
        for (let c = 0; c < w; c += 1) {
          const cells = [];
          let ok = true;
          for (let k = 0; k < WIN_LENGTH; k += 1) {
            const cc = c + dc * k;
            const rr = r + dr * k;
            if (!within(state, cc, rr)) {
              ok = false;
              break;
            }
            cells.push(toIndex(state, cc, rr));
          }
          if (ok) out.push(cells);
        }
      }
    }
    WINDOW_CACHE.set(key, out);
    return out;
  }
  function fillWinCells(state, seat, k, banned = null) {
    if (k < 1) return null;
    let best = null;
    for (const win of windowsOf(state)) {
      let mine = 0;
      const gaps = [];
      let ok = true;
      for (const i of win) {
        const v = state.stones[i];
        if (v === seat) {
          mine += 1;
          continue;
        }
        if (v !== 0) {
          ok = false;
          break;
        }
        if (isFrozen(state, i)) {
          ok = false;
          break;
        }
        if (banned != null && i === banned) {
          ok = false;
          break;
        }
        gaps.push(i);
        if (gaps.length > k) {
          ok = false;
          break;
        }
      }
      if (!ok || mine + gaps.length < WIN_LENGTH || gaps.length === 0) continue;
      if (!best || gaps.length < best.length) best = gaps;
      if (best.length === 1) break;
    }
    return best;
  }
  function immediateWinCells(state, seat) {
    const out = [];
    for (const win of windowsOf(state)) {
      let mine = 0;
      let gap = -1;
      let ok = true;
      for (const i of win) {
        const v = state.stones[i];
        if (v === seat) {
          mine += 1;
          continue;
        }
        if (v !== 0) {
          ok = false;
          break;
        }
        if (gap >= 0) {
          ok = false;
          break;
        }
        gap = i;
      }
      if (ok && mine === WIN_LENGTH - 1 && gap >= 0 && canPlaceAt(state, gap)) out.push(gap);
    }
    return out;
  }
  function bestCleanWindowCell(state, seat, banned = null) {
    let best = -1;
    let bestKey = -Infinity;
    for (const win of windowsOf(state)) {
      let mine = 0;
      const gaps = [];
      let ok = true;
      for (const i of win) {
        const v = state.stones[i];
        if (v === seat) {
          mine += 1;
          continue;
        }
        if (v !== 0) {
          ok = false;
          break;
        }
        if (isFrozen(state, i)) {
          ok = false;
          break;
        }
        gaps.push(i);
      }
      if (!ok || gaps.length === 0) continue;
      const key = mine * 100 - gaps.length * 10;
      if (key <= bestKey) continue;
      for (const g of gaps) {
        if (!canPlaceAt(state, g) || g === banned) continue;
        bestKey = key;
        best = g;
        break;
      }
    }
    return best >= 0 ? best : null;
  }
  function chooseExtraIndex(state, seat) {
    var _a, _b;
    const banned = ((_a = state.pending) == null ? void 0 : _a.banned) ?? null;
    const win = fillWinCells(state, seat, 1, banned);
    if (win && win.length === 1) return win[0];
    const remaining = ((_b = state.pending) == null ? void 0 : _b.remaining) ?? 1;
    const reach = fillWinCells(state, seat, remaining, banned);
    if (reach) {
      for (const c of reach) if (canPlaceAt(state, c) && c !== banned) return c;
    }
    const danger = dangerMap(state, seat);
    if (danger.size) {
      let best = -1;
      let bestV = -Infinity;
      for (const [cell, v] of danger) {
        if (!canPlaceAt(state, cell) || cell === banned) continue;
        if (v > bestV) {
          bestV = v;
          best = cell;
        }
      }
      if (best >= 0 && bestV >= 3) return best;
    }
    const clean = bestCleanWindowCell(state, seat, banned);
    if (clean != null) return clean;
    for (let i = 0; i < SIZE(state); i += 1) if (canPlaceAt(state, i) && i !== banned) return i;
    return null;
  }
  function blockerValue(state, seat, index) {
    const owner = state.stones[index];
    if (owner === 0 || owner === seat) return 0;
    let best = 0;
    for (const win of windowsOf(state)) {
      if (!win.includes(index)) continue;
      let mine = 0;
      let ok = true;
      for (const i of win) {
        if (i === index) continue;
        const v = state.stones[i];
        if (v === seat) {
          mine += 1;
          continue;
        }
        if (v !== 0) {
          ok = false;
          break;
        }
        if (isFrozen(state, i)) {
          ok = false;
          break;
        }
      }
      if (ok && mine > best) best = mine;
    }
    return best;
  }
  function neutralSkillBody(state, seat, skillId) {
    const pick = (test, score) => {
      let best = -1;
      let bestS = -Infinity;
      for (let i = 0; i < SIZE(state); i += 1) {
        if (!test(i)) continue;
        const v = score(i);
        if (v > bestS) {
          bestS = v;
          best = i;
        }
      }
      return best;
    };
    switch (skillId) {
      case "spark": {
        const breaks = sparkBreaksWard(state);
        const i = pick(
          (x) => state.stones[x] !== 0 && state.stones[x] !== seat && (breaks || !state.guards[x]),
          (x) => blockerValue(state, seat, x) * 1e4 + (breaks && state.guards[x] ? 5e3 : 0) + runScoreFor(state, x, state.stones[x]).total
        );
        return i < 0 ? null : { index: i };
      }
      case "transmute": {
        const i = pick(
          (x) => state.stones[x] !== 0 && state.stones[x] !== seat && !state.guards[x],
          (x) => runScoreFor(state, x, seat).total
        );
        return i < 0 ? null : { index: i };
      }
      case "ward": {
        const i = pick(
          (x) => state.stones[x] === seat && !state.guards[x],
          (x) => runScoreFor(state, x, seat).total
        );
        return i < 0 ? null : { index: i };
      }
      case "freeze": {
        const i = pick((x) => state.stones[x] === 0 && !isFrozen(state, x), (x) => {
          let m = -Infinity;
          for (const o of seatNumbers(state)) if (o !== seat) m = Math.max(m, runScoreFor(state, x, o).total);
          return m;
        });
        return i < 0 ? null : { index: i };
      }
      case "windwalk": {
        for (let i = 0; i < SIZE(state); i += 1) {
          if (state.stones[i] !== seat) continue;
          for (const to of neighborsOf(state, i)) {
            if (state.stones[to] === 0 && !isFrozen(state, to)) return { from: i, to };
          }
        }
        return null;
      }
      case "pull": {
        for (let i = 0; i < SIZE(state); i += 1) {
          const v = state.stones[i];
          if (!v || v === seat || state.guards[i]) continue;
          for (const to of neighborsOf(state, i)) {
            if (state.stones[to] === 0 && !isFrozen(state, to)) return { from: i, to };
          }
        }
        return null;
      }
      default:
        return null;
    }
  }
  function burstOf(state, seat) {
    var _a, _b;
    const v = v99Of(state);
    if (!v) return 1;
    const n = (((_a = state.turnsTaken) == null ? void 0 : _a[seat]) || 0) + 1;
    if (n < unlockTurnOf(state, seat)) return 1;
    const st = seatOf(state, seat);
    const e = st ? v.enhance[st.charId] : null;
    if (!e) return 1;
    const pen = v.orderPenalty[orderIndexOf(state, seat)] || 0;
    const extra = Math.max(0, e.extra - pen);
    if (extra <= 0) return 1;
    const energy = Math.min(MAX_ENERGY, state.energy[seat] + 1);
    const skillId = (_b = SKILL_BY_CHARACTER[st.charId]) == null ? void 0 : _b.id;
    let cap = usesCapOf(state, seat, skillId);
    if (n === unlockTurnOf(state, seat)) cap = Math.max(cap, usesOf(state, seat, skillId) + e.usesFloor);
    if (cap - usesOf(state, seat, skillId) <= 0 || energy < e.cost) return 1;
    return extra;
  }
  function dangerMap(state, seat) {
    const danger = /* @__PURE__ */ new Map();
    const bump = (cell, v) => danger.set(cell, (danger.get(cell) || 0) + v);
    for (const o of seatNumbers(state)) {
      if (o === seat) continue;
      for (const c of immediateWinCells(state, o)) bump(c, 100);
      const burst = burstOf(state, o);
      if (burst < 2) continue;
      for (const win of windowsOf(state)) {
        let mine = 0;
        const gaps = [];
        let ok = true;
        for (const i of win) {
          const v = state.stones[i];
          if (v === o) {
            mine += 1;
            continue;
          }
          if (v !== 0 || isFrozen(state, i)) {
            ok = false;
            break;
          }
          gaps.push(i);
          if (gaps.length > burst) {
            ok = false;
            break;
          }
        }
        if (!ok || mine + gaps.length < WIN_LENGTH) continue;
        for (const g of gaps) bump(g, WIN_LENGTH + 1 - gaps.length);
      }
    }
    return danger;
  }
  function skillWinPlan(state, seat, u) {
    const k = u.extra;
    const id = u.skill.id;
    if (id !== "transmute" && id !== "pull" && id !== "windwalk") return null;
    for (const win of windowsOf(state)) {
      let mine = 0;
      const gaps = [];
      const foes = [];
      let ok = true;
      for (const i of win) {
        const v = state.stones[i];
        if (v === seat) {
          mine += 1;
          continue;
        }
        if (v !== 0) {
          if (state.guards[i]) {
            ok = false;
            break;
          }
          foes.push(i);
          if (foes.length > 1) {
            ok = false;
            break;
          }
          continue;
        }
        if (isFrozen(state, i)) {
          ok = false;
          break;
        }
        gaps.push(i);
      }
      if (!ok || mine + foes.length + gaps.length < WIN_LENGTH) continue;
      if (id === "transmute" && foes.length === 1 && gaps.length <= k) {
        return { type: "skill", seat, skillId: "transmute", index: foes[0] };
      }
      if (id === "pull" && foes.length === 1 && gaps.length + 1 <= k) {
        for (const to of neighborsOf(state, foes[0])) {
          if (win.includes(to)) continue;
          if (state.stones[to] !== 0 || isFrozen(state, to)) continue;
          return { type: "skill", seat, skillId: "pull", from: foes[0], to };
        }
      }
      if (id === "windwalk" && foes.length === 0 && gaps.length === k + 1) {
        for (const g of gaps) {
          for (const nb of neighborsOf(state, g)) {
            if (state.stones[nb] !== seat || win.includes(nb)) continue;
            return { type: "skill", seat, skillId: "windwalk", from: nb, to: g };
          }
        }
      }
    }
    return null;
  }
  function chooseCpuActionV99(state, seat, rand) {
    if (state.pending && state.pending.remaining > 0 && state.pending.seat === seat) {
      const i = chooseExtraIndex(state, seat);
      return i == null ? null : { type: "extra", seat, index: i };
    }
    const spots = legalPlacements(state);
    if (spots.length === 0) return { type: "pass", seat };
    const one = fillWinCells(state, seat, 1);
    if (one && one.length === 1) return { type: "place", seat, index: one[0] };
    const usable = usableSkills(state, seat).filter((u) => u.ok);
    for (const u of usable) {
      if (u.extra > 0) {
        const cells = fillWinCells(state, seat, u.extra);
        if (cells) {
          const body = neutralSkillBody(state, seat, u.skill.id);
          if (body) return { type: "skill", seat, skillId: u.skill.id, ...body };
        }
      }
      const direct = skillWinPlan(state, seat, u);
      if (direct) return direct;
    }
    const danger = dangerMap(state, seat);
    if (danger.size) {
      let best = -1;
      let bestV = -Infinity;
      for (const [cell, v] of danger) {
        if (!canPlaceAt(state, cell)) continue;
        const sc = v * 1e4 + runScoreFor(state, cell, seat).total;
        if (sc > bestV) {
          bestV = sc;
          best = cell;
        }
      }
      if (best >= 0) {
        const fz = usable.find((u) => u.skill.id === "freeze" && u.extra === 0);
        if (fz && state.stones[best] === 0 && !isFrozen(state, best)) {
          return { type: "skill", seat, skillId: "freeze", index: best };
        }
        return { type: "place", seat, index: best };
      }
    }
    const strong = usable.find((u) => u.extra > 0);
    if (strong) {
      const body = neutralSkillBody(state, seat, strong.skill.id);
      if (body) return { type: "skill", seat, skillId: strong.skill.id, ...body };
    }
    const clean = bestCleanWindowCell(state, seat);
    if (clean != null) return { type: "place", seat, index: clean };
    return { type: "place", seat, index: spots[Math.floor(rand() * spots.length) % spots.length] };
  }
  function chooseCpuAction(state, seat, rand = Math.random) {
    if (state.status !== "playing" || state.turn !== seat) return null;
    if (v99Of(state)) return chooseCpuActionV99(state, seat, rand);
    const spots = legalPlacements(state);
    if (spots.length === 0) return { type: "pass", seat };
    const opponents = seatNumbers(state).filter((s) => s !== seat);
    for (const idx of spots) {
      if (runScoreFor(state, idx, seat).best >= WIN_LENGTH) return { type: "place", seat, index: idx };
    }
    for (const opp of opponents) {
      for (const idx of spots) {
        if (runScoreFor(state, idx, opp).best >= WIN_LENGTH) return { type: "place", seat, index: idx };
      }
    }
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
    return { type: "place", seat, index: pick };
  }
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
        seat: s.seat,
        name: s.name,
        charId: s.charId,
        kind: s.kind,
        userId: s.userId,
        cosmetics: s.cosmetics
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
      finishedAt: state.finishedAt
    };
  }
  return { BOARD_W, BOARD_H, BOARD_SIZE, indexToLabel, labelOf, ERR, ERR_MESSAGE_JA, errorMessage, createMatch, pickStartSeat, cloneState, isFrozen, frozenIndices, canPlaceAt, legalPlacements, emptyCount, neighborsOf, isAdjacent, findWinningLine, effectiveSkill, skillInRuleset, skillForSeat, minStoneResult, isWinnerSeat, outcomeForSeat, v99Of, orderIndexOf, unlockTurnOf, isEnhanced, v99FormOf, usesCapOf, v99Info, skillsOf, skillOfId, usesOf, applyAction, skillFirstTargets, skillSecondTargets, usableSkills, canUseSkill, mustPass, fillWinCells, immediateWinCells, chooseExtraIndex, chooseCpuAction, publicSnapshot };
});
__def("../../shared/story/engine.js", function(__req2) {
  const { createMatch, applyAction, cloneState, findWinningLine, emptyCount, chooseCpuAction, publicSnapshot, isFrozen, neighborsOf, labelOf, skillsOf, usesOf } = __req2("../../shared/rules.js");
  const { RULESET } = __req2("../../shared/rulesets.js");
  const { CHARACTER_BY_ID, SKILL_BY_CHARACTER, MAX_ENERGY, WIN_LENGTH, LINE_DIRS, BOARD_W } = __req2("../../shared/constants.js");
  const { STAGE_BY_ID, TRAINING_BOARD_BY_ID, TRAINING_BOARD_BY_STAGE, TELEGRAPH, TELEGRAPHS, bossPhasesOfStage, unlockedSkillsAt, unlockedCharsAt } = __req2("../../shared/story/stages.js");
  const PLAYER_SEAT2 = 1;
  const ENEMY_SEAT = 2;
  function createStoryMatch2(opts) {
    const stage = STAGE_BY_ID[Number(opts.stageId)];
    if (!stage) throw new Error(`\u672A\u77E5\u306E\u30B9\u30C6\u30FC\u30B8: ${opts.stageId}`);
    const board = stage.training ? TRAINING_BOARD_BY_ID[stage.training] : TRAINING_BOARD_BY_STAGE[stage.id];
    const skills = board && Array.isArray(board.skills) ? board.skills.filter((id) => unlockedSkillsAt(stage.id).includes(id)) : unlockedSkillsAt(stage.id);
    const masters = unlockedCharsAt(stage.id);
    let charId = opts.charId && CHARACTER_BY_ID[opts.charId] ? opts.charId : null;
    if (!charId) charId = masters[masters.length - 1] || "hibana";
    const state = createMatch({
      matchId: String(opts.matchId || `story-${stage.id}-${opts.startedAt ?? Date.now()}`),
      mode: "story",
      ruleset: RULESET.STORY,
      startedAt: opts.startedAt,
      seats: [
        {
          seat: PLAYER_SEAT2,
          name: String(opts.playerName || "\u3042\u306A\u305F"),
          charId,
          kind: "human",
          cosmetics: opts.cosmetics ?? null,
          skills
        },
        {
          seat: ENEMY_SEAT,
          name: stage.enemy.name,
          charId: stage.enemy.charId,
          kind: "cpu"
        }
      ]
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
      script: board ? [...board.enemyScript || []] : [],
      allowedTelegraphs: [...stage.telegraphs || []],
      skills: [...skills],
      cleared: false
    };
    if (board) applyTrainingBoard(state, board);
    return state;
  }
  function applyTrainingBoard(state, board) {
    var _a;
    for (const i of board.player) state.stones[i] = PLAYER_SEAT2;
    for (const i of board.enemy) state.stones[i] = ENEMY_SEAT;
    for (const i of board.playerGuards || []) {
      if (state.stones[i] === PLAYER_SEAT2) state.guards[i] = 1;
    }
    for (const seat of [PLAYER_SEAT2, ENEMY_SEAT]) {
      const v = Number(((_a = board.energy) == null ? void 0 : _a[seat]) ?? 0);
      state.energy[seat] = Math.min(MAX_ENERGY, Math.max(0, v));
    }
    state.stats[PLAYER_SEAT2].placed = 0;
    state.stats[ENEMY_SEAT].placed = 0;
    if (board.telegraph) {
      state.story.telegraph = {
        id: board.telegraph.id,
        targets: [...board.telegraph.targets || []],
        seat: Number(board.telegraph.by ?? ENEMY_SEAT),
        declaredAt: -1
        // 開始前に予告済み。敵の最初の手番で解決する。
      };
    }
    state.turn = PLAYER_SEAT2;
  }
  function pushStoryEvent(state, ev) {
    state.eventSeq += 1;
    const full = { ...ev, id: `${state.matchId}#s${state.eventSeq}`, seq: state.eventSeq, at: ev.at ?? Date.now() };
    state.events.push(full);
    if (state.events.length > 40) state.events.splice(0, state.events.length - 40);
    return full;
  }
  function settleBoard(state) {
    state.opCount += 1;
    state.revision += 1;
    const win = findWinningLine(state, 0);
    if (win) {
      state.status = "finished";
      state.result = { kind: "win", winner: win.owner, winners: [win.owner], line: win.line, reason: "five" };
      state.finishedAt = Date.now();
      return true;
    }
    if (emptyCount(state) === 0) {
      state.status = "finished";
      state.result = { kind: "draw", winner: 0, winners: [], line: [], reason: "board_full" };
      state.finishedAt = Date.now();
      return true;
    }
    return false;
  }
  function usedForTelegraph(state, id) {
    const tg = TELEGRAPHS[id];
    const own = state.story.telegraphUses[id] || 0;
    if (tg.sharesUsesWith && skillsOf(state, ENEMY_SEAT).some((skill) => skill.id === tg.sharesUsesWith)) {
      return own + usesOf(state, ENEMY_SEAT, tg.sharesUsesWith);
    }
    return own;
  }
  function canTelegraph(state, id) {
    const tg = TELEGRAPHS[id];
    if (!tg) return false;
    if (!state.story.allowedTelegraphs.includes(id)) return false;
    if (state.story.telegraph) return false;
    if (state.energy[ENEMY_SEAT] < tg.cost) return false;
    if (usedForTelegraph(state, id) >= tg.uses) return false;
    return true;
  }
  function consumeTelegraph(state, id) {
    const tg = TELEGRAPHS[id];
    state.energy[ENEMY_SEAT] = Math.max(0, state.energy[ENEMY_SEAT] - tg.cost);
    state.story.telegraphUses[id] = (state.story.telegraphUses[id] || 0) + 1;
  }
  function snipeTarget(state, targets) {
    for (const idx of targets) {
      if (!Number.isInteger(idx) || idx < 0 || idx >= state.stones.length) continue;
      if (state.stones[idx] === PLAYER_SEAT2) return idx;
    }
    return null;
  }
  function resolveTelegraph(state) {
    const t = state.story.telegraph;
    if (!t) return { resolved: false, outcome: null, finished: false, event: null };
    if (t.declaredAt >= 0 && t.declaredAt >= state.story.enemyTurns) {
      return { resolved: false, outcome: null, finished: false, event: null };
    }
    const tg = TELEGRAPHS[t.id];
    const targets = Array.isArray(t.targets) ? t.targets : [];
    state.story.telegraph = null;
    if (!tg) return { resolved: true, outcome: "invalid", finished: false, event: null };
    consumeTelegraph(state, t.id);
    const done = (outcome, text, index, finished2 = false) => {
      const ev = pushStoryEvent(state, {
        type: "telegraph",
        phase: outcome,
        seat: ENEMY_SEAT,
        telegraphId: t.id,
        telegraphName: tg.name,
        index: index ?? null,
        label: index != null ? labelOf(state, index) : null,
        text
      });
      return { resolved: true, outcome, finished: finished2, event: ev };
    };
    if (t.id === TELEGRAPH.SNIPE) {
      const idx2 = snipeTarget(state, targets);
      if (idx2 == null) return done("missed", `${tg.name}\u306F\u7A7A\u3092\u6483\u3063\u305F\u3002`, targets[0] ?? null);
      if (state.guards[idx2]) return done("blocked", `${tg.name}\u306F\u5B88\u308A\u306B\u9632\u304C\u308C\u305F\u3002`, idx2);
      state.stones[idx2] = 0;
      state.guards[idx2] = 0;
      const finished2 = settleBoard(state);
      return done("hit", `${tg.name}\u304C\u547D\u4E2D\u3057\u305F\u3002`, idx2, finished2);
    }
    const idx = targets[0];
    if (!Number.isInteger(idx) || idx < 0 || idx >= state.stones.length) {
      return done("missed", `${tg.name}\u306F\u7684\u3092\u5931\u3063\u305F\u3002`, null);
    }
    if (isFrozen(state, idx)) return done("frozen", `${tg.name}\u306F\u6C37\u7D50\u306B\u963B\u307E\u308C\u305F\u3002`, idx);
    if (state.stones[idx] === ENEMY_SEAT) return done("missed", `${tg.name}\u306F\u3059\u3067\u306B\u81EA\u5206\u306E\u77F3\u3060\u3063\u305F\u3002`, idx);
    if (state.stones[idx] === PLAYER_SEAT2) {
      if (state.guards[idx]) return done("blocked", `${tg.name}\u306F\u5B88\u308A\u306B\u9632\u304C\u308C\u305F\u3002`, idx);
      state.stones[idx] = ENEMY_SEAT;
      state.guards[idx] = 0;
      const finished2 = settleBoard(state);
      return done("hit", `${tg.name}\u3067\u77F3\u3092\u596A\u308F\u308C\u305F\u3002`, idx, finished2);
    }
    state.stones[idx] = ENEMY_SEAT;
    state.guards[idx] = 0;
    state.stats[ENEMY_SEAT].placed += 1;
    const finished = settleBoard(state);
    return done("hit", `${tg.name}\u3067 ${labelOf(state, idx)} \u3092\u5360\u9818\u3055\u308C\u305F\u3002`, idx, finished);
  }
  function applyBossPhase(state) {
    if (!state.story.boss) return null;
    const phases = bossPhasesOfStage(state.story.stageId);
    const turn = state.story.enemyTurns + 1;
    const hit = phases.find((p) => p.atEnemyTurn === turn);
    if (!hit) return null;
    const step = phases.indexOf(hit) + 1;
    if (state.story.phase >= step) return null;
    state.story.phase = step;
    return pushStoryEvent(state, {
      type: "boss_phase",
      seat: ENEMY_SEAT,
      phase: step,
      look: hit.look,
      text: hit.line
    });
  }
  function lineRun(state, index, owner) {
    let best = 1;
    const col = index % BOARD_W;
    const row = Math.floor(index / BOARD_W);
    for (const [dc, dr] of LINE_DIRS) {
      let count = 1;
      for (const sign of [1, -1]) {
        let c = col + dc * sign;
        let r = row + dr * sign;
        while (c >= 0 && c < BOARD_W && r >= 0 && r < state.height && state.stones[r * BOARD_W + c] === owner) {
          count += 1;
          c += dc * sign;
          r += dr * sign;
        }
      }
      best = Math.max(best, count);
    }
    return best;
  }
  function seizeWins(state, index) {
    if (state.guards[index]) return false;
    if (state.stones[index] === ENEMY_SEAT) return false;
    if (isFrozen(state, index)) return false;
    const probe = cloneState(state);
    probe.stones[index] = ENEMY_SEAT;
    return lineRun(probe, index, ENEMY_SEAT) >= WIN_LENGTH;
  }
  function sniperTarget(state) {
    const cands = [];
    for (let i = 0; i < state.stones.length; i += 1) {
      if (state.stones[i] !== PLAYER_SEAT2 || state.guards[i]) continue;
      const run = lineRun(state, i, PLAYER_SEAT2);
      if (run >= WIN_LENGTH - 1) cands.push({ index: i, run });
    }
    cands.sort((a, b) => b.run - a.run || a.index - b.index);
    return cands.length ? cands[0] : null;
  }
  function chooseEnemyAction(state, rand = Math.random) {
    const st = state.story;
    while (st.scriptIndex < st.script.length) {
      const idx = st.script[st.scriptIndex];
      st.scriptIndex += 1;
      if (state.stones[idx] === 0 && !isFrozen(state, idx)) {
        return { kind: "action", action: { type: "place", seat: ENEMY_SEAT, index: idx } };
      }
    }
    const level = st.level || 1;
    if (level >= 5) {
      if (canTelegraph(state, TELEGRAPH.SEIZE)) {
        for (let i = 0; i < state.stones.length; i += 1) {
          if (seizeWins(state, i)) return { kind: "telegraph", id: TELEGRAPH.SEIZE, targets: [i] };
        }
      }
      if (canTelegraph(state, TELEGRAPH.SNIPE)) {
        const t = sniperTarget(state);
        if (t && t.run >= WIN_LENGTH - 1) return { kind: "telegraph", id: TELEGRAPH.SNIPE, targets: [t.index] };
      }
    }
    if (level >= 4) {
      const skillAction = chooseEnemySkill(state);
      if (skillAction) return { kind: "action", action: skillAction };
    }
    const action2 = chooseCpuAction(state, ENEMY_SEAT, rand);
    return action2 ? { kind: "action", action: action2 } : { kind: "none" };
  }
  function chooseEnemySkill(state) {
    const list = skillsOf(state, ENEMY_SEAT);
    const skill = list[0];
    if (!skill) return null;
    if (state.energy[ENEMY_SEAT] < skill.cost) return null;
    if (usesOf(state, ENEMY_SEAT, skill.id) >= skill.uses) return null;
    const size = state.stones.length;
    switch (skill.id) {
      case "transmute": {
        for (let i = 0; i < size; i += 1) {
          if (state.stones[i] === PLAYER_SEAT2 && seizeWins(state, i)) {
            return { type: "skill", seat: ENEMY_SEAT, skillId: "transmute", index: i };
          }
        }
        return null;
      }
      case "spark": {
        const t = sniperTarget(state);
        if (t && t.run >= WIN_LENGTH - 1) return { type: "skill", seat: ENEMY_SEAT, skillId: "spark", index: t.index };
        return null;
      }
      case "ward": {
        for (let i = 0; i < size; i += 1) {
          if (state.stones[i] !== ENEMY_SEAT || state.guards[i]) continue;
          if (lineRun(state, i, ENEMY_SEAT) >= WIN_LENGTH - 1) return { type: "skill", seat: ENEMY_SEAT, skillId: "ward", index: i };
        }
        return null;
      }
      case "pull": {
        const t = sniperTarget(state);
        if (!t) return null;
        const dest = neighborsOf(state, t.index).find((d) => state.stones[d] === 0 && !isFrozen(state, d));
        if (dest === void 0) return null;
        return { type: "skill", seat: ENEMY_SEAT, skillId: "pull", from: t.index, to: dest };
      }
      case "windwalk":
        return null;
      // 通常の着手のほうが強いので使わない
      case "freeze": {
        for (let i = 0; i < size; i += 1) {
          if (state.stones[i] !== 0 || isFrozen(state, i)) continue;
          if (lineRun(state, i, PLAYER_SEAT2) >= WIN_LENGTH) return { type: "skill", seat: ENEMY_SEAT, skillId: "freeze", index: i };
        }
        return null;
      }
      default:
        return null;
    }
  }
  function applyPlayerAction2(state, action2) {
    if (Number((action2 == null ? void 0 : action2.seat) ?? PLAYER_SEAT2) !== PLAYER_SEAT2) {
      return { ok: false, code: "not_your_turn", message: "\u3042\u306A\u305F\u306E\u624B\u756A\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002" };
    }
    const res = applyAction(state, { ...action2, seat: PLAYER_SEAT2 });
    if (!res.ok) return res;
    res.state.story = cloneStory(state.story);
    return res;
  }
  function cloneStory(story) {
    return JSON.parse(JSON.stringify(story));
  }
  function passTurnToPlayer(state) {
    state.opCount += 1;
    state.revision += 1;
    state.turn = PLAYER_SEAT2;
    state.energy[PLAYER_SEAT2] = Math.min(MAX_ENERGY, state.energy[PLAYER_SEAT2] + 1);
    for (let i = 0; i < state.ice.length; i += 1) {
      if (state.ice[i] > 0 && state.opCount >= state.ice[i]) {
        state.ice[i] = 0;
        state.iceOwner[i] = 0;
      }
    }
  }
  function runEnemyTurn2(state, rand = Math.random) {
    let next = cloneState(state);
    next.story = cloneStory(state.story);
    const events = [];
    if (next.status !== "playing" || next.turn !== ENEMY_SEAT) return { state: next, events };
    const phaseEv = applyBossPhase(next);
    if (phaseEv) events.push(phaseEv);
    const tg = resolveTelegraph(next);
    if (tg.resolved) {
      if (tg.event) events.push(tg.event);
      next.story.enemyTurns += 1;
      if (!tg.finished) {
        if (tg.outcome === "hit") {
          next.turn = PLAYER_SEAT2;
          next.energy[PLAYER_SEAT2] = Math.min(MAX_ENERGY, next.energy[PLAYER_SEAT2] + 1);
          for (let i = 0; i < next.ice.length; i += 1) {
            if (next.ice[i] > 0 && next.opCount >= next.ice[i]) {
              next.ice[i] = 0;
              next.iceOwner[i] = 0;
            }
          }
        } else {
          passTurnToPlayer(next);
        }
      }
      return { state: next, events };
    }
    const choice = chooseEnemyAction(next, rand);
    if (choice.kind === "telegraph") {
      const def = TELEGRAPHS[choice.id];
      next.story.telegraph = {
        id: choice.id,
        targets: [...choice.targets],
        seat: ENEMY_SEAT,
        declaredAt: next.story.enemyTurns
      };
      events.push(pushStoryEvent(next, {
        type: "telegraph",
        phase: "declared",
        seat: ENEMY_SEAT,
        telegraphId: choice.id,
        telegraphName: def.name,
        index: choice.targets[0],
        label: choice.targets.map((i) => labelOf(next, i)).join("\u2192"),
        text: `${def.name}\u3002\u6B21\u306E\u624B\u756A\u3067 ${choice.targets.map((i) => labelOf(next, i)).join(" \u2192 ")} \u3092\u72D9\u3046\u3002`
      }));
      next.story.enemyTurns += 1;
      passTurnToPlayer(next);
      return { state: next, events };
    }
    if (choice.kind === "none") {
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
  function storySnapshot2(state) {
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
        skills: [...st.skills || []],
        // 予告は隠さない。プレイヤーが対処できることが前提の技のため。
        telegraph: st.telegraph ? { id: st.telegraph.id, targets: [...st.telegraph.targets] } : null,
        cleared: st.cleared
      }
    };
  }
  function storyOutcome2(state) {
    if (state.status !== "finished") return null;
    const r = state.result;
    if (!r) return null;
    if (r.kind === "win") return { outcome: r.winner === PLAYER_SEAT2 ? "win" : "lose", line: r.line };
    if (r.kind === "aborted") return { outcome: "aborted", line: [] };
    return { outcome: "draw", line: [] };
  }
  return { TELEGRAPH, TELEGRAPHS, PLAYER_SEAT: PLAYER_SEAT2, ENEMY_SEAT, createStoryMatch: createStoryMatch2, canTelegraph, resolveTelegraph, applyBossPhase, chooseEnemyAction, applyPlayerAction: applyPlayerAction2, runEnemyTurn: runEnemyTurn2, storySnapshot: storySnapshot2, storyOutcome: storyOutcome2 };
});
__def("../../shared/story/stages.js", function(__req2) {
  const { BOARD_W } = __req2("../../shared/constants.js");
  const STORY_DATA_VERSION = 2;
  function ix(col, row) {
    const c = typeof col === "string" ? col.toUpperCase().charCodeAt(0) - 65 : Number(col);
    return (Number(row) - 1) * BOARD_W + c;
  }
  const TELEGRAPH = Object.freeze({
    SNIPE: "snipe",
    SEIZE: "seize"
  });
  const TELEGRAPHS = Object.freeze({
    [TELEGRAPH.SNIPE]: Object.freeze({
      id: TELEGRAPH.SNIPE,
      name: "\u4E88\u544A\u72D9\u6483",
      cost: 4,
      uses: 2,
      // 通常の火花と、合計2回までの枠を共有する
      sharesUsesWith: "spark",
      resolve: "nextEnemyTurnStart",
      desc: "\u4E88\u544A\u3057\u305F\u7BC4\u56F2\u306E\u76F8\u624B\u306E\u77F3\u30921\u500B\u6D88\u3059\u3002\u5B88\u308A\u304C\u3042\u308C\u3070\u4E0D\u767A\u3002"
    }),
    [TELEGRAPH.SEIZE]: Object.freeze({
      id: TELEGRAPH.SEIZE,
      name: "\u4E88\u544A\u5360\u9818",
      cost: 6,
      uses: 1,
      sharesUsesWith: null,
      resolve: "nextEnemyTurnStart",
      desc: "\u4E88\u544A\u5730\u70B9\u304C\u7A7A\u306A\u3089\u6575\u306E\u77F3\u3092\u7F6E\u304F\u3002\u7121\u9632\u5099\u306A\u76F8\u624B\u306E\u77F3\u306A\u3089\u6575\u306E\u77F3\u306B\u5909\u3048\u308B\u3002\u6C37\u7D50\u4E2D\u30FB\u5B88\u308A\u4ED8\u304D\u30FB\u3059\u3067\u306B\u6575\u306E\u77F3\u306A\u3089\u4E0D\u767A\u3002"
    })
  });
  const SKILL_UNLOCKS = Object.freeze([
    { stage: 3, charId: "hibana", skillId: "spark", sealName: "\u706B\u82B1", master: "\u30D2\u30D0\u30CA" },
    { stage: 6, charId: "mamori", skillId: "ward", sealName: "\u7D50\u754C", master: "\u30DE\u30E2\u30EA" },
    { stage: 11, charId: "hayate", skillId: "windwalk", sealName: "\u98A8\u6E21\u308A", master: "\u30CF\u30E4\u30C6" },
    { stage: 16, charId: "yukine", skillId: "freeze", sealName: "\u6C37\u7D50", master: "\u30E6\u30AD\u30CD" },
    { stage: 21, charId: "kuon", skillId: "pull", sealName: "\u5F15\u529B", master: "\u30AF\u30AA\u30F3" },
    { stage: 26, charId: "akari", skillId: "transmute", sealName: "\u8EE2\u5149", master: "\u30A2\u30AB\u30EA" }
  ]);
  const SKILL_UNLOCK_BY_STAGE = Object.freeze(
    Object.fromEntries(SKILL_UNLOCKS.map((u) => [u.stage, u]))
  );
  const SEALS = Object.freeze([
    { stage: 5, id: "harume", name: "\u6625\u82BD\u306E\u7881\u5370" },
    { stage: 10, id: "wakaba", name: "\u82E5\u8449\u306E\u7881\u5370" },
    { stage: 15, id: "enyo", name: "\u708E\u967D\u306E\u7881\u5370" },
    { stage: 20, id: "shugetsu", name: "\u79CB\u6708\u306E\u7881\u5370" },
    { stage: 25, id: "yukiboshi", name: "\u96EA\u661F\u306E\u7881\u5370" },
    { stage: 30, id: "akatsuki", name: "\u6681\u306E\u7881\u5370" }
  ]);
  const SEAL_BY_STAGE = Object.freeze(Object.fromEntries(SEALS.map((s) => [s.stage, s])));
  function unlockedCharsAt(stage) {
    return SKILL_UNLOCKS.filter((u) => u.stage <= Number(stage)).map((u) => u.charId);
  }
  function unlockedSkillsAt(stage) {
    return SKILL_UNLOCKS.filter((u) => u.stage <= Number(stage)).map((u) => u.skillId);
  }
  const CHAPTERS = Object.freeze([
    {
      id: 1,
      name: "\u6625\u306E\u91CC\u3068\u76D7\u307E\u308C\u305F\u66A6",
      stages: [1, 2, 3, 4, 5],
      boss: 5,
      season: "spring",
      bgm: "story-spring",
      lead: "\u6625\u306E\u5BFA\u3067\u4E94\u76EE\u3092\u5B66\u3076\u65E5\u3005\u306E\u3055\u306A\u304B\u3001\u5B63\u7BC0\u66A6\u304C\u76D7\u307E\u308C\u305F\u3002"
    },
    {
      id: 2,
      name: "\u82E5\u8449\u306E\u7D50\u754C\u3068\u96F7\u306E\u793E",
      stages: [6, 7, 8, 9, 10],
      boss: 10,
      season: "rainy",
      bgm: "story-rain",
      lead: "\u82E5\u8449\u306E\u68EE\u3092\u629C\u3051\u3001\u9CF4\u308A\u3084\u307E\u306C\u96F7\u306E\u793E\u3078\u5411\u304B\u3046\u3002"
    },
    {
      id: 3,
      name: "\u708E\u967D\u306E\u5C71\u3068\u7ADC\u306E\u7FFC",
      stages: [11, 12, 13, 14, 15],
      boss: 15,
      season: "summer",
      bgm: "story-summer",
      lead: "\u590F\u306E\u5C71\u306F\u98A8\u304C\u8981\u308B\u3002\u7FFC\u3092\u6301\u3064\u3082\u306E\u305F\u3061\u306E\u9818\u57DF\u3078\u3002"
    },
    {
      id: 4,
      name: "\u79CB\u6708\u306E\u68EE\u3068\u6642\u77E5\u3089\u305A\u306E\u971C",
      stages: [16, 17, 18, 19, 20],
      boss: 20,
      season: "autumn",
      bgm: "story-autumn",
      lead: "\u79CB\u306E\u305F\u3060\u306A\u304B\u306B\u3001\u5B63\u7BC0\u306F\u305A\u308C\u306E\u971C\u304C\u964D\u308A\u306F\u3058\u3081\u305F\u3002"
    },
    {
      id: 5,
      name: "\u96EA\u661F\u306E\u5CF0\u3068\u53E4\u9F8D\u306E\u8A93\u3044",
      stages: [21, 22, 23, 24, 25],
      boss: 25,
      season: "winter",
      bgm: "story-winter",
      lead: "\u96EA\u306E\u5CF0\u306E\u4E0A\u306B\u306F\u3001\u661F\u3068\u3001\u53E4\u3044\u8A93\u3044\u304C\u6B8B\u3063\u3066\u3044\u308B\u3002"
    },
    {
      id: 6,
      name: "\u6681\u306E\u57CE\u3068\u9084\u308B\u56DB\u5B63",
      stages: [26, 27, 28, 29, 30],
      boss: 30,
      season: "all",
      bgm: "story-final",
      lead: "\u516D\u3064\u306E\u8853\u3092\u643A\u3048\u3066\u3001\u56DB\u5B63\u3092\u6B62\u3081\u305F\u8005\u306E\u57CE\u3078\u3002"
    }
  ]);
  const CHAPTER_BY_ID = Object.freeze(
    Object.fromEntries(CHAPTERS.map((c) => [c.id, c]))
  );
  const TRAINING_BOARDS = Object.freeze([
    {
      id: "tb-01",
      stage: 1,
      title: "\u4E00\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u4E94\u3064\u4E26\u3079\u308B",
      goal: "\u6A2A\u306B\u4E26\u3093\u3060\u56DB\u3064\u306E\u77F3\u3092\u3001\u4E94\u3064\u306B\u3059\u308B\u3002",
      hint: "D9 \u304B\u3089 G9 \u307E\u3067\u81EA\u5206\u306E\u77F3\u304C\u56DB\u3064\u4E26\u3093\u3067\u3044\u308B\u3002\u4E21\u7AEF\u306E H9 \u3068 C9 \u306E\u3069\u3061\u3089\u3067\u3082\u4E94\u3064\u306B\u306A\u308B\u3002",
      player: [ix("D", 9), ix("E", 9), ix("F", 9), ix("G", 9)],
      enemy: [ix("A", 3), ix("C", 3), ix("E", 3)],
      playerGuards: [],
      energy: { 1: 1, 2: 0 },
      skills: [],
      // Stage1〜2 は術なし
      telegraph: null,
      enemyScript: [],
      winPoints: [ix("H", 9), ix("C", 9)],
      reference: [
        { by: "player", type: "place", index: ix("H", 9), note: "H9 \u306B\u7F6E\u3044\u3066 D9\u301CH9 \u306E\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-02",
      stage: 2,
      title: "\u4E8C\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u76F8\u624B\u306E\u56DB\u3092\u5148\u306B\u6B62\u3081\u308B",
      goal: "\u76F8\u624B\u306E\u56DB\u9023\u3092\u6B62\u3081\u3066\u304B\u3089\u3001\u81EA\u5206\u306E\u4E94\u3092\u4F5C\u308B\u3002",
      hint: "\u76F8\u624B\u306F E5 \u304B\u3089 H5 \u307E\u3067\u56DB\u3064\u3002\u5DE6\u306F\u81EA\u5206\u306E D5 \u304C\u585E\u3044\u3067\u3044\u308B\u306E\u3067\u3001\u4F38\u3073\u308B\u5148\u306F I5 \u3060\u3051\u3002",
      player: [ix("D", 5), ix("D", 11), ix("E", 11), ix("F", 11)],
      enemy: [ix("E", 5), ix("F", 5), ix("G", 5), ix("H", 5)],
      playerGuards: [],
      energy: { 1: 1, 2: 0 },
      skills: [],
      telegraph: null,
      enemyScript: [ix("A", 2), ix("C", 11)],
      winPoints: [],
      reference: [
        { by: "player", type: "place", index: ix("I", 5), note: "I5 \u3092\u585E\u3050\u3002\u5DE6\u306F D5 \u306A\u306E\u3067\u76F8\u624B\u306E\u5217\u306F\u6B7B\u306C\u3002" },
        { by: "enemy", type: "place", index: ix("A", 2) },
        { by: "player", type: "place", index: ix("G", 11), note: "D11\u301CG11 \u3067\u56DB\u3064\u3002" },
        { by: "enemy", type: "place", index: ix("C", 11) },
        { by: "player", type: "place", index: ix("H", 11), note: "H11 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-03",
      stage: 3,
      title: "\u4E09\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u706B\u82B1",
      goal: "\u4E21\u7AEF\u304C\u7A7A\u3044\u305F\u76F8\u624B\u306E\u56DB\u9023\u3092\u3001\u706B\u82B1\u3067\u5D29\u3059\u3002",
      hint: "\u76F8\u624B\u306E D5\u301CG5 \u306F C5 \u3068 H5 \u306E\u4E21\u65B9\u304C\u7A7A\u3044\u3066\u3044\u308B\u3002\u77F3\u30921\u500B\u7F6E\u3044\u3066\u3082\u4E21\u65B9\u306F\u6B62\u3081\u3089\u308C\u306A\u3044\u3002",
      player: [ix("D", 11), ix("E", 11), ix("F", 11)],
      enemy: [ix("D", 5), ix("E", 5), ix("F", 5), ix("G", 5)],
      playerGuards: [],
      energy: { 1: 4, 2: 0 },
      skills: ["spark"],
      telegraph: null,
      enemyScript: [ix("A", 2), ix("C", 11)],
      winPoints: [],
      reference: [
        { by: "player", type: "skill", skillId: "spark", index: ix("E", 5), note: "E5 \u3092\u6D88\u3057\u3066\u56DB\u9023\u3092\u5272\u308B\u3002" },
        { by: "enemy", type: "place", index: ix("A", 2) },
        { by: "player", type: "place", index: ix("G", 11), note: "D11\u301CG11 \u3067\u56DB\u3064\u3002" },
        { by: "enemy", type: "place", index: ix("C", 11) },
        { by: "player", type: "place", index: ix("H", 11), note: "H11 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-04",
      stage: 6,
      title: "\u56DB\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u7D50\u754C",
      goal: "\u4E88\u544A\u3055\u308C\u305F\u72D9\u6483\u3092\u7D50\u754C\u3067\u9632\u304E\u3001\u305D\u306E\u307E\u307E\u4E94\u3064\u3092\u4F5C\u308B\u3002",
      hint: "\u7D50\u754C\u3092\u5F35\u3063\u305F\u77F3\u306F\u6D88\u305B\u306A\u3044\u3002\u4E88\u544A\u72D9\u6483\u306F\u305D\u306E\u307E\u307E\u4E0D\u767A\u306B\u306A\u308A\u3001\u76F8\u624B\u306F\u305D\u306E\u624B\u756A\u3092\u5931\u3046\u3002",
      player: [ix("D", 9), ix("E", 9), ix("G", 9)],
      enemy: [ix("A", 3), ix("C", 3), ix("E", 3)],
      playerGuards: [],
      energy: { 1: 2, 2: 4 },
      skills: ["spark", "ward"],
      telegraph: { id: TELEGRAPH.SNIPE, targets: [ix("E", 9)], by: 2 },
      enemyScript: [ix("C", 9)],
      winPoints: [],
      reference: [
        { by: "player", type: "skill", skillId: "ward", index: ix("E", 9), note: "\u72D9\u308F\u308C\u3066\u3044\u308B E9 \u306B\u7D50\u754C\u3092\u5F35\u308B\u3002" },
        { by: "enemy", type: "telegraph", id: TELEGRAPH.SNIPE, note: "\u5B88\u308A\u3067\u4E0D\u767A\u3002\u30A8\u30CA\u30B8\u30FC\u30FB\u56DE\u6570\u30FB\u624B\u756A\u3092\u6D88\u8CBB\u3059\u308B\u3002" },
        { by: "player", type: "place", index: ix("F", 9), note: "D9\u301CG9 \u3067\u56DB\u3064\u3002" },
        { by: "enemy", type: "place", index: ix("C", 9) },
        { by: "player", type: "place", index: ix("H", 9), note: "H9 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-05",
      stage: 11,
      title: "\u4E94\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u98A8\u6E21\u308A",
      goal: "\u5B88\u308A\u4ED8\u304D\u306E\u77F3\u3092\u3001\u72D9\u308F\u308C\u3066\u3044\u308B\u5834\u6240\u3078\u52D5\u304B\u3059\u3002",
      hint: "\u72D9\u6483\u306E\u7BC4\u56F2\u306F F9 \u3068 G9\u3001\u512A\u5148\u9806\u306F G9 \u2192 F9\u3002\u5B88\u308A\u4ED8\u304D\u306E\u77F3\u3092 F9 \u3078\u904B\u3079\u3070\u4E0D\u767A\u306B\u306A\u308B\u3002",
      player: [ix("D", 9), ix("E", 9), ix("H", 9), ix("F", 8)],
      enemy: [ix("A", 3), ix("C", 3), ix("E", 3)],
      playerGuards: [ix("F", 8)],
      energy: { 1: 3, 2: 4 },
      skills: ["spark", "ward", "windwalk"],
      telegraph: { id: TELEGRAPH.SNIPE, targets: [ix("G", 9), ix("F", 9)], by: 2 },
      enemyScript: [],
      winPoints: [],
      reference: [
        { by: "player", type: "skill", skillId: "windwalk", from: ix("F", 8), to: ix("F", 9), note: "\u5B88\u308A\u3054\u3068 F9 \u3078\u52D5\u304B\u3059\u3002" },
        { by: "enemy", type: "telegraph", id: TELEGRAPH.SNIPE, note: "G9 \u306F\u7A7A\u3002\u6B21\u306E\u5019\u88DC F9 \u306F\u5B88\u308A\u4ED8\u304D\u306A\u306E\u3067\u4E0D\u767A\u3002\u6483\u3061\u76F4\u3057\u306F\u3057\u306A\u3044\u3002" },
        { by: "player", type: "place", index: ix("G", 9), note: "D9\u301CH9 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-06",
      stage: 16,
      title: "\u516D\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u6C37\u7D50",
      goal: "\u5360\u9818\u3055\u308C\u308B\u5730\u70B9\u3092\u51CD\u3089\u305B\u3066\u304B\u3089\u3001\u81EA\u5206\u306E\u77F3\u3067\u585E\u3050\u3002",
      hint: "\u3044\u307E I5 \u306B\u7F6E\u304F\u3068\u3001\u4E88\u544A\u5360\u9818\u3067\u6575\u306E\u77F3\u306B\u5909\u3048\u3089\u308C\u3066\u76F8\u624B\u306E\u4E94\u9023\u306B\u306A\u308B\u3002\u5148\u306B\u51CD\u3089\u305B\u308B\u3002",
      player: [ix("D", 5), ix("D", 11), ix("E", 11), ix("F", 11)],
      enemy: [ix("E", 5), ix("F", 5), ix("G", 5), ix("H", 5)],
      playerGuards: [ix("D", 5)],
      energy: { 1: 2, 2: 6 },
      skills: ["spark", "ward", "windwalk", "freeze"],
      telegraph: { id: TELEGRAPH.SEIZE, targets: [ix("I", 5)], by: 2 },
      enemyScript: [ix("A", 2), ix("C", 11)],
      winPoints: [],
      reference: [
        { by: "player", type: "skill", skillId: "freeze", index: ix("I", 5), note: "I5 \u3092\u51CD\u3089\u305B\u308B\u3002" },
        { by: "enemy", type: "telegraph", id: TELEGRAPH.SEIZE, note: "\u6C37\u7D50\u4E2D\u306A\u306E\u3067\u4E0D\u767A\u3002\u30A8\u30CA\u30B8\u30FC\u30FB\u56DE\u6570\u30FB\u624B\u756A\u3092\u6D88\u8CBB\u3059\u308B\u3002" },
        { by: "player", type: "place", index: ix("I", 5), note: "\u81EA\u5206\u306E\u624B\u756A\u958B\u59CB\u3067\u89E3\u51CD\u3002\u6539\u3081\u3066\u585E\u3050\u3002" },
        { by: "enemy", type: "place", index: ix("A", 2) },
        { by: "player", type: "place", index: ix("G", 11), note: "D11\u301CG11 \u3067\u56DB\u3064\u3002" },
        { by: "enemy", type: "place", index: ix("C", 11) },
        { by: "player", type: "place", index: ix("H", 11), note: "H11 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-07",
      stage: 21,
      title: "\u4E03\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u5F15\u529B",
      goal: "\u9593\u306B\u5C45\u5EA7\u308B\u76F8\u624B\u306E\u77F3\u3092\u3001\u96A3\u3078\u3069\u304B\u3059\u3002",
      hint: "\u5F15\u529B\u306F\u76F8\u624B\u306E\u77F3\u3092\u52D5\u304B\u3059\u3060\u3051\u3067\u3001\u81EA\u5206\u306E\u3082\u306E\u306B\u306F\u3057\u306A\u3044\u3002\u7A7A\u3044\u305F\u5834\u6240\u3078\u306F\u6B21\u306E\u624B\u756A\u3067\u7F6E\u304F\u3002",
      player: [ix("D", 9), ix("E", 9), ix("G", 9), ix("H", 9)],
      enemy: [ix("F", 9), ix("A", 3), ix("C", 3), ix("E", 3)],
      playerGuards: [],
      energy: { 1: 4, 2: 0 },
      skills: ["spark", "ward", "windwalk", "freeze", "pull"],
      telegraph: null,
      enemyScript: [ix("A", 2)],
      winPoints: [ix("F", 9)],
      reference: [
        { by: "player", type: "skill", skillId: "pull", from: ix("F", 9), to: ix("F", 8), note: "F9 \u306E\u76F8\u624B\u306E\u77F3\u3092 F8 \u3078\u3002\u6301\u3061\u4E3B\u306F\u76F8\u624B\u306E\u307E\u307E\u3002" },
        { by: "enemy", type: "place", index: ix("A", 2) },
        { by: "player", type: "place", index: ix("F", 9), note: "D9\u301CH9 \u3067\u4E94\u3064\u3002" }
      ]
    },
    {
      id: "tb-08",
      stage: 26,
      title: "\u516B\u306E\u4FEE\u7DF4\u76E4 \u2500\u2500 \u8EE2\u5149",
      goal: "\u5217\u306E\u4E2D\u306E\u76F8\u624B\u306E\u77F3\u3092\u81EA\u5206\u306E\u77F3\u306B\u5909\u3048\u3001\u305D\u306E\u4E00\u624B\u3067\u4E94\u3064\u306B\u3059\u308B\u3002",
      hint: "\u8EE2\u5149\u306F\u7F6E\u304F\u624B\u756A\u3092\u4F7F\u308F\u306A\u3044\u3002\u5909\u3048\u305F\u77AC\u9593\u306B\u5217\u304C\u3064\u306A\u304C\u308B\u3002",
      player: [ix("D", 9), ix("E", 9), ix("G", 9), ix("H", 9)],
      enemy: [ix("F", 9), ix("D", 4), ix("E", 4), ix("F", 4), ix("G", 4)],
      playerGuards: [],
      energy: { 1: 6, 2: 0 },
      skills: ["spark", "ward", "windwalk", "freeze", "pull", "transmute"],
      telegraph: null,
      enemyScript: [],
      winPoints: [ix("F", 9)],
      reference: [
        { by: "player", type: "skill", skillId: "transmute", index: ix("F", 9), note: "F9 \u3092\u81EA\u5206\u306E\u77F3\u306B\u5909\u3048\u3066\u3001\u305D\u306E\u5834\u3067\u4E94\u3064\u3002" }
      ]
    }
  ]);
  const TRAINING_BOARD_BY_ID = Object.freeze(
    Object.fromEntries(TRAINING_BOARDS.map((b) => [b.id, b]))
  );
  const TRAINING_BOARD_BY_STAGE = Object.freeze(
    Object.fromEntries(TRAINING_BOARDS.map((b) => [b.stage, b]))
  );
  const BOSS_PHASES = Object.freeze({
    5: [{ atEnemyTurn: 4, look: "kagai-awake", line: "\u9762\u306E\u4E0B\u304B\u3089\u3001\u685C\u306E\u9999\u304C\u6FC3\u304F\u306A\u308B\u3002" }],
    10: [{ atEnemyTurn: 4, look: "narukami-awake", line: "\u592A\u9F13\u304C\u3072\u3068\u308A\u3067\u306B\u62CD\u3092\u901F\u3081\u308B\u3002" }],
    15: [{ atEnemyTurn: 4, look: "guren-awake", line: "\u7FFC\u304C\u5E83\u304C\u308A\u3001\u7A7A\u304C\u8D64\u304F\u707C\u3051\u308B\u3002" }],
    20: [{ atEnemyTurn: 4, look: "oboro-awake", line: "\u5C3E\u304C\u5897\u3048\u305F\u306E\u304B\u3001\u5F71\u304C\u5897\u3048\u305F\u306E\u304B\u5206\u304B\u3089\u306A\u3044\u3002" }],
    25: [{ atEnemyTurn: 4, look: "souga-awake", line: "\u53E4\u9F8D\u304C\u8EAB\u3092\u8D77\u3053\u3057\u3001\u6C37\u304C\u8ECB\u3080\u3002" }],
    30: [
      { atEnemyTurn: 4, look: "muki-second", line: "\u7389\u5EA7\u306E\u5965\u3067\u3001\u9589\u3058\u8FBC\u3081\u3089\u308C\u305F\u5B63\u7BC0\u304C\u8EAB\u3058\u308D\u304E\u3057\u305F\u3002" },
      { atEnemyTurn: 8, look: "muki-final", line: "\u5F71\u304C\u516D\u3064\u306E\u7881\u5370\u3092\u6620\u3057\u8FD4\u3059\u3002" }
    ]
  });
  const BOSS_SHOW = Object.freeze({
    5: { look: "kagai", entry: ["\u9CE5\u5C45\u3092\u307E\u305F\u3050\u5927\u304D\u3055\u306E\u685C\u9762\u304C\u3001\u591C\u306E\u7A7A\u3092\u585E\u3044\u3060\u3002"], win: ["\u9762\u304C\u5272\u308C\u3001\u685C\u304C\u666E\u901A\u306E\u82B1\u306B\u623B\u3063\u3066\u3044\u304F\u3002"] },
    10: { look: "narukami", entry: ["\u6D6E\u304B\u3093\u3060\u5DE8\u5927\u306A\u592A\u9F13\u304C\u3001\u96F7\u96F2\u3054\u3068\u6253\u3061\u9CF4\u3089\u3055\u308C\u308B\u3002"], win: ["\u592A\u9F13\u304C\u88C2\u3051\u3001\u96F2\u306E\u5207\u308C\u9593\u304B\u3089\u661F\u304C\u843D\u3061\u3066\u304D\u305F\u3002"] },
    15: { look: "guren", entry: ["\u753B\u9762\u306E\u5916\u307E\u3067\u7FFC\u304C\u5E83\u304C\u308B\u3002\u6EB6\u5CA9\u304C\u8108\u3092\u6253\u3063\u3066\u3044\u308B\u3002"], win: ["\u7FFC\u304C\u4E0B\u308A\u3001\u706B\u306E\u7C89\u304C\u96EA\u306E\u3088\u3046\u306B\u9759\u307E\u3063\u305F\u3002"] },
    20: { look: "oboro", entry: ["\u4E5D\u672C\u306E\u5C3E\u304C\u7D05\u8449\u3092\u5DFB\u304D\u4E0A\u3052\u3001\u6731\u3044\u6708\u3092\u96A0\u3057\u305F\u3002"], win: ["\u5C3E\u304C\u4E00\u672C\u305A\u3064\u307B\u3069\u3051\u3001\u6708\u304C\u767D\u304F\u623B\u308B\u3002"] },
    25: { look: "souga", entry: ["\u5C71\u306E\u3088\u3046\u306A\u89D2\u3002\u6C37\u306E\u9C57\u306E\u5411\u3053\u3046\u3067\u30AA\u30FC\u30ED\u30E9\u304C\u63FA\u308C\u308B\u3002"], win: ["\u53E4\u9F8D\u304C\u8EAB\u3092\u6A2A\u305F\u3048\u3001\u6C37\u304C\u6C34\u306E\u97F3\u3092\u53D6\u308A\u623B\u3057\u305F\u3002"] },
    30: { look: "muki", entry: ["\u5DE8\u5927\u306A\u5F71\u3068\u7389\u5EA7\u3002\u56DB\u3064\u306E\u5B63\u7BC0\u304C\u3001\u9589\u3058\u8FBC\u3081\u3089\u308C\u305F\u307E\u307E\u4E26\u3093\u3067\u3044\u308B\u3002"], win: ["\u5F71\u304C\u8584\u308C\u3001\u516D\u3064\u306E\u7881\u5370\u304C\u9806\u306B\u706F\u3063\u3066\u3044\u304F\u3002"] }
  });
  const STAGE_REWARD = Object.freeze({ win: 3, lose: 1, draw: 1, aborted: 0 });
  const BOSS_REWARD = Object.freeze({
    5: { repeat: 5, first: 10 },
    10: { repeat: 8, first: 15 },
    15: { repeat: 12, first: 20 },
    20: { repeat: 16, first: 25 },
    25: { repeat: 22, first: 35 },
    30: { repeat: 30, first: 50 }
  });
  const STORY_XP = Object.freeze({
    win: { player: 60, char: 40 },
    lose: { player: 30, char: 20 },
    draw: { player: 30, char: 20 },
    aborted: { player: 0, char: 0 }
  });
  const DUPLICATE_DROP_XP = 20;
  const boss = (id) => ({ repeat: BOSS_REWARD[id].repeat, first: BOSS_REWARD[id].first });
  const normal = () => ({ repeat: STAGE_REWARD.win, first: STAGE_REWARD.win });
  const STAGES = Object.freeze([
    /* ── 第1章 春の里と盗まれた暦 ── */
    {
      id: 1,
      chapter: 1,
      name: "\u306F\u3058\u3081\u306E\u4E00\u77F3",
      boss: false,
      enemy: { name: "\u5C0F\u50E7\u30FB\u4E09\u5409", charId: "mamori", level: 1 },
      season: "spring",
      weather: "fog",
      time: "morning",
      scenery: "\u82E5\u8349\u3001\u6885\u306E\u3064\u307C\u307F\u3001\u67D4\u3089\u304B\u306A\u671D\u9727\u3002",
      ambience: "\u65E9\u6625\u306E\u9CE5\u306E\u58F0\u3068\u3001\u9060\u3044\u8AAD\u7D4C\u3002",
      bgm: "story-spring",
      learn: "\u9078\u629E\u30FB\u53D6\u6D88\u30FB\u78BA\u5B9A\u3068\u4E94\u9023\u3002",
      intro: [
        "\u6625\u306E\u5BFA\u3002\u671D\u306E\u52E4\u3081\u306E\u3042\u3068\u3001\u76E4\u306E\u524D\u306B\u5EA7\u3089\u3055\u308C\u305F\u3002",
        "\u300C\u307E\u305A\u306F\u7F6E\u304D\u65B9\u304B\u3089\u3002\u77F3\u3092\u9078\u3093\u3067\u3001\u78BA\u304B\u3081\u3066\u3001\u305D\u308C\u304B\u3089\u6C7A\u3081\u308B\u3093\u3060\u300D",
        "\u2500\u2500 \u6628\u591C\u3001\u5BFA\u304B\u3089\u5B63\u7BC0\u66A6\u304C\u76D7\u307E\u308C\u305F\u3002\u5EAD\u306E\u6885\u306F\u3001\u3064\u307C\u307F\u306E\u307E\u307E\u6B62\u307E\u3063\u3066\u3044\u308B\u3002"
      ],
      clear: ["\u300C\u3046\u3093\u3001\u305D\u308C\u3067\u3044\u3044\u300D", "\u4E09\u5409\u306F\u76E4\u306E\u5411\u3053\u3046\u3067\u3001\u5C11\u3057\u3060\u3051\u80F8\u3092\u5F35\u3063\u305F\u3002"],
      next: "\u66A6\u3092\u8FFD\u3046\u8005\u306E\u8DB3\u8DE1\u306F\u3001\u53C2\u9053\u306E\u77F3\u6BB5\u3078\u7D9A\u3044\u3066\u3044\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 2,
      chapter: 1,
      name: "\u53C2\u9053\u306E\u5F85\u3063\u305F",
      boss: false,
      enemy: { name: "\u5C0F\u50E7\u30FB\u516D\u52A9", charId: "hibana", level: 1 },
      season: "spring",
      weather: "rain",
      time: "day",
      scenery: "\u6FE1\u308C\u305F\u77F3\u6BB5\u3001\u82E5\u82BD\u3001\u6C34\u306E\u8F2A\u3002",
      ambience: "\u7D30\u3044\u6625\u96E8\u304C\u77F3\u3092\u6253\u3064\u97F3\u3002",
      bgm: "story-spring",
      learn: "\u76F8\u624B\u306E\u56DB\u9023\u3092\u5148\u306B\u6B62\u3081\u308B\u3002",
      intro: ["\u300C\u4E26\u3079\u308B\u3088\u308A\u5148\u306B\u3001\u6B62\u3081\u308B\u307B\u3046\u3092\u899A\u3048\u305F\u307B\u3046\u304C\u3044\u3044\u300D", "\u516D\u52A9\u306F\u96E8\u306E\u306A\u304B\u3067\u3001\u3082\u3046\u56DB\u3064\u4E26\u3079\u3066\u3044\u305F\u3002"],
      clear: ["\u300C\u6B62\u3081\u3089\u308C\u308B\u5F62\u3068\u3001\u6B62\u3081\u3089\u308C\u306A\u3044\u5F62\u304C\u3042\u308B\u3002\u899A\u3048\u3068\u3051\u3088\u300D"],
      next: "\u77F3\u6BB5\u306E\u4E0A\u304B\u3089\u3001\u706F\u306E\u3088\u3046\u306A\u8D64\u3044\u5149\u304C\u898B\u3048\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 3,
      chapter: 1,
      name: "\u706B\u82B1\u306E\u4FEE\u7DF4",
      boss: false,
      enemy: { name: "\u706B\u7A2E\u306E\u5C0F\u9B3C", charId: "hibana", level: 2 },
      season: "spring",
      weather: "petals",
      time: "evening",
      scenery: "\u821E\u3046\u685C\u3001\u884C\u706F\u3001\u9752\u307F\u306E\u6B8B\u308B\u5915\u7A7A\u3002",
      ambience: "\u82B1\u51B7\u3048\u306E\u98A8\u3068\u3001\u884C\u706F\u306E\u7D19\u304C\u9CF4\u308B\u97F3\u3002",
      bgm: "story-spring",
      learn: "\u4E21\u7AEF\u304C\u7A7A\u3044\u305F\u56DB\u9023\u306F\u3001\u6D88\u3057\u3066\u5D29\u3059\u3002",
      intro: [
        "\u30D2\u30D0\u30CA\u304C\u884C\u706F\u306E\u706B\u3092\u6307\u5148\u306B\u79FB\u3057\u305F\u3002",
        "\u300C\u4E21\u5074\u304C\u7A7A\u3044\u305F\u56DB\u3064\u306F\u3001\u77F3\u3072\u3068\u3064\u3058\u3083\u6B62\u307E\u3089\u306A\u3044\u3002\u3060\u3063\u305F\u3089\u6D88\u3059\u300D",
        "\u2500\u2500 \u706B\u82B1\u3092\u7FD2\u5F97\u3059\u308B\u3002"
      ],
      clear: ["\u300C\u6D88\u3059\u306E\u306F\u9053\u3092\u7A7A\u3051\u308B\u305F\u3081\u3002\u5FD8\u308C\u308B\u306A\u300D", "\u30D2\u30D0\u30CA\u306F\u706B\u3092\u3001\u3053\u3061\u3089\u306E\u624B\u306E\u3072\u3089\u3078\u843D\u3068\u3057\u305F\u3002"],
      next: "\u685C\u306E\u5411\u3053\u3046\u306B\u3001\u82B1\u3092\u62B1\u3048\u3066\u8D70\u308B\u5F71\u304C\u898B\u3048\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 4,
      chapter: 1,
      name: "\u82B1\u3092\u596A\u3046\u3082\u306E",
      boss: false,
      enemy: { name: "\u82B1\u76D7\u307F\u306E\u5C71\u8CCA", charId: "hibana", level: 3 },
      season: "spring",
      weather: "petals",
      time: "day",
      scenery: "\u83DC\u306E\u82B1\u3001\u6E80\u958B\u306E\u685C\u3001\u6D41\u308C\u308B\u82B1\u3073\u3089\u3002",
      ambience: "\u82B1\u98A8\u3068\u3001\u9060\u304F\u306E\u725B\u306E\u9CF4\u304D\u58F0\u3002",
      bgm: "story-spring",
      learn: "\u706B\u82B1\u3092\u4F7F\u3046\u6642\u6A5F\u3068\u3001\u7F6E\u3044\u3066\u52DD\u3064\u5834\u5408\u3092\u9078\u3073\u5206\u3051\u308B\u3002",
      intro: ["\u300C\u82B1\u3082\u66A6\u3082\u3001\u7F6E\u3044\u3066\u3042\u308B\u65B9\u304C\u60AA\u3044\u306E\u3055\u300D"],
      clear: ["\u5C71\u8CCA\u306F\u82B1\u675F\u3092\u843D\u3068\u3057\u3066\u9003\u3052\u305F\u3002\u66A6\u306F\u6301\u3063\u3066\u3044\u306A\u304B\u3063\u305F\u3002"],
      next: "\u591C\u3002\u685C\u306E\u4E0B\u306B\u3001\u5C71\u307B\u3069\u306E\u5927\u304D\u3055\u306E\u9762\u304C\u6D6E\u304B\u3093\u3067\u3044\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 5,
      chapter: 1,
      name: "\u591C\u685C\u306E\u5927\u5165\u9053",
      boss: true,
      enemy: { name: "\u685C\u9762\u306E\u5927\u5165\u9053\u30FB\u82B1\u9AB8", charId: "hibana", level: 5 },
      season: "spring",
      weather: "petals",
      time: "night",
      scenery: "\u5DE8\u5927\u306A\u685C\u9762\u3001\u63D0\u706F\u3001\u6708\u660E\u304B\u308A\u306E\u82B1\u5439\u96EA\u3002",
      ambience: "\u82B1\u3073\u3089\u304C\u964D\u308A\u3064\u3065\u3051\u308B\u97F3\u3060\u3051\u304C\u6B8B\u308B\u3002",
      bgm: "story-spring-boss",
      learn: "\u56DB\u9023\u3078\u306E\u5BFE\u51E6\u3068\u706B\u82B1\u306E\u7DCF\u5FA9\u7FD2\u3002",
      telegraphs: [],
      intro: [
        "\u6E80\u958B\u306E\u591C\u685C\u304C\u3001\u3072\u3068\u3064\u306E\u9762\u306B\u306A\u3063\u3066\u898B\u4E0B\u308D\u3057\u3066\u3044\u308B\u3002",
        "\u300C\u6563\u3089\u306C\u6625\u3092\u3084\u308D\u3046\u3002\u6C38\u9060\u306B\u3001\u3053\u306E\u591C\u306E\u307E\u307E\u3067\u300D"
      ],
      clear: [
        "\u9762\u304C\u5272\u308C\u3001\u306A\u304B\u304B\u3089\u5C0F\u3055\u306A\u685C\u306E\u679D\u304C\u843D\u3061\u305F\u3002\u546A\u3044\u304C\u89E3\u3051\u305F\u306E\u3060\u3002",
        "\u2500\u2500 \u6625\u82BD\u306E\u7881\u5370\u3092\u5F97\u305F\u3002"
      ],
      next: "\u82E5\u8449\u306E\u5302\u3044\u304C\u3059\u308B\u3002\u6B21\u306F\u7D50\u754C\u306E\u793E\u3060\u3002",
      reward: boss(5),
      drops: ["acc-oni-sakura", "outfit-hanamori", "board-yozakura"]
    },
    /* ── 第2章 若葉の結界と雷の社 ── */
    {
      id: 6,
      chapter: 2,
      name: "\u82E5\u8449\u3092\u5B88\u308B\u7D50\u754C",
      boss: false,
      enemy: { name: "\u3044\u305F\u305A\u3089\u5B50\u72F8", charId: "mamori", level: 4 },
      season: "rainy",
      weather: "clear",
      time: "morning",
      scenery: "\u900F\u3051\u308B\u82E5\u8449\u3001\u82D4\u3001\u7DD1\u306E\u5149\u3002",
      ambience: "\u6728\u6F0F\u308C\u65E5\u306E\u306A\u304B\u3001\u8449\u305A\u308C\u3068\u5C0F\u9CE5\u3002",
      bgm: "story-rain",
      learn: "\u4E88\u544A\u3055\u308C\u305F\u6D88\u53BB\u304B\u3089\u3001\u8981\u3068\u306A\u308B\u77F3\u3092\u5B88\u308B\u3002",
      telegraphs: [TELEGRAPH.SNIPE],
      intro: [
        "\u30DE\u30E2\u30EA\u304C\u82E5\u8449\u3092\u4E00\u679A\u3001\u76E4\u306E\u4E0A\u306B\u7F6E\u3044\u305F\u3002",
        "\u300C\u72D9\u308F\u308C\u308B\u524D\u306B\u56F2\u3048\u3070\u3044\u3044\u3002\u56F2\u308F\u308C\u305F\u77F3\u306F\u3001\u8AB0\u306B\u3082\u52D5\u304B\u305B\u306A\u3044\u300D",
        "\u2500\u2500 \u7D50\u754C\u3092\u7FD2\u5F97\u3059\u308B\u3002"
      ],
      clear: ["\u300C\u5B88\u3063\u305F\u77F3\u306F\u3001\u305D\u306E\u307E\u307E\u52DD\u3061\u7B4B\u306B\u306A\u308B\u3002\u5B88\u308B\u3060\u3051\u3067\u7D42\u308F\u3089\u305B\u306A\u3044\u3053\u3068\u300D"],
      next: "\u68EE\u3092\u629C\u3051\u308B\u3068\u3001\u9EA6\u7551\u306E\u5411\u3053\u3046\u306B\u5E5F\u304C\u4E26\u3093\u3067\u3044\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 7,
      chapter: 2,
      name: "\u9EA6\u7551\u306E\u756A\u4EBA",
      boss: false,
      enemy: { name: "\u7AF9\u69CD\u306E\u8DB3\u8EFD", charId: "hibana", level: 5 },
      season: "rainy",
      weather: "clear",
      time: "day",
      scenery: "\u9752\u7A7A\u3001\u4F38\u3073\u308B\u9EA6\u3001\u98A8\u306B\u63FA\u308C\u308B\u5E5F\u3002",
      ambience: "\u4E94\u6708\u6674\u308C\u306E\u98A8\u3068\u3001\u5E5F\u306E\u5E03\u97F3\u3002",
      bgm: "story-rain",
      learn: "\u59A8\u5BB3\u306B\u5099\u3048\u3066\u3001\u5B88\u308B\u77F3\u3092\u81EA\u5206\u3067\u9078\u3076\u3002",
      intro: ["\u300C\u3053\u306E\u9053\u306F\u901A\u3055\u3093\u3002\u9EA6\u3092\u8E0F\u3080\u306A\u300D"],
      clear: ["\u8DB3\u8EFD\u306F\u69CD\u3092\u4E0B\u308D\u3057\u3001\u7566\u9053\u3092\u6307\u3057\u305F\u3002"],
      next: "\u96E8\u3002\u7D2B\u967D\u82B1\u306E\u54B2\u304F\u5DDD\u3079\u308A\u306B\u3001\u6C34\u8ECA\u304C\u56DE\u3063\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 8,
      chapter: 2,
      name: "\u7D2B\u967D\u82B1\u306E\u6C34\u93E1",
      boss: false,
      enemy: { name: "\u6CB3\u7AE5\u306E\u5DDD\u756A", charId: "yukine", level: 5 },
      season: "rainy",
      weather: "rain",
      time: "day",
      scenery: "\u7D2B\u967D\u82B1\u3001\u6C34\u8ECA\u3001\u6C34\u9762\u306E\u6CE2\u7D0B\u3002",
      ambience: "\u3057\u3068\u3057\u3068\u96E8\u3068\u3001\u6C34\u8ECA\u306E\u8ECB\u307F\u3002",
      bgm: "story-rain",
      learn: "\u5B88\u3089\u308C\u305F\u77F3\u306B\u306F\u706B\u82B1\u304C\u52B9\u304B\u306A\u3044\u3002\u5225\u306E\u7B4B\u3092\u63A2\u3059\u3002",
      intro: ["\u300C\u56F2\u308F\u308C\u305F\u77F3\u3092\u71C3\u3084\u305D\u3046\u3068\u3057\u3066\u3082\u3001\u7121\u99C4\u3060\u3088\u300D"],
      clear: ["\u5DDD\u756A\u306F\u6C34\u306B\u6F5C\u308A\u3001\u9053\u3092\u958B\u3051\u305F\u3002"],
      next: "\u7A7A\u304C\u6697\u3044\u3002\u9060\u304F\u3067\u592A\u9F13\u306E\u3088\u3046\u306A\u96F7\u304C\u9CF4\u3063\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 9,
      chapter: 2,
      name: "\u96F7\u96F2\u306E\u77F3\u6BB5",
      boss: false,
      enemy: { name: "\u96F7\u592A\u9F13\u306E\u8D64\u9B3C", charId: "hayate", level: 6 },
      season: "rainy",
      weather: "thunder",
      time: "evening",
      scenery: "\u9ED2\u3044\u96F2\u3001\u6FE1\u308C\u305F\u5E5F\u3001\u9060\u3044\u7A32\u59BB\u3002",
      ambience: "\u9060\u96F7\u3068\u3001\u6FE1\u308C\u305F\u77F3\u6BB5\u3092\u6253\u3064\u96E8\u3002",
      bgm: "story-rain",
      learn: "\u653B\u3081\u3068\u5B88\u308A\u306E\u8CC7\u6E90\u914D\u5206\u3002\u4E88\u544A\u3092\u8AAD\u307F\u306A\u304C\u3089\u56DB\u9023\u3092\u4F5C\u308B\u3002",
      intro: ["\u300C\u5B88\u3063\u3066\u3070\u304B\u308A\u3058\u3083\u3001\u56DB\u3064\u306F\u4E26\u3070\u3093\u305E\u300D"],
      clear: ["\u8D64\u9B3C\u306F\u592A\u9F13\u3092\u80CC\u8CA0\u3044\u76F4\u3057\u3001\u793E\u306E\u65B9\u89D2\u3078\u9053\u3092\u8B72\u3063\u305F\u3002"],
      next: "\u793E\u306E\u5965\u304B\u3089\u3001\u8AB0\u3082\u6253\u3063\u3066\u3044\u306A\u3044\u592A\u9F13\u306E\u97F3\u304C\u3059\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 10,
      chapter: 2,
      name: "\u96F7\u306E\u793E\u3092\u89E3\u304F",
      boss: true,
      enemy: { name: "\u96F7\u5C06\u30FB\u9CF4\u795E", charId: "hayate", level: 8 },
      season: "rainy",
      weather: "storm",
      time: "night",
      scenery: "\u96F7\u96F2\u3001\u5DE8\u5927\u592A\u9F13\u3001\u52DD\u5229\u5F8C\u306E\u96F2\u9593\u306E\u661F\u3002",
      ambience: "\u96F7\u96E8\u3002\u52DD\u5229\u306E\u3042\u3068\u3001\u96E8\u97F3\u3060\u3051\u304C\u6B8B\u308B\u3002",
      bgm: "story-rain-boss",
      learn: "\u4E88\u544A\u72D9\u6483\u306B\u7D50\u754C\u3067\u5BFE\u6297\u3059\u308B\u3002",
      telegraphs: [TELEGRAPH.SNIPE],
      intro: [
        "\u5DE8\u5927\u306A\u592A\u9F13\u304C\u3001\u793E\u6BBF\u3054\u3068\u9707\u3048\u3066\u3044\u308B\u3002",
        "\u300C\u6885\u96E8\u3092\u6B62\u3081\u3066\u304A\u3051\u3070\u3001\u590F\u306F\u6765\u306C\u3002\u8AB0\u3082\u5225\u308C\u305A\u306B\u6E08\u3080\u300D"
      ],
      clear: [
        "\u592A\u9F13\u304C\u5272\u308C\u3001\u96F2\u306E\u5207\u308C\u9593\u304B\u3089\u661F\u304C\u898B\u3048\u305F\u3002",
        "\u2500\u2500 \u82E5\u8449\u306E\u7881\u5370\u3092\u5F97\u305F\u3002"
      ],
      next: "\u96E8\u304C\u3042\u304C\u3063\u305F\u3002\u4E7E\u3044\u305F\u71B1\u304C\u3001\u5C71\u306E\u65B9\u304B\u3089\u6D41\u308C\u3066\u304F\u308B\u3002",
      reward: boss(10),
      drops: ["stone-raiko", "acc-raikaku", "board-ameagari"]
    },
    /* ── 第3章 炎陽の山と竜の翼 ── */
    {
      id: 11,
      chapter: 3,
      name: "\u5B88\u308A\u3092\u904B\u3076\u98A8",
      boss: false,
      enemy: { name: "\u706B\u5B88\u308A\u306E\u5929\u72D7", charId: "hayate", level: 7 },
      season: "summer",
      weather: "clear",
      time: "morning",
      scenery: "\u98A8\u9234\u3001\u6D77\u306E\u53CD\u5C04\u3001\u63FA\u308C\u308B\u9752\u8449\u3002",
      ambience: "\u6D77\u98A8\u3068\u98A8\u9234\u3002",
      bgm: "story-summer",
      learn: "\u5B88\u308A\u4ED8\u304D\u306E\u77F3\u3092\u3001\u72D9\u308F\u308C\u3066\u3044\u308B\u4F4D\u7F6E\u3078\u904B\u3076\u3002",
      telegraphs: [TELEGRAPH.SNIPE],
      intro: [
        "\u30CF\u30E4\u30C6\u304C\u98A8\u9234\u3092\u9CF4\u3089\u3057\u305F\u3002",
        "\u300C\u56F2\u3063\u305F\u77F3\u306F\u52D5\u304B\u305B\u308B\u3002\u5B88\u308A\u3054\u3068\u904B\u3079\u3070\u3044\u3044\u300D",
        "\u2500\u2500 \u98A8\u6E21\u308A\u3092\u7FD2\u5F97\u3059\u308B\u3002"
      ],
      clear: ["\u300C\u7F6E\u304F\u3060\u3051\u304C\u624B\u3058\u3083\u306A\u3044\u3002\u52D5\u304B\u3059\u306E\u3082\u4E00\u624B\u3060\u300D"],
      next: "\u5C71\u9053\u306B\u5165\u308B\u3068\u3001\u5730\u9762\u304B\u3089\u967D\u708E\u304C\u7ACB\u3061\u306E\u307C\u3063\u3066\u3044\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 12,
      chapter: 3,
      name: "\u967D\u708E\u3092\u8FFD\u3044\u8D8A\u305B",
      boss: false,
      enemy: { name: "\u7802\u8D70\u308A\u306E\u72FC", charId: "hayate", level: 8 },
      season: "summer",
      weather: "haze",
      time: "day",
      scenery: "\u967D\u708E\u3001\u6FC3\u3044\u5F71\u3001\u4E7E\u3044\u305F\u571F\u3002",
      ambience: "\u5F37\u3044\u65E5\u5DEE\u3057\u3068\u3001\u4E7E\u3044\u305F\u7802\u306E\u97F3\u3002",
      bgm: "story-summer",
      learn: "\u79FB\u52D5\u5143\u3068\u79FB\u52D5\u5148\u3092\u9078\u3076\u64CD\u4F5C\u3092\u5B9F\u6226\u3067\u5FA9\u7FD2\u3059\u308B\u3002",
      intro: ["\u72FC\u306F\u5F71\u306E\u3088\u3046\u306B\u901F\u3044\u3002\u300C\u7F6E\u304F\u5834\u6240\u3092\u3001\u8FF7\u3046\u306A\u300D"],
      clear: ["\u72FC\u306F\u65E5\u9670\u3078\u9000\u304D\u3001\u9053\u3092\u7A7A\u3051\u305F\u3002"],
      next: "\u7A7A\u306B\u5165\u9053\u96F2\u3002\u8D64\u3044\u5CA9\u304C\u6E6F\u6C17\u3092\u7ACB\u3066\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 13,
      chapter: 3,
      name: "\u7ADC\u306E\u6700\u521D\u306E\u708E",
      boss: false,
      enemy: { name: "\u82E5\u706B\u7ADC", charId: "hibana", level: 9 },
      season: "summer",
      weather: "thunder",
      time: "day",
      scenery: "\u7A4D\u4E71\u96F2\u3001\u6FE1\u308C\u305F\u8D64\u5CA9\u3001\u84B8\u6C17\u3002",
      ambience: "\u5915\u7ACB\u3068\u3001\u5CA9\u306B\u843D\u3061\u308B\u96E8\u306E\u5F3E\u3051\u308B\u97F3\u3002",
      bgm: "story-summer",
      learn: "\u76F8\u624B\u306E\u4E88\u544A\u3068\u3001\u81EA\u5206\u306E\u52DD\u3061\u7B4B\u3092\u540C\u6642\u306B\u898B\u308B\u3002",
      intro: ["\u300C\u71B1\u3044\u3060\u308D\u3046\u3002\u307E\u3060\u672C\u6C17\u3058\u3083\u306A\u3044\u300D"],
      clear: ["\u82E5\u706B\u7ADC\u306F\u6E6F\u6C17\u306E\u4E2D\u3078\u7FFC\u3092\u305F\u305F\u3093\u3060\u3002"],
      next: "\u591C\u3002\u5C71\u306E\u796D\u308A\u306E\u63D0\u706F\u304C\u3001\u5C3E\u6839\u3065\u305F\u3044\u306B\u706F\u3063\u3066\u3044\u304F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 14,
      chapter: 3,
      name: "\u706F\u306E\u4E0A\u3092\u98DB\u3076\u5F71",
      boss: false,
      enemy: { name: "\u9ED2\u7FFC\u306E\u98DB\u7ADC", charId: "kuon", level: 10 },
      season: "summer",
      weather: "clear",
      time: "night",
      scenery: "\u63D0\u706F\u3001\u9060\u3044\u6253\u3061\u4E0A\u3052\u82B1\u706B\u3001\u591C\u306E\u5C71\u5F71\u3002",
      ambience: "\u796D\u308A\u56C3\u5B50\u304C\u9060\u304F\u3001\u7FBD\u3070\u305F\u304D\u304C\u8FD1\u3044\u3002",
      bgm: "story-summer",
      learn: "\u4E8C\u3064\u306E\u52DD\u3061\u7B4B\u3092\u4F5C\u308A\u3001\u5B88\u308A\u3092\u52D5\u304B\u3057\u3066\u7DAD\u6301\u3059\u308B\u3002",
      intro: ["\u63D0\u706F\u306E\u5217\u3092\u3001\u5927\u304D\u306A\u5F71\u304C\u6A2A\u5207\u3063\u305F\u3002"],
      clear: ["\u98DB\u7ADC\u306F\u706B\u306E\u7C89\u3092\u6563\u3089\u3057\u3066\u3001\u5C71\u306E\u5411\u3053\u3046\u3078\u6D88\u3048\u305F\u3002"],
      next: "\u5C3E\u6839\u306E\u5148\u304C\u660E\u308B\u3044\u3002\u7A7A\u305D\u306E\u3082\u306E\u304C\u707C\u3051\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 15,
      chapter: 3,
      name: "\u708E\u5DBA\u3092\u8D8A\u3048\u308B\u4E00\u624B",
      boss: true,
      enemy: { name: "\u708E\u5DBA\u7ADC\u30FB\u7D05\u84EE", charId: "kuon", level: 12 },
      season: "summer",
      weather: "firestorm",
      time: "evening",
      scenery: "\u5DE8\u5927\u306A\u7FFC\u3001\u6EB6\u5CA9\u3001\u706B\u306E\u7C89\u3001\u713C\u3051\u305F\u5915\u7A7A\u3002",
      ambience: "\u708E\u306E\u5538\u308A\u3068\u3001\u7FFC\u304C\u7A7A\u6C17\u3092\u88C2\u304F\u97F3\u3002",
      bgm: "story-summer-boss",
      learn: "\u706B\u82B1\u30FB\u7D50\u754C\u30FB\u98A8\u6E21\u308A\u3092\u7D44\u307F\u5408\u308F\u305B\u308B\u3002",
      telegraphs: [TELEGRAPH.SNIPE],
      intro: [
        "\u7FFC\u304C\u753B\u9762\u306E\u5916\u307E\u3067\u5E83\u304C\u3063\u3066\u3044\u308B\u3002",
        "\u300C\u590F\u3092\u707C\u304D\u6B62\u3081\u3066\u304A\u3051\u3070\u3001\u79CB\u306F\u6765\u306C\u3002\u67AF\u308C\u308B\u3082\u306E\u3082\u7121\u3044\u300D"
      ],
      clear: [
        "\u7FFC\u304C\u4E0B\u308A\u3001\u6EB6\u5CA9\u304C\u9ED2\u304F\u56FA\u307E\u3063\u3066\u3044\u304F\u3002",
        "\u2500\u2500 \u708E\u967D\u306E\u7881\u5370\u3092\u5F97\u305F\u3002"
      ],
      next: "\u5CE0\u3092\u8D8A\u3048\u308B\u3068\u3001\u3059\u3059\u304D\u306E\u539F\u306B\u9732\u304C\u964D\u308A\u3066\u3044\u305F\u3002\u2026\u2026\u971C\u3082\u3002",
      reward: boss(15),
      drops: ["outfit-enryu", "stone-yogan", "acc-enryu-tsuno"]
    },
    /* ── 第4章 秋月の森と時知らずの霜 ── */
    {
      id: 16,
      chapter: 4,
      name: "\u79CB\u306B\u964D\u308B\u971C",
      boss: false,
      enemy: { name: "\u971C\u5360\u3044\u306E\u72D0\u7AE5", charId: "yukine", level: 10 },
      season: "autumn",
      weather: "fog",
      time: "dawn",
      scenery: "\u3059\u3059\u304D\u3001\u9732\u3001\u4E00\u90E8\u3060\u3051\u51CD\u3063\u305F\u8449\u3002",
      ambience: "\u660E\u3051\u65B9\u306E\u9759\u3051\u3055\u3068\u3001\u8449\u306E\u4E0A\u3067\u6C37\u304C\u9CF4\u308B\u97F3\u3002",
      bgm: "story-autumn",
      learn: "\u7F6E\u304F\u3068\u596A\u308F\u308C\u308B\u5730\u70B9\u3092\u51CD\u3089\u305B\u3001\u4E88\u544A\u5360\u9818\u3092\u4E0D\u767A\u306B\u3059\u308B\u3002",
      telegraphs: [TELEGRAPH.SEIZE],
      intro: [
        "\u30E6\u30AD\u30CD\u304C\u3001\u307E\u3060\u79CB\u306A\u306E\u306B\u51CD\u3063\u305F\u8449\u3092\u3064\u307E\u307F\u4E0A\u3052\u305F\u3002",
        "\u300C\u7F6E\u3051\u3070\u596A\u308F\u308C\u308B\u5834\u6240\u304C\u3042\u308B\u3002\u306A\u3089\u3001\u8AB0\u306B\u3082\u7F6E\u3051\u306A\u304F\u3059\u308C\u3070\u3044\u3044\u300D",
        "\u2500\u2500 \u6C37\u7D50\u3092\u7FD2\u5F97\u3059\u308B\u3002\u51AC\u306E\u6B20\u7247\u304C\u3001\u79CB\u3078\u904B\u3070\u308C\u3066\u3044\u308B\u3002"
      ],
      clear: ["\u300C\u51CD\u3089\u305B\u3066\u3082\u3001\u89E3\u3051\u308B\u3002\u89E3\u3051\u308B\u524D\u306B\u81EA\u5206\u3067\u585E\u3050\u3053\u3068\u300D"],
      next: "\u7A32\u7A42\u306E\u539F\u306B\u51FA\u305F\u3002\u5208\u308A\u5165\u308C\u306E\u98A8\u304C\u5439\u3044\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 17,
      chapter: 4,
      name: "\u5B9F\u308A\u306E\u9053\u3092\u5B88\u308C",
      boss: false,
      enemy: { name: "\u938C\u98A8\u306E\u91CE\u6B66\u58EB", charId: "hayate", level: 11 },
      season: "autumn",
      weather: "clear",
      time: "evening",
      scenery: "\u7A32\u7A42\u3001\u7A32\u67B6\u639B\u3051\u3001\u8D64\u3068\u3093\u307C\u3002",
      ambience: "\u53CE\u7A6B\u306E\u98A8\u3068\u3001\u4E7E\u3044\u305F\u7A32\u306E\u97F3\u3002",
      bgm: "story-autumn",
      learn: "\u6C37\u7D50\u306E\u89E3\u9664\u6642\u6A5F\u3092\u898B\u3066\u3001\u6B21\u306E\u624B\u3092\u5148\u306B\u8003\u3048\u308B\u3002",
      intro: ["\u300C\u51CD\u3089\u305B\u305F\u5148\u3092\u3001\u3082\u3046\u6C7A\u3081\u3066\u3042\u308B\u304B\uFF1F\u300D"],
      clear: ["\u91CE\u6B66\u58EB\u306F\u938C\u3092\u53CE\u3081\u3001\u7A32\u67B6\u306E\u9593\u3092\u901A\u3057\u3066\u304F\u308C\u305F\u3002"],
      next: "\u6708\u304C\u51FA\u305F\u3002\u5927\u304D\u3059\u304E\u308B\u307B\u3069\u306E\u3001\u540D\u6708\u3060\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 18,
      chapter: 4,
      name: "\u540D\u6708\u306E\u72D9\u3044",
      boss: false,
      enemy: { name: "\u5316\u3051\u732B\u306E\u5F13\u5E2B", charId: "hibana", level: 11 },
      season: "autumn",
      weather: "clear",
      time: "night",
      scenery: "\u5927\u304D\u306A\u6708\u3001\u3059\u3059\u304D\u3001\u9759\u304B\u306A\u866B\u306E\u5149\u3002",
      ambience: "\u866B\u306E\u97F3\u3068\u3001\u5F26\u306E\u5F35\u308B\u97F3\u3002",
      bgm: "story-autumn",
      learn: "\u6D88\u53BB\u30FB\u9632\u5FA1\u30FB\u5C01\u9396\u306E\u9055\u3044\u3092\u9078\u3073\u5206\u3051\u308B\u3002",
      intro: ["\u300C\u6D88\u3059\u306E\u304B\u3001\u56F2\u3046\u306E\u304B\u3001\u51CD\u3089\u305B\u308B\u306E\u304B\u3002\u3072\u3068\u3064\u3057\u304B\u9078\u3079\u306C\u305E\u300D"],
      clear: ["\u5F13\u5E2B\u306F\u6708\u3078\u5411\u304B\u3063\u3066\u4E00\u793C\u3057\u3001\u59FF\u3092\u6D88\u3057\u305F\u3002"],
      next: "\u843D\u8449\u304C\u6DF1\u3044\u3002\u8E0F\u3080\u3068\u3001\u4E0B\u304B\u3089\u971C\u306E\u97F3\u304C\u3059\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 19,
      chapter: 4,
      name: "\u843D\u8449\u306E\u93A7",
      boss: false,
      enemy: { name: "\u843D\u8449\u93A7\u306E\u9B3C\u6B66\u8005", charId: "mamori", level: 12 },
      season: "autumn",
      weather: "fog",
      time: "day",
      scenery: "\u8D64\u3084\u91D1\u306E\u843D\u8449\u3001\u767D\u3044\u971C\u3001\u51B7\u305F\u3044\u5C71\u5F71\u3002",
      ambience: "\u843D\u8449\u3092\u8E0F\u3080\u97F3\u3068\u3001\u521D\u971C\u306E\u8ECB\u307F\u3002",
      bgm: "story-autumn",
      learn: "\u5B88\u308A\u4ED8\u304D\u77F3\u3092\u907F\u3051\u3001\u8907\u6570\u306E\u8105\u5A01\u3092\u6BD4\u3079\u308B\u3002",
      intro: ["\u300C\u56F2\u3063\u305F\u77F3\u306F\u8CB0\u3048\u306C\u3002\u306A\u3089\u3070\u3001\u3069\u3053\u3092\u72D9\u3046\uFF1F\u300D"],
      clear: ["\u93A7\u304C\u843D\u8449\u306B\u5D29\u308C\u3001\u4E0B\u304B\u3089\u971C\u3060\u3051\u304C\u6B8B\u3063\u305F\u3002"],
      next: "\u68EE\u306E\u5965\u3002\u6708\u304C\u6731\u3044\u3002\u5C3E\u306E\u3088\u3046\u306A\u5F71\u304C\u4E5D\u3064\u63FA\u308C\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 20,
      chapter: 4,
      name: "\u6731\u6708\u3068\u4E5D\u3064\u306E\u5F71",
      boss: true,
      enemy: { name: "\u7D05\u8449\u306E\u4E5D\u5C3E\u30FB\u6727", charId: "akari", level: 15 },
      season: "autumn",
      weather: "maple-storm",
      time: "night",
      scenery: "\u4E5D\u672C\u306E\u5C3E\u3001\u7D05\u8449\u306E\u6E26\u3001\u6731\u6708\u3002",
      ambience: "\u8449\u306E\u6E26\u304C\u58F0\u306E\u3088\u3046\u306B\u9CF4\u308B\u3002",
      bgm: "story-autumn-boss",
      learn: "\u6C37\u7D50\u3068\u4E88\u544A\u5BFE\u7B56\u3002",
      telegraphs: [TELEGRAPH.SEIZE],
      intro: [
        "\u4E5D\u3064\u306E\u5C3E\u304C\u3001\u7D05\u8449\u3054\u3068\u6E26\u3092\u5DFB\u3044\u3066\u3044\u308B\u3002",
        "\u300C\u79CB\u3067\u6B62\u3081\u307E\u3057\u3087\u3046\u3002\u5B9F\u3063\u305F\u307E\u307E\u3001\u843D\u3061\u306A\u3044\u307E\u307E\u300D",
        "\uFF08\u5E7B\u306F\u898B\u305F\u76EE\u3060\u3051\u3002\u76E4\u306E\u77F3\u306F\u3001\u3044\u3064\u3082\u3069\u304A\u308A\u305D\u3053\u306B\u3042\u308B\uFF09"
      ],
      clear: [
        "\u5C3E\u304C\u4E00\u672C\u305A\u3064\u843D\u8449\u306B\u9084\u308A\u3001\u6731\u3044\u6708\u304C\u767D\u304F\u623B\u3063\u305F\u3002",
        "\u2500\u2500 \u79CB\u6708\u306E\u7881\u5370\u3092\u5F97\u305F\u3002"
      ],
      next: "\u606F\u304C\u767D\u3044\u3002\u5CF0\u3078\u7D9A\u304F\u9053\u306B\u3001\u971C\u67F1\u304C\u7ACB\u3063\u3066\u3044\u305F\u3002",
      reward: boss(20),
      drops: ["acc-kyubi", "board-shugetsu", "outfit-oboro"]
    },
    /* ── 第5章 雪星の峰と古龍の誓い ── */
    {
      id: 21,
      chapter: 5,
      name: "\u96EA\u306E\u5411\u3053\u3046\u306E\u661F",
      boss: false,
      enemy: { name: "\u661F\u62FE\u3044\u306E\u96EA\u5C0F\u9B3C", charId: "kuon", level: 14 },
      season: "winter",
      weather: "clear",
      time: "dawn",
      scenery: "\u971C\u67F1\u3001\u307E\u3070\u3089\u306A\u96EA\u3001\u6F84\u3093\u3060\u661F\u3002",
      ambience: "\u971C\u67F1\u3092\u8E0F\u3080\u97F3\u3002\u98A8\u306F\u7121\u3044\u3002",
      bgm: "story-winter",
      learn: "\u90AA\u9B54\u306A\u76F8\u624B\u77F3\u3092\u3001\u5B89\u5168\u306A\u96A3\u63A5\u70B9\u3078\u79FB\u3059\u3002",
      intro: [
        "\u30AF\u30AA\u30F3\u304C\u3001\u76E4\u306E\u4E0A\u306E\u77F3\u3092\u6307\u5148\u3067\u5F15\u304D\u5BC4\u305B\u305F\u3002",
        "\u300C\u6D88\u3055\u306A\u304F\u3066\u3044\u3044\u3002\u3069\u304B\u305B\u3070\u6E08\u3080\u3053\u3068\u304C\u3042\u308B\u300D",
        "\u2500\u2500 \u5F15\u529B\u3092\u7FD2\u5F97\u3059\u308B\u3002"
      ],
      clear: ["\u300C\u3069\u304B\u3057\u305F\u5148\u3067\u76F8\u624B\u304C\u52DD\u3064\u3053\u3068\u3082\u3042\u308B\u3002\u884C\u304D\u5148\u3092\u3088\u304F\u898B\u308D\u300D"],
      next: "\u5C3E\u6839\u306B\u51FA\u305F\u3068\u305F\u3093\u3001\u8996\u754C\u304C\u767D\u4E00\u8272\u306B\u306A\u3063\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 22,
      chapter: 5,
      name: "\u767D\u3044\u93A7\u306E\u8DB3\u8DE1",
      boss: false,
      enemy: { name: "\u6C37\u7532\u306E\u72FC", charId: "mamori", level: 15 },
      season: "winter",
      weather: "blizzard",
      time: "day",
      scenery: "\u5439\u96EA\u3001\u767D\u6A3A\u3001\u9752\u3044\u6C37\u7532\u3002",
      ambience: "\u5439\u96EA\u306E\u5538\u308A\u3002\u8DB3\u8DE1\u306F\u3059\u3050\u6D88\u3048\u308B\u3002",
      bgm: "story-winter",
      learn: "\u5F15\u529B\u306F\u5B88\u308A\u4ED8\u304D\u77F3\u306B\u306F\u52B9\u304B\u306A\u3044\u3002",
      intro: ["\u300C\u51CD\u3063\u305F\u93A7\u306F\u3001\u5F15\u3044\u3066\u3082\u52D5\u304B\u3093\u300D"],
      clear: ["\u72FC\u306F\u6C37\u7532\u3092\u9CF4\u3089\u3057\u3066\u3001\u9053\u306E\u7AEF\u3078\u9000\u3044\u305F\u3002"],
      next: "\u98A8\u304C\u3084\u3093\u3060\u3002\u6A39\u6C37\u304C\u671D\u65E5\u3067\u5149\u3063\u3066\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 23,
      chapter: 5,
      name: "\u6A39\u6C37\u306E\u7FFC",
      boss: false,
      enemy: { name: "\u6C37\u7FFC\u306E\u98DB\u7ADC", charId: "kuon", level: 15 },
      season: "winter",
      weather: "clear",
      time: "morning",
      scenery: "\u6A39\u6C37\u3001\u9752\u7A7A\u3001\u304D\u3089\u3081\u304F\u96EA\u3002",
      ambience: "\u51AC\u6674\u308C\u306E\u9759\u5BC2\u3068\u3001\u6C37\u306E\u5272\u308C\u308B\u9AD8\u3044\u97F3\u3002",
      bgm: "story-winter",
      learn: "\u79FB\u52D5\u3067\u76F8\u624B\u3092\u52DD\u305F\u305B\u306A\u3044\u3088\u3046\u3001\u79FB\u52D5\u5148\u3092\u78BA\u8A8D\u3059\u308B\u3002",
      intro: ["\u300C\u5F15\u3044\u305F\u5148\u304C\u3001\u79C1\u306E\u4E94\u3064\u76EE\u3067\u306A\u3044\u3068\u8A00\u3048\u308B\u304B\u300D"],
      clear: ["\u98DB\u7ADC\u306F\u6A39\u6C37\u3092\u6563\u3089\u3057\u3066\u821E\u3044\u4E0A\u304C\u308A\u3001\u53BB\u3063\u305F\u3002"],
      next: "\u96EA\u5D50\u3002\u5DE8\u5927\u306A\u8DB3\u8DE1\u304C\u3001\u9580\u306E\u3088\u3046\u306B\u4E26\u3093\u3067\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 24,
      chapter: 5,
      name: "\u96EA\u539F\u306E\u9580",
      boss: false,
      enemy: { name: "\u96EA\u539F\u306E\u5DE8\u4EBA", charId: "yukine", level: 16 },
      season: "winter",
      weather: "blizzard",
      time: "evening",
      scenery: "\u5DE8\u5927\u306A\u8DB3\u8DE1\u3001\u96EA\u7159\u3001\u971C\u306E\u9580\u3002",
      ambience: "\u96EA\u5D50\u3002\u4F4E\u3044\u5538\u308A\u304C\u5730\u9762\u304B\u3089\u4F1D\u308F\u308B\u3002",
      bgm: "story-winter",
      learn: "5\u7A2E\u985E\u306E\u8853\u304B\u3089\u5FC5\u8981\u306A\u3082\u306E\u3060\u3051\u3092\u9078\u3073\u3001\u30A8\u30CA\u30B8\u30FC\u3092\u6B8B\u3059\u3002",
      intro: ["\u300C\u5168\u90E8\u4F7F\u3048\u3070\u52DD\u3066\u308B\u3068\u601D\u3046\u306A\u3002\u6B8B\u3059\u624B\u3092\u6C7A\u3081\u3066\u304A\u3051\u300D"],
      clear: ["\u5DE8\u4EBA\u306F\u819D\u3092\u3064\u304D\u3001\u9580\u306E\u304B\u305F\u3061\u306B\u96EA\u304C\u5D29\u308C\u305F\u3002"],
      next: "\u7A7A\u306B\u30AA\u30FC\u30ED\u30E9\u3002\u305D\u306E\u4E0B\u306B\u3001\u5C71\u306E\u3088\u3046\u306A\u89D2\u304C\u898B\u3048\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 25,
      chapter: 5,
      name: "\u767D\u9280\u53E4\u9F8D\u306E\u8A93\u3044",
      boss: true,
      enemy: { name: "\u767D\u9280\u53E4\u9F8D\u30FB\u971C\u7259", charId: "yukine", level: 18 },
      season: "winter",
      weather: "aurora",
      time: "night",
      scenery: "\u5DE8\u5927\u306A\u89D2\u3001\u6C37\u6676\u3001\u30AA\u30FC\u30ED\u30E9\u3001\u767D\u3044\u5410\u606F\u3002",
      ambience: "\u6975\u5BD2\u306E\u9759\u3051\u3055\u3002\u5410\u606F\u304C\u51CD\u308B\u97F3\u307E\u3067\u805E\u3053\u3048\u308B\u3002",
      bgm: "story-winter-boss",
      learn: "\u5C01\u9396\u30FB\u9632\u5FA1\u30FB\u5F15\u529B\u3092\u72B6\u6CC1\u3067\u4F7F\u3044\u5206\u3051\u308B\u3002",
      telegraphs: [],
      intro: [
        "\u53E4\u9F8D\u306F\u76EE\u3092\u958B\u3051\u305A\u306B\u8A00\u3063\u305F\u3002",
        "\u300C\u51AC\u3067\u6B62\u3081\u308B\u3068\u8A93\u3063\u305F\u3002\u8AB0\u3082\u6EB6\u3051\u306C\u3088\u3046\u306B\u3001\u5931\u308F\u306C\u3088\u3046\u306B\u300D"
      ],
      clear: [
        "\u53E4\u9F8D\u306F\u8A93\u3044\u3092\u89E3\u304D\u3001\u6C37\u6676\u304C\u6C34\u306E\u97F3\u3092\u53D6\u308A\u623B\u3057\u305F\u3002",
        "\u2500\u2500 \u96EA\u661F\u306E\u7881\u5370\u3092\u5F97\u305F\u3002"
      ],
      next: "\u5CF0\u306E\u5411\u3053\u3046\u306B\u3001\u57CE\u3002\u7A93\u304C\u51CD\u3063\u305F\u307E\u307E\u3001\u91D1\u8272\u306B\u5149\u3063\u3066\u3044\u308B\u3002",
      reward: boss(25),
      drops: ["stone-hakugin", "outfit-yukiboshi", "board-kyokko"]
    },
    /* ── 第6章 暁の城と還る四季 ── */
    {
      id: 26,
      chapter: 6,
      name: "\u591C\u660E\u3051\u3092\u5857\u308A\u66FF\u3048\u308B",
      boss: false,
      enemy: { name: "\u6681\u9580\u306E\u5F71\u6CD5\u5E2B", charId: "akari", level: 18 },
      season: "all",
      weather: "shifting",
      time: "dawn",
      scenery: "\u51CD\u3063\u305F\u7A93\u3001\u7D30\u3044\u91D1\u306E\u5149\u3001\u6885\u306E\u4E00\u8F2A\u3002",
      ambience: "\u51CD\u3063\u305F\u5149\u3002\u97F3\u304C\u3072\u3068\u3064\u3082\u7121\u3044\u3002",
      bgm: "story-final",
      learn: "\u5217\u306E\u4E2D\u306E\u76F8\u624B\u77F3\u3092\u5909\u3048\u3001\u305D\u306E\u4E00\u624B\u3067\u4E94\u9023\u306B\u3059\u308B\u3002",
      telegraphs: [],
      intro: [
        "\u30A2\u30AB\u30EA\u304C\u3001\u51CD\u3063\u305F\u7A93\u306B\u5149\u3092\u901A\u3057\u305F\u3002",
        "\u300C\u6D88\u3059\u306E\u3067\u3082\u52D5\u304B\u3059\u306E\u3067\u3082\u306A\u3044\u3002\u3053\u3061\u3089\u306E\u3082\u306E\u306B\u3059\u308B\u300D",
        "\u2500\u2500 \u8EE2\u5149\u3092\u7FD2\u5F97\u3059\u308B\u3002\u516D\u3064\u3001\u3059\u3079\u3066\u63C3\u3063\u305F\u3002"
      ],
      clear: ["\u300C\u4E00\u5EA6\u304D\u308A\u3060\u3002\u4F7F\u3044\u3069\u3053\u308D\u3092\u9593\u9055\u3048\u308B\u306A\u300D"],
      next: "\u56DE\u5ECA\u306E\u5148\u3067\u3001\u3053\u3061\u3089\u3068\u540C\u3058\u80CC\u683C\u597D\u306E\u5F71\u304C\u5F85\u3063\u3066\u3044\u305F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 27,
      chapter: 6,
      name: "\u6625\u3092\u5F85\u3064\u5F71",
      boss: false,
      enemy: { name: "\u9B54\u738B\u306E\u5F71\u6B66\u8005", charId: "akari", level: 19 },
      season: "all",
      weather: "clear",
      time: "evening",
      scenery: "\u67AF\u6728\u3001\u6885\u306E\u82B1\u3001\u878D\u3051\u59CB\u3081\u305F\u5C0F\u3055\u306A\u6C34\u9762\u3002",
      ambience: "\u96EB\u306E\u843D\u3061\u308B\u97F3\u304C\u3072\u3068\u3064\u3001\u307E\u305F\u3072\u3068\u3064\u3002",
      bgm: "story-final",
      learn: "6\u8853\u304B\u3089\u89E3\u6CD5\u3092\u9078\u3076\u3002\u8EE2\u5149\u3092\u7121\u99C4\u9063\u3044\u3057\u306A\u3044\u3002",
      intro: ["\u300C\u516D\u3064\u6301\u3063\u3066\u3044\u3066\u3082\u3001\u4F7F\u3048\u308B\u306E\u306F\u4E00\u624B\u306B\u3072\u3068\u3064\u3060\u300D"],
      clear: ["\u5F71\u6B66\u8005\u306F\u6885\u306E\u82B1\u3073\u3089\u306B\u306A\u3063\u3066\u6563\u3063\u305F\u3002"],
      next: "\u8DB3\u5143\u306E\u6B8B\u96EA\u304C\u3001\u307F\u308B\u307F\u308B\u6EB6\u3051\u3066\u3044\u304F\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 28,
      chapter: 6,
      name: "\u96EA\u89E3\u3051\u306E\u53CC\u982D\u7ADC",
      boss: false,
      enemy: { name: "\u865A\u7121\u306E\u53CC\u982D\u7ADC", charId: "kuon", level: 20 },
      season: "all",
      weather: "snow",
      time: "day",
      scenery: "\u6B8B\u96EA\u3001\u6C34\u6EF4\u3001\u4E8C\u3064\u306E\u5DE8\u5927\u306A\u9996\u3002",
      ambience: "\u96EA\u89E3\u3051\u306E\u6C34\u97F3\u3068\u3001\u4E8C\u91CD\u306E\u5538\u308A\u3002",
      bgm: "story-final",
      learn: "\u4E8C\u65B9\u5411\u306E\u8105\u5A01\u3092\u8AAD\u3080\u3002",
      intro: ["\u9996\u304C\u4E8C\u3064\u3002\u3060\u304C\u6253\u3064\u624B\u306F\u4E00\u3064\u305A\u3064\u3060\u3002"],
      clear: ["\u4E8C\u3064\u306E\u9996\u306F\u6C34\u9762\u306B\u6EB6\u3051\u3001\u305F\u3060\u306E\u96EA\u89E3\u3051\u6C34\u306B\u306A\u3063\u305F\u3002"],
      next: "\u56DE\u5ECA\u306E\u533A\u753B\u3054\u3068\u306B\u3001\u685C\u3001\u96E8\u3001\u7D05\u8449\u3001\u96EA\u304C\u4E26\u3093\u3067\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 29,
      chapter: 6,
      name: "\u56DB\u5B63\u306E\u6700\u5F8C\u306E\u9580\u756A",
      boss: false,
      enemy: { name: "\u56DB\u5B63\u885B\u5175\u9577\u30FB\u7384\u66A6", charId: "mamori", level: 21 },
      season: "all",
      weather: "shifting",
      time: "night",
      scenery: "\u685C\u3001\u96E8\u3001\u7D05\u8449\u3001\u96EA\u304C\u56DE\u5ECA\u306E\u5225\u533A\u753B\u306B\u4E26\u3076\u3002",
      ambience: "\u56DB\u3064\u306E\u5B63\u7BC0\u306E\u97F3\u304C\u3001\u533A\u753B\u3054\u3068\u306B\u5207\u308A\u66FF\u308F\u308B\u3002",
      bgm: "story-final",
      learn: "\u6700\u7D42\u5FA9\u7FD2\u3002\u76F8\u624B\u306E\u52DD\u3061\u3092\u6B62\u3081\u3001\u81EA\u5206\u306E\u4E94\u9023\u3092\u7D50\u3076\u3002",
      intro: ["\u300C\u65B0\u3057\u3044\u8853\u306F\u7121\u3044\u3002\u3053\u3053\u307E\u3067\u306E\u3059\u3079\u3066\u3067\u6765\u3044\u300D"],
      clear: ["\u7384\u66A6\u306F\u69CD\u3092\u5F15\u304D\u3001\u6700\u5F8C\u306E\u6249\u3092\u958B\u3051\u305F\u3002"],
      next: "\u7389\u5EA7\u306E\u9593\u3002\u56DB\u5B63\u304C\u3001\u9589\u3058\u8FBC\u3081\u3089\u308C\u305F\u307E\u307E\u4E26\u3093\u3067\u3044\u308B\u3002",
      reward: normal(),
      drops: []
    },
    {
      id: 30,
      chapter: 6,
      name: "\u56DB\u5B63\u3092\u9084\u3059\u4E94\u3064\u306E\u5149",
      boss: true,
      enemy: { name: "\u56DB\u5B63\u55B0\u3089\u3044\u306E\u9B54\u738B\u30FB\u7121\u5B63", charId: "akari", level: 25 },
      season: "all",
      weather: "shifting",
      time: "dawn",
      scenery: "\u5DE8\u5927\u306A\u5F71\u3068\u7389\u5EA7\u3001\u9589\u3058\u8FBC\u3081\u305F\u56DB\u5B63\u3001\u516D\u3064\u306E\u7881\u5370\u3002",
      ambience: "\u7121\u97F3\u3002\u77F3\u3092\u7F6E\u304F\u97F3\u3060\u3051\u304C\u97FF\u304F\u3002",
      bgm: "story-final-boss",
      learn: "\u65E2\u7FD26\u8853\u306E\u7DCF\u5408\u6226\u3002",
      telegraphs: [],
      intro: [
        "\u300C\u5B63\u7BC0\u304C\u79FB\u308D\u3048\u3070\u3001\u5225\u308C\u304C\u6765\u308B\u300D",
        "\u300C\u6B62\u3081\u3066\u304A\u3051\u3070\u3001\u8AB0\u3082\u5931\u308F\u305A\u306B\u6E08\u3080\u3002\u79C1\u306F\u305D\u3046\u6C7A\u3081\u305F\u300D",
        "\u7389\u5EA7\u306E\u56DB\u65B9\u3067\u3001\u56DB\u3064\u306E\u5B63\u7BC0\u304C\u51CD\u308A\u3064\u3044\u305F\u307E\u307E\u9707\u3048\u3066\u3044\u308B\u3002"
      ],
      clear: [
        "\u5F71\u304C\u8584\u308C\u3001\u9589\u3058\u8FBC\u3081\u3089\u308C\u3066\u3044\u305F\u5B63\u7BC0\u304C\u9806\u306B\u6D41\u308C\u51FA\u3057\u305F\u3002",
        "\u6625\u304C\u6765\u3066\u3001\u96E8\u304C\u964D\u308A\u3001\u590F\u304C\u707C\u3051\u3001\u7D05\u8449\u304C\u6563\u308A\u3001\u96EA\u304C\u7A4D\u3082\u308A\u3001\u307E\u305F\u6625\u304C\u6765\u308B\u3002",
        "\u2500\u2500 \u6681\u306E\u7881\u5370\u304C\u706F\u3063\u305F\u3002\u56DB\u5B63\u304C\u3001\u3075\u305F\u305F\u3073\u5DE1\u308A\u306F\u3058\u3081\u308B\u3002",
        "",
        "\u5BFA\u3078\u623B\u308B\u3068\u3001\u4E09\u5409\u3068\u516D\u52A9\u304C\u76E4\u3092\u51FA\u3057\u3066\u5F85\u3063\u3066\u3044\u305F\u3002",
        "\u300C\u4E09\u4EBA\u3067\u4E00\u5C40\u3001\u3069\u3046\u3060\u300D"
      ],
      next: "",
      reward: boss(30),
      drops: ["outfit-shiki", "acc-akatsuki", "board-meguru"]
    }
  ].map((s) => Object.freeze({ ...s, telegraphs: Object.freeze(s.telegraphs || []) })));
  const STAGE_BY_ID = Object.freeze(
    Object.fromEntries(STAGES.map((s) => [s.id, s]))
  );
  const STORY_STAGE_COUNT = STAGES.length;
  const BOSS_STAGES = Object.freeze(STAGES.filter((s) => s.boss).map((s) => s.id));
  const STORY_TOTAL_PERICA = STAGES.reduce((n, s) => n + s.reward.first, 0);
  const STORY_DROP_IDS = Object.freeze(STAGES.flatMap((s) => s.drops));
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
__def("../../shared/rng.js", function(__req2) {
  class InsecureRandomError extends Error {
    constructor() {
      super("\u5B89\u5168\u306A\u4E71\u6570\u304C\u5229\u7528\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u62BD\u9078\u3092\u5B9F\u884C\u3067\u304D\u307E\u305B\u3093\u3002");
      this.code = "insecure_random";
    }
  }
  function getCryptoObj() {
    const c = globalThis.crypto;
    if (c && typeof c.getRandomValues === "function") return c;
    return null;
  }
  function hasSecureRandom() {
    return getCryptoObj() !== null;
  }
  function secureRandomInt(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError("maxExclusive \u306F 1 \u4EE5\u4E0A\u306E\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    }
    const c = getCryptoObj();
    if (!c) throw new InsecureRandomError();
    if (maxExclusive === 1) return 0;
    const limit = Math.floor(4294967296 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    for (let attempt = 0; attempt < 1e3; attempt += 1) {
      c.getRandomValues(buf);
      if (buf[0] < limit) return buf[0] % maxExclusive;
    }
    throw new InsecureRandomError();
  }
  function secureHexUpper(length) {
    const c = getCryptoObj();
    if (!c) throw new InsecureRandomError();
    const bytes = new Uint8Array(Math.ceil(length / 2));
    c.getRandomValues(bytes);
    let s = "";
    for (const b of bytes) s += b.toString(16).padStart(2, "0");
    return s.slice(0, length).toUpperCase();
  }
  function secureToken(bytes = 32) {
    const c = getCryptoObj();
    if (!c) throw new InsecureRandomError();
    const arr = new Uint8Array(bytes);
    c.getRandomValues(arr);
    let s = "";
    for (const b of arr) s += b.toString(16).padStart(2, "0");
    return s;
  }
  return { InsecureRandomError, hasSecureRandom, secureRandomInt, secureHexUpper, secureToken };
});
__def("../../shared/rulesets.js", function(__req2) {
  const RULESET = Object.freeze({
    PVP_CURRENT: "pvp_current",
    PVP_MIN_STONES: "pvp_min_stones",
    PVP_V99: "pvp_v99",
    STORY: "story_seasons",
    PVP_BALANCE_V2: "pvp_balance_v2"
  });
  const V99 = Object.freeze({
    /** 0＝全員が試合開始時から解放済み。 */
    unlockTurn: 0,
    /** 解放時期に行動順差を設けない。 */
    unlockOffsetByOrder: Object.freeze([0, 0, 0]),
    /** 長期戦の回復が入る「自分の手番回数」 */
    longTurn: 44,
    /** 長期戦で回数が回復するキャラ */
    longRecover: Object.freeze(["hayate", "kuon", "akari"]),
    /** 全スキルを最初から利用可能にする。 */
    lockedSkills: Object.freeze([]),
    /** 初期状態の消費・回数の下限・追加配置の数（キャラ別） */
    enhance: Object.freeze({
      hibana: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
      mamori: Object.freeze({ cost: 1, usesFloor: 12, extra: 3 }),
      hayate: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
      yukine: Object.freeze({ cost: 1, usesFloor: 12, extra: 3 }),
      kuon: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 }),
      akari: Object.freeze({ cost: 1, usesFloor: 12, extra: 2 })
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
    wardBreakEnergy: 2
  });
  const DEFAULT_PVP_RULESET = RULESET.PVP_V99;
  const RULESETS = Object.freeze({
    [RULESET.PVP_CURRENT]: Object.freeze({
      id: RULESET.PVP_CURRENT,
      label: "3\u4EBA\u5BFE\u6226\uFF08\u73FE\u884C\uFF09",
      seats: 3,
      iceOffset: 3,
      skillPlusPlace: false,
      telegraph: false,
      minStoneJudgement: false,
      rewards: "pvp",
      stats: "pvp"
    }),
    [RULESET.PVP_MIN_STONES]: Object.freeze({
      id: RULESET.PVP_MIN_STONES,
      label: "3\u4EBA\u5BFE\u6226",
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
        uses: Object.freeze({ spark: 3, pull: 3 })
      }),
      rewards: "pvp",
      stats: "pvp"
    }),
    [RULESET.PVP_V99]: Object.freeze({
      id: RULESET.PVP_V99,
      label: "3\u4EBA\u5BFE\u6226",
      seats: 3,
      iceOffset: 3,
      skillPlusPlace: false,
      telegraph: false,
      minStoneJudgement: true,
      /** 毎試合、開始プレイヤーをランダムに選ぶ（P1/P2/P3 の識別は変えない） */
      randomStartSeat: true,
      /** 全スキル初期解放・強化。詳細は上の V99 定数。 */
      v99: V99,
      rewards: "pvp",
      stats: "pvp"
    }),
    [RULESET.STORY]: Object.freeze({
      id: RULESET.STORY,
      label: "\u30B9\u30C8\u30FC\u30EA\u30FC\uFF081\u5BFE1\uFF09",
      seats: 2,
      iceOffset: 2,
      skillPlusPlace: false,
      telegraph: true,
      minStoneJudgement: false,
      rewards: "story",
      stats: "story"
    }),
    [RULESET.PVP_BALANCE_V2]: Object.freeze({
      id: RULESET.PVP_BALANCE_V2,
      label: "3\u4EBA\u5BFE\u6226\uFF08\u8ABF\u6574\u691C\u8A3C v2.0\uFF09",
      seats: 3,
      iceOffset: 3,
      // 候補として「配置＋効果」を持つが、有効化は検証コピー側の調整案が決める
      skillPlusPlace: true,
      telegraph: false,
      minStoneJudgement: true,
      rewards: "none",
      // 検証版は本番の通貨・戦績へ一切書き込まない
      stats: "verify"
    })
  });
  function rulesetOf(id) {
    return RULESETS[id] || RULESETS[RULESET.PVP_CURRENT];
  }
  function rulesetOfState(state) {
    return rulesetOf(state == null ? void 0 : state.ruleset);
  }
  return { RULESET, V99, DEFAULT_PVP_RULESET, RULESETS, rulesetOf, rulesetOfState };
});
var constants = __req("../../shared/constants.js");
var profile = __req("../../shared/profile.js");
var rules = __req("../../shared/rules.js");
var storyEngine = __req("../../shared/story/engine.js");
var stages = __req("../../shared/story/stages.js");

// supabase/functions/api/identity.js
var NAME_MAX = 16;
var NAME_FALLBACK = "\u65C5\u4EBA";
function invisible(cp) {
  return cp <= 31 || cp === 127 || cp >= 8203 && cp <= 8207 || cp === 8232 || cp === 8233 || cp >= 8234 && cp <= 8238 || cp === 8288 || cp === 65279;
}
function sanitizeName(value) {
  const raw = String(value ?? "").replace(/[<>&"'`\\]/g, "");
  let out = "";
  for (const ch of raw) {
    if (!invisible(ch.codePointAt(0))) out += ch;
  }
  return out.trim().slice(0, NAME_MAX);
}
function displayNameOf(value) {
  return sanitizeName(value) || NAME_FALLBACK;
}
function needsNameSync(current, wanted) {
  return displayNameOf(wanted) !== String(current ?? "");
}

// supabase/functions/api/room-view.js
var { ROOM_CAPACITY, DISCONNECT_GRACE_MS } = constants;
function isConnected(member, room, userId, now = Date.now()) {
  if (member.playerId === userId) return true;
  const seen = Number(member.lastSeenAt ?? (room == null ? void 0 : room.updatedAt) ?? 0);
  if (!seen) return true;
  return now - seen < DISCONNECT_GRACE_MS;
}
function presenceStale(member, now = Date.now()) {
  return now - Number((member == null ? void 0 : member.lastSeenAt) ?? 0) >= DISCONNECT_GRACE_MS / 3;
}
function roomView(room, userId, now = Date.now()) {
  if (!room) return null;
  return {
    code: room.code,
    hostId: room.hostId,
    visibility: room.visibility,
    status: room.status,
    matchId: room.matchId || null,
    createdAt: room.createdAt,
    capacity: ROOM_CAPACITY,
    youAreHost: room.hostId === userId,
    members: (room.members || []).map((m) => ({
      userId: m.playerId,
      name: m.name,
      charId: m.charId,
      ready: !!m.ready,
      isYou: m.playerId === userId,
      connected: isConnected(m, room, userId, now),
      joinedAt: m.joinedAt ?? room.createdAt ?? null
    }))
  };
}
function shouldAutoStart(room) {
  return !!room && room.visibility === "public" && room.status === "lobby" && !room.matchId && (room.members || []).length === ROOM_CAPACITY && room.members.every((m) => m.ready);
}
function startBlockedReason(room, userId, now = Date.now()) {
  if (!room) return { code: "no_room", message: "\u30EB\u30FC\u30E0\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u305B\u3093\u3002" };
  if (room.hostId !== userId) return { code: "not_host", message: "\u958B\u59CB\u3067\u304D\u308B\u306E\u306F\u30DB\u30B9\u30C8\u3060\u3051\u3067\u3059\u3002" };
  if (room.status !== "lobby") return { code: "in_progress", message: "\u3059\u3067\u306B\u5BFE\u6226\u4E2D\u3067\u3059\u3002" };
  if ((room.members || []).length !== ROOM_CAPACITY) return { code: "not_full", message: "3\u4EBA\u305D\u308D\u3063\u3066\u3044\u307E\u305B\u3093\u3002" };
  if (!room.members.every((m) => m.ready)) return { code: "not_ready", message: "\u5168\u54E1\u306E\u6E96\u5099\u304C\u5B8C\u4E86\u3057\u3066\u3044\u307E\u305B\u3093\u3002" };
  const offline = room.members.filter((m) => !isConnected(m, room, userId, now));
  if (offline.length) return { code: "not_connected", message: "\u63A5\u7D9A\u304C\u5207\u308C\u3066\u3044\u308B\u30D7\u30EC\u30A4\u30E4\u30FC\u304C\u3044\u307E\u3059\u3002" };
  return null;
}

// supabase/functions/api/rewards.ts
function isSettled(match) {
  return (match == null ? void 0 : match.status) === "finished" || (match == null ? void 0 : match.status) === "aborted";
}
function rewardsForMatch(match) {
  const aborted = (match == null ? void 0 : match.status) === "aborted";
  return ((match == null ? void 0 : match.seatSnapshot) || []).map((s) => {
    const outcome = aborted ? "aborted" : rules.outcomeForSeat(match.state.result, s.seat);
    return {
      userId: s.userId,
      seat: s.seat,
      charId: s.charId,
      outcome,
      perica: constants.REWARD_PERICA[outcome] ?? 0,
      playerXp: constants.REWARD_PLAYER_XP[outcome] ?? 0,
      charXp: constants.REWARD_CHAR_XP[outcome] ?? 0
    };
  });
}

// supabase/functions/api/social.ts
var ONLINE_WINDOW_MS = 6e4;
var SEARCH_LIMIT = 20;
var NOTIFICATION_LIMIT = 50;
function statusOf(row, now = Date.now()) {
  if (row.activeMatchId) return "IN_MATCH";
  if (row.lastSeenAt && now - row.lastSeenAt < ONLINE_WINDOW_MS) return "ONLINE";
  return "OFFLINE";
}
function relationOf(viewerId, targetId, friendIds, pending) {
  if (viewerId === targetId) return "SELF";
  if (friendIds.has(targetId)) return "FRIEND";
  if (pending.some((r) => r.senderId === viewerId && r.receiverId === targetId)) return "REQUEST_SENT";
  if (pending.some((r) => r.senderId === targetId && r.receiverId === viewerId)) return "REQUEST_RECEIVED";
  return "NONE";
}
function playerCard(row, opts = {}) {
  var _a;
  const game = row.game || null;
  const charId = (game == null ? void 0 : game.lastCharId) || null;
  return {
    playerCode: row.playerCode,
    name: row.name || "\u65C5\u4EBA",
    charId,
    charName: charId ? ((_a = constants.CHARACTER_BY_ID[charId]) == null ? void 0 : _a.name) ?? null : null,
    status: statusOf(row, opts.now),
    lastSeenAt: row.lastSeenAt,
    // playerLevel は経験値を受け取る（プロフィールではない）。
    level: profile.playerLevel(Number(game == null ? void 0 : game.playerXp) || 0),
    self: opts.relation === "SELF",
    relation: opts.relation ?? "NONE"
  };
}
function fail(code, message) {
  return { fail: { code, message } };
}
async function friendsList(store, userId) {
  const ids = await store.friendIdsOf(userId);
  const rows = (await Promise.all(ids.map((id) => store.findById(id)))).filter(Boolean);
  const pending = await store.pendingRequests(userId);
  const friends = rows.map((r) => playerCard(r, { relation: "FRIEND" })).sort((a, b) => {
    const rank = (s) => s === "IN_MATCH" ? 0 : s === "ONLINE" ? 1 : 2;
    const d = rank(a.status) - rank(b.status);
    return d !== 0 ? d : (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
  });
  return { view: { friends: { friends, pendingIn: pending.filter((r) => r.receiverId === userId).length } } };
}
async function friendRequests(store, userId) {
  const pending = await store.pendingRequests(userId);
  const incoming = [];
  const outgoing = [];
  for (const r of pending) {
    const otherId = r.receiverId === userId ? r.senderId : r.receiverId;
    const row = await store.findById(otherId);
    if (!row) continue;
    const entry = {
      requestId: r.requestId,
      player: playerCard(row, { relation: r.receiverId === userId ? "REQUEST_RECEIVED" : "REQUEST_SENT" })
    };
    if (r.receiverId === userId) incoming.push(entry);
    else outgoing.push(entry);
  }
  return { view: { friendRequests: { incoming, outgoing } } };
}
async function friendRequest(store, userId, body) {
  const code = String((body == null ? void 0 : body.playerCode) || "").trim().toUpperCase();
  if (!code) return fail("bad_code", "\u30D7\u30EC\u30A4\u30E4\u30FC\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const target = await store.findByCode(code);
  if (!target) return fail("no_player", "\u305D\u306E\u30D7\u30EC\u30A4\u30E4\u30FC\u30B3\u30FC\u30C9\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (target.id === userId) return fail("self", "\u81EA\u5206\u306B\u306F\u7533\u8ACB\u3067\u304D\u307E\u305B\u3093\u3002");
  const friendIds = new Set(await store.friendIdsOf(userId));
  if (friendIds.has(target.id)) return fail("already_friend", "\u3059\u3067\u306B\u30D5\u30EC\u30F3\u30C9\u3067\u3059\u3002");
  const pending = await store.pendingRequests(userId);
  const relation = relationOf(userId, target.id, friendIds, pending);
  if (relation === "REQUEST_SENT") return fail("already_sent", "\u3059\u3067\u306B\u7533\u8ACB\u3092\u9001\u3063\u3066\u3044\u307E\u3059\u3002");
  if (relation === "REQUEST_RECEIVED") return fail("already_received", "\u76F8\u624B\u304B\u3089\u7533\u8ACB\u304C\u5C4A\u3044\u3066\u3044\u307E\u3059\u3002\u7533\u8ACB\u4E00\u89A7\u304B\u3089\u627F\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const me = await store.findById(userId);
  const requestId = await store.createRequest(userId, target.id);
  await store.notify({
    userId: target.id,
    type: "FRIEND_REQUEST",
    senderId: userId,
    requestId,
    payload: { name: (me == null ? void 0 : me.name) || "\u65C5\u4EBA", playerCode: (me == null ? void 0 : me.playerCode) || "" }
  });
  return { result: { requestId } };
}
async function friendRespond(store, userId, body) {
  const requestId = String((body == null ? void 0 : body.requestId) || "");
  if (!requestId) return fail("bad_request", "\u7533\u8ACB\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  const req = await store.findRequest(requestId);
  if (!req) return fail("no_request", "\u305D\u306E\u7533\u8ACB\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (req.receiverId !== userId) return fail("not_yours", "\u305D\u306E\u7533\u8ACB\u306B\u306F\u5FDC\u7B54\u3067\u304D\u307E\u305B\u3093\u3002");
  if (req.status !== "PENDING") return fail("already_settled", "\u305D\u306E\u7533\u8ACB\u306F\u3059\u3067\u306B\u51E6\u7406\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
  const accept = (body == null ? void 0 : body.accept) === true;
  await store.settleRequest(requestId, accept ? "ACCEPTED" : "REJECTED");
  if (!accept) return { result: { accepted: false } };
  await store.addFriendship(userId, req.senderId);
  const me = await store.findById(userId);
  await store.notify({
    userId: req.senderId,
    type: "FRIEND_ACCEPTED",
    senderId: userId,
    requestId,
    payload: { name: (me == null ? void 0 : me.name) || "\u65C5\u4EBA", playerCode: (me == null ? void 0 : me.playerCode) || "" }
  });
  return { result: { accepted: true } };
}
async function friendRemove(store, userId, body) {
  const code = String((body == null ? void 0 : body.playerCode) || "").trim().toUpperCase();
  const target = code ? await store.findByCode(code) : null;
  if (!target) return fail("no_player", "\u305D\u306E\u76F8\u624B\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  const friendIds = new Set(await store.friendIdsOf(userId));
  if (!friendIds.has(target.id)) return fail("not_friend", "\u30D5\u30EC\u30F3\u30C9\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
  await store.removeFriendship(userId, target.id);
  return { result: { removed: true } };
}
async function playerSearch(store, userId, body) {
  const q = String((body == null ? void 0 : body.q) || "").trim();
  if (q.length < 2) return fail("too_short", "2\u6587\u5B57\u4EE5\u4E0A\u3067\u691C\u7D22\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  const rows = await store.searchPlayers(q, SEARCH_LIMIT);
  const friendIds = new Set(await store.friendIdsOf(userId));
  const pending = await store.pendingRequests(userId);
  const players = rows.map((row) => playerCard(row, { relation: relationOf(userId, row.id, friendIds, pending) }));
  return { view: { search: { players } } };
}
async function notifications(store, userId) {
  const rows = await store.listNotifications(userId, NOTIFICATION_LIMIT);
  const senderIds = [...new Set(rows.map((n) => n.senderId).filter(Boolean))];
  const senders = /* @__PURE__ */ new Map();
  for (const id of senderIds) {
    const row = await store.findById(id);
    if (row) senders.set(id, row);
  }
  const list = rows.map((n) => {
    const from = n.senderId ? senders.get(n.senderId) : null;
    return {
      id: n.id,
      type: n.type,
      at: n.at,
      isRead: n.isRead,
      requestId: n.requestId,
      inviteId: n.inviteId,
      roomCode: n.roomCode,
      expiresAt: n.expiresAt,
      payload: n.payload || {},
      from: from ? { name: from.name || "\u65C5\u4EBA", playerCode: from.playerCode } : null
    };
  });
  return { view: { notifications: { notifications: list, unread: list.filter((n) => !n.isRead).length } } };
}
async function notificationsRead(store, userId, body) {
  const all = (body == null ? void 0 : body.all) === true;
  const ids = Array.isArray(body == null ? void 0 : body.ids) ? body.ids.map((x) => String(x)) : null;
  if (!all && (!ids || ids.length === 0)) return fail("bad_target", "\u65E2\u8AAD\u306B\u3059\u308B\u901A\u77E5\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  await store.markNotificationsRead(userId, all ? null : ids);
  return { result: { read: true } };
}
var HISTORY_LIMIT = 20;
var INVITE_TTL_MS = 5 * 6e4;
function skillUsageOf(state, seat, charId) {
  var _a, _b;
  const used = (_a = state == null ? void 0 : state.skillUses) == null ? void 0 : _a[seat];
  if (used && typeof used === "object") {
    return Object.entries(used).map(([skillId, count2]) => {
      var _a2;
      return { name: ((_a2 = constants.SKILL_BY_ID[skillId]) == null ? void 0 : _a2.name) || skillId, count: Number(count2) || 0 };
    }).filter((x) => x.count > 0);
  }
  const count = Number(used) || 0;
  if (count <= 0) return [];
  const skill = (_b = constants.SKILL_BY_CHARACTER) == null ? void 0 : _b[charId];
  return [{ name: (skill == null ? void 0 : skill.name) || "\u6280", count }];
}
function historyRowOf(match, userId) {
  var _a, _b;
  const seats = (match == null ? void 0 : match.seatSnapshot) || [];
  const mine = seats.find((s) => s.userId === userId);
  if (!mine) return null;
  const state = match.state || {};
  const outcome = match.status === "aborted" ? "aborted" : rules.outcomeForSeat(state.result, mine.seat);
  return {
    matchId: match.matchId,
    charName: ((_a = constants.CHARACTER_BY_ID[mine.charId]) == null ? void 0 : _a.name) || "\u2014",
    charId: mine.charId,
    finishedAt: state.finishedAt || match.finishedAt || null,
    outcome,
    reason: ((_b = state.result) == null ? void 0 : _b.reason) || match.abortReason || null,
    turns: Number(state.ply) || 0,
    skills: skillUsageOf(state, mine.seat, mine.charId),
    opponents: seats.filter((s) => s.userId !== userId).map((s) => {
      var _a2;
      return { name: s.name || "\u65C5\u4EBA", charName: ((_a2 = constants.CHARACTER_BY_ID[s.charId]) == null ? void 0 : _a2.name) || "\u2014" };
    })
  };
}
function summarizeHistory(rows) {
  const list = rows.filter(Boolean);
  const counted = list.filter((r) => r.outcome !== "aborted");
  const wins = counted.filter((r) => r.outcome === "win").length;
  const losses = counted.filter((r) => r.outcome === "lose").length;
  const total = counted.length;
  const byChar = /* @__PURE__ */ new Map();
  for (const r of list) byChar.set(r.charName, (byChar.get(r.charName) || 0) + 1);
  const usage = [...byChar.entries()].map(([charName, n]) => ({ charName, percent: list.length ? Math.round(n / list.length * 100) : 0 })).sort((a, b) => b.percent - a.percent);
  const avg = (pick) => total ? Math.round(counted.reduce((sum, r) => sum + pick(r), 0) / total * 10) / 10 : 0;
  return {
    total,
    wins,
    losses,
    aborted: list.length - counted.length,
    winRate: total ? Math.round(wins / total * 100) : 0,
    avgTurns: avg((r) => r.turns),
    avgSkills: avg((r) => r.skills.reduce((n, s) => n + s.count, 0)),
    usage,
    topChar: usage[0] || null
  };
}
async function friendProfile(store, userId, body) {
  const code = String((body == null ? void 0 : body.playerCode) || "").trim().toUpperCase();
  if (!code) return fail("bad_code", "\u30D7\u30EC\u30A4\u30E4\u30FC\u30B3\u30FC\u30C9\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  const target = await store.findByCode(code);
  if (!target) return fail("no_player", "\u305D\u306E\u30D7\u30EC\u30A4\u30E4\u30FC\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  const self = target.id === userId;
  const friendIds = new Set(await store.friendIdsOf(userId));
  if (!self && !friendIds.has(target.id)) return fail("not_friend", "\u30D5\u30EC\u30F3\u30C9\u306E\u6226\u7E3E\u3060\u3051\u3092\u898B\u3089\u308C\u307E\u3059\u3002");
  const rows = (await store.recentMatches(target.id, HISTORY_LIMIT)).map((m) => historyRowOf(m, target.id)).filter(Boolean);
  const live = await store.liveMatchOf(target.id);
  return {
    view: {
      friendProfile: {
        player: playerCard(target, { relation: self ? "SELF" : "FRIEND" }),
        spectatable: !self && !!live,
        stats: await store.statsOf(target.id) || {},
        summary: summarizeHistory(rows),
        recent: rows
      }
    }
  };
}
async function spectate(store, userId, body) {
  const friendIds = new Set(await store.friendIdsOf(userId));
  let match = null;
  if (body == null ? void 0 : body.matchId) {
    match = await store.findMatchById(String(body.matchId));
  } else if (body == null ? void 0 : body.playerCode) {
    const target = await store.findByCode(String(body.playerCode).trim().toUpperCase());
    if (!target) return fail("no_player", "\u305D\u306E\u30D7\u30EC\u30A4\u30E4\u30FC\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    if (!friendIds.has(target.id)) return fail("not_friend", "\u30D5\u30EC\u30F3\u30C9\u306E\u5BFE\u6226\u3060\u3051\u3092\u89B3\u6226\u3067\u304D\u307E\u3059\u3002");
    match = await store.liveMatchOf(target.id);
  }
  if (!match) return fail("no_match", "\u3044\u307E\u89B3\u6226\u3067\u304D\u308B\u5BFE\u6226\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
  const seats = match.seatSnapshot || [];
  const allowed = seats.some((s) => s.userId === userId || friendIds.has(s.userId));
  if (!allowed) return fail("not_friend", "\u30D5\u30EC\u30F3\u30C9\u306E\u5BFE\u6226\u3060\u3051\u3092\u89B3\u6226\u3067\u304D\u307E\u3059\u3002");
  return {
    view: {
      spectate: {
        matchId: match.matchId,
        status: match.status,
        state: rules.publicSnapshot(match.state),
        players: seats.map((s) => {
          var _a;
          return {
            seat: s.seat,
            name: s.name || "\u65C5\u4EBA",
            charId: s.charId,
            charName: ((_a = constants.CHARACTER_BY_ID[s.charId]) == null ? void 0 : _a.name) || "\u2014"
          };
        })
      }
    }
  };
}
async function inviteSend(store, userId, body) {
  const code = String((body == null ? void 0 : body.playerCode) || "").trim().toUpperCase();
  const target = code ? await store.findByCode(code) : null;
  if (!target) return fail("no_player", "\u305D\u306E\u76F8\u624B\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (target.id === userId) return fail("self", "\u81EA\u5206\u306F\u62DB\u5F85\u3067\u304D\u307E\u305B\u3093\u3002");
  const friendIds = new Set(await store.friendIdsOf(userId));
  if (!friendIds.has(target.id)) return fail("not_friend", "\u30D5\u30EC\u30F3\u30C9\u3060\u3051\u3092\u62DB\u5F85\u3067\u304D\u307E\u3059\u3002");
  const room = await store.roomOf(userId);
  if (!room) return fail("no_room", "\u5148\u306B\u90E8\u5C4B\u3092\u4F5C\u3063\u3066\u304F\u3060\u3055\u3044\u3002");
  if ((room.members || []).some((m) => m.playerId === target.id)) {
    return fail("already_in_room", "\u305D\u306E\u76F8\u624B\u306F\u3059\u3067\u306B\u90E8\u5C4B\u306B\u3044\u307E\u3059\u3002");
  }
  if ((room.members || []).length >= constants.ROOM_CAPACITY) return fail("room_full", "\u90E8\u5C4B\u306B\u7A7A\u304D\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  const me = await store.findById(userId);
  const expiresAt = Date.now() + INVITE_TTL_MS;
  const inviteId = await store.createInvite(userId, target.id, room.code, expiresAt);
  await store.notify({
    userId: target.id,
    type: "MATCH_INVITE",
    senderId: userId,
    inviteId,
    roomCode: room.code,
    expiresAt,
    payload: { name: (me == null ? void 0 : me.name) || "\u65C5\u4EBA", playerCode: (me == null ? void 0 : me.playerCode) || "", roomCode: room.code }
  });
  return { result: { inviteId } };
}
async function inviteRespond(store, userId, body) {
  const inviteId = String((body == null ? void 0 : body.inviteId) || "");
  if (!inviteId) return fail("bad_invite", "\u62DB\u5F85\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  const invite = await store.findInvite(inviteId);
  if (!invite) return fail("no_invite", "\u305D\u306E\u62DB\u5F85\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (invite.receiverId !== userId) return fail("not_yours", "\u305D\u306E\u62DB\u5F85\u306B\u306F\u5FDC\u7B54\u3067\u304D\u307E\u305B\u3093\u3002");
  if (invite.status !== "PENDING") return fail("already_settled", "\u305D\u306E\u62DB\u5F85\u306F\u3059\u3067\u306B\u51E6\u7406\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
  if (invite.expiresAt && invite.expiresAt < Date.now()) {
    await store.settleInvite(inviteId, "EXPIRED");
    return fail("expired", "\u3053\u306E\u62DB\u5F85\u306F\u671F\u9650\u5207\u308C\u3067\u3059\u3002");
  }
  if ((body == null ? void 0 : body.accept) !== true) {
    await store.settleInvite(inviteId, "DECLINED");
    return { result: { accepted: false } };
  }
  const charId = String((body == null ? void 0 : body.charId) || "");
  if (!constants.CHARACTER_BY_ID[charId]) return fail("bad_char", "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
  const room = await store.roomOf(invite.senderId);
  if (!room || room.code !== invite.roomCode) return fail("no_room", "\u62DB\u5F85\u3055\u308C\u305F\u90E8\u5C4B\u306F\u3082\u3046\u3042\u308A\u307E\u305B\u3093\u3002");
  if ((room.members || []).length >= constants.ROOM_CAPACITY) return fail("room_full", "\u90E8\u5C4B\u306B\u7A7A\u304D\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  await store.addRoomMember(room, userId, charId);
  await store.settleInvite(inviteId, "ACCEPTED");
  return { result: { accepted: true, roomCode: room.code } };
}
async function socialRoute(store, userId, path, body) {
  switch (path) {
    case "/friends/list":
      return friendsList(store, userId);
    case "/friends/requests":
      return friendRequests(store, userId);
    case "/friends/request":
      return friendRequest(store, userId, body);
    case "/friends/respond":
      return friendRespond(store, userId, body);
    case "/friends/remove":
      return friendRemove(store, userId, body);
    case "/player/search":
      return playerSearch(store, userId, body);
    case "/notifications":
      return notifications(store, userId);
    case "/notifications/read":
      return notificationsRead(store, userId, body);
    case "/friends/profile":
      return friendProfile(store, userId, body);
    case "/spectate":
      return spectate(store, userId, body);
    case "/invite/send":
      return inviteSend(store, userId, body);
    case "/invite/respond":
      return inviteRespond(store, userId, body);
    default:
      return null;
  }
}

// supabase/functions/api/story.ts
var { PLAYER_SEAT, createStoryMatch, applyPlayerAction, runEnemyTurn, storySnapshot, storyOutcome } = storyEngine;
var fail2 = (code, message) => ({ fail: { code, message } });
var clone = (value) => structuredClone(value);
function runView(row) {
  if (!row) return null;
  return {
    runId: row.runId,
    stageId: row.stageId,
    status: row.status,
    revision: row.revision,
    state: storySnapshot(row.state)
  };
}
async function storyView(store, userId) {
  const run = await store.latestRun(userId);
  return { story: runView(run) };
}
async function storyRoute(store, userId, path, body) {
  if (path === "/story/run") {
    return { view: await storyView(store, userId) };
  }
  if (path === "/story/begin") return begin(store, userId, body);
  if (path === "/story/action") return action(store, userId, body);
  if (path === "/story/abort") return abort(store, userId, body);
  return null;
}
async function begin(store, userId, body) {
  const stageId = Number(body == null ? void 0 : body.stageId);
  const requestId = String((body == null ? void 0 : body.requestId) || "");
  if (!requestId) return fail2("bad_request", "\u64CD\u4F5CID\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  if (!stages.STAGE_BY_ID[stageId]) return fail2("no_stage", "\u305D\u306E\u30B9\u30C6\u30FC\u30B8\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
  if (await store.hasLiveMatch(userId)) {
    return fail2("online_busy", "\u30AA\u30F3\u30E9\u30A4\u30F3\u5BFE\u6226\u306E\u9014\u4E2D\u306F\u3001\u7269\u8A9E\u3092\u59CB\u3081\u3089\u308C\u307E\u305B\u3093\u3002");
  }
  const existing = await store.activeRun(userId);
  if (existing) {
    return { view: { story: runView(existing) }, result: { resumed: true } };
  }
  const { profile: profile2, revision } = await store.loadProfile(userId);
  const gate = profile.canEnterStage(profile2, stageId);
  if (!gate.ok) return fail2(gate.code || "locked", gate.message);
  const runId = `story_${crypto.randomUUID()}`;
  const draft = clone(profile2);
  const begun = profile.beginStoryMatch(draft, { stageId, matchId: runId });
  if (!begun.ok) return fail2(begun.code || "story_rejected", begun.message);
  const state = createStoryMatch({
    stageId,
    matchId: runId,
    playerName: draft.name || "\u3042\u306A\u305F",
    charId: draft.lastCharId,
    cosmetics: profile.appearanceFor(draft, draft.lastCharId)
  });
  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: -1,
    stageId,
    status: "playing",
    state,
    profile: draft,
    profileRevision: revision,
    requestId,
    bodyHash: store.bodyHash("/story/begin", { stageId }),
    response: { runId, stageId }
  });
  if (committed.status === "busy") {
    const live = await store.activeRun(userId);
    return { view: { story: runView(live) }, result: { resumed: true } };
  }
  if (committed.status === "replay") {
    const live = await store.activeRun(userId);
    return { view: { story: runView(live) }, result: { ...committed.response, replay: true } };
  }
  if (committed.status !== "committed") return fail2("busy", "\u3044\u307E\u4FDD\u5B58\u304C\u6DF7\u307F\u5408\u3063\u3066\u3044\u307E\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
  return {
    view: { story: runView({ runId, stageId, status: "playing", state, revision: 1 }) },
    result: { runId, stageId }
  };
}
async function action(store, userId, body) {
  var _a, _b;
  const runId = String((body == null ? void 0 : body.runId) || "");
  const requestId = String((body == null ? void 0 : body.requestId) || "");
  const expected = Number(body == null ? void 0 : body.revision);
  if (!runId || !requestId) return fail2("bad_request", "\u64CD\u4F5CID\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  if (!Number.isInteger(expected)) return fail2("bad_request", "\u76E4\u9762\u306E\u7248\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  const run = await store.findRun(runId);
  if (!run || run.userId !== userId) return fail2("no_run", "\u305D\u306E\u7269\u8A9E\u306E\u76E4\u9762\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (run.status !== "playing") return fail2("finished", "\u305D\u306E\u6BB5\u306F\u3059\u3067\u306B\u7D42\u308F\u3063\u3066\u3044\u307E\u3059\u3002");
  if (run.revision !== expected) {
    return { view: { story: runView(run) }, fail: { code: "stale", message: "\u76E4\u9762\u304C\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u6700\u65B0\u306E\u76E4\u9762\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002" } };
  }
  const played = applyPlayerAction(clone(run.state), { ...body.action, seat: PLAYER_SEAT });
  if (!played.ok) return fail2(played.code || "illegal", played.message || "\u305D\u306E\u64CD\u4F5C\u306F\u884C\u3048\u307E\u305B\u3093\u3002");
  const events = [played.event].filter(Boolean);
  let state = played.state;
  if (state.status === "playing") {
    const enemy = runEnemyTurn(state, () => store.randomInt(1e6) / 1e6);
    state = enemy.state;
    events.push(...enemy.events);
  }
  const finished = state.status === "finished";
  const stage = stages.STAGE_BY_ID[run.stageId];
  let reward = null;
  let profileDraft = null;
  let profileRevision = 0;
  if (finished) {
    const outcome = ((_a = storyOutcome(state)) == null ? void 0 : _a.outcome) || "lose";
    const loaded = await store.loadProfile(userId);
    profileRevision = loaded.revision;
    profileDraft = clone(loaded.profile);
    const before = new Set(profileDraft.story.skills);
    const granted = profile.grantStoryClear(profileDraft, {
      stageId: stage.id,
      outcome,
      charId: ((_b = state.seats[PLAYER_SEAT - 1]) == null ? void 0 : _b.charId) || null,
      randomInt: (n) => store.randomInt(n)
    });
    if (!granted.ok) return fail2(granted.code || "story_rejected", granted.message);
    const learned = profileDraft.story.skills.find((id) => !before.has(id)) || null;
    profile.endStoryMatch(profileDraft, runId);
    reward = { ...granted.result, skill: learned, outcome };
  }
  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: run.revision,
    stageId: run.stageId,
    status: finished ? "finished" : "playing",
    state,
    profile: profileDraft,
    profileRevision,
    requestId,
    bodyHash: store.bodyHash("/story/action", { runId, revision: expected, action: body.action }),
    response: { reward, finished }
  });
  if (committed.status === "replay") {
    const live = await store.findRun(runId);
    return { view: { story: runView(live) }, result: { ...committed.response, replay: true } };
  }
  if (committed.status === "stale") {
    const live = await store.findRun(runId);
    return { view: { story: runView(live) }, fail: { code: "stale", message: "\u76E4\u9762\u304C\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u6700\u65B0\u306E\u76E4\u9762\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002" } };
  }
  if (committed.status !== "committed") return fail2("busy", "\u3044\u307E\u4FDD\u5B58\u304C\u6DF7\u307F\u5408\u3063\u3066\u3044\u307E\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
  return {
    view: { story: runView({ runId, stageId: run.stageId, status: finished ? "finished" : "playing", state, revision: run.revision + 1 }) },
    result: { events, reward, finished }
  };
}
async function abort(store, userId, body) {
  const runId = String((body == null ? void 0 : body.runId) || "");
  const requestId = String((body == null ? void 0 : body.requestId) || "");
  if (!runId || !requestId) return fail2("bad_request", "\u64CD\u4F5CID\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  const run = await store.findRun(runId);
  if (!run || run.userId !== userId) return fail2("no_run", "\u305D\u306E\u7269\u8A9E\u306E\u76E4\u9762\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
  if (run.status !== "playing") return { view: { story: null }, result: { aborted: true } };
  const loaded = await store.loadProfile(userId);
  const draft = clone(loaded.profile);
  const granted = profile.grantStoryClear(draft, { stageId: run.stageId, outcome: "aborted" });
  if (!granted.ok) return fail2(granted.code || "story_rejected", granted.message);
  profile.endStoryMatch(draft, runId);
  const committed = await store.commit({
    userId,
    runId,
    expectedRevision: run.revision,
    stageId: run.stageId,
    status: "aborted",
    state: run.state,
    profile: draft,
    profileRevision: loaded.revision,
    requestId,
    bodyHash: store.bodyHash("/story/abort", { runId }),
    response: { aborted: true }
  });
  if (committed.status === "replay") return { view: { story: null }, result: { aborted: true, replay: true } };
  if (committed.status !== "committed") return fail2("busy", "\u3044\u307E\u4FDD\u5B58\u304C\u6DF7\u307F\u5408\u3063\u3066\u3044\u307E\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
  return { view: { story: null }, result: { aborted: true } };
}

// supabase/functions/api/index.ts
var cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-allow-methods": "POST, OPTIONS"
};
var json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
var fail3 = (code, message, view, status = 400) => json({ ok: false, code, message, view }, status);
var success = (view, extra = {}) => json({ ok: true, view, ...extra });
var clone2 = (value) => structuredClone(value);
var cleanName = (value) => sanitizeName(value);
var requestHash = (path, body) => profile.bodyHash({ path, body });
var randomHex = (bytes) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
function env(name) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
async function context(req) {
  const url = env("SUPABASE_URL");
  const anon = env("SUPABASE_ANON_KEY");
  const service = env("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("authorization") || "";
  const authClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;
  return { user, db: createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }) };
}
async function loadProfile(db, userId) {
  var _a, _b;
  const { data, error } = await db.from("triad_profiles").select("data,revision").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const normalized = data ? profile.normalizeProfile(data.data) : profile.createProfile({ id: userId });
  if (!normalized) throw new Error("profile_corrupt");
  normalized.id = userId;
  for (const c of constants.CHARACTERS) {
    (_a = normalized.chars)[_b = c.id] || (_a[_b] = { owned: true, count: 1, xp: 0 });
    normalized.chars[c.id].owned = true;
    normalized.chars[c.id].count = Math.max(1, normalized.chars[c.id].count || 0);
  }
  return { profile: normalized, revision: Number((data == null ? void 0 : data.revision) || 0) };
}
async function findRoom(db, userId) {
  const { data, error } = await db.from("triad_rooms").select("data,revision").contains("data", { memberIds: [userId] }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? { ...data.data, _revision: Number(data.revision) } : null;
}
async function findMatch(db, room) {
  if (!(room == null ? void 0 : room.matchId)) return null;
  const { data, error } = await db.from("triad_matches").select("data,revision").eq("match_id", room.matchId).maybeSingle();
  if (error) throw error;
  return data ? { ...data.data, revision: Number(data.revision), state: { ...data.data.state, revision: Number(data.revision) } } : null;
}
async function viewOf(db, userId, knownProfile) {
  const loaded = knownProfile ? { profile: knownProfile } : await loadProfile(db, userId);
  const room = await findRoom(db, userId);
  const match = await findMatch(db, room);
  const story = await storyView(createStoryStore(db), userId);
  return {
    profile: loaded.profile,
    // 生のルームをそのまま返さない。画面は userId / isYou / connected /
    // youAreHost を見る（room-view.js の説明を読むこと）。
    room: roomView(room, userId),
    match: match ? matchView(match, userId) : null,
    queue: null,
    ...story,
    activeSession: activeSessionOf(match, story.story)
  };
}
function activeSessionOf(match, story) {
  var _a;
  if (match && ((_a = match.state) == null ? void 0 : _a.status) === "playing") return "ONLINE_MATCH";
  if (story && story.status === "playing") return "STORY";
  return "NONE";
}
function storyRowOf(row) {
  var _a;
  if (!row) return null;
  return {
    runId: row.run_id,
    userId: row.user_id,
    stageId: Number(row.stage_id),
    status: row.status,
    state: ((_a = row.data) == null ? void 0 : _a.state) ?? row.data,
    revision: Number(row.revision || 0)
  };
}
function createStoryStore(db) {
  return {
    loadProfile: (userId) => loadProfile(db, userId),
    async activeRun(userId) {
      const { data, error } = await db.from("triad_story_runs").select("run_id,user_id,stage_id,status,data,revision").eq("user_id", userId).eq("status", "playing").maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async latestRun(userId) {
      const { data, error } = await db.from("triad_story_runs").select("run_id,user_id,stage_id,status,data,revision").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async findRun(runId) {
      const { data, error } = await db.from("triad_story_runs").select("run_id,user_id,stage_id,status,data,revision").eq("run_id", runId).maybeSingle();
      if (error) throw error;
      return storyRowOf(data);
    },
    async commit(input) {
      const { data, error } = await db.rpc("triad_commit_story_run", {
        p_user_id: input.userId,
        p_run_id: input.runId,
        p_expected_revision: input.expectedRevision,
        p_stage_id: input.stageId,
        p_status: input.status,
        p_run_data: { state: input.state },
        p_profile_data: input.profile,
        p_profile_revision: input.profileRevision,
        p_request_id: input.requestId,
        p_body_hash: input.bodyHash,
        p_response: input.response
      });
      if (error) throw error;
      const row = data == null ? void 0 : data[0];
      return { status: (row == null ? void 0 : row.status) || "busy", response: (row == null ? void 0 : row.response) ?? null };
    },
    async hasLiveMatch(userId) {
      var _a;
      const match = await findMatch(db, await findRoom(db, userId));
      return !!match && ((_a = match.state) == null ? void 0 : _a.status) === "playing";
    },
    randomInt: (max) => crypto.getRandomValues(new Uint32Array(1))[0] % Math.max(1, Math.floor(max)),
    bodyHash: (path, body) => requestHash(path, body)
  };
}
function matchView(match, userId) {
  const seat = (match.seatSnapshot || []).find((s) => s.userId === userId);
  return {
    ...rules.publicSnapshot(match.state),
    yourSeat: seat ? seat.seat : 0,
    seatSnapshot: match.seatSnapshot || [],
    rewards: match.rewards || null,
    disconnect: match.disconnect || []
  };
}
function newMember(userId, name, charId, ready) {
  const now = Date.now();
  return { playerId: userId, name, charId, ready, joinedAt: now, lastSeenAt: now };
}
async function touchPresence(db, room, userId) {
  if (!room) return room;
  const me = (room.members || []).find((m) => m.playerId === userId);
  if (!me || !presenceStale(me)) return room;
  me.lastSeenAt = Date.now();
  try {
    await saveRoom(db, room);
  } catch {
  }
  return room;
}
async function startRoomMatch(db, room) {
  const matchId = `m_${randomHex(8).toLowerCase()}`;
  const seats = room.members.map((m, i) => ({
    seat: i + 1,
    name: m.name,
    charId: m.charId,
    kind: "human",
    userId: m.playerId
  }));
  const state = rules.createMatch({ matchId, mode: "online", seats, startSeat: rules.pickStartSeat() });
  const match = { matchId, roomCode: room.code, seatSnapshot: seats, state, status: "playing", rewards: null, createdAt: Date.now() };
  const { error } = await db.from("triad_matches").insert({ match_id: matchId, room_code: room.code, data: match, revision: 0 });
  if (error) throw error;
  room.matchId = matchId;
  room.status = "playing";
  await saveRoom(db, room);
  await setActiveMatch(db, seats.map((s) => s.userId), matchId);
  return matchId;
}
async function maybeAutoStart(db, room) {
  if (!shouldAutoStart(room)) return room;
  try {
    await startRoomMatch(db, room);
  } catch {
  }
  return room;
}
async function commitProfile(db, userId, revision, draft, requestId, hash, response) {
  const { data, error } = await db.rpc("triad_commit_profile", {
    p_user_id: userId,
    p_expected_revision: revision,
    p_data: draft,
    p_request_id: requestId,
    p_body_hash: hash,
    p_response: response
  });
  if (error) throw error;
  return data == null ? void 0 : data[0];
}
async function settleMatchRewards(db, match, onlyUserId) {
  var _a, _b, _c, _d, _e, _f, _g;
  if (!match || !Array.isArray(match.rewards)) return;
  const targets = onlyUserId ? match.rewards.filter((r) => r.userId === onlyUserId) : match.rewards;
  for (const reward of targets) {
    if (!(reward == null ? void 0 : reward.userId)) continue;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await loadProfile(db, reward.userId);
      if ((_a = current.profile.rewardedMatches) == null ? void 0 : _a[match.matchId]) break;
      const draft = clone2(current.profile);
      const granted = profile.grantMatchReward(draft, {
        matchId: match.matchId,
        outcome: reward.outcome,
        charId: reward.charId,
        stonesPlaced: ((_d = (_c = (_b = match.state) == null ? void 0 : _b.stats) == null ? void 0 : _c[reward.seat]) == null ? void 0 : _d.placed) || 0,
        skillsUsed: ((_g = (_f = (_e = match.state) == null ? void 0 : _e.stats) == null ? void 0 : _f[reward.seat]) == null ? void 0 : _g.skills) || 0
      });
      if (!(granted == null ? void 0 : granted.ok)) break;
      const committed = await commitProfile(
        db,
        reward.userId,
        current.revision,
        draft,
        `reward:${match.matchId}`,
        requestHash("/match/reward", { matchId: match.matchId }),
        { result: granted.result ?? null, replay: false, processed: false }
      );
      if ((committed == null ? void 0 : committed.status) === "stale") continue;
      break;
    }
  }
}
var CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function newPlayerCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `TRIAD-${Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")}`;
}
async function ensureIdentity(db, userId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data } = await db.from("profiles").select("player_code").eq("id", userId).maybeSingle();
  if (data == null ? void 0 : data.player_code) {
    await db.from("profiles").update({ last_online_at: now }).eq("id", userId);
    return;
  }
  const { profile: profile2 } = await loadProfile(db, userId);
  const display_name = displayNameOf(profile2 == null ? void 0 : profile2.name);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await db.from("profiles").upsert({ id: userId, display_name, player_code: newPlayerCode(), last_online_at: now });
    if (!error) return;
  }
}
async function syncDisplayName(db, userId, name) {
  const { data } = await db.from("profiles").select("display_name").eq("id", userId).maybeSingle();
  if (!data || !needsNameSync(data.display_name, name)) return;
  await db.from("profiles").update({ display_name: displayNameOf(name) }).eq("id", userId);
}
async function syncRoomMemberName(db, userId, name) {
  const room = await findRoom(db, userId);
  if (!room || room.status !== "lobby") return;
  const me = (room.members || []).find((m) => m.playerId === userId);
  if (!me || me.name === name) return;
  me.name = name;
  try {
    await saveRoom(db, room);
  } catch {
  }
}
var asMillis = (value) => value ? new Date(value).getTime() : null;
async function setActiveMatch(db, userIds, matchId) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return;
  try {
    await db.from("profiles").update({ active_match_id: matchId }).in("id", ids);
  } catch {
  }
}
function createSocialStore(db) {
  const rowsToPlayers = async (rows) => {
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const { data: games } = await db.from("triad_profiles").select("user_id,data").in("user_id", ids);
    const byId = new Map((games || []).map((g) => [g.user_id, g.data]));
    return rows.map((r) => ({
      id: r.id,
      name: r.display_name || "\u65C5\u4EBA",
      playerCode: r.player_code || "",
      lastSeenAt: asMillis(r.last_online_at),
      activeMatchId: r.active_match_id || null,
      game: byId.get(r.id) || null
    }));
  };
  const one = async (rows) => (await rowsToPlayers(rows))[0] || null;
  const PROFILE_COLS = "id,display_name,player_code,last_online_at,active_match_id";
  const matchesOf = async (userId, playing, limit) => {
    const { data } = await db.from("triad_matches").select("data").order("updated_at", { ascending: false }).limit(200);
    return (data || []).map((r) => r.data).filter((m) => playing ? (m == null ? void 0 : m.status) === "playing" : (m == null ? void 0 : m.status) !== "playing").filter((m) => ((m == null ? void 0 : m.seatSnapshot) || []).some((s) => s.userId === userId)).slice(0, limit);
  };
  return {
    async findById(id) {
      const { data } = await db.from("profiles").select(PROFILE_COLS).eq("id", id).maybeSingle();
      return data ? one([data]) : null;
    },
    async findByCode(code) {
      const { data } = await db.from("profiles").select(PROFILE_COLS).eq("player_code", code).maybeSingle();
      return data ? one([data]) : null;
    },
    async searchPlayers(q, limit) {
      const like = `%${q.replace(/[%_]/g, "")}%`;
      const { data } = await db.from("profiles").select(PROFILE_COLS).or(`player_code.ilike.${like},display_name.ilike.${like}`).limit(limit);
      return rowsToPlayers(data || []);
    },
    async friendIdsOf(userId) {
      const { data } = await db.from("friendships").select("user_a,user_b").or(`user_a.eq.${userId},user_b.eq.${userId}`);
      return (data || []).map((f) => f.user_a === userId ? f.user_b : f.user_a);
    },
    async pendingRequests(userId) {
      const { data } = await db.from("friend_requests").select("id,sender_id,receiver_id").eq("status", "PENDING").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      return (data || []).map((r) => ({ requestId: r.id, senderId: r.sender_id, receiverId: r.receiver_id }));
    },
    async createRequest(senderId, receiverId) {
      const { data, error } = await db.from("friend_requests").insert({ sender_id: senderId, receiver_id: receiverId, status: "PENDING" }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    async findRequest(requestId) {
      const { data } = await db.from("friend_requests").select("id,sender_id,receiver_id,status").eq("id", requestId).maybeSingle();
      return data ? { requestId: data.id, senderId: data.sender_id, receiverId: data.receiver_id, status: data.status } : null;
    },
    async settleRequest(requestId, status) {
      await db.from("friend_requests").update({ status, responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", requestId);
    },
    async addFriendship(a, b) {
      const [user_a, user_b] = [a, b].sort();
      await db.from("friendships").upsert({ user_a, user_b }, { onConflict: "user_a,user_b" });
    },
    async removeFriendship(a, b) {
      const [x, y] = [a, b].sort();
      await db.from("friendships").delete().eq("user_a", x).eq("user_b", y);
    },
    async notify(row) {
      await db.from("notifications").insert({
        user_id: row.userId,
        type: row.type,
        sender_id: row.senderId,
        request_id: row.requestId ?? null,
        invite_id: row.inviteId ?? null,
        room_code: row.roomCode ?? null,
        payload: row.payload || {},
        is_read: false,
        expires_at: row.expiresAt ? new Date(row.expiresAt).toISOString() : null
      });
    },
    async listNotifications(userId, limit) {
      const { data } = await db.from("notifications").select("id,type,sender_id,request_id,invite_id,room_code,payload,is_read,created_at,expires_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
      return (data || []).map((n) => ({
        id: n.id,
        type: n.type,
        senderId: n.sender_id,
        requestId: n.request_id,
        inviteId: n.invite_id,
        roomCode: n.room_code,
        payload: n.payload,
        isRead: !!n.is_read,
        at: asMillis(n.created_at) || 0,
        expiresAt: asMillis(n.expires_at)
      }));
    },
    async markNotificationsRead(userId, ids) {
      let q = db.from("notifications").update({ is_read: true }).eq("user_id", userId);
      if (ids) q = q.in("id", ids);
      await q;
    },
    async statsOf(userId) {
      const { data } = await db.from("player_stats").select("*").eq("player_id", userId).maybeSingle();
      return data || null;
    },
    async recentMatches(userId, limit) {
      return matchesOf(userId, false, limit);
    },
    async liveMatchOf(userId) {
      return (await matchesOf(userId, true, 1))[0] || null;
    },
    async findMatchById(matchId) {
      const { data } = await db.from("triad_matches").select("data").eq("match_id", matchId).maybeSingle();
      return (data == null ? void 0 : data.data) || null;
    },
    async roomOf(userId) {
      return findRoom(db, userId);
    },
    async addRoomMember(room, userId, charId) {
      const { data } = await db.from("profiles").select("display_name").eq("id", userId).maybeSingle();
      room.members.push(newMember(userId, (data == null ? void 0 : data.display_name) || "\u65C5\u4EBA", charId, false));
      await saveRoom(db, room);
    },
    async createInvite(senderId, receiverId, roomCode, expiresAt) {
      const { data, error } = await db.from("match_invites").insert({
        sender_id: senderId,
        receiver_id: receiverId,
        room_code: roomCode,
        status: "PENDING",
        expires_at: new Date(expiresAt).toISOString()
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    async findInvite(inviteId) {
      const { data } = await db.from("match_invites").select("id,sender_id,receiver_id,room_code,status,expires_at").eq("id", inviteId).maybeSingle();
      return data ? {
        inviteId: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        roomCode: data.room_code,
        status: data.status,
        expiresAt: asMillis(data.expires_at)
      } : null;
    },
    async settleInvite(inviteId, status) {
      await db.from("match_invites").update({ status }).eq("id", inviteId);
    }
  };
}
async function mutateProfile(ctx, path, body, mutator) {
  const requestId = String(body.requestId || "").slice(0, 128);
  if (!requestId) return { error: fail3("request_id_required", "\u64CD\u4F5CID\u304C\u3042\u308A\u307E\u305B\u3093\u3002") };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await loadProfile(ctx.db, ctx.user.id);
    const draft = clone2(current.profile);
    const result = mutator(draft);
    if (!(result == null ? void 0 : result.ok)) return { error: fail3((result == null ? void 0 : result.code) || "rejected", (result == null ? void 0 : result.message) || "\u64CD\u4F5C\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F.", await viewOf(ctx.db, ctx.user.id, current.profile)) };
    const response = { result: result.result ?? null, replay: false, processed: false };
    const committed = await commitProfile(ctx.db, ctx.user.id, current.revision, draft, requestId, requestHash(path, { ...body, requestId: void 0 }), response);
    if ((committed == null ? void 0 : committed.status) === "stale") continue;
    if ((committed == null ? void 0 : committed.status) === "conflict") return { error: fail3("request_conflict", "\u540C\u3058\u64CD\u4F5CID\u3067\u7570\u306A\u308B\u8981\u6C42\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002") };
    if ((committed == null ? void 0 : committed.status) === "replay") return { profile: current.profile, ...committed.response, replay: true };
    return { profile: draft, ...response };
  }
  return { error: fail3("busy", "\u540C\u6642\u66F4\u65B0\u3092\u51E6\u7406\u4E2D\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002") };
}
async function saveRoom(db, room) {
  room.memberIds = room.members.map((m) => m.playerId);
  room.updatedAt = Date.now();
  const row = { code: room.code, data: room, revision: Number(room._revision || 0) + 1, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
  delete row.data._revision;
  const { error } = await db.from("triad_rooms").upsert(row);
  if (error) throw error;
  room._revision = row.revision;
}
async function route(ctx, path, body) {
  const userId = ctx.user.id;
  await ensureIdentity(ctx.db, userId);
  const social = await socialRoute(createSocialStore(ctx.db), userId, path, body);
  if (social) {
    if ("fail" in social) return fail3(social.fail.code, social.fail.message, await viewOf(ctx.db, userId));
    const view = { ...await viewOf(ctx.db, userId), ...social.view || {} };
    return success(view, social.result === void 0 ? {} : { result: social.result });
  }
  const story = await storyRoute(createStoryStore(ctx.db), userId, path, body);
  if (story) {
    const view = { ...await viewOf(ctx.db, userId), ...story.view || {} };
    if ("fail" in story && story.fail) return fail3(story.fail.code, story.fail.message, view);
    return success(view, story.result === void 0 ? {} : { result: story.result });
  }
  if (path === "/me" || path === "/world/poll") {
    const loaded = await loadProfile(ctx.db, userId);
    await syncDisplayName(ctx.db, userId, loaded.profile.name);
    const mine = await findRoom(ctx.db, userId);
    await touchPresence(ctx.db, mine, userId);
    await maybeAutoStart(ctx.db, mine);
    const pending = await findMatch(ctx.db, mine);
    if (pending && Array.isArray(pending.rewards)) {
      await settleMatchRewards(ctx.db, pending, userId);
      return success(await viewOf(ctx.db, userId));
    }
    return success(await viewOf(ctx.db, userId, loaded.profile));
  }
  if (path === "/name") {
    const name = cleanName(body.name);
    if (!name) return fail3("bad_name", "\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    const out = await mutateProfile(ctx, path, body, (draft) => {
      draft.name = name;
      return { ok: true, result: { name } };
    });
    if (out.error) return out.error;
    await syncDisplayName(ctx.db, userId, name);
    await syncRoomMemberName(ctx.db, userId, name);
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }
  if (path === "/gacha") {
    const out = await mutateProfile(ctx, path, body, (draft) => profile.pullGacha(draft, {
      count: Number(body.count),
      requestId: String(body.requestId),
      randomInt: (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n
    }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { gacha: out.result, replay: out.replay, processed: out.processed });
  }
  if (path === "/train") {
    const out = await mutateProfile(ctx, path, body, (draft) => profile.trainCharacter(draft, { charId: String(body.charId), requestId: String(body.requestId) }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { train: out.result, replay: out.replay });
  }
  if (path === "/equip" || path === "/equip/reset") {
    const out = await mutateProfile(ctx, path, body, (draft) => path === "/equip" ? profile.equipCosmetic(draft, { slot: body.slot, id: body.id, charId: body.charId }) : profile.resetEquipToDefault(draft, { scope: body.scope, charId: body.charId }));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: { equipped: true }, replay: out.replay });
  }
  if (path === "/settings") {
    const out = await mutateProfile(ctx, path, body, (draft) => profile.applySettings(draft, body.settings));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }
  if (path === "/mission/claim") {
    const out = await mutateProfile(ctx, path, body, (draft) => profile.claimMission(draft, String(body.missionId)));
    if (out.error) return out.error;
    return success(await viewOf(ctx.db, userId, out.profile), { result: out.result, replay: out.replay });
  }
  if (path === "/room/create" || path === "/world/join") {
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail3("bad_char", "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
    if (await findRoom(ctx.db, userId)) return fail3("already_in_room", "\u3059\u3067\u306B\u30EB\u30FC\u30E0\u3078\u53C2\u52A0\u3057\u3066\u3044\u307E\u3059\u3002");
    const p = (await loadProfile(ctx.db, userId)).profile;
    if (path === "/world/join") {
      const { data: candidates } = await ctx.db.from("triad_rooms").select("data,revision").contains("data", { visibility: "public", status: "lobby" }).limit(20);
      const candidate = (candidates || []).map((x) => ({ ...x.data, _revision: Number(x.revision) })).find((x) => x.members.length < 3);
      if (candidate) {
        candidate.members.push(newMember(userId, p.name, body.charId, true));
        await saveRoom(ctx.db, candidate);
        await maybeAutoStart(ctx.db, candidate);
        return success(await viewOf(ctx.db, userId), { result: { code: candidate.code, queued: candidate.members.length < 3 } });
      }
    }
    for (let i = 0; i < 12; i += 1) {
      const code = randomHex(3);
      const isWorld = path === "/world/join";
      const room2 = {
        code,
        hostId: userId,
        visibility: isWorld ? "public" : body.visibility || "private",
        status: "lobby",
        matchId: null,
        createdAt: Date.now(),
        members: [newMember(userId, p.name, body.charId, isWorld)]
      };
      try {
        await saveRoom(ctx.db, room2);
        return success(await viewOf(ctx.db, userId), { result: { code } });
      } catch {
      }
    }
    return fail3("no_code", "\u30EB\u30FC\u30E0\u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
  }
  if (path === "/room/join") {
    const code = String(body.code || "").trim().toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(code)) return fail3("bad_code", "\u30EB\u30FC\u30E0\u30B3\u30FC\u30C9\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail3("bad_char", "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
    const { data } = await ctx.db.from("triad_rooms").select("data,revision").eq("code", code).maybeSingle();
    if (!data) return fail3("no_room", "\u305D\u306E\u30EB\u30FC\u30E0\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    const room2 = { ...data.data, _revision: Number(data.revision) };
    if (room2.status !== "lobby" || room2.members.length >= 3) return fail3("full", "\u305D\u306E\u30EB\u30FC\u30E0\u306B\u306F\u53C2\u52A0\u3067\u304D\u307E\u305B\u3093\u3002");
    const p = (await loadProfile(ctx.db, userId)).profile;
    if (!room2.members.some((m) => m.playerId === userId)) room2.members.push(newMember(userId, p.name, body.charId, false));
    await saveRoom(ctx.db, room2);
    return success(await viewOf(ctx.db, userId), { result: { code } });
  }
  const room = await findRoom(ctx.db, userId);
  if (path.startsWith("/room/") && !room) return fail3("no_room", "\u30EB\u30FC\u30E0\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u305B\u3093\u3002");
  if (path === "/room/char") {
    if (!constants.CHARACTER_BY_ID[body.charId]) return fail3("bad_char", "\u305D\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306F\u5B58\u5728\u3057\u307E\u305B\u3093\u3002");
    room.members = room.members.map((m) => m.playerId === userId ? { ...m, charId: body.charId, ready: false } : m);
    await saveRoom(ctx.db, room);
    return success(await viewOf(ctx.db, userId));
  }
  if (path === "/room/ready") {
    room.members = room.members.map((m) => m.playerId === userId ? { ...m, ready: !!body.ready } : m);
    await saveRoom(ctx.db, room);
    return success(await viewOf(ctx.db, userId));
  }
  if (path === "/room/leave" || path === "/world/leave") {
    const leftBehind = room.members.map((m) => m.playerId);
    room.members = room.members.filter((m) => m.playerId !== userId);
    if (!room.members.length) await ctx.db.from("triad_rooms").delete().eq("code", room.code);
    else {
      if (room.hostId === userId) room.hostId = room.members[0].playerId;
      room.status = "lobby";
      room.matchId = null;
      await saveRoom(ctx.db, room);
    }
    await setActiveMatch(ctx.db, room.members.length ? [userId] : leftBehind, null);
    return success(await viewOf(ctx.db, userId));
  }
  if (path === "/room/start") {
    const blocked = startBlockedReason(room, userId);
    if (blocked) return fail3(blocked.code, blocked.message);
    const matchId = await startRoomMatch(ctx.db, room);
    return success(await viewOf(ctx.db, userId), { result: { matchId } });
  }
  if (path === "/match/action") {
    const match = await findMatch(ctx.db, room);
    if (!match || match.matchId !== body.matchId) return fail3("no_match", "\u305D\u306E\u5BFE\u6226\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    const seat = match.seatSnapshot.find((s) => s.userId === userId);
    if (!seat || match.state.turn !== seat.seat) return fail3("not_your_turn", "\u3044\u307E\u306F\u3042\u306A\u305F\u306E\u624B\u756A\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
    if (Number(body.revision) !== match.revision) return fail3("stale_revision", "\u76E4\u9762\u304C\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
    const applied = rules.applyAction(match.state, { ...body.action, seat: seat.seat });
    if (!applied.ok) return fail3(applied.code, applied.message);
    const next = { ...match, state: applied.state, status: applied.state.status };
    const finished = isSettled(next);
    if (finished && !Array.isArray(next.rewards)) next.rewards = rewardsForMatch(next);
    const response = { result: { matchId: match.matchId, revision: match.revision + 1 } };
    const { data, error } = await ctx.db.rpc("triad_commit_match", {
      p_user_id: userId,
      p_match_id: match.matchId,
      p_expected_revision: match.revision,
      p_data: next,
      p_request_id: String(body.requestId),
      p_body_hash: requestHash(path, body.action),
      p_response: response
    });
    if (error) throw error;
    const committed = data == null ? void 0 : data[0];
    if ((committed == null ? void 0 : committed.status) === "stale") return fail3("stale_revision", "\u76E4\u9762\u304C\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
    if ((committed == null ? void 0 : committed.status) === "conflict") return fail3("request_conflict", "\u540C\u3058\u64CD\u4F5CID\u3067\u7570\u306A\u308B\u8981\u6C42\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002");
    if (finished) {
      await settleMatchRewards(ctx.db, next);
      await setActiveMatch(ctx.db, match.seatSnapshot.map((s) => s.userId), null);
    }
    return success(await viewOf(ctx.db, userId), { ...response, replay: (committed == null ? void 0 : committed.status) === "replay" });
  }
  if (path === "/ranking") return success(await viewOf(ctx.db, userId), { ranking: [] });
  return fail3("not_found", "\u305D\u306E\u64CD\u4F5C\u306F\u3042\u308A\u307E\u305B\u3093\u3002", await viewOf(ctx.db, userId), 404);
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return fail3("method_not_allowed", "POST\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002", void 0, 405);
  try {
    const ctx = await context(req);
    if (!ctx) return fail3("unauthorized", "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059\u3002", void 0, 401);
    const body = await req.json().catch(() => ({}));
    const path = new URL(req.url).pathname.replace(/^.*\/api(?=\/|$)/, "") || "/me";
    return await route(ctx, path, body);
  } catch (error) {
    console.error(error);
    return fail3("server_error", "\u30B5\u30FC\u30D0\u30FC\u51E6\u7406\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", void 0, 500);
  }
});
