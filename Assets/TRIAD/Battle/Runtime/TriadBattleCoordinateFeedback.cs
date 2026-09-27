using System.Collections;
using TRIAD.Core.Board;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleCoordinateFeedback : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text label;
        private Coroutine fadeRoutine;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, CanvasGroup group, Text feedbackLabel)
        {
            controller = battleController;
            canvasGroup = group;
            label = feedbackLabel;
        }

        private void Awake()
        {
            if (controller != null) controller.CoordinateTargeted += OnCoordinateTargeted;
            if (canvasGroup != null) canvasGroup.alpha = 0f;
        }

        private void OnDestroy()
        {
            if (controller != null) controller.CoordinateTargeted -= OnCoordinateTargeted;
        }

        private void OnCoordinateTargeted(BoardCoordinate coordinate)
        {
            if (label != null) label.text = $"選択  {(char)('A' + coordinate.X)}{coordinate.Y + 1}";
            if (fadeRoutine != null) StopCoroutine(fadeRoutine);
            fadeRoutine = StartCoroutine(ShowThenFade());
        }

        private IEnumerator ShowThenFade()
        {
            if (canvasGroup == null) yield break;
            canvasGroup.alpha = 1f;
            yield return new WaitForSecondsRealtime(.65f);
            if (TriadBattlePreferences.ReducedMotion)
            {
                canvasGroup.alpha = 0f;
                yield break;
            }
            float elapsed = 0f;
            while (elapsed < .25f)
            {
                elapsed += Time.unscaledDeltaTime;
                canvasGroup.alpha = 1f - Mathf.Clamp01(elapsed / .25f);
                yield return null;
            }
            canvasGroup.alpha = 0f;
            fadeRoutine = null;
        }
    }
}
