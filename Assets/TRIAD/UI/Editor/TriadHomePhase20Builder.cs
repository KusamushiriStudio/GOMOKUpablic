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
    public static class TriadHomePhase20Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase19Scene = Root + "/Scenes/HomePhase19.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase20.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 20 Remove Story Progress")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase19Scene))
                TriadHomePhase19Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase19Scene, OpenSceneMode.Single);
            TriadStoryBannerView storyBanner = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true))
                .SingleOrDefault();
            if (storyBanner != null)
                UnityEngine.Object.DestroyImmediate(storyBanner.gameObject);

            RectTransform content = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single().transform.parent as RectTransform;
            if (content == null || content.name != "Content")
                throw new InvalidOperationException("Home scroll content was not found.");

            Move<TriadMainCtaView>(content, new Vector2(12f, 448f), new Vector2(366f, 82f));
            Move<TriadSubMenuView>(content, new Vector2(12f, 538f), new Vector2(366f, 105f));
            Move<TriadCommunityView>(content, new Vector2(12f, 651f), new Vector2(366f, 52f));
            content.sizeDelta = new Vector2(390f, 711f);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE20] PASS: Home story progress removed without removing the story route.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase20.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 20 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE20] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void Move<T>(Transform content, Vector2 position, Vector2 size) where T : Component
        {
            T component = content.GetComponentInChildren<T>(true);
            if (component == null) throw new InvalidOperationException("Missing home content: " + typeof(T).Name);
            RectTransform rect = component.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Component[] components = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Component>(true))
                .ToArray();
            if (components.OfType<TriadStoryBannerView>().Any())
                throw new InvalidOperationException("Story progress must not appear on the home screen.");
            TriadMainCtaView mainCta = components.OfType<TriadMainCtaView>().Single();
            Button storyButton = mainCta.GetComponentsInChildren<Button>(true)
                .SingleOrDefault(button => button.name == "StoryButton");
            if (storyButton == null || !storyButton.gameObject.activeInHierarchy)
                throw new InvalidOperationException("The story route button must remain available.");
            if (components.OfType<Button>().Count() < 17)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
            RectTransform content = components.OfType<TriadHeroAreaView>().Single().transform.parent as RectTransform;
            if (content == null || content.rect.height > 712f)
                throw new InvalidOperationException("The unused story progress space was not removed.");
        }
    }
}
