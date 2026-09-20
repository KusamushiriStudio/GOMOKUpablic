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
    public static class TriadHomePhase17Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase16Scene = Root + "/Scenes/HomePhase16.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase17.unity";
        private const string CharacterPath = Root + "/Art/Characters/HibanaSeated-v2.png";

        [MenuItem("TRIAD/UI/Build Home Phase 17 Character Harmony")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase16Scene))
                TriadHomePhase16Builder.Build();

            ConfigureCharacterImport();
            Texture2D character = AssetDatabase.LoadAssetAtPath<Texture2D>(CharacterPath);
            if (character == null) throw new InvalidOperationException("Missing Hibana v2 art: " + CharacterPath);

            Scene scene = EditorSceneManager.OpenScene(Phase16Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();

            ExpandHeroStage(hero);
            RectTransform portrait = RequireRect(hero.transform, "HeroPortrait");
            TopLeft(portrait, new Vector2(28f, 0f), new Vector2(310f, 360f));

            RectTransform pose = RequireRect(hero.transform, "HeroPortrait/HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(0f, -3f);
            pose.localScale = new Vector3(1.08f, 1.08f, 1f);

            RawImage shadow = RequireImage(hero.transform, "HeroPortrait/HibanaCharacterPose/HibanaCharacterShadow");
            shadow.texture = character;
            shadow.color = new Color(.008f, .016f, .045f, .22f);
            shadow.rectTransform.anchoredPosition = new Vector2(2f, -1f);

            RawImage art = RequireImage(hero.transform, "HeroPortrait/HibanaCharacterPose/HibanaCharacterArt");
            art.texture = character;
            art.color = new Color(.985f, .992f, 1f, 1f);
            art.rectTransform.anchoredPosition = Vector2.zero;

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE17] PASS: Seated Hibana quality and background harmony verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase17.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 17 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE17] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureCharacterImport()
        {
            AssetDatabase.ImportAsset(CharacterPath, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(CharacterPath) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Character importer unavailable: " + CharacterPath);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = TextureImporterAlphaSource.FromInput;
            importer.alphaIsTransparency = true;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 2048;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.SaveAndReimport();
        }

        private static void ExpandHeroStage(TriadHeroAreaView hero)
        {
            Transform content = hero.transform.parent;
            RectTransform contentRect = content as RectTransform;
            if (contentRect == null || content.name != "Content")
                throw new InvalidOperationException("Home scroll content was not found.");

            TopLeft(hero.GetComponent<RectTransform>(), new Vector2(12f, 80f), new Vector2(366f, 360f));
            MoveSibling<TriadStoryBannerView>(content, new Vector2(12f, 448f), new Vector2(366f, 100f));
            MoveSibling<TriadMainCtaView>(content, new Vector2(12f, 556f), new Vector2(366f, 82f));
            MoveSibling<TriadSubMenuView>(content, new Vector2(12f, 646f), new Vector2(366f, 105f));
            MoveSibling<TriadCommunityView>(content, new Vector2(12f, 759f), new Vector2(366f, 52f));
            contentRect.sizeDelta = new Vector2(390f, 819f);
        }

        private static void MoveSibling<T>(Transform content, Vector2 position, Vector2 size) where T : Component
        {
            T component = content.GetComponentInChildren<T>(true);
            if (component == null) throw new InvalidOperationException("Missing home content: " + typeof(T).Name);
            TopLeft(component.GetComponent<RectTransform>(), position, size);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            Texture2D expected = AssetDatabase.LoadAssetAtPath<Texture2D>(CharacterPath);
            RawImage shadow = RequireImage(hero.transform, "HeroPortrait/HibanaCharacterPose/HibanaCharacterShadow");
            RawImage art = RequireImage(hero.transform, "HeroPortrait/HibanaCharacterPose/HibanaCharacterArt");
            if (art.texture != expected || shadow.texture != expected)
                throw new InvalidOperationException("Hibana v2 texture was not applied to both character layers.");
            if (art.raycastTarget || shadow.raycastTarget)
                throw new InvalidOperationException("Character art must not intercept input.");
            if (art.color.r > 1f || art.color.b < art.color.r)
                throw new InvalidOperationException("Character color balance must retain the cool moonlit integration tint.");
            RectTransform portrait = RequireRect(hero.transform, "HeroPortrait");
            float center = portrait.anchoredPosition.x + portrait.rect.width * .5f;
            if (Mathf.Abs(center - 183f) > 1f)
                throw new InvalidOperationException("Seated Hibana must remain centered.");
            if (hero.GetComponent<RectTransform>().rect.height < 359f)
                throw new InvalidOperationException("Hero stage must provide enough vertical space for high-quality character display.");
            RectTransform content = hero.transform.parent as RectTransform;
            if (content == null || content.rect.height < 818f)
                throw new InvalidOperationException("Expanded home content height was not preserved.");
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
