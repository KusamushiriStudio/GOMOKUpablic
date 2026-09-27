using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    internal static class TriadFeatureSceneFactory
    {
        internal static readonly Color Ink = new(.012f, .025f, .052f, .96f);
        internal static readonly Color Panel = new(.025f, .055f, .10f, .94f);
        internal static readonly Color Gold = new(1f, .72f, .24f, 1f);
        internal static readonly Color Cream = new(1f, .94f, .80f, 1f);

        internal static (Scene scene, Transform canvas, Transform safe, Font font) CreateBase(string title)
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            Font font = Font.CreateDynamicFontFromOSFont(new[] { "Noto Sans JP", "Yu Gothic UI", "Arial" }, 18);

            GameObject canvasObject = new(title + "Canvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(390f, 844f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = .5f;

            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/TRIAD/UI/Art/Backgrounds/HomeShrineStage-v3.png");
            GameObject background = Node(canvasObject.transform, "Background", typeof(RawImage));
            Stretch(background.GetComponent<RectTransform>());
            RawImage raw = background.GetComponent<RawImage>();
            raw.texture = texture;
            raw.color = new Color(.76f, .82f, .92f, 1f);
            raw.raycastTarget = false;

            GameObject veil = Node(canvasObject.transform, "NightVeil", typeof(Image));
            Stretch(veil.GetComponent<RectTransform>());
            veil.GetComponent<Image>().color = new Color(.005f, .012f, .03f, .52f);
            veil.GetComponent<Image>().raycastTarget = false;

            GameObject safe = Node(canvasObject.transform, "SafeAreaRoot");
            Stretch(safe.GetComponent<RectTransform>());

            GameObject events = new("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            events.transform.SetParent(null);
            return (scene, canvasObject.transform, safe.transform, font);
        }

        internal static Button Header(Transform parent, Font font, string title, out Text feedback)
        {
            PanelGraphic(parent, "Header", new Vector2(12f, 14f), new Vector2(366f, 70f), Ink, Gold, 16f);
            Button back = Button(parent, font, "BackButton", "〈", new Vector2(22f, 25f), new Vector2(48f, 48f), new Color(.04f, .06f, .09f, .98f), 26);
            Text(parent, font, "ScreenTitle", title, new Vector2(78f, 22f), new Vector2(210f, 34f), 24, TextAnchor.MiddleLeft, Cream, FontStyle.Bold);
            Text(parent, font, "Brand", "TRIAD", new Vector2(282f, 26f), new Vector2(84f, 28f), 15, TextAnchor.MiddleRight, Gold, FontStyle.Bold);
            feedback = Text(parent, font, "Feedback", "", new Vector2(20f, 793f), new Vector2(350f, 30f), 12, TextAnchor.MiddleCenter, new Color(1f, .87f, .61f, 1f), FontStyle.Bold);
            return back;
        }

        internal static GameObject PanelGraphic(Transform parent, string name, Vector2 pos, Vector2 size,
            Color fill, Color border, float radius = 14f)
        {
            GameObject go = Node(parent, name, typeof(TriadRoundedRectGraphic));
            TopLeft(go.GetComponent<RectTransform>(), pos, size);
            TriadRoundedRectGraphic graphic = go.GetComponent<TriadRoundedRectGraphic>();
            graphic.color = fill;
            graphic.BorderColor = border;
            graphic.BorderWidth = 1.4f;
            graphic.CornerRadius = radius;
            return go;
        }

        internal static Button Button(Transform parent, Font font, string name, string label, Vector2 pos,
            Vector2 size, Color fill, int fontSize = 16)
        {
            GameObject go = PanelGraphic(parent, name, pos, size, fill, Gold, Mathf.Min(14f, size.y * .25f));
            Button button = go.AddComponent<Button>();
            button.targetGraphic = go.GetComponent<TriadRoundedRectGraphic>();
            ColorBlock colors = button.colors;
            colors.normalColor = Color.white;
            colors.highlightedColor = new Color(1f, .92f, .72f, 1f);
            colors.pressedColor = new Color(.85f, .65f, .35f, 1f);
            colors.disabledColor = new Color(.35f, .38f, .42f, .7f);
            button.colors = colors;
            Text(go.transform, font, "Label", label, Vector2.zero, size, fontSize, TextAnchor.MiddleCenter, Cream, FontStyle.Bold, false);
            return button;
        }

        internal static Text Text(Transform parent, Font font, string name, string value, Vector2 pos, Vector2 size,
            int fontSize, TextAnchor alignment, Color color, FontStyle style = FontStyle.Normal, bool topLeft = true)
        {
            GameObject go = Node(parent, name, typeof(Text));
            RectTransform rect = go.GetComponent<RectTransform>();
            if (topLeft) TopLeft(rect, pos, size); else { rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = size; }
            Text text = go.GetComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = style;
            text.alignment = alignment;
            text.color = color;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            text.raycastTarget = false;
            Outline outline = go.AddComponent<Outline>();
            outline.effectColor = new Color(0f, 0f, 0f, .78f);
            outline.effectDistance = new Vector2(1f, -1f);
            return text;
        }

        internal static GameObject Node(Transform parent, string name, params Type[] components)
        {
            var types = new List<Type> { typeof(RectTransform), typeof(CanvasRenderer) };
            foreach (Type component in components)
                if (!types.Contains(component)) types.Add(component);
            GameObject go = new(name, types.ToArray());
            go.transform.SetParent(parent, false);
            return go;
        }

        internal static void TopLeft(RectTransform rect, Vector2 pos, Vector2 size)
        {
            rect.anchorMin = rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(pos.x, -pos.y);
            rect.sizeDelta = size;
        }

        internal static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.pivot = new Vector2(.5f, .5f);
            rect.offsetMin = rect.offsetMax = Vector2.zero;
        }

        internal static void ConfigureHomeRoutes(string story, string gacha = "", string wardrobe = "")
        {
            Scene home = EditorSceneManager.OpenScene("Assets/TRIAD/UI/Scenes/HomePhase66.unity", OpenSceneMode.Single);
            TriadHomeSceneRouter router = home.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<TriadHomeSceneRouter>(true)).Single();
            router.ConfigureFeatureScenes(story, gacha, wardrobe);
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(home);
        }

        internal static void SetBuildScenes(params string[] featureScenes)
        {
            string[] stable =
            {
                "Assets/TRIADAssetTest/Scenes/AssetTestScene.unity",
                "Assets/TRIAD/UI/Scenes/HomePhase66.unity",
                "Assets/TRIAD/Battle/Scenes/BattlePhase33.unity"
            };
            EditorBuildSettings.scenes = stable.Concat(featureScenes)
                .Distinct().Select(path => new EditorBuildSettingsScene(path, true)).ToArray();
        }

        internal static void Verify(Scene scene, Type controllerType)
        {
            int missing = scene.GetRootGameObjects().Sum(root => root.GetComponentsInChildren<Transform>(true)
                .Sum(item => GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(item.gameObject)));
            if (missing != 0) throw new InvalidOperationException($"{scene.name}: missing scripts={missing}");
            if (scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren(controllerType, true)).Count() != 1)
                throw new InvalidOperationException($"{scene.name}: controller count is invalid.");
            CanvasScaler scaler = scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<CanvasScaler>(true)).Single();
            if (scaler.referenceResolution != new Vector2(390f, 844f))
                throw new InvalidOperationException($"{scene.name}: reference resolution must be 390x844.");
        }
    }
}
