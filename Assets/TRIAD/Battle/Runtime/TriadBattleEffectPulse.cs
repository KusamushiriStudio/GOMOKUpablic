using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleEffectPulse : MonoBehaviour
    {
        [SerializeField] private float amplitude = .1f;
        [SerializeField] private float rotationSpeed = 24f;
        private Vector3 baseScale;
        private Quaternion baseRotation;
        private float phase;

        public void Configure(float pulseAmplitude, float degreesPerSecond)
        {
            amplitude = pulseAmplitude;
            rotationSpeed = degreesPerSecond;
            baseScale = transform.localScale;
            baseRotation = transform.localRotation;
            phase = Random.value * Mathf.PI * 2f;
        }

        private void Awake()
        {
            baseScale = transform.localScale;
            baseRotation = transform.localRotation;
            phase = Random.value * Mathf.PI * 2f;
        }

        private void Update()
        {
            if (TriadBattlePreferences.ReducedMotion)
            {
                transform.localScale = baseScale;
                transform.localRotation = baseRotation;
                return;
            }
            float scale = 1f + Mathf.Sin(Time.unscaledTime * 3.2f + phase) * amplitude;
            transform.localScale = new Vector3(baseScale.x * scale, baseScale.y, baseScale.z * scale);
            transform.Rotate(0f, rotationSpeed * Time.unscaledDeltaTime, 0f, Space.Self);
        }
    }
}
