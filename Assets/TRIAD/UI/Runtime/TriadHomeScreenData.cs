using System;
using UnityEngine;

namespace TRIAD.UI
{
    public enum TriadHomeRoute { Battle, Story, World, Gacha, Wardrobe, CharacterTraining }
    public enum TriadStoryBannerKind { Default, NewChapter, Announcement }

    public static class TriadHomeRouteContract
    {
        public static string ToLegacyViewKey(this TriadHomeRoute route)
        {
            return route switch
            {
                TriadHomeRoute.Battle => "play",
                TriadHomeRoute.Story => "story",
                TriadHomeRoute.World => "online",
                TriadHomeRoute.Gacha => "gacha",
                TriadHomeRoute.Wardrobe => "wardrobe",
                TriadHomeRoute.CharacterTraining => "chars",
                _ => throw new ArgumentOutOfRangeException(nameof(route), route, null)
            };
        }
    }

    public sealed class TriadHomeNavigationGate
    {
        public bool Busy { get; private set; }
        public bool TryRequest()
        {
            if (Busy) return false;
            Busy = true;
            return true;
        }
        public void Complete() => Busy = false;
        public bool TryBackFromHome() => false;
    }

    [Serializable]
    public sealed class TriadHomeSnapshot
    {
        public string playerName = "旅人";
        [Min(0)] public int playerXp = 275;
        public string rank = "三段";
        public string title = "宵桜の棋士";
        [Min(0)] public int perica = 12480;
        public string characterId = "hibana";
        public string characterName = "ヒバナ";
        public string characterRole = "火花の巫女";
        public string characterSkill = "火花";
        [Min(0)] public int clearedStoryStages = 4;
        [Min(1)] public int totalStoryStages = 30;
        [Min(1)] public int nextStoryStage = 5;
        public string nextStoryTitle = "花骸の夜桜";
        public TriadStoryBannerKind storyKind = TriadStoryBannerKind.NewChapter;
        public bool hasNewGacha = true;

        public int PlayerLevel => 1 + Mathf.Max(0, playerXp) / 100;
        public int XpIntoLevel => Mathf.Max(0, playerXp) % 100;
        public float XpRatio => XpIntoLevel / 100f;
        public float StoryRatio => totalStoryStages <= 0 ? 0f : Mathf.Clamp01(clearedStoryStages / (float)totalStoryStages);
    }

}
