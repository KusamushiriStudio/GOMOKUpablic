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
    public static class TriadHomePhase29Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase28Scene = Root + "/Scenes/HomePhase28.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase29.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 29 Button Motion")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase28Scene))
                TriadHomePhase28Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase28Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigureMainButtons(canvas);
            ConfigureSubMenuButtons(canvas);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify(canvas);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE29] PASS: six sculpted buttons have grouped press motion and glow feedback.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase29.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 29 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE29] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureMainButtons(Transform canvas)
        {
            Transform root = canvas.GetComponentsInChildren<TriadMainCtaView>(true).Single().transform;
            ConfigureButton(root, "BattleButton", "BattleCta", new Color(1f, .28f, .06f, .56f));
            ConfigureButton(root, "StoryButton", "StoryCta", new Color(.26f, .52f, 1f, .56f));
        }

        private static void ConfigureSubMenuButtons(Transform canvas)
        {
            Transform root = canvas.GetComponentsInChildren<TriadSubMenuView>(true).Single().transform;
            ConfigureButton(root, "WorldButton", "WorldButton", new Color(1f, .34f, .10f, .50f));
            ConfigureButton(root, "GachaButton", "GachaButton", new Color(1f, .72f, .16f, .58f));
            ConfigureButton(root, "WardrobeButton", "WardrobeButton", new Color(1f, .25f, .30f, .50f));
            ConfigureButton(root, "CharacterTrainingButton", "CharacterTrainingButton", new Color(1f, .43f, .10f, .50f));
        }

        private static void ConfigureButton(Transform root, string buttonName, string partPrefix, Color glowColor)
        {
            Button button = Require<Button>(root, buttonName);
            Transform oldGlow = root.Find(partPrefix + "PressGlow");
            if (oldGlow != null) UnityEngine.Object.DestroyImmediate(oldGlow.gameObject);
            TriadSculptedButtonFeedback oldFeedback = button.GetComponent<TriadSculptedButtonFeedback>();
            if (oldFeedback != null) UnityEngine.Object.DestroyImmediate(oldFeedback);

            RawImage emblem = Require<RawImage>(root, partPrefix + "Emblem");
            GameObject glowObject = new GameObject(
                partPrefix + "PressGlow", typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage), typeof(CanvasGroup));
            glowObject.transform.SetParent(root, false);
            RectTransform glowRect = glowObject.GetComponent<RectTransform>();
            CopyRect(emblem.rectTransform, glowRect, 5f);
            RawImage glow = glowObject.GetComponent<RawImage>();
            glow.texture = emblem.texture;
            glow.uvRect = emblem.uvRect;
            glow.color = glowColor;
            glow.raycastTarget = false;
            CanvasGroup glowGroup = glowObject.GetComponent<CanvasGroup>();
            glowGroup.alpha = .16f;
            glowGroup.blocksRaycasts = false;
            glowGroup.interactable = false;
            glowObject.transform.SetSiblingIndex(Mathf.Max(0, emblem.transform.GetSiblingIndex()));

            RectTransform[] movingParts =
            {
                button.GetComponent<RectTransform>(),
                Require<RectTransform>(root, partPrefix + "Pedestal"),
                Require<RectTransform>(root, partPrefix + "Crest"),
                Require<RectTransform>(root, partPrefix + "EmblemShadow"),
                emblem.rectTransform,
                glowRect
            };
            TriadSculptedButtonFeedback feedback = button.gameObject.AddComponent<TriadSculptedButtonFeedback>();
            feedback.Configure(movingParts, glowGroup, 2f, .985f, .16f, .82f);
            EditorUtility.SetDirty(feedback);
        }

        private static void CopyRect(RectTransform source, RectTransform target, float expansion)
        {
            target.anchorMin = source.anchorMin;
            target.anchorMax = source.anchorMax;
            target.pivot = source.pivot;
            target.anchoredPosition = source.anchoredPosition - new Vector2(expansion * .5f, -expansion * .5f);
            target.sizeDelta = source.sizeDelta + Vector2.one * expansion;
            target.localRotation = source.localRotation;
            target.localScale = source.localScale;
        }

        private static T Require<T>(Transform root, string name) where T : Component
        {
            T component = root.GetComponentsInChildren<T>(true).FirstOrDefault(item => item.name == name);
            return component != null ? component : throw new InvalidOperationException("Missing component: " + name);
        }

        private static void Verify(Transform canvas)
        {
            TriadSculptedButtonFeedback[] feedback = canvas.GetComponentsInChildren<TriadSculptedButtonFeedback>(true);
            if (feedback.Length != 6)
                throw new InvalidOperationException("All six illustrated menu buttons require grouped press feedback.");
            if (feedback.Any(item => item.MovingPartCount < 6 || item.Highlight == null))
                throw new InvalidOperationException("A sculpted button press group is incomplete.");
            if (canvas.GetComponentsInChildren<Button>(true).Length < 15)
                throw new InvalidOperationException("Existing controls were lost during Phase 29.");
        }
    }
}
