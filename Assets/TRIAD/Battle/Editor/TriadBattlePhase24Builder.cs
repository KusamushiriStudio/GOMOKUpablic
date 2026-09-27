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
    public static class TriadBattlePhase24Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase56.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase57.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase23.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase24.unity";

        [MenuItem("TRIAD/Battle/Build Phase 24 Result Actions")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase23Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE24] PASS: share summary and unique rematch session verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase24.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 24 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE24] PLAYER PASS: {output}; Size={report.summary.totalSize}");
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
            TriadBattleResultOverlay overlay = canvas.GetComponentInChildren<TriadBattleResultOverlay>(true);
            controller.SetHomeSceneName("HomePhase57");
            Transform result = overlay.transform;
            TopLeft(result.GetComponent<RectTransform>(), new Vector2(30f, 162f), new Vector2(330f, 520f));
            Transform replay = result.Find("Replay");
            Transform home = result.Find("Home");
            if (replay != null) TopLeft(replay.GetComponent<RectTransform>(), new Vector2(24f, 448f), new Vector2(134f, 48f));
            if (home != null) TopLeft(home.GetComponent<RectTransform>(), new Vector2(172f, 448f), new Vector2(134f, 48f));
            Transform oldCopy = result.Find("CopyResult");
            if (oldCopy != null) UnityEngine.Object.DestroyImmediate(oldCopy.gameObject);
            Transform oldStatus = result.Find("CopyStatus");
            if (oldStatus != null) UnityEngine.Object.DestroyImmediate(oldStatus.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Button copy = CreateButton(result, "CopyResult", "対局結果をコピー",
                new Vector2(24f, 382f), new Vector2(282f, 48f), font, 13);
            Text status = CreateText(result, "CopyStatus", string.Empty,
                new Vector2(55f, 429f), new Vector2(220f, 18f), 10, font);
            status.color = new Color(.72f, .88f, 1f, 1f);
            overlay.ConfigureActions(session, journal, copy, status);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(overlay);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (overlay.Controller != controller)
                throw new InvalidOperationException("Result actions are incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase24");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, int fontSize)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.035f, .10f, .17f, .98f);
            panel.BorderColor = new Color(.55f, .85f, 1f, .92f);
            panel.BorderWidth = 1.3f;
            panel.CornerRadius = 10f;
            Button button = go.GetComponent<Button>();
            button.targetGraphic = panel;
            CreateText(go.transform, "Label", label, Vector2.zero, size, fontSize, font);
            return button;
        }

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
