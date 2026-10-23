using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadRemainingPhase36Builder
    {
        internal const string ScenePath = "Assets/TRIAD/UI/Scenes/WardrobePhase36.unity";

        [MenuItem("TRIAD/Remaining Screens/Build Phase 36 Wardrobe")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(TriadRemainingPhase35Builder.ScenePath))
                TriadRemainingPhase35Builder.Build();

            (Scene scene, Transform canvas, Transform safe, Font font) = TriadFeatureSceneFactory.CreateBase("Wardrobe");
            Button back = TriadFeatureSceneFactory.Header(safe, font, "着せ替え", out Text feedback);

            GameObject previewPanel = TriadFeatureSceneFactory.PanelGraphic(safe, "CharacterPreviewPanel", new Vector2(12f, 96f), new Vector2(366f, 406f),
                new Color(.025f, .045f, .075f, .90f), new Color(1f, .72f, .24f, 1f), 22f);
            TriadFeatureSceneFactory.Text(previewPanel.transform, font, "CharacterName", "ヒバナ", new Vector2(18f, 16f), new Vector2(120f, 32f), 22,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            TriadFeatureSceneFactory.Text(previewPanel.transform, font, "Role", "火花の巫女", new Vector2(18f, 49f), new Vector2(150f, 24f), 13,
                TextAnchor.MiddleLeft, new Color(.95f, .72f, .55f, 1f));

            GameObject artObject = TriadFeatureSceneFactory.Node(previewPanel.transform, "CharacterArt", typeof(RawImage));
            TriadFeatureSceneFactory.TopLeft(artObject.GetComponent<RectTransform>(), new Vector2(130f, 12f), new Vector2(220f, 378f));
            RawImage art = artObject.GetComponent<RawImage>();
            art.texture = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/TRIAD/UI/Art/Characters/HibanaSeated-v4.png");
            art.uvRect = new Rect(.08f, .02f, .84f, .96f);
            art.color = Color.white;
            art.raycastTarget = false;

            Text equipped = TriadFeatureSceneFactory.Text(previewPanel.transform, font, "Equipped", "装備中　火花の巫女", new Vector2(18f, 91f), new Vector2(145f, 48f), 14,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Gold, FontStyle.Bold);
            Text outfitTitle = TriadFeatureSceneFactory.Text(previewPanel.transform, font, "OutfitTitle", "火花の巫女", new Vector2(18f, 271f), new Vector2(150f, 32f), 18,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            Text outfitDescription = TriadFeatureSceneFactory.Text(previewPanel.transform, font, "OutfitDescription", "", new Vector2(18f, 307f), new Vector2(165f, 76f), 12,
                TextAnchor.UpperLeft, new Color(.92f, .89f, .84f, 1f));

            TriadFeatureSceneFactory.Text(safe, font, "SelectHeading", "衣装を選ぶ", new Vector2(18f, 516f), new Vector2(180f, 30f), 18,
                TextAnchor.MiddleLeft, TriadFeatureSceneFactory.Cream, FontStyle.Bold);
            string[] names = { "火花の巫女\n所有", "宵桜礼装\n所有", "月影装束\n未解放" };
            Color[] colors =
            {
                new(.47f, .10f, .06f, 1f),
                new(.18f, .10f, .20f, 1f),
                new(.04f, .09f, .16f, 1f)
            };
            Button[] outfits = new Button[3];
            for (int index = 0; index < outfits.Length; index++)
                outfits[index] = TriadFeatureSceneFactory.Button(safe, font, "Outfit" + index, names[index], new Vector2(12f + index * 122f, 556f),
                    new Vector2(116f, 86f), colors[index], 14);

            Button equip = TriadFeatureSceneFactory.Button(safe, font, "Equip", "装備中", new Vector2(32f, 671f), new Vector2(326f, 58f),
                new Color(.58f, .16f, .08f, 1f), 17);
            TriadFeatureSceneFactory.Text(safe, font, "Notice", "衣装変更は外見のみ。対戦能力には影響しません", new Vector2(18f, 741f), new Vector2(354f, 28f), 12,
                TextAnchor.MiddleCenter, new Color(.89f, .84f, .74f, 1f));

            TriadWardrobeScreenController controller = canvas.gameObject.AddComponent<TriadWardrobeScreenController>();
            controller.Configure("HomePhase66", back, feedback);
            controller.ConfigureWardrobe(outfits, outfitTitle, outfitDescription, equipped, equip, art);

            EditorSceneManager.SaveScene(scene, ScenePath);
            TriadFeatureSceneFactory.Verify(scene, typeof(TriadWardrobeScreenController));
            TriadFeatureSceneFactory.ConfigureHomeRoutes("StoryPhase34", "GachaPhase35", "WardrobePhase36");
            TriadFeatureSceneFactory.SetBuildScenes(TriadRemainingPhase34Builder.ScenePath, TriadRemainingPhase35Builder.ScenePath, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD REMAINING PHASE36] PASS: wardrobe selection, save and Home route verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Game", "Player", "TRIADRemainingPhase36.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[]
                {
                    "Assets/TRIAD/UI/Scenes/HomePhase66.unity",
                    "Assets/TRIAD/Battle/Scenes/BattlePhase33.unity",
                    TriadRemainingPhase34Builder.ScenePath,
                    TriadRemainingPhase35Builder.ScenePath,
                    ScenePath
                },
                locationPathName = output,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Remaining screen Phase 36 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD REMAINING PHASE36] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }
    }
}
