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
    public static class TriadBattlePhase11Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase43.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase44.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase10.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase11.unity";

        [MenuItem("TRIAD/Battle/Build Phase 11 Mode Selection")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase10Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE11] PASS: solo and three-player local mode selection verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase11.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 11 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE11] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            if (safeRoot == null) throw new InvalidOperationException("SafeAreaRoot is missing.");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleCpuDriver cpuDriver = safeRoot.GetComponentInChildren<TriadBattleCpuDriver>(true);
            controller.SetHomeSceneName("HomePhase44");
            Transform old = safeRoot.Find("ModeSelectionOverlay");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Transform badge = safeRoot.Find("CpuModeBadge");
            Text badgeLabel = badge != null ? badge.GetComponentInChildren<Text>(true) : null;

            GameObject overlayObject = new GameObject(
                "ModeSelectionOverlay", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image),
                typeof(CanvasGroup), typeof(TriadBattleModeSelector));
            overlayObject.transform.SetParent(safeRoot, false);
            TopLeft(overlayObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = overlayObject.GetComponent<Image>();
            blocker.color = new Color(.002f, .006f, .018f, .88f);
            blocker.raycastTarget = true;
            CanvasGroup group = overlayObject.GetComponent<CanvasGroup>();

            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(overlayObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(26f, 166f), new Vector2(338f, 510f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.010f, .020f, .045f, .995f);
            panel.BorderColor = new Color(1f, .70f, .26f, .98f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 22f;
            CreateText(panelObject.transform, "Mark", "◇  TRIAD  ◇",
                new Vector2(34f, 27f), new Vector2(270f, 34f), 16, font);
            CreateText(panelObject.transform, "Title", "対局形式を選択",
                new Vector2(24f, 72f), new Vector2(290f, 54f), 25, font);
            Text note = CreateText(panelObject.transform, "Note", "選択後すぐに対局を開始します",
                new Vector2(24f, 128f), new Vector2(290f, 32f), 11, font);
            note.color = new Color(.74f, .82f, .94f, 1f);
            Button solo = CreateChoice(panelObject.transform, "Solo", "一人で対戦", "あなた  VS  CPU  VS  CPU",
                new Vector2(28f, 184f), new Vector2(282f, 100f), font, new Color(.34f, .095f, .045f, 1f));
            Button local = CreateChoice(panelObject.transform, "Local", "三人ローカル", "一台を順番に操作",
                new Vector2(28f, 300f), new Vector2(282f, 100f), font, new Color(.035f, .12f, .22f, 1f));
            Button home = CreateButton(panelObject.transform, "Home", "ホームへ戻る",
                new Vector2(78f, 430f), new Vector2(182f, 48f), font, 13);
            overlayObject.GetComponent<TriadBattleModeSelector>().Configure(
                controller, cpuDriver, group, badgeLabel, solo, local, home);
            overlayObject.transform.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            TriadBattleModeSelector selector = safeRoot.GetComponentInChildren<TriadBattleModeSelector>(true);
            if (selector == null || selector.Controller != controller || cpuDriver == null)
                throw new InvalidOperationException("Mode selection is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase11");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateChoice(Transform parent, string name, string title, string detail,
            Vector2 position, Vector2 size, Font font, Color color)
        {
            Button button = CreateButton(parent, name, string.Empty, position, size, font, 1);
            TriadRoundedRectGraphic panel = button.GetComponent<TriadRoundedRectGraphic>();
            panel.color = color;
            CreateText(button.transform, "Title", title, new Vector2(12f, 13f), new Vector2(size.x - 24f, 42f), 21, font);
            Text detailLabel = CreateText(button.transform, "Detail", detail,
                new Vector2(12f, 58f), new Vector2(size.x - 24f, 25f), 11, font);
            detailLabel.color = new Color(.80f, .86f, .96f, 1f);
            return button;
        }

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, int fontSize)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.03f, .07f, .14f, .98f);
            panel.BorderColor = new Color(1f, .73f, .31f, .96f);
            panel.BorderWidth = 1.4f;
            panel.CornerRadius = 12f;
            Button button = go.GetComponent<Button>();
            button.targetGraphic = panel;
            if (!string.IsNullOrEmpty(label)) CreateText(go.transform, "Label", label, Vector2.zero, size, fontSize, font);
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
            text.color = new Color(1f, .94f, .79f, 1f);
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
