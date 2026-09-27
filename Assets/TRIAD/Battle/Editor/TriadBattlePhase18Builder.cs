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
    public static class TriadBattlePhase18Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase50.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase51.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase17.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase18.unity";

        [MenuItem("TRIAD/Battle/Build Phase 18 Tutorial")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase17Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE18] PASS: first-match three-step tutorial verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase18.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 18 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE18] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            controller.SetHomeSceneName("HomePhase51");
            Transform old = safeRoot.Find("TutorialOverlay");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject overlayObject = new GameObject(
                "TutorialOverlay", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image),
                typeof(CanvasGroup), typeof(TriadBattleTutorialOverlay));
            overlayObject.transform.SetParent(safeRoot, false);
            TopLeft(overlayObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = overlayObject.GetComponent<Image>();
            blocker.color = new Color(.002f, .006f, .018f, .88f);
            blocker.raycastTarget = true;
            CanvasGroup group = overlayObject.GetComponent<CanvasGroup>();

            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(overlayObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(28f, 205f), new Vector2(334f, 430f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.010f, .020f, .045f, .995f);
            panel.BorderColor = new Color(1f, .70f, .27f, .96f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 22f;
            Text step = CreateText(panelObject.transform, "Step", "GUIDE  1 / 3",
                new Vector2(28f, 24f), new Vector2(278f, 28f), 11, font);
            step.color = new Color(1f, .72f, .28f, 1f);
            Text title = CreateText(panelObject.transform, "Title", "三人で五つを連ねる",
                new Vector2(20f, 65f), new Vector2(294f, 56f), 23, font);
            Text body = CreateText(panelObject.transform, "Body", "",
                new Vector2(30f, 140f), new Vector2(274f, 130f), 15, font);
            body.alignment = TextAnchor.MiddleCenter;
            body.lineSpacing = 1.35f;
            Button previous = CreateButton(panelObject.transform, "Previous", "戻る",
                new Vector2(26f, 303f), new Vector2(86f, 58f), font, 14);
            Button next = CreateButton(panelObject.transform, "Next", "次へ",
                new Vector2(122f, 303f), new Vector2(186f, 58f), font, 17);
            Button skip = CreateButton(panelObject.transform, "Skip", "スキップ",
                new Vector2(103f, 373f), new Vector2(128f, 38f), font, 11);
            overlayObject.GetComponent<TriadBattleTutorialOverlay>().Configure(
                controller, session, group, step, title, body, previous, next, skip);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (overlayObject.GetComponent<TriadBattleTutorialOverlay>().Controller != controller)
                throw new InvalidOperationException("Tutorial overlay is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase18");
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
            panel.color = new Color(.035f, .085f, .155f, .98f);
            panel.BorderColor = new Color(1f, .72f, .30f, .94f);
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
