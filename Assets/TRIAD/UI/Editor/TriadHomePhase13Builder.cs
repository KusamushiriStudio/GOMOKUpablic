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
    public static class TriadHomePhase13Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase12Scene = Root + "/Scenes/HomePhase12.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase13.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 13 Main CTA Material")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase12Scene))
                TriadHomePhase12Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase12Scene, OpenSceneMode.Single);
            TriadMainCtaView mainCta = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadMainCtaView>(true))
                .Single();
            Button battle = mainCta.GetComponentsInChildren<Button>(true).Single(item => item.name == "BattleButton");
            Button story = mainCta.GetComponentsInChildren<Button>(true).Single(item => item.name == "StoryButton");

            EnhanceButton(battle, "Battle", new Color(.96f, .34f, .08f, .22f), new Color(1f, .83f, .44f, .48f));
            EnhanceButton(story, "Story", new Color(.22f, .48f, .86f, .17f), new Color(.94f, .79f, .38f, .42f));

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE13] PASS: Main CTA material and press feedback verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase13.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 13 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE13] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void EnhanceButton(Button button, string prefix, Color glowColor, Color highlightColor)
        {
            RectTransform buttonRect = button.GetComponent<RectTransform>();
            Transform parent = button.transform.parent;
            GameObject glowObject = new GameObject(prefix + "CtaGlow", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(CanvasGroup));
            glowObject.transform.SetParent(parent, false);
            RectTransform glowRect = glowObject.GetComponent<RectTransform>();
            CopyRect(buttonRect, glowRect);
            glowRect.anchoredPosition += new Vector2(-4f, 4f);
            glowRect.sizeDelta += new Vector2(8f, 8f);
            glowObject.transform.SetSiblingIndex(button.transform.GetSiblingIndex());
            TriadRoundedRectGraphic glowGraphic = glowObject.GetComponent<TriadRoundedRectGraphic>();
            glowGraphic.color = glowColor;
            glowGraphic.BorderWidth = 0f;
            glowGraphic.CornerRadius = 16f;
            glowGraphic.raycastTarget = false;
            CanvasGroup glowGroup = glowObject.GetComponent<CanvasGroup>();
            glowGroup.alpha = .48f;
            glowGroup.blocksRaycasts = false;
            glowGroup.interactable = false;

            GameObject inner = Layer(button.transform, prefix + "CtaInnerPlate", new Vector2(3f, 3f), new Vector2(-3f, -3f));
            TriadRoundedRectGraphic innerGraphic = inner.GetComponent<TriadRoundedRectGraphic>();
            innerGraphic.color = new Color(.02f, .04f, .08f, .13f);
            innerGraphic.BorderColor = highlightColor;
            innerGraphic.BorderWidth = 1f;
            innerGraphic.CornerRadius = 10f;
            inner.transform.SetAsFirstSibling();

            GameObject sheen = Layer(button.transform, prefix + "CtaTopSheen", new Vector2(12f, 59f), new Vector2(-12f, -6f));
            TriadRoundedRectGraphic sheenGraphic = sheen.GetComponent<TriadRoundedRectGraphic>();
            sheenGraphic.color = new Color(highlightColor.r, highlightColor.g, highlightColor.b, .24f);
            sheenGraphic.BorderWidth = 0f;
            sheenGraphic.CornerRadius = 2f;
            sheen.transform.SetSiblingIndex(1);

            GameObject depth = Layer(button.transform, prefix + "CtaBottomDepth", new Vector2(10f, 5f), new Vector2(-10f, -60f));
            TriadRoundedRectGraphic depthGraphic = depth.GetComponent<TriadRoundedRectGraphic>();
            depthGraphic.color = new Color(.01f, .015f, .03f, .22f);
            depthGraphic.BorderWidth = 0f;
            depthGraphic.CornerRadius = 3f;
            depth.transform.SetSiblingIndex(2);

            ColorBlock colors = button.colors;
            colors.normalColor = Color.white;
            colors.highlightedColor = new Color(1f, .98f, .92f, 1f);
            colors.pressedColor = new Color(.84f, .84f, .84f, 1f);
            colors.selectedColor = new Color(1f, .97f, .88f, 1f);
            colors.disabledColor = new Color(.35f, .35f, .35f, .65f);
            colors.fadeDuration = .08f;
            button.colors = colors;

            TriadCtaPressFeedback feedback = button.gameObject.AddComponent<TriadCtaPressFeedback>();
            feedback.Configure(glowGroup);
        }

        private static GameObject Layer(Transform parent, string name, Vector2 offsetMin, Vector2 offsetMax)
        {
            GameObject layer = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            layer.transform.SetParent(parent, false);
            RectTransform rect = layer.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
            layer.GetComponent<TriadRoundedRectGraphic>().raycastTarget = false;
            return layer;
        }

        private static void CopyRect(RectTransform source, RectTransform destination)
        {
            destination.anchorMin = source.anchorMin;
            destination.anchorMax = source.anchorMax;
            destination.pivot = source.pivot;
            destination.anchoredPosition = source.anchoredPosition;
            destination.sizeDelta = source.sizeDelta;
            destination.localRotation = source.localRotation;
            destination.localScale = source.localScale;
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadMainCtaView mainCta = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadMainCtaView>(true))
                .Single();
            TriadCtaPressFeedback[] feedback = mainCta.GetComponentsInChildren<TriadCtaPressFeedback>(true);
            if (feedback.Length != 2)
                throw new InvalidOperationException("Both Main CTA buttons must have press feedback.");
            Transform[] glows = mainCta.GetComponentsInChildren<Transform>(true)
                .Where(item => item.name.EndsWith("CtaGlow", StringComparison.Ordinal)).ToArray();
            if (glows.Length != 2 || glows.Any(item => item.GetComponent<Graphic>().raycastTarget))
                throw new InvalidOperationException("CTA glow layers are incomplete or intercept input.");
            if (mainCta.GetComponentsInChildren<Button>(true).Length != 2)
                throw new InvalidOperationException("Main CTA button structure changed unexpectedly.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }
    }
}
