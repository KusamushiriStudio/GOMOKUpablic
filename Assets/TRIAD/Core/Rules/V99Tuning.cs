using System;
using System.Collections.Generic;
using TRIAD.Core.Common;

namespace TRIAD.Core.Rules
{
    public sealed class V99SkillEnhancement
    {
        public int Cost { get; }
        public int UsesFloor { get; }
        public int ExtraPlacements { get; }

        public V99SkillEnhancement(int cost, int usesFloor, int extraPlacements)
        {
            Cost = cost;
            UsesFloor = usesFloor;
            ExtraPlacements = extraPlacements;
        }
    }

    public sealed class V99Tuning
    {
        public int UnlockTurn { get; } = 0;
        public int[] UnlockOffsetByOrder { get; } = { 0, 0, 0 };
        public int LongTurn { get; } = 44;
        public IReadOnlyList<string> LongRecover { get; } = new[] { StableIds.Hayate, StableIds.Kuon, StableIds.Akari };
        public IReadOnlyList<string> LockedSkills { get; } = new string[0];
        public int[] OrderPenalty { get; } = { 1, 1, 0 };
        public bool SparkCanRefill { get; } = true;
        public bool SparkBreaksWard { get; } = true;
        public int WardBreakEnergy { get; } = 2;
        public IReadOnlyDictionary<string, V99SkillEnhancement> Enhancements { get; } =
            new Dictionary<string, V99SkillEnhancement>
            {
                [StableIds.Spark] = new V99SkillEnhancement(1, 12, 2),
                [StableIds.Ward] = new V99SkillEnhancement(1, 12, 3),
                [StableIds.Windwalk] = new V99SkillEnhancement(1, 12, 2),
                [StableIds.Freeze] = new V99SkillEnhancement(1, 12, 3),
                [StableIds.Pull] = new V99SkillEnhancement(1, 12, 2),
                [StableIds.Transmute] = new V99SkillEnhancement(1, 12, 2)
            };

        public static readonly V99Tuning Legacy = new V99Tuning();
        private V99Tuning() { }

        public V99SkillEnhancement GetEnhancement(string skillId)
        {
            if (!Enhancements.TryGetValue(skillId, out var enhancement))
                throw new ArgumentException("Unknown V99 skill id.", nameof(skillId));
            return enhancement;
        }

        public int ExtraPlacementsFor(string skillId, int orderIndex)
        {
            var enhancement = GetEnhancement(skillId);
            var penalty = orderIndex >= 0 && orderIndex < OrderPenalty.Length ? OrderPenalty[orderIndex] : 0;
            return Math.Max(0, enhancement.ExtraPlacements - penalty);
        }
    }
}
