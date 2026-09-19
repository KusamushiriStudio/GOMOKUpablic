using System;
using System.Collections.Generic;
using TRIAD.Core.Board;
using TRIAD.Core.Common;
using TRIAD.Core.Skills;

namespace TRIAD.Core.Rules
{
    public static class RuleEngine
    {
        public static ActionResult Apply(MatchState current, MatchAction action)
        {
            if (current == null) throw new ArgumentNullException(nameof(current));
            if (action == null) throw new ArgumentNullException(nameof(action));
            if (current.IsFinished) return ActionResult.Reject(current, "match_finished");
            if (action.Seat != current.TurnSeat) return ActionResult.Reject(current, "not_your_turn");

            if (current.PendingExtraPlacements > 0)
                return action.Kind == MatchActionKind.Extra
                    ? ApplyExtra(current, action)
                    : ActionResult.Reject(current, "need_extra");

            if (action.Kind == MatchActionKind.Extra) return ActionResult.Reject(current, "no_pending_extra");
            return action.Kind == MatchActionKind.Place ? ApplyPlace(current, action) : ApplySkill(current, action);
        }

        private static ActionResult ApplyPlace(MatchState current, MatchAction action)
        {
            if (!current.Board.IsInside(action.Target)) return ActionResult.Reject(current, "out_of_bounds");
            if (!current.Board.IsEmpty(action.Target)) return ActionResult.Reject(current, "occupied");

            var targetIndex = action.Target.ToIndex(current.Board.Width, current.Board.Height);
            if (current.FrozenUntilPly.TryGetValue(targetIndex, out var until) && current.Ply < until)
                return ActionResult.Reject(current, "frozen");

            var next = current.Clone();
            next.Board.Place(action.Target, action.Seat);
            var line = WinDetector.FindWinningLine(next.Board, action.Target);
            if (line != null) next.WinnerSeat = action.Seat;
            else next.AdvanceTurn();
            return ActionResult.Accept(next, line, new[] { "place" });
        }

        private static ActionResult ApplySkill(MatchState current, MatchAction action)
        {
            if (string.IsNullOrEmpty(action.SkillId)) return ActionResult.Reject(current, "missing_skill");

            SkillDefinition definition;
            try { definition = SkillCatalog.Get(current.Ruleset.Id, action.SkillId); }
            catch (ArgumentException) { return ActionResult.Reject(current, "unknown_skill"); }

            if (current.Energy[action.Seat] < definition.Cost) return ActionResult.Reject(current, "insufficient_energy");
            if (current.GetSkillUseCount(action.Seat, action.SkillId) >= definition.Uses) return ActionResult.Reject(current, "uses_exceeded");

            var next = current.Clone();
            var events = new List<string> { "skill:" + action.SkillId };
            if (!ApplySkillEffect(next, action, events, out var error)) return ActionResult.Reject(current, error);

            next.Energy[action.Seat] -= definition.Cost;
            if (events.Contains("v99:ward_break_energy"))
                next.Energy[action.Seat] = Math.Min(MatchState.MaxEnergy,
                    next.Energy[action.Seat] + V99Tuning.Legacy.WardBreakEnergy);
            next.IncrementSkillUse(action.Seat, action.SkillId);
            var winningLine = WinDetector.FindWinningLine(next.Board, action.Target);
            if (winningLine != null)
            {
                next.WinnerSeat = winningLine.Seat;
                next.ClearPendingExtra();
                return ActionResult.Accept(next, winningLine, events);
            }

            if (next.Ruleset.UsesV99Tuning)
            {
                var extra = V99Tuning.Legacy.ExtraPlacementsFor(action.SkillId, next.OrderIndexOf(action.Seat));
                if (extra > 0 && HasLegalExtraPlacement(next, BannedIndexForV99Skill(next, action)))
                {
                    next.PendingExtraPlacements = extra;
                    next.PendingSkillId = action.SkillId;
                    next.PendingBannedIndex = BannedIndexForV99Skill(next, action);
                }
                else next.AdvanceTurn();
            }
            else next.AdvanceTurn(); // official balance-v2 behavior: skill consumes the whole turn
            return ActionResult.Accept(next, null, events);
        }

