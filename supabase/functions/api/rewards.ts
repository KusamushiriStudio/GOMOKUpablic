/**
 * 決着した対戦の報酬額を決める。
 *
 * 盤面と席の情報だけから決まる純粋な計算なので、どの経路から何度呼んでも
 * 同じ結果になる。実際にプロフィールへ加算する処理（副作用のある側）は
 * index.ts の settleMatchRewards が持つ。
 */

import { constants, rules } from './game-core.js';

export type MatchOutcome = 'win' | 'lose' | 'draw' | 'aborted';

export type MatchReward = {
  userId: string;
  seat: number;
  charId: string;
  outcome: MatchOutcome;
  perica: number;
  playerXp: number;
  charXp: number;
};

/** 対戦が報酬を確定できる状態か（決着済みか）。 */
export function isSettled(match: any): boolean {
  return match?.status === 'finished' || match?.status === 'aborted';
}

/**
 * 席ごとの報酬額。中止された対戦は勝敗を見ずに全員 aborted 扱いにする。
 */
export function rewardsForMatch(match: any): MatchReward[] {
  const aborted = match?.status === 'aborted';
  return (match?.seatSnapshot || []).map((s: any) => {
    const outcome: MatchOutcome = aborted
      ? 'aborted'
      : rules.outcomeForSeat(match.state.result, s.seat);
    return {
      userId: s.userId,
      seat: s.seat,
      charId: s.charId,
      outcome,
      perica: constants.REWARD_PERICA[outcome] ?? 0,
      playerXp: constants.REWARD_PLAYER_XP[outcome] ?? 0,
      charXp: constants.REWARD_CHAR_XP[outcome] ?? 0,
    };
  });
}
