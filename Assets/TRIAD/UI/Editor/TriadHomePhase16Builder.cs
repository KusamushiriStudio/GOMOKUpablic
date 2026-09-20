using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase16Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase15Scene = Root + "/Scenes/HomePhase15.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase16.unity";
        private const string BackgroundPath = Root + "/Art/Backgrounds/HomeNightShrine-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 16 Story Banner")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase15Scene))
                TriadHomePhase15Builder.Build();

            Texture2D background = AssetDatabase.LoadAssetAtPath<Texture2D>(BackgroundPath);
            if (background == null) throw new InvalidOperationException("Missing story banner background: " + BackgroundPath);

            Scene scene = EditorSceneManager.OpenScene(Phase15Scene, OpenSceneMode.Single);
            TriadStoryBannerView banner = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true))
                .Single();

            if (PrefabUtility.IsPartOfPrefabInstance(banner.gameObject))
                PrefabUtility.UnpackPrefabInstance(
                    banner.gameObject,
                    PrefabUnpackMode.Completely,
                    InteractionMode.AutomatedAction);

            ConfigureSurface(banner.transform);
            CreateArtworkLayers(banner.transform, background);
            RefineTypography(banner.transform);
            CreateOrnament(banner.transform);
            ArrangeLayers(banner.transform);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE16] PASS: Illustrated story banner and readable overlay verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase16.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 16 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE16] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureSurface(Transform banner)
        {
            TriadRoundedRectGraphic surface = banner.GetComponent<TriadRoundedRectGraphic>();
            if (surface == null) throw new InvalidOperationException("Story banner surface was not found.");
            surface.color = new Color(.02f, .055f, .11f, .22f);
            surface.BorderColor = new Color(.94f, .78f, .35f, .92f);
            surface.BorderWidth = 1.2f;
            surface.CornerRadius = 12f;
            surface.raycastTarget = false;
            EditorUtility.SetDirty(surface);
        }

        private static void CreateArtworkLayers(Transform banner, Texture2D background)
        {
            GameObject art = new GameObject("StoryBannerBackgroundArt", typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage));
            art.transform.SetParent(banner, false);
            Fill(art.GetComponent<RectTransform>(), new Vector2(2f, 2f), new Vector2(-2f, -2f));
            RawImage image = art.GetComponent<RawImage>();
            image.texture = background;
            image.uvRect = new Rect(0f, .08f, 1f, .16f);
            image.color = new Color(.90f, .94f, 1f, .92f);
            image.raycastTarget = false;

            GameObject scrim = new GameObject("StoryBannerReadabilityScrim", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            scrim.transform.SetParent(banner, false);
            Fill(scrim.GetComponent<RectTransform>(), new Vector2(2f, 2f), new Vector2(-2f, -2f));
            Image scrimImage = scrim.GetComponent<Image>();
            scrimImage.color = new Color(.008f, .02f, .055f, .50f);
            scrimImage.raycastTarget = false;

            GameObject fade = new GameObject("StoryBannerTitlePlate", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            fade.transform.SetParent(banner, false);
            TopLeft(fade.GetComponent<RectTransform>(), new Vector2(8f, 7f), new Vector2(300f, 48f));
            TriadRoundedRectGraphic fadeGraphic = fade.GetComponent<TriadRoundedRectGraphic>();
            fadeGraphic.color = new Color(.006f, .014f, .035f, .46f);
            fadeGraphic.BorderWidth = 0f;
            fadeGraphic.CornerRadius = 8f;
            fadeGraphic.raycastTarget = false;
        }

        private static void RefineTypography(Transform banner)
        {
            RectTransform badge = RequireRect(banner, "StoryBadge");
            TopLeft(badge, new Vector2(12f, 12f), new Vector2(44f, 22f));

            Text title = RequireText(banner, "StoryTitle");
            TopLeft(title.rectTransform, new Vector2(64f, 7f), new Vector2(254f, 27f));
            title.fontSize = 16;
            title.color = new Color(1f, .97f, .87f, 1f);
            AddOutline(title, new Color(.005f, .008f, .02f, .95f), 1.2f);

            Text subtitle = CreateText(
                banner,
                "StorySubtitle",
                "月下に響く、新たな碁印",
                new Vector2(66f, 34f),
                new Vector2(236f, 17f),
                9,
                new Color(.92f, .82f, .60f, 1f),
                TextAnchor.MiddleLeft,
                FontStyle.Normal);
            AddOutline(subtitle, new Color(.005f, .008f, .02f, .9f), 1f);

            Text progress = RequireText(banner, "StoryProgress");
            TopLeft(progress.rectTransform, new Vector2(12f, 55f), new Vector2(112f, 16f));
            progress.fontSize = 9;
            progress.color = new Color(.91f, .86f, .72f, 1f);

            RectTransform track = RequireRect(banner, "StoryProgressTrack");
            TopLeft(track, new Vector2(12f, 74f), new Vector2(342f, 7f));

            Text dots = RequireText(banner, "CarouselDots");
            TopLeft(dots.rectTransform, new Vector2(138f, 82f), new Vector2(90f, 14f));
            dots.fontSize = 8;

            Text arrow = RequireText(banner, "StoryArrow");
            TopLeft(arrow.rectTransform, new Vector2(326f, 19f), new Vector2(28f, 38f));
            arrow.fontSize = 26;
            arrow.color = new Color(1f, .88f, .58f, 1f);
            AddOutline(arrow, new Color(.005f, .008f, .02f, .95f), 1f);

            GameObject arrowPlate = new GameObject("StoryArrowPlate", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            arrowPlate.transform.SetParent(banner, false);
            TopLeft(arrowPlate.GetComponent<RectTransform>(), new Vector2(326f, 21f), new Vector2(28f, 36f));
            TriadRoundedRectGraphic plate = arrowPlate.GetComponent<TriadRoundedRectGraphic>();
            plate.color = new Color(.01f, .025f, .06f, .68f);
            plate.BorderColor = new Color(.94f, .78f, .35f, .62f);
            plate.BorderWidth = 1f;
            plate.CornerRadius = 8f;
            plate.raycastTarget = false;
        }

        private static void CreateOrnament(Transform banner)
        {
            GameObject ornament = new GameObject(
                "StoryBannerGoldOrnament",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(TriadGoldOrnamentGraphic));
            ornament.transform.SetParent(banner, false);
            Fill(ornament.GetComponent<RectTransform>(), Vector2.zero, Vector2.zero);
            TriadGoldOrnamentGraphic graphic = ornament.GetComponent<TriadGoldOrnamentGraphic>();
            graphic.color = new Color(.98f, .84f, .48f, .70f);
            graphic.StrokeWidth = .85f;
            graphic.CornerLength = 18f;
            graphic.Inset = 4f;
            graphic.raycastTarget = false;
        }

        private static void ArrangeLayers(Transform banner)
        {
            SetOrder(banner, "StoryBannerBackgroundArt");
            SetOrder(banner, "StoryBannerReadabilityScrim");
            SetOrder(banner, "StoryBannerTitlePlate");
            SetOrder(banner, "StoryBadge");
            SetOrder(banner, "StoryTitle");
            SetOrder(banner, "StorySubtitle");
            SetOrder(banner, "StoryProgress");
            SetOrder(banner, "StoryProgressTrack");
            SetOrder(banner, "CarouselDots");
            SetOrder(banner, "StoryArrowPlate");
            SetOrder(banner, "StoryArrow");
            SetOrder(banner, "StoryBannerGoldOrnament");
        }

        private static void SetOrder(Transform root, string name)
        {
            Transform target = root.Find(name);
            if (target == null) throw new InvalidOperationException("Missing story layer: " + name);
            target.SetAsLastSibling();
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadStoryBannerView banner = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true))
                .Single();
            RawImage art = banner.transform.Find("StoryBannerBackgroundArt")?.GetComponent<RawImage>();
            Image scrim = banner.transform.Find("StoryBannerReadabilityScrim")?.GetComponent<Image>();
            TriadGoldOrnamentGraphic ornament = banner.transform.Find("StoryBannerGoldOrnament")?.GetComponent<TriadGoldOrnamentGraphic>();
            Text subtitle = banner.transform.Find("StorySubtitle")?.GetComponent<Text>();
            if (art == null || art.texture == null || art.raycastTarget)
                throw new InvalidOperationException("Story banner artwork is incomplete.");
            if (scrim == null || scrim.raycastTarget || scrim.color.a < .45f)
                throw new InvalidOperationException("Story banner readability scrim is incomplete.");
            if (ornament == null || ornament.raycastTarget || subtitle == null)
                throw new InvalidOperationException("Story banner foreground layers are incomplete.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static Text CreateText(
            Transform parent, string name, string value, Vector2 position, Vector2 size,
            int fontSize, Color color, TextAnchor anchor, FontStyle style)
        {
            GameObject item = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            item.transform.SetParent(parent, false);
            Text text = item.GetComponent<Text>();
            TopLeft(text.rectTransform, position, size);
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.fontStyle = style;
            text.color = color;
            text.alignment = anchor;
            text.raycastTarget = false;
            text.supportRichText = false;
            return text;
        }

        private static void AddOutline(Text text, Color color, float distance)
        {
            Outline outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.effectColor = color;
            outline.effectDistance = new Vector2(distance, -distance);
            outline.useGraphicAlpha = true;
        }

        private static RectTransform RequireRect(Transform root, string path)
        {
            RectTransform rect = root.Find(path)?.GetComponent<RectTransform>();
            if (rect == null) throw new InvalidOperationException("Missing RectTransform: " + path);
            return rect;
        }

        private static Text RequireText(Transform root, string path)
        {
            Text text = root.Find(path)?.GetComponent<Text>();
            if (text == null) throw new InvalidOperationException("Missing text: " + path);
            return text;
        }

        private static void Fill(RectTransform rect, Vector2 offsetMin, Vector2 offsetMax)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }
    }
}
