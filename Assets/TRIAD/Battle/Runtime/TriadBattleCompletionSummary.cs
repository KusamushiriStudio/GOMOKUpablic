using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleCompletionSummary : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private TriadBattleSessionJournal journal;
        [SerializeField] private TriadBattleResultPersistence persistence;
        [SerializeField] private TriadBattleCheckpointStore checkpoint;
        [SerializeField] private Text summaryLabel;

        private bool saveConfirmed;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, TriadBattleSessionContext session,
            TriadBattleSessionJournal sessionJournal, TriadBattleResultPersistence resultPersistence,
            TriadBattleCheckpointStore checkpointStore, Text label)
        {
            controller = battleController;
            sessionContext = session;
            journal = sessionJournal;
            persistence = resultPersistence;
            checkpoint = checkpointStore;
            summaryLabel = label;
        }

        private void Awake()
        {
            if (controller != null) controller.StateChanged += OnStateChanged;
            if (persistence != null) persistence.Persisted += OnPersisted;
            Refresh(controller != null ? controller.State : null);
        }

        private void OnDestroy()
        {
            if (controller != null) controller.StateChanged -= OnStateChanged;
            if (persistence != null) persistence.Persisted -= OnPersisted;
        }

        private void OnStateChanged(MatchState state)
        {
            if (state == null || !state.IsFinished) saveConfirmed = false;
            Refresh(state);
        }

        private void OnPersisted(TriadBattleResultPersistence _)
        {
            saveConfirmed = true;
            Refresh(controller != null ? controller.State : null);
        }

        private void Refresh(MatchState state)
        {
            if (summaryLabel == null) return;
            if (state == null || !state.IsFinished)
            {
                summaryLabel.text = string.Empty;
                return;
            }

            string mode = sessionContext != null && sessionContext.Mode == TriadBattleSessionMode.Local
                ? "三人ローカル"
                : "一人用";
            int actions = Mathf.Max(state.Ply + 1, journal != null ? journal.LastSequence : 0);
            int seatOne = state.Board.CountStones(1);
            int seatTwo = state.Board.CountStones(2);
            int seatThree = state.Board.CountStones(3);
            string save = saveConfirmed ? "保存済み" : "保存処理中";
            string checkpointState = checkpoint == null || !checkpoint.HasCheckpoint ? "整理済み" : "要確認";
            summaryLabel.text =
                $"{mode}  ・  全{actions}手\n" +
                $"石数  席1 {seatOne}  /  席2 {seatTwo}  /  席3 {seatThree}\n" +
                $"結果 {save}  ・  中断データ {checkpointState}";
        }
    }
}
