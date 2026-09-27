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

        private void Awake()
        {
            if (menuButton != null) menuButton.onClick.AddListener(Open);
            if (resumeButton != null) resumeButton.onClick.AddListener(Close);
            if (restartButton != null) restartButton.onClick.AddListener(Restart);
            if (homeButton != null) homeButton.onClick.AddListener(ReturnHome);
            if (controller != null) controller.StateChanged += OnStateChanged;
            SetVisible(false);
        }

        private void OnDestroy()
        {
            if (menuButton != null) menuButton.onClick.RemoveListener(Open);
            if (resumeButton != null) resumeButton.onClick.RemoveListener(Close);
            if (restartButton != null) restartButton.onClick.RemoveListener(Restart);
            if (homeButton != null) homeButton.onClick.RemoveListener(ReturnHome);
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
            SetVisible(false);
        }

        private void Restart()
        {
            SetVisible(false);
            controller?.StartMatch();
        }

        private void ReturnHome()
        {
            controller?.ReturnHome();
        }

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
    }
}
