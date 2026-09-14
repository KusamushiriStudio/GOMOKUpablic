import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { constants, profile, rules } = await import('../supabase/functions/api/game-core.js');

test('Edge Function core uses the same all-character cosmetic-only policy', () => {
  const p = profile.createProfile({ id: 'edge-test' });
  assert.equal(constants.CHARACTERS.length, 6);
  assert.equal(constants.CHARACTERS.every((c) => p.chars[c.id].owned), true);
  assert.equal(constants.GACHA_POOL.length, 28);
  assert.equal(constants.GACHA_POOL.some((x) => x.kind === 'character'), false);
});

test('Edge Function match core removes turn unlocks and gives every skill 12 uses', () => {
  const seats = constants.CHARACTERS.slice(0, 3).map((c, i) => ({ seat: i + 1, charId: c.id, name: c.name, kind: 'human' }));
  const state = rules.createMatch({ matchId: 'edge-match', mode: 'online', seats, startSeat: 1 });
  for (const seat of seats) {
    const skillId = constants.CHARACTER_BY_ID[seat.charId].skill.id;
    const form = rules.v99FormOf(state, seat.seat, skillId);
    assert.equal(rules.isEnhanced(state, seat.seat), true);
    assert.equal(form.locked, false);
    assert.equal(form.cost, 1);
    assert.equal(rules.usesCapOf(state, seat.seat, skillId), 12);
  }
});

test('Supabase migration protects profile and match writes with idempotency and revision checks', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202609140001_triad_server.sql', import.meta.url), 'utf8');
  assert.match(sql, /for update/i);
  assert.match(sql, /body_hash/i);
  assert.match(sql, /p_expected_revision/i);
  assert.match(sql, /grant execute[\s\S]*service_role/i);
  assert.doesNotMatch(sql, /grant execute[\s\S]*\b(?:anon|authenticated)\b/i);
});
