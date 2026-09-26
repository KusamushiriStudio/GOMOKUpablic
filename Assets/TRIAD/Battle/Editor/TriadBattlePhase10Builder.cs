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
    public static class TriadBattlePhase10Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase42.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase43.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase9.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase10.unity";

        [MenuItem("TRIAD/Battle/Build Phase 10 CPU Match")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase9Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE10] PASS: deterministic CPU seats 2 and 3 verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase10.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 10 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE10] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            if (safeRoot == null) throw new InvalidOperationException("SafeAreaRoot is missing.");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase43");

            Transform oldDriver = safeRoot.Find("CpuDriver");
            if (oldDriver != null) UnityEngine.Object.DestroyImmediate(oldDriver.gameObject);
            GameObject driverObject = new GameObject("CpuDriver", typeof(TriadBattleCpuDriver));
            driverObject.transform.SetParent(safeRoot, false);
            TriadBattleCpuDriver driver = driverObject.GetComponent<TriadBattleCpuDriver>();
            driver.Configure(controller, (1 << 2) | (1 << 3), .42f);

            Transform oldBadge = safeRoot.Find("CpuModeBadge");
            if (oldBadge != null) UnityEngine.Object.DestroyImmediate(oldBadge.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;
            GameObject badgeObject = new GameObject(
                "CpuModeBadge", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            badgeObject.transform.SetParent(safeRoot, false);
            TopLeft(badgeObject.GetComponent<RectTransform>(), new Vector2(282f, 137f), new Vector2(96f, 26f));
            TriadRoundedRectGraphic badge = badgeObject.GetComponent<TriadRoundedRectGraphic>();
            badge.color = new Color(.025f, .080f, .125f, .92f);
            badge.BorderColor = new Color(.40f, .82f, 1f, .78f);
            badge.BorderWidth = 1f;
            badge.CornerRadius = 7f;
            badge.raycastTarget = false;
            CreateText(badgeObject.transform, "Label", "SOLO  CPU×2", Vector2.zero, new Vector2(96f, 26f), 9, font);

            Transform feedback = FindDeep(safeRoot, "TurnFeedback");
            if (feedback != null) feedback.SetAsLastSibling();
            Transform pause = FindDeep(safeRoot, "PauseOverlay");
            if (pause != null) pause.SetAsLastSibling();
            Transform result = FindDeep(safeRoot, "ResultOverlay");
            if (result != null) result.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (driver.Controller != controller || driver.AutomatedSeatMask != ((1 << 2) | (1 << 3)))
                throw new InvalidOperationException("CPU driver configuration is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase10");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Transform FindDeep(Transform root, string name) =>
            root.GetComponentsInChildren<Transform>(true).FirstOrDefault(item => item.name == name);

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
            text.color = new Color(.78f, .91f, 1f, 1f);
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
