import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const constants = requireModule('../../shared/constants.js');
const rules = requireModule('../../shared/rules.js');
const rulesets = requireModule('../../shared/rulesets.js');
const story = requireModule('../../shared/story/engine.js');
const storyData = requireModule('../../shared/story/stages.js');

let matchSeq = 0;

function makeMatch({
  first = 'hibana',
  second = 'mamori',
  third = 'hayate',
  ruleset = rulesets.RULESET.PVP_CURRENT,
} = {}) {
  matchSeq += 1;
  return rules.createMatch({
    matchId: `test-match-${matchSeq}`,
    ruleset,
    seats: [
      { seat: 1, name: 'P1', charId: first },
      { seat: 2, name: 'P2', charId: second },
      { seat: 3, name: 'P3', charId: third },
    ],
  });
}

function asPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function setLine(state, owner, startCol, startRow, dc, dr, length) {
  for (let i = 0; i < length; i += 1) {
    state.stones[(startRow + dr * i) * state.width + startCol + dc * i] = owner;
  }
}

function prepareTelegraphState({ stageId = 13, id = story.TELEGRAPH.SNIPE, targets = [0] } = {}) {
  const state = story.createStoryMatch({ stageId, matchId: `story-telegraph-${stageId}-${++matchSeq}` });
  state.story.allowedTelegraphs = [id];
  state.story.telegraph = { id, targets: [...targets], seat: story.ENEMY_SEAT, declaredAt: -1 };
  state.turn = story.ENEMY_SEAT;
  state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  return state;
}

function useEnemySpark(state, index) {
  state.turn = story.ENEMY_SEAT;
  state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  state.stones[index] = story.PLAYER_SEAT;
  const result = rules.applyAction(state, {
    type: 'skill',
    seat: story.ENEMY_SEAT,
    skillId: 'spark',
    index,
  });
  assert.equal(result.ok, true);
  return result.state;
}

test('3人戦の盤面は11×17・3席のまま', () => {
  const state = makeMatch();
  assert.equal(state.width, 11);
  assert.equal(state.height, 17);
  assert.equal(state.stones.length, 187);
  assert.equal(state.seats.length, 3);
});

test('通常3人戦：縦・横・両斜め・5個以上を五目と判定する', async (t) => {
  const cases = [
    { name: '横5', args: [1, 2, 4, 1, 0, 5], length: 5 },
    { name: '縦5', args: [2, 5, 2, 0, 1, 5], length: 5 },
    { name: '右下斜め5', args: [3, 1, 3, 1, 1, 5], length: 5 },
    { name: '左下斜め5', args: [1, 7, 3, -1, 1, 5], length: 5 },
    { name: '横6（5個以上）', args: [2, 2, 8, 1, 0, 6], length: 6 },
  ];

  for (const item of cases) {
    await t.test(item.name, () => {
      const state = makeMatch();
      setLine(state, ...item.args);
      const win = rules.findWinningLine(state);
      assert.equal(win?.owner, item.args[0]);
      assert.equal(win?.line.length, item.length);
    });
  }
});

test('通常3人戦：着手ごとに手番が進み、次席のエナジーだけが1増える', () => {
  let state = makeMatch();
  assert.deepEqual(asPlain(state.energy), { 1: 1, 2: 0, 3: 0 });

  for (const [seat, index] of [[1, 0], [2, 1], [3, 2]]) {
    const result = rules.applyAction(state, { type: 'place', seat, index });
    assert.equal(result.ok, true);
    state = result.state;
  }

  assert.equal(state.turn, 1);
  assert.equal(state.opCount, 3);
  assert.equal(state.ply, 3);
  assert.deepEqual(asPlain(state.energy), { 1: 2, 2: 1, 3: 1 });
});

