using System;

namespace TRIAD.Core.Board
{
    public sealed class BoardState
    {
        public const int StandardWidth = 11;
        public const int StandardHeight = 17;
        public const int StandardSize = 187;
        public static readonly BoardCoordinate StandardCenter = new BoardCoordinate(5, 8);
        private readonly int[] _owners;

        public int Width { get; }
        public int Height { get; }
        public int Size => _owners.Length;

        public BoardState(int width = StandardWidth, int height = StandardHeight)
        {
            if (width <= 0) throw new ArgumentOutOfRangeException(nameof(width));
            if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
            Width = width;
            Height = height;
            _owners = new int[checked(width * height)];
        }

        private BoardState(int width, int height, int[] owners)
        {
            Width = width;
            Height = height;
            _owners = owners;
        }

        public bool IsInside(BoardCoordinate coordinate) => coordinate.IsInside(Width, Height);

        public int GetOwner(BoardCoordinate coordinate)
        {
            EnsureInside(coordinate);
            return _owners[coordinate.ToIndex(Width, Height)];
        }

        public bool IsEmpty(BoardCoordinate coordinate) => GetOwner(coordinate) == 0;

        public void Place(BoardCoordinate coordinate, int seat)
        {
            if (seat <= 0) throw new ArgumentOutOfRangeException(nameof(seat));
            EnsureInside(coordinate);
            var index = coordinate.ToIndex(Width, Height);
            if (_owners[index] != 0) throw new InvalidOperationException("Cell is already occupied.");
            _owners[index] = seat;
        }

        public void SetOwner(BoardCoordinate coordinate, int seat)
        {
            if (seat < 0) throw new ArgumentOutOfRangeException(nameof(seat));
            EnsureInside(coordinate);
            _owners[coordinate.ToIndex(Width, Height)] = seat;
        }

        public BoardState Clone() => new BoardState(Width, Height, (int[])_owners.Clone());

        public int CountStones(int seat)
        {
            var count = 0;
            for (var i = 0; i < _owners.Length; i++) if (_owners[i] == seat) count++;
            return count;
        }

        private void EnsureInside(BoardCoordinate coordinate)
        {
            if (!IsInside(coordinate)) throw new ArgumentOutOfRangeException(nameof(coordinate), "Coordinate is outside the board.");
        }
    }
}
