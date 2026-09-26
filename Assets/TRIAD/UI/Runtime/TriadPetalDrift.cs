using UnityEngine;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadPetalDrift : MonoBehaviour
    {
        [SerializeField] private RectTransform petal;
        [SerializeField] private RectTransform bounds;
        [SerializeField, Min(2f)] private float fallSpeed = 18f;
        [SerializeField, Min(0f)] private float swayWidth = 9f;
        [SerializeField] private float rotationSpeed = 22f;
        [SerializeField] private float phase;

        private float baseX;
        private float currentY;

        public RectTransform Bounds => bounds;
        public float FallSpeed => fallSpeed;

        public void Configure(RectTransform particle, RectTransform movementBounds,
            float speed, float sway, float spin, float phaseOffset)
        {
            petal = particle;
            bounds = movementBounds;
            fallSpeed = Mathf.Max(2f, speed);
            swayWidth = Mathf.Max(0f, sway);
            rotationSpeed = spin;
            phase = phaseOffset;
            CachePosition();
        }

        private void Awake()
        {
            if (petal == null) petal = transform as RectTransform;
            if (bounds == null) bounds = transform.parent as RectTransform;
            CachePosition();
        }

        private void OnEnable() => CachePosition();

        private void Update()
        {
            if (petal == null || bounds == null) return;
            float dt = Time.unscaledDeltaTime;
            currentY -= fallSpeed * dt;
            float x = baseX + Mathf.Sin(Time.unscaledTime * 1.25f + phase) * swayWidth;
            petal.anchoredPosition = new Vector2(x, currentY);
            petal.localRotation = Quaternion.Euler(0f, 0f,
                petal.localEulerAngles.z + rotationSpeed * dt);

            float height = Mathf.Max(80f, bounds.rect.height);
            if (currentY < -height - 18f)
            {
                currentY = 14f + Mathf.Repeat(phase * 17f, 34f);
                float width = Mathf.Max(120f, bounds.rect.width);
                baseX = Mathf.Repeat(baseX + width * .618f + phase * 13f, width);
            }
        }

        private void CachePosition()
        {
            if (petal == null) return;
            baseX = petal.anchoredPosition.x;
            currentY = petal.anchoredPosition.y;
        }
    }
}
