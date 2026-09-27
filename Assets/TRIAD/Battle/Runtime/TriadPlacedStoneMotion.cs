using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadPlacedStoneMotion : MonoBehaviour
    {
        [SerializeField, Min(.05f)] private float duration = .22f;
        [SerializeField, Range(.05f, .9f)] private float initialScale = .18f;
        [SerializeField, Min(0f)] private float dropHeight = .035f;

        private Vector3 finalScale;
        private Vector3 finalPosition;
        private float elapsed;

        private void Awake()
        {
            finalScale = transform.localScale;
            finalPosition = transform.localPosition;
            if (TriadBattlePreferences.ReducedMotion)
            {
                enabled = false;
                return;
            }
            transform.localScale = finalScale * initialScale;
            transform.localPosition = finalPosition + Vector3.up * dropHeight;
        }

        private void Update()
        {
            elapsed += Time.unscaledDeltaTime;
            float t = Mathf.Clamp01(elapsed / duration);
            float eased = 1f - Mathf.Pow(1f - t, 3f);
            float bounce = Mathf.Sin(t * Mathf.PI) * .08f * (1f - t);
            transform.localScale = finalScale * (Mathf.Lerp(initialScale, 1f, eased) + bounce);
            transform.localPosition = Vector3.Lerp(finalPosition + Vector3.up * dropHeight, finalPosition, eased);
            if (t >= 1f) enabled = false;
        }
    }
}
