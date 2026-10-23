using System.Collections.Generic;
using System.Linq;
using TRIAD.Core.Gacha;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadGachaScreenController : TriadFeatureScreenController
    {
        private const string TokenKey = "triad.gacha.freeTokens";
        private const string CollectionKey = "triad.gacha.collection";
        [SerializeField] private Button singleButton;
        [SerializeField] private Button multiButton;
        [SerializeField] private Text tokenLabel;
        [SerializeField] private Text collectionLabel;
        [SerializeField] private Text resultTitle;
        [SerializeField] private Text resultBody;
        private int tokens;
        private HashSet<int> collection = new();

        public int Tokens => tokens;
        public int CollectionCount => collection.Count;

        public void ConfigureGacha(Button single, Button multi, Text token, Text collected, Text title, Text body)
        {
            singleButton = single;
            multiButton = multi;
            tokenLabel = token;
            collectionLabel = collected;
            resultTitle = title;
            resultBody = body;
        }

        protected override void Awake()
        {
            base.Awake();
            tokens = PlayerPrefs.GetInt(TokenKey, 24);
            collection = ParseCollection(PlayerPrefs.GetString(CollectionKey, string.Empty));
            singleButton?.onClick.AddListener(() => Pull(1, GachaConstants.SingleCost));
            multiButton?.onClick.AddListener(() => Pull(GachaConstants.MultiPullCount, GachaConstants.MultiCost));
            Refresh();
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            singleButton?.onClick.RemoveAllListeners();
            multiButton?.onClick.RemoveAllListeners();
        }

        public void Pull(int count, int cost)
        {
            if (tokens < cost)
            {
                SetFeedback("召喚札が不足しています。購入導線は未接続です");
                return;
            }

            tokens -= cost;
            var results = new List<string>();
            string best = "N";
            for (int index = 0; index < count; index++)
            {
                string rarity = RollRarity();
                if (Rank(rarity) > Rank(best)) best = rarity;
                int item = Random.Range(1, GachaConstants.CosmeticPoolCount + 1);
                bool isNew = collection.Add(item);
                results.Add($"{rarity} 装飾 #{item:00}{(isNew ? " NEW" : "")}");
            }

            PlayerPrefs.SetInt(TokenKey, tokens);
            PlayerPrefs.SetString(CollectionKey, string.Join(",", collection.OrderBy(value => value)));
            PlayerPrefs.Save();
            if (resultTitle != null) resultTitle.text = count == 1 ? $"召喚結果　{best}" : $"十一連結果　最高 {best}";
            if (resultBody != null)
            {
                IEnumerable<string> visible = results.Take(5);
                resultBody.text = string.Join("　/　", visible) + (results.Count > 5 ? $"\nほか {results.Count - 5}点を獲得" : string.Empty);
            }
            SetFeedback("装飾品を受け取りました。キャラクター本体はガチャ対象外です");
            Refresh();
        }

        private void Refresh()
        {
            if (tokenLabel != null) tokenLabel.text = $"召喚札  {tokens}";
            if (collectionLabel != null) collectionLabel.text = $"収集 {collection.Count} / {GachaConstants.CosmeticPoolCount}";
            if (singleButton != null) singleButton.interactable = tokens >= GachaConstants.SingleCost;
            if (multiButton != null) multiButton.interactable = tokens >= GachaConstants.MultiCost;
        }

        private static string RollRarity()
        {
            int value = Random.Range(0, GachaConstants.TotalWeight);
            if (value < GachaConstants.WeightSSR) return "SSR";
            value -= GachaConstants.WeightSSR;
            if (value < GachaConstants.WeightSR) return "SR";
            value -= GachaConstants.WeightSR;
            return value < GachaConstants.WeightR ? "R" : "N";
        }

        private static int Rank(string rarity) => rarity switch { "SSR" => 4, "SR" => 3, "R" => 2, _ => 1 };

        private static HashSet<int> ParseCollection(string value)
        {
            var parsed = new HashSet<int>();
            foreach (string token in value.Split(','))
                if (int.TryParse(token, out int item) && item >= 1 && item <= GachaConstants.CosmeticPoolCount) parsed.Add(item);
            return parsed;
        }
    }
}
