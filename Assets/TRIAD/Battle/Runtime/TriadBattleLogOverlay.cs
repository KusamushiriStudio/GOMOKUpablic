using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleLogOverlay : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text logLabel;
        [SerializeField] private Button openButton;
        [SerializeField] private Button closeButton;
        [SerializeField, Min(1)] private int maximumEntries = 30;
        private readonly List<string> entries = new();

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, CanvasGroup group, Text label,
            Button open, Button close, int maxEntries = 30)
        {
            controller = battleController;
            canvasGroup = group;
            logLabel = label;
            openButton = open;
            closeButton = close;
            maximumEntries = Mathf.Max(1, maxEntries);
        }

        private void Awake()
        {
            if (controller != null) controller.ActionResolved += OnActionResolved;
            if (openButton != null) openButton.onClick.AddListener(Open);
            if (closeButton != null) closeButton.onClick.AddListener(Close);
            SetVisible(false);
            Render();
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionResolved -= OnActionResolved;
            if (openButton != null) openButton.onClick.RemoveListener(Open);
            if (closeButton != null) closeButton.onClick.RemoveListener(Close);
        }

        private void OnActionResolved(string message)
        {
            if (string.IsNullOrWhiteSpace(message)) entries.Clear();
            else
            {
                entries.Add(message);
                if (entries.Count > maximumEntries) entries.RemoveRange(0, entries.Count - maximumEntries);
            }
            Render();
        }

        private void Open() => SetVisible(true);
        private void Close() => SetVisible(false);

        private void Render()
        {
            if (logLabel == null) return;
            if (entries.Count == 0)
            {
                logLabel.text = "まだ着手はありません";
                return;
            }
            var lines = new List<string>();
            int start = Mathf.Max(0, entries.Count - 14);
            for (int index = start; index < entries.Count; index++)
                lines.Add($"{index + 1,2}.  {entries[index]}");
            logLabel.text = string.Join("\n", lines);
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
