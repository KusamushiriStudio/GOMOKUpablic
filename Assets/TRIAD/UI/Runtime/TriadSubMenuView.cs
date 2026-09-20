using System;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Home Sub Menu")]
    public sealed class TriadSubMenuView : MonoBehaviour
    {
        [SerializeField] private Button worldButton;
        [SerializeField] private Button gachaButton;
        [SerializeField] private Button wardrobeButton;
        [SerializeField] private Button characterTrainingButton;
        [SerializeField] private GameObject gachaNewBadge;

        public event Action WorldPressed;
        public event Action GachaPressed;
        public event Action WardrobePressed;
        public event Action CharacterTrainingPressed;

        public void Configure(Button world, Button gacha, Button wardrobe, Button characterTraining, GameObject newBadge)
        {
            worldButton = world;
            gachaButton = gacha;
            wardrobeButton = wardrobe;
            characterTrainingButton = characterTraining;
            gachaNewBadge = newBadge;
        }

        private void Awake()
        {
            TriadHomeFontUtility.Apply(transform);
            worldButton?.onClick.AddListener(HandleWorld);
            gachaButton?.onClick.AddListener(HandleGacha);
            wardrobeButton?.onClick.AddListener(HandleWardrobe);
            characterTrainingButton?.onClick.AddListener(HandleCharacterTraining);
        }

        private void OnDestroy()
        {
            worldButton?.onClick.RemoveListener(HandleWorld);
            gachaButton?.onClick.RemoveListener(HandleGacha);
            wardrobeButton?.onClick.RemoveListener(HandleWardrobe);
            characterTrainingButton?.onClick.RemoveListener(HandleCharacterTraining);
        }

        public void SetGachaNew(bool value)
        {
            if (gachaNewBadge != null) gachaNewBadge.SetActive(value);
        }

        public void SetInteractable(bool value)
        {
            if (worldButton) worldButton.interactable = value;
            if (gachaButton) gachaButton.interactable = value;
            if (wardrobeButton) wardrobeButton.interactable = value;
            if (characterTrainingButton) characterTrainingButton.interactable = value;
        }

        private void HandleWorld() => WorldPressed?.Invoke();
        private void HandleGacha() => GachaPressed?.Invoke();
        private void HandleWardrobe() => WardrobePressed?.Invoke();
        private void HandleCharacterTraining() => CharacterTrainingPressed?.Invoke();
    }
}
