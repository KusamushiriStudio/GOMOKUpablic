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
    public static class TriadHomePhase19Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase18Scene = Root + "/Scenes/HomePhase18.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase19.unity";
        private const string BoardPath = Root + "/Art/Props/HomeGoBoardForeground-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 19 Grounded Hero")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase18Scene))
                TriadHomePhase18Builder.Build();

            ConfigureBoardImport();
            Texture2D boardTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(BoardPath);
            if (boardTexture == null) throw new InvalidOperationException("Missing foreground Go board: " + BoardPath);

            Scene scene = EditorSceneManager.OpenScene(Phase18Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();

            OpenCharacterCrop(hero.transform);
            IntegrateCharacterLighting(hero.transform);
            CreateGroundShadow(hero.transform);
            CreateBoardOcclusion(hero.transform);
            CreateBoardForeground(hero.transform, boardTexture);
            ArrangeForegroundOrder(hero.transform);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE19] PASS: Grounded hero composition and lighting integration verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase19.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 19 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE19] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureBoardImport()
        {
            AssetDatabase.ImportAsset(BoardPath, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(BoardPath) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Board importer unavailable: " + BoardPath);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = TextureImporterAlphaSource.FromInput;
            importer.alphaIsTransparency = true;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 2048;
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
            settings.maxTextureSize = 2048;
            settings.resizeAlgorithm = TextureResizeAlgorithm.Mitchell;
            settings.format = format;
            settings.textureCompression = TextureImporterCompression.CompressedHQ;
            settings.compressionQuality = 100;
            settings.crunchedCompression = false;
            importer.SetPlatformTextureSettings(settings);
        }

        private static void OpenCharacterCrop(Transform hero)
        {
            RectTransform portrait = RequireRect(hero, "HeroPortrait");
            TopLeft(portrait, Vector2.zero, new Vector2(366f, 360f));

            RectTransform pose = RequireRect(hero, "HeroPortrait/HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(-19f, -7f);
            pose.localScale = new Vector3(1.12f, 1.12f, 1f);
        }

        private static void IntegrateCharacterLighting(Transform hero)
        {
            RawImage art = RequireImage(hero, "HeroPortrait/HibanaCharacterPose/HibanaCharacterArt");
            art.color = new Color(.80f, .84f, .91f, .98f);

            RawImage shadow = RequireImage(hero, "HeroPortrait/HibanaCharacterPose/HibanaCharacterShadow");
            shadow.color = new Color(.004f, .010f, .030f, .30f);
            shadow.rectTransform.anchoredPosition = new Vector2(2f, -1f);
        }

        private static void CreateGroundShadow(Transform hero)
        {
            Transform existing = hero.Find("HibanaGroundShadow");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            GameObject shadowObject = new GameObject(
                "HibanaGroundShadow",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic));
            shadowObject.transform.SetParent(hero, false);
            TopLeft(shadowObject.GetComponent<RectTransform>(), new Vector2(48f, 292f), new Vector2(252f, 42f));
            TriadRoundedRectGraphic shadow = shadowObject.GetComponent<TriadRoundedRectGraphic>();
            shadow.color = new Color(.002f, .006f, .018f, .34f);
            shadow.BorderColor = Color.clear;
            shadow.BorderWidth = 0f;
            shadow.CornerRadius = 21f;
            shadow.raycastTarget = false;
        }

        private static void CreateBoardForeground(Transform hero, Texture2D boardTexture)
        {
            Transform existing = hero.Find("HomeGoBoardForeground");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            GameObject boardObject = new GameObject(
                "HomeGoBoardForeground",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(RawImage));
            boardObject.transform.SetParent(hero, false);
            TopLeft(boardObject.GetComponent<RectTransform>(), new Vector2(0f, 282f), new Vector2(366f, 78f));
            RawImage board = boardObject.GetComponent<RawImage>();
            board.texture = boardTexture;
            board.color = new Color(.88f, .91f, .96f, .98f);
            // Crop away the prop's feet and retain only the playing surface plus the solid front apron.
            board.uvRect = new Rect(0f, .20f, 1f, .40f);
            board.raycastTarget = false;
        }

        private static void CreateBoardOcclusion(Transform hero)
        {
            Transform existing = hero.Find("HomeGoBoardOcclusion");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            GameObject occlusionObject = new GameObject(
                "HomeGoBoardOcclusion",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic));
            occlusionObject.transform.SetParent(hero, false);
            TopLeft(occlusionObject.GetComponent<RectTransform>(), new Vector2(12f, 304f), new Vector2(342f, 56f));
            TriadRoundedRectGraphic occlusion = occlusionObject.GetComponent<TriadRoundedRectGraphic>();
            occlusion.color = new Color(.035f, .020f, .018f, 1f);
            occlusion.BorderColor = Color.clear;
            occlusion.BorderWidth = 0f;
            occlusion.CornerRadius = 2f;
            occlusion.raycastTarget = false;
        }

        private static void ArrangeForegroundOrder(Transform hero)
        {
            Transform groundShadow = hero.Find("HibanaGroundShadow");
            Transform portrait = hero.Find("HeroPortrait");
            Transform boardOcclusion = hero.Find("HomeGoBoardOcclusion");
            Transform board = hero.Find("HomeGoBoardForeground");
            groundShadow.SetAsLastSibling();
            portrait.SetAsLastSibling();
            boardOcclusion.SetAsLastSibling();
            board.SetAsLastSibling();

            foreach (string path in new[]
            {
                "HeroInfoReadabilityPlate", "HeroKicker", "HeroName", "HeroRole",
                "SkillPlate", "HeroDetailButton", "HeroCostumeButton"
            })
            {
                Transform item = hero.Find(path);
                if (item == null) throw new InvalidOperationException("Missing foreground element: " + path);
                item.SetAsLastSibling();
            }
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            RectTransform portrait = RequireRect(hero.transform, "HeroPortrait");
            RectTransform pose = RequireRect(hero.transform, "HeroPortrait/HibanaCharacterPose");
            RawImage art = RequireImage(hero.transform, "HeroPortrait/HibanaCharacterPose/HibanaCharacterArt");
            RawImage board = RequireImage(hero.transform, "HomeGoBoardForeground");
            Texture2D expectedBoard = AssetDatabase.LoadAssetAtPath<Texture2D>(BoardPath);
            if (portrait.rect.width < 365f)
                throw new InvalidOperationException("The character crop must span the hero stage to protect the right edge.");
            if (pose.anchoredPosition.x >= -10f)
                throw new InvalidOperationException("Hibana must be shifted left to keep the right silhouette visible.");
            if (art.color.r >= .90f || art.color.b <= art.color.r)
                throw new InvalidOperationException("Character lighting must be darker and cooler than the previous phase.");
            if (board.texture != expectedBoard || board.raycastTarget || board.rectTransform.rect.height < 76f)
                throw new InvalidOperationException("Foreground Go board integration is incomplete.");
            if (board.transform.GetSiblingIndex() <= portrait.transform.GetSiblingIndex())
                throw new InvalidOperationException("The Go board must cover the character's lower edge.");
            if (board.transform.GetSiblingIndex() >= hero.transform.Find("HeroInfoReadabilityPlate").GetSiblingIndex())
                throw new InvalidOperationException("Character information must remain above the board.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static RectTransform RequireRect(Transform root, string path)
        {
            RectTransform rect = root.Find(path)?.GetComponent<RectTransform>();
            if (rect == null) throw new InvalidOperationException("Missing RectTransform: " + path);
            return rect;
        }

        private static RawImage RequireImage(Transform root, string path)
        {
            RawImage image = root.Find(path)?.GetComponent<RawImage>();
            if (image == null) throw new InvalidOperationException("Missing RawImage: " + path);
            return image;
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
