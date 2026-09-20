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
    public static class TriadHomePhase6Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase5Scene = Root + "/Scenes/HomePhase5.unity";
        private const string SubMenuPrefab = Root + "/Prefabs/HomeSubMenu.prefab";
        private const string ScenePath = Root + "/Scenes/HomePhase6.unity";

        private static readonly Color Navy950 = Hex("#050812");
        private static readonly Color Navy900 = Hex("#091426");
        private static readonly Color Navy700 = Hex("#18304F");
        private static readonly Color Gold500 = Hex("#D5B45B");
        private static readonly Color Gold300 = Hex("#F1D792");
        private static readonly Color Ivory50 = Hex("#FFF7DE");
        private static readonly Color Ivory300 = Hex("#D9C99E");
        private static readonly Color Red500 = Hex("#E5484D");

        [MenuItem("TRIAD/UI/Build Home Through Phase 6")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase5Scene))
                TriadHomePhase5Builder.Build();
            BuildSubMenu();
            BuildScene();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE6] PASS: Sub Menu built, connected, and verified.");
        }

        public static void BuildAndVerify() => Build();

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase6.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 6 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE6] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildSubMenu()
        {
            GameObject root = new("HomeSubMenu", typeof(RectTransform), typeof(TriadSubMenuView));
            root.GetComponent<RectTransform>().sizeDelta = new Vector2(366, 105);

            Button world = MenuButton(root.transform, "WorldButton", "世界", "ONLINE", 0, TriadSubMenuIconGraphic.IconKind.World);
            Button gacha = MenuButton(root.transform, "GachaButton", "ガチャ", "召喚", 94, TriadSubMenuIconGraphic.IconKind.Gacha);
            Button wardrobe = MenuButton(root.transform, "WardrobeButton", "着せ替え", "外見", 188, TriadSubMenuIconGraphic.IconKind.Wardrobe);
            Button training = MenuButton(root.transform, "CharacterTrainingButton", "キャラ強化", "育成", 282, TriadSubMenuIconGraphic.IconKind.Training);

            GameObject badge = Panel("GachaNewBadge", gacha.transform, new Vector2(57, 5), new Vector2(22, 14), Red500, Color.clear, 7);
            Text(badge.transform, "Label", "NEW", Vector2.zero, new Vector2(22, 14), 7, Color.white, TextAnchor.MiddleCenter, FontStyle.Bold);

            root.GetComponent<TriadSubMenuView>().Configure(world, gacha, wardrobe, training, badge);
            PrefabUtility.SaveAsPrefabAsset(root, SubMenuPrefab);
            UnityEngine.Object.DestroyImmediate(root);
        }

        private static Button MenuButton(Transform parent, string name, string label, string caption, float x,
            TriadSubMenuIconGraphic.IconKind iconKind)
        {
            GameObject go = Panel(name, parent, new Vector2(x, 0), new Vector2(84, 96), Navy900, Gold500, 12);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>(); panel.raycastTarget = true;
            Button button = go.AddComponent<Button>(); button.targetGraphic = panel;
            ColorBlock colors = button.colors;
            colors.normalColor = Color.white; colors.highlightedColor = new Color(1, 1, 1, .94f);
            colors.pressedColor = new Color(.70f, .70f, .70f, 1); colors.disabledColor = new Color(.35f, .35f, .35f, .65f);
            colors.fadeDuration = .06f; button.colors = colors;

            GameObject iconGo = new("Icon", typeof(RectTransform), typeof(TriadSubMenuIconGraphic));
            iconGo.transform.SetParent(go.transform, false); TopLeft(iconGo.GetComponent<RectTransform>(), new Vector2(27, 10), new Vector2(30, 30));
            TriadSubMenuIconGraphic icon = iconGo.GetComponent<TriadSubMenuIconGraphic>(); icon.Kind = iconKind; icon.color = Gold300; icon.raycastTarget = false;
            Text(go.transform, "Label", label, new Vector2(4, 44), new Vector2(76, 24), label.Length > 4 ? 11 : 13, Ivory50, TextAnchor.MiddleCenter, FontStyle.Bold);
            Text(go.transform, "Caption", caption, new Vector2(4, 69), new Vector2(76, 16), 8, Ivory300, TextAnchor.MiddleCenter, FontStyle.Normal);
            return button;
        }

        private static void BuildScene()
        {
            Scene scene = EditorSceneManager.OpenScene(Phase5Scene, OpenSceneMode.Single);
            GameObject canvas = scene.GetRootGameObjects().First(x => x.name == "HomeCanvas");
            TriadSubMenuView subMenu = Spawn<TriadSubMenuView>(SubMenuPrefab, canvas.transform, "HomeSubMenu", new Vector2(12, 676), new Vector2(366, 105));
            TriadHomeScreenController controller = canvas.GetComponent<TriadHomeScreenController>();
            controller.Configure(
                canvas.GetComponentInChildren<TriadHomeHeaderView>(true),
                canvas.GetComponentInChildren<TriadPlayerStatusView>(true),
                canvas.GetComponentInChildren<TriadHeroAreaView>(true),
                canvas.GetComponentInChildren<TriadStoryBannerView>(true),
                canvas.GetComponentInChildren<TriadMainCtaView>(true),
                subMenu);

            EditorSceneManager.SaveScene(scene, ScenePath);
            var settings = EditorBuildSettings.scenes
                .Where(x => x.path != Root + "/Scenes/HomePhase1Header.unity" && x.path != Phase5Scene && x.path != ScenePath)
                .ToList();
            settings.Add(new EditorBuildSettingsScene(ScenePath, true));
            EditorBuildSettings.scenes = settings.ToArray();
        }

        private static T Spawn<T>(string path, Transform parent, string name, Vector2 pos, Vector2 size) where T : Component
        {
            GameObject asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (!asset) throw new InvalidOperationException("Missing prefab: " + path);
            GameObject go = (GameObject)PrefabUtility.InstantiatePrefab(asset, parent); go.name = name;
            TopLeft(go.GetComponent<RectTransform>(), pos, size); return go.GetComponent<T>();
        }

        private static void Verify()
        {
            if (!AssetDatabase.LoadAssetAtPath<GameObject>(SubMenuPrefab)) throw new InvalidOperationException("Missing Sub Menu prefab");
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadSubMenuView subMenu = scene.GetRootGameObjects().SelectMany(x => x.GetComponentsInChildren<TriadSubMenuView>(true)).SingleOrDefault();
            if (!subMenu) throw new InvalidOperationException("Missing Sub Menu view");
            Button[] buttons = subMenu.GetComponentsInChildren<Button>(true);
            if (buttons.Length != 4) throw new InvalidOperationException("Sub Menu must contain exactly four buttons");
            if (Enum.GetValues(typeof(TriadHomeRoute)).Cast<TriadHomeRoute>().Any(x => string.IsNullOrWhiteSpace(x.ToLegacyViewKey())))
                throw new InvalidOperationException("A home route is missing its legacy view contract");
            if (TriadHomeRoute.World.ToLegacyViewKey() != "online" || TriadHomeRoute.CharacterTraining.ToLegacyViewKey() != "chars")
                throw new InvalidOperationException("Sub Menu legacy route parity failed");
            var gate = new TriadHomeNavigationGate();
            if (!gate.TryRequest() || gate.TryRequest()) throw new InvalidOperationException("Sub Menu double-tap gate failed");
            gate.Complete();
            if (!gate.TryRequest() || gate.TryBackFromHome()) throw new InvalidOperationException("Sub Menu navigation gate recovery failed");
        }

        private static GameObject Panel(string name, Transform parent, Vector2 pos, Vector2 size, Color fill, Color border, float radius)
        {
            GameObject go = new(name, typeof(RectTransform)); go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            TriadRoundedRectGraphic graphic = go.AddComponent<TriadRoundedRectGraphic>(); graphic.color = fill;
            graphic.BorderColor = border; graphic.BorderWidth = border.a > 0 ? 1 : 0; graphic.CornerRadius = radius; graphic.raycastTarget = false;
            return go;
        }

        private static Text Text(Transform parent, string name, string value, Vector2 pos, Vector2 size, int fontSize,
            Color color, TextAnchor anchor, FontStyle style)
        {
            GameObject go = new(name, typeof(RectTransform)); go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            Text text = go.AddComponent<Text>(); text.text = value; text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize; text.fontStyle = style; text.color = color; text.alignment = anchor;
            text.raycastTarget = false; text.supportRichText = false; return text;
        }

        private static void TopLeft(RectTransform rect, Vector2 pos, Vector2 size)
        {
            rect.anchorMin = new Vector2(0, 1); rect.anchorMax = new Vector2(0, 1); rect.pivot = new Vector2(0, 1);
            rect.anchoredPosition = new Vector2(pos.x, -pos.y); rect.sizeDelta = size;
        }

        private static Color Hex(string value)
        {
            if (!ColorUtility.TryParseHtmlString(value, out Color color)) throw new ArgumentException(value);
            return color;
        }
    }
}