test('通常3人戦：不正な着手と決着後の追加操作はstateを変更しない', () => {
  const state = makeMatch();
  const before = JSON.stringify(state);
  const bad = rules.applyAction(state, { type: 'place', seat: 1, index: -1 });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, rules.ERR.BAD_INDEX);
  assert.equal(JSON.stringify(state), before);

  setLine(state, 1, 0, 0, 1, 0, 4);
  const won = rules.applyAction(state, { type: 'place', seat: 1, index: 4 });
  assert.equal(won.ok, true);
  assert.equal(won.state.status, 'finished');
  const finishedBefore = JSON.stringify(won.state);
  const late = rules.applyAction(won.state, { type: 'place', seat: 1, index: 10 });
  assert.equal(late.ok, false);
  assert.equal(late.code, rules.ERR.NOT_PLAYING);
  assert.equal(JSON.stringify(won.state), finishedBefore);
});

test('CPU：V99の通常手番・スキル・追加配置を二重進行せず完遂できる', () => {
  let seed = 0x6d2b79f5;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  for (let game = 0; game < 12; game += 1) {
    const charIds = [0, 1, 2].map((offset) => (
      constants.CHARACTERS[(game + offset * 2) % constants.CHARACTERS.length].id
    ));
    let state = makeMatch({
      first: charIds[0],
      second: charIds[1],
      third: charIds[2],
      ruleset: rulesets.RULESET.PVP_V99,
    });

    for (let operation = 0; operation < 500 && state.status === 'playing'; operation += 1) {
      const beforeOp = state.opCount;
      const beforeRevision = state.revision;
      const action = rules.chooseCpuAction(state, state.turn, random);
      assert.ok(action, `game ${game}: CPU行動が必要`);
      const result = rules.applyAction(state, action);
      assert.equal(result.ok, true, `game ${game}: ${result.code || action.type}`);
      state = result.state;
      assert.equal(state.opCount, beforeOp + 1);
      assert.equal(state.revision, beforeRevision + 1);
      assert.equal(state.stones.length, constants.BOARD_SIZE);
    }

    assert.equal(state.status, 'finished', `game ${game}: 500操作以内に決着`);
  }
});

// Deterministic full boards without a five. Keeping them explicit makes the
// full-board result tests independent of random search and therefore repeatable.
const FULL_BOARD_UNIQUE =
  '1113132212113122331121131231133232131331123121232112213221313313221332113221311213131211113232111132211232311311213331331113232322123332232211122232323232213333212113133312331112112112111';

const FULL_BOARD_TIE =
  '1213112322212231213111223122221313231133321131333232313222313322233123131332112112323213113223121233213313332131121332221121233311333231132212312333221122231113223321112122211123321231313';

function finishFullBoard(pattern) {
  const values = [...pattern].map(Number);
  assert.equal(values.length, constants.BOARD_SIZE);
  const state = makeMatch({ ruleset: rulesets.RULESET.PVP_MIN_STONES });
  state.stones = values.slice();
  assert.equal(rules.findWinningLine(state), null);
  const index = values.length - 1;
  const actor = values[index];
  state.stones[index] = 0;
  state.turn = actor;
  const result = rules.applyAction(state, { type: 'place', seat: actor, index });
  assert.equal(result.ok, true);
  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.result.reason, 'min_stones');
  return result.state.result;
}

test('満盤：石数が最少の1席だけが勝つ', () => {
  const result = finishFullBoard(FULL_BOARD_UNIQUE);
  assert.equal(result.kind, 'win');
  assert.equal(result.winner, 2);
  assert.deepEqual(asPlain(result.winners), [2]);
  assert.deepEqual(asPlain(result.stoneCounts), { 1: 75, 2: 54, 3: 58 });
});

test('満盤：最少石数が同数なら共同勝利になる', () => {
  const result = finishFullBoard(FULL_BOARD_TIE);
  assert.equal(result.kind, 'co_win');
  assert.equal(result.winner, 0);
  assert.deepEqual(asPlain(result.winners), [1, 2]);
  assert.deepEqual(asPlain(result.stoneCounts), { 1: 62, 2: 62, 3: 63 });
});

