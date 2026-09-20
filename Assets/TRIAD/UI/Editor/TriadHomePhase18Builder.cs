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
    public static class TriadHomePhase18Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase17Scene = Root + "/Scenes/HomePhase17.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase18.unity";
        private const string CharacterPath = Root + "/Art/Characters/HibanaSeated-v2.png";

        [MenuItem("TRIAD/UI/Build Home Phase 18 Character Texture Optimization")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase17Scene))
                TriadHomePhase17Builder.Build();

            ConfigureCharacterCompression();
            Scene scene = EditorSceneManager.OpenScene(Phase17Scene, OpenSceneMode.Single);
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE18] PASS: Platform character texture compression verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase18.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 18 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE18] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureCharacterCompression()
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

        private static void Verify()
        {
            TextureImporter importer = AssetImporter.GetAtPath(CharacterPath) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Character importer is missing.");
            VerifyPlatform(importer, "Standalone", TextureImporterFormat.BC7);
            VerifyPlatform(importer, "iPhone", TextureImporterFormat.ASTC_4x4);
            VerifyPlatform(importer, "Android", TextureImporterFormat.ASTC_4x4);

            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            RawImage art = hero.transform.Find("HeroPortrait/HibanaCharacterPose/HibanaCharacterArt")?.GetComponent<RawImage>();
            Texture2D expected = AssetDatabase.LoadAssetAtPath<Texture2D>(CharacterPath);
            if (art == null || art.texture != expected || art.raycastTarget)
                throw new InvalidOperationException("Optimized character texture reference is incomplete.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static void VerifyPlatform(TextureImporter importer, string platform, TextureImporterFormat format)
        {
            TextureImporterPlatformSettings settings = importer.GetPlatformTextureSettings(platform);
            if (!settings.overridden || settings.format != format || settings.maxTextureSize != 2048 || settings.compressionQuality != 100)
                throw new InvalidOperationException("Unexpected " + platform + " texture settings.");
        }
    }
}
