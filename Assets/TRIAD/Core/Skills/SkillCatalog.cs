using System;
using System.Collections.Generic;
using TRIAD.Core.Common;
using TRIAD.Core.Rules;

namespace TRIAD.Core.Skills
{
    public static class SkillCatalog
    {
        private static readonly IReadOnlyDictionary<string, SkillDefinition> BalanceV2 = new Dictionary<string, SkillDefinition>
        {
            [StableIds.Spark] = new SkillDefinition(StableIds.Spark, 4, 2),
            [StableIds.Ward] = new SkillDefinition(StableIds.Ward, 2, 2),
            [StableIds.Windwalk] = new SkillDefinition(StableIds.Windwalk, 3, 2),
            [StableIds.Freeze] = new SkillDefinition(StableIds.Freeze, 2, 2),
            [StableIds.Pull] = new SkillDefinition(StableIds.Pull, 4, 2),
            [StableIds.Transmute] = new SkillDefinition(StableIds.Transmute, 6, 1)
        };

        private static readonly IReadOnlyDictionary<string, SkillDefinition> V99 = new Dictionary<string, SkillDefinition>
        {
            [StableIds.Spark] = new SkillDefinition(StableIds.Spark, 1, 12),
            [StableIds.Ward] = new SkillDefinition(StableIds.Ward, 1, 12),
            [StableIds.Windwalk] = new SkillDefinition(StableIds.Windwalk, 1, 12),
            [StableIds.Freeze] = new SkillDefinition(StableIds.Freeze, 1, 12),
            [StableIds.Pull] = new SkillDefinition(StableIds.Pull, 1, 12),
            [StableIds.Transmute] = new SkillDefinition(StableIds.Transmute, 1, 12)
        };

        public static SkillDefinition Get(string rulesetId, string skillId)
        {
            var catalog = rulesetId == RulesetCatalog.PvpV99Id ? V99 : BalanceV2;
            if (!catalog.TryGetValue(skillId, out var definition)) throw new ArgumentException("Unknown skill id.", nameof(skillId));
            return definition;
        }
    }
}
