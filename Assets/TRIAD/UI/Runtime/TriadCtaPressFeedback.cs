using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadCtaPressFeedback : MonoBehaviour,
        IPointerDownHandler, IPointerUpHandler, IPointerExitHandler, ISelectHandler, IDeselectHandler
    {
        [SerializeField] private CanvasGroup glow;
        [SerializeField, Range(0f, 1f)] private float idleGlow = .48f;
        [SerializeField, Range(0f, 1f)] private float activeGlow = .92f;
        [SerializeField, Range(.9f, 1f)] private float pressedScale = .975f;
        [SerializeField, Min(1f)] private float responseSpeed = 18f;

        private Button button;
        private Vector3 restingScale = Vector3.one;
        private float targetGlow;
        private float targetScale = 1f;

        public void Configure(CanvasGroup glowGroup, float idleAlpha = .48f, float activeAlpha = .92f)
        {
            glow = glowGroup;
            idleGlow = Mathf.Clamp01(idleAlpha);
            activeGlow = Mathf.Clamp01(activeAlpha);
            targetGlow = idleGlow;
            if (glow) glow.alpha = idleGlow;
        }

        private void Awake()
        {
            button = GetComponent<Button>();
            restingScale = transform.localScale;
            targetGlow = idleGlow;
            if (glow) glow.alpha = idleGlow;
        }

        private void Update()
        {
            float blend = 1f - Mathf.Exp(-responseSpeed * Time.unscaledDeltaTime);
            transform.localScale = Vector3.Lerp(transform.localScale, restingScale * targetScale, blend);
            if (glow) glow.alpha = Mathf.Lerp(glow.alpha, targetGlow, blend);
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            if (!IsInteractive()) return;
            targetScale = pressedScale;
            targetGlow = activeGlow;
        }

        public void OnPointerUp(PointerEventData eventData) => ReturnToRest();
        public void OnPointerExit(PointerEventData eventData) => ReturnToRest();

        public void OnSelect(BaseEventData eventData)
        {
            if (IsInteractive()) targetGlow = activeGlow;
        }

        public void OnDeselect(BaseEventData eventData) => ReturnToRest();

        private void OnDisable()
        {
            targetScale = 1f;
            targetGlow = idleGlow;
            transform.localScale = restingScale;
            if (glow) glow.alpha = idleGlow;
        }

        private bool IsInteractive() => button == null || button.IsInteractable();

        private void ReturnToRest()
        {
            targetScale = 1f;
            targetGlow = idleGlow;
        }
    }
}
