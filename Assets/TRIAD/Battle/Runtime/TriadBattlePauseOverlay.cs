using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattlePauseOverlay : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Button menuButton;
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button homeButton;
        [SerializeField] private CanvasGroup exitConfirmationGroup;
        [SerializeField] private Button confirmExitButton;
        [SerializeField] private Button cancelExitButton;

        public TriadBattleBoardController Controller => controller;
        public bool IsOpen => canvasGroup != null && canvasGroup.alpha > .5f;

        public void Configure(TriadBattleBoardController battleController, CanvasGroup group,
            Button menu, Button resume, Button restart, Button home)
        {
            controller = battleController;
            canvasGroup = group;
            menuButton = menu;
            resumeButton = resume;
            restartButton = restart;
            homeButton = home;
        }

        public void ConfigureExitConfirmation(CanvasGroup group, Button confirm, Button cancel)
        {
            exitConfirmationGroup = group;
            confirmExitButton = confirm;
            cancelExitButton = cancel;
        }

        private void Awake()
        {
            if (menuButton != null) menuButton.onClick.AddListener(Open);
            if (resumeButton != null) resumeButton.onClick.AddListener(Close);
            if (restartButton != null) restartButton.onClick.AddListener(Restart);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            if (confirmExitButton != null) confirmExitButton.onClick.AddListener(ConfirmReturnHome);
            if (cancelExitButton != null) cancelExitButton.onClick.AddListener(CancelReturnHome);
            if (controller != null) controller.StateChanged += OnStateChanged;
            SetVisible(false);
            SetExitConfirmationVisible(false);
        }

        private void OnDestroy()
        {
            if (menuButton != null) menuButton.onClick.RemoveListener(Open);
            if (resumeButton != null) resumeButton.onClick.RemoveListener(Close);
            if (restartButton != null) restartButton.onClick.RemoveListener(Restart);
            if (homeButton != null) homeButton.onClick.RemoveListener(ReturnHome);
            if (confirmExitButton != null) confirmExitButton.onClick.RemoveListener(ConfirmReturnHome);
            if (cancelExitButton != null) cancelExitButton.onClick.RemoveListener(CancelReturnHome);
            if (controller != null) controller.StateChanged -= OnStateChanged;
        }

        public void Open()
        {
            if (controller == null || controller.State == null || controller.State.IsFinished) return;
            controller.SetInputLocked(true);
            controller.CancelSkillSelection();
            SetVisible(true);
        }

        public void Close()
        {
            controller?.SetInputLocked(false);
            SetExitConfirmationVisible(false);
            SetVisible(false);
        }

        private void Restart()
        {
            SetVisible(false);
            controller?.StartMatch();
        }

        private void ReturnHome()
        {
            if (exitConfirmationGroup != null) SetExitConfirmationVisible(true);
            else controller?.ReturnHome();
        }

        private void ConfirmReturnHome()
        {
            TriadBattleCheckpointStore.ClearCheckpoint();
            controller?.ReturnHome();
        }

        private void CancelReturnHome() => SetExitConfirmationVisible(false);

        private void OnStateChanged(MatchState state)
        {
            bool finished = state != null && state.IsFinished;
            if (menuButton != null) menuButton.interactable = !finished;
            if (finished) Close();
        }

        private void SetVisible(bool visible)
        {
            if (canvasGroup == null) return;
            canvasGroup.alpha = visible ? 1f : 0f;
            canvasGroup.interactable = visible;
            canvasGroup.blocksRaycasts = visible;
        }

        private void SetExitConfirmationVisible(bool visible)
        {
            if (exitConfirmationGroup == null) return;
            exitConfirmationGroup.alpha = visible ? 1f : 0f;
            exitConfirmationGroup.interactable = visible;
            exitConfirmationGroup.blocksRaycasts = visible;
        }
    }
}
