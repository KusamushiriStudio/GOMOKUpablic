using UnityEngine;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadScrollCue : MonoBehaviour
    {
        [SerializeField] private TriadHomeVerticalScroller scroller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private RectTransform movingRoot;
        [SerializeField, Min(1f)] private float fadeDistance = 34f;
        [SerializeField, Min(0f)] private float bobAmplitude = 1.5f;
        [SerializeField, Min(.1f)] private float bobSpeed = 2.6f;

        private Vector2 restingPosition;

        public TriadHomeVerticalScroller Scroller => scroller;
        public CanvasGroup Group => canvasGroup;

        public void Configure(TriadHomeVerticalScroller scrollController, CanvasGroup group, RectTransform root)
        {
            scroller = scrollController;
            canvasGroup = group;
            movingRoot = root;
            restingPosition = movingRoot != null ? movingRoot.anchoredPosition : Vector2.zero;
            Apply();
        }

        private void Awake()
        {
            if (movingRoot == null) movingRoot = transform as RectTransform;
            if (canvasGroup == null) canvasGroup = GetComponent<CanvasGroup>();
            restingPosition = movingRoot != null ? movingRoot.anchoredPosition : Vector2.zero;
            Apply();
        }

        private void OnEnable()
        {
            if (movingRoot != null) restingPosition = movingRoot.anchoredPosition;
            Apply();
        }

        private void Update() => Apply();

        private void Apply()
        {
            float offset = scroller != null ? scroller.Offset : 0f;
            if (canvasGroup != null)
            {
                canvasGroup.alpha = 1f - Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(offset / fadeDistance));
                canvasGroup.interactable = false;
                canvasGroup.blocksRaycasts = false;
            }
            if (movingRoot != null)
            {
                float bob = Mathf.Sin(Time.unscaledTime * bobSpeed) * bobAmplitude;
                movingRoot.anchoredPosition = restingPosition + Vector2.up * bob;
            }
        }
    }
}
