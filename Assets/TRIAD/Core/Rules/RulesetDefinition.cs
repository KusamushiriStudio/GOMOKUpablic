namespace TRIAD.Core.Rules
{
    public sealed class RulesetDefinition
    {
        public string Id { get; }
        public int Seats { get; }
        public int IceOffset { get; }
        public bool DeclaredSkillPlusPlace { get; }
        public bool SkillPlusPlaceEnabled { get; }
        public bool Telegraph { get; }
        public bool MinStoneJudgement { get; }
        public bool RandomStartSeat { get; }
        public string RewardsRoute { get; }
        public string StatsRoute { get; }
        public bool UsesV99Tuning { get; }

        public RulesetDefinition(string id, int seats, int iceOffset, bool declaredSkillPlusPlace, bool skillPlusPlaceEnabled,
            bool telegraph, bool minStoneJudgement, bool randomStartSeat, string rewardsRoute, string statsRoute, bool usesV99Tuning)
        {
            Id = id;
            Seats = seats;
            IceOffset = iceOffset;
            DeclaredSkillPlusPlace = declaredSkillPlusPlace;
            SkillPlusPlaceEnabled = skillPlusPlaceEnabled;
            Telegraph = telegraph;
            MinStoneJudgement = minStoneJudgement;
            RandomStartSeat = randomStartSeat;
            RewardsRoute = rewardsRoute;
            StatsRoute = statsRoute;
            UsesV99Tuning = usesV99Tuning;
        }
    }
}
