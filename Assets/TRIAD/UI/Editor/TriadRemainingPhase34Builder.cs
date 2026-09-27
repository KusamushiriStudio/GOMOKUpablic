using System;
using TRIAD.Core.Story;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadRemainingPhase34Builder
    {
        internal const string ScenePath = "Assets/TRIAD/UI/Scenes/StoryPhase34.unity";

        [MenuItem("TRIAD/Remaining Screens/Build Phase 34 Story")]
        public static void Build()
        {
            (Scene scene, Transform canvas, Transform safe, Font font) = TriadFeatureSceneFactory.CreateBase("Story");
            Button back = TriadFeatureSceneFactory.Header(safe, font, "物語", out Text feedback);

            GameObject banner = TriadFeatureSceneFactory.PanelGraphic(safe, "ChapterBanner", new Vector2(12f, 96f), new Vector2(366f, 168f),
                new Color(.12f, .035f, .055f, .95f), TriadFeatureSceneFactory.Gold, 20f);
            TriadFeatureSceneFactory.Text(banner.transform, font, "Kicker", "第一章", new Vector2(20f, 17f), new Vector2(130f, 24f), 14,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Gold, FontStyle.Bold);
            TriadFeatureSceneFactory.Text(banner.transform, font, "Title", "花骸の夜桜", new Vector2(20f, 43f), new Vector2(250f, 42f), 28,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            TriadFeatureSceneFactory.Text(banner.transform, font, "Summary", "月明かりの神域で始まる、\n三人の棋士と六つの碁印の物語。", new Vector2(20f, 94f), new Vector2(270f, 54f), 14,
                TextAnchor.UpperLeft, new Color(.94f, .86f, .77f, 1f));
            Text progress = TriadFeatureSceneFactory.Text(banner.transform, font, "Progress", "達成  4 / 30話", new Vector2(245f, 18f), new Vector2(101f, 24f), 12,
                TextAnchor.MiddleRight, Color.white, FontStyle.Bold);

            TriadFeatureSceneFactory.Text(safe, font, "StageHeading", "物語を選ぶ", new Vector2(18f, 281f), new Vector2(200f, 30f), 18,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            Button[] buttons = new Button[6];
            Text[] labels = new Text[6];
            for (int index = 0; index < buttons.Length; index++)
            {
                float x = 14f + (index % 3) * 122f;
                float y = 320f + (index / 3) * 82f;
                buttons[index] = TriadFeatureSceneFactory.Button(safe, font, "Stage" + (index + 1), (index + 1).ToString(), new Vector2(x, y),
                    new Vector2(116f, 70f), index == 4 ? new Color(.34f, .10f, .075f, .98f) : new Color(.025f, .07f, .13f, .98f), 16);
                labels[index] = buttons[index].GetComponentInChildren<Text>();
            }

            GameObject detail = TriadFeatureSceneFactory.PanelGraphic(safe, "StoryDetail", new Vector2(12f, 502f), new Vector2(366f, 204f),
                TriadFeatureSceneFactory.Panel, new Color(.86f, .61f, .22f, 1f), 18f);
            Text detailTitle = TriadFeatureSceneFactory.Text(detail.transform, font, "DetailTitle", "", new Vector2(18f, 18f), new Vector2(330f, 34f), 20,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            Text detailBody = TriadFeatureSceneFactory.Text(detail.transform, font, "DetailBody", "", new Vector2(18f, 61f), new Vector2(330f, 68f), 14,
                TextAnchor.UpperLeft, new Color(.91f, .90f, .86f, 1f));
            Button start = TriadFeatureSceneFactory.Button(detail.transform, font, "StartStory", "この物語を始める", new Vector2(18f, 143f), new Vector2(330f, 44f),
                new Color(.58f, .16f, .08f, 1f), 17);
            TriadFeatureSceneFactory.Text(safe, font, "TotalStages", $"全 {StoryCoreConstants.StageCount} 話　物語進行はこの画面でのみ表示", new Vector2(20f, 727f),
                new Vector2(350f, 28f), 12, TextAnchor.MiddleCenter, new Color(.86f, .82f, .72f, 1f));

            TriadStoryScreenController controller = canvas.gameObject.AddComponent<TriadStoryScreenController>();
            controller.Configure("HomePhase66", back, feedback);
            controller.ConfigureStory(buttons, labels, detailTitle, detailBody, progress, start, 5);

            EditorSceneManager.SaveScene(scene, ScenePath);
            TriadFeatureSceneFactory.Verify(scene, typeof(TriadStoryScreenController));
            TriadFeatureSceneFactory.ConfigureHomeRoutes("StoryPhase34");
            TriadFeatureSceneFactory.SetBuildScenes(ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD REMAINING PHASE34] PASS: story selection and Home route verified.");
        }
    }
}
