using System;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Home Bottom Navigation")]
    public sealed class TriadBottomNavigationView : MonoBehaviour
    {
        [SerializeField] private Button homeButton, battleButton, characterButton, gachaButton, wardrobeButton, settingsButton;
        [SerializeField] private TriadRoundedRectGraphic homePlate, battlePlate, characterPlate, gachaPlate, wardrobePlate, settingsPlate;
        [SerializeField] private Color selectedColor = new(.36f, .25f, .08f, 1f);
        [SerializeField] private Color normalColor = new(.035f, .078f, .149f, 1f);
        private TriadHomeRoute selectedRoute = TriadHomeRoute.Home;

        public event Action<TriadHomeRoute> RoutePressed;
        public RectTransform HomeButtonRect => homeButton ? homeButton.GetComponent<RectTransform>() : null;

        public void Configure(Button home, Button battle, Button character, Button gacha, Button wardrobe, Button settings,
            TriadRoundedRectGraphic homeGraphic, TriadRoundedRectGraphic battleGraphic, TriadRoundedRectGraphic characterGraphic,
            TriadRoundedRectGraphic gachaGraphic, TriadRoundedRectGraphic wardrobeGraphic, TriadRoundedRectGraphic settingsGraphic)
        {
            homeButton = home; battleButton = battle; characterButton = character; gachaButton = gacha; wardrobeButton = wardrobe; settingsButton = settings;
            homePlate = homeGraphic; battlePlate = battleGraphic; characterPlate = characterGraphic; gachaPlate = gachaGraphic; wardrobePlate = wardrobeGraphic; settingsPlate = settingsGraphic;
        }

        private void Awake()
        {
            TriadHomeFontUtility.Apply(transform);
            homeButton?.onClick.AddListener(() => Handle(TriadHomeRoute.Home));
            battleButton?.onClick.AddListener(() => Handle(TriadHomeRoute.Battle));
            characterButton?.onClick.AddListener(() => Handle(TriadHomeRoute.CharacterTraining));
            gachaButton?.onClick.AddListener(() => Handle(TriadHomeRoute.Gacha));
            wardrobeButton?.onClick.AddListener(() => Handle(TriadHomeRoute.Wardrobe));
            settingsButton?.onClick.AddListener(() => Handle(TriadHomeRoute.Settings));
            Refresh();
        }

        public void SetSelected(TriadHomeRoute route) { selectedRoute = route; Refresh(); }
        public void SetInteractable(bool value)
        {
            SetButton(homeButton, value && selectedRoute != TriadHomeRoute.Home);
            SetButton(battleButton, value && selectedRoute != TriadHomeRoute.Battle);
            SetButton(characterButton, value && selectedRoute != TriadHomeRoute.CharacterTraining);
            SetButton(gachaButton, value && selectedRoute != TriadHomeRoute.Gacha);
            SetButton(wardrobeButton, value && selectedRoute != TriadHomeRoute.Wardrobe);
            SetButton(settingsButton, value && selectedRoute != TriadHomeRoute.Settings);
        }

        private void Handle(TriadHomeRoute route)
        {
            if (route == selectedRoute) return;
            RoutePressed?.Invoke(route);
        }

        private void Refresh()
        {
            SetPlate(homePlate, selectedRoute == TriadHomeRoute.Home); SetPlate(battlePlate, selectedRoute == TriadHomeRoute.Battle);
            SetPlate(characterPlate, selectedRoute == TriadHomeRoute.CharacterTraining); SetPlate(gachaPlate, selectedRoute == TriadHomeRoute.Gacha);
            SetPlate(wardrobePlate, selectedRoute == TriadHomeRoute.Wardrobe); SetPlate(settingsPlate, selectedRoute == TriadHomeRoute.Settings);
            SetInteractable(true);
        }
        private void SetPlate(TriadRoundedRectGraphic plate, bool selected) { if (plate) plate.color = selected ? selectedColor : normalColor; }
        private static void SetButton(Button button, bool value) { if (button) button.interactable = value; }
    }
}
