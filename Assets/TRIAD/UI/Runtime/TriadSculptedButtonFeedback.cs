using System;
using System.Linq;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadSculptedButtonFeedback : MonoBehaviour,
        IPointerDownHandler, IPointerUpHandler, IPointerExitHandler,
        ISelectHandler, IDeselectHandler
    {
        [SerializeField] private RectTransform[] movingParts = Array.Empty<RectTransform>();
        [SerializeField] private CanvasGroup highlight;
        [SerializeField, Range(0f, 4f)] private float pressedOffset = 2f;
        [SerializeField, Range(.9f, 1f)] private float pressedScale = .985f;
        [SerializeField, Range(0f, 1f)] private float idleGlow = .16f;
        [SerializeField, Range(0f, 1f)] private float pressedGlow = .82f;
        [SerializeField, Min(1f)] private float responseSpeed = 22f;

        private Button button;
        private Vector2[] restingPositions = Array.Empty<Vector2>();
        private Vector3[] restingScales = Array.Empty<Vector3>();
        private float currentPress;
        private float targetPress;
        private bool selected;
        private float pulsePhase;

        public int MovingPartCount => movingParts?.Length ?? 0;
        public CanvasGroup Highlight => highlight;

        public void Configure(RectTransform[] parts, CanvasGroup highlightGroup,
            float sink = 2f, float scale = .985f, float idleAlpha = .16f, float activeAlpha = .82f)
        {
            movingParts = (parts ?? Array.Empty<RectTransform>())
                .Where(item => item != null).Distinct().ToArray();
            highlight = highlightGroup;
            pressedOffset = Mathf.Max(0f, sink);
            pressedScale = Mathf.Clamp(scale, .9f, 1f);
            idleGlow = Mathf.Clamp01(idleAlpha);
            pressedGlow = Mathf.Clamp01(activeAlpha);
            CacheRestPose();
            ApplyPose(0f);
        }

        private void Awake()
        {
            button = GetComponent<Button>();
            pulsePhase = Mathf.Abs(name.GetHashCode() % 1000) * .00628318f;
            CacheRestPose();
            ApplyPose(0f);
        }

        private void OnEnable()
        {
            button ??= GetComponent<Button>();
            CacheRestPose();
            currentPress = 0f;
            targetPress = 0f;
            ApplyPose(0f);
        }

        private void Update()
        {
            if (!IsInteractive()) targetPress = 0f;
            float blend = 1f - Mathf.Exp(-responseSpeed * Time.unscaledDeltaTime);
            currentPress = Mathf.Lerp(currentPress, targetPress, blend);
            ApplyPose(currentPress);
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            if (IsInteractive()) targetPress = 1f;
        }

        public void OnPointerUp(PointerEventData eventData) => ReturnToFocusState();
        public void OnPointerExit(PointerEventData eventData) => ReturnToFocusState();

        public void OnSelect(BaseEventData eventData)
        {
            selected = true;
            if (IsInteractive()) targetPress = .28f;
        }

        public void OnDeselect(BaseEventData eventData)
        {
            selected = false;
            targetPress = 0f;
        }

        private void OnDisable()
        {
            currentPress = 0f;
            targetPress = 0f;
            selected = false;
            ApplyPose(0f);
        }

        private void CacheRestPose()
        {
            movingParts ??= Array.Empty<RectTransform>();
            restingPositions = new Vector2[movingParts.Length];
            restingScales = new Vector3[movingParts.Length];
            for (int i = 0; i < movingParts.Length; i++)
            {
                if (movingParts[i] == null) continue;
                restingPositions[i] = movingParts[i].anchoredPosition;
                restingScales[i] = movingParts[i].localScale;
            }
        }

        private void ApplyPose(float amount)
        {
            for (int i = 0; i < movingParts.Length; i++)
            {
                RectTransform part = movingParts[i];
                if (part == null || i >= restingPositions.Length) continue;
                part.anchoredPosition = restingPositions[i] + Vector2.down * (pressedOffset * amount);
                part.localScale = restingScales[i] * Mathf.Lerp(1f, pressedScale, amount);
            }

            if (highlight != null)
            {
                float pulse = amount < .05f
                    ? (Mathf.Sin(Time.unscaledTime * 2.2f + pulsePhase) + 1f) * .025f
                    : 0f;
                highlight.alpha = Mathf.Clamp01(Mathf.Lerp(idleGlow, pressedGlow, amount) + pulse);
            }
        }

        private bool IsInteractive() => button == null || button.IsInteractable();

        private void ReturnToFocusState()
        {
            targetPress = selected && IsInteractive() ? .28f : 0f;
        }
    }
}
