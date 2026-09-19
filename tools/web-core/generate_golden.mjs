import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadTriadBundle } from '../../tests/helpers/load-bundle.mjs';

const WEB_SOURCE_COMMIT = '1bf36894967a13358a09eda1d5b518064db5e488';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const output = path.resolve(process.argv[2] || path.join(
  repo,
  'Assets/TRIAD/Core/Tests/Fixtures/web-golden-main-1bf3689.json',
));

const requireModule = await loadTriadBundle();
const constants = requireModule('../../shared/constants.js');
const rules = requireModule('../../shared/rules.js');
const rulesets = requireModule('../../shared/rulesets.js');
const story = requireModule('../../shared/story/stages.js');
const profileModule = requireModule('../../shared/profile.js');

const fixtures = [];

function exact(id, category, expected) {
  const fixture = { id, category, comparison: 'EXACT' };
  if (typeof expected === 'number') Object.assign(fixture, { kind: 'int', expectedInt: expected });
  else if (typeof expected === 'boolean') Object.assign(fixture, { kind: 'bool', expectedBool: expected });
  else if (typeof expected === 'string') Object.assign(fixture, { kind: 'string', expectedString: expected });
  else if (Array.isArray(expected) && expected.every(Number.isInteger)) {
    Object.assign(fixture, { kind: 'intArray', expectedIntArray: expected });
  } else if (Array.isArray(expected) && expected.every((value) => typeof value === 'string')) {
    Object.assign(fixture, { kind: 'stringArray', expectedStringArray: expected });
  } else {
    throw new TypeError(`Unsupported fixture value for ${id}`);
  }
  fixtures.push(fixture);
}

function notRun(id, category, reason, webObserved = null) {
  fixtures.push({ id, category, comparison: 'NOT_RUN', kind: 'none', reason, webObserved });
}

function makeMatch(ruleset = rulesets.RULESET.PVP_BALANCE_V2, first = 'hibana') {
  return rules.createMatch({
    matchId: `golden-${ruleset}-${first}`,
    ruleset,
    startSeat: 1,
    startedAt: 1,
    seats: [
      { seat: 1, name: 'P1', charId: first },
      { seat: 2, name: 'P2', charId: 'mamori' },
      { seat: 3, name: 'P3', charId: 'hayate' },
    ],
  });
}

function setLine(state, owner, startCol, startRow, dc, dr, length) {
  for (let i = 0; i < length; i += 1) {
    state.stones[(startRow + dr * i) * state.width + startCol + dc * i] = owner;
  }
}

exact('board.width', 'Board Constants', constants.BOARD_W);
exact('board.height', 'Board Constants', constants.BOARD_H);
exact('board.size', 'Board Constants', constants.BOARD_SIZE);
exact('board.centerIndex', 'Board Constants', constants.CENTER_INDEX);
exact('board.winLength', 'Board Constants', constants.WIN_LENGTH);
exact('board.legacyWidth', 'Board Constants', constants.LEGACY_BOARD_W);
exact('board.legacyHeight', 'Board Constants', constants.LEGACY_BOARD_H);

for (const item of [
  ['horizontal5', 1, 2, 4, 1, 0, 5],
  ['vertical5', 2, 5, 2, 0, 1, 5],
  ['diagonalDown5', 3, 1, 3, 1, 1, 5],
  ['diagonalUp5', 1, 7, 3, -1, 1, 5],
  ['horizontal6', 2, 2, 8, 1, 0, 6],
]) {
  const [id, owner, col, row, dc, dr, length] = item;
  const state = makeMatch();
  setLine(state, owner, col, row, dc, dr, length);
  const win = rules.findWinningLine(state);
  exact(`win.${id}.owner`, 'Win Detection', win?.owner ?? 0);
  exact(`win.${id}.length`, 'Win Detection', win?.line?.length ?? 0);
}

for (const skillId of ['spark', 'ward', 'windwalk', 'freeze', 'pull', 'transmute']) {
  const skill = constants.SKILL_BY_ID[skillId];
  exact(`skill.${skillId}.cost`, '6 Skills', skill.cost);
  exact(`skill.${skillId}.uses`, '6 Skills', skill.uses);
}

const sparkState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'hibana');
sparkState.energy[1] = constants.MAX_ENERGY;
sparkState.stones[20] = 2;
const sparkResult = rules.applyAction(sparkState, { type: 'skill', seat: 1, skillId: 'spark', index: 20 });
exact('skill.spark.effect.targetOwner', '6 Skills', sparkResult.state.stones[20]);
exact('skill.spark.effect.energy', '6 Skills', sparkResult.state.energy[1]);

const wardState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'mamori');
wardState.energy[1] = constants.MAX_ENERGY;
wardState.stones[30] = 1;
const wardResult = rules.applyAction(wardState, { type: 'skill', seat: 1, skillId: 'ward', index: 30 });
exact('skill.ward.effect.guardOwner', '6 Skills', wardResult.state.guards[30]);
wardState.guards[30] = 1;
const duplicateWard = rules.applyAction(wardState, { type: 'skill', seat: 1, skillId: 'ward', index: 30 });
exact('skill.ward.effect.duplicateCode', '6 Skills', duplicateWard.code);

