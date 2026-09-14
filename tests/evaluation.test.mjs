import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const { createMatch, applyAction } = requireModule('../../shared/rules.js');
const { evaluatePosition } = requireModule('../../shared/evaluation.js');

function stateFixture() {
  return createMatch({
    matchId: 'evaluation-fixture',
    mode: 'local',
    startSeat: 1,
    seats: [
      { seat: 1, name: 'あなた', charId: 'hibana', kind: 'human' },
      { seat: 2, name: 'CPU A', charId: 'mamori', kind: 'cpu' },
      { seat: 3, name: 'CPU B', charId: 'hayate', kind: 'cpu' },
    ],
  });
}

test('AI形勢評価は3人分を返し合計100%になる', () => {
  const result = evaluatePosition(stateFixture());
  assert.equal(result.length, 3);
  assert.equal(result.reduce((sum, item) => sum + item.percent, 0), 100);
  assert.deepEqual(result.map((item) => item.seat), [1, 2, 3]);
});

test('開いた四連と複数脅威を持つ席を有利に評価する', () => {
  const state = stateFixture();
  const row = 8;
  for (const col of [3, 4, 5, 6]) state.stones[row * state.width + col] = 1;
  const result = evaluatePosition(state);
  assert.ok(result[0].percent > result[1].percent);
  assert.ok(result[0].score > result[2].score);
});

test('エナジー・残りスキル・結界・氷結を評価値へ反映する', () => {
  const plain = stateFixture();
  const enhanced = structuredClone(plain);
  enhanced.energy[1] = 6;
  enhanced.stones[0] = 1;
  enhanced.guards[0] = 1;
  enhanced.ice[20] = 99;
  enhanced.iceOwner[20] = 1;
  const before = evaluatePosition(plain).find((item) => item.seat === 1);
  const after = evaluatePosition(enhanced).find((item) => item.seat === 1);
  assert.ok(after.score > before.score);
});

test('決着時は勝者100%で最終結果と矛盾しない', () => {
  const state = stateFixture();
  state.status = 'finished';
  state.result = { kind: 'win', winner: 2, winners: [2], reason: 'five', line: [0, 1, 2, 3, 4] };
  assert.deepEqual(evaluatePosition(state).map((item) => item.percent), [0, 100, 0]);
});

test('確定した通常着手とスキル後のstateで評価が更新される', () => {
  const state = stateFixture();
  const initial = evaluatePosition(state).map((item) => item.score);
  const placed = applyAction(state, { type: 'place', seat: 1, index: 90 });
  assert.equal(placed.ok, true);
  assert.notDeepEqual(evaluatePosition(placed.state).map((item) => item.score), initial);

  const skillState = stateFixture();
  skillState.stones[90] = 2;
  skillState.energy[1] = 6;
  const beforeSkill = evaluatePosition(skillState).map((item) => item.score);
  const skill = applyAction(skillState, { type: 'skill', seat: 1, skillId: 'spark', index: 90 });
  assert.equal(skill.ok, true);
  const afterSkill = evaluatePosition(skill.state);
  assert.notDeepEqual(afterSkill.map((item) => item.score), beforeSkill);
  assert.equal(afterSkill.reduce((sum, item) => sum + item.percent, 0), 100);
});

test('形勢評価はUIを止めない軽量計算である', () => {
  const state = stateFixture();
  const started = performance.now();
  for (let i = 0; i < 100; i += 1) evaluatePosition(state);
  assert.ok(performance.now() - started < 1000, '100回の評価が1秒未満で完了する');
});
