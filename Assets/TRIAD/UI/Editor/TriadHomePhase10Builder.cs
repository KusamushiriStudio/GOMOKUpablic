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
    public static class TriadHomePhase10Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase9Scene = Root + "/Scenes/HomePhase9.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase10.unity";
        private const string BackgroundPath = Root + "/Art/Backgrounds/HomeNightShrine-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 10 Background")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase9Scene))
                TriadHomePhase9Builder.Build();

            ConfigureBackgroundImport();
            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(BackgroundPath);
            if (texture == null) throw new InvalidOperationException("Missing home background: " + BackgroundPath);

            Scene scene = EditorSceneManager.OpenScene(Phase9Scene, OpenSceneMode.Single);
            GameObject canvasObject = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas");

            GameObject background = new GameObject(
                "HomeBackgroundArt",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(RawImage),
                typeof(AspectRatioFitter));
            background.transform.SetParent(canvasObject.transform, false);
            background.transform.SetAsFirstSibling();
            Fill(background.GetComponent<RectTransform>());

            RawImage backgroundImage = background.GetComponent<RawImage>();
            backgroundImage.texture = texture;
            backgroundImage.color = Color.white;
            backgroundImage.raycastTarget = false;

            AspectRatioFitter aspect = background.GetComponent<AspectRatioFitter>();
            aspect.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            aspect.aspectRatio = texture.width / (float)texture.height;

            GameObject scrim = new GameObject(
                "HomeBackgroundReadabilityScrim",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(Image));
            scrim.transform.SetParent(canvasObject.transform, false);
            scrim.transform.SetSiblingIndex(1);
            Fill(scrim.GetComponent<RectTransform>());
            Image scrimImage = scrim.GetComponent<Image>();
            scrimImage.color = new Color(0.012f, 0.027f, 0.060f, 0.32f);
            scrimImage.raycastTarget = false;

            SetSurfaceOpacity(canvasObject.transform, "HomeTopHeader", 0.91f);
            SetSurfaceOpacity(canvasObject.transform, "HomePlayerStatus", 0.90f);
            SetSurfaceOpacity(canvasObject.transform, "HomeHeroArea", 0.86f);
            SetSurfaceOpacity(canvasObject.transform, "HomeStoryBanner", 0.90f);
            SetSurfaceOpacity(canvasObject.transform, "HomeSubMenu", 0.88f);
            SetSurfaceOpacity(canvasObject.transform, "HomeCommunity", 0.88f);
            SetSurfaceOpacity(canvasObject.transform, "HomeBottomNavigation", 0.93f);
            SetSurfaceOpacity(canvasObject.transform, "TopNavigationGuard", 0.72f);
            SetSurfaceOpacity(canvasObject.transform, "BottomNavigationGuard", 0.72f);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE10] PASS: Independent home background and readability layers verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase10.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 10 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE10] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureBackgroundImport()
        {
            AssetDatabase.ImportAsset(BackgroundPath, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(BackgroundPath) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Background texture importer unavailable: " + BackgroundPath);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaIsTransparency = false;
            importer.mipmapEnabled = false;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 2048;
            importer.textureCompression = TextureImporterCompression.CompressedHQ;
            importer.SaveAndReimport();
        }

        private static void SetSurfaceOpacity(Transform root, string objectName, float opacity)
        {
            Transform target = root.GetComponentsInChildren<Transform>(true).FirstOrDefault(item => item.name == objectName);
            if (target == null) throw new InvalidOperationException("Missing surface: " + objectName);
            Graphic graphic = target.GetComponent<Graphic>();
            Graphic[] surfaces = graphic != null
                ? new[] { graphic }
                : target.GetComponentsInChildren<TriadRoundedRectGraphic>(true).Cast<Graphic>().ToArray();
            if (surfaces.Length == 0) throw new InvalidOperationException("Surface has no Graphic: " + objectName);
            foreach (Graphic surface in surfaces)
            {
                Color color = surface.color;
                color.a = opacity;
                surface.color = color;
                EditorUtility.SetDirty(surface);
            }
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            GameObject canvasObject = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas");
            Transform background = canvasObject.transform.Find("HomeBackgroundArt");
            Transform scrim = canvasObject.transform.Find("HomeBackgroundReadabilityScrim");
            RawImage image = background != null ? background.GetComponent<RawImage>() : null;
            if (background == null || image == null || image.texture == null)
                throw new InvalidOperationException("Home background layer is incomplete.");
            if (background.GetSiblingIndex() != 0 || scrim == null || scrim.GetSiblingIndex() != 1)
                throw new InvalidOperationException("Home background layers must remain behind all interactive UI.");
            if (image.raycastTarget || scrim.GetComponent<Image>().raycastTarget)
                throw new InvalidOperationException("Home background layers must not intercept input.");
            if (canvasObject.GetComponentsInChildren<Button>(true).Length < 18)
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
