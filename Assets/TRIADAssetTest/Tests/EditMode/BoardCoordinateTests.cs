using NUnit.Framework;
using UnityEngine;

namespace TRIAD.AssetTest.Tests
{
    public sealed class BoardCoordinateTests
    {
        [Test]
        public void Grid_HasExactly187Intersections()
        {
            Assert.That(BoardCoordinate.IntersectionCount, Is.EqualTo(187));
        }

        [Test]
        public void F9_IsBoardCenterAndLocalOrigin()
        {
            BoardCoordinate center = BoardCoordinate.FromLabel("F9");
            Assert.That(center.ColumnIndex, Is.EqualTo(5));
            Assert.That(center.RowIndex, Is.EqualTo(8));
            Assert.That(center.ToLocalPosition(), Is.EqualTo(Vector3.zero));
        }

        [Test]
        public void A1_IsExpectedCorner()
        {
            Vector3 position = BoardCoordinate.FromLabel("A1").ToLocalPosition();
            Assert.That(position, Is.EqualTo(new Vector3(-5f, 0f, -8f)));
        }

        [Test]
        public void K17_IsExpectedCorner()
        {
            Vector3 position = BoardCoordinate.FromLabel("K17").ToLocalPosition();
            Assert.That(position, Is.EqualTo(new Vector3(5f, 0f, 8f)));
        }

        [TestCase("A1", 0, 0)]
        [TestCase("F9", 5, 8)]
        [TestCase("K17", 10, 16)]
        public void Labels_ParseToExpectedIndices(string label, int expectedColumn, int expectedRow)
        {
            BoardCoordinate coordinate = BoardCoordinate.FromLabel(label);
            Assert.That(coordinate.ColumnIndex, Is.EqualTo(expectedColumn));
            Assert.That(coordinate.RowIndex, Is.EqualTo(expectedRow));
            Assert.That(coordinate.Label, Is.EqualTo(label));
        }

        [Test]
        public void InvalidCoordinates_AreRejected()
        {
            Assert.Throws<System.ArgumentOutOfRangeException>(() => BoardCoordinate.FromLabel("L1"));
            Assert.Throws<System.ArgumentOutOfRangeException>(() => BoardCoordinate.FromLabel("A18"));
            Assert.Throws<System.FormatException>(() => BoardCoordinate.FromLabel("F"));
        }
    }
}
