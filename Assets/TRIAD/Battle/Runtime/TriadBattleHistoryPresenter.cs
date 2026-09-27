using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleHistoryPresenter : MonoBehaviour
    {
        [SerializeField] private TriadBattleResultPersistence persistence;
        [SerializeField] private TriadBattleLocalResultSink resultSink;
        [SerializeField] private Text historyLabel;
        private static readonly string[] SeatNames = { "", "ヒバナ", "ユキネ", "クオン" };

        public TriadBattleLocalResultSink ResultSink => resultSink;

        public void Configure(TriadBattleResultPersistence resultPersistence,
            TriadBattleLocalResultSink sink, Text label)
        {
            persistence = resultPersistence;
            resultSink = sink;
            historyLabel = label;
        }

        private void Awake()
        {
            if (persistence != null) persistence.Persisted += OnPersisted;
        }

        private void Start() => Refresh();

        private void OnDestroy()
        {
            if (persistence != null) persistence.Persisted -= OnPersisted;
        }

        private void OnPersisted(TriadBattleResultPersistence _) => Refresh();

        private void Refresh()
        {
            if (historyLabel == null || resultSink == null) return;
            IReadOnlyList<TriadBattleHistoryEntry> entries = resultSink.LoadHistory();
            if (entries.Count == 0)
            {
                historyLabel.text = "直近の対局  ・  履歴なし";
                return;
            }
            var builder = new StringBuilder("直近の対局");
            int count = Mathf.Min(3, entries.Count);
            for (int index = 0; index < count; index++)
            {
                TriadBattleHistoryEntry entry = entries[index];
                int seat = Mathf.Clamp(entry.winnerSeat, 1, 3);
                builder.Append($"\n{index + 1}. {SeatNames[seat]}勝利  +{entry.awardPoints}pt");
            }
            historyLabel.text = builder.ToString();
        }
    }
}
