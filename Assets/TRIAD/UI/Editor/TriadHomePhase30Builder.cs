using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase30Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase29Scene = Root + "/Scenes/HomePhase29.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase30.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 30 Scroll Guidance")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase29Scene))
                TriadHomePhase29Builder.Build();
            Scene scene = EditorSceneManager.OpenScene(Phase29Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigureScrollCue(canvas);
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) }).ToArray();
            Verify(canvas);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE30] PASS: scroll continuation cue and bottom-content affordance verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase30.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 30 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE30] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureScrollCue(Transform canvas)
        {
            Transform existing = canvas.Find("HomeScrollCue");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            TriadHomeVerticalScroller scroller = canvas.GetComponentInChildren<TriadHomeVerticalScroller>(true);
            if (scroller == null) throw new InvalidOperationException("Home vertical scroller is missing.");

            GameObject cueObject = new GameObject(
                "HomeScrollCue", typeof(RectTransform), typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic), typeof(CanvasGroup), typeof(TriadScrollCue));
            cueObject.transform.SetParent(canvas, false);
            RectTransform cueRect = cueObject.GetComponent<RectTransform>();
            TopLeft(cueRect, new Vector2(148f, 744f), new Vector2(94f, 25f));
            TriadRoundedRectGraphic panel = cueObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.006f, .010f, .020f, .86f);
            panel.BorderColor = new Color(1f, .73f, .25f, .82f);
            panel.BorderWidth = 1.2f;
            panel.CornerRadius = 12f;
            panel.raycastTarget = false;
            CanvasGroup group = cueObject.GetComponent<CanvasGroup>();
            group.alpha = 1f;
            group.blocksRaycasts = false;
            group.interactable = false;

            GameObject labelObject = new GameObject("Label", typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            labelObject.transform.SetParent(cueObject.transform, false);
            RectTransform labelRect = labelObject.GetComponent<RectTransform>();
            TopLeft(labelRect, new Vector2(4f, 3f), new Vector2(86f, 19f));
            Text label = labelObject.GetComponent<Text>();
            Text fontSource = canvas.GetComponentInChildren<Text>(true);
            label.font = fontSource != null ? fontSource.font : Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.text = "↑  上へスワイプ";
            label.fontSize = 9;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = new Color(1f, .88f, .58f, 1f);
            label.raycastTarget = false;

            cueObject.GetComponent<TriadScrollCue>().Configure(scroller, group, cueRect);
            TriadBottomNavigationView bottom = canvas.GetComponentInChildren<TriadBottomNavigationView>(true);
            cueObject.transform.SetAsLastSibling();
            if (bottom != null) bottom.transform.SetAsLastSibling();
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void Verify(Transform canvas)
        {
            TriadScrollCue cue = canvas.GetComponentInChildren<TriadScrollCue>(true);
            if (cue == null || cue.Scroller == null || cue.Group == null)
                throw new InvalidOperationException("Scroll guidance is not connected.");
            if (canvas.GetComponentsInChildren<TriadSculptedButtonFeedback>(true).Length != 6)
                throw new InvalidOperationException("Phase 29 button feedback was not preserved.");
        }
    }
}
