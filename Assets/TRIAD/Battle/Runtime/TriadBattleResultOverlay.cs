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
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private TriadBattleSessionJournal journal;
        [SerializeField] private Button copyButton;
        [SerializeField] private Text copyStatusLabel;

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

        public void ConfigureActions(TriadBattleSessionContext session, TriadBattleSessionJournal sessionJournal,
            Button copy, Text copyStatus)
        {
            sessionContext = session;
            journal = sessionJournal;
            copyButton = copy;
            copyStatusLabel = copyStatus;
        }

        private void Awake()
        {
            if (controller != null) controller.StateChanged += Refresh;
            if (replayButton != null) replayButton.onClick.AddListener(Replay);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            if (copyButton != null) copyButton.onClick.AddListener(CopyResult);
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
            if (copyButton != null) copyButton.onClick.RemoveListener(CopyResult);
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
            if (sessionContext != null &&
                (sessionContext.Mode == TriadBattleSessionMode.Solo ||
                 sessionContext.Mode == TriadBattleSessionMode.Local))
                sessionContext.BeginOffline(sessionContext.Mode);
            controller?.StartMatch();
            if (copyStatusLabel != null) copyStatusLabel.text = string.Empty;
        }

        private void CopyResult()
        {
            MatchState state = controller != null ? controller.State : null;
            if (state == null || !state.IsFinished) return;
            int seat = Mathf.Clamp(state.WinnerSeat, 1, 3);
            string sessionId = sessionContext != null ? sessionContext.SessionId : string.Empty;
            int actions = journal != null ? journal.LastSequence : state.Ply + 1;
            GUIUtility.systemCopyBuffer =
                $"TRIAD 対局結果｜勝者 {SeatNames[seat]}｜{actions}手｜MATCH {sessionId}";
            if (copyStatusLabel != null) copyStatusLabel.text = "結果をコピーしました";
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
