using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [DisallowMultipleComponent]
    public sealed class TriadRouteTransitionIndicator : MonoBehaviour
    {
        [SerializeField] private TriadHomeScreenController controller;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text label;
        [SerializeField, Min(1f)] private float fadeSpeed = 10f;

        private float targetAlpha;
        private bool subscribed;

        public TriadHomeScreenController Controller => controller;
        public CanvasGroup Group => canvasGroup;
        public Text Label => label;

        public void Configure(TriadHomeScreenController source, CanvasGroup group, Text statusLabel)
        {
            Unsubscribe();
            controller = source;
            canvasGroup = group;
            label = statusLabel;
            targetAlpha = 0f;
            if (canvasGroup != null)
            {
                canvasGroup.alpha = 0f;
                canvasGroup.blocksRaycasts = false;
                canvasGroup.interactable = false;
            }
            if (isActiveAndEnabled) Subscribe();
        }

        private void Awake()
        {
            if (canvasGroup == null) canvasGroup = GetComponent<CanvasGroup>();
            targetAlpha = 0f;
            if (canvasGroup != null) canvasGroup.alpha = 0f;
        }

        private void OnEnable() => Subscribe();
        private void OnDisable() => Unsubscribe();

        private void Update()
        {
            if (canvasGroup == null) return;
            canvasGroup.alpha = Mathf.MoveTowards(
                canvasGroup.alpha, targetAlpha, fadeSpeed * Time.unscaledDeltaTime);
        }

        private void Subscribe()
        {
            if (subscribed || controller == null) return;
            controller.NavigationRequested += Show;
            controller.NavigationCompleted += Hide;
            subscribed = true;
        }

        private void Unsubscribe()
        {
            if (!subscribed || controller == null) return;
            controller.NavigationRequested -= Show;
            controller.NavigationCompleted -= Hide;
            subscribed = false;
        }

        private void Show(TriadHomeRoute route)
        {
            if (label != null) label.text = RouteLabel(route) + "へ移動中…";
            targetAlpha = 1f;
        }

        private void Hide() => targetAlpha = 0f;

        private static string RouteLabel(TriadHomeRoute route)
        {
            return route switch
            {
                TriadHomeRoute.Home => "ホーム",
                TriadHomeRoute.Battle => "対戦",
                TriadHomeRoute.Story => "物語",
                TriadHomeRoute.World => "世界",
                TriadHomeRoute.Gacha => "ガチャ",
                TriadHomeRoute.Wardrobe => "着せ替え",
                TriadHomeRoute.CharacterTraining => "キャラ強化",
                TriadHomeRoute.Community => "交流",
                _ => "画面"
            };
        }
    }
}
