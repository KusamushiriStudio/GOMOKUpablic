using System;

namespace TRIAD.Core.Rules
{
    public static class RulesetCatalog
    {
        public const string PvpBalanceV2Id = "pvp_balance_v2";
        public const string PvpV99Id = "pvp_v99";

        public static readonly RulesetDefinition PvpBalanceV2 = new RulesetDefinition(
            PvpBalanceV2Id, 3, 3, true, false, false, true, false, "none", "verify", false);

        public static readonly RulesetDefinition PvpV99 = new RulesetDefinition(
            PvpV99Id, 3, 3, false, false, false, true, true, "pvp", "pvp", true);

        public static RulesetDefinition Get(string id)
        {
            if (id == PvpBalanceV2Id) return PvpBalanceV2;
            if (id == PvpV99Id) return PvpV99;
            throw new ArgumentException("Unknown ruleset id.", nameof(id));
        }
    }
}