test('火花：相手石を消し、消費・回数・不正対象拒否が正しい', () => {
  const state = makeMatch({ first: 'hibana' });
  state.energy[1] = 6;
  state.stones[20] = 2;
  const result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'spark', index: 20 });
  assert.equal(result.ok, true);
  assert.equal(result.state.stones[20], 0);
  assert.equal(result.state.energy[1], 2);
  assert.equal(rules.usesOf(result.state, 1, 'spark'), 1);
  assert.equal(result.state.stats[1].skills, 1);

  const guarded = makeMatch({ first: 'hibana' });
  guarded.energy[1] = 6;
  guarded.stones[20] = 2;
  guarded.guards[20] = 1;
  const before = JSON.stringify(guarded);
  const rejected = rules.applyAction(guarded, { type: 'skill', seat: 1, skillId: 'spark', index: 20 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.GUARDED);
  assert.equal(JSON.stringify(guarded), before);
});

test('結界：自石だけを守り、重ね掛けを拒否する', () => {
  const state = makeMatch({ first: 'mamori' });
  state.energy[1] = 6;
  state.stones[30] = 1;
  const result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'ward', index: 30 });
  assert.equal(result.ok, true);
  assert.equal(result.state.guards[30], 1);
  assert.equal(result.state.energy[1], 4);
  assert.equal(rules.usesOf(result.state, 1, 'ward'), 1);

  state.guards[30] = 1;
  const before = JSON.stringify(state);
  const rejected = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'ward', index: 30 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.BAD_TARGET);
  assert.equal(JSON.stringify(state), before);
});

test('風渡り：隣接空点へ守りごと移動し、範囲外の移動を拒否する', () => {
  const state = makeMatch({ first: 'hayate' });
  state.energy[1] = 6;
  state.stones[30] = 1;
  state.guards[30] = 1;
  const result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'windwalk', from: 30, to: 31 });
  assert.equal(result.ok, true);
  assert.equal(result.state.stones[30], 0);
  assert.equal(result.state.guards[30], 0);
  assert.equal(result.state.stones[31], 1);
  assert.equal(result.state.guards[31], 1);
  assert.equal(result.state.energy[1], 3);
  assert.equal(rules.usesOf(result.state, 1, 'windwalk'), 1);

  const invalid = makeMatch({ first: 'hayate' });
  invalid.energy[1] = 6;
  invalid.stones[0] = 1;
  const before = JSON.stringify(invalid);
  const rejected = rules.applyAction(invalid, { type: 'skill', seat: 1, skillId: 'windwalk', from: 0, to: 22 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.NOT_ADJACENT);
  assert.equal(JSON.stringify(invalid), before);
});

test('氷結：空点を封鎖し、3人戦では使用者の次手番開始で解除する', () => {
  let state = makeMatch({ first: 'yukine' });
  state.energy[1] = 6;
  const frozenAt = 10;
  let result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'freeze', index: frozenAt });
  assert.equal(result.ok, true);
  state = result.state;
  assert.equal(state.energy[1], 4);
  assert.equal(rules.usesOf(state, 1, 'freeze'), 1);
  assert.equal(rules.isFrozen(state, frozenAt), true);

  result = rules.applyAction(state, { type: 'place', seat: 2, index: 0 });
  assert.equal(result.ok, true);
  state = result.state;
  assert.equal(rules.isFrozen(state, frozenAt), true);
  result = rules.applyAction(state, { type: 'place', seat: 3, index: 1 });
  assert.equal(result.ok, true);
  state = result.state;
  assert.equal(state.turn, 1);
  assert.equal(rules.isFrozen(state, frozenAt), false);

  const occupied = makeMatch({ first: 'yukine' });
  occupied.energy[1] = 6;
  occupied.stones[10] = 2;
  const before = JSON.stringify(occupied);
  const rejected = rules.applyAction(occupied, { type: 'skill', seat: 1, skillId: 'freeze', index: 10 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.BAD_TARGET);
  assert.equal(JSON.stringify(occupied), before);
});

