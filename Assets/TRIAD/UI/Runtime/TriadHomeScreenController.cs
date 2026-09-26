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
        [SerializeField] private TriadSubMenuView subMenu;
        [SerializeField] private TriadCommunityView community;
        [SerializeField] private TriadBottomNavigationView bottomNavigation;
        private readonly TriadHomeNavigationGate navigationGate = new();

        public TriadHomeSnapshot Snapshot => snapshot;
        public bool RouteBusy => navigationGate.Busy;
        public event Action<TriadHomeRoute> NavigationRequested;
        public event Action NavigationCompleted;

        public void Configure(TriadHomeHeaderView headerView, TriadPlayerStatusView playerView,
            TriadHeroAreaView heroView, TriadStoryBannerView storyView, TriadMainCtaView ctaView,
            TriadSubMenuView subMenuView = null, TriadCommunityView communityView = null,
            TriadBottomNavigationView bottomNavigationView = null)
        {
            header = headerView; playerStatus = playerView; heroArea = heroView; storyBanner = storyView;
            mainCta = ctaView; subMenu = subMenuView; community = communityView; bottomNavigation = bottomNavigationView;
        }

        private void Awake()
        {
            if (mainCta != null) { mainCta.BattlePressed += RequestBattle; mainCta.StoryPressed += RequestStory; }
            if (subMenu != null)
            {
                subMenu.WorldPressed += RequestWorld;
                subMenu.GachaPressed += RequestGacha;
                subMenu.WardrobePressed += RequestWardrobe;
                subMenu.CharacterTrainingPressed += RequestCharacterTraining;
            }
            if (community != null)
            {
                community.CommunityPressed += RequestCommunity;
                community.CopyCodePressed += CopyPlayerCode;
            }
            if (bottomNavigation != null) bottomNavigation.RoutePressed += RequestRoute;
            ApplySnapshot(snapshot);
        }

        private void OnDestroy()
        {
            if (mainCta != null) { mainCta.BattlePressed -= RequestBattle; mainCta.StoryPressed -= RequestStory; }
            if (subMenu != null)
            {
                subMenu.WorldPressed -= RequestWorld;
                subMenu.GachaPressed -= RequestGacha;
                subMenu.WardrobePressed -= RequestWardrobe;
                subMenu.CharacterTrainingPressed -= RequestCharacterTraining;
            }
            if (community != null)
            {
                community.CommunityPressed -= RequestCommunity;
                community.CopyCodePressed -= CopyPlayerCode;
            }
            if (bottomNavigation != null) bottomNavigation.RoutePressed -= RequestRoute;
        }

        public void ApplySnapshot(TriadHomeSnapshot value)
        {
            snapshot = value ?? new TriadHomeSnapshot();
            header?.SetCurrency(snapshot.perica);
            playerStatus?.Bind(snapshot.playerName, snapshot.PlayerLevel, snapshot.XpIntoLevel, 100, snapshot.XpRatio, snapshot.rank, snapshot.title);
            heroArea?.Bind(snapshot.characterId, snapshot.characterName, snapshot.characterRole, snapshot.characterSkill);
            storyBanner?.Bind(snapshot.storyKind, snapshot.clearedStoryStages, snapshot.totalStoryStages, snapshot.nextStoryStage, snapshot.nextStoryTitle, snapshot.StoryRatio);
            subMenu?.SetGachaNew(snapshot.hasNewGacha);
            community?.Bind(snapshot.playerCode);
            bottomNavigation?.SetSelected(TriadHomeRoute.Home);
        }

        public void RequestBattle() => RequestRoute(TriadHomeRoute.Battle);
        public void RequestStory() => RequestRoute(TriadHomeRoute.Story);
        public void RequestWorld() => RequestRoute(TriadHomeRoute.World);
        public void RequestGacha() => RequestRoute(TriadHomeRoute.Gacha);
        public void RequestWardrobe() => RequestRoute(TriadHomeRoute.Wardrobe);
        public void RequestCharacterTraining() => RequestRoute(TriadHomeRoute.CharacterTraining);
        public void RequestCommunity() => RequestRoute(TriadHomeRoute.Community);
        public void CopyPlayerCode()
        {
            if (string.IsNullOrWhiteSpace(snapshot.playerCode)) return;
            GUIUtility.systemCopyBuffer = snapshot.playerCode;
            community?.ShowCopied();
        }
        private void RequestRoute(TriadHomeRoute route)
        {
            if (!navigationGate.TryRequest()) return;
            mainCta?.SetInteractable(false);
            subMenu?.SetInteractable(false);
            community?.SetInteractable(false);
            bottomNavigation?.SetInteractable(false);
            NavigationRequested?.Invoke(route);
        }
        public void CompleteNavigation()
        {
            navigationGate.Complete();
            mainCta?.SetInteractable(true);
            subMenu?.SetInteractable(true);
            community?.SetInteractable(true);
            bottomNavigation?.SetInteractable(true);
            NavigationCompleted?.Invoke();
        }
        public bool TryBack() => navigationGate.TryBackFromHome();
    }
}
