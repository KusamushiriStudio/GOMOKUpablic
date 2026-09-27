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
    public static class TriadBattlePhase15Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase47.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase48.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase14.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase15.unity";

        [MenuItem("TRIAD/Battle/Build Phase 15 Transport Boundary")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase14Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE15] PASS: transport boundary without fake endpoint verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase15.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 15 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE15] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            TriadBattleSessionJournal journal = safeRoot.GetComponentInChildren<TriadBattleSessionJournal>(true);
            controller.SetHomeSceneName("HomePhase48");
            Transform old = safeRoot.Find("TransportCoordinator");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            GameObject transportObject = new GameObject("TransportCoordinator", typeof(TriadBattleTransportCoordinator));
            transportObject.transform.SetParent(safeRoot, false);
            TriadBattleTransportCoordinator coordinator = transportObject.GetComponent<TriadBattleTransportCoordinator>();
            coordinator.Configure(session, journal);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (coordinator.SessionContext != session || coordinator.HasConfiguredEndpoint ||
                string.IsNullOrEmpty(coordinator.CreateOutboundSnapshot()))
                throw new InvalidOperationException("Transport boundary is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase15");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }
    }
}
