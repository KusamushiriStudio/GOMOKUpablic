import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const {
  CHARACTERS, STARTER_CHARACTER_IDS, GACHA_POOL, GACHA_POOL_BY_RARITY, RARITIES,
} = requireModule('../../shared/constants.js');
const { createProfile, normalizeProfile, pullGacha } = requireModule('../../shared/profile.js');
const { createMatch, applyAction, isEnhanced, v99FormOf, usesCapOf } = requireModule('../../shared/rules.js');

function matchFor(charId) {
  return createMatch({
    matchId: `initial-skill-${charId}`,
    mode: 'local',
    startSeat: 1,
    seats: [
      { seat: 1, name: 'P1', charId, kind: 'human' },
      { seat: 2, name: 'P2', charId: 'mamori', kind: 'human' },
      { seat: 3, name: 'P3', charId: 'hayate', kind: 'human' },
    ],
  });
}

test('新規・既存プロフィールとも最初から全6キャラクターを使用できる', () => {
  const fresh = createProfile();
  assert.deepEqual(STARTER_CHARACTER_IDS, CHARACTERS.map((char) => char.id));
  for (const char of CHARACTERS) {
    assert.equal(fresh.chars[char.id].owned, true);
    assert.ok(fresh.chars[char.id].count >= 1);
  }

  const migrated = normalizeProfile({ id: 'legacy', chars: { hibana: true } });
  for (const char of CHARACTERS) assert.equal(migrated.chars[char.id].owned, true);
});

test('ガチャ排出対象は28種のコスメだけでキャラクターを含まない', () => {
  assert.equal(GACHA_POOL.length, 28);
  assert.equal(GACHA_POOL.every((item) => item.kind === 'cosmetic'), true);
  for (const rarity of RARITIES) assert.equal(GACHA_POOL_BY_RARITY[rarity].length, 7);

  const profile = createProfile();
  profile.perica = 10;
  const result = pullGacha(profile, {
    count: 10,
    requestId: 'cosmetic-only-10plus1',
    randomInt: () => 0,
  });
  assert.equal(result.ok, true);
  assert.equal(result.result.entries.length, 11);
  assert.equal(result.result.entries.every((entry) => entry.kind === 'cosmetic'), true);
});

test('全キャラスキルは初手から強化形・コスト1・使用枠12で解放済み', () => {
  for (const char of CHARACTERS) {
    const state = matchFor(char.id);
    const form = v99FormOf(state, 1, char.skill.id);
    assert.equal(isEnhanced(state, 1), true, `${char.name}は開始時から強化済み`);
    assert.equal(form.locked, false, `${char.name}に手番ロックがない`);
    assert.equal(form.cost, 1, `${char.name}は初手エナジーで使用可能`);
    assert.equal(usesCapOf(state, 1, char.skill.id), 12, `${char.name}の使用枠`);
  }
});

test('更新前から継続中の対戦も使用枠12へ安全に移行する', () => {
  const state = matchFor('hibana');
  state.usesCap[1] = 2;
  assert.equal(usesCapOf(state, 1, 'spark'), 12);
});

test('どの技も追加配置を持たない（1手番は「置く」か「使う」のどちらか一方）', () => {
  // 2026-09-18 に変更。以前は防御系が攻撃系より 1 つ多い追加配置を持っていたが、
  // あそびかたの説明文は最初から「スキルの後に石を追加で置くことはできません」と
  // 書いてあり、V99 の設定だけが食い違っていた。
  for (const char of CHARACTERS) {
    const form = v99FormOf(matchFor(char.id), 1, char.skill.id);
    assert.equal(form.extra, 0, `${char.name}の${char.skill.name}に追加配置が残っている`);
  }
});

test('初手エナジー1で攻撃系・防御系の全スキルを実際に発動できる', () => {
  const actions = {
    spark: { action: { type: 'skill', seat: 1, skillId: 'spark', index: 20 }, prepare: (state) => { state.stones[20] = 2; } },
    ward: { action: { type: 'skill', seat: 1, skillId: 'ward', index: 20 }, prepare: (state) => { state.stones[20] = 1; } },
    windwalk: { action: { type: 'skill', seat: 1, skillId: 'windwalk', from: 20, to: 21 }, prepare: (state) => { state.stones[20] = 1; } },
    freeze: { action: { type: 'skill', seat: 1, skillId: 'freeze', index: 20 }, prepare: () => {} },
    pull: { action: { type: 'skill', seat: 1, skillId: 'pull', from: 20, to: 21 }, prepare: (state) => { state.stones[20] = 2; } },
    transmute: { action: { type: 'skill', seat: 1, skillId: 'transmute', index: 20 }, prepare: (state) => { state.stones[20] = 2; } },
  };

  for (const char of CHARACTERS) {
    const state = matchFor(char.id);
    const sample = actions[char.skill.id];
    sample.prepare(state);
    const result = applyAction(state, sample.action);
    assert.equal(result.ok, true, `${char.name}が初手で${char.skill.name}を発動`);
    assert.equal(result.state.energy[1], 0);
    // 発動したらそこで手番が終わる。追加配置は残さない。
    assert.equal(result.state.pending, null, `${char.name}の追加配置が残っている`);
    assert.notEqual(result.state.turn, 1, `${char.name}の手番が終わっていない`);
  }
});
