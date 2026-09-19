using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace TRIAD.AssetTest.Editor
{
    [InitializeOnLoad]
    public static class AssetTestProjectBootstrap
    {
        private const string Root = "Assets/TRIADAssetTest";
        private const string ScenePath = Root + "/Scenes/AssetTestScene.unity";
        private const string SettingsFolder = Root + "/Settings";
        private const string UrpAssetPath = SettingsFolder + "/TRIAD_AssetTest_URP.asset";
        private const string BootstrapFlag = "TRIAD.AssetTest.Bootstrap.6000.3.24f1";
        private static bool isBootstrapping;

        static AssetTestProjectBootstrap()
        {
            EditorApplication.delayCall += AutoBootstrapOnce;
        }

        private static void AutoBootstrapOnce()
        {
            if (SessionState.GetBool(BootstrapFlag, false)) return;
            Bootstrap();
        }

        [MenuItem("TRIAD/Asset Test/Bootstrap Project")]
        public static void Bootstrap()
        {
            if (isBootstrapping) return;

            isBootstrapping = true;
            try
            {
                Directory.CreateDirectory(SettingsFolder);
                Directory.CreateDirectory(Path.GetDirectoryName(ScenePath) ?? Root);

                EnsureUrp();
                EnsureScene();
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                SessionState.SetBool(BootstrapFlag, true);
                Debug.Log("[TRIAD Asset Test] Bootstrap complete. Expected grid: 11x17 = 187, center F9.");
            }
            finally
            {
                isBootstrapping = false;
            }
        }

        private static void EnsureUrp()
        {
            UniversalRenderPipelineAsset pipeline = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(UrpAssetPath);
            if (pipeline == null)
            {
                pipeline = ScriptableObject.CreateInstance<UniversalRenderPipelineAsset>();
                pipeline.name = "TRIAD_AssetTest_URP";
                AssetDatabase.CreateAsset(pipeline, UrpAssetPath);

                ScriptableRendererData rendererData = pipeline.LoadBuiltinRendererData(RendererType.UniversalRenderer);
                if (rendererData != null && !AssetDatabase.Contains(rendererData))
                {
                    rendererData.name = "TRIAD_AssetTest_UniversalRenderer";
                    AssetDatabase.AddObjectToAsset(rendererData, pipeline);
                }

                EditorUtility.SetDirty(pipeline);
                AssetDatabase.SaveAssets();
            }

            GraphicsSettings.defaultRenderPipeline = pipeline;
            QualitySettings.renderPipeline = pipeline;
            EditorUtility.SetDirty(pipeline);
        }

        private static void EnsureScene()
        {
            Scene scene;
            if (File.Exists(ScenePath))
            {
                scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            }
            else
            {
                scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                scene.name = "AssetTestScene";

                var root = new GameObject("AssetTestRoot");
                root.AddComponent<BoardGridPreview>();

                EditorSceneManager.SaveScene(scene, ScenePath);
            }

            EnsureBuildSettings(ScenePath);

            BoardGridPreview preview = Object.FindAnyObjectByType<BoardGridPreview>();
            if (preview == null)
            {
                var root = new GameObject("AssetTestRoot");
                preview = root.AddComponent<BoardGridPreview>();
            }

            preview.Rebuild();
            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene, ScenePath);
        }

        private static void EnsureBuildSettings(string scenePath)
        {
            var scenes = EditorBuildSettings.scenes;
            foreach (var entry in scenes)
            {
                if (entry.path == scenePath) return;
            }

            var newScenes = new EditorBuildSettingsScene[scenes.Length + 1];
            scenes.CopyTo(newScenes, 0);
            newScenes[newScenes.Length - 1] = new EditorBuildSettingsScene(scenePath, true);
            EditorBuildSettings.scenes = newScenes;
        }
    }
}
