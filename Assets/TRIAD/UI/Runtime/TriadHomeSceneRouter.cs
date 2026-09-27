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
        [SerializeField] private string storySceneName;
        [SerializeField] private string gachaSceneName;
        [SerializeField] private string wardrobeSceneName;
        private bool subscribed;

        public TriadHomeScreenController Controller => controller;
        public string BattleSceneName => battleSceneName;
        public string StorySceneName => storySceneName;
        public string GachaSceneName => gachaSceneName;
        public string WardrobeSceneName => wardrobeSceneName;

        public void Configure(TriadHomeScreenController homeController, string battleScene)
        {
            Unsubscribe();
            controller = homeController;
            battleSceneName = battleScene;
            if (isActiveAndEnabled) Subscribe();
        }

        public void ConfigureFeatureScenes(string storyScene, string gachaScene = "", string wardrobeScene = "")
        {
            storySceneName = storyScene ?? string.Empty;
            gachaSceneName = gachaScene ?? string.Empty;
            wardrobeSceneName = wardrobeScene ?? string.Empty;
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
            string destination = route switch
            {
                TriadHomeRoute.Battle => battleSceneName,
                TriadHomeRoute.Story => storySceneName,
                TriadHomeRoute.Gacha => gachaSceneName,
                TriadHomeRoute.Wardrobe => wardrobeSceneName,
                _ => string.Empty
            };

            if (!string.IsNullOrWhiteSpace(destination))
                StartCoroutine(LoadDestination(destination));
            else
                controller.CompleteNavigation();
        }

        private IEnumerator LoadDestination(string sceneName)
        {
            AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Single);
            if (operation == null)
            {
                controller.CompleteNavigation();
                yield break;
            }
            while (!operation.isDone) yield return null;
        }
    }
}
