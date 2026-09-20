using System;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadMainCtaView : MonoBehaviour
    {
        [SerializeField] private Button battleButton, storyButton;
        public event Action BattlePressed;
        public event Action StoryPressed;
        public void Configure(Button battle, Button story) { battleButton = battle; storyButton = story; }
        private void Awake()
        {
            TriadHomeFontUtility.Apply(transform);
            battleButton?.onClick.AddListener(HandleBattle); storyButton?.onClick.AddListener(HandleStory);
        }
        private void OnDestroy()
        {
            battleButton?.onClick.RemoveListener(HandleBattle); storyButton?.onClick.RemoveListener(HandleStory);
        }
        public void SetInteractable(bool value)
        { if (battleButton) battleButton.interactable = value; if (storyButton) storyButton.interactable = value; }
        private void HandleBattle() => BattlePressed?.Invoke();
        private void HandleStory() => StoryPressed?.Invoke();
    }
}
