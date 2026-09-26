using System;
using System.IO;
using System.Linq;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase2Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase34.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase35.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase1.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase2.unity";

        [MenuItem("TRIAD/Battle/Build Phase 2 Seat HUD")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource))
                TriadBattlePhase1Builder.Build();
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
            Debug.Log("[TRIAD BATTLE PHASE2] PASS: three-seat HUD and stone placement motion verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase2.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 2 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE2] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            TriadBattleBoardController controller = canvas.GetComponentInChildren<TriadBattleBoardController>(true);
            if (controller == null) throw new InvalidOperationException("Battle controller is missing.");
            controller.SetHomeSceneName("HomePhase35");

            Transform existing = canvas.Find("SeatHud");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
            Font font = canvas.GetComponentInChildren<Text>(true).font;
            GameObject hudObject = new GameObject("SeatHud", typeof(RectTransform), typeof(TriadBattleSeatHud));
            hudObject.transform.SetParent(canvas, false);
            TopLeft(hudObject.GetComponent<RectTransform>(), new Vector2(12f, 88f), new Vector2(366f, 49f));

            var panels = new TriadRoundedRectGraphic[3];
            var energies = new Text[3];
            var states = new Text[3];
            string[] names = { "ヒバナ", "ユキネ", "クオン" };
            Color[] accents =
            {
                new Color(1f, .36f, .14f, 1f), new Color(.55f, .72f, 1f, 1f), new Color(1f, .78f, .30f, 1f)
            };
            for (int index = 0; index < 3; index++)
            {
                float x = index * 123f;
                GameObject panelObject = new GameObject(
                    "Seat" + (index + 1), typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
                panelObject.transform.SetParent(hudObject.transform, false);
                TopLeft(panelObject.GetComponent<RectTransform>(), new Vector2(x, 0f), new Vector2(120f, 49f));
                panels[index] = panelObject.GetComponent<TriadRoundedRectGraphic>();
                panels[index].color = new Color(.008f, .016f, .034f, .92f);
                panels[index].BorderColor = accents[index];
                panels[index].BorderWidth = 1f;
                panels[index].CornerRadius = 8f;
                panels[index].raycastTarget = false;
                Text name = CreateText(panelObject.transform, "Name", names[index], new Vector2(5f, 3f), new Vector2(70f, 22f), 11, font);
                name.alignment = TextAnchor.MiddleLeft;
                states[index] = CreateText(panelObject.transform, "State", index == 0 ? "手番" : "待機",
                    new Vector2(76f, 3f), new Vector2(39f, 22f), 9, font);
                states[index].color = accents[index];
                energies[index] = CreateText(panelObject.transform, "Energy", index == 0 ? "気力 1/6" : "気力 0/6",
                    new Vector2(5f, 25f), new Vector2(110f, 19f), 9, font);
                energies[index].alignment = TextAnchor.MiddleLeft;
            }
            hudObject.GetComponent<TriadBattleSeatHud>().Configure(controller, panels, energies, states);

            RectTransform input = canvas.GetComponentsInChildren<RectTransform>(true).First(item => item.name == "BoardInput");
            TopLeft(input, new Vector2(12f, 140f), new Vector2(366f, 588f));
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);

            TriadBattleSeatHud hud = canvas.GetComponentInChildren<TriadBattleSeatHud>(true);
            if (hud == null || hud.SeatCount != 3 || hud.Controller != controller)
                throw new InvalidOperationException("Three-seat HUD is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            if (controller == null || router == null) throw new InvalidOperationException("Home route is missing.");
            router.Configure(controller, "BattlePhase2");
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
            text.color = new Color(1f, .92f, .74f, 1f);
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
