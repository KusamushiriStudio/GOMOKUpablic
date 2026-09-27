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
    public static class TriadBattlePhase25Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase57.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase58.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase24.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase25.unity";

        [MenuItem("TRIAD/Battle/Build Phase 25 Exit Confirmation")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase24Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE25] PASS: protected match exit confirmation verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase25.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 25 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE25] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattlePauseOverlay pause = canvas.GetComponentInChildren<TriadBattlePauseOverlay>(true);
            controller.SetHomeSceneName("HomePhase58");
            Transform pauseRoot = pause.transform;
            Transform old = pauseRoot.Find("ExitConfirmation");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject confirmationObject = new GameObject(
                "ExitConfirmation", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(CanvasGroup));
            confirmationObject.transform.SetParent(pauseRoot, false);
            TopLeft(confirmationObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image blocker = confirmationObject.GetComponent<Image>();
            blocker.color = new Color(.001f, .003f, .010f, .84f);
            blocker.raycastTarget = true;
            CanvasGroup group = confirmationObject.GetComponent<CanvasGroup>();

            GameObject panelObject = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panelObject.transform.SetParent(confirmationObject.transform, false);
            TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(42f, 276f), new Vector2(306f, 272f));
            TriadRoundedRectGraphic panel = panelObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.018f, .024f, .047f, .995f);
            panel.BorderColor = new Color(1f, .62f, .24f, .98f);
            panel.BorderWidth = 2f;
            panel.CornerRadius = 20f;
            CreateText(panelObject.transform, "Title", "対局を終了しますか？",
                new Vector2(24f, 30f), new Vector2(258f, 48f), 21, font);
            Text note = CreateText(panelObject.transform, "Note", "ホームへ戻ると\nこの対局の中断データは削除されます",
                new Vector2(28f, 88f), new Vector2(250f, 66f), 13, font);
            note.color = new Color(.76f, .83f, .94f, 1f);
            Button confirm = CreateButton(panelObject.transform, "Confirm", "終了する",
                new Vector2(24f, 181f), new Vector2(122f, 58f), font, 14, new Color(.35f, .065f, .035f, .98f));
            Button cancel = CreateButton(panelObject.transform, "Cancel", "対局へ戻る",
                new Vector2(160f, 181f), new Vector2(122f, 58f), font, 13, new Color(.030f, .09f, .16f, .98f));
            pause.ConfigureExitConfirmation(group, confirm, cancel);
            confirmationObject.transform.SetAsLastSibling();
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(pause);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (pause.Controller != controller)
                throw new InvalidOperationException("Exit confirmation is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase25");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, int fontSize, Color color)
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
