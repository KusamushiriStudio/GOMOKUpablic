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
    public static class TriadBattlePhase8Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase40.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase41.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase7.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase8.unity";

        [MenuItem("TRIAD/Battle/Build Phase 8 Pause Menu")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase7Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE8] PASS: pause, rule guide, restart and home flow verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase8.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 8 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE8] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase41");
            Transform oldMenu = canvas.Find("PauseMenuButton");
            if (oldMenu != null) UnityEngine.Object.DestroyImmediate(oldMenu.gameObject);
            Transform oldOverlay = canvas.Find("PauseOverlay");
            if (oldOverlay != null) UnityEngine.Object.DestroyImmediate(oldOverlay.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;

            Button menu = CreateButton(canvas, "PauseMenuButton", "≡", new Vector2(337f, 92f), new Vector2(40f, 40f), font, 20);

            GameObject overlayObject = new GameObject(
                "PauseOverlay", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image),
                typeof(CanvasGroup), typeof(TriadBattlePauseOverlay));
            overlayObject.transform.SetParent(canvas, false);
            TopLeft(overlayObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = overlayObject.GetComponent<Image>();
            blocker.color = new Color(.002f, .005f, .014f, .78f);
            blocker.raycastTarget = true;
            CanvasGroup group = overlayObject.GetComponent<CanvasGroup>();
            group.alpha = 0f;
            group.interactable = false;
            group.blocksRaycasts = false;

            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(overlayObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(30f, 174f), new Vector2(330f, 492f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.010f, .020f, .043f, .99f);
            panel.BorderColor = new Color(1f, .70f, .27f, .96f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 20f;
            CreateText(panelObject.transform, "Title", "対局メニュー", new Vector2(20f, 24f), new Vector2(290f, 50f), 24, font);
            Text rules = CreateText(panelObject.transform, "Rules",
                "勝利条件\n三者が順番に一手ずつ置き\n先に五つを連ねた者が勝利\n\nスキル\n気力を消費して盤面へ干渉\n守護と凍結の状態は盤面に表示",
                new Vector2(34f, 92f), new Vector2(262f, 200f), 14, font);
            rules.alignment = TextAnchor.UpperCenter;
            rules.lineSpacing = 1.3f;
            Button resume = CreateButton(panelObject.transform, "Resume", "対局へ戻る",
                new Vector2(34f, 304f), new Vector2(262f, 54f), font, 17);
            Button restart = CreateButton(panelObject.transform, "Restart", "最初から再戦",
                new Vector2(34f, 368f), new Vector2(126f, 54f), font, 14);
            Button home = CreateButton(panelObject.transform, "Home", "ホームへ",
                new Vector2(170f, 368f), new Vector2(126f, 54f), font, 14);
            overlayObject.GetComponent<TriadBattlePauseOverlay>().Configure(controller, group, menu, resume, restart, home);

            Transform result = canvas.Find("ResultOverlay");
            if (result != null) result.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            TriadBattlePauseOverlay pause = canvas.GetComponentInChildren<TriadBattlePauseOverlay>(true);
            if (pause == null || pause.Controller != controller)
                throw new InvalidOperationException("Pause overlay is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase8");
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
            panel.color = new Color(.030f, .075f, .145f, .98f);
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
