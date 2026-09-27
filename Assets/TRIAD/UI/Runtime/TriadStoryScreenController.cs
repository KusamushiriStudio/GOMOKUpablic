using System;
using TRIAD.Core.Story;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadStoryScreenController : TriadFeatureScreenController
    {
        [SerializeField] private Button[] stageButtons = Array.Empty<Button>();
        [SerializeField] private Text[] stageLabels = Array.Empty<Text>();
        [SerializeField] private Text detailTitle;
        [SerializeField] private Text detailBody;
        [SerializeField] private Text progressLabel;
        [SerializeField] private Button startButton;
        [SerializeField, Min(1)] private int unlockedThrough = 5;
        private int selectedStage = 5;

        public int SelectedStage => selectedStage;
        public int UnlockedThrough => unlockedThrough;

        public void ConfigureStory(Button[] buttons, Text[] labels, Text title, Text body,
            Text progress, Button start, int unlockedStage)
        {
            stageButtons = buttons ?? Array.Empty<Button>();
            stageLabels = labels ?? Array.Empty<Text>();
            detailTitle = title;
            detailBody = body;
            progressLabel = progress;
            startButton = start;
            unlockedThrough = Mathf.Clamp(unlockedStage, 1, StoryCoreConstants.StageCount);
            selectedStage = unlockedThrough;
        }

        protected override void Awake()
        {
            base.Awake();
            for (int index = 0; index < stageButtons.Length; index++)
            {
                int stage = index + 1;
                stageButtons[index]?.onClick.AddListener(() => SelectStage(stage));
            }
            startButton?.onClick.AddListener(StartSelectedStory);
            Refresh();
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            for (int index = 0; index < stageButtons.Length; index++)
                stageButtons[index]?.onClick.RemoveAllListeners();
            startButton?.onClick.RemoveListener(StartSelectedStory);
        }

        public void SelectStage(int stage)
        {
            selectedStage = Mathf.Clamp(stage, 1, StoryCoreConstants.StageCount);
            Refresh();
        }

        private void StartSelectedStory()
        {
            if (selectedStage > unlockedThrough)
            {
                SetFeedback($"第{selectedStage}話は前の物語をクリアすると解放されます");
                return;
            }
            SetFeedback($"第{selectedStage}話を選択しました。物語本編との接続は次工程で行います");
        }

        private void Refresh()
        {
            string[] titles = { "灯籠の出会い", "三つ巴の予兆", "火花の一手", "月下の約束", "花骸の夜桜", "封じられた碁盤" };
            for (int index = 0; index < stageButtons.Length; index++)
            {
                int stage = index + 1;
                bool unlocked = stage <= unlockedThrough;
                bool selected = stage == selectedStage;
                if (stageLabels.Length > index && stageLabels[index] != null)
                    stageLabels[index].text = unlocked ? $"{stage}\n{(selected ? "選択中" : "開放")}" : $"{stage}\n未解放";
                if (stageButtons[index] != null) stageButtons[index].interactable = true;
            }

            string title = selectedStage <= titles.Length ? titles[selectedStage - 1] : $"第{selectedStage}話";
            bool canPlay = selectedStage <= unlockedThrough;
            if (detailTitle != null) detailTitle.text = $"第{selectedStage}話　{title}";
            if (detailBody != null) detailBody.text = canPlay
                ? "夜桜の神域で、ヒバナと三人対戦の謎を追う。\n勝利条件と獲得報酬を確認して物語へ進みます。"
                : "前の物語をクリアすると解放されます。";
            if (progressLabel != null) progressLabel.text = $"達成  {Mathf.Max(0, unlockedThrough - 1)} / {StoryCoreConstants.StageCount}話";
            if (startButton != null) startButton.interactable = canPlay;
            SetFeedback(canPlay ? "物語を選択してください" : "この物語は未解放です");
        }
    }
}