test('引力：所有者を保って動かし、移動先で相手が五目なら相手勝利になる', () => {
  const state = makeMatch({ first: 'kuon' });
  state.energy[1] = 6;
  setLine(state, 2, 0, 1, 1, 0, 4);
  state.stones[4] = 2;
  const result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'pull', from: 4, to: 15 });
  assert.equal(result.ok, true);
  assert.equal(result.state.stones[4], 0);
  assert.equal(result.state.stones[15], 2);
  assert.equal(result.state.energy[1], 2);
  assert.equal(rules.usesOf(result.state, 1, 'pull'), 1);
  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.result.winner, 2);

  const guarded = makeMatch({ first: 'kuon' });
  guarded.energy[1] = 6;
  guarded.stones[20] = 2;
  guarded.guards[20] = 1;
  const before = JSON.stringify(guarded);
  const rejected = rules.applyAction(guarded, { type: 'skill', seat: 1, skillId: 'pull', from: 20, to: 21 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.GUARDED);
  assert.equal(JSON.stringify(guarded), before);
});

test('転光：相手石を自石へ変え、その場で五目を確定する', () => {
  const state = makeMatch({ first: 'akari' });
  state.energy[1] = 6;
  for (const index of [0, 1, 3, 4]) state.stones[index] = 1;
  state.stones[2] = 2;
  const result = rules.applyAction(state, { type: 'skill', seat: 1, skillId: 'transmute', index: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.state.stones[2], 1);
  assert.equal(result.state.energy[1], 0);
  assert.equal(rules.usesOf(result.state, 1, 'transmute'), 1);
  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.result.winner, 1);

  const guarded = makeMatch({ first: 'akari' });
  guarded.energy[1] = 6;
  guarded.stones[2] = 2;
  guarded.guards[2] = 1;
  const before = JSON.stringify(guarded);
  const rejected = rules.applyAction(guarded, { type: 'skill', seat: 1, skillId: 'transmute', index: 2 });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, rules.ERR.GUARDED);
  assert.equal(JSON.stringify(guarded), before);
});

test('TEST-001 SNIPE 1回は共有使用回数1として数える', () => {
  const state = prepareTelegraphState();
  state.stones[0] = story.PLAYER_SEAT;
  const out = story.runEnemyTurn(state, () => 0);

  assert.equal(out.events.at(-1)?.outcome ?? out.events.at(-1)?.phase, 'hit');
  assert.equal(out.state.story.telegraphUses.snipe, 1);
  assert.equal(rules.usesOf(out.state, story.ENEMY_SEAT, 'spark'), 0);
  out.state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  assert.equal(story.canTelegraph(out.state, story.TELEGRAPH.SNIPE), true);
});

test('TEST-002 Spark1 + SNIPE1 は共有使用回数2として数える', () => {
  let state = story.createStoryMatch({ stageId: 13, matchId: `story-shared-${++matchSeq}` });
  state.story.allowedTelegraphs = [story.TELEGRAPH.SNIPE];
  state = useEnemySpark(state, 0);
  state.turn = story.ENEMY_SEAT;
  state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  state.stones[1] = story.PLAYER_SEAT;
  state.story.telegraph = {
    id: story.TELEGRAPH.SNIPE,
    targets: [1],
    seat: story.ENEMY_SEAT,
    declaredAt: -1,
  };

  const out = story.runEnemyTurn(state, () => 0);
  assert.equal(out.state.story.telegraphUses.snipe, 1);
  assert.equal(rules.usesOf(out.state, story.ENEMY_SEAT, 'spark'), 1);
  out.state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  assert.equal(story.canTelegraph(out.state, story.TELEGRAPH.SNIPE), false);
});

