using System.Collections.Generic;

namespace TRIAD.Core.Rules
{
    public sealed class ActionResult
    {
        public bool Success { get; }
        public string Error { get; }
        public MatchState State { get; }
        public WinningLine WinningLine { get; }
        public IReadOnlyList<string> Events { get; }

        private ActionResult(bool success, string error, MatchState state, WinningLine winningLine, IReadOnlyList<string> events)
        {
            Success = success;
            Error = error;
            State = state;
            WinningLine = winningLine;
            Events = events;
        }

        public static ActionResult Reject(MatchState original, string error) =>
            new ActionResult(false, error, original, null, new string[0]);

        public static ActionResult Accept(MatchState state, WinningLine winningLine, IReadOnlyList<string> events) =>
            new ActionResult(true, null, state, winningLine, events);
    }
}
