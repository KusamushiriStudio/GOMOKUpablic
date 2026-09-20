using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
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
}
