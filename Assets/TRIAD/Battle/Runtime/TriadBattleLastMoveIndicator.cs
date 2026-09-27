using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleLastMoveIndicator : MonoBehaviour
    {
        private const float GridSpacing = .04f;
        private const float BoardSurfaceY = .0405f;

        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private Transform markerRoot;
        private GameObject marker;
        private Material markerMaterial;
        private Vector3 baseScale;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, Transform root)
        {
            controller = battleController;
            markerRoot = root;
        }

        private void Awake()
        {
            BuildMarker();
            if (controller != null) controller.ActionCommitted += OnActionCommitted;
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionCommitted -= OnActionCommitted;
            if (markerMaterial != null) Destroy(markerMaterial);
        }

        private void Update()
        {
            if (marker == null || !marker.activeSelf) return;
            float pulse = TriadBattlePreferences.ReducedMotion
                ? 1f
                : 1f + Mathf.Sin(Time.unscaledTime * 4.2f) * .08f;
            marker.transform.localScale = new Vector3(baseScale.x * pulse, baseScale.y, baseScale.z * pulse);
        }

        private void OnActionCommitted(MatchAction action)
        {
            if (marker == null) BuildMarker();
            if (action == null)
            {
                if (marker != null) marker.SetActive(false);
                return;
            }
            BoardCoordinate target = action.Target;
            marker.transform.localPosition = new Vector3(
                -.20f + target.X * GridSpacing,
                BoardSurfaceY + .0055f,
                -.32f + target.Y * GridSpacing);
            marker.transform.localScale = baseScale;
            marker.SetActive(true);
        }

        private void BuildMarker()
        {
            if (markerRoot == null) return;
            marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            marker.name = "LastMoveMarkerVisual";
            marker.transform.SetParent(markerRoot, false);
            marker.transform.localRotation = Quaternion.identity;
            baseScale = new Vector3(.052f, .00065f, .052f);
            marker.transform.localScale = baseScale;
            Collider markerCollider = marker.GetComponent<Collider>();
            if (markerCollider != null) Destroy(markerCollider);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            markerMaterial = new Material(shader) { color = new Color(1f, .52f, .08f, .82f) };
            if (markerMaterial.HasProperty("_BaseColor"))
                markerMaterial.SetColor("_BaseColor", new Color(1f, .52f, .08f, .82f));
            if (markerMaterial.HasProperty("_EmissionColor"))
            {
                markerMaterial.EnableKeyword("_EMISSION");
                markerMaterial.SetColor("_EmissionColor", new Color(1f, .22f, .015f, 1f) * 1.7f);
            }
            marker.GetComponent<MeshRenderer>().sharedMaterial = markerMaterial;
            marker.SetActive(false);
        }
    }
}
