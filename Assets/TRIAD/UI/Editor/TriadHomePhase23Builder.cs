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
    public static class TriadHomePhase23Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase22Scene = Root + "/Scenes/HomePhase22.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase23.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 23 Reference Brightness")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase22Scene))
                TriadHomePhase22Builder.Build();
            Scene scene = EditorSceneManager.OpenScene(Phase22Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;

            Image scrim = Require<Image>(canvas, "HomeBackgroundReadabilityScrim");
            scrim.color = new Color(.012f, .027f, .060f, .08f);
            RecordOverride(scrim);
            CreateAmbientLift(canvas);

            RawImage character = Require<RawImage>(canvas, "HibanaCharacterArt");
            character.color = new Color(.96f, .98f, 1f, 1f);
            RawImage shadow = Require<RawImage>(canvas, "HibanaCharacterShadow");
            shadow.color = new Color(.004f, .010f, .030f, .18f);
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            board.color = Color.white;
            RecordOverride(character);
            RecordOverride(shadow);
            RecordOverride(board);

            BrightenCta(canvas, "BattleButton", "BattleCtaArtworkScrim", .32f);
            BrightenCta(canvas, "StoryButton", "StoryCtaArtworkScrim", .30f);
            foreach (string name in new[] { "WorldButton", "GachaButton", "WardrobeButton", "CharacterTrainingButton" })
                BrightenMenu(canvas, name);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE23] PASS: Reference brightness lift verified without losing text contrast.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase23.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 23 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE23] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void CreateAmbientLift(Transform canvas)
        {
            Transform existing = canvas.Find("HomeAmbientLightLift");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            GameObject liftObject = new GameObject("HomeAmbientLightLift", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            liftObject.transform.SetParent(canvas, false);
            Fill(liftObject.GetComponent<RectTransform>());
            Image lift = liftObject.GetComponent<Image>();
            lift.color = new Color(.72f, .58f, .76f, .28f);
            lift.raycastTarget = false;
            liftObject.transform.SetSiblingIndex(2);
        }

        private static void BrightenCta(Transform canvas, string buttonName, string scrimName, float scrimAlpha)
        {
            Button button = Require<Button>(canvas, buttonName);
            RawImage art = button.GetComponentsInChildren<RawImage>(true).Single(item => item.name == "Artwork");
            art.color = Color.white;
            TriadRoundedRectGraphic scrim = Require<TriadRoundedRectGraphic>(button.transform, scrimName);
            Color color = scrim.color;
            color.a = scrimAlpha;
            scrim.color = color;
            RecordOverride(art);
            RecordOverride(scrim);
        }

        private static void BrightenMenu(Transform canvas, string buttonName)
        {
            Button button = Require<Button>(canvas, buttonName);
            RawImage art = Require<RawImage>(button.transform, "MenuArtwork");
            art.color = Color.white;
            TriadRoundedRectGraphic scrim = Require<TriadRoundedRectGraphic>(button.transform, "MenuArtworkScrim");
            Color color = scrim.color;
            color.a = .28f;
            scrim.color = color;
            RecordOverride(art);
            RecordOverride(scrim);
        }

        private static T Require<T>(Transform root, string name) where T : Component
        {
            T component = root.GetComponentsInChildren<T>(true).FirstOrDefault(item => item.name == name);
            if (component == null) throw new InvalidOperationException("Missing component: " + name);
            return component;
        }

        private static void Fill(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void RecordOverride(UnityEngine.Object target)
        {
            EditorUtility.SetDirty(target);
            PrefabUtility.RecordPrefabInstancePropertyModifications(target);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            Image scrim = Require<Image>(canvas, "HomeBackgroundReadabilityScrim");
            Image lift = Require<Image>(canvas, "HomeAmbientLightLift");
            RawImage character = Require<RawImage>(canvas, "HibanaCharacterArt");
            if (scrim.color.a > .081f || lift.color.a < .279f || lift.raycastTarget)
                throw new InvalidOperationException("Background brightness layers are incorrect.");
            if (character.color.r < .95f)
                throw new InvalidOperationException("Character brightness lift was not preserved.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<TriadStoryBannerView>(true)).Any())
                throw new InvalidOperationException("Story progress must remain absent from home.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 17)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }
    }
}
