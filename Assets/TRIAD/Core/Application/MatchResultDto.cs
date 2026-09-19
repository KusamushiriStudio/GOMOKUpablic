namespace TRIAD.Core.Application
{
    public sealed class MatchResultDto
    {
        public string MatchId { get; }
        public string RulesetId { get; }
        public int WinnerSeat { get; }
        public string RequestId { get; }
        public long StateVersion { get; }

        public MatchResultDto(string matchId, string rulesetId, int winnerSeat, string requestId, long stateVersion)
        {
            MatchId = matchId;
            RulesetId = rulesetId;
            WinnerSeat = winnerSeat;
            RequestId = requestId;
            StateVersion = stateVersion;
        }
    }
}
