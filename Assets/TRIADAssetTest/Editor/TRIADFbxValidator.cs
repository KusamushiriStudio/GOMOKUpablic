using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace TRIAD.AssetTest.Editor
{
    public static class TRIADFbxValidator
    {
        [MenuItem("TRIAD/Asset Test/Validate Selected FBX")]
        public static void ValidateSelectedFbx()
        {
            Object selected = Selection.activeObject;
            string path = AssetDatabase.GetAssetPath(selected);
            if (string.IsNullOrEmpty(path) || !path.EndsWith(".fbx", System.StringComparison.OrdinalIgnoreCase))
            {
                Debug.LogWarning("[TRIAD FBX] Select an FBX in the Project window first.");
                return;
            }

            var importer = AssetImporter.GetAtPath(path) as ModelImporter;
            GameObject model = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (importer == null || model == null)
            {
                Debug.LogError($"[TRIAD FBX] Could not load importer/model: {path}");
                return;
            }

            var problems = new List<string>();
            if (!Mathf.Approximately(importer.globalScale, 1f))
                problems.Add($"Scale: globalScale={importer.globalScale}, expected 1");

            MeshFilter[] filters = model.GetComponentsInChildren<MeshFilter>(true);
            SkinnedMeshRenderer[] skinned = model.GetComponentsInChildren<SkinnedMeshRenderer>(true);
            Renderer[] renderers = model.GetComponentsInChildren<Renderer>(true);

            int meshCount = 0;
            foreach (MeshFilter filter in filters)
            {
                if (filter.sharedMesh == null) continue;
                meshCount++;
                ValidateMesh(filter.sharedMesh, problems);
            }

            foreach (SkinnedMeshRenderer renderer in skinned)
            {
                if (renderer.sharedMesh == null) continue;
                meshCount++;
                ValidateMesh(renderer.sharedMesh, problems);
            }

            if (meshCount == 0)
                problems.Add("Mesh: no MeshFilter/SkinnedMeshRenderer mesh found");

            int materialSlots = 0;
            foreach (Renderer renderer in renderers)
                materialSlots += renderer.sharedMaterials?.Length ?? 0;
            if (materialSlots == 0)
                problems.Add("Material: no material slot found");

            Debug.Log($"[TRIAD FBX] {path}\n" +
                      $"Scale globalScale={importer.globalScale}, useFileScale={importer.useFileScale}\n" +
                      $"Axis/Root local rotation={model.transform.localRotation.eulerAngles}\n" +
                      $"Origin/Root local position={model.transform.localPosition}\n" +
                      $"Meshes={meshCount}, MaterialSlots={materialSlots}, Problems={problems.Count}");

            foreach (string problem in problems)
                Debug.LogWarning("[TRIAD FBX] " + problem, model);

            if (problems.Count == 0)
                Debug.Log("[TRIAD FBX] Automatic checks passed. Perform visual axis/origin check in AssetTestScene before approval.");
        }

        private static void ValidateMesh(Mesh mesh, List<string> problems)
        {
            if (mesh.vertexCount <= 0)
                problems.Add($"Mesh '{mesh.name}': vertexCount=0");
            if (mesh.normals == null || mesh.normals.Length != mesh.vertexCount)
                problems.Add($"Normal '{mesh.name}': normals={mesh.normals?.Length ?? 0}, vertices={mesh.vertexCount}");
            if (mesh.bounds.size.sqrMagnitude <= 0.000001f)
                problems.Add($"Bounds '{mesh.name}': zero/near-zero bounds");
        }
    }
}