const windwalkState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'hayate');
windwalkState.energy[1] = constants.MAX_ENERGY;
windwalkState.stones[30] = 1;
windwalkState.guards[30] = 1;
const windwalkResult = rules.applyAction(windwalkState, { type: 'skill', seat: 1, skillId: 'windwalk', from: 30, to: 31 });
exact('skill.windwalk.effect.sourceOwner', '6 Skills', windwalkResult.state.stones[30]);
exact('skill.windwalk.effect.targetOwner', '6 Skills', windwalkResult.state.stones[31]);
exact('skill.windwalk.effect.targetGuard', '6 Skills', windwalkResult.state.guards[31]);

const freezeState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'yukine');
freezeState.energy[1] = constants.MAX_ENERGY;
const freezeResult = rules.applyAction(freezeState, { type: 'skill', seat: 1, skillId: 'freeze', index: 40 });
exact('skill.freeze.effect.releaseClock', '6 Skills', freezeResult.state.ice[40]);

const pullState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'kuon');
pullState.energy[1] = constants.MAX_ENERGY;
for (let index = 0; index < 4; index += 1) pullState.stones[index] = 2;
pullState.stones[5] = 2;
const pullResult = rules.applyAction(pullState, { type: 'skill', seat: 1, skillId: 'pull', from: 5, to: 4 });
exact('skill.pull.effect.winner', '6 Skills', pullResult.state.result?.winner ?? 0);

const transmuteState = makeMatch(rulesets.RULESET.PVP_BALANCE_V2, 'akari');
transmuteState.energy[1] = constants.MAX_ENERGY;
for (let index = 0; index < 4; index += 1) transmuteState.stones[index] = 1;
transmuteState.stones[4] = 2;
const transmuteResult = rules.applyAction(transmuteState, { type: 'skill', seat: 1, skillId: 'transmute', index: 4 });
exact('skill.transmute.effect.winner', '6 Skills', transmuteResult.state.result?.winner ?? 0);

const balance = rulesets.RULESETS[rulesets.RULESET.PVP_BALANCE_V2];
for (const [key, value] of Object.entries({
  seats: balance.seats,
  iceOffset: balance.iceOffset,
  declaredSkillPlusPlace: balance.skillPlusPlace,
  telegraph: balance.telegraph,
  minStoneJudgement: balance.minStoneJudgement,
  rewards: balance.rewards,
  stats: balance.stats,
})) exact(`ruleset.pvp_balance_v2.${key}`, 'pvp_balance_v2', value);

const v99Ruleset = rulesets.RULESETS[rulesets.RULESET.PVP_V99];
for (const [key, value] of Object.entries({
  seats: v99Ruleset.seats,
  iceOffset: v99Ruleset.iceOffset,
  skillPlusPlace: v99Ruleset.skillPlusPlace,
  telegraph: v99Ruleset.telegraph,
  minStoneJudgement: v99Ruleset.minStoneJudgement,
  randomStartSeat: v99Ruleset.randomStartSeat,
  rewards: v99Ruleset.rewards,
  stats: v99Ruleset.stats,
  unlockTurn: rulesets.V99.unlockTurn,
  longTurn: rulesets.V99.longTurn,
  sparkCanRefill: rulesets.V99.sparkCanRefill,
  sparkBreaksWard: rulesets.V99.sparkBreaksWard,
  wardBreakEnergy: rulesets.V99.wardBreakEnergy,
})) exact(`ruleset.pvp_v99.${key}`, 'pvp_v99 Legacy', value);
exact('ruleset.pvp_v99.unlockOffsetByOrder', 'pvp_v99 Legacy', rulesets.V99.unlockOffsetByOrder);
exact('ruleset.pvp_v99.orderPenalty', 'pvp_v99 Legacy', rulesets.V99.orderPenalty);
exact('ruleset.pvp_v99.longRecover', 'pvp_v99 Legacy', rulesets.V99.longRecover);

for (const [charId, enhanced] of Object.entries(rulesets.V99.enhance)) {
  exact(`ruleset.pvp_v99.enhance.${charId}.cost`, 'pvp_v99 Legacy', enhanced.cost);
  exact(`ruleset.pvp_v99.enhance.${charId}.usesFloor`, 'pvp_v99 Legacy', enhanced.usesFloor);
  exact(`ruleset.pvp_v99.enhance.${charId}.extra`, 'pvp_v99 Legacy', enhanced.extra);
}

