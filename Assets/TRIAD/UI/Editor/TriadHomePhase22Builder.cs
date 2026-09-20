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
    public static class TriadHomePhase22Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase21Scene = Root + "/Scenes/HomePhase21.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase22.unity";
        private const string BattleArtPath = Root + "/Art/CTA/BattleCtaBackground-v1.png";
        private const string StoryArtPath = Root + "/Art/CTA/StoryCtaBackground-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 22 Illustrated Sub Menu")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase21Scene))
                TriadHomePhase21Builder.Build();
            Texture2D battle = AssetDatabase.LoadAssetAtPath<Texture2D>(BattleArtPath);
            Texture2D story = AssetDatabase.LoadAssetAtPath<Texture2D>(StoryArtPath);
            if (battle == null || story == null) throw new InvalidOperationException("Shared menu artwork is missing.");

            Scene scene = EditorSceneManager.OpenScene(Phase21Scene, OpenSceneMode.Single);
            TriadSubMenuView subMenu = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadSubMenuView>(true)).Single();
            Enhance(RequireButton(subMenu, "WorldButton"), story, new Rect(0f, 0f, .40f, 1f));
            Enhance(RequireButton(subMenu, "GachaButton"), battle, new Rect(0f, 0f, .40f, 1f));
            Enhance(RequireButton(subMenu, "WardrobeButton"), story, new Rect(.60f, 0f, .40f, 1f));
            Enhance(RequireButton(subMenu, "CharacterTrainingButton"), battle, new Rect(.60f, 0f, .40f, 1f));

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE22] PASS: Illustrated sub-menu cards and readable live labels verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase22.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 22 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE22] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static Button RequireButton(TriadSubMenuView menu, string name)
        {
            return menu.GetComponentsInChildren<Button>(true).Single(item => item.name == name);
        }

        private static void Enhance(Button button, Texture2D texture, Rect uv)
        {
            Transform oldArt = button.transform.Find("MenuArtwork");
            if (oldArt != null) UnityEngine.Object.DestroyImmediate(oldArt.gameObject);
            Transform oldScrim = button.transform.Find("MenuArtworkScrim");
            if (oldScrim != null) UnityEngine.Object.DestroyImmediate(oldScrim.gameObject);
            if (button.GetComponent<RectMask2D>() == null) button.gameObject.AddComponent<RectMask2D>();

            GameObject artObject = new GameObject("MenuArtwork", typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage));
            artObject.transform.SetParent(button.transform, false);
            Stretch(artObject.GetComponent<RectTransform>(), 2f);
            RawImage art = artObject.GetComponent<RawImage>();
            art.texture = texture;
            art.uvRect = uv;
            art.color = new Color(.82f, .84f, .90f, 1f);
            art.raycastTarget = false;
            artObject.transform.SetAsFirstSibling();

            GameObject scrimObject = new GameObject("MenuArtworkScrim", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            scrimObject.transform.SetParent(button.transform, false);
            Stretch(scrimObject.GetComponent<RectTransform>(), 2f);
            TriadRoundedRectGraphic scrim = scrimObject.GetComponent<TriadRoundedRectGraphic>();
            scrim.color = new Color(.006f, .012f, .030f, .48f);
            scrim.BorderColor = new Color(.96f, .78f, .34f, .76f);
            scrim.BorderWidth = 1f;
            scrim.CornerRadius = 10f;
            scrim.raycastTarget = false;
            scrimObject.transform.SetSiblingIndex(1);

            TriadSubMenuIconGraphic icon = button.GetComponentInChildren<TriadSubMenuIconGraphic>(true);
            Text label = button.transform.Find("Label")?.GetComponent<Text>();
            Text caption = button.transform.Find("Caption")?.GetComponent<Text>();
            if (icon == null || label == null || caption == null)
                throw new InvalidOperationException("Sub-menu contents are incomplete: " + button.name);
            icon.color = new Color(1f, .88f, .52f, 1f);
            label.color = new Color(1f, .96f, .84f, 1f);
            caption.color = new Color(.92f, .88f, .76f, .82f);
            AddOutline(label, 1f);
            AddOutline(caption, .75f);
            icon.transform.SetAsLastSibling();
            label.transform.SetAsLastSibling();
            caption.transform.SetAsLastSibling();
            Transform badge = button.transform.Find("GachaNewBadge");
            if (badge != null) badge.SetAsLastSibling();
            RecordOverride(icon);
            RecordOverride(label);
            RecordOverride(caption);
        }

        private static void AddOutline(Text text, float distance)
        {
            Outline outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color(.002f, .004f, .012f, .98f);
            outline.effectDistance = new Vector2(distance, -distance);
            RecordOverride(outline);
        }

        private static void Stretch(RectTransform rect, float inset)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = new Vector2(inset, inset);
            rect.offsetMax = new Vector2(-inset, -inset);
        }

        private static void RecordOverride(UnityEngine.Object target)
        {
            EditorUtility.SetDirty(target);
            PrefabUtility.RecordPrefabInstancePropertyModifications(target);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadSubMenuView menu = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadSubMenuView>(true)).Single();
            Button[] buttons = menu.GetComponentsInChildren<Button>(true);
            if (buttons.Length != 4) throw new InvalidOperationException("Sub-menu must keep four buttons.");
            foreach (Button button in buttons)
            {
                RawImage art = button.transform.Find("MenuArtwork")?.GetComponent<RawImage>();
                if (art == null || art.texture == null || art.raycastTarget)
                    throw new InvalidOperationException("Sub-menu artwork is incomplete: " + button.name);
                if (button.transform.Find("Label")?.GetComponent<Outline>() == null)
                    throw new InvalidOperationException("Sub-menu label outline is missing: " + button.name);
            }
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true)).Any())
                throw new InvalidOperationException("Story progress must remain absent from home.");
        }
    }
}
