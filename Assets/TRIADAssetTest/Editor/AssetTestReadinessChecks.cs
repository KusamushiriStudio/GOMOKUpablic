using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace TRIAD.AssetTest.Editor
{
    public static class AssetTestReadinessChecks
    {
        private const string ScenePath = "Assets/TRIADAssetTest/Scenes/AssetTestScene.unity";

        [MenuItem("TRIAD/Asset Test/Print Readiness")]
        public static void PrintReadiness()
        {
            bool sceneAssetExists = AssetDatabase.LoadAssetAtPath<SceneAsset>(ScenePath) != null;
            Scene scene = SceneManager.GetSceneByPath(ScenePath);

            if (sceneAssetExists && (!scene.IsValid() || !scene.isLoaded))
            {
                if (!Application.isBatchMode && !EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
                    return;

                scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            }

            int rootCount = 0;
            int previewCount = 0;
            int gridCount = 0;
            int boardCount = 0;
            int pointCount = 0;
            int f9Count = 0;
            int cameraCount = 0;
            int directionalLightCount = 0;
            int missingScripts = 0;
            int missingMaterials = 0;
            int missingShaders = 0;
            bool f9Transform = false;
            var labels = new HashSet<string>();

            if (scene.IsValid() && scene.isLoaded)
            {
                foreach (GameObject sceneRoot in scene.GetRootGameObjects())
                {
                    if (sceneRoot.name == "AssetTestRoot") rootCount++;

                    foreach (Transform current in sceneRoot.GetComponentsInChildren<Transform>(true))
                    {
                        missingScripts += GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(current.gameObject);

                        if (current.GetComponent<BoardGridPreview>() != null)
                            previewCount++;

                        if (current.name == "TEMP_GeneratedGrid")
                            gridCount++;

                        if (current.name == "TEMP_Board")
                            boardCount++;

                        if (current.name.StartsWith("TEMP_Point_", StringComparison.Ordinal))
                        {
                            pointCount++;
                            string label = current.name.Substring("TEMP_Point_".Length);
                            labels.Add(label);
                            if (label == "F9")
                            {
                                f9Count++;
                                f9Transform = current.localPosition == Vector3.zero;
                            }
                        }

                        if (current.GetComponent<Camera>() != null)
                            cameraCount++;

                        Light light = current.GetComponent<Light>();
                        if (light != null && light.type == LightType.Directional)
                            directionalLightCount++;

                        Renderer renderer = current.GetComponent<Renderer>();
                        if (renderer == null) continue;

                        foreach (Material material in renderer.sharedMaterials)
                        {
                            if (material == null)
                            {
                                missingMaterials++;
                                continue;
                            }

                            if (material.shader == null || !material.shader.isSupported ||
                                material.shader.name == "Hidden/InternalErrorShader")
                                missingShaders++;
                        }
                    }
                }
            }

            var expectedLabels = new HashSet<string>();
            for (int row = 1; row <= BoardCoordinate.RowCount; row++)
                for (char column = 'A'; column < 'A' + BoardCoordinate.ColumnCount; column++)
                    expectedLabels.Add($"{column}{row}");

            UniversalRenderPipelineAsset pipeline =
                GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset ??
                GraphicsSettings.defaultRenderPipeline as UniversalRenderPipelineAsset;
            bool urp = pipeline != null;
            bool rendererReady = urp && pipeline.GetRenderer(0) != null;
            bool labelsReady = labels.SetEquals(expectedLabels);
            bool hierarchyReady = rootCount == 1 && previewCount == 1 && gridCount == 1 &&
                                  boardCount == 1 && cameraCount == 1 && directionalLightCount == 1;
            bool contentReady = pointCount == BoardCoordinate.IntersectionCount && labelsReady &&
                                f9Count == 1 && f9Transform;
            bool cleanReferences = missingScripts == 0 && missingMaterials == 0 && missingShaders == 0;
            bool ready = urp && rendererReady && sceneAssetExists && hierarchyReady && contentReady && cleanReferences;
            bool iosBuildSupport = BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.iOS, BuildTarget.iOS);
            bool iosCandidate = ready && iosBuildSupport;

            string result =
                $"[TRIAD READY] Ready={ready}; URP={urp}; Renderer={rendererReady}; Scene={sceneAssetExists}; " +
                $"Root={rootCount}/1; Preview={previewCount}/1; GridRoots={gridCount}/1; " +
                $"GridPoints={pointCount}/{BoardCoordinate.IntersectionCount}; UniqueLabels={labels.Count}/{BoardCoordinate.IntersectionCount}; " +
                $"Board={boardCount}/1; F9={f9Count}/1; F9Transform={f9Transform}; " +
                $"Camera={cameraCount}/1; DirectionalLight={directionalLightCount}/1; " +
                $"MissingScripts={missingScripts}; MissingMaterials={missingMaterials}; MissingShaders={missingShaders}; " +
                $"iOSBuildSupport={iosBuildSupport}; iOSMinimalBuildCandidate={iosCandidate}";

            Debug.Log(result);

            if (!ready)
                throw new InvalidOperationException(result);
        }
    }
}
