using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase5Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string HeaderPrefab = Root + "/Prefabs/HomeTopHeader.prefab";
        private const string PlayerPrefab = Root + "/Prefabs/HomePlayerStatus.prefab";
        private const string HeroPrefab = Root + "/Prefabs/HomeHeroArea.prefab";
        private const string StoryPrefab = Root + "/Prefabs/HomeStoryBanner.prefab";
        private const string CtaPrefab = Root + "/Prefabs/HomeMainCta.prefab";
        private const string ScenePath = Root + "/Scenes/HomePhase5.unity";

        private static readonly Color Navy950 = Hex("#050812"), Navy900 = Hex("#091426"), Navy800 = Hex("#10213A"), Navy700 = Hex("#18304F");
        private static readonly Color Gold500 = Hex("#D5B45B"), Gold300 = Hex("#F1D792"), Ivory50 = Hex("#FFF7DE"), Ivory300 = Hex("#D9C99E");
        private static readonly Color Red500 = Hex("#E5484D"), Ember = Hex("#D2622C");

        [MenuItem("TRIAD/UI/Build Home Through Phase 5")]
        public static void Build()
        {
            TriadHomePhase1Builder.Build();
            BuildPlayerStatus();
            BuildHeroArea();
            BuildStoryBanner();
            BuildMainCta();
            BuildScene();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE5] PASS: Phases 2-5 built and verified.");
        }

        public static void BuildAndVerify() => Build();

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase5.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 5 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE5] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildPlayerStatus()
        {
            GameObject root = Panel("HomePlayerStatus", null, Vector2.zero, new Vector2(366, 72), Navy900, Gold500, 12);
            root.AddComponent<TriadPlayerStatusView>();
            GameObject avatar = Panel("PlayerIcon", root.transform, new Vector2(10, 10), new Vector2(52, 52), Navy700, Gold300, 26);
            Text avatarText = Text(avatar.transform, "PlayerMonogram", "旅", Vector2.zero, new Vector2(52, 52), 24, Gold300, TextAnchor.MiddleCenter, FontStyle.Bold);
            Text name = Text(root.transform, "PlayerName", "旅人", new Vector2(72, 8), new Vector2(104, 22), 16, Ivory50, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text level = Text(root.transform, "PlayerLevel", "Lv 3", new Vector2(184, 8), new Vector2(48, 22), 13, Gold300, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text rank = Text(root.transform, "PlayerRank", "三段", new Vector2(278, 8), new Vector2(78, 22), 13, Gold300, TextAnchor.MiddleRight, FontStyle.Bold);
            Text title = Text(root.transform, "PlayerTitle", "宵桜の棋士", new Vector2(72, 30), new Vector2(126, 17), 10, Ivory300, TextAnchor.MiddleLeft, FontStyle.Normal);
            Text xp = Text(root.transform, "PlayerExp", "EXP 75/100", new Vector2(252, 31), new Vector2(104, 16), 9, Ivory300, TextAnchor.MiddleRight, FontStyle.Normal);
            GameObject track = Panel("ExpTrack", root.transform, new Vector2(72, 53), new Vector2(284, 8), Navy950, Color.clear, 4);
            GameObject fill = Panel("ExpFill", track.transform, Vector2.zero, Vector2.zero, Gold500, Color.clear, 4);
            RectTransform fillRect = fill.GetComponent<RectTransform>(); fillRect.anchorMin = Vector2.zero; fillRect.anchorMax = new Vector2(.75f, 1); fillRect.offsetMin = Vector2.zero; fillRect.offsetMax = Vector2.zero;
            root.GetComponent<TriadPlayerStatusView>().Configure(name, level, xp, rank, title, fillRect);
            Save(root, PlayerPrefab);
        }

        private static void BuildHeroArea()
        {
            GameObject root = Panel("HomeHeroArea", null, Vector2.zero, new Vector2(366, 290), Navy900, Gold500, 14);
            root.AddComponent<TriadHeroAreaView>();
            Panel("MoonGlow", root.transform, new Vector2(196, 18), new Vector2(142, 142), new Color(.95f, .82f, .48f, .12f), Gold500, 71).GetComponent<TriadRoundedRectGraphic>().BorderWidth = 1;
            Text kicker = Text(root.transform, "HeroKicker", "選択中の棋士", new Vector2(18, 22), new Vector2(140, 18), 10, Gold300, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text name = Text(root.transform, "HeroName", "ヒバナ", new Vector2(18, 46), new Vector2(150, 38), 28, Ivory50, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text role = Text(root.transform, "HeroRole", "火花の巫女", new Vector2(20, 86), new Vector2(140, 22), 12, Ivory300, TextAnchor.MiddleLeft, FontStyle.Normal);
            GameObject skillPlate = Panel("SkillPlate", root.transform, new Vector2(18, 120), new Vector2(148, 34), Navy950, Gold500, 8);
            Text skill = Text(skillPlate.transform, "HeroSkill", "固有技｜火花", new Vector2(10, 5), new Vector2(128, 24), 11, Gold300, TextAnchor.MiddleLeft, FontStyle.Bold);
            Button detail = Button(root.transform, "HeroDetailButton", "詳細", new Vector2(18, 238), new Vector2(68, 34), Navy800);
            Button costume = Button(root.transform, "HeroCostumeButton", "衣装", new Vector2(94, 238), new Vector2(68, 34), Navy800);
            GameObject art = new("HeroPortrait", typeof(RectTransform), typeof(TriadHeroPortraitGraphic)); art.transform.SetParent(root.transform, false); TopLeft(art.GetComponent<RectTransform>(), new Vector2(164, 18), new Vector2(190, 262));
            TriadHeroPortraitGraphic portrait = art.GetComponent<TriadHeroPortraitGraphic>(); portrait.color = Color.white; portrait.raycastTarget = false;
            root.GetComponent<TriadHeroAreaView>().Configure(name, role, skill, portrait);
            Save(root, HeroPrefab);
        }

        private static void BuildStoryBanner()
        {
            GameObject root = Panel("HomeStoryBanner", null, Vector2.zero, new Vector2(366, 100), Navy800, Gold500, 12);
            root.AddComponent<TriadStoryBannerView>();
            GameObject badgePlate = Panel("StoryBadge", root.transform, new Vector2(12, 12), new Vector2(44, 22), Red500, Color.clear, 6);
            Text badge = Text(badgePlate.transform, "StoryBadgeLabel", "新章", Vector2.zero, new Vector2(44, 22), 10, Color.white, TextAnchor.MiddleCenter, FontStyle.Bold);
            Text title = Text(root.transform, "StoryTitle", "第5段  花骸の夜桜", new Vector2(66, 10), new Vector2(248, 28), 15, Ivory50, TextAnchor.MiddleLeft, FontStyle.Bold);
            Text progress = Text(root.transform, "StoryProgress", "制覇 4/30段", new Vector2(12, 44), new Vector2(100, 18), 10, Ivory300, TextAnchor.MiddleLeft, FontStyle.Normal);
            Text(root.transform, "StoryArrow", "›", new Vector2(330, 18), new Vector2(24, 48), 28, Gold300, TextAnchor.MiddleCenter, FontStyle.Normal);
            GameObject track = Panel("StoryProgressTrack", root.transform, new Vector2(12, 68), new Vector2(342, 8), Navy950, Color.clear, 4);
            GameObject fill = Panel("StoryProgressFill", track.transform, Vector2.zero, Vector2.zero, Ember, Color.clear, 4);
            RectTransform fillRect = fill.GetComponent<RectTransform>(); fillRect.anchorMin = Vector2.zero; fillRect.anchorMax = new Vector2(4f / 30f, 1); fillRect.offsetMin = Vector2.zero; fillRect.offsetMax = Vector2.zero;
            Text(root.transform, "CarouselDots", "●  ○  ○", new Vector2(138, 80), new Vector2(90, 16), 8, Gold300, TextAnchor.MiddleCenter, FontStyle.Normal);
            root.GetComponent<TriadStoryBannerView>().Configure(badge, title, progress, fillRect);
            Save(root, StoryPrefab);
        }

        private static void BuildMainCta()
        {
            GameObject root = new("HomeMainCta", typeof(RectTransform), typeof(TriadMainCtaView)); root.GetComponent<RectTransform>().sizeDelta = new Vector2(366, 82);
            Button battle = Button(root.transform, "BattleButton", "対戦する", Vector2.zero, new Vector2(177, 70), Ember);
            Text(battle.transform, "BattleSubLabel", "三人対戦へ", new Vector2(12, 43), new Vector2(153, 17), 9, Ivory50, TextAnchor.MiddleCenter, FontStyle.Normal);
            Button story = Button(root.transform, "StoryButton", "物語", new Vector2(189, 0), new Vector2(177, 70), Navy700);
            Text(story.transform, "StorySubLabel", "六つの碁印", new Vector2(12, 43), new Vector2(153, 17), 9, Ivory300, TextAnchor.MiddleCenter, FontStyle.Normal);
            root.GetComponent<TriadMainCtaView>().Configure(battle, story);
            Save(root, CtaPrefab);
        }

        private static void BuildScene()
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single); scene.name = "HomePhase5";
            GameObject camGo = new("MainCamera", typeof(Camera)); camGo.tag = "MainCamera"; Camera cam = camGo.GetComponent<Camera>(); cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Navy950; cam.orthographic = true; cam.transform.position = new Vector3(0, 0, -10);
            GameObject canvasGo = new("HomeCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster), typeof(TriadHomeScreenController));
            Canvas canvas = canvasGo.GetComponent<Canvas>(); canvas.renderMode = RenderMode.ScreenSpaceCamera; canvas.worldCamera = cam; canvas.planeDistance = 100;
            CanvasScaler scaler = canvasGo.GetComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize; scaler.referenceResolution = new Vector2(390, 844); scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight; scaler.matchWidthOrHeight = .5f;
            TriadHomeHeaderView header = Spawn<TriadHomeHeaderView>(HeaderPrefab, canvasGo.transform, "HomeTopHeader", new Vector2(12, 47), new Vector2(366, 45));
            TriadPlayerStatusView player = Spawn<TriadPlayerStatusView>(PlayerPrefab, canvasGo.transform, "HomePlayerStatus", new Vector2(12, 100), new Vector2(366, 72));
            TriadHeroAreaView hero = Spawn<TriadHeroAreaView>(HeroPrefab, canvasGo.transform, "HomeHeroArea", new Vector2(12, 180), new Vector2(366, 290));
            TriadStoryBannerView story = Spawn<TriadStoryBannerView>(StoryPrefab, canvasGo.transform, "HomeStoryBanner", new Vector2(12, 478), new Vector2(366, 100));
            TriadMainCtaView cta = Spawn<TriadMainCtaView>(CtaPrefab, canvasGo.transform, "HomeMainCta", new Vector2(12, 586), new Vector2(366, 82));
            canvasGo.GetComponent<TriadHomeScreenController>().Configure(header, player, hero, story, cta);
            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            new GameObject("ScreenshotRunner", typeof(TriadHomeScreenshotRunner));
            EditorSceneManager.SaveScene(scene, ScenePath);
            var settings = EditorBuildSettings.scenes.Where(x => x.path != Root + "/Scenes/HomePhase1Header.unity").ToList();
            if (settings.All(x => x.path != ScenePath)) settings.Add(new EditorBuildSettingsScene(ScenePath, true));
            EditorBuildSettings.scenes = settings.ToArray();
        }

        private static T Spawn<T>(string path, Transform parent, string name, Vector2 pos, Vector2 size) where T : Component
        {
            GameObject asset = AssetDatabase.LoadAssetAtPath<GameObject>(path); if (!asset) throw new InvalidOperationException("Missing prefab: " + path);
            GameObject go = (GameObject)PrefabUtility.InstantiatePrefab(asset, parent); go.name = name; TopLeft(go.GetComponent<RectTransform>(), pos, size); return go.GetComponent<T>();
        }

        private static void Verify()
        {
            foreach (string path in new[] { HeaderPrefab, PlayerPrefab, HeroPrefab, StoryPrefab, CtaPrefab }) if (!AssetDatabase.LoadAssetAtPath<GameObject>(path)) throw new InvalidOperationException("Missing prefab: " + path);
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            TriadHomeScreenController controller = scene.GetRootGameObjects().SelectMany(x => x.GetComponentsInChildren<TriadHomeScreenController>(true)).FirstOrDefault();
            if (!controller) throw new InvalidOperationException("Missing home controller");
            if (scene.GetRootGameObjects().SelectMany(x => x.GetComponentsInChildren<Button>(true)).Count() < 6) throw new InvalidOperationException("Home screen buttons missing");
            var sample = new TriadHomeSnapshot { playerXp = 275, clearedStoryStages = 4, totalStoryStages = 30 };
            if (sample.PlayerLevel != 3 || sample.XpIntoLevel != 75) throw new InvalidOperationException("Player XP parity failed");
            if (Mathf.Abs(sample.StoryRatio - 4f / 30f) > .0001f) throw new InvalidOperationException("Story progress parity failed");
            var gate = new TriadHomeNavigationGate();
            if (!gate.TryRequest() || gate.TryRequest()) throw new InvalidOperationException("Double-tap gate failed");
            if (gate.TryBackFromHome()) throw new InvalidOperationException("Home back behavior failed");
            gate.Complete();
            if (!gate.TryRequest()) throw new InvalidOperationException("Navigation completion failed");
        }

        private static GameObject Panel(string name, Transform parent, Vector2 pos, Vector2 size, Color fill, Color border, float radius)
        {
            GameObject go = new(name, typeof(RectTransform)); if (parent) go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            TriadRoundedRectGraphic g = go.AddComponent<TriadRoundedRectGraphic>(); g.color = fill; g.BorderColor = border; g.BorderWidth = border.a > 0 ? 1 : 0; g.CornerRadius = radius; g.raycastTarget = false; return go;
        }

        private static Button Button(Transform parent, string name, string label, Vector2 pos, Vector2 size, Color fill)
        {
            GameObject go = Panel(name, parent, pos, size, fill, Gold500, 12); TriadRoundedRectGraphic g = go.GetComponent<TriadRoundedRectGraphic>(); g.raycastTarget = true;
            Button b = go.AddComponent<Button>(); b.targetGraphic = g; ColorBlock c = b.colors; c.normalColor = Color.white; c.highlightedColor = new Color(1,1,1,.94f); c.pressedColor = new Color(.70f,.70f,.70f,1); c.disabledColor = new Color(.35f,.35f,.35f,.65f); c.fadeDuration = .06f; b.colors = c;
            Text(go.transform, "Label", label, new Vector2(10, 11), new Vector2(size.x - 20, 32), 19, Ivory50, TextAnchor.MiddleCenter, FontStyle.Bold); return b;
        }

        private static Text Text(Transform parent, string name, string value, Vector2 pos, Vector2 size, int fontSize, Color color, TextAnchor anchor, FontStyle style)
        {
            GameObject go = new(name, typeof(RectTransform)); go.transform.SetParent(parent, false); TopLeft(go.GetComponent<RectTransform>(), pos, size);
            Text t = go.AddComponent<Text>(); t.text = value; t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); t.fontSize = fontSize; t.fontStyle = style; t.color = color; t.alignment = anchor; t.raycastTarget = false; t.supportRichText = false; return t;
        }

        private static void TopLeft(RectTransform r, Vector2 pos, Vector2 size)
        { r.anchorMin = new Vector2(0,1); r.anchorMax = new Vector2(0,1); r.pivot = new Vector2(0,1); r.anchoredPosition = new Vector2(pos.x,-pos.y); r.sizeDelta = size; }
        private static void Save(GameObject go, string path) { PrefabUtility.SaveAsPrefabAsset(go, path); UnityEngine.Object.DestroyImmediate(go); }
        private static Color Hex(string value) { if (!ColorUtility.TryParseHtmlString(value, out Color c)) throw new ArgumentException(value); return c; }
    }
}
