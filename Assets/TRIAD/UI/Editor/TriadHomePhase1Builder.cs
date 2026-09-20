using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase1Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string PrefabPath = Root + "/Prefabs/HomeTopHeader.prefab";
        private const string ScenePath = Root + "/Scenes/HomePhase1Header.unity";

        private static readonly Color Navy950 = Hex("#050812");
        private static readonly Color Navy900 = Hex("#091426");
        private static readonly Color Navy800 = Hex("#10213A");
        private static readonly Color Gold500 = Hex("#D5B45B");
        private static readonly Color Gold300 = Hex("#F1D792");
        private static readonly Color Ivory50 = Hex("#FFF7DE");
        private static readonly Color Ivory300 = Hex("#D9C99E");
        private static readonly Color UnreadRed = Hex("#E5484D");

        [MenuItem("TRIAD/UI/Build Home Phase 1 Header")]
        public static void Build()
        {
            EnsureFolders();
            BuildHeaderPrefab();
            BuildHomeScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE1] Build complete: " + PrefabPath + " / " + ScenePath);
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            Verify();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADPhase1.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
                throw new InvalidOperationException("Preview player build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE1] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        public static void VerifyOnly()
        {
            Verify();
            Debug.Log("[TRIAD UI PHASE1] PASS: Verification complete.");
        }

        private static void EnsureFolders()
        {
            EnsureFolder("Assets/TRIAD", "UI");
            EnsureFolder(Root, "Runtime");
            EnsureFolder(Root, "Editor");
            EnsureFolder(Root, "Prefabs");
            EnsureFolder(Root, "Scenes");
        }

        private static void EnsureFolder(string parent, string child)
        {
            string path = parent + "/" + child;
            if (!AssetDatabase.IsValidFolder(path)) AssetDatabase.CreateFolder(parent, child);
        }

        private static void BuildHeaderPrefab()
        {
            var root = new GameObject("HomeTopHeader", typeof(RectTransform), typeof(TriadHomeHeaderView));
            RectTransform rootRect = root.GetComponent<RectTransform>();
            rootRect.sizeDelta = new Vector2(366f, 45f);

            TriadRoundedRectGraphic background = root.AddComponent<TriadRoundedRectGraphic>();
            background.color = Navy900;
            background.BorderColor = Gold500;
            background.BorderWidth = 1f;
            background.CornerRadius = 12f;
            background.raycastTarget = false;

            TriadHeaderIconGraphic crest = CreateIcon(root.transform, "LogoMark", TriadHeaderIconGraphic.IconKind.Crest,
                new Vector2(10f, 8.5f), new Vector2(28f, 28f), Gold300, 1.2f);
            crest.raycastTarget = false;

            Text brand = CreateText(root.transform, "BrandLabel", "TRIAD", new Vector2(50f, 1f), new Vector2(92f, 25f),
                17, Gold300, TextAnchor.MiddleLeft, FontStyle.Bold);
            brand.horizontalOverflow = HorizontalWrapMode.Overflow;
            Text subtitle = CreateText(root.transform, "SubtitleLabel", "超次元五目", new Vector2(50f, 24f), new Vector2(80f, 16f),
                9, Ivory300, TextAnchor.MiddleLeft, FontStyle.Normal);

            GameObject currency = CreateRounded(root.transform, "Currency", new Vector2(190f, 6.5f), new Vector2(94f, 32f),
                Navy950, Gold500, 16f, false);
            CreateIcon(currency.transform, "CurrencyIcon", TriadHeaderIconGraphic.IconKind.Coin,
                new Vector2(9f, 8f), new Vector2(16f, 16f), Gold300, 2f).raycastTarget = false;
            Text currencyValue = CreateText(currency.transform, "CurrencyValue", "12,480", new Vector2(31f, 4f), new Vector2(56f, 24f),
                13, Ivory50, TextAnchor.MiddleCenter, FontStyle.Bold);

            Button mail = CreateIconButton(root.transform, "MailButton", new Vector2(290f, 6.5f), TriadHeaderIconGraphic.IconKind.Mail);
            Button notification = CreateIconButton(root.transform, "NotificationButton", new Vector2(328f, 6.5f), TriadHeaderIconGraphic.IconKind.Bell);

            GameObject badge = CreateRounded(notification.transform, "UnreadBadge", new Vector2(20f, -3f), new Vector2(14f, 14f),
                UnreadRed, Color.clear, 7f, false);
            Text unread = CreateText(badge.transform, "UnreadCount", "7", Vector2.zero, new Vector2(14f, 14f),
                9, Color.white, TextAnchor.MiddleCenter, FontStyle.Bold);

            TriadHomeHeaderView view = root.GetComponent<TriadHomeHeaderView>();
            view.Configure(brand, subtitle, currencyValue, unread, mail, notification);
            view.ApplyFontsForPreview();
            view.Refresh();

            PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
            UnityEngine.Object.DestroyImmediate(root);
        }

        private static void BuildHomeScene()
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "HomePhase1Header";

            var cameraObject = new GameObject("MainCamera", typeof(Camera));
            cameraObject.tag = "MainCamera";
            Camera camera = cameraObject.GetComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = Navy950;
            camera.orthographic = true;
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 1000f;
            camera.transform.position = new Vector3(0f, 0f, -10f);

            var canvasObject = new GameObject("HomeCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceCamera;
            canvas.worldCamera = camera;
            canvas.planeDistance = 100f;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390f, 844f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            if (prefab == null) throw new InvalidOperationException("Header prefab was not created: " + PrefabPath);
            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab, canvasObject.transform);
            instance.name = "HomeTopHeader";
            RectTransform rect = instance.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(12f, -47f);
            rect.sizeDelta = new Vector2(366f, 45f);

            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            new GameObject("ScreenshotRunner", typeof(TriadPhase1ScreenshotRunner));
            EditorSceneManager.SaveScene(scene, ScenePath);
            EnsureBuildSettings(ScenePath);
        }

        private static void Verify()
        {
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            if (prefab == null) throw new InvalidOperationException("Missing prefab: " + PrefabPath);
            string[] required = { "LogoMark", "BrandLabel", "SubtitleLabel", "Currency", "CurrencyValue", "MailButton", "NotificationButton", "UnreadBadge", "UnreadCount" };
            foreach (string name in required)
                if (!FindRecursive(prefab.transform, name)) throw new InvalidOperationException("Missing Header element: " + name);
            if (prefab.GetComponent<TriadHomeHeaderView>() == null) throw new InvalidOperationException("Missing TriadHomeHeaderView.");

            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            GameObject header = scene.GetRootGameObjects().SelectMany(x => x.GetComponentsInChildren<Transform>(true))
                .FirstOrDefault(x => x.name == "HomeTopHeader")?.gameObject;
            if (header == null) throw new InvalidOperationException("HomeTopHeader is not present in scene.");
            RectTransform rect = header.GetComponent<RectTransform>();
            AssertNear(rect.anchoredPosition.x, 12f, "Header x");
            AssertNear(rect.anchoredPosition.y, -47f, "Header y");
            AssertNear(rect.sizeDelta.x, 366f, "Header width");
            AssertNear(rect.sizeDelta.y, 45f, "Header height");
            if (header.GetComponentsInChildren<Button>(true).Length != 2) throw new InvalidOperationException("Header must expose exactly two buttons.");
        }

        private static Button CreateIconButton(Transform parent, string name, Vector2 position, TriadHeaderIconGraphic.IconKind kind)
        {
            GameObject buttonObject = CreateRounded(parent, name, position, new Vector2(32f, 32f), Navy800, Gold500, 8f, true);
            Button button = buttonObject.AddComponent<Button>();
            button.targetGraphic = buttonObject.GetComponent<TriadRoundedRectGraphic>();
            ColorBlock colors = button.colors;
            colors.normalColor = Color.white;
            colors.highlightedColor = new Color(1f, 1f, 1f, .92f);
            colors.pressedColor = new Color(.8f, .8f, .8f, 1f);
            button.colors = colors;
            CreateIcon(buttonObject.transform, "Icon", kind, new Vector2(7f, 7f), new Vector2(18f, 18f), Gold300, 1.8f).raycastTarget = false;
            return button;
        }

        private static GameObject CreateRounded(Transform parent, string name, Vector2 position, Vector2 size, Color fill, Color border, float radius, bool raycast)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            SetTopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic graphic = go.AddComponent<TriadRoundedRectGraphic>();
            graphic.color = fill;
            graphic.BorderColor = border;
            graphic.BorderWidth = border.a > 0f ? 1f : 0f;
            graphic.CornerRadius = radius;
            graphic.raycastTarget = raycast;
            return go;
        }

        private static TriadHeaderIconGraphic CreateIcon(Transform parent, string name, TriadHeaderIconGraphic.IconKind kind, Vector2 position, Vector2 size, Color color, float stroke)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            SetTopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadHeaderIconGraphic graphic = go.AddComponent<TriadHeaderIconGraphic>();
            graphic.Kind = kind;
            graphic.StrokeWidth = stroke;
            graphic.color = color;
            return graphic;
        }

        private static Text CreateText(Transform parent, string name, string value, Vector2 position, Vector2 size, int fontSize, Color color, TextAnchor alignment, FontStyle style)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            SetTopLeft(go.GetComponent<RectTransform>(), position, size);
            Text text = go.AddComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.fontStyle = style;
            text.color = color;
            text.alignment = alignment;
            text.raycastTarget = false;
            text.supportRichText = false;
            return text;
        }

        private static void SetTopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }

        private static bool FindRecursive(Transform root, string name)
        {
            if (root.name == name) return true;
            for (int i = 0; i < root.childCount; i++) if (FindRecursive(root.GetChild(i), name)) return true;
            return false;
        }

        private static void EnsureBuildSettings(string scenePath)
        {
            if (EditorBuildSettings.scenes.Any(x => x.path == scenePath)) return;
            var scenes = EditorBuildSettings.scenes.ToList();
            scenes.Add(new EditorBuildSettingsScene(scenePath, true));
            EditorBuildSettings.scenes = scenes.ToArray();
        }

        private static void AssertNear(float actual, float expected, string label)
        {
            if (Mathf.Abs(actual - expected) > .01f) throw new InvalidOperationException($"{label}: expected {expected}, actual {actual}");
        }

        private static Color Hex(string value)
        {
            if (!ColorUtility.TryParseHtmlString(value, out Color color)) throw new ArgumentException("Invalid color: " + value);
            return color;
        }
    }
}
