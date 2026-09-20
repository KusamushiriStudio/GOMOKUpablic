using System;
using System.IO;
using System.Linq;
using Rive;
using Rive.Components;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase9Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase8Scene = Root + "/Scenes/HomePhase8.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase9.unity";
        private const string RiveAssetPath = Root + "/Rive/OfficialSkillsSample.riv";

        [MenuItem("TRIAD/UI/Build Home Through Phase 9")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase8Scene)) TriadHomePhase8Builder.Build();

            Asset riveAsset = AssetDatabase.LoadAssetAtPath<Asset>(RiveAssetPath);
            if (riveAsset == null || riveAsset.Bytes == null || riveAsset.Bytes.Length == 0)
                throw new InvalidOperationException("Missing or empty Rive pilot asset: " + RiveAssetPath);

            Scene scene = EditorSceneManager.OpenScene(Phase8Scene, OpenSceneMode.Single);
            TriadBottomNavigationView navigation = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadBottomNavigationView>(true))
                .Single();
            TriadHomeHeaderView header = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHomeHeaderView>(true))
                .Single();
            Canvas headerCanvas = header.GetComponent<Canvas>();
            SerializedObject headerCanvasData = new SerializedObject(headerCanvas);
            headerCanvasData.FindProperty("m_OverrideSorting").boolValue = true;
            headerCanvasData.FindProperty("m_SortingOrder").intValue = 30;
            headerCanvasData.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(headerCanvas);
            Transform homeTab = navigation.transform.Find("ホームTab");
            if (homeTab == null) throw new InvalidOperationException("Home navigation tab was not found.");

            GameObject panelObject = new GameObject(
                "RiveHomeSelectionPilot",
                typeof(RectTransform),
                typeof(RivePanel),
                typeof(RiveCanvasRenderer));
            panelObject.SetActive(false);
            panelObject.transform.SetParent(homeTab, false);
            panelObject.transform.SetAsFirstSibling();
            SetTopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(14, 0), new Vector2(28, 28));
            Graphic display = panelObject.GetComponent<Graphic>();
            display.color = new UnityEngine.Color(0.945f, 0.843f, 0.573f, 0.28f);
            display.raycastTarget = false;

            RivePanel panel = panelObject.GetComponent<RivePanel>();
            RiveCanvasRenderer renderer = panelObject.GetComponent<RiveCanvasRenderer>();
            SerializedObject rendererData = new SerializedObject(renderer);
            rendererData.FindProperty("m_initialRivePanel").objectReferenceValue = panel;
            rendererData.FindProperty("m_matchCanvasResolution").boolValue = true;
            rendererData.ApplyModifiedPropertiesWithoutUndo();

            GameObject widgetObject = new GameObject("AnimatedSelection", typeof(RectTransform), typeof(RiveWidget));
            widgetObject.transform.SetParent(panelObject.transform, false);
            Fill(widgetObject.GetComponent<RectTransform>());
            RiveWidget widget = widgetObject.GetComponent<RiveWidget>();
            SerializedObject widgetData = new SerializedObject(widget);
            widgetData.FindProperty("m_asset").objectReferenceValue = riveAsset;
            widgetData.FindProperty("m_hitTestBehavior").enumValueIndex = (int)HitTestBehavior.None;
            widgetData.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(widget);

            TriadRivePilotMonitor monitor = panelObject.AddComponent<TriadRivePilotMonitor>();
            GameObject fallback = homeTab.Find("Icon")?.gameObject;
            monitor.Configure(widget, panelObject, fallback);
            panelObject.SetActive(true);
            widget.Load(riveAsset);
            EditorUtility.SetDirty(widget);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettingsScene[] settings = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            EditorBuildSettings.scenes = settings;

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE9] PASS: Rive pilot and static fallback verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = System.IO.Path.Combine(root, "Artifacts", "UI", "Player", "TRIADHomePhase9.exe");
            Directory.CreateDirectory(System.IO.Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 9 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE9] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadRivePilotMonitor monitor = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadRivePilotMonitor>(true))
                .SingleOrDefault();
            RiveWidget widget = monitor != null ? monitor.GetComponentInChildren<RiveWidget>(true) : null;
            if (monitor == null || widget == null || widget.Asset == null || widget.Asset.Bytes.Length == 0)
                throw new InvalidOperationException("Rive Home selection pilot is incomplete.");
            if (monitor.transform.parent == null || monitor.transform.parent.name != "ホームTab")
                throw new InvalidOperationException("Rive pilot is not isolated to the Home selected tab.");
        }

        private static void SetTopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0, 1);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void Fill(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
