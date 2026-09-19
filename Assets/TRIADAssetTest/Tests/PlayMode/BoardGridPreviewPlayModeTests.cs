using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace TRIAD.AssetTest.Tests
{
    public sealed class BoardGridPreviewPlayModeTests
    {
        [UnityTest]
        public IEnumerator RebuildInPlayMode_KeepsOneRenderableCompleteGrid()
        {
            var root = new GameObject("PlayModeAssetRoot");

            try
            {
                BoardGridPreview preview = root.AddComponent<BoardGridPreview>();
                yield return null;

                preview.Rebuild();
                preview.Rebuild();
                yield return null;

                var activeGrids = new List<Transform>();
                foreach (Transform child in root.transform)
                    if (child.gameObject.activeSelf && child.name == "TEMP_GeneratedGrid") activeGrids.Add(child);

                Assert.That(activeGrids, Has.Count.EqualTo(1));

                Transform grid = activeGrids[0];
                int points = 0;
                int boards = 0;
                int cameras = 0;
                int directionalLights = 0;
                var labels = new HashSet<string>();

                foreach (Transform child in grid)
                {
                    if (child.name == "TEMP_Board") boards++;
                    if (child.name.StartsWith("TEMP_Point_"))
                    {
                        points++;
                        labels.Add(child.name.Substring("TEMP_Point_".Length));
                    }

                    if (child.GetComponent<Camera>() != null) cameras++;
                    Light light = child.GetComponent<Light>();
                    if (light != null && light.type == LightType.Directional) directionalLights++;
                }

                Assert.That(points, Is.EqualTo(BoardCoordinate.IntersectionCount));
                Assert.That(labels, Has.Count.EqualTo(BoardCoordinate.IntersectionCount));
                Assert.That(boards, Is.EqualTo(1));
                Assert.That(cameras, Is.EqualTo(1));
                Assert.That(directionalLights, Is.EqualTo(1));

                Camera camera = grid.GetComponentInChildren<Camera>();
                var renderTexture = new RenderTexture(256, 256, 24);
                var frame = new Texture2D(256, 256, TextureFormat.RGB24, false);

                try
                {
                    camera.targetTexture = renderTexture;
                    camera.Render();
                    RenderTexture.active = renderTexture;
                    frame.ReadPixels(new Rect(0, 0, 256, 256), 0, 0);
                    frame.Apply();

                    Color32[] pixels = frame.GetPixels32();
                    byte minLuminance = byte.MaxValue;
                    byte maxLuminance = byte.MinValue;
                    int magentaPixels = 0;

                    foreach (Color32 pixel in pixels)
                    {
                        byte luminance = (byte)((pixel.r + pixel.g + pixel.b) / 3);
                        if (luminance < minLuminance) minLuminance = luminance;
                        if (luminance > maxLuminance) maxLuminance = luminance;
                        if (pixel.r > 240 && pixel.b > 240 && pixel.g < 20) magentaPixels++;
                    }

                    Debug.Log($"[TRIAD RENDER] LuminanceRange={minLuminance}-{maxLuminance}; MagentaPixels={magentaPixels}/{pixels.Length}");
                    Assert.That(maxLuminance - minLuminance, Is.GreaterThan(10), "Rendered frame is effectively blank.");
                    Assert.That(magentaPixels, Is.EqualTo(0), "Rendered frame contains missing-shader magenta pixels.");
                }
                finally
                {
                    camera.targetTexture = null;
                    RenderTexture.active = null;
                    Object.Destroy(renderTexture);
                    Object.Destroy(frame);
                }
            }
            finally
            {
                Object.Destroy(root);
            }

            yield return null;
        }
    }
}
