using System;
using UnityEngine;

namespace TRIAD.UI
{
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
            header = headerView; playerStatus = playerView; heroArea = heroView; storyBanner = storyView; mainCta = ctaView;
        }

        private void Awake()
        {
            if (mainCta != null) { mainCta.BattlePressed += RequestBattle; mainCta.StoryPressed += RequestStory; }
            ApplySnapshot(snapshot);
        }

        private void OnDestroy()
        {
            if (mainCta == null) return;
            mainCta.BattlePressed -= RequestBattle; mainCta.StoryPressed -= RequestStory;
        }

        public void ApplySnapshot(TriadHomeSnapshot value)
        {
            snapshot = value ?? new TriadHomeSnapshot();
            header?.SetCurrency(snapshot.perica);
            playerStatus?.Bind(snapshot.playerName, snapshot.PlayerLevel, snapshot.XpIntoLevel, 100, snapshot.XpRatio, snapshot.rank, snapshot.title);
            heroArea?.Bind(snapshot.characterId, snapshot.characterName, snapshot.characterRole, snapshot.characterSkill);
            storyBanner?.Bind(snapshot.storyKind, snapshot.clearedStoryStages, snapshot.totalStoryStages, snapshot.nextStoryStage, snapshot.nextStoryTitle, snapshot.StoryRatio);
        }

        public void RequestBattle() => RequestRoute(TriadHomeRoute.Battle);
        public void RequestStory() => RequestRoute(TriadHomeRoute.Story);
        private void RequestRoute(TriadHomeRoute route)
        {
            if (!navigationGate.TryRequest()) return;
            mainCta?.SetInteractable(false);
            NavigationRequested?.Invoke(route);
        }
        public void CompleteNavigation() { navigationGate.Complete(); mainCta?.SetInteractable(true); }
        public bool TryBack() => navigationGate.TryBackFromHome();
    }
}