const v99Spark = makeMatch(rulesets.RULESET.PVP_V99, 'hibana');
v99Spark.energy[1] = constants.MAX_ENERGY;
v99Spark.stones[12] = 2;
const v99SkillResult = rules.applyAction(v99Spark, { type: 'skill', seat: 1, skillId: 'spark', index: 12 });
exact('ruleset.pvp_v99.behavior.usesCap', 'pvp_v99 Legacy', rules.usesCapOf(v99SkillResult.state, 1, 'spark'));
exact('ruleset.pvp_v99.behavior.useCountAfterSkill', 'pvp_v99 Legacy', rules.usesOf(v99SkillResult.state, 1, 'spark'));
exact('ruleset.pvp_v99.behavior.pendingAfterSkill', 'pvp_v99 Legacy', v99SkillResult.state.pending?.remaining ?? 0);
exact('ruleset.pvp_v99.behavior.turnAfterSkill', 'pvp_v99 Legacy', v99SkillResult.state.turn);
exact('ruleset.pvp_v99.behavior.plyAfterSkill', 'pvp_v99 Legacy', v99SkillResult.state.ply);
const v99ExtraResult = rules.applyAction(v99SkillResult.state, { type: 'extra', seat: 1, index: 12 });
exact('ruleset.pvp_v99.behavior.ownerAfterExtra', 'pvp_v99 Legacy', v99ExtraResult.state.stones[12]);
exact('ruleset.pvp_v99.behavior.turnAfterExtra', 'pvp_v99 Legacy', v99ExtraResult.state.turn);
exact('ruleset.pvp_v99.behavior.plyAfterExtra', 'pvp_v99 Legacy', v99ExtraResult.state.ply);

const v99WardBreak = makeMatch(rulesets.RULESET.PVP_V99, 'hibana');
v99WardBreak.energy[1] = constants.MAX_ENERGY;
v99WardBreak.stones[20] = 2;
v99WardBreak.guards[20] = 1;
const v99WardBreakResult = rules.applyAction(v99WardBreak, { type: 'skill', seat: 1, skillId: 'spark', index: 20 });
exact('ruleset.pvp_v99.behavior.energyAfterWardBreak', 'pvp_v99 Legacy', v99WardBreakResult.state.energy[1]);

exact('story.stageCount', 'Story Unlock', story.STORY_STAGE_COUNT);
exact('story.trainingStages', 'Story Unlock', story.TRAINING_BOARDS.map((board) => board.stage));
exact('story.skillUnlocks', 'Story Unlock', story.SKILL_UNLOCKS.map((unlock) => `${unlock.stage}:${unlock.skillId}`));

exact('gacha.singleCost', 'Gacha', constants.GACHA_COST_SINGLE);
exact('gacha.multiCost', 'Gacha', constants.GACHA_COST_MULTI);
exact('gacha.multiPullCount', 'Gacha', constants.GACHA_PULL_COUNT_MULTI);
exact('gacha.cosmeticPoolCount', 'Gacha', constants.GACHA_POOL.length);
exact('gacha.initialCharacterCount', 'Gacha', constants.STARTER_CHARACTER_IDS.length);
exact('gacha.rarityWeights', 'Gacha', constants.RARITIES.map((rarity) => constants.RARITY_WEIGHTS[rarity]));
exact('gacha.totalWeight', 'Gacha', constants.RARITY_WEIGHT_TOTAL);

exact('save.currentVersion', 'Save / Migration Contract', constants.SAVE_VERSION);
exact('save.migratableVersions', 'Save / Migration Contract', constants.SAVE_VERSIONS_MIGRATABLE);
exact('save.legacyBoardSize', 'Save / Migration Contract', constants.LEGACY_BOARD_W * constants.LEGACY_BOARD_H);

const revisionState = makeMatch();
const placed = rules.applyAction(revisionState, { type: 'place', seat: 1, index: 0 });
const profile = profileModule.createProfile();
profile.perica = 20;
const firstGacha = profileModule.pullGacha(profile, { count: 10, requestId: 'golden-request', randomInt: () => 0 });
const replayGacha = profileModule.pullGacha(profile, { count: 10, requestId: 'golden-request', randomInt: () => 0 });
notRun(
  'network.initialRevision',
  'requestId / revision / stateVersion Contract',
  'Web observed revision=0, but MatchState has no Revision field yet.',
  revisionState.revision,
);
notRun(
  'network.revisionAfterOneAction',
  'requestId / revision / stateVersion Contract',
  'Web observed revision=1 after one accepted action, but MatchState has no Revision field yet.',
  placed.state.revision,
);
notRun(
  'network.requestIdReplay',
  'requestId / revision / stateVersion Contract',
  'Web replayed a duplicate requestId without mutation, but the Pure C# Core has no request ledger.',
  firstGacha.ok && replayGacha.replay === true,
);
notRun(
  'network.stateVersion',
  'requestId / revision / stateVersion Contract',
  'The checked-in Web Core exposes match revision, but no stateVersion value to compare with MatchResultDto.StateVersion.',
);

const indexBytes = await readFile(path.join(repo, 'index.html'));
const result = {
  schemaVersion: 1,
  webSourceCommit: WEB_SOURCE_COMMIT,
  source: 'index.html embedded module registry',
  sourceSha256: createHash('sha256').update(indexBytes).digest('hex'),
  fixtureCount: fixtures.length,
  fixtures,
};

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(`Generated ${fixtures.length} fixtures at ${output}`);
