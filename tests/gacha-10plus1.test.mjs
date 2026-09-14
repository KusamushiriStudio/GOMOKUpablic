import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTriadBundle } from './helpers/load-bundle.mjs';

const requireModule = await loadTriadBundle();
const { createProfile, pullGacha, currentOfferRates } = requireModule('../../shared/profile.js');

function deterministicInt(max) {
  return max > 0 ? 0 : 0;
}

test('10ペリカで11件を通常排出率から抽選する', () => {
  const profile = createProfile();
  profile.perica = 10;
  const rates = currentOfferRates(profile);
  const result = pullGacha(profile, { count: 10, requestId: 'ten-plus-one', randomInt: deterministicInt });

  assert.equal(result.ok, true);
  assert.equal(result.result.count, 11);
  assert.equal(result.result.purchaseCount, 10);
  assert.equal(result.result.bonusCount, 1);
  assert.equal(result.result.cost, 10);
  assert.equal(result.result.entries.length, 11);
  assert.equal(profile.gachaHistory.length, 11);
  assert.equal(profile.perica, 0);
  for (const entry of result.result.entries) assert.deepEqual(entry.rates, rates.byRarity);
});

test('9ペリカでは10+1回を実行せずprofileを変更しない', () => {
  const profile = createProfile();
  profile.perica = 9;
  const before = JSON.stringify(profile);
  const result = pullGacha(profile, { count: 10, requestId: 'insufficient-10plus1', randomInt: deterministicInt });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'insufficient');
  assert.equal(JSON.stringify(profile), before);
});

test('1回ガチャは1ペリカ・1件のまま', () => {
  const profile = createProfile();
  profile.perica = 1;
  const result = pullGacha(profile, { count: 1, requestId: 'single', randomInt: deterministicInt });
  assert.equal(result.ok, true);
  assert.equal(result.result.count, 1);
  assert.equal(result.result.cost, 1);
  assert.equal(result.result.entries.length, 1);
  assert.equal(profile.perica, 0);
});

test('同じrequestIdの10+1再送は11件を再付与しない', () => {
  const profile = createProfile();
  profile.perica = 20;
  const first = pullGacha(profile, { count: 10, requestId: 'retry-10plus1', randomInt: deterministicInt });
  const afterFirst = JSON.stringify(profile);
  const replay = pullGacha(profile, { count: 10, requestId: 'retry-10plus1', randomInt: deterministicInt });
  assert.equal(first.ok, true);
  assert.equal(replay.ok, true);
  assert.equal(replay.replay, true);
  assert.equal(JSON.stringify(profile), afterFirst);
});
