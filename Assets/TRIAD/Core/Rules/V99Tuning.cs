using System.Collections.Generic;
using TRIAD.Core.Common;

namespace TRIAD.Core.Rules
{
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

        public static readonly V99Tuning Legacy = new V99Tuning();
        private V99Tuning() { }
    }
}
