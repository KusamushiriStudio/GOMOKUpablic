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
    public static class TriadBattlePhase30Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase62.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase63.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase29.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase30.unity";

        [MenuItem("TRIAD/Battle/Build Phase 30 Match Confirmation")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase29Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE30] PASS: selected-mode and rules confirmation verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase30.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 30 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE30] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleModeSelector selector = safeRoot.GetComponentInChildren<TriadBattleModeSelector>(true);
            controller.SetHomeSceneName("HomePhase63");
            Transform modeRoot = selector.transform;
            Transform old = modeRoot.Find("StartConfirmation");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject confirmationObject = new GameObject(
                "StartConfirmation", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(CanvasGroup));
            confirmationObject.transform.SetParent(modeRoot, false);
            TopLeft(confirmationObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = confirmationObject.GetComponent<Image>();
            blocker.color = new Color(.001f, .004f, .014f, .91f);
            blocker.raycastTarget = true;
            CanvasGroup group = confirmationObject.GetComponent<CanvasGroup>();
            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(confirmationObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(34f, 214f), new Vector2(322f, 410f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.012f, .024f, .050f, .995f);
            panel.BorderColor = new Color(1f, .70f, .27f, .98f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 22f;
            CreateText(panelObject.transform, "Guide", "対局内容の確認",
                new Vector2(28f, 24f), new Vector2(266f, 32f), 12, font).color = new Color(1f, .70f, .28f, 1f);
            Text title = CreateText(panelObject.transform, "ModeTitle", "一人で対戦",
                new Vector2(24f, 68f), new Vector2(274f, 52f), 24, font);
            Text detail = CreateText(panelObject.transform, "ModeDetail", string.Empty,
                new Vector2(34f, 136f), new Vector2(254f, 126f), 15, font);
            detail.lineSpacing = 1.35f;
            Button confirm = CreateButton(panelObject.transform, "Confirm", "この内容で開始",
                new Vector2(34f, 282f), new Vector2(254f, 58f), font, 16, new Color(.34f, .095f, .035f, 1f));
            Button cancel = CreateButton(panelObject.transform, "Cancel", "選び直す",
                new Vector2(86f, 350f), new Vector2(150f, 38f), font, 11, new Color(.025f, .075f, .14f, 1f));
            selector.ConfigureConfirmation(group, title, detail, confirm, cancel);
            confirmationObject.transform.SetAsLastSibling();
            modeRoot.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(selector);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (selector.Controller != controller)
                throw new InvalidOperationException("Match confirmation is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase30");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateButton(Transform parent, string name, string label, Vector2 position,
            Vector2 size, Font font, int fontSize, Color color)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = color;
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
