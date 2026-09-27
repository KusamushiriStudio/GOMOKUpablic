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
        [SerializeField] private CanvasGroup confirmationGroup;
        [SerializeField] private Text confirmationTitle;
        [SerializeField] private Text confirmationDetail;
        [SerializeField] private Button confirmButton;
        [SerializeField] private Button cancelButton;
        private int pendingCpuSeatMask;
        private string pendingBadgeLabel;
        private TriadBattleSessionMode pendingMode;

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

        public void ConfigureConfirmation(CanvasGroup group, Text title, Text detail, Button confirm, Button cancel)
        {
            confirmationGroup = group;
            confirmationTitle = title;
            confirmationDetail = detail;
            confirmButton = confirm;
            cancelButton = cancel;
        }

        private void Awake()
        {
            if (soloButton != null) soloButton.onClick.AddListener(SelectSolo);
            if (localButton != null) localButton.onClick.AddListener(SelectLocal);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            if (confirmButton != null) confirmButton.onClick.AddListener(ConfirmSelection);
            if (cancelButton != null) cancelButton.onClick.AddListener(CancelSelection);
            controller?.SetInputLocked(true);
            SetVisible(true);
            SetConfirmationVisible(false);
        }

        private void OnDestroy()
        {
            if (soloButton != null) soloButton.onClick.RemoveListener(SelectSolo);
            if (localButton != null) localButton.onClick.RemoveListener(SelectLocal);
            if (homeButton != null) homeButton.onClick.RemoveListener(ReturnHome);
            if (confirmButton != null) confirmButton.onClick.RemoveListener(ConfirmSelection);
            if (cancelButton != null) cancelButton.onClick.RemoveListener(CancelSelection);
        }

        private void SelectSolo() => StageMode(
            (1 << 2) | (1 << 3), "SOLO  CPU×2", TriadBattleSessionMode.Solo,
            "一人で対戦", "あなたはヒバナを操作\nユキネとクオンはCPU\n先に五つ連ねた席が勝利");

        private void SelectLocal() => StageMode(
            0, "LOCAL  3人対戦", TriadBattleSessionMode.Local,
            "三人ローカル", "一台を三人で順番に操作\n席1→席2→席3の順番\n先に五つ連ねた席が勝利");

        private void StageMode(int cpuSeatMask, string badge, TriadBattleSessionMode mode,
            string title, string detail)
        {
            if (confirmationGroup == null)
            {
                ApplyMode(cpuSeatMask, badge, mode);
                return;
            }
            pendingCpuSeatMask = cpuSeatMask;
            pendingBadgeLabel = badge;
            pendingMode = mode;
            if (confirmationTitle != null) confirmationTitle.text = title;
            if (confirmationDetail != null) confirmationDetail.text = detail;
            SetConfirmationVisible(true);
        }

        private void ConfirmSelection()
        {
            if (pendingMode != TriadBattleSessionMode.Solo && pendingMode != TriadBattleSessionMode.Local) return;
            SetConfirmationVisible(false);
            ApplyMode(pendingCpuSeatMask, pendingBadgeLabel, pendingMode);
        }

        private void CancelSelection()
        {
            pendingMode = TriadBattleSessionMode.None;
            SetConfirmationVisible(false);
        }

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

        private void SetConfirmationVisible(bool visible)
        {
            if (confirmationGroup == null) return;
            confirmationGroup.alpha = visible ? 1f : 0f;
            confirmationGroup.interactable = visible;
            confirmationGroup.blocksRaycasts = visible;
        }
    }
}
