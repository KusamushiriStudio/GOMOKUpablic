using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    public static class TriadBattlePreferences
    {
        private const string AudioKey = "TRIAD.Battle.Accessibility.AudioEnabled";
        private const string ReducedMotionKey = "TRIAD.Battle.Accessibility.ReducedMotion";

        public static bool AudioEnabled
        {
            get => PlayerPrefs.GetInt(AudioKey, 1) != 0;
            set
            {
                PlayerPrefs.SetInt(AudioKey, value ? 1 : 0);
                PlayerPrefs.Save();
            }
        }

        public static bool ReducedMotion
        {
            get => PlayerPrefs.GetInt(ReducedMotionKey, 0) != 0;
            set
            {
                PlayerPrefs.SetInt(ReducedMotionKey, value ? 1 : 0);
                PlayerPrefs.Save();
            }
        }
    }

    [DisallowMultipleComponent]
    public sealed class TriadBattleAccessibilitySettings : MonoBehaviour
    {
        [SerializeField] private Button audioButton;
        [SerializeField] private Text audioLabel;
        [SerializeField] private Button motionButton;
        [SerializeField] private Text motionLabel;

        public void Configure(Button audio, Text audioText, Button motion, Text motionText)
        {
            audioButton = audio;
            audioLabel = audioText;
            motionButton = motion;
            motionLabel = motionText;
        }

        private void Awake()
        {
            if (audioButton != null) audioButton.onClick.AddListener(ToggleAudio);
            if (motionButton != null) motionButton.onClick.AddListener(ToggleMotion);
            RefreshLabels();
        }

        private void OnEnable() => RefreshLabels();

        private void OnDestroy()
        {
            if (audioButton != null) audioButton.onClick.RemoveListener(ToggleAudio);
            if (motionButton != null) motionButton.onClick.RemoveListener(ToggleMotion);
        }

        private void ToggleAudio()
        {
            TriadBattlePreferences.AudioEnabled = !TriadBattlePreferences.AudioEnabled;
            RefreshLabels();
        }

        private void ToggleMotion()
        {
            TriadBattlePreferences.ReducedMotion = !TriadBattlePreferences.ReducedMotion;
            RefreshLabels();
        }

        private void RefreshLabels()
        {
            if (audioLabel != null)
                audioLabel.text = $"音声：{(TriadBattlePreferences.AudioEnabled ? "ON" : "OFF")}";
            if (motionLabel != null)
                motionLabel.text = $"演出軽減：{(TriadBattlePreferences.ReducedMotion ? "ON" : "OFF")}";
        }
    }
}