test('TEST-003 Spark2ならSNIPEを最初から拒否する', () => {
  let state = story.createStoryMatch({ stageId: 13, matchId: `story-spark-two-${++matchSeq}` });
  state.story.allowedTelegraphs = [story.TELEGRAPH.SNIPE];
  state = useEnemySpark(state, 0);
  state = useEnemySpark(state, 1);
  state.story.telegraph = null;
  state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;

  assert.equal(rules.usesOf(state, story.ENEMY_SEAT, 'spark'), 2);
  assert.equal(story.canTelegraph(state, story.TELEGRAPH.SNIPE), false);
});

test('TEST-004 SNIPEが結界で防がれても回数は1だけ消費する', () => {
  const state = prepareTelegraphState();
  state.stones[0] = story.PLAYER_SEAT;
  state.guards[0] = 1;
  const out = story.runEnemyTurn(state, () => 0);

  assert.equal(out.events.at(-1)?.phase, 'blocked');
  assert.equal(out.state.story.telegraphUses.snipe, 1);
  assert.equal(rules.usesOf(out.state, story.ENEMY_SEAT, 'spark'), 0);
  assert.equal(out.state.energy[story.ENEMY_SEAT], constants.MAX_ENERGY - story.TELEGRAPHS.snipe.cost);
  assert.equal(out.state.opCount, 1);
  assert.equal(out.state.turn, story.PLAYER_SEAT);
});

test('SNIPEの対象が消失しても、回数・エナジー・手番を1回だけ消費する', () => {
  const state = prepareTelegraphState();
  const out = story.runEnemyTurn(state, () => 0);

  assert.equal(out.events.at(-1)?.phase, 'missed');
  assert.equal(out.state.story.telegraphUses.snipe, 1);
  assert.equal(rules.usesOf(out.state, story.ENEMY_SEAT, 'spark'), 0);
  assert.equal(out.state.energy[story.ENEMY_SEAT], constants.MAX_ENERGY - story.TELEGRAPHS.snipe.cost);
  assert.equal(out.state.opCount, 1);
  assert.equal(out.state.turn, story.PLAYER_SEAT);
});

test('火花以外の敵スキル使用回数はSNIPE共有枠へ混入しない', () => {
  const state = story.createStoryMatch({ stageId: 6, matchId: `story-non-spark-${++matchSeq}` });
  state.story.telegraph = null;
  state.story.allowedTelegraphs = [story.TELEGRAPH.SNIPE];
  state.stones.fill(0);
  state.guards.fill(0);
  state.stones[0] = story.ENEMY_SEAT;
  state.stones[1] = story.ENEMY_SEAT;

  let current = state;
  for (const index of [0, 1]) {
    current.turn = story.ENEMY_SEAT;
    current.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
    const used = rules.applyAction(current, {
      type: 'skill', seat: story.ENEMY_SEAT, skillId: 'ward', index,
    });
    assert.equal(used.ok, true);
    current = used.state;
  }
  current.story.telegraph = null;
  current.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;

  assert.equal(rules.skillsOf(current, story.ENEMY_SEAT)[0].id, 'ward');
  assert.equal(rules.usesOf(current, story.ENEMY_SEAT, 'ward'), 2);
  assert.equal(story.canTelegraph(current, story.TELEGRAPH.SNIPE), true);
});

