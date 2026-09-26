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
    public static class TriadHomePhase32Builder
    {
        private const string Root = "Assets/TRIAD/UI";
        private const string Phase31Scene = Root + "/Scenes/HomePhase31.unity";
        private const string ScenePath = Root + "/Scenes/HomePhase32.unity";

        [MenuItem("TRIAD/UI/Build Home Phase 32 Petal Depth")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase31Scene))
                TriadHomePhase31Builder.Build();
            Scene scene = EditorSceneManager.OpenScene(Phase31Scene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            ConfigurePetals(canvas);
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith(Root + "/Scenes/HomePhase", StringComparison.Ordinal))
                .Concat(new[] { new EditorBuildSettingsScene(ScenePath, true) }).ToArray();
            Verify(canvas);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD UI PHASE32] PASS: layered lightweight sakura drift verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(projectRoot, "Artifacts", "UI", "Player", "TRIADHomePhase32.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? projectRoot);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Phase 32 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD UI PHASE32] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void ConfigurePetals(Transform canvas)
        {
            Transform hero = canvas.GetComponentsInChildren<TriadHeroAreaView>(true).Single().transform;
            Remove(hero, "HeroPetalsMid");
            Remove(hero, "HeroPetalsFront");
            RectTransform mid = CreateLayer(hero, "HeroPetalsMid");
            RectTransform front = CreateLayer(hero, "HeroPetalsFront");

            RectTransform portrait = hero.GetComponentsInChildren<RectTransform>(true)
                .First(item => item.name == "HeroPortrait");
            mid.SetSiblingIndex(Mathf.Max(0, portrait.GetSiblingIndex()));
            front.SetAsLastSibling();

            for (int i = 0; i < 7; i++)
                CreatePetal(mid, i, false);
            for (int i = 0; i < 5; i++)
                CreatePetal(front, i + 7, true);
        }

        private static RectTransform CreateLayer(Transform parent, string name)
        {
            GameObject layerObject = new GameObject(name, typeof(RectTransform));
            layerObject.transform.SetParent(parent, false);
            RectTransform rect = layerObject.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.pivot = new Vector2(.5f, .5f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return rect;
        }

        private static void CreatePetal(RectTransform layer, int index, bool foreground)
        {
            GameObject petalObject = new GameObject(
                "SakuraPetal" + (index + 1).ToString("00"), typeof(RectTransform),
                typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(TriadPetalDrift));
            petalObject.transform.SetParent(layer, false);
            RectTransform rect = petalObject.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(.5f, .5f);
            float x = 18f + Mathf.Repeat(index * 71f, 336f);
            float y = -(12f + Mathf.Repeat(index * 53f, 320f));
            rect.anchoredPosition = new Vector2(x, y);
            float width = foreground ? 9f + index % 3 : 5f + index % 3;
            rect.sizeDelta = new Vector2(width, width * .56f);
            rect.localRotation = Quaternion.Euler(0f, 0f, 18f + index * 23f);

            TriadRoundedRectGraphic graphic = petalObject.GetComponent<TriadRoundedRectGraphic>();
            float alpha = foreground ? .72f : .34f;
            graphic.color = index % 2 == 0
                ? new Color(1f, .70f, .79f, alpha)
                : new Color(1f, .88f, .92f, alpha);
            graphic.BorderColor = new Color(1f, .93f, .96f, alpha * .6f);
            graphic.BorderWidth = foreground ? .7f : .4f;
            graphic.CornerRadius = width;
            graphic.raycastTarget = false;

            float speed = foreground ? 24f + index % 4 * 3f : 12f + index % 4 * 2f;
            float sway = foreground ? 13f : 7f;
            float spin = (index % 2 == 0 ? 1f : -1f) * (18f + index * 2f);
            petalObject.GetComponent<TriadPetalDrift>().Configure(rect, layer, speed, sway, spin, index * .73f);
        }

        private static void Remove(Transform parent, string name)
        {
            Transform existing = parent.Find(name);
            if (existing != null) UnityEngine.Object.DestroyImmediate(existing.gameObject);
        }

        private static void Verify(Transform canvas)
        {
            TriadPetalDrift[] petals = canvas.GetComponentsInChildren<TriadPetalDrift>(true);
            if (petals.Length != 12 || petals.Any(item => item.Bounds == null || item.FallSpeed < 2f))
                throw new InvalidOperationException("Twelve lightweight layered petals are required.");
            if (canvas.GetComponentsInChildren<TriadSculptedButtonFeedback>(true).Length != 6)
                throw new InvalidOperationException("Button feedback was not preserved.");
            if (canvas.GetComponentInChildren<TriadRouteTransitionIndicator>(true) == null)
                throw new InvalidOperationException("Route transition feedback was not preserved.");
        }
    }
}
