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
    public static class TriadBattlePhase12Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase44.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase45.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase11.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase12.unity";

        [MenuItem("TRIAD/Battle/Build Phase 12 Session Boundary")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase11Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE12] PASS: battle session boundary verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase12.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 12 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE12] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase45");
            Transform old = safeRoot.Find("SessionContext");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            GameObject sessionObject = new GameObject("SessionContext", typeof(TriadBattleSessionContext));
            sessionObject.transform.SetParent(safeRoot, false);
            TriadBattleSessionContext session = sessionObject.GetComponent<TriadBattleSessionContext>();
            TriadBattleModeSelector selector = safeRoot.GetComponentInChildren<TriadBattleModeSelector>(true);
            selector.SetSessionContext(session);
            EditorUtility.SetDirty(selector);
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (selector.Controller != controller || session.Mode != TriadBattleSessionMode.None)
                throw new InvalidOperationException("Session boundary is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase12");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }
    }
}