test('予告技：宣言→主人公1手→次の敵手番で解決し、追加行動しない', () => {
  let state = story.createStoryMatch({ stageId: 13, matchId: `story-declare-${++matchSeq}` });
  state.story.allowedTelegraphs = [story.TELEGRAPH.SNIPE];
  state.story.telegraph = null;
  state.turn = story.ENEMY_SEAT;
  state.energy[story.ENEMY_SEAT] = story.TELEGRAPHS.snipe.cost;
  for (const index of [0, 1, 2, 3]) state.stones[index] = story.PLAYER_SEAT;

  let enemy = story.runEnemyTurn(state, () => 0);
  state = enemy.state;
  assert.equal(enemy.events.at(-1)?.phase, 'declared');
  assert.equal(state.story.telegraph?.id, story.TELEGRAPH.SNIPE);
  assert.equal(state.story.telegraphUses.snipe, 0);
  assert.equal(state.energy[story.ENEMY_SEAT], story.TELEGRAPHS.snipe.cost);
  assert.equal(state.turn, story.PLAYER_SEAT);

  const player = story.applyPlayerAction(state, { type: 'place', index: 100 });
  assert.equal(player.ok, true);
  state = player.state;
  assert.equal(state.turn, story.ENEMY_SEAT);

  enemy = story.runEnemyTurn(state, () => 0);
  state = enemy.state;
  assert.equal(enemy.events.at(-1)?.phase, 'hit');
  assert.equal(state.story.telegraph, null);
  assert.equal(state.stones[0], 0);
  assert.equal(state.turn, story.PLAYER_SEAT);
  assert.equal(state.opCount, 3); // 宣言1 + 主人公1 + 解決1。通常着手の追加なし。
});

test('予告占領：氷結で防がれてもコスト・回数・手番を消費する', () => {
  let state = story.createStoryMatch({ stageId: 16, matchId: `story-seize-frozen-${++matchSeq}` });
  const target = state.story.telegraph.targets[0];
  const player = story.applyPlayerAction(state, { type: 'skill', skillId: 'freeze', index: target });
  assert.equal(player.ok, true);
  state = player.state;

  const enemy = story.runEnemyTurn(state, () => 0);
  state = enemy.state;
  assert.equal(enemy.events.at(-1)?.phase, 'frozen');
  assert.equal(state.story.telegraphUses.seize, 1);
  assert.equal(state.energy[story.ENEMY_SEAT], 0);
  assert.equal(state.stones[target], 0);
  assert.equal(state.turn, story.PLAYER_SEAT);
  assert.equal(rules.isFrozen(state, target), false);
});

test('予告占領：空点なら敵石を置き、五目なら即時決着する', () => {
  const state = prepareTelegraphState({ stageId: 16, id: story.TELEGRAPH.SEIZE, targets: [4] });
  state.stones.fill(0);
  setLine(state, story.ENEMY_SEAT, 0, 0, 1, 0, 4);
  const enemy = story.runEnemyTurn(state, () => 0);

  assert.equal(enemy.events.at(-1)?.phase, 'hit');
  assert.equal(enemy.state.stones[4], story.ENEMY_SEAT);
  assert.equal(enemy.state.stats[story.ENEMY_SEAT].placed, 1);
  assert.equal(enemy.state.status, 'finished');
  assert.equal(enemy.state.result.winner, story.ENEMY_SEAT);
});

test('重点ステージ1/2/3/6/11/16/21/26/30を正しい2席・習得術で生成できる', () => {
  const stageIds = [1, 2, 3, 6, 11, 16, 21, 26, 30];
  for (const stageId of stageIds) {
    const state = story.createStoryMatch({ stageId, matchId: `story-create-${stageId}` });
    assert.equal(state.story.stageId, stageId);
    assert.equal(state.seats.length, 2);
    assert.equal(state.status, 'playing');
    assert.deepEqual(asPlain(state.story.skills), asPlain(storyData.unlockedSkillsAt(stageId)));
    assert.equal(state.stones.length, constants.BOARD_SIZE);
  }
});

test('重点ステージは通常着手による五目を正しく決着できる', () => {
  for (const stageId of [1, 2, 3, 6, 11, 16, 21, 26, 30]) {
    const state = story.createStoryMatch({ stageId, matchId: `story-win-${stageId}` });
    state.stones.fill(0);
    state.guards.fill(0);
    state.ice.fill(0);
    state.iceOwner.fill(0);
    state.story.telegraph = null;
    state.status = 'playing';
    state.result = null;
    state.turn = story.PLAYER_SEAT;
    setLine(state, story.PLAYER_SEAT, 0, 0, 1, 0, 4);
    const result = story.applyPlayerAction(state, { type: 'place', index: 4 });
    assert.equal(result.ok, true, `Stage ${stageId}`);
    assert.equal(story.storyOutcome(result.state)?.outcome, 'win', `Stage ${stageId}`);
  }
});

