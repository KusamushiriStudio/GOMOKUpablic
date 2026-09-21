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
    public static class TriadHomePhase24Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase23Scene = Root + "/Scenes/HomePhase23.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase24.unity";
        private const string BackgroundPath = Root + "/Art/Backgrounds/HomeShrineStage-v3.png";
        private const string MenuAtlasPath = Root + "/Art/Menu/HomeSubMenuAtlas-v2.png";

        [MenuItem("TRIAD/UI/Build Home Phase 24 Scene Depth")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase23Scene))
                TriadHomePhase23Builder.Build();

            ConfigureTexture(BackgroundPath, 2048);
            ConfigureTexture(MenuAtlasPath, 2048);
            Texture2D backgroundTexture = RequireTexture(BackgroundPath);
            Texture2D menuAtlas = RequireTexture(MenuAtlasPath);

            Scene scene = EditorSceneManager.OpenScene(Phase23Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ReplaceBackground(canvas, backgroundTexture);
            ComposeHeroStage(canvas);
            ApplyPurposefulMenuArt(canvas, menuAtlas);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE24] PASS: Purposeful menu art, shrine depth, open hero stage, and angled compact Go board verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase24.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 24 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE24] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ReplaceBackground(Transform canvas, Texture2D texture)
        {
            RawImage background = Require<RawImage>(canvas, "HomeBackgroundArt");
            background.texture = texture;
            background.color = Color.white;
            background.uvRect = new Rect(0f, 0f, 1f, 1f);
            AspectRatioFitter aspect = background.GetComponent<AspectRatioFitter>();
            aspect.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            aspect.aspectRatio = texture.width / (float)texture.height;
            Require<Image>(canvas, "HomeBackgroundReadabilityScrim").color = new Color(.008f, .018f, .045f, .025f);
            Require<Image>(canvas, "HomeAmbientLightLift").color = new Color(.72f, .62f, .80f, .10f);
            RecordOverride(background);
            RecordOverride(aspect);
        }

        private static void ComposeHeroStage(Transform canvas)
        {
            TriadHeroAreaView heroView = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single();
            Transform hero = heroView.transform;
            foreach (string name in new[]
            {
                "HeroInfoReadabilityPlate", "HeroKicker", "HeroName", "HeroRole", "SkillPlate",
                "HeroDetailButton", "HeroCostumeButton"
            })
            {
                Transform item = hero.Find(name);
                if (item != null) UnityEngine.Object.DestroyImmediate(item.gameObject);
            }

            RectTransform portrait = Require<RectTransform>(hero, "HeroPortrait");
            TopLeft(portrait, new Vector2(12f, -4f), new Vector2(342f, 364f));
            RectTransform pose = Require<RectTransform>(hero, "HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(8f, -1f);
            pose.localScale = new Vector3(1.18f, 1.18f, 1f);
            RawImage character = Require<RawImage>(hero, "HibanaCharacterArt");
            character.color = new Color(1f, .985f, .98f, 1f);
            RawImage shadow = Require<RawImage>(hero, "HibanaCharacterShadow");
            shadow.color = new Color(.02f, .008f, .025f, .13f);

            Transform groundShadow = hero.Find("HibanaGroundShadow");
            if (groundShadow != null)
            {
                RectTransform rect = groundShadow.GetComponent<RectTransform>();
                TopLeft(rect, new Vector2(58f, 297f), new Vector2(246f, 34f));
                groundShadow.localRotation = Quaternion.Euler(0f, 0f, -2f);
            }

            Transform occlusion = hero.Find("HomeGoBoardOcclusion");
            if (occlusion != null) UnityEngine.Object.DestroyImmediate(occlusion.gameObject);
            RawImage board = Require<RawImage>(hero, "HomeGoBoardForeground");
            TopLeft(board.rectTransform, new Vector2(38f, 282f), new Vector2(290f, 88f));
            board.rectTransform.localRotation = Quaternion.Euler(0f, 0f, -6.5f);
            board.uvRect = new Rect(0f, .12f, 1f, .52f);
            board.color = new Color(1f, .96f, .92f, 1f);

            if (groundShadow != null) groundShadow.SetAsLastSibling();
            portrait.SetAsLastSibling();
            board.transform.SetAsLastSibling();
            RecordOverride(portrait);
            RecordOverride(pose);
            RecordOverride(character);
            RecordOverride(shadow);
            RecordOverride(board);
        }

        private static void ApplyPurposefulMenuArt(Transform canvas, Texture2D atlas)
        {
            SetMenuArt(canvas, "WorldButton", atlas, new Rect(0f, .5f, .5f, .5f));
            SetMenuArt(canvas, "GachaButton", atlas, new Rect(.5f, .5f, .5f, .5f));
            SetMenuArt(canvas, "WardrobeButton", atlas, new Rect(0f, 0f, .5f, .5f));
            SetMenuArt(canvas, "CharacterTrainingButton", atlas, new Rect(.5f, 0f, .5f, .5f));
        }

        private static void SetMenuArt(Transform canvas, string buttonName, Texture2D atlas, Rect uv)
        {
            Button button = canvas.GetComponentsInChildren<Button>(true).Single(item => item.name == buttonName);
            RawImage art = Require<RawImage>(button.transform, "MenuArtwork");
            art.texture = atlas;
            art.uvRect = uv;
            art.color = Color.white;
            TriadRoundedRectGraphic scrim = Require<TriadRoundedRectGraphic>(button.transform, "MenuArtworkScrim");
            scrim.color = new Color(.004f, .008f, .020f, .25f);
            RecordOverride(art);
            RecordOverride(scrim);
        }

        private static void ConfigureTexture(string path, int maxSize)
        {
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Texture importer unavailable: " + path);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = TextureImporterAlphaSource.FromInput;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = maxSize;
            importer.textureCompression = TextureImporterCompression.CompressedHQ;
            importer.SaveAndReimport();
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
            RawImage background = Require<RawImage>(canvas, "HomeBackgroundArt");
            if (background.texture != RequireTexture(BackgroundPath))
                throw new InvalidOperationException("Phase 24 background was not applied.");
            if (canvas.GetComponentsInChildren<Transform>(true).Any(item => item.name == "HeroInfoReadabilityPlate"))
                throw new InvalidOperationException("Character information panel must be absent.");
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            if (board.rectTransform.rect.width > 291f || Mathf.Abs(board.rectTransform.localEulerAngles.z - 353.5f) > .5f)
                throw new InvalidOperationException("Go board must remain compact and angled.");
            Texture2D atlas = RequireTexture(MenuAtlasPath);
            foreach (string name in new[] { "WorldButton", "GachaButton", "WardrobeButton", "CharacterTrainingButton" })
            {
                Button button = canvas.GetComponentsInChildren<Button>(true).Single(item => item.name == name);
                if (Require<RawImage>(button.transform, "MenuArtwork").texture != atlas)
                    throw new InvalidOperationException("Purposeful menu artwork is missing: " + name);
            }
            if (canvas.GetComponentsInChildren<Button>(true).Length < 15)
                throw new InvalidOperationException("Existing non-character-info controls were lost.");
            if (canvas.GetComponentsInChildren<TriadStoryBannerView>(true).Any())
                throw new InvalidOperationException("Story progress must remain absent from home.");
        }
    }
}