        private static ActionResult ApplyExtra(MatchState current, MatchAction action)
        {
            if (!current.Board.IsInside(action.Target)) return ActionResult.Reject(current, "out_of_bounds");
            if (!current.Board.IsEmpty(action.Target)) return ActionResult.Reject(current, "occupied");

            var targetIndex = action.Target.ToIndex(current.Board.Width, current.Board.Height);
            if (current.PendingBannedIndex == targetIndex) return ActionResult.Reject(current, "banned_extra");
            if (current.FrozenUntilPly.TryGetValue(targetIndex, out var until) && current.Ply < until)
                return ActionResult.Reject(current, "frozen");

            var next = current.Clone();
            next.Board.Place(action.Target, action.Seat);
            next.PendingExtraPlacements--;
            var line = WinDetector.FindWinningLine(next.Board, action.Target);
            if (line != null)
            {
                next.WinnerSeat = line.Seat;
                next.ClearPendingExtra();
                return ActionResult.Accept(next, line, new[] { "extra" });
            }

            if (next.PendingExtraPlacements <= 0 || !HasLegalExtraPlacement(next, next.PendingBannedIndex))
            {
                next.ClearPendingExtra();
                next.AdvanceTurn();
            }
            return ActionResult.Accept(next, null, new[] { "extra" });
        }

        private static bool ApplySkillEffect(MatchState state, MatchAction action, List<string> events, out string error)
        {
            switch (action.SkillId)
            {
                case StableIds.Spark: return ApplySpark(state, action, events, out error);
                case StableIds.Ward: return ApplyWard(state, action, out error);
                case StableIds.Windwalk: return ApplyWindwalk(state, action, out error);
                case StableIds.Freeze: return ApplyFreeze(state, action, out error);
                case StableIds.Pull: return ApplyPull(state, action, out error);
                case StableIds.Transmute: return ApplyTransmute(state, action, out error);
                default: error = "unknown_skill"; return false;
            }
        }

        private static bool ApplySpark(MatchState state, MatchAction action, List<string> events, out string error)
        {
            if (!TryEnemyStone(state, action.Seat, action.Target, out var index, out error)) return false;
            if (state.WardedIndices.Contains(index))
            {
                if (!state.Ruleset.UsesV99Tuning) { error = "guarded"; return false; }
                state.WardedIndices.Remove(index);
                events.Add("v99:ward_break_energy");
            }
            state.Board.SetOwner(action.Target, 0);
            error = null;
            return true;
        }

        private static bool ApplyWard(MatchState state, MatchAction action, out string error)
        {
            if (!state.Board.IsInside(action.Target)) { error = "out_of_bounds"; return false; }
            if (state.Board.GetOwner(action.Target) != action.Seat) { error = "not_own_stone"; return false; }
            var index = action.Target.ToIndex(state.Board.Width, state.Board.Height);
            if (state.WardedIndices.Contains(index)) { error = "bad_target"; return false; }
            state.WardedIndices.Add(index);
            error = null;
            return true;
        }

        private static bool ApplyWindwalk(MatchState state, MatchAction action, out string error)
        {
            if (!action.Source.HasValue) { error = "missing_source"; return false; }
            var source = action.Source.Value;
            if (!state.Board.IsInside(source) || !state.Board.IsInside(action.Target)) { error = "out_of_bounds"; return false; }
            if (state.Board.GetOwner(source) != action.Seat) { error = "not_own_stone"; return false; }
            if (!state.Board.IsEmpty(action.Target)) { error = "occupied"; return false; }
            if (!IsAdjacent(source, action.Target)) { error = "not_adjacent"; return false; }

            var sourceIndex = source.ToIndex(state.Board.Width, state.Board.Height);
            var targetIndex = action.Target.ToIndex(state.Board.Width, state.Board.Height);
            var guarded = state.WardedIndices.Remove(sourceIndex);
            state.Board.SetOwner(source, 0);
            state.Board.SetOwner(action.Target, action.Seat);
            if (guarded) state.WardedIndices.Add(targetIndex);
            error = null;
            return true;
        }

