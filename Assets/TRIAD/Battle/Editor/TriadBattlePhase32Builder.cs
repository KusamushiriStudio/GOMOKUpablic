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
    public static class TriadBattlePhase32Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase64.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase65.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase31.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase32.unity";

        [MenuItem("TRIAD/Battle/Build Phase 32 Completion Summary")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase31Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE32] PASS: completion summary and local data state verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase32.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 32 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE32] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            TriadBattleSessionJournal journal = safeRoot.GetComponentInChildren<TriadBattleSessionJournal>(true);
            TriadBattleResultPersistence persistence = safeRoot.GetComponentInChildren<TriadBattleResultPersistence>(true);
            TriadBattleCheckpointStore checkpoint = safeRoot.GetComponentInChildren<TriadBattleCheckpointStore>(true);
            TriadBattleResultOverlay overlay = canvas.GetComponentInChildren<TriadBattleResultOverlay>(true);
            controller.SetHomeSceneName("HomePhase65");

            Transform result = overlay.transform;
            TopLeft(result.GetComponent<RectTransform>(), new Vector2(30f, 127f), new Vector2(330f, 590f));
            PositionChild(result, "RecentHistory", new Vector2(36f, 335f), new Vector2(258f, 66f));
            PositionChild(result, "SaveStatus", new Vector2(80f, 407f), new Vector2(170f, 22f));
            PositionChild(result, "CopyResult", new Vector2(24f, 438f), new Vector2(282f, 48f));
            PositionChild(result, "CopyStatus", new Vector2(55f, 486f), new Vector2(220f, 18f));
            PositionChild(result, "Replay", new Vector2(24f, 510f), new Vector2(134f, 54f));
            PositionChild(result, "Home", new Vector2(172f, 510f), new Vector2(134f, 54f));

            Transform oldSummary = result.Find("CompletionSummary");
            if (oldSummary != null) UnityEngine.Object.DestroyImmediate(oldSummary.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Text summary = CreateText(result, "CompletionSummary", string.Empty,
                new Vector2(34f, 257f), new Vector2(262f, 70f), 11, font);
            summary.alignment = TextAnchor.MiddleLeft;
            summary.lineSpacing = 1.18f;

            Transform oldPresenter = safeRoot.Find("CompletionSummaryPresenter");
            if (oldPresenter != null) UnityEngine.Object.DestroyImmediate(oldPresenter.gameObject);
            GameObject presenterObject = new("CompletionSummaryPresenter", typeof(TriadBattleCompletionSummary));
            presenterObject.transform.SetParent(safeRoot, false);
            TriadBattleCompletionSummary presenter = presenterObject.GetComponent<TriadBattleCompletionSummary>();
            presenter.Configure(controller, session, journal, persistence, checkpoint, summary);

            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(presenter);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (presenter.Controller != controller)
                throw new InvalidOperationException("Completion summary is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase32");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static void PositionChild(Transform parent, string name, Vector2 position, Vector2 size)
        {
            Transform child = parent.Find(name);
            if (child != null) TopLeft(child.GetComponent<RectTransform>(), position, size);
        }

        private static Text CreateText(Transform parent, string name, string value,
            Vector2 position, Vector2 size, int fontSize, Font font)
        {
            GameObject go = new(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            Text text = go.GetComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = new Color(.80f, .88f, .98f, 1f);
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
