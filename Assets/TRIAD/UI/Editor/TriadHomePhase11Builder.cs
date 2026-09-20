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
    public static class TriadHomePhase11Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase10Scene = Root + "/Scenes/HomePhase10.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase11.unity";
        private const string CharacterPath = Root + "/Art/Characters/HibanaFullBody-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 11 Character")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase10Scene))
                TriadHomePhase10Builder.Build();

            ConfigureCharacterImport();
            Texture2D characterTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(CharacterPath);
            if (characterTexture == null) throw new InvalidOperationException("Missing Hibana character art: " + CharacterPath);

            Scene scene = EditorSceneManager.OpenScene(Phase10Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            Transform portraitRoot = hero.transform.Find("HeroPortrait");
            if (portraitRoot == null) throw new InvalidOperationException("HeroPortrait root was not found.");

            TriadHeroPortraitGraphic placeholder = portraitRoot.GetComponent<TriadHeroPortraitGraphic>();
            if (placeholder == null) throw new InvalidOperationException("Hero portrait fallback is missing.");
            placeholder.enabled = false;
            EditorUtility.SetDirty(placeholder);
            if (portraitRoot.GetComponent<RectMask2D>() == null)
                portraitRoot.gameObject.AddComponent<RectMask2D>();

            GameObject poseObject = new GameObject("HibanaCharacterPose", typeof(RectTransform));
            poseObject.transform.SetParent(portraitRoot, false);
            RectTransform poseRect = poseObject.GetComponent<RectTransform>();
            Fill(poseRect);
            poseRect.anchoredPosition = new Vector2(0f, -18f);
            poseRect.localScale = new Vector3(1.15f, 1.15f, 1f);

            CreateCharacterLayer(
                poseObject.transform,
                "HibanaCharacterShadow",
                characterTexture,
                new Color(0.01f, 0.02f, 0.055f, 0.62f),
                new Vector2(4f, -3f));
            CreateCharacterLayer(
                poseObject.transform,
                "HibanaCharacterArt",
                characterTexture,
                Color.white,
                Vector2.zero);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE11] PASS: Hibana character art and fallback separation verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase11.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 11 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE11] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureCharacterImport()
        {
            AssetDatabase.ImportAsset(CharacterPath, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(CharacterPath) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Character texture importer unavailable: " + CharacterPath);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = TextureImporterAlphaSource.FromInput;
            importer.alphaIsTransparency = true;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 2048;
            importer.textureCompression = TextureImporterCompression.CompressedHQ;
            importer.SaveAndReimport();
        }

        private static void CreateCharacterLayer(
            Transform parent,
            string name,
            Texture2D texture,
            Color color,
            Vector2 offset)
        {
            GameObject layer = new GameObject(
                name,
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(RawImage),
                typeof(AspectRatioFitter));
            layer.transform.SetParent(parent, false);
            RectTransform rect = layer.GetComponent<RectTransform>();
            Fill(rect);
            rect.anchoredPosition = offset;
            RawImage image = layer.GetComponent<RawImage>();
            image.texture = texture;
            image.color = color;
            image.raycastTarget = false;
            AspectRatioFitter fitter = layer.GetComponent<AspectRatioFitter>();
            fitter.aspectMode = AspectRatioFitter.AspectMode.FitInParent;
            fitter.aspectRatio = texture.width / (float)texture.height;
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            Transform portraitRoot = hero.transform.Find("HeroPortrait");
            Transform poseRoot = portraitRoot != null ? portraitRoot.Find("HibanaCharacterPose") : null;
            RawImage character = poseRoot != null
                ? poseRoot.Find("HibanaCharacterArt")?.GetComponent<RawImage>()
                : null;
            RawImage shadow = poseRoot != null
                ? poseRoot.Find("HibanaCharacterShadow")?.GetComponent<RawImage>()
                : null;
            TriadHeroPortraitGraphic placeholder = portraitRoot != null
                ? portraitRoot.GetComponent<TriadHeroPortraitGraphic>()
                : null;
            if (character == null || shadow == null || character.texture == null)
                throw new InvalidOperationException("Hibana character layers are incomplete.");
            if (placeholder == null || placeholder.enabled)
                throw new InvalidOperationException("Procedural placeholder must remain available but hidden.");
            if (portraitRoot.GetComponent<RectMask2D>() == null)
                throw new InvalidOperationException("Character crop mask is missing.");
            if (character.raycastTarget || shadow.raycastTarget)
                throw new InvalidOperationException("Character art must not intercept input.");
            if (character.texture != AssetDatabase.LoadAssetAtPath<Texture2D>(CharacterPath))
                throw new InvalidOperationException("Hibana texture reference is incorrect.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static void Fill(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
