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
    public static class TriadBattlePhase22Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase54.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase55.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase21.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase22.unity";

        [MenuItem("TRIAD/Battle/Build Phase 22 Resume Match")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase21Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE22] PASS: interrupted-match replay and resume entry verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase22.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 22 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE22] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleCheckpointStore checkpoint = safeRoot.GetComponentInChildren<TriadBattleCheckpointStore>(true);
            TriadBattleModeSelector selector = safeRoot.GetComponentInChildren<TriadBattleModeSelector>(true);
            controller.SetHomeSceneName("HomePhase55");
            Transform modeOverlay = FindDeep(safeRoot, "ModeSelectionOverlay");
            Transform panel = modeOverlay.Find("Panel");
            TopLeft(panel.GetComponent<RectTransform>(), new Vector2(26f, 139f), new Vector2(338f, 566f));
            Transform oldResume = panel.Find("ResumeCheckpoint");
            if (oldResume != null) UnityEngine.Object.DestroyImmediate(oldResume.gameObject);
            Transform home = panel.Find("Home");
            if (home != null) TopLeft(home.GetComponent<RectTransform>(), new Vector2(78f, 500f), new Vector2(182f, 48f));
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            Button resume = CreateButton(panel, "ResumeCheckpoint", "中断対局なし",
                new Vector2(28f, 418f), new Vector2(282f, 62f), font, 12);
            Text resumeLabel = resume.GetComponentInChildren<Text>(true);
            checkpoint.ConfigureRestore(selector, resume, resumeLabel);
            modeOverlay.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(checkpoint);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (checkpoint.Controller != controller || selector.Controller != controller)
                throw new InvalidOperationException("Resume flow is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase22");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Transform FindDeep(Transform root, string name) =>
            root.GetComponentsInChildren<Transform>(true).First(item => item.name == name);

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, int fontSize)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.16f, .075f, .035f, .98f);
            panel.BorderColor = new Color(1f, .73f, .31f, .96f);
            panel.BorderWidth = 1.4f;
            panel.CornerRadius = 12f;
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
