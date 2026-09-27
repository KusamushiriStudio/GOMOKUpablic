using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleRewardPresenter : MonoBehaviour
    {
        [SerializeField] private TriadBattleResultPersistence persistence;
        [SerializeField] private Text rewardLabel;
        [SerializeField] private Text recordLabel;

        public TriadBattleResultPersistence Persistence => persistence;

        public void Configure(TriadBattleResultPersistence resultPersistence, Text reward, Text record)
        {
            persistence = resultPersistence;
            rewardLabel = reward;
            recordLabel = record;
        }

        private void Awake()
        {
            if (persistence != null) persistence.Persisted += Refresh;
            Render(0);
        }

        private void OnDestroy()
        {
            if (persistence != null) persistence.Persisted -= Refresh;
        }

        private void Refresh(TriadBattleResultPersistence resultPersistence)
        {
            int award = resultPersistence?.ResultSink?.LastAwardPoints ?? 0;
            Render(award);
        }

        private void Render(int award)
        {
            TriadBattleLocalResultSink sink = persistence != null ? persistence.ResultSink : null;
            if (rewardLabel != null)
                rewardLabel.text = award > 0 ? $"対局ポイント  +{award}" : "対局ポイント  集計待ち";
            if (recordLabel != null)
                recordLabel.text = sink == null
                    ? "戦績  未読込"
                    : $"戦績  {sink.TotalMatches}戦 {sink.SeatOneWins}勝  ・  累計 {sink.BattlePoints}PT";
        }
    }
}
