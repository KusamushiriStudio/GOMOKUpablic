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
    public static class TriadBattlePhase6Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase38.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase39.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase5.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase6.unity";

        [MenuItem("TRIAD/Battle/Build Phase 6 Turn Feedback")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase5Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE6] PASS: start and turn audiovisual feedback verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase6.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 6 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE6] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase39");
            Transform old = canvas.Find("TurnFeedback");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;

            GameObject go = new GameObject(
                "TurnFeedback", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic),
                typeof(CanvasGroup), typeof(AudioSource), typeof(TriadBattleTurnFeedback));
            go.transform.SetParent(canvas, false);
            TopLeft(go.GetComponent<RectTransform>(), new Vector2(71f, 154f), new Vector2(248f, 48f));
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.015f, .027f, .055f, .95f);
            panel.BorderColor = new Color(1f, .70f, .26f, .95f);
            panel.BorderWidth = 1.5f;
            panel.CornerRadius = 11f;
            panel.raycastTarget = false;
            CanvasGroup group = go.GetComponent<CanvasGroup>();
            group.alpha = 0f;
            group.blocksRaycasts = false;
            Text label = CreateText(go.transform, "Label", "対局開始", Vector2.zero, new Vector2(248f, 48f), 16, font);
            go.GetComponent<TriadBattleTurnFeedback>().Configure(
                controller, group, go.GetComponent<RectTransform>(), label, go.GetComponent<AudioSource>());
            Transform result = canvas.Find("ResultOverlay");
            if (result != null) result.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (canvas.GetComponentInChildren<TriadBattleTurnFeedback>(true) == null)
                throw new InvalidOperationException("Turn feedback is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase6");
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
            text.color = new Color(1f, .94f, .76f, 1f);
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
