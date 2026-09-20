using System;
using System.Globalization;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    internal static class TriadHomeFontUtility
    {
        private static Font sans;
        public static void Apply(Transform root)
        {
            sans ??= Font.CreateDynamicFontFromOSFont(new[] { "Noto Sans JP", "Yu Gothic UI", "Hiragino Sans", "Arial" }, 18);
            if (!sans) return;
            foreach (Text text in root.GetComponentsInChildren<Text>(true)) text.font = sans;
        }
    }

    public sealed class TriadPlayerStatusView : MonoBehaviour
    {
        [SerializeField] private Text nameLabel, levelLabel, xpLabel, rankLabel, titleLabel;
        [SerializeField] private RectTransform xpFill;

        public void Configure(Text name, Text level, Text xp, Text rank, Text title, RectTransform fill)
        { nameLabel = name; levelLabel = level; xpLabel = xp; rankLabel = rank; titleLabel = title; xpFill = fill; }
        private void Awake() => TriadHomeFontUtility.Apply(transform);

        public void Bind(string playerName, int level, int xp, int need, float ratio, string rank, string title)
        {
            if (nameLabel) nameLabel.text = string.IsNullOrWhiteSpace(playerName) ? "旅人" : playerName;
            if (levelLabel) levelLabel.text = "Lv " + Mathf.Max(1, level).ToString(CultureInfo.InvariantCulture);
            if (xpLabel) xpLabel.text = $"EXP {Mathf.Max(0, xp)}/{Mathf.Max(1, need)}";
            if (rankLabel) rankLabel.text = string.IsNullOrWhiteSpace(rank) ? "無段" : rank;
            if (titleLabel) titleLabel.text = string.IsNullOrWhiteSpace(title) ? "称号なし" : title;
            if (xpFill) xpFill.anchorMax = new Vector2(Mathf.Clamp01(ratio), 1f);
        }
    }

    public sealed class TriadHeroAreaView : MonoBehaviour
    {
        [SerializeField] private Text nameLabel, roleLabel, skillLabel;
        [SerializeField] private TriadHeroPortraitGraphic portrait;
        public string CharacterId { get; private set; } = "hibana";

        public void Configure(Text name, Text role, Text skill, TriadHeroPortraitGraphic art)
        { nameLabel = name; roleLabel = role; skillLabel = skill; portrait = art; }
        private void Awake() => TriadHomeFontUtility.Apply(transform);

        public void Bind(string id, string characterName, string role, string skill)
        {
            CharacterId = string.IsNullOrWhiteSpace(id) ? "hibana" : id;
            if (nameLabel) nameLabel.text = characterName ?? "-";
            if (roleLabel) roleLabel.text = role ?? "";
            if (skillLabel) skillLabel.text = "固有技｜" + (skill ?? "-");
            if (portrait) portrait.CharacterId = CharacterId;
        }
    }

    public sealed class TriadStoryBannerView : MonoBehaviour
    {
        [SerializeField] private Text badgeLabel, titleLabel, progressLabel;
        [SerializeField] private RectTransform progressFill;

        public void Configure(Text badge, Text title, Text progress, RectTransform fill)
        { badgeLabel = badge; titleLabel = title; progressLabel = progress; progressFill = fill; }
        private void Awake() => TriadHomeFontUtility.Apply(transform);

        public void Bind(TriadStoryBannerKind kind, int cleared, int total, int nextStage, string nextTitle, float ratio)
        {
            if (badgeLabel) badgeLabel.text = kind == TriadStoryBannerKind.NewChapter ? "新章" :
                kind == TriadStoryBannerKind.Announcement ? "告知" : "物語";
            if (titleLabel) titleLabel.text = $"第{Mathf.Max(1, nextStage)}段  {nextTitle}";
            if (progressLabel) progressLabel.text = $"制覇 {Mathf.Max(0, cleared)}/{Mathf.Max(1, total)}段";
            if (progressFill) progressFill.anchorMax = new Vector2(Mathf.Clamp01(ratio), 1f);
        }
    }

    public sealed class TriadMainCtaView : MonoBehaviour
    {
        [SerializeField] private Button battleButton, storyButton;
        public event Action BattlePressed;
        public event Action StoryPressed;

        public void Configure(Button battle, Button story) { battleButton = battle; storyButton = story; }
        private void Awake()
        {
            TriadHomeFontUtility.Apply(transform);
            battleButton?.onClick.AddListener(HandleBattle);
            storyButton?.onClick.AddListener(HandleStory);
        }
        private void OnDestroy()
        {
            battleButton?.onClick.RemoveListener(HandleBattle);
            storyButton?.onClick.RemoveListener(HandleStory);
        }
        public void SetInteractable(bool value)
        { if (battleButton) battleButton.interactable = value; if (storyButton) storyButton.interactable = value; }
        private void HandleBattle() => BattlePressed?.Invoke();
        private void HandleStory() => StoryPressed?.Invoke();
    }
}
