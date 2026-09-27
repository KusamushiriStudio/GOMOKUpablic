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
    public static class TriadBattlePhase33Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase65.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase66.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase32.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase33.unity";
        private const string BoardMaterialPath = "Assets/TRIAD/Battle/Materials/BattleBoardFinal.mat";

        [MenuItem("TRIAD/Battle/Build Phase 33 Final Integration")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase32Builder.Build();
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
            VerifyBuildSettings();
            Debug.Log("[TRIAD BATTLE PHASE33] PASS: final scene integration and references verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase33.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 33 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE33] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        public static void DiagnoseBoardVisibility()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleScene, OpenSceneMode.Single);
            Camera camera = scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Camera>(true)).Single();
            foreach (Renderer renderer in scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<Renderer>(true)))
            {
                Vector3 viewport = camera.WorldToViewportPoint(renderer.bounds.center);
                Debug.Log($"[TRIAD BOARD DIAG] Renderer={renderer.name}; active={renderer.gameObject.activeInHierarchy}; " +
                          $"enabled={renderer.enabled}; center={renderer.bounds.center}; extents={renderer.bounds.extents}; " +
                          $"viewport={viewport}; shader={renderer.sharedMaterial?.shader?.name}");
            }
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            foreach (Graphic graphic in canvas.GetComponentsInChildren<Graphic>(true))
            {
                RectTransform rect = graphic.rectTransform;
                if (graphic.color.a <= .01f || rect.rect.width < 300f || rect.rect.height < 300f) continue;
                Debug.Log($"[TRIAD BOARD DIAG] Graphic={HierarchyPath(graphic.transform)}; active={graphic.gameObject.activeInHierarchy}; " +
                          $"color={graphic.color}; size={rect.rect.size}; sibling={graphic.transform.GetSiblingIndex()}");
            }
        }

        private static void BuildBattleScene()
        {
            string inputScene = AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleScene) ? BattleScene : BattleSource;
            Scene scene = EditorSceneManager.OpenScene(inputScene, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = Require<TriadBattleBoardController>(safeRoot);
            TriadBattleSessionContext session = Require<TriadBattleSessionContext>(safeRoot);
            TriadBattleSessionJournal journal = Require<TriadBattleSessionJournal>(safeRoot);
            TriadBattleCheckpointStore checkpoint = Require<TriadBattleCheckpointStore>(safeRoot);
            TriadBattleResultPersistence persistence = Require<TriadBattleResultPersistence>(safeRoot);
            TriadBattleModeSelector modeSelector = Require<TriadBattleModeSelector>(safeRoot);
            TriadBattleResultOverlay resultOverlay = Require<TriadBattleResultOverlay>(canvas);
            TriadBattleWinningLineIndicator winningLine = Require<TriadBattleWinningLineIndicator>(safeRoot);
            TriadBattleCompletionSummary completionSummary = Require<TriadBattleCompletionSummary>(safeRoot);
            Require<TriadBattleCpuDriver>(safeRoot);
            Require<TriadBattlePauseOverlay>(safeRoot);
            Require<TriadBattleLifecycleController>(safeRoot);
            Require<TriadBattleLogOverlay>(safeRoot);
            Require<TriadBattleInvalidInputFeedback>(safeRoot);
            Require<TriadBattleCoordinateFeedback>(safeRoot);

            if (session == null || journal.Controller != controller || checkpoint.Controller != controller ||
                persistence == null || modeSelector.Controller != controller || resultOverlay.Controller != controller ||
                winningLine.Controller != controller || completionSummary.Controller != controller ||
                controller.EffectRoot == null)
                throw new InvalidOperationException("Final battle references are incomplete.");

            FixBoardPresentation(scene, controller);
            controller.SetHomeSceneName("HomePhase66");
            ReplaceQaCapture(safeRoot, "battle", controller);
            Transform mode = safeRoot.Find("ModeSelectionOverlay");
            if (mode != null) mode.SetAsLastSibling();
            EnsureNoMissingScripts(scene);
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
        }

        private static void FixBoardPresentation(Scene scene, TriadBattleBoardController controller)
        {
            Camera camera = controller.BoardCamera;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(.006f, .010f, .022f, 1f);
            camera.fieldOfView = 52f;

            Transform board = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Transform>(true))
                .FirstOrDefault(item => item.name == "TRIAD_Board_11x17");
            if (board == null) throw new InvalidOperationException("Final Blender board is missing.");
            Renderer boardRenderer = board.GetComponentInChildren<Renderer>(true);
            if (boardRenderer == null) throw new InvalidOperationException("Final Blender board renderer is missing.");

            Material wood = AssetDatabase.LoadAssetAtPath<Material>(BoardMaterialPath);
            if (wood == null)
            {
                Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
                wood = new Material(shader) { name = "BattleBoardFinal" };
                AssetDatabase.CreateAsset(wood, BoardMaterialPath);
            }
            Color woodColor = new(.30f, .105f, .038f, 1f);
            wood.color = woodColor;
            if (wood.HasProperty("_BaseColor")) wood.SetColor("_BaseColor", woodColor);
            if (wood.HasProperty("_Smoothness")) wood.SetFloat("_Smoothness", .48f);
            if (wood.HasProperty("_Metallic")) wood.SetFloat("_Metallic", .04f);
            EditorUtility.SetDirty(wood);
            Material[] materials = boardRenderer.sharedMaterials;
            if (materials.Length == 0) materials = new Material[1];
            for (int index = 0; index < materials.Length; index++) materials[index] = wood;
            boardRenderer.sharedMaterials = materials;

            Transform grid = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Transform>(true))
                .FirstOrDefault(item => item.name == "GridLines");
            if (grid == null || grid.childCount != 28)
                throw new InvalidOperationException("Final 11x17 grid is incomplete.");
            foreach (Transform line in grid)
            {
                Vector3 position = line.localPosition;
                position.y = .0415f;
                line.localPosition = position;
            }
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            if (controller == null || router == null)
                throw new InvalidOperationException("Final home references are incomplete.");
            router.Configure(controller, "BattlePhase33");
            ReplaceQaCapture(canvas, "home", null);
            EnsureNoMissingScripts(scene);
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static void ReplaceQaCapture(Transform parent, string surface,
            TriadBattleBoardController controller)
        {
            Transform old = parent.Find("FinalQaCapture");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);
            GameObject captureObject = new("FinalQaCapture", typeof(TriadFinalQaCapture));
            captureObject.transform.SetParent(parent, false);
            captureObject.GetComponent<TriadFinalQaCapture>().Configure(surface, controller);
            EditorUtility.SetDirty(captureObject.GetComponent<TriadFinalQaCapture>());
        }

        private static T Require<T>(Transform root) where T : Component
        {
            T component = root.GetComponentInChildren<T>(true);
            if (component == null) throw new InvalidOperationException($"Missing required component: {typeof(T).Name}");
            return component;
        }

        private static void EnsureNoMissingScripts(Scene scene)
        {
            int missing = scene.GetRootGameObjects()
                .Sum(root => root.GetComponentsInChildren<Transform>(true)
                    .Sum(item => GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(item.gameObject)));
            if (missing != 0) throw new InvalidOperationException($"Scene {scene.name} has {missing} missing scripts.");
        }

        private static void VerifyBuildSettings()
        {
            string[] enabled = EditorBuildSettings.scenes.Where(item => item.enabled).Select(item => item.path).ToArray();
            if (!enabled.Contains(HomeScene) || !enabled.Contains(BattleScene) ||
                enabled.Any(path => path.StartsWith("Assets/TRIAD/UI/Scenes/HomePhase", StringComparison.Ordinal) &&
                                    path != HomeScene) ||
                enabled.Any(path => path.StartsWith("Assets/TRIAD/Battle/Scenes/BattlePhase", StringComparison.Ordinal) &&
                                    path != BattleScene))
                throw new InvalidOperationException("Final build settings contain stale phase scenes.");
        }

        private static string HierarchyPath(Transform transform)
        {
            string path = transform.name;
            while (transform.parent != null)
            {
                transform = transform.parent;
                path = transform.name + "/" + path;
            }
            return path;
        }
    }
}
