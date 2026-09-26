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
    public static class TriadBattlePhase5Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase37.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase38.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase4.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase5.unity";

        [MenuItem("TRIAD/Battle/Build Phase 5 Result Flow")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase4Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE5] PASS: winner, replay and home result flow verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase5.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 5 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE5] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase38");
            Transform oldOverlay = canvas.Find("ResultOverlay");
            if (oldOverlay != null) UnityEngine.Object.DestroyImmediate(oldOverlay.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;

            GameObject overlayObject = new GameObject(
                "ResultOverlay", typeof(RectTransform), typeof(CanvasGroup), typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic), typeof(TriadBattleResultOverlay));
            overlayObject.transform.SetParent(canvas, false);
            TopLeft(overlayObject.GetComponent<RectTransform>(), new Vector2(30f, 240f), new Vector2(330f, 330f));
            TriadRoundedRectGraphic panel = overlayObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.012f, .020f, .043f, .985f);
            panel.BorderColor = new Color(1f, .68f, .22f, .95f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 22f;
            CanvasGroup group = overlayObject.GetComponent<CanvasGroup>();
            group.alpha = 0f;
            group.interactable = false;
            group.blocksRaycasts = false;

            Text crest = CreateText(overlayObject.transform, "Crest", "◇  TRIAD  ◇",
                new Vector2(30f, 32f), new Vector2(270f, 42f), 20, font);
            crest.color = new Color(1f, .73f, .32f, 1f);
            Text winner = CreateText(overlayObject.transform, "Winner", "勝者  ヒバナ",
                new Vector2(20f, 88f), new Vector2(290f, 60f), 28, font);
            Text detail = CreateText(overlayObject.transform, "Detail", "五連完成",
                new Vector2(20f, 150f), new Vector2(290f, 38f), 13, font);
            detail.color = new Color(.78f, .84f, .96f, 1f);
            Button replay = CreateButton(overlayObject.transform, "Replay", "再戦",
                new Vector2(24f, 220f), new Vector2(134f, 70f), font, new Color(.68f, .19f, .08f, 1f));
            Button home = CreateButton(overlayObject.transform, "Home", "ホーム",
                new Vector2(172f, 220f), new Vector2(134f, 70f), font, new Color(.08f, .18f, .34f, 1f));
            overlayObject.GetComponent<TriadBattleResultOverlay>().Configure(controller, group, winner, detail, replay, home);
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);

            TriadBattleResultOverlay overlay = canvas.GetComponentInChildren<TriadBattleResultOverlay>(true);
            if (overlay == null || overlay.Controller != controller)
                throw new InvalidOperationException("Result overlay is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase5");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, Color color)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = color;
            panel.BorderColor = new Color(1f, .73f, .34f, .92f);
            panel.BorderWidth = 1.5f;
            panel.CornerRadius = 12f;
            Button button = go.GetComponent<Button>();
            button.targetGraphic = panel;
            CreateText(go.transform, "Label", label, Vector2.zero, size, 19, font);
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
