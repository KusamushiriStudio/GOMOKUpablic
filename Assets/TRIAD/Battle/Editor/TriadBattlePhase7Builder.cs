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
    public static class TriadBattlePhase7Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase39.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase40.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase6.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase7.unity";

        [MenuItem("TRIAD/Battle/Build Phase 7 Action History")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase6Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE7] PASS: three-entry move and skill history verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase7.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 7 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE7] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase40");
            Transform old = canvas.Find("ActionHistory");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;

            GameObject go = new GameObject(
                "ActionHistory", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic),
                typeof(TriadBattleActionHistory));
            go.transform.SetParent(canvas, false);
            TopLeft(go.GetComponent<RectTransform>(), new Vector2(218f, 214f), new Vector2(160f, 92f));
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.008f, .016f, .034f, .86f);
            panel.BorderColor = new Color(.56f, .66f, .82f, .62f);
            panel.BorderWidth = 1f;
            panel.CornerRadius = 8f;
            panel.raycastTarget = false;
            Text title = CreateText(go.transform, "Title", "対局記録", new Vector2(8f, 5f), new Vector2(144f, 22f), 10, font);
            title.color = new Color(1f, .75f, .32f, 1f);
            Text history = CreateText(go.transform, "History", "まだ着手はありません",
                new Vector2(8f, 27f), new Vector2(144f, 59f), 9, font);
            history.alignment = TextAnchor.UpperLeft;
            history.horizontalOverflow = HorizontalWrapMode.Wrap;
            history.verticalOverflow = VerticalWrapMode.Truncate;
            go.GetComponent<TriadBattleActionHistory>().Configure(controller, history, 3);
            Transform feedback = canvas.Find("TurnFeedback");
            if (feedback != null) feedback.SetAsLastSibling();
            Transform result = canvas.Find("ResultOverlay");
            if (result != null) result.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            TriadBattleActionHistory actionHistory = canvas.GetComponentInChildren<TriadBattleActionHistory>(true);
            if (actionHistory == null || actionHistory.Controller != controller)
                throw new InvalidOperationException("Action history is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase7");
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
            text.color = new Color(.83f, .87f, .96f, 1f);
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
