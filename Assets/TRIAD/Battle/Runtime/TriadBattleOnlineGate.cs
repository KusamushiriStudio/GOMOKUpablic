using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleOnlineGate : MonoBehaviour
    {
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private CanvasGroup noticeGroup;
        [SerializeField] private Button onlineButton;
        [SerializeField] private Button backButton;

        public TriadBattleSessionContext SessionContext => sessionContext;

        public void Configure(TriadBattleSessionContext session, CanvasGroup group, Button online, Button back)
        {
            sessionContext = session;
            noticeGroup = group;
            onlineButton = online;
            backButton = back;
        }

        private void Awake()
        {
            if (onlineButton != null) onlineButton.onClick.AddListener(OpenNotice);
            if (backButton != null) backButton.onClick.AddListener(CloseNotice);
            SetVisible(false);
        }

        private void OnDestroy()
        {
            if (onlineButton != null) onlineButton.onClick.RemoveListener(OpenNotice);
            if (backButton != null) backButton.onClick.RemoveListener(CloseNotice);
        }

        private void OpenNotice()
        {
            sessionContext?.PrepareOnline();
            SetVisible(true);
        }

        private void CloseNotice() => SetVisible(false);

        private void SetVisible(bool visible)
        {
            if (noticeGroup == null) return;
            noticeGroup.alpha = visible ? 1f : 0f;
            noticeGroup.interactable = visible;
            noticeGroup.blocksRaycasts = visible;
        }
    }
}
