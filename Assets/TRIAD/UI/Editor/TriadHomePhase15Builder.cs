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
    public static class TriadHomePhase15Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase14Scene = Root + "/Scenes/HomePhase14.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase15.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 15 Center Hero")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase14Scene))
                TriadHomePhase14Builder.Build();

            Scene scene = EditorSceneManager.OpenScene(Phase14Scene, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();

            if (PrefabUtility.IsPartOfPrefabInstance(hero.gameObject))
                PrefabUtility.UnpackPrefabInstance(
                    hero.gameObject,
                    PrefabUnpackMode.Completely,
                    InteractionMode.AutomatedAction);

            CenterCharacter(hero.transform);
            MoveCharacterInformation(hero.transform);
            ArrangeForegroundOrder(hero.transform);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();

            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE15] PASS: Center-front hero composition verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase15.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 15 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE15] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void CenterCharacter(Transform hero)
        {
            RectTransform portrait = RequireRect(hero, "HeroPortrait");
            TopLeft(portrait, new Vector2(62f, 0f), new Vector2(242f, 288f));
            RecordOverride(portrait);

            RectTransform pose = RequireRect(hero, "HeroPortrait/HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(0f, -4f);
            pose.localScale = new Vector3(1.10f, 1.10f, 1f);
            RecordOverride(pose);
        }

        private static void MoveCharacterInformation(Transform hero)
        {
            RectTransform plate = RequireRect(hero, "HeroInfoReadabilityPlate");
            TopLeft(plate, new Vector2(242f, 42f), new Vector2(116f, 166f));
            TriadRoundedRectGraphic plateGraphic = plate.GetComponent<TriadRoundedRectGraphic>();
            plateGraphic.color = new Color(.012f, .027f, .06f, .72f);
            plateGraphic.BorderColor = new Color(.94f, .78f, .35f, .68f);
            RecordOverride(plateGraphic);

            PlaceText(hero, "HeroKicker", new Vector2(250f, 50f), new Vector2(100f, 16f), 9, TextAnchor.MiddleLeft);
            PlaceText(hero, "HeroName", new Vector2(250f, 68f), new Vector2(100f, 30f), 19, TextAnchor.MiddleLeft);
            PlaceText(hero, "HeroRole", new Vector2(250f, 98f), new Vector2(100f, 30f), 10, TextAnchor.UpperLeft);

            RectTransform skill = RequireRect(hero, "SkillPlate");
            TopLeft(skill, new Vector2(248f, 132f), new Vector2(104f, 32f));
            RecordOverride(skill);
            PlaceText(skill, "HeroSkill", new Vector2(7f, 4f), new Vector2(90f, 24f), 9, TextAnchor.MiddleLeft);

            PlaceButton(hero, "HeroDetailButton", new Vector2(248f, 172f), new Vector2(49f, 29f), 12);
            PlaceButton(hero, "HeroCostumeButton", new Vector2(303f, 172f), new Vector2(49f, 29f), 12);
        }

        private static void ArrangeForegroundOrder(Transform hero)
        {
            Transform portrait = hero.Find("HeroPortrait");
            portrait.SetAsLastSibling();
            RecordOverride(portrait);

            foreach (string path in new[]
            {
                "HeroInfoReadabilityPlate", "HeroKicker", "HeroName", "HeroRole",
                "SkillPlate", "HeroDetailButton", "HeroCostumeButton"
            })
            {
                Transform item = hero.Find(path);
                if (item == null) throw new InvalidOperationException("Missing foreground element: " + path);
                item.SetAsLastSibling();
                RecordOverride(item);
            }
        }

        private static void PlaceText(Transform parent, string name, Vector2 position, Vector2 size, int fontSize, TextAnchor anchor)
        {
            Transform target = parent.Find(name);
            Text text = target != null ? target.GetComponent<Text>() : null;
            if (text == null) throw new InvalidOperationException("Missing text: " + name);
            TopLeft(text.rectTransform, position, size);
            text.fontSize = fontSize;
            text.alignment = anchor;
            RecordOverride(text.rectTransform);
            RecordOverride(text);
        }

        private static void PlaceButton(Transform hero, string name, Vector2 position, Vector2 size, int fontSize)
        {
            Transform target = hero.Find(name);
            Button button = target != null ? target.GetComponent<Button>() : null;
            if (button == null) throw new InvalidOperationException("Missing hero button: " + name);
            TopLeft(button.GetComponent<RectTransform>(), position, size);
            RecordOverride(button.GetComponent<RectTransform>());
            Text label = button.transform.Find("Label")?.GetComponent<Text>();
            if (label == null) throw new InvalidOperationException("Missing button label: " + name);
            TopLeft(label.rectTransform, Vector2.zero, size);
            label.fontSize = fontSize;
            label.alignment = TextAnchor.MiddleCenter;
            RecordOverride(label.rectTransform);
            RecordOverride(label);
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHeroAreaView hero = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<TriadHeroAreaView>(true))
                .Single();
            RectTransform portrait = RequireRect(hero.transform, "HeroPortrait");
            float center = portrait.anchoredPosition.x + portrait.rect.width * .5f;
            if (Mathf.Abs(center - 183f) > 1f)
                throw new InvalidOperationException("Hibana must remain centered in the hero area.");
            RectTransform pose = RequireRect(hero.transform, "HeroPortrait/HibanaCharacterPose");
            if (pose.localScale.x > 1.11f || pose.localScale.y > 1.11f)
                throw new InvalidOperationException("Hibana scale would crop the face in the portrait mask.");
            if (portrait.GetSiblingIndex() >= hero.transform.Find("HeroInfoReadabilityPlate").GetSiblingIndex())
                throw new InvalidOperationException("Character information must remain readable above the character layer.");
            TriadRoundedRectGraphic panel = hero.GetComponent<TriadRoundedRectGraphic>();
            if (panel == null || panel.color.a > .001f || panel.BorderWidth > .001f)
                throw new InvalidOperationException("The full hero panel must remain transparent.");
            if (hero.transform.Find("HeroPortrait/HibanaCharacterPose/HibanaCharacterArt") == null)
                throw new InvalidOperationException("Hibana character art was lost.");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Button>(true)).Count() < 18)
                throw new InvalidOperationException("Existing interactive home controls were lost.");
        }

        private static RectTransform RequireRect(Transform root, string path)
        {
            RectTransform rect = root.Find(path)?.GetComponent<RectTransform>();
            if (rect == null) throw new InvalidOperationException("Missing RectTransform: " + path);
            return rect;
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
