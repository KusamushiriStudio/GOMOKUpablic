using System.Collections.Generic;
using TRIAD.Core.Board;

namespace TRIAD.Core.Rules
{
    public static class WinDetector
    {
        public const int WinLength = 5;
        private static readonly (int dx, int dy)[] Directions = { (1, 0), (0, 1), (1, 1), (1, -1) };

        public static WinningLine FindWinningLine(BoardState board, BoardCoordinate origin)
        {
            if (board == null || !board.IsInside(origin)) return null;
            var seat = board.GetOwner(origin);
            if (seat == 0) return null;

            foreach (var direction in Directions)
            {
                var line = new List<BoardCoordinate> { origin };
                Collect(board, origin, seat, direction.dx, direction.dy, line);
                Collect(board, origin, seat, -direction.dx, -direction.dy, line);
                if (line.Count >= WinLength) return new WinningLine(seat, line);
            }
            return null;
        }

        public static bool HasFiveOrMore(BoardState board, BoardCoordinate origin) => FindWinningLine(board, origin) != null;

        private static void Collect(BoardState board, BoardCoordinate origin, int seat, int dx, int dy, List<BoardCoordinate> output)
        {
            var x = origin.X + dx;
            var y = origin.Y + dy;
            while (true)
            {
                var c = new BoardCoordinate(x, y);
                if (!board.IsInside(c) || board.GetOwner(c) != seat) break;
                output.Add(c);
                x += dx;
                y += dy;
            }
        }
    }
}
