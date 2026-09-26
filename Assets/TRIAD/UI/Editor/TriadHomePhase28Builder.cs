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
    public static class TriadHomePhase28Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase27Scene = Root + "/Scenes/HomePhase27.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase28.unity";
        private const string CharacterPath = Root + "/Art/Characters/HibanaSeated-v4.png";
        private const string BoardPath = Root + "/Art/Props/HomeGoBoardPerspective-v2.png";
        private const string BackgroundPath = Root + "/Art/Backgrounds/HomeShrineStage-v3.png";
        private const string MenuAtlasPath = Root + "/Art/Menu/HomeSubMenuAtlas-v2.png";
        private const string BattlePath = Root + "/Art/CTA/BattleCtaBackground-v1.png";
        private const string StoryPath = Root + "/Art/CTA/StoryCtaBackground-v1.png";
        private const string SubMenuEmblemPath = Root + "/Art/Menu/HomeSubMenuEmblemAtlas-v1.png";
        private const string MainCtaEmblemPath = Root + "/Art/CTA/HomeMainCtaEmblemAtlas-v1.png";

        [MenuItem("TRIAD/UI/Build Home Phase 28 Sculpted Menu Buttons")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase27Scene))
                TriadHomePhase27Builder.Build();

            ConfigureTexture(CharacterPath, true);
            ConfigureTexture(BoardPath, true);
            ConfigureTexture(BackgroundPath, false);
            ConfigureTexture(MenuAtlasPath, false);
            ConfigureTexture(BattlePath, false);
            ConfigureTexture(StoryPath, false);
            ConfigureTexture(SubMenuEmblemPath, true);
            ConfigureTexture(MainCtaEmblemPath, true);

            Texture2D characterTexture = RequireTexture(CharacterPath);
            Texture2D boardTexture = RequireTexture(BoardPath);
            Texture2D subMenuEmblems = RequireTexture(SubMenuEmblemPath);
            Texture2D mainCtaEmblems = RequireTexture(MainCtaEmblemPath);
            Scene scene = EditorSceneManager.OpenScene(Phase27Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigureCanvas(canvas);
            ConfigureCharacter(canvas, characterTexture);
            ConfigureBoard(canvas, boardTexture);
            ConfigureSeatContact(canvas);
            ConfigureMainCta(canvas, mainCtaEmblems);
            ConfigureSubMenu(canvas, subMenuEmblems);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) })
                .ToArray();
            Verify();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE28] PASS: Tight sculpted button groups, dimensional function ornaments, and live labels verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase28.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 28 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE28] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigureCanvas(Transform canvasTransform)
        {
            Canvas canvas = canvasTransform.GetComponent<Canvas>();
            canvas.pixelPerfect = true;
            CanvasScaler scaler = canvasTransform.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390f, 844f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = .5f;
            RecordOverride(canvas);
            RecordOverride(scaler);
        }

        private static void ConfigureCharacter(Transform canvas, Texture2D texture)
        {
            TriadHeroAreaView heroView = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single();
            Transform hero = heroView.transform;
            RectTransform portrait = Require<RectTransform>(hero, "HeroPortrait");
            TopLeft(portrait, new Vector2(0f, -2f), new Vector2(366f, 362f));

            RectTransform pose = Require<RectTransform>(portrait, "HibanaCharacterPose");
            pose.anchoredPosition = new Vector2(0f, -15f);
            pose.localScale = new Vector3(1.20f, 1.20f, 1f);

            RawImage art = Require<RawImage>(pose, "HibanaCharacterArt");
            RawImage shadow = Require<RawImage>(pose, "HibanaCharacterShadow");
            foreach (RawImage layer in new[] { shadow, art })
            {
                layer.texture = texture;
                layer.uvRect = new Rect(0f, 0f, 1f, 1f);
                AspectRatioFitter fitter = layer.GetComponent<AspectRatioFitter>() ?? layer.gameObject.AddComponent<AspectRatioFitter>();
                fitter.aspectMode = AspectRatioFitter.AspectMode.FitInParent;
                fitter.aspectRatio = texture.width / (float)texture.height;
                layer.raycastTarget = false;
                RecordOverride(layer);
                RecordOverride(fitter);
            }
            art.color = Color.white;
            shadow.color = new Color(.015f, .006f, .020f, .10f);
            shadow.rectTransform.anchoredPosition = new Vector2(2f, -2f);
            RecordOverride(portrait);
            RecordOverride(pose);
        }

        private static void ConfigureBoard(Transform canvas, Texture2D texture)
        {
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            board.texture = texture;
            board.color = Color.white;
            // Mirror only the board artwork so its three-quarter perspective runs in
            // the opposite direction. The UI rectangle stays level and unrotated.
            board.uvRect = new Rect(1f, .11f, -1f, .74f);
            TopLeft(board.rectTransform, new Vector2(28f, 276f), new Vector2(310f, 132f));
            board.rectTransform.localRotation = Quaternion.identity;
            RecordOverride(board);
        }

        private static void ConfigureSeatContact(Transform canvas)
        {
            TriadHeroAreaView heroView = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single();
            Transform hero = heroView.transform;
            Transform existing = hero.Find("HibanaSeatContactShadow");
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);

            GameObject shadowObject = new GameObject(
                "HibanaSeatContactShadow", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            shadowObject.transform.SetParent(hero, false);
            TopLeft(shadowObject.GetComponent<RectTransform>(), new Vector2(61f, 300f), new Vector2(244f, 24f));
            TriadRoundedRectGraphic shadow = shadowObject.GetComponent<TriadRoundedRectGraphic>();
            shadow.color = new Color(.025f, .008f, .014f, .46f);
            shadow.BorderColor = new Color(.76f, .43f, .22f, .16f);
            shadow.BorderWidth = 1f;
            shadow.CornerRadius = 12f;
            shadow.raycastTarget = false;

            RectTransform portrait = Require<RectTransform>(hero, "HeroPortrait");
            RawImage board = Require<RawImage>(hero, "HomeGoBoardForeground");
            shadowObject.transform.SetSiblingIndex(Mathf.Max(0, portrait.GetSiblingIndex()));
            portrait.SetAsLastSibling();
            board.transform.SetAsLastSibling();
        }

        private static void ConfigureMainCta(Transform canvas, Texture2D atlas)
        {
            TriadMainCtaView view = canvas.GetComponentsInChildren<TriadMainCtaView>(true).Single();
            Transform root = view.transform;
            Button battle = Require<Button>(root, "BattleButton");
            Button story = Require<Button>(root, "StoryButton");
            TopLeft(battle.GetComponent<RectTransform>(), new Vector2(0f, 5f), new Vector2(182f, 72f));
            TopLeft(story.GetComponent<RectTransform>(), new Vector2(184f, 5f), new Vector2(182f, 72f));

            Remove(root, "BattleCtaEmblem");
            Remove(root, "BattleCtaEmblemShadow");
            Remove(root, "BattleCtaCrest");
            Remove(root, "BattleCtaPedestal");
            Remove(root, "StoryCtaEmblem");
            Remove(root, "StoryCtaEmblemShadow");
            Remove(root, "StoryCtaCrest");
            Remove(root, "StoryCtaPedestal");

            AddPedestal(root, "BattleCtaPedestal", new Vector2(4f, 68f), new Vector2(174f, 13f));
            AddPedestal(root, "StoryCtaPedestal", new Vector2(188f, 68f), new Vector2(174f, 13f));
            AddDiamond(root, "BattleCtaCrest", new Vector2(18f, 5f), 36f, new Color(.18f, .025f, .018f, .98f));
            AddDiamond(root, "StoryCtaCrest", new Vector2(316f, 5f), 36f, new Color(.012f, .035f, .11f, .98f));
            AddAtlasOrnament(root, "BattleCtaEmblem", atlas, new Rect(0f, 0f, .5f, 1f),
                new Vector2(0f, -7f), new Vector2(74f, 70f));
            AddAtlasOrnament(root, "StoryCtaEmblem", atlas, new Rect(.5f, 0f, .5f, 1f),
                new Vector2(292f, -7f), new Vector2(74f, 70f));

            StyleMainButton(battle, true);
            StyleMainButton(story, false);
        }

        private static void StyleMainButton(Button button, bool ornamentOnLeft)
        {
            TriadRoundedRectGraphic panel = button.GetComponent<TriadRoundedRectGraphic>();
            panel.CornerRadius = 8f;
            panel.BorderWidth = 1.8f;
            panel.BorderColor = ornamentOnLeft
                ? new Color(1f, .70f, .24f, .98f)
                : new Color(.68f, .80f, 1f, .98f);

            Text title = button.transform.Find("Label")?.GetComponent<Text>();
            Text subtitle = button.GetComponentsInChildren<Text>(true)
                .Single(item => item.name.EndsWith("SubLabel", StringComparison.Ordinal));
            if (title == null) throw new InvalidOperationException("CTA title is missing: " + button.name);
            if (ornamentOnLeft)
            {
                TopLeft(title.rectTransform, new Vector2(57f, 11f), new Vector2(117f, 29f));
                TopLeft(subtitle.rectTransform, new Vector2(57f, 41f), new Vector2(117f, 17f));
            }
            else
            {
                TopLeft(title.rectTransform, new Vector2(8f, 11f), new Vector2(117f, 29f));
                TopLeft(subtitle.rectTransform, new Vector2(8f, 41f), new Vector2(117f, 17f));
            }
            title.fontSize = 19;
            title.transform.SetAsLastSibling();
            subtitle.transform.SetAsLastSibling();
            RecordOverride(panel);
            RecordOverride(title);
            RecordOverride(subtitle);
        }

        private static void ConfigureSubMenu(Transform canvas, Texture2D atlas)
        {
            TriadSubMenuView view = canvas.GetComponentsInChildren<TriadSubMenuView>(true).Single();
            Transform root = view.transform;
            string[] names = { "WorldButton", "GachaButton", "WardrobeButton", "CharacterTrainingButton" };
            Rect[] uvs =
            {
                new Rect(0f, .5f, .5f, .5f), new Rect(.5f, .5f, .5f, .5f),
                new Rect(0f, 0f, .5f, .5f), new Rect(.5f, 0f, .5f, .5f)
            };
            Color[] crestColors =
            {
                new Color(.12f, .025f, .025f, .98f), new Color(.19f, .105f, .015f, .98f),
                new Color(.19f, .025f, .035f, .98f), new Color(.10f, .045f, .018f, .98f)
            };

            for (int i = 0; i < names.Length; i++)
            {
                float x = i * 92f;
                Button button = Require<Button>(root, names[i]);
                TopLeft(button.GetComponent<RectTransform>(), new Vector2(x, 8f), new Vector2(90f, 92f));
                Remove(root, names[i] + "Emblem");
                Remove(root, names[i] + "EmblemShadow");
                Remove(root, names[i] + "Crest");
                Remove(root, names[i] + "Pedestal");
                AddPedestal(root, names[i] + "Pedestal", new Vector2(x + 3f, 88f), new Vector2(84f, 12f));
                AddDiamond(root, names[i] + "Crest", new Vector2(x + 29f, 0f), 32f, crestColors[i]);
                AddAtlasOrnament(root, names[i] + "Emblem", atlas, uvs[i],
                    new Vector2(x + 11f, -13f), new Vector2(68f, 68f));
                StyleSubMenuButton(button);
            }
        }

        private static void StyleSubMenuButton(Button button)
        {
            TriadRoundedRectGraphic panel = button.GetComponent<TriadRoundedRectGraphic>();
            panel.CornerRadius = 8f;
            panel.BorderWidth = 1.5f;
            panel.BorderColor = new Color(1f, .73f, .25f, .94f);

            Transform oldPlate = button.transform.Find("Phase28LabelPlate");
            if (oldPlate != null) UnityEngine.Object.DestroyImmediate(oldPlate.gameObject);
            GameObject plateObject = new GameObject(
                "Phase28LabelPlate", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            plateObject.transform.SetParent(button.transform, false);
            TopLeft(plateObject.GetComponent<RectTransform>(), new Vector2(3f, 50f), new Vector2(84f, 39f));
            TriadRoundedRectGraphic plate = plateObject.GetComponent<TriadRoundedRectGraphic>();
            plate.color = new Color(.005f, .008f, .015f, .70f);
            plate.BorderColor = new Color(1f, .74f, .28f, .48f);
            plate.BorderWidth = 1f;
            plate.CornerRadius = 6f;
            plate.raycastTarget = false;

            Transform oldLip = button.transform.Find("Phase28TopLip");
            if (oldLip != null) UnityEngine.Object.DestroyImmediate(oldLip.gameObject);
            GameObject lipObject = new GameObject(
                "Phase28TopLip", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            lipObject.transform.SetParent(button.transform, false);
            TopLeft(lipObject.GetComponent<RectTransform>(), new Vector2(10f, 3f), new Vector2(70f, 7f));
            TriadRoundedRectGraphic lip = lipObject.GetComponent<TriadRoundedRectGraphic>();
            lip.color = new Color(.34f, .16f, .035f, .95f);
            lip.BorderColor = new Color(1f, .83f, .42f, .92f);
            lip.BorderWidth = 1f;
            lip.CornerRadius = 3.5f;
            lip.raycastTarget = false;

            TriadSubMenuIconGraphic oldIcon = button.GetComponentInChildren<TriadSubMenuIconGraphic>(true);
            if (oldIcon != null) oldIcon.gameObject.SetActive(false);
            Text label = button.transform.Find("Label")?.GetComponent<Text>();
            Text caption = button.transform.Find("Caption")?.GetComponent<Text>();
            if (label == null || caption == null)
                throw new InvalidOperationException("Sub-menu labels are missing: " + button.name);
            TopLeft(label.rectTransform, new Vector2(4f, 53f), new Vector2(82f, 21f));
            TopLeft(caption.rectTransform, new Vector2(4f, 74f), new Vector2(82f, 13f));
            label.fontSize = label.text.Length > 4 ? 10 : 13;
            caption.fontSize = 7;
            plateObject.transform.SetSiblingIndex(Mathf.Max(0, button.transform.childCount - 3));
            lipObject.transform.SetSiblingIndex(Mathf.Max(0, button.transform.childCount - 3));
            label.transform.SetAsLastSibling();
            caption.transform.SetAsLastSibling();
            Transform badge = button.transform.Find("GachaNewBadge");
            if (badge != null) badge.SetAsLastSibling();
            RecordOverride(panel);
            RecordOverride(label);
            RecordOverride(caption);
        }

        private static void AddAtlasOrnament(
            Transform parent, string name, Texture2D atlas, Rect uv, Vector2 position, Vector2 size)
        {
            GameObject shadowObject = new GameObject(
                name + "Shadow", typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage));
            shadowObject.transform.SetParent(parent, false);
            TopLeft(shadowObject.GetComponent<RectTransform>(), position + new Vector2(2f, 3f), size);
            RawImage shadow = shadowObject.GetComponent<RawImage>();
            shadow.texture = atlas;
            shadow.uvRect = uv;
            shadow.color = new Color(.01f, .004f, .002f, .44f);
            shadow.raycastTarget = false;

            GameObject artObject = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(RawImage));
            artObject.transform.SetParent(parent, false);
            TopLeft(artObject.GetComponent<RectTransform>(), position, size);
            RawImage art = artObject.GetComponent<RawImage>();
            art.texture = atlas;
            art.uvRect = uv;
            art.color = Color.white;
            art.raycastTarget = false;
            shadowObject.transform.SetAsLastSibling();
            artObject.transform.SetAsLastSibling();
        }

        private static void AddDiamond(Transform parent, string name, Vector2 position, float size, Color fill)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, new Vector2(size, size));
            go.transform.localRotation = Quaternion.Euler(0f, 0f, 45f);
            TriadRoundedRectGraphic graphic = go.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = fill;
            graphic.BorderColor = new Color(1f, .78f, .30f, .96f);
            graphic.BorderWidth = 2f;
            graphic.CornerRadius = 7f;
            graphic.raycastTarget = false;
            go.transform.SetAsLastSibling();
        }

        private static void AddPedestal(Transform parent, string name, Vector2 position, Vector2 size)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic graphic = go.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = new Color(.012f, .006f, .010f, .96f);
            graphic.BorderColor = new Color(.72f, .42f, .12f, .82f);
            graphic.BorderWidth = 1.5f;
            graphic.CornerRadius = 5f;
            graphic.raycastTarget = false;
            go.transform.SetAsFirstSibling();
        }

        private static void Remove(Transform root, string name)
        {
            Transform existing = root.Find(name);
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
        }

        private static void ConfigureTexture(string path, bool hasAlpha)
        {
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) throw new InvalidOperationException("Texture importer unavailable: " + path);
            importer.textureType = TextureImporterType.Default;
            importer.sRGBTexture = true;
            importer.alphaSource = hasAlpha ? TextureImporterAlphaSource.FromInput : TextureImporterAlphaSource.None;
            importer.alphaIsTransparency = hasAlpha;
            importer.mipmapEnabled = false;
            importer.streamingMipmaps = false;
            importer.npotScale = TextureImporterNPOTScale.None;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.filterMode = FilterMode.Bilinear;
            importer.maxTextureSize = 4096;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            SetPlatform(importer, "Standalone", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            SetPlatform(importer, "iPhone", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            SetPlatform(importer, "Android", hasAlpha ? TextureImporterFormat.RGBA32 : TextureImporterFormat.RGB24);
            importer.SaveAndReimport();
        }

        private static void SetPlatform(TextureImporter importer, string platform, TextureImporterFormat format)
        {
            TextureImporterPlatformSettings settings = importer.GetPlatformTextureSettings(platform);
            settings.name = platform;
            settings.overridden = true;
            settings.maxTextureSize = 4096;
            settings.resizeAlgorithm = TextureResizeAlgorithm.Mitchell;
            settings.format = format;
            settings.textureCompression = TextureImporterCompression.Uncompressed;
            settings.compressionQuality = 100;
            settings.crunchedCompression = false;
            importer.SetPlatformTextureSettings(settings);
        }

        private static Texture2D RequireTexture(string path)
        {
            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            return texture != null ? texture : throw new InvalidOperationException("Missing texture: " + path);
        }

        private static T Require<T>(Transform root, string name) where T : Component
        {
            T component = root.GetComponentsInChildren<T>(true).FirstOrDefault(item => item.name == name);
            return component != null ? component : throw new InvalidOperationException("Missing component: " + name);
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

        private static void Verify()
        {
            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            RawImage art = Require<RawImage>(canvas, "HibanaCharacterArt");
            RawImage board = Require<RawImage>(canvas, "HomeGoBoardForeground");
            if (art.texture != RequireTexture(CharacterPath) || art.GetComponent<AspectRatioFitter>() == null)
                throw new InvalidOperationException("Character native aspect was not preserved.");
            if (board.texture != RequireTexture(BoardPath) || Quaternion.Angle(board.rectTransform.localRotation, Quaternion.identity) > .01f)
                throw new InvalidOperationException("Board must use perspective art without screen-space rotation.");
            if (Mathf.Abs(board.uvRect.x - 1f) > .001f || Mathf.Abs(board.uvRect.width + 1f) > .001f)
                throw new InvalidOperationException("Board perspective direction was not horizontally reversed.");
            if (canvas.GetComponentsInChildren<Transform>(true).All(item => item.name != "HibanaSeatContactShadow"))
                throw new InvalidOperationException("Seat contact shadow is missing.");
            TextureImporter characterImporter = AssetImporter.GetAtPath(CharacterPath) as TextureImporter;
            TextureImporter backgroundImporter = AssetImporter.GetAtPath(BackgroundPath) as TextureImporter;
            if (characterImporter == null || backgroundImporter == null ||
                characterImporter.textureCompression != TextureImporterCompression.Uncompressed ||
                backgroundImporter.textureCompression != TextureImporterCompression.Uncompressed)
                throw new InvalidOperationException("Key art must remain uncompressed.");
            TriadMainCtaView mainCta = canvas.GetComponentsInChildren<TriadMainCtaView>(true).Single();
            RectTransform battle = Require<RectTransform>(mainCta.transform, "BattleButton");
            RectTransform story = Require<RectTransform>(mainCta.transform, "StoryButton");
            float mainGap = story.anchoredPosition.x - battle.anchoredPosition.x - battle.rect.width;
            if (Mathf.Abs(mainGap - 2f) > .01f)
                throw new InvalidOperationException("Main CTA gap must be 2 pixels.");
            foreach (string name in new[] { "BattleCtaEmblem", "StoryCtaEmblem" })
            {
                RawImage emblem = Require<RawImage>(mainCta.transform, name);
                if (emblem.texture != RequireTexture(MainCtaEmblemPath) || emblem.raycastTarget)
                    throw new InvalidOperationException("Main CTA dimensional ornament is incomplete: " + name);
            }

            TriadSubMenuView subMenu = canvas.GetComponentsInChildren<TriadSubMenuView>(true).Single();
            string[] menuNames = { "WorldButton", "GachaButton", "WardrobeButton", "CharacterTrainingButton" };
            RectTransform[] menuButtons = menuNames
                .Select(name => Require<RectTransform>(subMenu.transform, name)).ToArray();
            for (int i = 1; i < menuButtons.Length; i++)
            {
                float gap = menuButtons[i].anchoredPosition.x - menuButtons[i - 1].anchoredPosition.x - menuButtons[i - 1].rect.width;
                if (Mathf.Abs(gap - 2f) > .01f)
                    throw new InvalidOperationException("Sub-menu button gap must be 2 pixels.");
            }
            foreach (string name in menuNames)
            {
                RawImage emblem = Require<RawImage>(subMenu.transform, name + "Emblem");
                Button button = Require<Button>(subMenu.transform, name);
                if (emblem.texture != RequireTexture(SubMenuEmblemPath) || emblem.raycastTarget)
                    throw new InvalidOperationException("Sub-menu dimensional ornament is incomplete: " + name);
                if (button.transform.Find("Phase28LabelPlate") == null || button.transform.Find("Phase28TopLip") == null)
                    throw new InvalidOperationException("Sub-menu sculpted layers are incomplete: " + name);
            }
            if (canvas.GetComponentsInChildren<Button>(true).Length < 15)
                throw new InvalidOperationException("Existing non-character-info controls were lost.");
        }
    }
}
