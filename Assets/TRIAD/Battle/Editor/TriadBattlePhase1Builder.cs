using System;
using System.IO;
using System.Linq;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase1Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase33.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase34.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase1.unity";
        private const string BoardModel = "Assets/TRIADAssetTest/Models/Incoming/board_blockout.fbx";
        private const string StoneModel = "Assets/TRIADAssetTest/Models/Incoming/stones_blockout.fbx";
        private const string GridMaterialPath = "Assets/TRIAD/Battle/Materials/BattleGrid.mat";

        [MenuItem("TRIAD/Battle/Build Phase 1 Playable Board")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(HomeSource))
                throw new InvalidOperationException("Home Phase 33 scene is missing.");
            BuildBattleScene();
            BuildRoutedHomeScene();
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => item.path != HomeSource && item.path != HomeScene && item.path != BattleScene)
                .Concat(new[]
                {
                    new EditorBuildSettingsScene(HomeScene, true),
                    new EditorBuildSettingsScene(BattleScene, true)
                }).ToArray();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD BATTLE PHASE1] PASS: Blender board, three-seat placement loop, and Home route verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "Battle", "Player", "TRIADBattlePhase1.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 1 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE1] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildRoutedHomeScene()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            if (controller == null) throw new InvalidOperationException("Home controller is missing.");
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            if (router == null) router = canvas.gameObject.AddComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase1");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "BattlePhase1";
            Font font = Font.CreateDynamicFontFromOSFont(
                new[] { "Noto Sans JP", "Yu Gothic UI", "Hiragino Sans", "Arial" }, 18);

            Camera camera = CreateCamera();
            CreateLighting();
            Transform boardRoot = CreateBoardStage();
            Mesh stoneMesh = LoadStoneMesh();

            GameObject canvasObject = new GameObject(
                "BattleCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390f, 844f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = .5f;

            CreateEventSystem();
            CreateBackground(canvasObject.transform);
            Text title = CreateLabel(canvasObject.transform, "Title", "三人対戦", new Vector2(74f, 19f), new Vector2(242f, 30f), 20, font);
            Text turn = CreateLabel(canvasObject.transform, "TurnLabel", "手番  席1", new Vector2(74f, 49f), new Vector2(150f, 24f), 14, font);
            turn.alignment = TextAnchor.MiddleLeft;
            Text energy = CreateLabel(canvasObject.transform, "EnergyLabel", "気力  1 / 0 / 0", new Vector2(214f, 49f), new Vector2(102f, 24f), 10, font);
            energy.alignment = TextAnchor.MiddleRight;
            Button back = CreateButton(canvasObject.transform, "BackButton", "戻る", new Vector2(14f, 19f), new Vector2(52f, 52f), font);
            Button reset = CreateButton(canvasObject.transform, "ResetButton", "再戦", new Vector2(324f, 19f), new Vector2(52f, 52f), font);
            Text status = CreateStatusPanel(canvasObject.transform, font);

            GameObject inputObject = new GameObject(
                "BoardInput", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(TriadBattleBoardController));
            inputObject.transform.SetParent(canvasObject.transform, false);
            TopLeft(inputObject.GetComponent<RectTransform>(), new Vector2(12f, 92f), new Vector2(366f, 636f));
            Image input = inputObject.GetComponent<Image>();
            input.color = new Color(1f, 1f, 1f, 0f);
            input.raycastTarget = true;

            Transform stoneRoot = new GameObject("PlacedStones").transform;
            stoneRoot.SetParent(boardRoot, false);
            TriadBattleBoardController controller = inputObject.GetComponent<TriadBattleBoardController>();
            controller.Configure(camera, stoneMesh, stoneRoot, turn, energy, status, back, reset, "HomePhase34");

            VerifyBattle(canvasObject.transform, controller, boardRoot);
            Directory.CreateDirectory(Path.GetDirectoryName(BattleScene) ?? "Assets/TRIAD/Battle/Scenes");
            EditorSceneManager.SaveScene(scene, BattleScene);
        }

        private static Camera CreateCamera()
        {
            GameObject go = new GameObject("BattleCamera", typeof(Camera), typeof(AudioListener));
            go.tag = "MainCamera";
            Camera camera = go.GetComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(.012f, .018f, .035f, 1f);
            camera.fieldOfView = 33f;
            camera.nearClipPlane = .03f;
            camera.farClipPlane = 25f;
            go.transform.position = new Vector3(0f, .92f, -.92f);
            go.transform.LookAt(new Vector3(0f, 0f, .02f));
            return camera;
        }

        private static void CreateLighting()
        {
            GameObject key = new GameObject("MoonKey", typeof(Light));
            Light keyLight = key.GetComponent<Light>();
            keyLight.type = LightType.Directional;
            keyLight.color = new Color(.78f, .84f, 1f);
            keyLight.intensity = 1.35f;
            key.transform.rotation = Quaternion.Euler(48f, -28f, 0f);
            GameObject rim = new GameObject("GoldRim", typeof(Light));
            Light rimLight = rim.GetComponent<Light>();
            rimLight.type = LightType.Directional;
            rimLight.color = new Color(1f, .56f, .22f);
            rimLight.intensity = .65f;
            rim.transform.rotation = Quaternion.Euler(62f, 145f, 8f);
        }

        private static Transform CreateBoardStage()
        {
            GameObject boardPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(BoardModel);
            if (boardPrefab == null) throw new InvalidOperationException("Blender board FBX is missing.");
            GameObject stage = new GameObject("BattleBoardStage");
            GameObject board = PrefabUtility.InstantiatePrefab(boardPrefab) as GameObject;
            if (board == null) throw new InvalidOperationException("Blender board FBX could not be instantiated.");
            board.name = "TRIAD_Board_11x17";
            board.transform.SetParent(stage.transform, false);
            board.transform.localPosition = Vector3.zero;

            Material gridMaterial = LoadOrCreateGridMaterial();
            Transform grid = new GameObject("GridLines").transform;
            grid.SetParent(stage.transform, false);
            for (int column = 0; column < 11; column++)
                CreateGridLine(grid, new Vector3(-.20f + column * .04f, .0165f, 0f), new Vector3(.0012f, .001f, .64f), gridMaterial);
            for (int row = 0; row < 17; row++)
                CreateGridLine(grid, new Vector3(0f, .0167f, -.32f + row * .04f), new Vector3(.40f, .001f, .0012f), gridMaterial);
            return stage.transform;
        }

        private static Material LoadOrCreateGridMaterial()
        {
            Material material = AssetDatabase.LoadAssetAtPath<Material>(GridMaterialPath);
            if (material == null)
            {
                Directory.CreateDirectory(Path.GetDirectoryName(GridMaterialPath) ?? "Assets/TRIAD/Battle/Materials");
                material = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"));
                AssetDatabase.CreateAsset(material, GridMaterialPath);
            }
            Color color = new Color(.055f, .025f, .012f, 1f);
            material.color = color;
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", .32f);
            EditorUtility.SetDirty(material);
            return material;
        }

        private static void CreateGridLine(Transform parent, Vector3 position, Vector3 scale, Material material)
        {
            GameObject line = GameObject.CreatePrimitive(PrimitiveType.Cube);
            line.name = "GridLine";
            line.transform.SetParent(parent, false);
            line.transform.localPosition = position;
            line.transform.localScale = scale;
            line.GetComponent<MeshRenderer>().sharedMaterial = material;
            UnityEngine.Object.DestroyImmediate(line.GetComponent<Collider>());
        }

        private static Mesh LoadStoneMesh()
        {
            Mesh mesh = AssetDatabase.LoadAllAssetsAtPath(StoneModel).OfType<Mesh>()
                .FirstOrDefault(item => item.name.Contains("Stone_Black"))
                ?? AssetDatabase.LoadAllAssetsAtPath(StoneModel).OfType<Mesh>().FirstOrDefault();
            return mesh != null ? mesh : throw new InvalidOperationException("Blender stone mesh is missing.");
        }

        private static void CreateEventSystem()
        {
            GameObject system = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            system.GetComponent<StandaloneInputModule>().forceModuleActive = true;
        }

        private static void CreateBackground(Transform canvas)
        {
            GameObject background = new GameObject(
                "BattleUiBackdrop", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            background.transform.SetParent(canvas, false);
            Stretch(background.GetComponent<RectTransform>());
            TriadRoundedRectGraphic graphic = background.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = new Color(.006f, .010f, .024f, .18f);
            graphic.BorderColor = Color.clear;
            graphic.raycastTarget = false;

            GameObject top = CreatePanel(canvas, "TopHud", new Vector2(12f, 12f), new Vector2(366f, 68f));
            top.transform.SetAsLastSibling();
        }

        private static Text CreateStatusPanel(Transform canvas, Font font)
        {
            GameObject panel = CreatePanel(canvas, "StatusPanel", new Vector2(12f, 744f), new Vector2(366f, 74f));
            return CreateLabel(panel.transform, "StatusLabel", "交点をタップして碁石を置く",
                new Vector2(12f, 9f), new Vector2(342f, 56f), 13, font);
        }

        private static GameObject CreatePanel(Transform parent, string name, Vector2 position, Vector2 size)
        {
            GameObject panel = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            panel.transform.SetParent(parent, false);
            TopLeft(panel.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic graphic = panel.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = new Color(.006f, .012f, .030f, .94f);
            graphic.BorderColor = new Color(1f, .72f, .24f, .90f);
            graphic.BorderWidth = 1.4f;
            graphic.CornerRadius = 12f;
            graphic.raycastTarget = false;
            return panel;
        }

        private static Button CreateButton(Transform parent, string name, string text,
            Vector2 position, Vector2 size, Font font)
        {
            GameObject buttonObject = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            buttonObject.transform.SetParent(parent, false);
            TopLeft(buttonObject.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = buttonObject.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.025f, .055f, .105f, .98f);
            panel.BorderColor = new Color(1f, .75f, .30f, .96f);
            panel.BorderWidth = 1.4f;
            panel.CornerRadius = 10f;
            Button button = buttonObject.GetComponent<Button>();
            button.targetGraphic = panel;
            Text label = CreateLabel(buttonObject.transform, "Label", text, new Vector2(2f, 2f), size - Vector2.one * 4f, 11, font);
            label.raycastTarget = false;
            return button;
        }

        private static Text CreateLabel(Transform parent, string name, string value,
            Vector2 position, Vector2 size, int fontSize, Font font)
        {
            GameObject labelObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            labelObject.transform.SetParent(parent, false);
            TopLeft(labelObject.GetComponent<RectTransform>(), position, size);
            Text label = labelObject.GetComponent<Text>();
            label.font = font;
            label.text = value;
            label.fontSize = fontSize;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = new Color(1f, .92f, .72f, 1f);
            label.raycastTarget = false;
            Outline outline = labelObject.AddComponent<Outline>();
            outline.effectColor = new Color(0f, 0f, 0f, .9f);
            outline.effectDistance = new Vector2(1f, -1f);
            return label;
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void VerifyBattle(Transform canvas, TriadBattleBoardController controller, Transform boardRoot)
        {
            if (controller.BoardCamera == null || controller.StoneMesh == null)
                throw new InvalidOperationException("Battle controller assets are incomplete.");
            if (boardRoot.GetComponentsInChildren<MeshRenderer>(true).Length < 29)
                throw new InvalidOperationException("Blender board and 28 grid lines are required.");
            if (canvas.GetComponentsInChildren<Button>(true).Length != 2)
                throw new InvalidOperationException("Back and reset buttons are required.");
        }
    }
}
