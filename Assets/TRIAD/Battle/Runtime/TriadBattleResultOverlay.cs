using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleResultOverlay : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text winnerLabel;
        [SerializeField] private Text detailLabel;
        [SerializeField] private Button replayButton;
        [SerializeField] private Button homeButton;

        private static readonly string[] SeatNames = { "", "ヒバナ", "ユキネ", "クオン" };

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, CanvasGroup group,
            Text winner, Text detail, Button replay, Button home)
        {
            controller = battleController;
            canvasGroup = group;
            winnerLabel = winner;
            detailLabel = detail;
            replayButton = replay;
            homeButton = home;
        }

        private void Awake()
        {
            if (controller != null) controller.StateChanged += Refresh;
            if (replayButton != null) replayButton.onClick.AddListener(Replay);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            SetVisible(false);
        }

        private void Start()
        {
            if (controller != null) Refresh(controller.State);
        }

        private void OnDestroy()
        {
            if (controller != null) controller.StateChanged -= Refresh;
            if (replayButton != null) replayButton.onClick.RemoveListener(Replay);
            if (homeButton != null) homeButton.onClick.RemoveListener(ReturnHome);
        }

        private void Refresh(MatchState state)
        {
            if (state == null || !state.IsFinished)
            {
                SetVisible(false);
                return;
            }

            int seat = Mathf.Clamp(state.WinnerSeat, 1, 3);
            if (winnerLabel != null) winnerLabel.text = $"勝者  {SeatNames[seat]}";
            if (detailLabel != null) detailLabel.text = $"席{seat}が五連を完成  ・  {state.Ply + 1}手";
            SetVisible(true);
        }

        private void Replay()
        {
            SetVisible(false);
            controller?.StartMatch();
        }

        private void ReturnHome()
        {
            controller?.ReturnHome();
        }

        private void SetVisible(bool visible)
        {
            if (canvasGroup == null) return;
            canvasGroup.alpha = visible ? 1f : 0f;
            canvasGroup.interactable = visible;
            canvasGroup.blocksRaycasts = visible;
        }
    }
}
