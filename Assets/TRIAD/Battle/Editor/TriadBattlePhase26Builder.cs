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
    public static class TriadBattlePhase26Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase58.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase59.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase25.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase26.unity";

        [MenuItem("TRIAD/Battle/Build Phase 26 Last Move")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase25Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE26] PASS: last-action board marker verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase26.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 26 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE26] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase59");
            Transform old = safeRoot.Find("LastMoveIndicator");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            GameObject indicatorObject = new GameObject("LastMoveIndicator", typeof(TriadBattleLastMoveIndicator));
            indicatorObject.transform.SetParent(safeRoot, false);
            TriadBattleLastMoveIndicator indicator = indicatorObject.GetComponent<TriadBattleLastMoveIndicator>();
            indicator.Configure(controller, controller.EffectRoot);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (indicator.Controller != controller || controller.EffectRoot == null)
                throw new InvalidOperationException("Last move indicator is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase26");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }
    }
}
