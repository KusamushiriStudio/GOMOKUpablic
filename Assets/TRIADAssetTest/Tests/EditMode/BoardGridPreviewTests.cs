using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;

namespace TRIAD.AssetTest.Tests
{
    public sealed class BoardGridPreviewTests
    {
        [Test]
        public void Rebuild_IsIdempotentAndCreatesOneCompleteGrid()
        {
            var root = new GameObject("TestAssetRoot");

            try
            {
                BoardGridPreview preview = root.AddComponent<BoardGridPreview>();
                preview.Rebuild();
                preview.Rebuild();

                var grids = new List<Transform>();
                foreach (Transform child in root.transform)
                    if (child.name == "TEMP_GeneratedGrid") grids.Add(child);

                Assert.That(grids, Has.Count.EqualTo(1));

                int boardCount = 0;
                int pointCount = 0;
                int f9Count = 0;
                var labels = new HashSet<string>();

                foreach (Transform child in grids[0])
                {
                    if (child.name == "TEMP_Board") boardCount++;
                    if (!child.name.StartsWith("TEMP_Point_")) continue;

                    pointCount++;
                    string label = child.name.Substring("TEMP_Point_".Length);
                    labels.Add(label);
                    if (label == "F9")
                    {
                        f9Count++;
                        Assert.That(child.localPosition, Is.EqualTo(Vector3.zero));
                    }
                }

                Assert.That(boardCount, Is.EqualTo(1));
                Assert.That(pointCount, Is.EqualTo(BoardCoordinate.IntersectionCount));
                Assert.That(labels, Has.Count.EqualTo(BoardCoordinate.IntersectionCount));
                Assert.That(f9Count, Is.EqualTo(1));
            }
            finally
            {
                Object.DestroyImmediate(root);
            }
        }
    }
}
