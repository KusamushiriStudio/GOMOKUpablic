using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Build;
using UnityEngine;

namespace TRIAD.AssetTest.Editor
{
    /// <summary>Headless import gate for every FBX placed in the test project's Incoming folder.</summary>
    public static class TRIADFbxBatchGate
    {
        private const string IncomingRoot = "Assets/TRIADAssetTest/Models/Incoming";

        public static void Run()
        {
            string[] guids = AssetDatabase.FindAssets("t:Model", new[] { IncomingRoot });
            var allProblems = new List<string>();
            int checkedModels = 0;

            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (!path.EndsWith(".fbx", StringComparison.OrdinalIgnoreCase)) continue;
                checkedModels++;
                Validate(path, allProblems);
            }

            if (checkedModels == 0)
                allProblems.Add($"No FBX files found under {IncomingRoot}");

            if (allProblems.Count > 0)
            {
                foreach (string problem in allProblems)
                    Debug.LogError("[TRIAD FBX Gate] " + problem);
                throw new BuildFailedException($"TRIAD FBX gate failed with {allProblems.Count} problem(s).");
            }

            Debug.Log($"[TRIAD FBX Gate] PASS: {checkedModels} FBX file(s) imported with valid scale, meshes, normals, bounds, and material slots.");
        }

        private static void Validate(string path, List<string> problems)
        {
            var importer = AssetImporter.GetAtPath(path) as ModelImporter;
            GameObject model = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (importer == null || model == null)
            {
                problems.Add($"{path}: model/importer could not be loaded");
                return;
            }

            if (!Mathf.Approximately(importer.globalScale, 1f))
                problems.Add($"{path}: globalScale={importer.globalScale}, expected 1");
            if (importer.importAnimation)
                problems.Add($"{path}: animations must be disabled");

            int meshCount = 0;
            foreach (MeshFilter filter in model.GetComponentsInChildren<MeshFilter>(true))
            {
                if (filter.sharedMesh == null) continue;
                meshCount++;
                ValidateMesh(path, filter.sharedMesh, problems);
            }
            foreach (SkinnedMeshRenderer renderer in model.GetComponentsInChildren<SkinnedMeshRenderer>(true))
            {
                if (renderer.sharedMesh == null) continue;
                meshCount++;
                ValidateMesh(path, renderer.sharedMesh, problems);
            }
            if (meshCount == 0)
                problems.Add($"{path}: no imported meshes");

            int materialSlots = 0;
            foreach (Renderer renderer in model.GetComponentsInChildren<Renderer>(true))
                materialSlots += renderer.sharedMaterials?.Length ?? 0;
            if (materialSlots == 0)
                problems.Add($"{path}: no material slots");
        }

        private static void ValidateMesh(string path, Mesh mesh, List<string> problems)
        {
            if (mesh.vertexCount <= 0)
                problems.Add($"{path}/{mesh.name}: vertexCount=0");
            if (mesh.normals == null || mesh.normals.Length != mesh.vertexCount)
                problems.Add($"{path}/{mesh.name}: normals={mesh.normals?.Length ?? 0}, vertices={mesh.vertexCount}");
            if (mesh.bounds.size.sqrMagnitude <= 0.000001f)
                problems.Add($"{path}/{mesh.name}: zero or near-zero bounds");
        }
    }
}
