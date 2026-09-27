using System;
using System.Threading;
using System.Threading.Tasks;
using TRIAD.Core.Application;
using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleLocalResultSink : MonoBehaviour, IMatchResultSink
    {
        private const string Prefix = "TRIAD.Battle.Stats.v1.";

        public int TotalMatches => PlayerPrefs.GetInt(Prefix + "Total", 0);
        public int SeatOneWins => PlayerPrefs.GetInt(Prefix + "SeatOneWins", 0);
        public int BattlePoints => PlayerPrefs.GetInt(Prefix + "BattlePoints", 0);
        public int LastAwardPoints { get; private set; }
        public string LastMatchId => PlayerPrefs.GetString(Prefix + "LastMatchId", string.Empty);

        public Task PersistAsync(MatchResultDto result, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            string lastRequest = PlayerPrefs.GetString(Prefix + "LastRequestId", string.Empty);
            if (lastRequest == result.RequestId)
            {
                LastAwardPoints = 0;
                return Task.CompletedTask;
            }

            int award = result.WinnerSeat == 1 ? 120 : 35;
            PlayerPrefs.SetInt(Prefix + "Total", TotalMatches + 1);
            if (result.WinnerSeat == 1) PlayerPrefs.SetInt(Prefix + "SeatOneWins", SeatOneWins + 1);
            PlayerPrefs.SetInt(Prefix + "BattlePoints", BattlePoints + award);
            PlayerPrefs.SetString(Prefix + "LastMatchId", result.MatchId);
            PlayerPrefs.SetString(Prefix + "LastRequestId", result.RequestId);
            PlayerPrefs.Save();
            LastAwardPoints = award;
            return Task.CompletedTask;
        }
    }

    [DisallowMultipleComponent]
    public sealed class TriadBattleResultPersistence : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private TriadBattleSessionJournal journal;
        [SerializeField] private TriadBattleLocalResultSink resultSink;
        [SerializeField] private Text saveStatusLabel;
        private bool persistedCurrentMatch;

        public TriadBattleLocalResultSink ResultSink => resultSink;
        public bool PersistedCurrentMatch => persistedCurrentMatch;
        public string LastError { get; private set; }
        public event Action<TriadBattleResultPersistence> Persisted;

        public void Configure(TriadBattleBoardController battleController, TriadBattleSessionContext session,
            TriadBattleSessionJournal sessionJournal, TriadBattleLocalResultSink sink, Text statusLabel)
        {
            controller = battleController;
            sessionContext = session;
            journal = sessionJournal;
            resultSink = sink;
            saveStatusLabel = statusLabel;
        }

        private void Awake()
        {
            if (controller != null) controller.StateChanged += OnStateChanged;
            SetStatus("SAVE  READY");
        }

        private void OnDestroy()
        {
            if (controller != null) controller.StateChanged -= OnStateChanged;
        }

        private void OnStateChanged(MatchState state)
        {
            if (state == null || !state.IsFinished)
            {
                persistedCurrentMatch = false;
                LastError = null;
                SetStatus("SAVE  READY");
                return;
            }
            if (!persistedCurrentMatch) PersistAfterActionDispatchAsync(state);
        }

        private async void PersistAfterActionDispatchAsync(MatchState finishedState)
        {
            persistedCurrentMatch = true;
            SetStatus("SAVE  保存中");
            await Task.Yield();
            try
            {
                string sessionId = sessionContext != null && !string.IsNullOrEmpty(sessionContext.SessionId)
                    ? sessionContext.SessionId
                    : $"offline-match-{DateTime.UtcNow:yyyyMMddHHmmss}";
                long version = journal != null ? journal.LastSequence : finishedState.Ply;
                var result = new MatchResultDto(
                    sessionId,
                    finishedState.Ruleset.Id,
                    finishedState.WinnerSeat,
                    $"{sessionId}-result-{version}",
                    version);
                await resultSink.PersistAsync(result, CancellationToken.None);
                SetStatus("SAVE  完了");
                Persisted?.Invoke(this);
            }
            catch (Exception exception)
            {
                LastError = exception.Message;
                persistedCurrentMatch = false;
                SetStatus("SAVE  失敗");
                Debug.LogException(exception);
            }
        }

        private void SetStatus(string message)
        {
            if (saveStatusLabel != null) saveStatusLabel.text = message;
        }
    }
}
