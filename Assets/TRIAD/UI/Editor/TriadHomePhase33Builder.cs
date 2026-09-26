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
    public static class TriadHomePhase33Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase32Scene = Root + "/Scenes/HomePhase32.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase33.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 33 Final Integration")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase32Scene))
                TriadHomePhase32Builder.Build();
            Scene scene = EditorSceneManager.OpenScene(Phase32Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            int repairedRenderers = RepairGraphicRenderers(canvas);
            EnsureScreenshotRunner(canvas);
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) }).ToArray();
            Verify(canvas);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[TRIAD UI PHASE33] PASS: final home integration verified; repaired CanvasRenderers={repairedRenderers}.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase33.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 33 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE33] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static int RepairGraphicRenderers(Transform canvas)
        {
            int repaired = 0;
            foreach (Graphic graphic in canvas.GetComponentsInChildren<Graphic>(true))
            {
                if (graphic.GetComponent<CanvasRenderer>() != null) continue;
                graphic.gameObject.AddComponent<CanvasRenderer>();
                EditorUtility.SetDirty(graphic.gameObject);
                repaired++;
            }
            return repaired;
        }

        private static void EnsureScreenshotRunner(Transform canvas)
        {
            if (canvas.GetComponentInChildren<TriadHomeScreenshotRunner>(true) != null) return;
            canvas.gameObject.AddComponent<TriadHomeScreenshotRunner>();
            EditorUtility.SetDirty(canvas.gameObject);
        }

        private static void Verify(Transform canvas)
        {
            Canvas rootCanvas = canvas.GetComponent<Canvas>();
            CanvasScaler scaler = canvas.GetComponent<CanvasScaler>();
            if (rootCanvas == null || scaler == null || scaler.referenceResolution != new Vector2(390f, 844f))
                throw new InvalidOperationException("Final canvas must preserve the 390 x 844 reference layout.");
            if (canvas.GetComponentsInChildren<Graphic>(true).Any(item => item.GetComponent<CanvasRenderer>() == null))
                throw new InvalidOperationException("Every uGUI graphic must have a CanvasRenderer.");
            if (canvas.GetComponentsInChildren<TriadSculptedButtonFeedback>(true).Length != 6)
                throw new InvalidOperationException("Six sculpted button feedback components are required.");
            if (canvas.GetComponentInChildren<TriadScrollCue>(true) == null)
                throw new InvalidOperationException("Scroll guidance is missing.");
            if (canvas.GetComponentInChildren<TriadRouteTransitionIndicator>(true) == null)
                throw new InvalidOperationException("Route transition feedback is missing.");
            if (canvas.GetComponentsInChildren<TriadPetalDrift>(true).Length != 12)
                throw new InvalidOperationException("Twelve layered petals are required.");
            if (canvas.GetComponentsInChildren<Button>(true).Length < 15)
                throw new InvalidOperationException("Existing home controls were lost.");
            if (canvas.GetComponentsInChildren<TriadHomeScreenshotRunner>(true).Length != 1)
                throw new InvalidOperationException("Final player screenshot runner is missing.");
            if (canvas.GetComponentsInChildren<TriadHomeScreenController>(true).Length != 1)
                throw new InvalidOperationException("Final home controller count is invalid.");
        }
    }
}
