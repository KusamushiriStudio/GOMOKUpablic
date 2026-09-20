using System;
using System.Globalization;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Home Header View")]
    public sealed class TriadHomeHeaderView : MonoBehaviour
    {
        [SerializeField] private Text brandLabel;
        [SerializeField] private Text subtitleLabel;
        [SerializeField] private Text currencyLabel;
        [SerializeField] private Text unreadLabel;
        [SerializeField] private Button mailButton;
        [SerializeField] private Button notificationButton;
        [SerializeField] private UnityEvent onMailPressed = new();
        [SerializeField] private UnityEvent onNotificationPressed = new();
        [SerializeField, Min(0)] private int currency = 12480;
        [SerializeField, Min(0)] private int unreadCount = 7;

        private static Font serifFont;
        private static Font sansFont;

        public int Currency => currency;
        public int UnreadCount => unreadCount;
        public event Action MailPressed;
        public event Action NotificationPressed;

        public void Configure(Text brand, Text subtitle, Text currencyText, Text unreadText, Button mail, Button notification)
        {
            brandLabel = brand;
            subtitleLabel = subtitle;
            currencyLabel = currencyText;
            unreadLabel = unreadText;
            mailButton = mail;
            notificationButton = notification;
        }

        private void Awake()
        {
            ApplyFontsForPreview();
            Refresh();
            mailButton?.onClick.AddListener(HandleMailPressed);
            notificationButton?.onClick.AddListener(HandleNotificationPressed);
        }

        private void OnDestroy()
        {
            mailButton?.onClick.RemoveListener(HandleMailPressed);
            notificationButton?.onClick.RemoveListener(HandleNotificationPressed);
        }

        public void SetCurrency(int value)
        {
            currency = Mathf.Max(0, value);
            Refresh();
        }

        public void SetUnreadCount(int value)
        {
            unreadCount = Mathf.Max(0, value);
            Refresh();
        }

        public void Refresh()
        {
            if (currencyLabel != null) currencyLabel.text = currency.ToString("N0", CultureInfo.InvariantCulture);
            if (unreadLabel != null)
            {
                unreadLabel.text = unreadCount > 99 ? "99+" : unreadCount.ToString(CultureInfo.InvariantCulture);
                unreadLabel.transform.parent.gameObject.SetActive(unreadCount > 0);
            }
        }

        public void ApplyFontsForPreview()
        {
            serifFont ??= Font.CreateDynamicFontFromOSFont(
                new[] { "Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "Times New Roman" }, 24);
            sansFont ??= Font.CreateDynamicFontFromOSFont(
                new[] { "Noto Sans JP", "Yu Gothic UI", "Hiragino Sans", "Arial" }, 18);
            if (brandLabel != null && serifFont != null) brandLabel.font = serifFont;
            if (subtitleLabel != null && sansFont != null) subtitleLabel.font = sansFont;
            if (currencyLabel != null && sansFont != null) currencyLabel.font = sansFont;
            if (unreadLabel != null && sansFont != null) unreadLabel.font = sansFont;
        }

        private void HandleMailPressed()
        {
            onMailPressed?.Invoke();
            MailPressed?.Invoke();
        }

        private void HandleNotificationPressed()
        {
            onNotificationPressed?.Invoke();
            NotificationPressed?.Invoke();
        }
    }
}