test('全8修練盤の基準手順で勝利できる', async (t) => {
  for (const board of storyData.TRAINING_BOARDS) {
    await t.test(board.id, () => {
      let state = story.createStoryMatch({ stageId: board.stage, matchId: `training-${board.id}` });
      assert.deepEqual(asPlain(state.energy), asPlain(board.energy));

      for (const step of board.reference) {
        if (step.by === 'player') {
          const result = story.applyPlayerAction(state, step);
          assert.equal(result.ok, true, `${board.id}: ${step.note || step.type}`);
          state = result.state;
        } else {
          const result = story.runEnemyTurn(state, () => 0);
          assert.ok(result.events.length > 0, `${board.id}: 敵手番のイベントが必要`);
          state = result.state;
        }
      }

      assert.equal(story.storyOutcome(state)?.outcome, 'win');
    });
  }
});

test('修練盤を再挑戦すると初期配置・開始エナジー・予告状態が復元される', () => {
  for (const board of storyData.TRAINING_BOARDS) {
    const first = story.createStoryMatch({ stageId: board.stage, matchId: `retry-a-${board.id}`, startedAt: 1 });
    const second = story.createStoryMatch({ stageId: board.stage, matchId: `retry-b-${board.id}`, startedAt: 2 });
    assert.deepEqual(asPlain(first.stones), asPlain(second.stones), board.id);
    assert.deepEqual(asPlain(first.guards), asPlain(second.guards), board.id);
    assert.deepEqual(asPlain(first.energy), asPlain(second.energy), board.id);
    assert.deepEqual(asPlain(first.story.telegraph), asPlain(second.story.telegraph), board.id);
    assert.deepEqual(asPlain(first.story.skills), asPlain(second.story.skills), board.id);
  }
});

function makeCorruptTelegraphState(id, targets) {
  const state = story.createStoryMatch({ stageId: 16, matchId: `story-corrupt-${++matchSeq}` });
  state.stones.fill(0);
  state.guards.fill(0);
  state.ice.fill(0);
  state.iceOwner.fill(0);
  state.story.telegraph = {
    id,
    targets,
    seat: story.ENEMY_SEAT,
    declaredAt: -1,
  };
  state.turn = story.ENEMY_SEAT;
  state.energy[story.ENEMY_SEAT] = constants.MAX_ENERGY;
  return state;
}

function assertCorruptTelegraphIsContained(state) {
  const before = asPlain(state.stones);
  let output;
  assert.doesNotThrow(() => {
    output = story.runEnemyTurn(state, () => 0);
  });
  assert.ok(output?.state);
  assert.equal(output.state.stones.length, constants.BOARD_SIZE);
  assert.deepEqual(asPlain(output.state.stones), before);
}

test('破損予告状態：未知の予告IDでも例外や盤面変更を起こさない', () => {
  const state = makeCorruptTelegraphState('unknown-telegraph', [0]);
  assertCorruptTelegraphIsContained(state);
});

test('破損予告状態：盤外indexを盤上へ書き込まず配列長を維持する', () => {
  const state = makeCorruptTelegraphState(story.TELEGRAPH.SEIZE, [constants.BOARD_SIZE]);
  assertCorruptTelegraphIsContained(state);
});

test('破損予告状態：数値文字列の対象を有効indexとして扱わない', () => {
  const state = makeCorruptTelegraphState(story.TELEGRAPH.SEIZE, ['4']);
  assertCorruptTelegraphIsContained(state);
});
