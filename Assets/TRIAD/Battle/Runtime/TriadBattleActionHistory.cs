using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleActionHistory : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private Text historyLabel;
        [SerializeField] private int maximumEntries = 3;
        private readonly List<string> entries = new();

        public TriadBattleBoardController Controller => controller;
        public int EntryCount => entries.Count;

        public void Configure(TriadBattleBoardController battleController, Text label, int maxEntries = 3)
        {
            controller = battleController;
            historyLabel = label;
            maximumEntries = Mathf.Max(1, maxEntries);
        }

        private void Awake()
        {
            if (controller != null) controller.ActionResolved += OnActionResolved;
            Render();
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionResolved -= OnActionResolved;
        }

        private void OnActionResolved(string message)
        {
            if (string.IsNullOrWhiteSpace(message)) entries.Clear();
            else
            {
                entries.Insert(0, message);
                if (entries.Count > maximumEntries) entries.RemoveRange(maximumEntries, entries.Count - maximumEntries);
            }
            Render();
        }

        private void Render()
        {
            if (historyLabel == null) return;
            historyLabel.text = entries.Count == 0 ? "まだ着手はありません" : string.Join("\n", entries);
        }
    }
}
