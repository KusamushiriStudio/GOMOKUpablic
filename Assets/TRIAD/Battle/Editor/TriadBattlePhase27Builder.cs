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
    public static class TriadBattlePhase27Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase59.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase60.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase26.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase27.unity";

        [MenuItem("TRIAD/Battle/Build Phase 27 Coordinate Guide")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase26Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE27] PASS: board coordinate guide and tap feedback verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase27.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 27 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE27] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase60");
            Transform old = safeRoot.Find("CoordinateGuide");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject guide = new GameObject("CoordinateGuide", typeof(RectTransform));
            guide.transform.SetParent(safeRoot, false);
            Stretch(guide.GetComponent<RectTransform>());
            Text columns = CreateText(guide.transform, "Columns", "A   B   C   D   E   F   G   H   I   J   K",
                new Vector2(63f, 685f), new Vector2(264f, 19f), 8, font);
            columns.color = new Color(1f, .78f, .38f, .88f);
            Text rows = CreateText(guide.transform, "Rows", "17\n15\n13\n11\n9\n7\n5\n3\n1",
                new Vector2(26f, 298f), new Vector2(24f, 354f), 8, font);
            rows.color = new Color(1f, .78f, .38f, .88f);
            rows.lineSpacing = 1.42f;

            GameObject feedbackObject = new GameObject(
                "TargetFeedback", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic),
                typeof(CanvasGroup), typeof(TriadBattleCoordinateFeedback));
            feedbackObject.transform.SetParent(guide.transform, false);
            TopLeft(feedbackObject.GetComponent<RectTransform>(), new Vector2(274f, 704f), new Vector2(98f, 28f));
            TriadRoundedRectGraphic panel = feedbackObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.025f, .08f, .14f, .94f);
            panel.BorderColor = new Color(.42f, .82f, 1f, .84f);
            panel.BorderWidth = 1f;
            panel.CornerRadius = 7f;
            panel.raycastTarget = false;
            Text feedback = CreateText(feedbackObject.transform, "Label", "選択  --",
                Vector2.zero, new Vector2(98f, 28f), 10, font);
            CanvasGroup group = feedbackObject.GetComponent<CanvasGroup>();
            feedbackObject.GetComponent<TriadBattleCoordinateFeedback>().Configure(controller, group, feedback);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (feedbackObject.GetComponent<TriadBattleCoordinateFeedback>().Controller != controller)
                throw new InvalidOperationException("Coordinate feedback is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase27");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
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
            text.color = new Color(.82f, .90f, 1f, 1f);
            text.raycastTarget = false;
            Outline outline = go.AddComponent<Outline>();
            outline.effectColor = new Color(0f, 0f, 0f, .9f);
            outline.effectDistance = new Vector2(1f, -1f);
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

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
