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
    public static class TriadBattlePhase19Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase51.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase52.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase18.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase19.unity";

        [MenuItem("TRIAD/Battle/Build Phase 19 Accessibility")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase18Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE19] PASS: audio and reduced-motion preferences verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase19.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 19 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE19] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase52");
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            TriadBattleSessionJournal journal = safeRoot.GetComponentInChildren<TriadBattleSessionJournal>(true);
            Transform oldTransport = FindOptional(safeRoot, "TransportCoordinator");
            if (oldTransport != null) UnityEngine.Object.DestroyImmediate(oldTransport.gameObject);
            GameObject transportObject = new GameObject("TransportCoordinator", typeof(TriadBattleTransportCoordinator));
            transportObject.transform.SetParent(safeRoot, false);
            TriadBattleTransportCoordinator transport = transportObject.GetComponent<TriadBattleTransportCoordinator>();
            transport.Configure(session, journal);
            Transform pauseOverlay = FindDeep(canvas, "PauseOverlay");
            Transform panel = pauseOverlay.Find("Panel");
            TopLeft(panel.GetComponent<RectTransform>(), new Vector2(30f, 142f), new Vector2(330f, 560f));
            Transform oldSettings = panel.Find("AccessibilitySettings");
            if (oldSettings != null) UnityEngine.Object.DestroyImmediate(oldSettings.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject settingsObject = new GameObject(
                "AccessibilitySettings", typeof(RectTransform), typeof(TriadBattleAccessibilitySettings));
            settingsObject.transform.SetParent(panel, false);
            RectTransform settingsRect = settingsObject.GetComponent<RectTransform>();
            settingsRect.anchorMin = Vector2.zero;
            settingsRect.anchorMax = Vector2.one;
            settingsRect.offsetMin = Vector2.zero;
            settingsRect.offsetMax = Vector2.zero;
            Button audio = CreateButton(settingsObject.transform, "Audio", "音声：ON",
                new Vector2(34f, 435f), new Vector2(126f, 52f), font, 13);
            Button motion = CreateButton(settingsObject.transform, "ReducedMotion", "演出軽減：OFF",
                new Vector2(170f, 435f), new Vector2(126f, 52f), font, 12);
            Text audioLabel = audio.GetComponentInChildren<Text>(true);
            Text motionLabel = motion.GetComponentInChildren<Text>(true);
            settingsObject.GetComponent<TriadBattleAccessibilitySettings>()
                .Configure(audio, audioLabel, motion, motionLabel);

            Transform mode = FindOptional(canvas, "ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (settingsObject.GetComponent<TriadBattleAccessibilitySettings>() == null ||
                transport.SessionContext != session)
                throw new InvalidOperationException("Accessibility settings are incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase19");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Transform FindDeep(Transform root, string name) =>
            root.GetComponentsInChildren<Transform>(true).First(item => item.name == name);

        private static Transform FindOptional(Transform root, string name) =>
            root.GetComponentsInChildren<Transform>(true).FirstOrDefault(item => item.name == name);

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
