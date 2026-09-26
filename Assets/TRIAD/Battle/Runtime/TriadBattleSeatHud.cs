using TRIAD.Core.Rules;
using TRIAD.UI;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleSeatHud : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadRoundedRectGraphic[] panels = new TriadRoundedRectGraphic[3];
        [SerializeField] private Text[] energyLabels = new Text[3];
        [SerializeField] private Text[] stateLabels = new Text[3];
        private bool subscribed;

        public int SeatCount => panels?.Length ?? 0;
        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController source, TriadRoundedRectGraphic[] seatPanels,
            Text[] energies, Text[] states)
        {
            Unsubscribe();
            controller = source;
            panels = seatPanels;
            energyLabels = energies;
            stateLabels = states;
            if (isActiveAndEnabled) Subscribe();
            Refresh(controller != null ? controller.State : null);
        }

        private void OnEnable() => Subscribe();
        private void Start() => Refresh(controller != null ? controller.State : null);
        private void OnDisable() => Unsubscribe();

        private void Subscribe()
        {
            if (subscribed || controller == null) return;
            controller.StateChanged += Refresh;
            subscribed = true;
        }

        private void Unsubscribe()
        {
            if (!subscribed || controller == null) return;
            controller.StateChanged -= Refresh;
            subscribed = false;
        }

        private void Refresh(MatchState state)
        {
            if (state == null) return;
            for (int index = 0; index < panels.Length && index < 3; index++)
            {
                int seat = index + 1;
                bool active = !state.IsFinished && state.TurnSeat == seat;
                if (panels[index] != null)
                {
                    panels[index].color = active
                        ? new Color(.105f, .042f, .018f, .98f)
                        : new Color(.008f, .016f, .034f, .92f);
                    panels[index].BorderColor = active
                        ? new Color(1f, .77f, .28f, 1f)
                        : new Color(.48f, .55f, .72f, .62f);
                    panels[index].BorderWidth = active ? 2f : 1f;
                    panels[index].SetVerticesDirty();
                }
                if (energyLabels[index] != null) energyLabels[index].text = $"気力 {state.Energy[seat]}/6";
                if (stateLabels[index] != null)
                    stateLabels[index].text = state.IsFinished && state.WinnerSeat == seat ? "勝者" : active ? "手番" : "待機";
            }
        }
    }
}
