using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadStoryBannerView : MonoBehaviour
    {
        [SerializeField] private Text badgeLabel, titleLabel, progressLabel;
        [SerializeField] private RectTransform progressFill;
        public void Configure(Text badge, Text title, Text progress, RectTransform fill)
        { badgeLabel = badge; titleLabel = title; progressLabel = progress; progressFill = fill; }
        private void Awake() => TriadHomeFontUtility.Apply(transform);
        public void Bind(TriadStoryBannerKind kind, int cleared, int total, int nextStage, string nextTitle, float ratio)
        {
            if (badgeLabel) badgeLabel.text = kind == TriadStoryBannerKind.NewChapter ? "新章" : kind == TriadStoryBannerKind.Announcement ? "告知" : "物語";
            if (titleLabel) titleLabel.text = $"第{Mathf.Max(1, nextStage)}段  {nextTitle}";
            if (progressLabel) progressLabel.text = $"制覇 {Mathf.Max(0, cleared)}/{Mathf.Max(1, total)}段";
            if (progressFill) progressFill.anchorMax = new Vector2(Mathf.Clamp01(ratio), 1f);
        }
    }
}
