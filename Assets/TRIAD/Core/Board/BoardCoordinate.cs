using System;

namespace TRIAD.Core.Board
{
    public readonly struct BoardCoordinate : IEquatable<BoardCoordinate>
    {
        public int X { get; }
        public int Y { get; }

        public BoardCoordinate(int x, int y)
        {
            X = x;
            Y = y;
        }

        public bool IsInside(int width, int height) => X >= 0 && X < width && Y >= 0 && Y < height;

        public int ToIndex(int width, int height)
        {
            if (!IsInside(width, height)) throw new ArgumentOutOfRangeException(nameof(BoardCoordinate));
            return Y * width + X;
        }

        public static BoardCoordinate FromIndex(int index, int width, int height)
        {
            if (width <= 0) throw new ArgumentOutOfRangeException(nameof(width));
            if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
            if (index < 0 || index >= width * height) throw new ArgumentOutOfRangeException(nameof(index));
            return new BoardCoordinate(index % width, index / width);
        }

        public bool Equals(BoardCoordinate other) => X == other.X && Y == other.Y;
        public override bool Equals(object obj) => obj is BoardCoordinate other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(X, Y);
        public static bool operator ==(BoardCoordinate left, BoardCoordinate right) => left.Equals(right);
        public static bool operator !=(BoardCoordinate left, BoardCoordinate right) => !left.Equals(right);
        public override string ToString() => $"({X},{Y})";
    }
}
