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
    public static class TriadHomePhase7Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase6Scene = Root + "/Scenes/HomePhase6.unity";
        private const string CommunityPrefab = Root + "/Prefabs/HomeCommunity.prefab";
        private const string ScenePath = Root + "/Scenes/HomePhase7.unity";
        private static readonly Color Navy900 = Hex("#091426"), Navy700 = Hex("#18304F");
        private static readonly Color Gold500 = Hex("#D5B45B"), Gold300 = Hex("#F1D792");
        private static readonly Color Ivory50 = Hex("#FFF7DE"), Ivory300 = Hex("#D9C99E");

        [MenuItem("TRIAD/UI/Build Home Through Phase 7")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase6Scene)) TriadHomePhase6Builder.Build();
            BuildCommunity(); BuildScene(); Verify();
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE7] PASS: Community built, connected, and verified.");
        }

        public static void BuildAndVerify() => Build();
        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "UI", "Player", "TRIADHomePhase7.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { ScenePath }, locationPathName = output, target = BuildTarget.StandaloneWindows64 });
            if (report.summary.result != BuildResult.Succeeded) throw new InvalidOperationException("Phase 7 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE7] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildCommunity()
        {
            GameObject root = Panel("HomeCommunity", null, Vector2.zero, new Vector2(366, 52), Navy900, Gold500, 12);
            TriadCommunityView view = root.AddComponent<TriadCommunityView>();
            Button community = Button(root.transform, "CommunityButton", "交流", new Vector2(7, 8), new Vector2(92, 36), Navy700, 14);
            Text(root.transform, "PlayerCodeKicker", "PLAYER CODE", new Vector2(110, 6), new Vector2(150, 14), 8, Gold300, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text code = Text(root.transform, "PlayerCode", "TRIAD-8F3K-2M7Q", new Vector2(110, 21), new Vector2(166, 24), 11, Ivory50, TextAnchor.MiddleLeft, FontStyle.Bold);
            Button copy = Button(root.transform, "CopyCodeButton", "コピー", new Vector2(280, 8), new Vector2(78, 36), Navy700, 11);
            Text copyLabel = copy.GetComponentInChildren<Text>(true);
            view.Configure(community, copy, code, copyLabel);
            PrefabUtility.SaveAsPrefabAsset(root, CommunityPrefab); UnityEngine.Object.DestroyImmediate(root);
        }

        private static void BuildScene()
        {
            Scene scene = EditorSceneManager.OpenScene(Phase6Scene, OpenSceneMode.Single);
            GameObject canvas = scene.GetRootGameObjects().First(x => x.name == "HomeCanvas");
            TriadCommunityView community = Spawn<TriadCommunityView>(CommunityPrefab, canvas.transform, "HomeCommunity", new Vector2(12, 784), new Vector2(366, 52));
            TriadHomeScreenController controller = canvas.GetComponent<TriadHomeScreenController>();
            controller.Configure(canvas.GetComponentInChildren<TriadHomeHeaderView>(true), canvas.GetComponentInChildren<TriadPlayerStatusView>(true),
                canvas.GetComponentInChildren<TriadHeroAreaView>(true), canvas.GetComponentInChildren<TriadStoryBannerView>(true),
                canvas.GetComponentInChildren<TriadMainCtaView>(true), canvas.GetComponentInChildren<TriadSubMenuView>(true), community);
            EditorSceneManager.SaveScene(scene, ScenePath);
            var settings = EditorBuildSettings.scenes.Where(x => !x.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal)).ToList();
            settings.Add(new EditorBuildSettingsScene(ScenePath, true)); EditorBuildSettings.scenes = settings.ToArray();
        }

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadCommunityView view = scene.GetRootGameObjects().SelectMany(x => x.GetComponentsInChildren<TriadCommunityView>(true)).SingleOrDefault();
            if (!view || view.GetComponentsInChildren<Button>(true).Length != 2) throw new InvalidOperationException("Community controls missing");
            if (TriadHomeRoute.Community.ToLegacyViewKey() != "friends") throw new InvalidOperationException("Community route parity failed");
            var sample = new TriadHomeSnapshot(); if (string.IsNullOrWhiteSpace(sample.playerCode)) throw new InvalidOperationException("Player code binding missing");
        }

        private static T Spawn<T>(string path, Transform parent, string name, Vector2 pos, Vector2 size) where T : Component
        {
            GameObject asset = AssetDatabase.LoadAssetAtPath<GameObject>(path); if (!asset) throw new InvalidOperationException("Missing prefab: " + path);
            GameObject go = (GameObject)PrefabUtility.InstantiatePrefab(asset, parent); go.name = name; TopLeft(go.GetComponent<RectTransform>(), pos, size); return go.GetComponent<T>();
        }

        private static GameObject Panel(string name, Transform parent, Vector2 pos, Vector2 size, Color fill, Color border, float radius)
        {
            GameObject go = new(name, typeof(RectTransform)); if (parent) go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            TriadRoundedRectGraphic g = go.AddComponent<TriadRoundedRectGraphic>(); g.color = fill; g.BorderColor = border; g.BorderWidth = border.a > 0 ? 1 : 0; g.CornerRadius = radius; g.raycastTarget = false; return go;
        }
        private static Button Button(Transform parent, string name, string label, Vector2 pos, Vector2 size, Color fill, int fontSize)
        {
            GameObject go = Panel(name, parent, pos, size, fill, Gold500, 9); TriadRoundedRectGraphic g = go.GetComponent<TriadRoundedRectGraphic>(); g.raycastTarget = true;
            Button b = go.AddComponent<Button>(); b.targetGraphic = g; Text(go.transform, "Label", label, Vector2.zero, size, fontSize, Ivory50, TextAnchor.MiddleCenter, FontStyle.Bold); return b;
        }
        private static Text Text(Transform parent, string name, string value, Vector2 pos, Vector2 size, int fontSize, Color color, TextAnchor anchor, FontStyle style)
        {
            GameObject go = new(name, typeof(RectTransform)); go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            Text t = go.AddComponent<Text>(); t.text = value; t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); t.fontSize = fontSize; t.fontStyle = style; t.color = color; t.alignment = anchor; t.raycastTarget = false; return t;
        }
        private static void TopLeft(RectTransform r, Vector2 pos, Vector2 size) { r.anchorMin = r.anchorMax = r.pivot = new Vector2(0, 1); r.anchoredPosition = new Vector2(pos.x, -pos.y); r.sizeDelta = size; }
        private static Color Hex(string value) { if (!ColorUtility.TryParseHtmlString(value, out Color c)) throw new ArgumentException(value); return c; }
    }
}
