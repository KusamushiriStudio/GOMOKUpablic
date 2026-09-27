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
    public static class TriadBattlePhase23Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase55.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase56.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase22.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase23.unity";

        [MenuItem("TRIAD/Battle/Build Phase 23 Match History")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase22Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE23] PASS: local recent-match history verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase23.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 23 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE23] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleResultPersistence persistence = safeRoot.GetComponentInChildren<TriadBattleResultPersistence>(true);
            TriadBattleLocalResultSink sink = safeRoot.GetComponentInChildren<TriadBattleLocalResultSink>(true);
            controller.SetHomeSceneName("HomePhase56");
            Transform result = FindDeep(canvas, "ResultOverlay");
            TopLeft(result.GetComponent<RectTransform>(), new Vector2(30f, 192f), new Vector2(330f, 460f));
            Transform saveStatus = result.Find("SaveStatus");
            Transform replay = result.Find("Replay");
            Transform home = result.Find("Home");
            if (saveStatus != null) TopLeft(saveStatus.GetComponent<RectTransform>(), new Vector2(80f, 350f), new Vector2(170f, 22f));
            if (replay != null) TopLeft(replay.GetComponent<RectTransform>(), new Vector2(24f, 382f), new Vector2(134f, 54f));
            if (home != null) TopLeft(home.GetComponent<RectTransform>(), new Vector2(172f, 382f), new Vector2(134f, 54f));
            Transform oldHistory = result.Find("RecentHistory");
            if (oldHistory != null) UnityEngine.Object.DestroyImmediate(oldHistory.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Text history = CreateText(result, "RecentHistory", "直近の対局  ・  履歴なし",
                new Vector2(36f, 272f), new Vector2(258f, 72f), 11, font);
            history.alignment = TextAnchor.UpperLeft;
            history.lineSpacing = 1.15f;
            Transform oldPresenter = safeRoot.Find("HistoryPresenter");
            if (oldPresenter != null) UnityEngine.Object.DestroyImmediate(oldPresenter.gameObject);
            GameObject presenterObject = new GameObject("HistoryPresenter", typeof(TriadBattleHistoryPresenter));
            presenterObject.transform.SetParent(safeRoot, false);
            TriadBattleHistoryPresenter presenter = presenterObject.GetComponent<TriadBattleHistoryPresenter>();
            presenter.Configure(persistence, sink, history);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (presenter.ResultSink != sink)
                throw new InvalidOperationException("Match history presenter is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase23");
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
            text.color = new Color(.76f, .84f, .96f, 1f);
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
