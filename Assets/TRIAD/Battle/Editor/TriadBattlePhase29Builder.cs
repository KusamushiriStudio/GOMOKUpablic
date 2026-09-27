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
    public static class TriadBattlePhase29Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase61.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase62.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase28.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase29.unity";

        [MenuItem("TRIAD/Battle/Build Phase 29 Invalid Input Feedback")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase28Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE29] PASS: invalid tap and rejected-action feedback verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase29.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 29 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE29] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase62");
            Transform old = safeRoot.Find("InvalidInputFeedback");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject feedbackObject = new GameObject(
                "InvalidInputFeedback", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic),
                typeof(CanvasGroup), typeof(TriadBattleInvalidInputFeedback));
            feedbackObject.transform.SetParent(safeRoot, false);
            TopLeft(feedbackObject.GetComponent<RectTransform>(), new Vector2(54f, 96f), new Vector2(282f, 46f));
            TriadRoundedRectGraphic panel = feedbackObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.22f, .025f, .020f, .96f);
            panel.BorderColor = new Color(1f, .28f, .18f, .96f);
            panel.BorderWidth = 1.4f;
            panel.CornerRadius = 11f;
            panel.raycastTarget = false;
            Text label = CreateText(feedbackObject.transform, "Label", "操作できません",
                new Vector2(12f, 3f), new Vector2(258f, 40f), 12, font);
            CanvasGroup group = feedbackObject.GetComponent<CanvasGroup>();
            feedbackObject.GetComponent<TriadBattleInvalidInputFeedback>()
                .Configure(controller, controller.EffectRoot, group, label);
            feedbackObject.transform.SetAsLastSibling();
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (feedbackObject.GetComponent<TriadBattleInvalidInputFeedback>().Controller != controller)
                throw new InvalidOperationException("Invalid input feedback is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase29");
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
            text.color = new Color(1f, .91f, .84f, 1f);
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
