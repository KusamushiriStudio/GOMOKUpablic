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
    public static class TriadHomePhase21Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase20Scene = Root + "/Scenes/HomePhase20.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase21.unity";
        private const string BattleArtPath = Root + "/Art/CTA/BattleCtaBackground-v1.png";
        private const string StoryArtPath = Root + "/Art/CTA/StoryCtaBackground-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 21 Illustrated Main CTA")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase20Scene))
                TriadHomePhase20Builder.Build();

            ConfigureTexture(BattleArtPath);
            ConfigureTexture(StoryArtPath);
            Texture2D battleArt = AssetDatabase.LoadAssetAtPath<Texture2D>(BattleArtPath);
            Texture2D storyArt = AssetDatabase.LoadAssetAtPath<Texture2D>(StoryArtPath);
            if (battleArt == null || storyArt == null)
                throw new InvalidOperationException("CTA artwork is missing.");

            Scene scene = EditorSceneManager.OpenScene(Phase20Scene, OpenSceneMode.Single);
            TriadMainCtaView mainCta = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadMainCtaView>(true))
                .Single();
            Button battle = mainCta.GetComponentsInChildren<Button>(true).Single(item => item.name == "BattleButton");
            Button story = mainCta.GetComponentsInChildren<Button>(true).Single(item => item.name == "StoryButton");
            EnhanceButton(battle, battleArt, "Battle", new Color(.09f, .015f, .012f, .56f), new Color(1f, .76f, .30f, .95f));
            EnhanceButton(story, storyArt, "Story", new Color(.005f, .018f, .055f, .54f), new Color(.82f, .88f, 1f, .95f));

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE21] PASS: Illustrated main CTA backgrounds and readable live labels verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase21.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 21 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE21] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureTexture(string path)
        {
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("CTA texture importer unavailable: " + path);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = TextureImporterAlphaSource.FromInput;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 1024;
            importer.textureCompression = TextureImporterCompression.CompressedHQ;
            ConfigurePlatform(importer, "Standalone", TextureImporterFormat.BC7);
            ConfigurePlatform(importer, "iPhone", TextureImporterFormat.ASTC_4x4);
            ConfigurePlatform(importer, "Android", TextureImporterFormat.ASTC_4x4);
            importer.SaveAndReimport();
        }

        private static void ConfigurePlatform(TextureImporter importer, string platform, TextureImporterFormat format)
        {
            TextureImporterPlatformSettings settings = importer.GetPlatformTextureSettings(platform);
            settings.name = platform;
            settings.overridden = true;
            settings.maxTextureSize = 1024;
            settings.resizeAlgorithm = TextureResizeAlgorithm.Mitchell;
            settings.format = format;
            settings.textureCompression = TextureImporterCompression.CompressedHQ;
            settings.compressionQuality = 100;
            settings.crunchedCompression = false;
            importer.SetPlatformTextureSettings(settings);
        }

        private static void EnhanceButton(Button button, Texture2D texture, string prefix, Color scrimColor, Color outlineColor)
        {
            Transform oldViewport = button.transform.Find(prefix + "CtaArtworkViewport");
            if (oldViewport != null) UnityEngine.Object.DestroyImmediate(oldViewport.gameObject);
            Transform oldScrim = button.transform.Find(prefix + "CtaArtworkScrim");
            if (oldScrim != null) UnityEngine.Object.DestroyImmediate(oldScrim.gameObject);

            GameObject viewport = new GameObject(prefix + "CtaArtworkViewport", typeof(RectTransform), typeof(RectMask2D));
            viewport.transform.SetParent(button.transform, false);
            Stretch(viewport.GetComponent<RectTransform>(), 3f);
            viewport.transform.SetAsFirstSibling();

            GameObject artObject = new GameObject("Artwork", typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage), typeof(AspectRatioFitter));
            artObject.transform.SetParent(viewport.transform, false);
            Stretch(artObject.GetComponent<RectTransform>(), 0f);
            RawImage art = artObject.GetComponent<RawImage>();
            art.texture = texture;
            art.color = Color.white;
            art.raycastTarget = false;
            AspectRatioFitter aspect = artObject.GetComponent<AspectRatioFitter>();
            aspect.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            aspect.aspectRatio = texture.width / (float)texture.height;

            GameObject scrimObject = new GameObject(prefix + "CtaArtworkScrim", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            scrimObject.transform.SetParent(button.transform, false);
            Stretch(scrimObject.GetComponent<RectTransform>(), 3f);
            TriadRoundedRectGraphic scrim = scrimObject.GetComponent<TriadRoundedRectGraphic>();
            scrim.color = scrimColor;
            scrim.BorderColor = new Color(.96f, .78f, .34f, .82f);
            scrim.BorderWidth = 1f;
            scrim.CornerRadius = 10f;
            scrim.raycastTarget = false;
            scrimObject.transform.SetSiblingIndex(1);

            Text title = button.transform.Find("Label")?.GetComponent<Text>();
            Text subtitle = button.GetComponentsInChildren<Text>(true).Single(item => item.name.EndsWith("SubLabel", StringComparison.Ordinal));
            if (title == null) throw new InvalidOperationException("CTA title label is missing: " + button.name);
            title.fontSize = 20;
            title.fontStyle = FontStyle.Bold;
            title.color = new Color(1f, .94f, .78f, 1f);
            title.alignment = TextAnchor.MiddleCenter;
            Outline titleOutline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
            titleOutline.effectColor = new Color(.005f, .008f, .018f, .98f);
            titleOutline.effectDistance = new Vector2(1.5f, -1.5f);
            subtitle.fontSize = 9;
            subtitle.color = new Color(.94f, .90f, .80f, .88f);
            Outline subOutline = subtitle.GetComponent<Outline>() ?? subtitle.gameObject.AddComponent<Outline>();
            subOutline.effectColor = new Color(.005f, .008f, .018f, .95f);
            subOutline.effectDistance = new Vector2(1f, -1f);
            title.transform.SetAsLastSibling();
            subtitle.transform.SetAsLastSibling();

            TriadRoundedRectGraphic buttonGraphic = button.GetComponent<TriadRoundedRectGraphic>();
            buttonGraphic.color = new Color(.01f, .015f, .025f, 1f);
            buttonGraphic.BorderColor = outlineColor;
            buttonGraphic.BorderWidth = 1.5f;
            RecordOverride(title);
            RecordOverride(titleOutline);
            RecordOverride(subtitle);
            RecordOverride(subOutline);
            RecordOverride(buttonGraphic);
        }

        private static void Stretch(RectTransform rect, float inset)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = new Vector2(inset, inset);
            rect.offsetMax = new Vector2(-inset, -inset);
        }

        private static void RecordOverride(UnityEngine.Object target)
        {
            EditorUtility.SetDirty(target);
            PrefabUtility.RecordPrefabInstancePropertyModifications(target);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadMainCtaView cta = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadMainCtaView>(true)).Single();
            Button[] buttons = cta.GetComponentsInChildren<Button>(true);
            if (buttons.Length != 2) throw new InvalidOperationException("Main CTA button count changed.");
            foreach (Button button in buttons)
            {
                RawImage art = button.GetComponentsInChildren<RawImage>(true).SingleOrDefault(item => item.name == "Artwork");
                Text title = button.transform.Find("Label")?.GetComponent<Text>();
                if (art == null || art.texture == null || art.raycastTarget)
                    throw new InvalidOperationException("CTA artwork integration is incomplete: " + button.name);
                if (title == null || title.fontSize < 20 || title.GetComponent<Outline>() == null)
                    throw new InvalidOperationException("CTA title readability is incomplete: " + button.name);
            }
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true)).Any())
                throw new InvalidOperationException("Story progress must remain absent from home.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 17)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }
    }
}
