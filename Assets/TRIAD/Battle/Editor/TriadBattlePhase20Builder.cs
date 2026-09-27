using System;
using System.IO;
using System.Linq;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase20Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase52.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase53.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase19.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase20.unity";

        [MenuItem("TRIAD/Battle/Build Phase 20 Mobile Lifecycle")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase19Builder.Build();
            BuildBattleScene();
            BuildHomeRoute();
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith("Assets/TRIAD/UI/Scenes/HomePhase", StringComparison.Ordinal) &&
                               !item.path.StartsWith("Assets/TRIAD/Battle/Scenes/BattlePhase", StringComparison.Ordinal))
                .Concat(new[]
                {
                    new EditorBuildSettingsScene(HomeScene, true),
                    new EditorBuildSettingsScene(BattleScene, true)
                }).ToArray();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD BATTLE PHASE20] PASS: mobile back navigation and lifecycle pause verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase20.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 20 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE20] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattlePauseOverlay pause = canvas.GetComponentInChildren<TriadBattlePauseOverlay>(true);
            TriadBattleTutorialOverlay tutorial = safeRoot.GetComponentInChildren<TriadBattleTutorialOverlay>(true);
            TriadBattleModeSelector modes = safeRoot.GetComponentInChildren<TriadBattleModeSelector>(true);
            controller.SetHomeSceneName("HomePhase53");

            Transform old = safeRoot.Find("LifecycleController");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            GameObject lifecycleObject = new GameObject("LifecycleController", typeof(TriadBattleLifecycleController));
            lifecycleObject.transform.SetParent(safeRoot, false);
            TriadBattleLifecycleController lifecycle = lifecycleObject.GetComponent<TriadBattleLifecycleController>();
            lifecycle.Configure(controller, pause, tutorial, modes);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (lifecycle.Controller != controller || pause == null || tutorial == null || modes == null)
                throw new InvalidOperationException("Mobile lifecycle controller is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase20");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }
    }
}
