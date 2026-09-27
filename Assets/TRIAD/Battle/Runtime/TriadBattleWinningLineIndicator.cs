using System.Collections.Generic;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleWinningLineIndicator : MonoBehaviour
    {
        private const float GridSpacing = .04f;
        private const float BoardSurfaceY = .0185f;

        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private Transform markerRoot;

        private readonly List<GameObject> markers = new();
        private Material markerMaterial;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController boardController, Transform root)
        {
            controller = boardController;
            markerRoot = root;
        }

        private void OnEnable()
        {
            if (controller != null) controller.WinningLineResolved += Show;
        }

        private void OnDisable()
        {
            if (controller != null) controller.WinningLineResolved -= Show;
            Clear();
        }

        private void OnDestroy()
        {
            if (markerMaterial != null) Destroy(markerMaterial);
        }

        private void Show(WinningLine line)
        {
            Clear();
            if (line == null || markerRoot == null) return;
            EnsureMaterial();

            foreach (BoardCoordinate coordinate in line.Coordinates)
            {
                GameObject marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                marker.name = $"WinningPoint_{coordinate.X}_{coordinate.Y}";
                marker.transform.SetParent(markerRoot, false);
                marker.transform.localPosition = PositionFor(coordinate);
                marker.transform.localRotation = Quaternion.identity;
                marker.transform.localScale = new Vector3(.040f, .00075f, .040f);
                Collider collider = marker.GetComponent<Collider>();
                if (collider != null) Destroy(collider);
                marker.GetComponent<MeshRenderer>().sharedMaterial = markerMaterial;
                marker.AddComponent<TriadBattleEffectPulse>().Configure(.09f, 18f);
                markers.Add(marker);
            }
        }

        private void Clear()
        {
            for (int index = markers.Count - 1; index >= 0; index--)
                if (markers[index] != null) Destroy(markers[index]);
            markers.Clear();
        }

        private void EnsureMaterial()
        {
            if (markerMaterial != null) return;
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            markerMaterial = new Material(shader);
            Color gold = new Color(1f, .68f, .12f, .88f);
            markerMaterial.color = gold;
            if (markerMaterial.HasProperty("_BaseColor")) markerMaterial.SetColor("_BaseColor", gold);
            if (markerMaterial.HasProperty("_Smoothness")) markerMaterial.SetFloat("_Smoothness", .88f);
            if (markerMaterial.HasProperty("_Metallic")) markerMaterial.SetFloat("_Metallic", .34f);
            if (markerMaterial.HasProperty("_EmissionColor"))
            {
                markerMaterial.EnableKeyword("_EMISSION");
                markerMaterial.SetColor("_EmissionColor", new Color(1f, .34f, .025f, 1f) * 1.6f);
            }
        }

        private static Vector3 PositionFor(BoardCoordinate coordinate) =>
            new(-.20f + coordinate.X * GridSpacing, BoardSurfaceY + .009f, -.32f + coordinate.Y * GridSpacing);
    }
}
