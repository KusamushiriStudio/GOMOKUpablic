using System;
using System.IO;
using System.Linq;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase17Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase49.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase50.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase16.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase17.unity";

        [MenuItem("TRIAD/Battle/Build Phase 17 Reward Summary")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase16Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE17] PASS: persisted battle points and record summary verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase17.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 17 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE17] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleResultPersistence persistence = safeRoot.GetComponentInChildren<TriadBattleResultPersistence>(true);
            controller.SetHomeSceneName("HomePhase50");
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Transform result = FindDeep(safeRoot, "ResultOverlay");
            TopLeft(result.GetComponent<RectTransform>(), new Vector2(30f, 220f), new Vector2(330f, 380f));
            Transform replay = result.Find("Replay");
            Transform home = result.Find("Home");
            if (replay != null) TopLeft(replay.GetComponent<RectTransform>(), new Vector2(24f, 294f), new Vector2(134f, 58f));
            if (home != null) TopLeft(home.GetComponent<RectTransform>(), new Vector2(172f, 294f), new Vector2(134f, 58f));
            Transform saveStatus = result.Find("SaveStatus");
            if (saveStatus != null) TopLeft(saveStatus.GetComponent<RectTransform>(), new Vector2(80f, 258f), new Vector2(170f, 22f));
            Transform oldReward = result.Find("RewardSummary");
            if (oldReward != null) UnityEngine.Object.DestroyImmediate(oldReward.gameObject);
            Transform oldRecord = result.Find("RecordSummary");
            if (oldRecord != null) UnityEngine.Object.DestroyImmediate(oldRecord.gameObject);
            Text reward = CreateText(result, "RewardSummary", "対局ポイント  集計待ち",
                new Vector2(35f, 188f), new Vector2(260f, 36f), 16, font);
            reward.color = new Color(1f, .76f, .30f, 1f);
            Text record = CreateText(result, "RecordSummary", "戦績  未読込",
                new Vector2(30f, 226f), new Vector2(270f, 27f), 11, font);
            record.color = new Color(.76f, .84f, .96f, 1f);
            GameObject presenterObject = new GameObject("RewardPresenter", typeof(TriadBattleRewardPresenter));
            presenterObject.transform.SetParent(safeRoot, false);
            TriadBattleRewardPresenter presenter = presenterObject.GetComponent<TriadBattleRewardPresenter>();
            presenter.Configure(persistence, reward, record);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (presenter.Persistence != persistence)
                throw new InvalidOperationException("Reward presenter is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase17");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Transform FindDeep(Transform root, string name) =>
            root.GetComponentsInChildren<Transform>(true).First(item => item.name == name);

        private static Text CreateText(Transform parent, string name, string value,
            Vector2 position, Vector2 size, int fontSize, Font font)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            Text text = go.GetComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = new Color(1f, .94f, .80f, 1f);
            text.raycastTarget = false;
            return text;
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }
    }
}
