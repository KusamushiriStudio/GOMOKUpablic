using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadHomeSceneRouter : MonoBehaviour
    {
        [SerializeField] private TriadHomeScreenController controller;
        [SerializeField] private string battleSceneName = "BattlePhase1";
        private bool subscribed;

        public TriadHomeScreenController Controller => controller;
        public string BattleSceneName => battleSceneName;

        public void Configure(TriadHomeScreenController homeController, string battleScene)
        {
            Unsubscribe();
            controller = homeController;
            battleSceneName = battleScene;
            if (isActiveAndEnabled) Subscribe();
        }

        private void OnEnable() => Subscribe();
        private void OnDisable() => Unsubscribe();

        private void Subscribe()
        {
            if (subscribed || controller == null) return;
            controller.NavigationRequested += Route;
            subscribed = true;
        }

        private void Unsubscribe()
        {
            if (!subscribed || controller == null) return;
            controller.NavigationRequested -= Route;
            subscribed = false;
        }

        private void Route(TriadHomeRoute route)
        {
            if (route == TriadHomeRoute.Battle)
            {
                StartCoroutine(LoadBattle());
                return;
            }

            // Other destination scenes are connected in later milestones. Keep the
            // current screen operable until each real destination is ready.
            controller.CompleteNavigation();
        }

        private IEnumerator LoadBattle()
        {
            AsyncOperation operation = SceneManager.LoadSceneAsync(battleSceneName, LoadSceneMode.Single);
            if (operation == null)
            {
                controller.CompleteNavigation();
                yield break;
            }
            while (!operation.isDone) yield return null;
        }
    }
}
