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
    public static class TriadHomePhase14Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase13Scene = Root + "/Scenes/HomePhase13.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase14.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 14 Open Hero Composition")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase13Scene))
                TriadHomePhase13Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase13Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();

            RemoveFullPanel(hero);
            CreateLocalReadabilityPlate(hero.transform);
            ImproveTextReadability(hero.transform);
            OpenCharacterComposition(hero.transform);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE14] PASS: Open hero composition and local readability verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase14.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 14 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE14] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void RemoveFullPanel(TriadHeroAreaView hero)
        {
            TriadRoundedRectGraphic panel = hero.GetComponent<TriadRoundedRectGraphic>();
            if (panel == null) throw new InvalidOperationException("Hero surface graphic was not found.");
            panel.color = Color.clear;
            panel.BorderColor = Color.clear;
            panel.BorderWidth = 0f;
            panel.raycastTarget = false;
            RecordOverride(panel);

            foreach (TriadGoldOrnamentGraphic ornament in hero.GetComponentsInChildren<TriadGoldOrnamentGraphic>(true))
            {
                ornament.enabled = false;
                RecordOverride(ornament);
            }

            Transform moon = hero.transform.Find("MoonGlow");
            TriadRoundedRectGraphic moonGraphic = moon != null ? moon.GetComponent<TriadRoundedRectGraphic>() : null;
            if (moonGraphic != null)
            {
                moonGraphic.color = new Color(.95f, .82f, .48f, .07f);
                moonGraphic.BorderColor = Color.clear;
                moonGraphic.BorderWidth = 0f;
                RecordOverride(moonGraphic);
            }
        }

        private static void CreateLocalReadabilityPlate(Transform hero)
        {
            GameObject plate = new GameObject(
                "HeroInfoReadabilityPlate",
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(TriadRoundedRectGraphic));
            plate.transform.SetParent(hero, false);
            TopLeft(plate.GetComponent<RectTransform>(), new Vector2(8f, 14f), new Vector2(166f, 148f));
            TriadRoundedRectGraphic graphic = plate.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = new Color(.012f, .027f, .06f, .57f);
            graphic.BorderColor = new Color(.94f, .78f, .35f, .58f);
            graphic.BorderWidth = 1f;
            graphic.CornerRadius = 10f;
            graphic.raycastTarget = false;
            plate.transform.SetAsFirstSibling();
        }

        private static void ImproveTextReadability(Transform hero)
        {
            foreach (string name in new[] { "HeroKicker", "HeroName", "HeroRole" })
            {
                Transform target = hero.Find(name);
                Text label = target != null ? target.GetComponent<Text>() : null;
                if (label == null) throw new InvalidOperationException("Missing hero label: " + name);
                Outline outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
                outline.effectColor = new Color(.005f, .008f, .018f, .92f);
                outline.effectDistance = new Vector2(1.25f, -1.25f);
                outline.useGraphicAlpha = true;
            }
        }

        private static void OpenCharacterComposition(Transform hero)
        {
            RectTransform portrait = hero.Find("HeroPortrait")?.GetComponent<RectTransform>();
            if (portrait == null) throw new InvalidOperationException("HeroPortrait root was not found.");
            TopLeft(portrait, new Vector2(144f, 6f), new Vector2(222f, 278f));
            RecordOverride(portrait);

            RectTransform pose = portrait.Find("HibanaCharacterPose")?.GetComponent<RectTransform>();
            if (pose == null) throw new InvalidOperationException("Hibana character pose was not found.");
            pose.anchoredPosition = new Vector2(2f, -10f);
            pose.localScale = new Vector3(1.18f, 1.18f, 1f);
            RecordOverride(pose);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            TriadRoundedRectGraphic panel = hero.GetComponent<TriadRoundedRectGraphic>();
            if (panel == null || panel.color.a > .001f || panel.BorderWidth > .001f)
                throw new InvalidOperationException("Full hero panel must remain transparent and borderless.");
            Transform plate = hero.transform.Find("HeroInfoReadabilityPlate");
            if (plate == null || plate.GetComponent<Graphic>().raycastTarget)
                throw new InvalidOperationException("Local hero readability plate is incomplete.");
            if (hero.GetComponentsInChildren<TriadGoldOrnamentGraphic>(true).Any(item => item.enabled))
                throw new InvalidOperationException("Full-card hero ornaments must remain hidden.");
            if (hero.transform.Find("HeroPortrait/HibanaCharacterPose/HibanaCharacterArt") == null)
                throw new InvalidOperationException("Hibana character layer was lost.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void RecordOverride(UnityEngine.Object target)
        {
            EditorUtility.SetDirty(target);
            PrefabUtility.RecordPrefabInstancePropertyModifications(target);
        }
    }
}
