using System;
using TRIAD.Core.Rules;
using TRIAD.Core.Skills;
using TRIAD.UI;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleSkillBar : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private Button[] buttons = Array.Empty<Button>();
        [SerializeField] private TriadRoundedRectGraphic[] panels = Array.Empty<TriadRoundedRectGraphic>();
        [SerializeField] private Text[] labels = Array.Empty<Text>();
        [SerializeField] private string[] skillIds = Array.Empty<string>();
        private bool subscribed;

        public int SkillCount => skillIds?.Length ?? 0;
        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController source, Button[] skillButtons,
            TriadRoundedRectGraphic[] buttonPanels, Text[] buttonLabels, string[] ids)
        {
            Unsubscribe();
            controller = source;
            buttons = skillButtons;
            panels = buttonPanels;
            labels = buttonLabels;
            skillIds = ids;
            WireButtons();
            if (isActiveAndEnabled) Subscribe();
            Refresh(controller != null ? controller.State : null);
        }

        private void OnEnable() => Subscribe();
        private void Start() => Refresh(controller != null ? controller.State : null);

        private void OnDisable()
        {
            Unsubscribe();
            for (int i = 0; i < buttons.Length; i++)
                if (buttons[i] != null) buttons[i].onClick.RemoveAllListeners();
        }

        private void WireButtons()
        {
            for (int i = 0; i < buttons.Length && i < skillIds.Length; i++)
            {
                if (buttons[i] == null) continue;
                buttons[i].onClick.RemoveAllListeners();
                string id = skillIds[i];
                buttons[i].onClick.AddListener(() => controller?.SelectSkill(id));
            }
        }

        private void Subscribe()
        {
            if (subscribed || controller == null) return;
            controller.StateChanged += Refresh;
            controller.SkillSelectionChanged += RefreshSelection;
            subscribed = true;
        }

        private void Unsubscribe()
        {
            if (!subscribed || controller == null) return;
            controller.StateChanged -= Refresh;
            controller.SkillSelectionChanged -= RefreshSelection;
            subscribed = false;
        }

        private void Refresh(MatchState state)
        {
            if (state == null) return;
            for (int i = 0; i < skillIds.Length && i < buttons.Length; i++)
            {
                SkillDefinition definition = SkillCatalog.Get(state.Ruleset.Id, skillIds[i]);
                bool available = !state.IsFinished && state.Energy[state.TurnSeat] >= definition.Cost &&
                                 state.GetSkillUseCount(state.TurnSeat, skillIds[i]) < definition.Uses;
                buttons[i].interactable = available;
                if (labels[i] != null)
                {
                    labels[i].text = SkillName(skillIds[i]) + "\n" + definition.Cost;
                    labels[i].color = available
                        ? new Color(1f, .91f, .70f, 1f)
                        : new Color(.48f, .50f, .56f, .78f);
                }
            }
            RefreshSelection(controller.SelectedSkillId);
        }

        private void RefreshSelection(string selected)
        {
            for (int i = 0; i < panels.Length && i < skillIds.Length; i++)
            {
                bool active = skillIds[i] == selected;
                panels[i].color = active
                    ? new Color(.22f, .065f, .018f, .98f)
                    : new Color(.008f, .016f, .034f, .96f);
                panels[i].BorderColor = active
                    ? new Color(1f, .76f, .24f, 1f)
                    : new Color(.55f, .61f, .74f, .68f);
                panels[i].BorderWidth = active ? 2f : 1f;
                panels[i].SetVerticesDirty();
            }
        }

        private static string SkillName(string id)
        {
            return id switch
            {
                "spark" => "火花",
                "ward" => "守護",
                "windwalk" => "疾風",
                "freeze" => "凍結",
                "pull" => "引寄",
                "transmute" => "変換",
                _ => id
            };
        }
    }
}
