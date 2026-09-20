using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
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
            if (levelLabel) levelLabel.text = "Lv " + Mathf.Max(1, level);
            if (xpLabel) xpLabel.text = $"EXP {Mathf.Max(0, xp)}/{Mathf.Max(1, need)}";
            if (rankLabel) rankLabel.text = string.IsNullOrWhiteSpace(rank) ? "無段" : rank;
            if (titleLabel) titleLabel.text = string.IsNullOrWhiteSpace(title) ? "称号なし" : title;
            if (xpFill) xpFill.anchorMax = new Vector2(Mathf.Clamp01(ratio), 1f);
        }
    }
}
