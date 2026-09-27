using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleLifecycleController : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattlePauseOverlay pauseOverlay;
        [SerializeField] private TriadBattleTutorialOverlay tutorialOverlay;
        [SerializeField] private TriadBattleModeSelector modeSelector;
        private int previousSleepTimeout;
        private int previousTargetFrameRate;

        public TriadBattleBoardController Controller => controller;

        public void Configure(TriadBattleBoardController battleController, TriadBattlePauseOverlay pause,
            TriadBattleTutorialOverlay tutorial, TriadBattleModeSelector modes)
        {
            controller = battleController;
            pauseOverlay = pause;
            tutorialOverlay = tutorial;
            modeSelector = modes;
        }

        private void Awake()
        {
            previousSleepTimeout = Screen.sleepTimeout;
            previousTargetFrameRate = Application.targetFrameRate;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
            Application.targetFrameRate = 60;
        }

        private void OnDestroy()
        {
            Screen.sleepTimeout = previousSleepTimeout;
            Application.targetFrameRate = previousTargetFrameRate;
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape)) HandleBackNavigation();
        }

        private void OnApplicationPause(bool paused)
        {
            if (paused) PauseActiveMatch();
        }

        private void OnApplicationFocus(bool focused)
        {
            if (!focused) PauseActiveMatch();
        }

        public void HandleBackNavigation()
        {
            if (tutorialOverlay != null && tutorialOverlay.IsOpen) return;
            if (pauseOverlay != null && pauseOverlay.IsOpen)
            {
                pauseOverlay.Close();
                return;
            }
            if (modeSelector == null || !modeSelector.HasSelection ||
                controller == null || controller.State == null || controller.State.IsFinished)
            {
                controller?.ReturnHome();
                return;
            }
            pauseOverlay?.Open();
        }

        private void PauseActiveMatch()
        {
            if (modeSelector == null || !modeSelector.HasSelection ||
                controller == null || controller.State == null || controller.State.IsFinished ||
                (tutorialOverlay != null && tutorialOverlay.IsOpen)) return;
            pauseOverlay?.Open();
        }
    }
}
