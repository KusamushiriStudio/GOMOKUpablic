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
    public static class TriadBattlePhase28Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase60.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase61.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase27.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase28.unity";

        [MenuItem("TRIAD/Battle/Build Phase 28 Full Log")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase27Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE28] PASS: full local action log overlay verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase28.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 28 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE28] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase61");
            Transform oldButton = safeRoot.Find("OpenBattleLog");
            if (oldButton != null) UnityEngine.Object.DestroyImmediate(oldButton.gameObject);
            Transform oldOverlay = safeRoot.Find("BattleLogOverlay");
            if (oldOverlay != null) UnityEngine.Object.DestroyImmediate(oldOverlay.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Button open = CreateButton(safeRoot, "OpenBattleLog", "全履歴",
                new Vector2(320f, 310f), new Vector2(58f, 34f), font, 9);

            GameObject overlayObject = new GameObject(
                "BattleLogOverlay", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image),
                typeof(CanvasGroup), typeof(TriadBattleLogOverlay));
            overlayObject.transform.SetParent(safeRoot, false);
            TopLeft(overlayObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = overlayObject.GetComponent<Image>();
            blocker.color = new Color(.002f, .005f, .015f, .88f);
            blocker.raycastTarget = true;
            CanvasGroup group = overlayObject.GetComponent<CanvasGroup>();

            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(overlayObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(28f, 126f), new Vector2(334f, 590f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.010f, .020f, .043f, .995f);
            panel.BorderColor = new Color(1f, .70f, .27f, .96f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 20f;
            CreateText(panelObject.transform, "Title", "対局ログ",
                new Vector2(24f, 22f), new Vector2(286f, 46f), 23, font);
            Text note = CreateText(panelObject.transform, "Note", "新しい手が下に表示されます",
                new Vector2(30f, 66f), new Vector2(274f, 24f), 10, font);
            note.color = new Color(.72f, .82f, .94f, 1f);
            Text log = CreateText(panelObject.transform, "Log", "まだ着手はありません",
                new Vector2(28f, 104f), new Vector2(278f, 398f), 12, font);
            log.alignment = TextAnchor.UpperLeft;
            log.lineSpacing = 1.3f;
            log.horizontalOverflow = HorizontalWrapMode.Wrap;
            log.verticalOverflow = VerticalWrapMode.Truncate;
            Button close = CreateButton(panelObject.transform, "Close", "盤面へ戻る",
                new Vector2(76f, 518f), new Vector2(182f, 48f), font, 13);
            overlayObject.GetComponent<TriadBattleLogOverlay>().Configure(controller, group, log, open, close, 30);
            overlayObject.transform.SetAsLastSibling();
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (overlayObject.GetComponent<TriadBattleLogOverlay>().Controller != controller)
                throw new InvalidOperationException("Battle log overlay is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase28");
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
            panel.color = new Color(.025f, .075f, .14f, .98f);
            panel.BorderColor = new Color(1f, .72f, .30f, .94f);
            panel.BorderWidth = 1.3f;
            panel.CornerRadius = 9f;
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
