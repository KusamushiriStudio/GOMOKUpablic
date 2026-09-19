using System.Collections.Generic;
using TRIAD.Core.Board;

namespace TRIAD.Core.Rules
{
    public sealed class WinningLine
    {
        public int Seat { get; }
        public IReadOnlyList<BoardCoordinate> Coordinates { get; }

        public WinningLine(int seat, IReadOnlyList<BoardCoordinate> coordinates)
        {
            Seat = seat;
            Coordinates = coordinates;
        }
    }
}
