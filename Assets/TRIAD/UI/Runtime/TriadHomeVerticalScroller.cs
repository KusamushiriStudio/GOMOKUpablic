using UnityEngine;
using UnityEngine.EventSystems;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Home Vertical Scroller")]
    public sealed class TriadHomeVerticalScroller : MonoBehaviour, IDragHandler, IScrollHandler
    {
        [SerializeField] private RectTransform content;
        [SerializeField, Min(0)] private float maxOffset = 73f;
        [SerializeField, Min(1)] private float wheelSpeed = 24f;

        public float Offset => content ? content.anchoredPosition.y : 0f;
        public void Configure(RectTransform contentRect, float maximumOffset) { content = contentRect; maxOffset = Mathf.Max(0, maximumOffset); SetOffset(0); }
        public void OnDrag(PointerEventData eventData) => SetOffset(Offset + eventData.delta.y);
        public void OnScroll(PointerEventData eventData) => SetOffset(Offset - eventData.scrollDelta.y * wheelSpeed);
        public void SetOffset(float value)
        {
            if (!content) return;
            Vector2 p = content.anchoredPosition; p.y = Mathf.Clamp(value, 0, maxOffset); content.anchoredPosition = p;
        }
    }
}