        private static bool ApplyFreeze(MatchState state, MatchAction action, out string error)
        {
            if (!state.Board.IsInside(action.Target)) { error = "out_of_bounds"; return false; }
            if (!state.Board.IsEmpty(action.Target)) { error = "occupied"; return false; }
            state.FrozenUntilPly[action.Target.ToIndex(state.Board.Width, state.Board.Height)] = state.Ply + state.Ruleset.IceOffset;
            error = null;
            return true;
        }

        private static bool ApplyPull(MatchState state, MatchAction action, out string error)
        {
            if (!action.Source.HasValue) { error = "missing_source"; return false; }
            var source = action.Source.Value;
            if (!state.Board.IsInside(source) || !state.Board.IsInside(action.Target)) { error = "out_of_bounds"; return false; }
            var owner = state.Board.GetOwner(source);
            if (owner == 0 || owner == action.Seat) { error = "not_enemy_stone"; return false; }
            var sourceIndex = source.ToIndex(state.Board.Width, state.Board.Height);
            if (state.WardedIndices.Contains(sourceIndex)) { error = "guarded"; return false; }
            if (!state.Board.IsEmpty(action.Target)) { error = "occupied"; return false; }
            if (!IsAdjacent(source, action.Target)) { error = "not_adjacent"; return false; }
            state.Board.SetOwner(source, 0);
            state.Board.SetOwner(action.Target, owner);
            error = null;
            return true;
        }

        private static bool ApplyTransmute(MatchState state, MatchAction action, out string error)
        {
            if (!TryEnemyStone(state, action.Seat, action.Target, out var index, out error)) return false;
            if (state.WardedIndices.Contains(index)) { error = "guarded"; return false; }
            state.Board.SetOwner(action.Target, action.Seat);
            error = null;
            return true;
        }

        private static bool TryEnemyStone(MatchState state, int actingSeat, BoardCoordinate target, out int index, out string error)
        {
            index = -1;
            if (!state.Board.IsInside(target)) { error = "out_of_bounds"; return false; }
            var owner = state.Board.GetOwner(target);
            if (owner == 0 || owner == actingSeat) { error = "not_enemy_stone"; return false; }
            index = target.ToIndex(state.Board.Width, state.Board.Height);
            error = null;
            return true;
        }

        private static bool IsAdjacent(BoardCoordinate a, BoardCoordinate b)
        {
            var dx = Math.Abs(a.X - b.X);
            var dy = Math.Abs(a.Y - b.Y);
            return dx <= 1 && dy <= 1 && (dx != 0 || dy != 0);
        }

        private static int? BannedIndexForV99Skill(MatchState state, MatchAction action)
        {
            if (action.SkillId == StableIds.Windwalk || action.SkillId == StableIds.Pull || action.SkillId == StableIds.Freeze)
                return action.Target.ToIndex(state.Board.Width, state.Board.Height);
            if (action.SkillId == StableIds.Spark && !V99Tuning.Legacy.SparkCanRefill)
                return action.Target.ToIndex(state.Board.Width, state.Board.Height);
            return null;
        }

        private static bool HasLegalExtraPlacement(MatchState state, int? bannedIndex)
        {
            for (var index = 0; index < state.Board.Size; index++)
            {
                if (bannedIndex == index) continue;
                var coordinate = BoardCoordinate.FromIndex(index, state.Board.Width, state.Board.Height);
                if (!state.Board.IsEmpty(coordinate)) continue;
                if (state.FrozenUntilPly.TryGetValue(index, out var until) && state.Ply < until) continue;
                return true;
            }
            return false;
        }
    }
}
