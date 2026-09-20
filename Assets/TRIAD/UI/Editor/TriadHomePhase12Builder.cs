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
    public static class TriadHomePhase12Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase11Scene = Root + "/Scenes/HomePhase11.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase12.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 12 Hero Gold Ornament")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase11Scene))
                TriadHomePhase11Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase11Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();

            CreateOrnament(hero.transform, "HeroGoldOrnamentGlow", new Color(0.96f, 0.72f, 0.22f, 0.13f), 5.5f, 34f, 5f);
            CreateOrnament(hero.transform, "HeroGoldOrnament", new Color(0.95f, 0.84f, 0.50f, 0.92f), 1.25f, 31f, 6f);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE12] PASS: Hero gold ornament and glow layers verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase12.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 12 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE12] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void CreateOrnament(Transform parent, string name, Color color, float stroke, float corner, float inset)
        {
            GameObject layer = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadGoldOrnamentGraphic));
            layer.transform.SetParent(parent, false);
            Fill(layer.GetComponent<RectTransform>());
            TriadGoldOrnamentGraphic ornament = layer.GetComponent<TriadGoldOrnamentGraphic>();
            ornament.color = color;
            ornament.StrokeWidth = stroke;
            ornament.CornerLength = corner;
            ornament.Inset = inset;
            ornament.raycastTarget = false;
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            TriadGoldOrnamentGraphic[] ornaments = hero.GetComponentsInChildren<TriadGoldOrnamentGraphic>(true);
            if (ornaments.Length != 2)
                throw new InvalidOperationException("Hero card must contain exactly two gold ornament layers.");
            if (ornaments.Any(item => item.raycastTarget))
                throw new InvalidOperationException("Gold ornaments must not intercept input.");
            if (hero.transform.Find("HeroPortrait/HibanaCharacterPose/HibanaCharacterArt") == null)
                throw new InvalidOperationException("Hibana character layer was lost.");
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
