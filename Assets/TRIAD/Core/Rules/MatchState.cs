using System;
using System.Collections.Generic;
using TRIAD.Core.Board;

namespace TRIAD.Core.Rules
{
    public sealed class MatchState
    {
        public const int MaxEnergy = 6;

        public RulesetDefinition Ruleset { get; }
        public BoardState Board { get; }
        public int TurnSeat { get; internal set; }
        public int Ply { get; internal set; }
        public int WinnerSeat { get; internal set; }
        public bool IsFinished => WinnerSeat != 0;

        public int[] Energy { get; }
        public HashSet<int> WardedIndices { get; }
        public Dictionary<int, int> FrozenUntilPly { get; }
        public Dictionary<int, Dictionary<string, int>> SkillUses { get; }
        public int? StartSeat { get; }
        public int[] Order { get; }
        public int[] TurnsTaken { get; }
        public int PendingExtraPlacements { get; internal set; }
        public string PendingSkillId { get; internal set; }
        public int? PendingBannedIndex { get; internal set; }

        private MatchState(RulesetDefinition ruleset, BoardState board, int turnSeat, int ply, int winnerSeat,
            int[] energy, HashSet<int> wards, Dictionary<int, int> frozen,
            Dictionary<int, Dictionary<string, int>> skillUses, int? startSeat, int[] order, int[] turnsTaken)
        {
            Ruleset = ruleset;
            Board = board;
            TurnSeat = turnSeat;
            Ply = ply;
            WinnerSeat = winnerSeat;
            Energy = energy;
            WardedIndices = wards;
            FrozenUntilPly = frozen;
            SkillUses = skillUses;
            StartSeat = startSeat;
            Order = order;
            TurnsTaken = turnsTaken;
        }

        public static MatchState Create(string rulesetId, int? v99StartSeat = null)
        {
            var ruleset = RulesetCatalog.Get(rulesetId);
            var energy = new int[ruleset.Seats + 1];
            int turnSeat;
            int? startSeat = null;
            int[] order = null;
            int[] turnsTaken = null;

            if (ruleset.RandomStartSeat)
            {
                if (!v99StartSeat.HasValue || v99StartSeat.Value < 1 || v99StartSeat.Value > ruleset.Seats)
                    throw new ArgumentOutOfRangeException(nameof(v99StartSeat), "pvp_v99 requires an explicit deterministic start seat.");
                startSeat = v99StartSeat.Value;
                turnSeat = startSeat.Value;
                order = BuildOrder(ruleset.Seats, turnSeat);
                turnsTaken = new int[ruleset.Seats + 1];
            }
            else
            {
                turnSeat = 1;
            }

            energy[turnSeat] = 1;
            var uses = new Dictionary<int, Dictionary<string, int>>();
            for (var seat = 1; seat <= ruleset.Seats; seat++) uses[seat] = new Dictionary<string, int>();

            return new MatchState(ruleset, new BoardState(), turnSeat, 0, 0, energy,
                new HashSet<int>(), new Dictionary<int, int>(), uses, startSeat, order, turnsTaken);
        }

        public MatchState Clone()
        {
            var uses = new Dictionary<int, Dictionary<string, int>>();
            foreach (var pair in SkillUses) uses[pair.Key] = new Dictionary<string, int>(pair.Value);

            var clone = new MatchState(Ruleset, Board.Clone(), TurnSeat, Ply, WinnerSeat,
                (int[])Energy.Clone(), new HashSet<int>(WardedIndices), new Dictionary<int, int>(FrozenUntilPly),
                uses, StartSeat, Order == null ? null : (int[])Order.Clone(), TurnsTaken == null ? null : (int[])TurnsTaken.Clone());
            clone.PendingExtraPlacements = PendingExtraPlacements;
            clone.PendingSkillId = PendingSkillId;
            clone.PendingBannedIndex = PendingBannedIndex;
            return clone;
        }

        public int GetSkillUseCount(int seat, string skillId) => SkillUses[seat].TryGetValue(skillId, out var count) ? count : 0;
        internal void IncrementSkillUse(int seat, string skillId) => SkillUses[seat][skillId] = GetSkillUseCount(seat, skillId) + 1;

        internal void AdvanceTurn()
        {
            if (TurnsTaken != null) TurnsTaken[TurnSeat]++;
            Ply++;
            TurnSeat = TurnSeat % Ruleset.Seats + 1;
            Energy[TurnSeat] = Math.Min(MaxEnergy, Energy[TurnSeat] + 1);
        }

        internal int OrderIndexOf(int seat)
        {
            if (Order == null) return seat - 1;
            return Array.IndexOf(Order, seat);
        }

        internal void ClearPendingExtra()
        {
            PendingExtraPlacements = 0;
            PendingSkillId = null;
            PendingBannedIndex = null;
        }

        private static int[] BuildOrder(int seats, int start)
        {
            var order = new int[seats];
            for (var i = 0; i < seats; i++) order[i] = ((start - 1 + i) % seats) + 1;
            return order;
        }
    }
}
