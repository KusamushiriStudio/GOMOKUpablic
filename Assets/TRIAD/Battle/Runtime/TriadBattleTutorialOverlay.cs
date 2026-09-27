using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleTutorialOverlay : MonoBehaviour
    {
        private const string SeenKey = "TRIAD.Battle.Tutorial.v1.Seen";
        private static readonly string[] Titles = { "三人で五つを連ねる", "盤面へ着手", "気力とスキル" };
        private static readonly string[] Bodies =
        {
            "席1・席2・席3の順に進みます。\n縦・横・斜めのいずれかで\n先に五つ連ねた席が勝者です。",
            "空いている交点をタップすると着手します。\n一人用ではヒバナの手番だけ操作し、\n残り二席はCPUが自動で着手します。",
            "手番が来ると気力が増加します。\n下部のスキルを選び、対象の交点を指定。\n守護と凍結は盤面上の光で確認できます。"
        };

        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Text stepLabel;
        [SerializeField] private Text titleLabel;
        [SerializeField] private Text bodyLabel;
        [SerializeField] private Button previousButton;
        [SerializeField] private Button nextButton;
        [SerializeField] private Button skipButton;
        private int page;

        public TriadBattleBoardController Controller => controller;
        public bool IsOpen => canvasGroup != null && canvasGroup.alpha > .5f;

        public void Configure(TriadBattleBoardController battleController, TriadBattleSessionContext session,
            CanvasGroup group, Text step, Text title, Text body, Button previous, Button next, Button skip)
        {
            controller = battleController;
            sessionContext = session;
            canvasGroup = group;
            stepLabel = step;
            titleLabel = title;
            bodyLabel = body;
            previousButton = previous;
            nextButton = next;
            skipButton = skip;
        }

        private void Awake()
        {
            if (previousButton != null) previousButton.onClick.AddListener(Previous);
            if (nextButton != null) nextButton.onClick.AddListener(Next);
            if (skipButton != null) skipButton.onClick.AddListener(Complete);
            if (controller != null) controller.StateChanged += OnStateChanged;
            SetVisible(false);
        }

        private void OnDestroy()
        {
            if (previousButton != null) previousButton.onClick.RemoveListener(Previous);
            if (nextButton != null) nextButton.onClick.RemoveListener(Next);
            if (skipButton != null) skipButton.onClick.RemoveListener(Complete);
            if (controller != null) controller.StateChanged -= OnStateChanged;
        }

        public void ShowAgain()
        {
            page = 0;
            controller?.SetInputLocked(true);
            Render();
            SetVisible(true);
        }

        private void OnStateChanged(MatchState state)
        {
            if (state == null || state.Ply != 0 || state.IsFinished ||
                sessionContext == null || sessionContext.Mode == TriadBattleSessionMode.None ||
                PlayerPrefs.GetInt(SeenKey, 0) != 0) return;
            ShowAgain();
        }

        private void Previous()
        {
            page = Mathf.Max(0, page - 1);
            Render();
        }

        private void Next()
        {
            if (page >= Titles.Length - 1) Complete();
            else
            {
                page++;
                Render();
            }
        }

        private void Complete()
        {
            PlayerPrefs.SetInt(SeenKey, 1);
            PlayerPrefs.Save();
            SetVisible(false);
            controller?.SetInputLocked(false);
        }

        private void Render()
        {
            if (stepLabel != null) stepLabel.text = $"GUIDE  {page + 1} / {Titles.Length}";
            if (titleLabel != null) titleLabel.text = Titles[page];
            if (bodyLabel != null) bodyLabel.text = Bodies[page];
            if (previousButton != null) previousButton.interactable = page > 0;
            Text nextText = nextButton != null ? nextButton.GetComponentInChildren<Text>(true) : null;
            if (nextText != null) nextText.text = page == Titles.Length - 1 ? "対局開始" : "次へ";
        }

        private void SetVisible(bool visible)
        {
            if (canvasGroup == null) return;
            canvasGroup.alpha = visible ? 1f : 0f;
            canvasGroup.interactable = visible;
            canvasGroup.blocksRaycasts = visible;
        }
    }
}
