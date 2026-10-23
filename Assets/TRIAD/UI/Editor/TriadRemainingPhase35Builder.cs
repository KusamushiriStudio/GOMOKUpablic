using TRIAD.Core.Gacha;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadRemainingPhase35Builder
    {
        internal const string ScenePath = "Assets/TRIAD/UI/Scenes/GachaPhase35.unity";

        [MenuItem("TRIAD/Remaining Screens/Build Phase 35 Gacha")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(TriadRemainingPhase34Builder.ScenePath))
                TriadRemainingPhase34Builder.Build();

            (Scene scene, Transform canvas, Transform safe, Font font) = TriadFeatureSceneFactory.CreateBase("Gacha");
            Button back = TriadFeatureSceneFactory.Header(safe, font, "ガチャ", out Text feedback);

            GameObject hero = TriadFeatureSceneFactory.PanelGraphic(safe, "SummonBanner", new Vector2(12f, 96f), new Vector2(366f, 276f),
                new Color(.15f, .035f, .11f, .96f), new Color(1f, .68f, .24f, 1f), 22f);
            TriadFeatureSceneFactory.Text(hero.transform, font, "Limited", "期間限定", new Vector2(20f, 18f), new Vector2(90f, 26f), 13,
                TextAnchor.MiddleCenter, new Color(1f, .72f, .76f, 1f), FontStyle.Bold);
            TriadFeatureSceneFactory.Text(hero.transform, font, "Title", "宵桜装束召喚", new Vector2(20f, 48f), new Vector2(326f, 45f), 28,
                TextAnchor.MiddleCenter, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            GameObject orb = TriadFeatureSceneFactory.PanelGraphic(hero.transform, "MoonOrb", new Vector2(119f, 104f), new Vector2(128f, 128f),
                new Color(.86f, .55f, .18f, .90f), new Color(1f, .92f, .55f, 1f), 64f);
            TriadFeatureSceneFactory.Text(orb.transform, font, "OrbMark", "桜\n✦", Vector2.zero, new Vector2(128f, 128f), 28,
                TextAnchor.MiddleCenter, Color.white, FontStyle.Bold, false);
            TriadFeatureSceneFactory.Text(hero.transform, font, "Scope", "衣装・碁石・盤面演出のみ　キャラクターは全員使用可能", new Vector2(18f, 238f), new Vector2(330f, 26f), 12,
                TextAnchor.MiddleCenter, new Color(.96f, .86f, .76f, 1f));

            GameObject status = TriadFeatureSceneFactory.PanelGraphic(safe, "GachaStatus", new Vector2(12f, 386f), new Vector2(366f, 58f),
                TriadFeatureSceneFactory.Ink, TriadFeatureSceneFactory.Gold, 14f);
            Text token = TriadFeatureSceneFactory.Text(status.transform, font, "Token", "召喚札  24", new Vector2(18f, 12f), new Vector2(150f, 34f), 17,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            Text collected = TriadFeatureSceneFactory.Text(status.transform, font, "Collection", $"収集 0 / {GachaConstants.CosmeticPoolCount}", new Vector2(188f, 12f), new Vector2(160f, 34f), 15,
                TextAnchor.MiddleRight, new Color(.91f, .81f, .63f, 1f), FontStyle.Bold);

            GameObject result = TriadFeatureSceneFactory.PanelGraphic(safe, "ResultPanel", new Vector2(12f, 458f), new Vector2(366f, 156f),
                new Color(.022f, .055f, .095f, .97f), new Color(.66f, .78f, 1f, 1f), 18f);
            Text resultTitle = TriadFeatureSceneFactory.Text(result.transform, font, "ResultTitle", "召喚結果", new Vector2(18f, 16f), new Vector2(330f, 32f), 19,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            Text resultBody = TriadFeatureSceneFactory.Text(result.transform, font, "ResultBody", "召喚を行うと、獲得した装飾品がここに表示されます。", new Vector2(18f, 58f), new Vector2(330f, 78f), 13,
                TextAnchor.UpperLeft, new Color(.91f, .91f, .94f, 1f));

            Button single = TriadFeatureSceneFactory.Button(safe, font, "SinglePull", $"1回召喚　札{GachaConstants.SingleCost}", new Vector2(12f, 632f), new Vector2(176f, 62f),
                new Color(.05f, .15f, .25f, 1f), 16);
            Button multi = TriadFeatureSceneFactory.Button(safe, font, "MultiPull", $"11回召喚　札{GachaConstants.MultiCost}", new Vector2(202f, 632f), new Vector2(176f, 62f),
                new Color(.57f, .13f, .08f, 1f), 16);
            TriadFeatureSceneFactory.Text(safe, font, "Rates", "提供割合  SSR 3%　SR 12%　R 35%　N 50%", new Vector2(16f, 711f), new Vector2(358f, 28f), 12,
                TextAnchor.MiddleCenter, new Color(.88f, .83f, .74f, 1f));
            TriadFeatureSceneFactory.Text(safe, font, "FreeNotice", "無料検証版：購入・課金処理なし", new Vector2(16f, 745f), new Vector2(358f, 26f), 12,
                TextAnchor.MiddleCenter, new Color(1f, .68f, .68f, 1f), FontStyle.Bold);

            TriadGachaScreenController controller = canvas.gameObject.AddComponent<TriadGachaScreenController>();
            controller.Configure("HomePhase66", back, feedback);
            controller.ConfigureGacha(single, multi, token, collected, resultTitle, resultBody);

            EditorSceneManager.SaveScene(scene, ScenePath);
            TriadFeatureSceneFactory.Verify(scene, typeof(TriadGachaScreenController));
            TriadFeatureSceneFactory.ConfigureHomeRoutes("StoryPhase34", "GachaPhase35");
            TriadFeatureSceneFactory.SetBuildScenes(TriadRemainingPhase34Builder.ScenePath, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD REMAINING PHASE35] PASS: cosmetic gacha and Home route verified.");
        }
    }
}
