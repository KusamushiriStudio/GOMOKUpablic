using System.Collections.Generic;
using UnityEngine;

namespace TRIAD.AssetTest
{
    /// <summary>
    /// TEMP-only visualizer for the 11x17 intersection layout.
    /// Uses Unity primitives until Blender FBX assets arrive.
    /// </summary>
    [ExecuteAlways]
    public sealed class BoardGridPreview : MonoBehaviour
    {
        [Min(0.01f)] public float spacing = 1f;
        [Min(0.01f)] public float pointScale = 0.08f;
        public bool rebuildInEditMode = true;

        private const string GeneratedRootName = "TEMP_GeneratedGrid";
        private bool isRebuilding;
        private bool rebuildQueued;

        private void OnEnable()
        {
            QueueRebuild();
        }

        private void OnValidate()
        {
            if (!Application.isPlaying && rebuildInEditMode)
                QueueRebuild();
        }

        private void Update()
        {
            if (!rebuildQueued) return;

            if (!Application.isPlaying && !rebuildInEditMode)
            {
                rebuildQueued = false;
                return;
            }

            Rebuild();
        }

        private void QueueRebuild()
        {
            if ((Application.isPlaying || rebuildInEditMode) && !HasValidGeneratedContent())
                rebuildQueued = true;
        }

        /// <summary>
        /// Returns true when the serialized preview already matches the current settings.
        /// This prevents an editor open on another operating system from regenerating the
        /// complete scene with different Unity file IDs.
        /// </summary>
        public bool HasValidGeneratedContent()
        {
            if (spacing <= 0f || pointScale <= 0f) return false;

            Transform generatedRoot = null;
            int generatedRootCount = 0;
            foreach (Transform child in transform)
            {
                if (child.name != GeneratedRootName) continue;
                generatedRoot = child;
                generatedRootCount++;
            }

            if (generatedRootCount != 1 || generatedRoot == null) return false;

            int boardCount = 0;
            int pointCount = 0;
            int cameraCount = 0;
            int lightCount = 0;
            var labels = new HashSet<string>();

            foreach (Transform child in generatedRoot)
            {
                if (child.name == "TEMP_Board")
                {
                    boardCount++;
                    var expectedScale = new Vector3(
                        BoardCoordinate.ColumnCount * spacing,
                        0.12f,
                        BoardCoordinate.RowCount * spacing);
                    if (!Approximately(child.localPosition, new Vector3(0f, -0.08f, 0f)) ||
                        !Approximately(child.localScale, expectedScale))
                        return false;
                    continue;
                }

                if (child.name.StartsWith("TEMP_Point_"))
                {
                    pointCount++;
                    string label = child.name.Substring("TEMP_Point_".Length);
                    BoardCoordinate coordinate;
                    try
                    {
                        coordinate = BoardCoordinate.FromLabel(label);
                    }
                    catch
                    {
                        return false;
                    }

                    if (!labels.Add(coordinate.Label)) return false;

                    float expectedScale = coordinate.Label == "F9" ? pointScale * 1.75f : pointScale;
                    if (!Approximately(child.localPosition, coordinate.ToLocalPosition(spacing, 0f)) ||
                        !Approximately(child.localScale, Vector3.one * expectedScale))
                        return false;
                    continue;
                }

                if (child.GetComponent<Camera>() != null) cameraCount++;

                Light light = child.GetComponent<Light>();
                if (light != null && light.type == LightType.Directional) lightCount++;
            }

            return generatedRoot.childCount == BoardCoordinate.IntersectionCount + 3 &&
                   boardCount == 1 &&
                   pointCount == BoardCoordinate.IntersectionCount &&
                   labels.Count == BoardCoordinate.IntersectionCount &&
                   cameraCount == 1 &&
                   lightCount == 1;
        }

        private static bool Approximately(Vector3 left, Vector3 right) =>
            (left - right).sqrMagnitude <= 0.000001f;

        [ContextMenu("Rebuild TEMP Grid")]
        public void Rebuild()
        {
            if (isRebuilding) return;

            rebuildQueued = false;
            isRebuilding = true;
            try
            {
                ClearGenerated();

                var generatedRoot = new GameObject(GeneratedRootName);
                generatedRoot.transform.SetParent(transform, false);

                CreateBoard(generatedRoot.transform);
                CreateIntersections(generatedRoot.transform);
                EnsureCameraAndLight(generatedRoot.transform);
            }
            finally
            {
                isRebuilding = false;
            }
        }

        private void CreateBoard(Transform parent)
        {
            GameObject board = GameObject.CreatePrimitive(PrimitiveType.Cube);
            board.name = "TEMP_Board";
            board.transform.SetParent(parent, false);
            board.transform.localPosition = new Vector3(0f, -0.08f, 0f);
            board.transform.localScale = new Vector3(
                (BoardCoordinate.ColumnCount - 1) * spacing + spacing,
                0.12f,
                (BoardCoordinate.RowCount - 1) * spacing + spacing);
            RemoveCollider(board);
        }

        private void CreateIntersections(Transform parent)
        {
            for (int row = 0; row < BoardCoordinate.RowCount; row++)
            {
                for (int col = 0; col < BoardCoordinate.ColumnCount; col++)
                {
                    var coordinate = new BoardCoordinate(col, row);
                    GameObject point = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                    point.name = $"TEMP_Point_{coordinate.Label}";
                    point.transform.SetParent(parent, false);
                    point.transform.localPosition = coordinate.ToLocalPosition(spacing, 0f);

                    float scale = coordinate.Label == "F9" ? pointScale * 1.75f : pointScale;
                    point.transform.localScale = Vector3.one * scale;
                    RemoveCollider(point);
                }
            }
        }

        private static void EnsureCameraAndLight(Transform parent)
        {
            var cameraObject = new GameObject("TEMP_MainCamera");
            cameraObject.transform.SetParent(parent, false);
            cameraObject.tag = "MainCamera";
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.Skybox;
            cameraObject.transform.position = new Vector3(0f, 18f, -18f);
            cameraObject.transform.rotation = Quaternion.Euler(42f, 0f, 0f);

            var lightObject = new GameObject("TEMP_DirectionalLight");
            lightObject.transform.SetParent(parent, false);
            Light light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.2f;
            lightObject.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        private static void RemoveCollider(GameObject go)
        {
            Collider collider = go.GetComponent<Collider>();
            if (collider == null) return;

            if (Application.isPlaying)
                Destroy(collider);
            else
                DestroyImmediate(collider);
        }

        private void ClearGenerated()
        {
            for (int index = transform.childCount - 1; index >= 0; index--)
            {
                Transform child = transform.GetChild(index);
                if (child.name != GeneratedRootName) continue;

                if (Application.isPlaying)
                {
                    child.gameObject.SetActive(false);
                    Destroy(child.gameObject);
                }
                else
                    DestroyImmediate(child.gameObject);
            }
        }
    }
}
