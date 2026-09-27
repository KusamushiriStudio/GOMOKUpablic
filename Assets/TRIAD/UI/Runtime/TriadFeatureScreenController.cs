using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public class TriadFeatureScreenController : MonoBehaviour
    {
        [SerializeField] private string homeSceneName = "HomePhase66";
        [SerializeField] private Button backButton;
        [SerializeField] private Text feedbackLabel;
        private bool leaving;

        public string HomeSceneName => homeSceneName;
        public Button BackButton => backButton;
        public Text FeedbackLabel => feedbackLabel;

        public virtual void Configure(string homeScene, Button back, Text feedback)
        {
            homeSceneName = homeScene;
            backButton = back;
            feedbackLabel = feedback;
        }

        protected virtual void Awake()
        {
            backButton?.onClick.AddListener(ReturnHome);
        }

        protected virtual void OnDestroy()
        {
            backButton?.onClick.RemoveListener(ReturnHome);
        }

        protected virtual void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape)) ReturnHome();
        }

        public void ReturnHome()
        {
            if (leaving || string.IsNullOrWhiteSpace(homeSceneName)) return;
            leaving = true;
            if (backButton != null) backButton.interactable = false;
            SceneManager.LoadScene(homeSceneName, LoadSceneMode.Single);
        }

        protected void SetFeedback(string message)
        {
            if (feedbackLabel != null) feedbackLabel.text = message;
        }
    }
}
