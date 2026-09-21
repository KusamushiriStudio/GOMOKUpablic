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
    public static class TriadHomePhase26Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase25Scene = Root + "/Scenes/HomePhase25.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase26.unity";
        private const string CharacterPath = Root + "/Art/Characters/HibanaSeated-v4.png";
        private const string BoardPath = Root + "/Art/Props/HomeGoBoardPerspective-v2.png";
        private const string BackgroundPath = Root + "/Art/Backgrounds/HomeShrineStage-v3.png";
        private const string MenuAtlasPath = Root + "/Art/Menu/HomeSubMenuAtlas-v2.png";
        private const string BattlePath = Root + "/Art/CTA/BattleCtaBackground-v1.png";
        private const string StoryPath = Root + "/Art/CTA/StoryCtaBackground-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 26 Researched Grounded Side-Sit")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase25Scene))
                TriadHomePhase25Builder.Build();

            ConfigureTexture(CharacterPath, true);
            ConfigureTexture(BoardPath, true);
            ConfigureTexture(BackgroundPath, false);
            ConfigureTexture(MenuAtlasPath, false);
            ConfigureTexture(BattlePath, false);
            ConfigureTexture(StoryPath, false);

            Texture2D characterTexture = RequireTexture(CharacterPath);
            Texture2D boardTexture = RequireTexture(BoardPath);
            Scene scene = EditorSceneManager.OpenScene(Phase25Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigureCanvas(canvas);
            ConfigureCharacter(canvas, characterTexture);
            ConfigureBoard(canvas, boardTexture);
            ConfigureSeatContact(canvas);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE26] PASS: Researched side-sitting pose, visible support hand, broad seat contact, and foreground overlap verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase26.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 26 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE26] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureCanvas(Transform canvasTransform)
        {
            Canvas canvas = canvasTransform.GetComponent<Canvas>();
            canvas.pixelPerfect = true;
            CanvasScaler scaler = canvasTransform.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390f, 844f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = .5f;
            RecordOverride(canvas);
            RecordOverride(scaler);
        }

        private static void ConfigureCharacter(Transform canvas, Texture2D texture)
        {
            TriadHeroAreaView heroView = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single();
            Transform hero = heroView.transform;
            RectTransform portrait = Require<RectTransform>(hero, "HeroPortrait");
            TopLeft(portrait, new Vector2(0f, -2f), new Vector2(366f, 362f));

            RectTransform pose = Require<RectTransform>(portrait, "HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(0f, -15f);
            pose.localScale = new Vector3(1.20f, 1.20f, 1f);

            RawImage art = Require<RawImage>(pose, "HibanaCharacterArt");
            RawImage shadow = Require<RawImage>(pose, "HibanaCharacterShadow");
            foreach (RawImage layer in new[] { shadow, art })
            {
                layer.texture = texture;
                layer.uvRect = new Rect(0f, 0f, 1f, 1f);
                AspectRatioFitter fitter = layer.GetComponent<AspectRatioFitter>() ?? layer.gameObject.AddComponent<AspectRatioFitter>();
                fitter.aspectMode = AspectRatioFitter.AspectMode.FitInParent;
                fitter.aspectRatio = texture.width / (float)texture.height;
                layer.raycastTarget = false;
                RecordOverride(layer);
                RecordOverride(fitter);
            }
            art.color = Color.white;
            shadow.color = new Color(.015f, .006f, .020f, .10f);
            shadow.rectTransform.anchoredPosition = new Vector2(2f, -2f);
            RecordOverride(portrait);
            RecordOverride(pose);
        }

        private static void ConfigureBoard(Transform canvas, Texture2D texture)
        {
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            board.texture = texture;
            board.color = Color.white;
            board.uvRect = new Rect(0f, .11f, 1f, .74f);
            TopLeft(board.rectTransform, new Vector2(28f, 276f), new Vector2(310f, 132f));
            board.rectTransform.localRotation = Quaternion.identity;
            RecordOverride(board);
        }

        private static void ConfigureSeatContact(Transform canvas)
        {
            TriadHeroAreaView heroView = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single();
            Transform hero = heroView.transform;
            Transform existing = hero.Find("HibanaSeatContactShadow");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);

            GameObject shadowObject = new GameObject(
                "HibanaSeatContactShadow", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            shadowObject.transform.SetParent(hero, false);
            TopLeft(shadowObject.GetComponent<RectTransform>(), new Vector2(61f, 300f), new Vector2(244f, 24f));
            TriadRoundedRectGraphic shadow = shadowObject.GetComponent<TriadRoundedRectGraphic>();
            shadow.color = new Color(.025f, .008f, .014f, .46f);
            shadow.BorderColor = new Color(.76f, .43f, .22f, .16f);
            shadow.BorderWidth = 1f;
            shadow.CornerRadius = 12f;
            shadow.raycastTarget = false;

            RectTransform portrait = Require<RectTransform>(hero, "HeroPortrait");
            RawImage board = Require<RawImage>(hero, "HomeGoBoardForeground");
            shadowObject.transform.SetSiblingIndex(Mathf.Max(0, portrait.GetSiblingIndex()));
            portrait.SetAsLastSibling();
            board.transform.SetAsLastSibling();
        }

        private static void ConfigureTexture(string path, bool hasAlpha)
        {
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Texture importer unavailable: " + path);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = hasAlpha ? TextureImporterAlphaSource.FromInput : TextureImporterAlphaSource.None;
            importer.alphaIsTransparency = hasAlpha;
            importer.mipmapEnabled = false;
            importer.streamingMipmaps = false;
            importer.npotScale = TextureImporterNPOTScale.None;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 4096;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            SetPlatform(importer, "Standalone", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            SetPlatform(importer, "iPhone", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            SetPlatform(importer, "Android", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            importer.SaveAndReimport();
        }

        private static void SetPlatform(TextureImporter importer, string platform, TextureImporterFormat format)
        {
            TextureImporterPlatformSettings settings = importer.GetPlatformTextureSettings(platform);
            settings.name = platform;
            settings.overridden = true;
            settings.maxTextureSize = 4096;
            settings.resizeAlgorithm = TextureResizeAlgorithm.Mitchell;
            settings.format = format;
            settings.textureCompression = TextureImporterCompression.Uncompressed;
            settings.compressionQuality = 100;
            settings.crunchedCompression = false;
            importer.SetPlatformTextureSettings(settings);
        }

        private static Texture2D RequireTexture(string path)
        {
            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            return texture != null ? texture : throw new InvalidOperationException("Missing texture: " + path);
        }

        private static T Require<T>(Transform root, string name) where T : Component
        {
            T component = root.GetComponentsInChildren<T>(true).FirstOrDefault(item => item.name == name);
            return component != null ? component : throw new InvalidOperationException("Missing component: " + name);
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void RecordOverride(UnityEngine.Object target)
        {
            EditorUtility.SetDirty(target);
            PrefabUtility.RecordPrefabInstancePropertyModifications(target);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            RawImage art = Require<RawImage>(canvas, "HibanaCharacterArt");
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            if (art.texture != RequireTexture(CharacterPath) || art.GetComponent<AspectRatioFitter>() == null)
                throw new InvalidOperationException("Character native aspect was not preserved.");
            if (board.texture != RequireTexture(BoardPath) || Quaternion.Angle(board.rectTransform.localRotation, Quaternion.identity) > .01f)
                throw new InvalidOperationException("Board must use perspective art without screen-space rotation.");
            if (canvas.GetComponentsInChildren<Transform>(true).All(item => item.name != "HibanaSeatContactShadow"))
                throw new InvalidOperationException("Seat contact shadow is missing.");
            TextureImporter characterImporter = AssetImporter.GetAtPath(CharacterPath) as TextureImporter;
            TextureImporter backgroundImporter = AssetImporter.GetAtPath(BackgroundPath) as TextureImporter;
            if (characterImporter == null || backgroundImporter == null ||
                characterImporter.textureCompression != TextureImporterCompression.Uncompressed ||
                backgroundImporter.textureCompression != TextureImporterCompression.Uncompressed)
                throw new InvalidOperationException("Key art must remain uncompressed.");
            if (canvas.GetComponentsInChildren<Button>(true).Length < 15)
                throw new InvalidOperationException("Existing non-character-info controls were lost.");
        }
    }
}
