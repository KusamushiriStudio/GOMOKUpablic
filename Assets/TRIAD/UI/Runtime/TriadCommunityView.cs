using System;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Home Community")]
    public sealed class TriadCommunityView : MonoBehaviour
    {
        [SerializeField] private Button communityButton;
        [SerializeField] private Button copyButton;
        [SerializeField] private Text playerCodeText;
        [SerializeField] private Text copyButtonText;

        public event Action CommunityPressed;
        public event Action CopyCodePressed;

        public void Configure(Button community, Button copy, Text playerCode, Text copyLabel)
        {
            communityButton = community; copyButton = copy; playerCodeText = playerCode; copyButtonText = copyLabel;
        }

        private void Awake()
        {
            TriadHomeFontUtility.Apply(transform);
            communityButton?.onClick.AddListener(HandleCommunity);
            copyButton?.onClick.AddListener(HandleCopy);
        }

        private void OnDestroy()
        {
            communityButton?.onClick.RemoveListener(HandleCommunity);
            copyButton?.onClick.RemoveListener(HandleCopy);
        }

        public void Bind(string playerCode)
        {
            if (playerCodeText) playerCodeText.text = string.IsNullOrWhiteSpace(playerCode) ? "未発行" : playerCode;
            if (copyButtonText) copyButtonText.text = "コピー";
            if (copyButton) copyButton.interactable = !string.IsNullOrWhiteSpace(playerCode);
        }

        public void ShowCopied()
        {
            if (copyButtonText) copyButtonText.text = "コピー済";
        }

        public void SetInteractable(bool value)
        {
            if (communityButton) communityButton.interactable = value;
            if (copyButton) copyButton.interactable = value && playerCodeText && playerCodeText.text != "未発行";
        }

        private void HandleCommunity() => CommunityPressed?.Invoke();
        private void HandleCopy() => CopyCodePressed?.Invoke();
    }
}
