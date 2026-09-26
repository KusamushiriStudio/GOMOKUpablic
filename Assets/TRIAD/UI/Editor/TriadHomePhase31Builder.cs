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
    public static class TriadHomePhase31Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase30Scene = Root + "/Scenes/HomePhase30.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase31.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 31 Route Feedback")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase30Scene))
                TriadHomePhase30Builder.Build();
            Scene scene = EditorSceneManager.OpenScene(Phase30Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigureRouteIndicator(canvas);
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) }).ToArray();
            Verify(canvas);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE31] PASS: route lock now has visible destination feedback.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase31.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 31 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE31] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureRouteIndicator(Transform canvas)
        {
            Transform existing = canvas.Find("HomeRouteTransitionIndicator");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            if (controller == null) throw new InvalidOperationException("Home controller is missing.");

            GameObject indicatorObject = new GameObject(
                "HomeRouteTransitionIndicator", typeof(RectTransform), typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic), typeof(CanvasGroup), typeof(TriadRouteTransitionIndicator));
            indicatorObject.transform.SetParent(canvas, false);
            RectTransform indicatorRect = indicatorObject.GetComponent<RectTransform>();
            TopLeft(indicatorRect, new Vector2(97f, 390f), new Vector2(196f, 46f));
            TriadRoundedRectGraphic panel = indicatorObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.004f, .008f, .018f, .94f);
            panel.BorderColor = new Color(1f, .72f, .24f, .96f);
            panel.BorderWidth = 1.6f;
            panel.CornerRadius = 12f;
            panel.raycastTarget = false;

            CanvasGroup group = indicatorObject.GetComponent<CanvasGroup>();
            group.alpha = 0f;
            group.blocksRaycasts = false;
            group.interactable = false;

            GameObject labelObject = new GameObject("StatusLabel", typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            labelObject.transform.SetParent(indicatorObject.transform, false);
            TopLeft(labelObject.GetComponent<RectTransform>(), new Vector2(8f, 5f), new Vector2(180f, 36f));
            Text label = labelObject.GetComponent<Text>();
            Text source = canvas.GetComponentInChildren<Text>(true);
            label.font = source != null ? source.font : Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.text = "画面へ移動中…";
            label.fontSize = 14;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = new Color(1f, .91f, .70f, 1f);
            label.raycastTarget = false;
            Outline outline = labelObject.AddComponent<Outline>();
            outline.effectColor = new Color(0f, 0f, 0f, .88f);
            outline.effectDistance = new Vector2(1f, -1f);

            indicatorObject.GetComponent<TriadRouteTransitionIndicator>().Configure(controller, group, label);
            indicatorObject.transform.SetAsLastSibling();
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
            TriadRouteTransitionIndicator indicator = canvas.GetComponentInChildren<TriadRouteTransitionIndicator>(true);
            if (indicator == null || indicator.Controller == null || indicator.Group == null || indicator.Label == null)
                throw new InvalidOperationException("Route transition feedback is incomplete.");
            if (canvas.GetComponentsInChildren<TriadSculptedButtonFeedback>(true).Length != 6)
                throw new InvalidOperationException("Sculpted button feedback was not preserved.");
            if (canvas.GetComponentInChildren<TriadScrollCue>(true) == null)
                throw new InvalidOperationException("Scroll guidance was not preserved.");
        }
    }
}
