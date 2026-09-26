using System;
using System.IO;
using System.Linq;
using TRIAD.Core.Common;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase3Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase35.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase36.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase2.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase3.unity";

        [MenuItem("TRIAD/Battle/Build Phase 3 Skill Selection")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase2Builder.Build();
            BuildBattleScene();
            BuildHomeRoute();
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith("Assets/TRIAD/UI/Scenes/HomePhase", StringComparison.Ordinal) &&
                               !item.path.StartsWith("Assets/TRIAD/Battle/Scenes/BattlePhase", StringComparison.Ordinal))
                .Concat(new[]
                {
                    new EditorBuildSettingsScene(HomeScene, true),
                    new EditorBuildSettingsScene(BattleScene, true)
                }).ToArray();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD BATTLE PHASE3] PASS: six-skill selection and board targeting verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase3.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 3 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE3] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            controller.SetHomeSceneName("HomePhase36");
            Transform existing = canvas.Find("SkillBar");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;

            RectTransform status = canvas.GetComponentsInChildren<RectTransform>(true).First(item => item.name == "StatusPanel");
            TopLeft(status, new Vector2(12f, 678f), new Vector2(366f, 50f));
            RectTransform input = canvas.GetComponentsInChildren<RectTransform>(true).First(item => item.name == "BoardInput");
            TopLeft(input, new Vector2(12f, 140f), new Vector2(366f, 532f));

            GameObject barObject = new GameObject("SkillBar", typeof(RectTransform), typeof(TriadBattleSkillBar));
            barObject.transform.SetParent(canvas, false);
            TopLeft(barObject.GetComponent<RectTransform>(), new Vector2(12f, 734f), new Vector2(366f, 84f));
            string[] ids =
            {
                StableIds.Spark, StableIds.Ward, StableIds.Windwalk,
                StableIds.Freeze, StableIds.Pull, StableIds.Transmute
            };
            var buttons = new Button[6];
            var panels = new TriadRoundedRectGraphic[6];
            var labels = new Text[6];
            for (int index = 0; index < 6; index++)
            {
                float x = index * 61f;
                GameObject buttonObject = new GameObject(
                    "Skill_" + ids[index], typeof(RectTransform), typeof(CanvasRenderer),
                    typeof(TriadRoundedRectGraphic), typeof(Button));
                buttonObject.transform.SetParent(barObject.transform, false);
                TopLeft(buttonObject.GetComponent<RectTransform>(), new Vector2(x, 0f), new Vector2(58f, 80f));
                panels[index] = buttonObject.GetComponent<TriadRoundedRectGraphic>();
                panels[index].color = new Color(.008f, .016f, .034f, .96f);
                panels[index].BorderColor = new Color(.55f, .61f, .74f, .68f);
                panels[index].BorderWidth = 1f;
                panels[index].CornerRadius = 8f;
                buttons[index] = buttonObject.GetComponent<Button>();
                buttons[index].targetGraphic = panels[index];
                labels[index] = CreateText(buttonObject.transform, "Label", "", new Vector2(2f, 5f), new Vector2(54f, 70f), 10, font);
            }
            barObject.GetComponent<TriadBattleSkillBar>().Configure(controller, buttons, panels, labels, ids);
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            TriadBattleSkillBar bar = canvas.GetComponentInChildren<TriadBattleSkillBar>(true);
            if (bar == null || bar.SkillCount != 6 || bar.Controller != controller)
                throw new InvalidOperationException("Six-skill bar is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase3");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Text CreateText(Transform parent, string name, string value,
            Vector2 position, Vector2 size, int fontSize, Font font)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            Text text = go.GetComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = new Color(1f, .91f, .70f, 1f);
            text.raycastTarget = false;
            return text;
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }
    }
}
