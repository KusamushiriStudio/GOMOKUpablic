using System;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadWardrobeScreenController : TriadFeatureScreenController
    {
        private const string EquippedKey = "triad.wardrobe.hibana.equipped";
        [SerializeField] private Button[] outfitButtons = Array.Empty<Button>();
        [SerializeField] private Text titleLabel;
        [SerializeField] private Text descriptionLabel;
        [SerializeField] private Text equippedLabel;
        [SerializeField] private Button equipButton;
        [SerializeField] private RawImage preview;
        private int selected;
        private int equipped;

        public int Selected => selected;
        public int Equipped => equipped;

        public void ConfigureWardrobe(Button[] outfits, Text title, Text description, Text equippedText,
            Button equip, RawImage characterPreview)
        {
            outfitButtons = outfits ?? Array.Empty<Button>();
            titleLabel = title;
            descriptionLabel = description;
            equippedLabel = equippedText;
            equipButton = equip;
            preview = characterPreview;
        }

        protected override void Awake()
        {
            base.Awake();
            equipped = Mathf.Clamp(PlayerPrefs.GetInt(EquippedKey, 0), 0, 1);
            selected = equipped;
            for (int index = 0; index < outfitButtons.Length; index++)
            {
                int outfit = index;
                outfitButtons[index]?.onClick.AddListener(() => Select(outfit));
            }
            equipButton?.onClick.AddListener(EquipSelected);
            Refresh();
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            foreach (Button button in outfitButtons) button?.onClick.RemoveAllListeners();
            equipButton?.onClick.RemoveListener(EquipSelected);
        }

        public void Select(int outfit)
        {
            selected = Mathf.Clamp(outfit, 0, Mathf.Max(0, outfitButtons.Length - 1));
            Refresh();
        }

        public void EquipSelected()
        {
            if (selected > 1)
            {
                SetFeedback("この衣装は未解放です。入手条件は今後の物語報酬へ接続します");
                return;
            }
            equipped = selected;
            PlayerPrefs.SetInt(EquippedKey, equipped);
            PlayerPrefs.Save();
            SetFeedback("ホーム画面用の衣装を保存しました");
            Refresh();
        }

        private void Refresh()
        {
            string[] names = { "火花の巫女", "宵桜礼装", "月影装束" };
            string[] descriptions =
            {
                "ヒバナの基本衣装。朱と金の装飾が夜桜の舞台に映えます。",
                "夜桜祭のために仕立てた礼装。柔らかな金色の光をまといます。",
                "月影の試練を越えた棋士だけが纏える特別装束。"
            };
            selected = Mathf.Clamp(selected, 0, names.Length - 1);
            if (titleLabel != null) titleLabel.text = names[selected];
            if (descriptionLabel != null) descriptionLabel.text = descriptions[selected];
            if (equippedLabel != null) equippedLabel.text = $"装備中　{names[equipped]}";
            if (equipButton != null)
            {
                equipButton.interactable = selected <= 1 && selected != equipped;
                Text label = equipButton.GetComponentInChildren<Text>();
                if (label != null) label.text = selected == equipped ? "装備中" : selected <= 1 ? "この衣装に着替える" : "未解放";
            }
            if (preview != null)
            {
                preview.color = selected switch
                {
                    1 => new Color(1f, .92f, .78f, 1f),
                    2 => new Color(.66f, .76f, 1f, .86f),
                    _ => Color.white
                };
            }
            SetFeedback(selected == equipped ? "現在装備している衣装です" : selected <= 1 ? "衣装を確認しています" : "未解放の衣装です");
        }
    }
}
