using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase9Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase41.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase42.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase8.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase9.unity";

        [MenuItem("TRIAD/Battle/Build Phase 9 Integration")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase8Builder.Build();
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
            ValidateDeterministicMatch();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD BATTLE PHASE9] PASS: safe-area hierarchy and integration contracts verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase9.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 9 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE9] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase42");
            Transform existing = canvas.Find("SafeAreaRoot");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);

            GameObject safeObject = new GameObject("SafeAreaRoot", typeof(RectTransform), typeof(TriadBattleSafeAreaFitter));
            safeObject.transform.SetParent(canvas, false);
            RectTransform safeRect = safeObject.GetComponent<RectTransform>();
            safeRect.anchorMin = Vector2.zero;
            safeRect.anchorMax = Vector2.one;
            safeRect.offsetMin = Vector2.zero;
            safeRect.offsetMax = Vector2.zero;

            var children = new List<Transform>();
            for (int index = 0; index < canvas.childCount; index++)
            {
                Transform child = canvas.GetChild(index);
                if (child != safeObject.transform) children.Add(child);
            }
            foreach (Transform child in children) child.SetParent(safeObject.transform, false);
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            ValidateScene(scene, safeObject.transform, controller);
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase9");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static void ValidateScene(Scene scene, Transform safeRoot, TriadBattleBoardController controller)
        {
            if (controller == null || safeRoot == null || safeRoot.GetComponent<TriadBattleSafeAreaFitter>() == null)
                throw new InvalidOperationException("Battle safe-area contract is incomplete.");
            if (safeRoot.GetComponentInChildren<TriadBattleSkillBar>(true) == null ||
                safeRoot.GetComponentInChildren<TriadBattleSeatHud>(true) == null ||
                safeRoot.GetComponentInChildren<TriadBattleResultOverlay>(true) == null ||
                safeRoot.GetComponentInChildren<TriadBattlePauseOverlay>(true) == null ||
                safeRoot.GetComponentInChildren<TriadBattleActionHistory>(true) == null)
                throw new InvalidOperationException("Battle integration component is missing.");
            int missingScripts = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Transform>(true))
                .Sum(item => GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(item.gameObject));
            if (missingScripts != 0) throw new InvalidOperationException($"Missing scripts found: {missingScripts}");
        }

        private static void ValidateDeterministicMatch()
        {
            MatchState state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            for (int column = 0; column < 5; column++)
            {
                state = ApplyPlace(state, new BoardCoordinate(column, 0));
                if (column == 4) break;
                state = ApplyPlace(state, new BoardCoordinate(column, 2));
                state = ApplyPlace(state, new BoardCoordinate(column, 4));
            }
            if (!state.IsFinished || state.WinnerSeat != 1)
                throw new InvalidOperationException("Deterministic three-seat win contract failed.");
        }

        private static MatchState ApplyPlace(MatchState state, BoardCoordinate coordinate)
        {
            ActionResult result = RuleEngine.Apply(state, MatchAction.Place(state.TurnSeat, coordinate));
            if (!result.Success) throw new InvalidOperationException("Integration placement failed: " + result.Error);
            return result.State;
        }
    }
}
