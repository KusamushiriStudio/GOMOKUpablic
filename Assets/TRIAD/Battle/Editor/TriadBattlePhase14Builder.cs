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
    public static class TriadBattlePhase14Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase46.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase47.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase13.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase14.unity";

        [MenuItem("TRIAD/Battle/Build Phase 14 Session Journal")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase13Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE14] PASS: sequenced session action journal verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase14.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 14 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE14] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            controller.SetHomeSceneName("HomePhase47");
            Transform old = safeRoot.Find("SessionJournal");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            GameObject journalObject = new GameObject("SessionJournal", typeof(RectTransform), typeof(TriadBattleSessionJournal));
            journalObject.transform.SetParent(safeRoot, false);
            RectTransform journalRect = journalObject.GetComponent<RectTransform>();
            journalRect.anchorMin = Vector2.zero;
            journalRect.anchorMax = Vector2.one;
            journalRect.offsetMin = Vector2.zero;
            journalRect.offsetMax = Vector2.zero;
            GameObject badgeObject = new GameObject(
                "SequenceBadge", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            badgeObject.transform.SetParent(journalObject.transform, false);
            TopLeft(badgeObject.GetComponent<RectTransform>(), new Vector2(174f, 137f), new Vector2(100f, 26f));
            TriadRoundedRectGraphic badge = badgeObject.GetComponent<TriadRoundedRectGraphic>();
            badge.color = new Color(.035f, .035f, .080f, .92f);
            badge.BorderColor = new Color(.72f, .58f, 1f, .72f);
            badge.BorderWidth = 1f;
            badge.CornerRadius = 7f;
            badge.raycastTarget = false;
            Text label = CreateText(badgeObject.transform, "Label", "SYNC  #0",
                Vector2.zero, new Vector2(100f, 26f), 9, font);
            TriadBattleSessionJournal journal = journalObject.GetComponent<TriadBattleSessionJournal>();
            journal.Configure(controller, session, label);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (journal.Controller != controller || journal.LastSequence != 0 || string.IsNullOrEmpty(journal.ExportJson()))
                throw new InvalidOperationException("Session journal is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase14");
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
            text.color = new Color(.88f, .82f, 1f, 1f);
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
