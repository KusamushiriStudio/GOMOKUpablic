using System.Collections;
using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleTurnFeedback : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private RectTransform banner;
        [SerializeField] private Text label;
        [SerializeField] private AudioSource audioSource;

        private static readonly string[] SeatNames = { "", "ヒバナ", "ユキネ", "クオン" };
        private Coroutine animation;
        private AudioClip turnClip;
        private int lastPly = -1;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, CanvasGroup group,
            RectTransform bannerRect, Text message, AudioSource source)
        {
            controller = battleController;
            canvasGroup = group;
            banner = bannerRect;
            label = message;
            audioSource = source;
        }

        private void Awake()
        {
            if (controller != null) controller.StateChanged += OnStateChanged;
            if (canvasGroup != null) canvasGroup.alpha = 0f;
            BuildTurnClip();
        }

        private void Start()
        {
            if (controller != null && controller.State != null) OnStateChanged(controller.State);
        }

        private void OnDestroy()
        {
            if (controller != null) controller.StateChanged -= OnStateChanged;
            if (turnClip != null) Destroy(turnClip);
        }

        private void OnStateChanged(MatchState state)
        {
            if (state == null || state.IsFinished || state.Ply == lastPly) return;
            bool opening = lastPly < 0 || state.Ply == 0;
            lastPly = state.Ply;
            int seat = Mathf.Clamp(state.TurnSeat, 1, 3);
            if (label != null) label.text = opening
                ? $"対局開始  ・  {SeatNames[seat]}の手番"
                : $"{SeatNames[seat]}の手番";
            if (animation != null) StopCoroutine(animation);
            animation = StartCoroutine(AnimateBanner());
            if (TriadBattlePreferences.AudioEnabled && audioSource != null && turnClip != null)
            {
                audioSource.pitch = 1f + (seat - 2) * .045f;
                audioSource.PlayOneShot(turnClip, .32f);
            }
        }

        private IEnumerator AnimateBanner()
        {
            if (canvasGroup == null || banner == null) yield break;
            Vector2 resting = banner.anchoredPosition;
            bool reducedMotion = TriadBattlePreferences.ReducedMotion;
            Vector2 start = reducedMotion ? resting : resting + new Vector2(42f, 0f);
            float elapsed = 0f;
            float enterDuration = reducedMotion ? .08f : .18f;
            while (elapsed < enterDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = Mathf.Clamp01(elapsed / enterDuration);
                float eased = 1f - (1f - t) * (1f - t);
                banner.anchoredPosition = Vector2.LerpUnclamped(start, resting, eased);
                canvasGroup.alpha = t;
                yield return null;
            }
            banner.anchoredPosition = resting;
            canvasGroup.alpha = 1f;
            yield return new WaitForSecondsRealtime(reducedMotion ? .72f : .85f);
            elapsed = 0f;
            float exitDuration = reducedMotion ? .12f : .3f;
            while (elapsed < exitDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                canvasGroup.alpha = 1f - Mathf.Clamp01(elapsed / exitDuration);
                yield return null;
            }
            canvasGroup.alpha = 0f;
            animation = null;
        }

        private void BuildTurnClip()
        {
            const int sampleRate = 22050;
            const float duration = .16f;
            int sampleCount = Mathf.CeilToInt(sampleRate * duration);
            float[] samples = new float[sampleCount];
            for (int index = 0; index < sampleCount; index++)
            {
                float time = index / (float)sampleRate;
                float frequency = time < duration * .52f ? 659.25f : 880f;
                float envelope = Mathf.Sin(Mathf.PI * time / duration);
                samples[index] = Mathf.Sin(2f * Mathf.PI * frequency * time) * envelope * .18f;
            }
            turnClip = AudioClip.Create("TRIAD_Turn_Chime", sampleCount, 1, sampleRate, false);
            turnClip.SetData(samples, 0);
            if (audioSource != null)
            {
                audioSource.playOnAwake = false;
                audioSource.loop = false;
            }
        }
    }
}
