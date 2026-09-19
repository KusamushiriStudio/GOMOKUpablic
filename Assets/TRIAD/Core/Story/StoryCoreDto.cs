using System.Collections.Generic;
using TRIAD.Core.Common;

namespace TRIAD.Core.Story
{
    public sealed class StoryUnlock
    {
        public int Stage { get; }
        public string SkillId { get; }
        public StoryUnlock(int stage, string skillId) { Stage = stage; SkillId = skillId; }
    }

    public static class StoryCoreConstants
    {
        public const int StageCount = 30;
        public const int PlayerSeat = 1;
        public const int EnemySeat = 2;
        public static readonly int[] TrainingStages = { 1, 2, 3, 6, 11, 16, 21, 26 };
        public static readonly IReadOnlyList<StoryUnlock> SkillUnlocks = new[]
        {
            new StoryUnlock(3, StableIds.Spark),
            new StoryUnlock(6, StableIds.Ward),
            new StoryUnlock(11, StableIds.Windwalk),
            new StoryUnlock(16, StableIds.Freeze),
            new StoryUnlock(21, StableIds.Pull),
            new StoryUnlock(26, StableIds.Transmute)
        };
    }
}
