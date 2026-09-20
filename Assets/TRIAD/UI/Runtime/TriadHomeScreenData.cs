using System;
using UnityEngine;

namespace TRIAD.UI
{
    public enum TriadHomeRoute { Battle, Story }
    public enum TriadStoryBannerKind { Default, NewChapter, Announcement }

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

        public int PlayerLevel => 1 + Mathf.Max(0, playerXp) / 100;
        public int XpIntoLevel => Mathf.Max(0, playerXp) % 100;
        public float XpRatio => XpIntoLevel / 100f;
        public float StoryRatio => totalStoryStages <= 0 ? 0f : Mathf.Clamp01(clearedStoryStages / (float)totalStoryStages);
    }

    [AddComponentMenu("TRIAD/UI/Home Screen Controller")]
    public sealed class TriadHomeScreenController : MonoBehaviour
    {
        [SerializeField] private TriadHomeSnapshot snapshot = new();
        [SerializeField] private TriadHomeHeaderView header;
        [SerializeField] private TriadPlayerStatusView playerStatus;
        [SerializeField] private TriadHeroAreaView heroArea;
        [SerializeField] private TriadStoryBannerView storyBanner;
        [SerializeField] private TriadMainCtaView mainCta;
        private readonly TriadHomeNavigationGate navigationGate = new();

        public TriadHomeSnapshot Snapshot => snapshot;
        public bool RouteBusy => navigationGate.Busy;
        public event Action<TriadHomeRoute> NavigationRequested;

        public void Configure(TriadHomeHeaderView headerView, TriadPlayerStatusView playerView,
            TriadHeroAreaView heroView, TriadStoryBannerView storyView, TriadMainCtaView ctaView)
        {
            header = headerView;
            playerStatus = playerView;
            heroArea = heroView;
            storyBanner = storyView;
            mainCta = ctaView;
        }

        private void Awake()
        {
            if (mainCta != null)
            {
                mainCta.BattlePressed += RequestBattle;
                mainCta.StoryPressed += RequestStory;
            }
            ApplySnapshot(snapshot);
        }

        private void OnDestroy()
        {
            if (mainCta == null) return;
            mainCta.BattlePressed -= RequestBattle;
            mainCta.StoryPressed -= RequestStory;
        }

        public void ApplySnapshot(TriadHomeSnapshot value)
        {
            snapshot = value ?? new TriadHomeSnapshot();
            header?.SetCurrency(snapshot.perica);
            playerStatus?.Bind(snapshot.playerName, snapshot.PlayerLevel, snapshot.XpIntoLevel, 100,
                snapshot.XpRatio, snapshot.rank, snapshot.title);
            heroArea?.Bind(snapshot.characterId, snapshot.characterName, snapshot.characterRole, snapshot.characterSkill);
            storyBanner?.Bind(snapshot.storyKind, snapshot.clearedStoryStages, snapshot.totalStoryStages,
                snapshot.nextStoryStage, snapshot.nextStoryTitle, snapshot.StoryRatio);
        }

        public void RequestBattle() => RequestRoute(TriadHomeRoute.Battle);
        public void RequestStory() => RequestRoute(TriadHomeRoute.Story);

        private void RequestRoute(TriadHomeRoute route)
        {
            if (!navigationGate.TryRequest()) return;
            mainCta?.SetInteractable(false);
            NavigationRequested?.Invoke(route);
        }

        public void CompleteNavigation()
        {
            navigationGate.Complete();
            mainCta?.SetInteractable(true);
        }

        public bool TryBack() => navigationGate.TryBackFromHome();
    }
}
