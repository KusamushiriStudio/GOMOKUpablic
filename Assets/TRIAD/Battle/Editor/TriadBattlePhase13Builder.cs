using System;
using System.IO;
using System.Linq;
using TRIAD.UI;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle.Editor
{
    public static class TriadBattlePhase13Builder
    {
        private const string HomeSource = "Assets/TRIAD/UI/Scenes/HomePhase45.unity";
        private const string HomeScene = "Assets/TRIAD/UI/Scenes/HomePhase46.unity";
        private const string BattleSource = "Assets/TRIAD/Battle/Scenes/BattlePhase12.unity";
        private const string BattleScene = "Assets/TRIAD/Battle/Scenes/BattlePhase13.unity";

        [MenuItem("TRIAD/Battle/Build Phase 13 Online Entry")]
        public static void Build()
        {
            if (!AssetDatabase.LoadAssetAtPath<SceneAsset>(BattleSource)) TriadBattlePhase12Builder.Build();
            BuildBattleScene();
            BuildHomeRoute();
            EditorBuildSettings.scenes = EditorBuildSettings.scenes
                .Where(item => !item.path.StartsWith("Assets/TRIAD/UI/Scenes/HomePhase", StringComparison.Ordinal) &&
                               !item.path.StartsWith("Assets/TRIAD/Battle/Scenes/BattlePhase", StringComparison.Ordinal))
                .Concat(new[]
                {
                    new EditorBuildSettingsScene(HomeScene, true),
                    new EditorBuildSettingsScene(BattleScene, true)
                }).ToArray();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[TRIAD BATTLE PHASE13] PASS: honest online entry and session status UI verified.");
        }

        public static void BuildVerifyAndBuildPreviewPlayer()
        {
            Build();
            string root = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string output = Path.Combine(root, "Artifacts", "Battle", "Player", "TRIADBattlePhase13.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? root);
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { HomeScene, BattleScene }, locationPathName = output,
                target = BuildTarget.StandaloneWindows64, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException("Battle Phase 13 preview build failed: " + report.summary.result);
            Debug.Log($"[TRIAD BATTLE PHASE13] PLAYER PASS: {output}; Size={report.summary.totalSize}");
        }

        private static void BuildBattleScene()
        {
            Scene scene = EditorSceneManager.OpenScene(BattleSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "BattleCanvas").transform;
            Transform safeRoot = canvas.Find("SafeAreaRoot");
            TriadBattleBoardController controller = safeRoot.GetComponentInChildren<TriadBattleBoardController>(true);
            TriadBattleSessionContext session = safeRoot.GetComponentInChildren<TriadBattleSessionContext>(true);
            controller.SetHomeSceneName("HomePhase46");
            Font font = safeRoot.GetComponentInChildren<Text>(true).font;

            Transform oldStatus = safeRoot.Find("SessionStatus");
            if (oldStatus != null) UnityEngine.Object.DestroyImmediate(oldStatus.gameObject);
            GameObject statusObject = new GameObject(
                "SessionStatus", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic),
                typeof(TriadBattleSessionStatusView));
            statusObject.transform.SetParent(safeRoot, false);
            TopLeft(statusObject.GetComponent<RectTransform>(), new Vector2(12f, 137f), new Vector2(156f, 26f));
            TriadRoundedRectGraphic statusPanel = statusObject.GetComponent<TriadRoundedRectGraphic>();
            statusPanel.color = new Color(.012f, .040f, .070f, .92f);
            statusPanel.BorderColor = new Color(.42f, .76f, 1f, .72f);
            statusPanel.BorderWidth = 1f;
            statusPanel.CornerRadius = 7f;
            statusPanel.raycastTarget = false;
            Text statusLabel = CreateText(statusObject.transform, "Label", "SESSION  未選択",
                Vector2.zero, new Vector2(156f, 26f), 9, font);
            statusObject.GetComponent<TriadBattleSessionStatusView>().Configure(session, statusLabel);

            Transform modeOverlay = safeRoot.Find("ModeSelectionOverlay");
            Transform panel = modeOverlay.Find("Panel");
            RectTransform solo = panel.Find("Solo").GetComponent<RectTransform>();
            RectTransform local = panel.Find("Local").GetComponent<RectTransform>();
            RectTransform home = panel.Find("Home").GetComponent<RectTransform>();
            TopLeft(solo, new Vector2(28f, 164f), new Vector2(282f, 88f));
            TopLeft(local, new Vector2(28f, 260f), new Vector2(282f, 88f));
            TopLeft(home, new Vector2(78f, 446f), new Vector2(182f, 42f));
            Button online = CreateButton(panel, "Online", "オンライン対戦", new Vector2(28f, 356f), new Vector2(282f, 76f), font, 18);
            Text onlineNote = CreateText(online.transform, "Detail", "サーバー接続後に利用可能",
                new Vector2(8f, 43f), new Vector2(266f, 21f), 10, font);
            onlineNote.color = new Color(.68f, .80f, .94f, 1f);

            GameObject noticeObject = new GameObject(
                "OnlineUnavailableNotice", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image),
                typeof(CanvasGroup), typeof(TriadBattleOnlineGate));
            noticeObject.transform.SetParent(modeOverlay, false);
            TopLeft(noticeObject.GetComponent<RectTransform>(), Vector2.zero, new Vector2(390f, 844f));
            Image noticeBlocker = noticeObject.GetComponent<Image>();
            noticeBlocker.color = new Color(.002f, .006f, .018f, .88f);
            CanvasGroup noticeGroup = noticeObject.GetComponent<CanvasGroup>();
            GameObject noticePanel = new GameObject(
                "Panel", typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic));
            noticePanel.transform.SetParent(noticeObject.transform, false);
            TopLeft(noticePanel.GetComponent<RectTransform>(), new Vector2(36f, 254f), new Vector2(318f, 330f));
            TriadRoundedRectGraphic noticeGraphic = noticePanel.GetComponent<TriadRoundedRectGraphic>();
            noticeGraphic.color = new Color(.012f, .025f, .052f, .995f);
            noticeGraphic.BorderColor = new Color(.48f, .78f, 1f, .92f);
            noticeGraphic.BorderWidth = 2f;
            noticeGraphic.CornerRadius = 20f;
            CreateText(noticePanel.transform, "Title", "オンライン接続待ち",
                new Vector2(20f, 35f), new Vector2(278f, 54f), 22, font);
            Text body = CreateText(noticePanel.transform, "Body",
                "現在のUnity版には\n対局サーバーの接続設定がありません。\n\nローカル対戦は引き続き利用できます。",
                new Vector2(28f, 105f), new Vector2(262f, 120f), 14, font);
            body.alignment = TextAnchor.MiddleCenter;
            Button back = CreateButton(noticePanel.transform, "Back", "モード選択へ戻る",
                new Vector2(52f, 246f), new Vector2(214f, 52f), font, 14);
            noticeObject.GetComponent<TriadBattleOnlineGate>().Configure(session, noticeGroup, online, back);
            noticeObject.transform.SetAsLastSibling();
            modeOverlay.SetAsLastSibling();
            EditorUtility.SetDirty(controller);
            EditorSceneManager.SaveScene(scene, BattleScene);
            if (statusObject.GetComponent<TriadBattleSessionStatusView>().SessionContext != session ||
                noticeObject.GetComponent<TriadBattleOnlineGate>().SessionContext != session)
                throw new InvalidOperationException("Online entry is incomplete.");
        }

        private static void BuildHomeRoute()
        {
            Scene scene = EditorSceneManager.OpenScene(HomeSource, OpenSceneMode.Single);
            Transform canvas = scene.GetRootGameObjects().Single(root => root.name == "HomeCanvas").transform;
            TriadHomeScreenController controller = canvas.GetComponentInChildren<TriadHomeScreenController>(true);
            TriadHomeSceneRouter router = canvas.GetComponent<TriadHomeSceneRouter>();
            router.Configure(controller, "BattlePhase13");
            EditorUtility.SetDirty(router);
            EditorSceneManager.SaveScene(scene, HomeScene);
        }

        private static Button CreateButton(Transform parent, string name, string label,
            Vector2 position, Vector2 size, Font font, int fontSize)
        {
            GameObject go = new GameObject(
                name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TriadRoundedRectGraphic), typeof(Button));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            TriadRoundedRectGraphic panel = go.GetComponent<TriadRoundedRectGraphic>();
            panel.color = new Color(.028f, .090f, .155f, .98f);
            panel.BorderColor = new Color(.48f, .82f, 1f, .94f);
            panel.BorderWidth = 1.4f;
            panel.CornerRadius = 12f;
            Button button = go.GetComponent<Button>();
            button.targetGraphic = panel;
            CreateText(go.transform, "Label", label, new Vector2(4f, 5f), new Vector2(size.x - 8f, 40f), fontSize, font);
            return button;
        }

        private static Text CreateText(Transform parent, string name, string value,
            Vector2 position, Vector2 size, int fontSize, Font font)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            go.transform.SetParent(parent, false);
            TopLeft(go.GetComponent<RectTransform>(), position, size);
            Text text = go.GetComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = new Color(1f, .94f, .80f, 1f);
            text.raycastTarget = false;
            return text;
        }

        private static void TopLeft(RectTransform rect, Vector2 position, Vector2 size)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(position.x, -position.y);
            rect.sizeDelta = size;
        }
    }
}
