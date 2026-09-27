using System.Collections;
using TRIAD.Core.Board;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleInvalidInputFeedback : MonoBehaviour
    {
        private const float GridSpacing = .04f;
        private const float BoardSurfaceY = .0185f;

        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private Transform markerRoot;
        [SerializeField] private CanvasGroup toastGroup;
        [SerializeField] private Text messageLabel;
        private GameObject marker;
        private Material markerMaterial;
        private Coroutine feedbackRoutine;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, Transform root,
            CanvasGroup group, Text label)
        {
            controller = battleController;
            markerRoot = root;
            toastGroup = group;
            messageLabel = label;
        }

        private void Awake()
        {
            BuildMarker();
            if (controller != null) controller.InteractionRejected += OnInteractionRejected;
            SetVisible(false);
        }

        private void OnDestroy()
        {
            if (controller != null) controller.InteractionRejected -= OnInteractionRejected;
            if (markerMaterial != null) Destroy(markerMaterial);
        }

        private void OnInteractionRejected(string message, BoardCoordinate? coordinate)
        {
            if (messageLabel != null) messageLabel.text = message;
            if (marker != null)
            {
                marker.SetActive(coordinate.HasValue);
                if (coordinate.HasValue)
                {
                    BoardCoordinate target = coordinate.Value;
                    marker.transform.localPosition = new Vector3(
                        -.20f + target.X * GridSpacing,
                        BoardSurfaceY + .006f,
                        -.32f + target.Y * GridSpacing);
                }
            }
            if (feedbackRoutine != null) StopCoroutine(feedbackRoutine);
            feedbackRoutine = StartCoroutine(ShowThenHide());
        }

        private IEnumerator ShowThenHide()
        {
            SetVisible(true);
            yield return new WaitForSecondsRealtime(.8f);
            if (!TriadBattlePreferences.ReducedMotion && toastGroup != null)
            {
                float elapsed = 0f;
                while (elapsed < .22f)
                {
                    elapsed += Time.unscaledDeltaTime;
                    toastGroup.alpha = 1f - Mathf.Clamp01(elapsed / .22f);
                    yield return null;
                }
            }
            SetVisible(false);
            feedbackRoutine = null;
        }

        private void SetVisible(bool visible)
        {
            if (toastGroup != null) toastGroup.alpha = visible ? 1f : 0f;
            if (!visible && marker != null) marker.SetActive(false);
        }

        private void BuildMarker()
        {
            if (markerRoot == null) return;
            marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            marker.name = "InvalidTargetMarkerVisual";
            marker.transform.SetParent(markerRoot, false);
            marker.transform.localScale = new Vector3(.046f, .0008f, .046f);
            Collider markerCollider = marker.GetComponent<Collider>();
            if (markerCollider != null) Destroy(markerCollider);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            markerMaterial = new Material(shader) { color = new Color(.95f, .025f, .015f, .86f) };
            if (markerMaterial.HasProperty("_BaseColor"))
                markerMaterial.SetColor("_BaseColor", new Color(.95f, .025f, .015f, .86f));
            if (markerMaterial.HasProperty("_EmissionColor"))
            {
                markerMaterial.EnableKeyword("_EMISSION");
                markerMaterial.SetColor("_EmissionColor", new Color(1f, .01f, .005f, 1f) * 1.8f);
            }
            marker.GetComponent<MeshRenderer>().sharedMaterial = markerMaterial;
            marker.SetActive(false);
        }
    }
}
