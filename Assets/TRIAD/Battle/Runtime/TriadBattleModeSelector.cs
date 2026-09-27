using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleModeSelector : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleCpuDriver cpuDriver;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text modeBadgeLabel;
        [SerializeField] private Button soloButton;
        [SerializeField] private Button localButton;
        [SerializeField] private Button homeButton;

        public TriadBattleBoardController Controller => controller;
        public bool HasSelection { get; private set; }

        public void Configure(TriadBattleBoardController battleController, TriadBattleCpuDriver driver,
            CanvasGroup group, Text badgeLabel, Button solo, Button local, Button home,
            TriadBattleSessionContext session = null)
        {
            controller = battleController;
            cpuDriver = driver;
            canvasGroup = group;
            modeBadgeLabel = badgeLabel;
            soloButton = solo;
            localButton = local;
            homeButton = home;
            sessionContext = session;
        }

        public void SetSessionContext(TriadBattleSessionContext session) => sessionContext = session;

        private void Awake()
        {
            if (soloButton != null) soloButton.onClick.AddListener(SelectSolo);
            if (localButton != null) localButton.onClick.AddListener(SelectLocal);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            controller?.SetInputLocked(true);
            SetVisible(true);
        }

        private void OnDestroy()
        {
            if (soloButton != null) soloButton.onClick.RemoveListener(SelectSolo);
            if (localButton != null) localButton.onClick.RemoveListener(SelectLocal);
            if (homeButton != null) homeButton.onClick.RemoveListener(ReturnHome);
        }

        private void SelectSolo() => ApplyMode((1 << 2) | (1 << 3), "SOLO  CPU×2", TriadBattleSessionMode.Solo);

        private void SelectLocal() => ApplyMode(0, "LOCAL  3人対戦", TriadBattleSessionMode.Local);

        public void ResumeOffline(TriadBattleSessionMode mode, string sessionId)
        {
            int cpuSeatMask = mode == TriadBattleSessionMode.Solo ? (1 << 2) | (1 << 3) : 0;
            string label = mode == TriadBattleSessionMode.Solo ? "SOLO  CPU×2" : "LOCAL  3人対戦";
            sessionContext?.RestoreOffline(mode, sessionId);
            cpuDriver?.SetMode(cpuSeatMask);
            if (modeBadgeLabel != null) modeBadgeLabel.text = label;
            HasSelection = true;
            SetVisible(false);
            controller?.StartMatch();
        }

        private void ApplyMode(int cpuSeatMask, string label, TriadBattleSessionMode mode)
        {
            sessionContext?.BeginOffline(mode);
            cpuDriver?.SetMode(cpuSeatMask);
            if (modeBadgeLabel != null) modeBadgeLabel.text = label;
            HasSelection = true;
            SetVisible(false);
            controller?.StartMatch();
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
