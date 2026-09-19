using System;
using UnityEngine;

namespace TRIAD.AssetTest
{
    /// <summary>
    /// Test-only board coordinate model. This is NOT game-core logic.
    /// 11 columns (A-K) x 17 rows (1-17), with F9 fixed at local origin.
    /// </summary>
    [Serializable]
    public readonly struct BoardCoordinate : IEquatable<BoardCoordinate>
    {
        public const int ColumnCount = 11;
        public const int RowCount = 17;
        public const int IntersectionCount = ColumnCount * RowCount;
        public const int CenterColumnIndex = 5; // F
        public const int CenterRowIndex = 8;    // 9

        public int ColumnIndex { get; }
        public int RowIndex { get; }
        public char ColumnLetter => (char)('A' + ColumnIndex);
        public int RowNumber => RowIndex + 1;
        public string Label => $"{ColumnLetter}{RowNumber}";

        public BoardCoordinate(int columnIndex, int rowIndex)
        {
            if (columnIndex < 0 || columnIndex >= ColumnCount)
                throw new ArgumentOutOfRangeException(nameof(columnIndex));
            if (rowIndex < 0 || rowIndex >= RowCount)
                throw new ArgumentOutOfRangeException(nameof(rowIndex));

            ColumnIndex = columnIndex;
            RowIndex = rowIndex;
        }

        public Vector3 ToLocalPosition(float spacing = 1f, float y = 0f)
        {
            if (spacing <= 0f)
                throw new ArgumentOutOfRangeException(nameof(spacing));

            return new Vector3(
                (ColumnIndex - CenterColumnIndex) * spacing,
                y,
                (RowIndex - CenterRowIndex) * spacing);
        }

        public static BoardCoordinate FromLabel(string label)
        {
            if (string.IsNullOrWhiteSpace(label) || label.Length < 2 || label.Length > 3)
                throw new FormatException($"Invalid board coordinate: '{label}'");

            string normalized = label.Trim().ToUpperInvariant();
            int columnIndex = normalized[0] - 'A';
            if (!int.TryParse(normalized.Substring(1), out int rowNumber))
                throw new FormatException($"Invalid board coordinate: '{label}'");

            return new BoardCoordinate(columnIndex, rowNumber - 1);
        }

        public static BoardCoordinate FromIndices(int columnIndex, int rowIndex) =>
            new BoardCoordinate(columnIndex, rowIndex);

        public bool Equals(BoardCoordinate other) =>
            ColumnIndex == other.ColumnIndex && RowIndex == other.RowIndex;

        public override bool Equals(object obj) => obj is BoardCoordinate other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(ColumnIndex, RowIndex);
        public override string ToString() => Label;
    }
}
