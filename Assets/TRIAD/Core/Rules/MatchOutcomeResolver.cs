using System.Collections.Generic;

namespace TRIAD.Core.Rules
{
    public static class MatchOutcomeResolver
    {
        public static IReadOnlyList<int> ResolveMinStoneWinners(MatchState state)
        {
            var winners = new List<int>();
            var minimum = int.MaxValue;
            for (var seat = 1; seat <= state.Ruleset.Seats; seat++)
            {
                var count = state.Board.CountStones(seat);
                if (count < minimum)
                {
                    minimum = count;
                    winners.Clear();
                    winners.Add(seat);
                }
                else if (count == minimum)
                {
                    winners.Add(seat);
                }
            }
            return winners;
        }
    }
}
