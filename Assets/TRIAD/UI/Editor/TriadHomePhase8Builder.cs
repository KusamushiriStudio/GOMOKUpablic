using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.UI.Editor
{
    public static class TriadHomePhase8Builder
    {
        private const string Root="Assets/TRIAD/UI", Phase7Scene=Root+"/Scenes/HomePhase7.unity", NavPrefab=Root+"/Prefabs/HomeBottomNavigation.prefab", ScenePath=Root+"/Scenes/HomePhase8.unity";
        private static readonly Color Navy950=Hex("#050812"),Navy900=Hex("#091426"),Gold500=Hex("#D5B45B"),Gold300=Hex("#F1D792"),Ivory50=Hex("#FFF7DE"),Ivory300=Hex("#D9C99E");

        [MenuItem("TRIAD/UI/Build Home Through Phase 8")]
        public static void Build(){if(!AssetDatabase.LoadAssetAtPath<SceneAsset>(Phase7Scene))TriadHomePhase7Builder.Build();BuildNavigation();BuildScene();Verify();AssetDatabase.SaveAssets();AssetDatabase.Refresh();Debug.Log("[TRIAD UI PHASE8] PASS: Bottom Navigation and scroll layout verified.");}
        public static void BuildAndVerify()=>Build();
        public static void BuildVerifyAndBuildPreviewPlayer(){Build();string root=Directory.GetParent(Application.dataPath)?.FullName??Application.dataPath;string output=Path.Combine(root,"Artifacts","UI","Player","TRIADHomePhase8.exe");Directory.CreateDirectory(Path.GetDirectoryName(output)??root);BuildReport report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{ScenePath},locationPathName=output,target=BuildTarget.StandaloneWindows64});if(report.summary.result!=BuildResult.Succeeded)throw new InvalidOperationException("Phase 8 preview build failed: "+report.summary.result);Debug.Log($"[TRIAD UI PHASE8] PLAYER PASS: {output}; Size={report.summary.totalSize}");}

        private static void BuildNavigation()
        {
            GameObject root=Panel("HomeBottomNavigation",null,Vector2.zero,new Vector2(366,60),Navy950,Gold500,13);TriadBottomNavigationView view=root.AddComponent<TriadBottomNavigationView>();
            Button[] b=new Button[6];TriadRoundedRectGraphic[] g=new TriadRoundedRectGraphic[6];string[] labels={"ホーム","対戦","キャラ","ガチャ","着せ替え","メニュー"};TriadBottomNavIconGraphic.IconKind[] kinds={TriadBottomNavIconGraphic.IconKind.Home,TriadBottomNavIconGraphic.IconKind.Battle,TriadBottomNavIconGraphic.IconKind.Character,TriadBottomNavIconGraphic.IconKind.Gacha,TriadBottomNavIconGraphic.IconKind.Wardrobe,TriadBottomNavIconGraphic.IconKind.Settings};
            for(int i=0;i<6;i++){GameObject item=Panel(labels[i]+"Tab",root.transform,new Vector2(4+i*60,4),new Vector2(56,52),i==0?Hex("#5C4014"):Navy900,Color.clear,10);g[i]=item.GetComponent<TriadRoundedRectGraphic>();g[i].raycastTarget=true;b[i]=item.AddComponent<Button>();b[i].targetGraphic=g[i];GameObject iconGo=new("Icon",typeof(RectTransform),typeof(TriadBottomNavIconGraphic));iconGo.transform.SetParent(item.transform,false);TopLeft(iconGo.GetComponent<RectTransform>(),new Vector2(19,5),new Vector2(18,18));var icon=iconGo.GetComponent<TriadBottomNavIconGraphic>();icon.Kind=kinds[i];icon.color=Gold300;icon.raycastTarget=false;Text(item.transform,"Label",labels[i],new Vector2(2,27),new Vector2(52,18),i==4?8:9,i==0?Gold300:Ivory300,TextAnchor.MiddleCenter,FontStyle.Bold);}
            view.Configure(b[0],b[1],b[2],b[3],b[4],b[5],g[0],g[1],g[2],g[3],g[4],g[5]);PrefabUtility.SaveAsPrefabAsset(root,NavPrefab);UnityEngine.Object.DestroyImmediate(root);
        }

        private static void BuildScene()
        {
            Scene scene=EditorSceneManager.OpenScene(Phase7Scene,OpenSceneMode.Single);GameObject canvas=scene.GetRootGameObjects().First(x=>x.name=="HomeCanvas");
            GameObject viewport=new("HomeScrollViewport",typeof(RectTransform),typeof(CanvasRenderer),typeof(Image),typeof(TriadHomeVerticalScroller));viewport.transform.SetParent(canvas.transform,false);TopLeft(viewport.GetComponent<RectTransform>(),new Vector2(0,100),new Vector2(390,670));Image surface=viewport.GetComponent<Image>();surface.color=new Color(0,0,0,0);surface.raycastTarget=true;
            GameObject content=new("Content",typeof(RectTransform));content.transform.SetParent(viewport.transform,false);TopLeft(content.GetComponent<RectTransform>(),Vector2.zero,new Vector2(390,743));
            Move<TriadPlayerStatusView>(canvas.transform,content.transform,new Vector2(12,0),new Vector2(366,72));Move<TriadHeroAreaView>(canvas.transform,content.transform,new Vector2(12,80),new Vector2(366,290));Move<TriadStoryBannerView>(canvas.transform,content.transform,new Vector2(12,378),new Vector2(366,100));Move<TriadMainCtaView>(canvas.transform,content.transform,new Vector2(12,486),new Vector2(366,82));Move<TriadSubMenuView>(canvas.transform,content.transform,new Vector2(12,576),new Vector2(366,105));Move<TriadCommunityView>(canvas.transform,content.transform,new Vector2(12,689),new Vector2(366,52));
            viewport.GetComponent<TriadHomeVerticalScroller>().Configure(content.GetComponent<RectTransform>(),73);
            GameObject topGuard=Panel("TopNavigationGuard",canvas.transform,Vector2.zero,new Vector2(390,100),Navy950,Color.clear,0);topGuard.GetComponent<TriadRoundedRectGraphic>().raycastTarget=true;
            GameObject bottomGuard=Panel("BottomNavigationGuard",canvas.transform,new Vector2(0,770),new Vector2(390,74),Navy950,Color.clear,0);bottomGuard.GetComponent<TriadRoundedRectGraphic>().raycastTarget=true;
            TriadHomeHeaderView fixedHeader=canvas.GetComponentInChildren<TriadHomeHeaderView>(true);fixedHeader.transform.SetAsLastSibling();Canvas headerCanvas=fixedHeader.gameObject.AddComponent<Canvas>();ConfigureFixedCanvas(headerCanvas,10);fixedHeader.gameObject.AddComponent<GraphicRaycaster>();
            TriadBottomNavigationView nav=Spawn<TriadBottomNavigationView>(NavPrefab,canvas.transform,"HomeBottomNavigation",new Vector2(12,778),new Vector2(366,60));
            Canvas navCanvas=nav.gameObject.AddComponent<Canvas>();ConfigureFixedCanvas(navCanvas,20);nav.gameObject.AddComponent<GraphicRaycaster>();
            TriadHomeScreenController controller=canvas.GetComponent<TriadHomeScreenController>();controller.Configure(canvas.GetComponentInChildren<TriadHomeHeaderView>(true),canvas.GetComponentInChildren<TriadPlayerStatusView>(true),canvas.GetComponentInChildren<TriadHeroAreaView>(true),canvas.GetComponentInChildren<TriadStoryBannerView>(true),canvas.GetComponentInChildren<TriadMainCtaView>(true),canvas.GetComponentInChildren<TriadSubMenuView>(true),canvas.GetComponentInChildren<TriadCommunityView>(true),nav);
            EditorSceneManager.SaveScene(scene,ScenePath);var settings=EditorBuildSettings.scenes.Where(x=>!x.path.StartsWith(Root+"/Scenes/HomePhase",StringComparison.Ordinal)).ToList();settings.Add(new EditorBuildSettingsScene(ScenePath,true));EditorBuildSettings.scenes=settings.ToArray();
        }
        private static void Move<T>(Transform source,Transform parent,Vector2 pos,Vector2 size)where T:Component{T c=source.GetComponentInChildren<T>(true);if(!c)throw new InvalidOperationException("Missing "+typeof(T).Name);c.transform.SetParent(parent,false);TopLeft(c.GetComponent<RectTransform>(),pos,size);}
        private static void Verify(){Scene scene=EditorSceneManager.OpenScene(ScenePath,OpenSceneMode.Single);var roots=scene.GetRootGameObjects();TriadBottomNavigationView nav=roots.SelectMany(x=>x.GetComponentsInChildren<TriadBottomNavigationView>(true)).SingleOrDefault();TriadHomeVerticalScroller scroll=roots.SelectMany(x=>x.GetComponentsInChildren<TriadHomeVerticalScroller>(true)).SingleOrDefault();if(!nav||nav.GetComponentsInChildren<Button>(true).Length!=6)throw new InvalidOperationException("Bottom Navigation controls missing");if(!scroll){throw new InvalidOperationException("Vertical scroll layout missing");}scroll.SetOffset(999);if(Mathf.Abs(scroll.Offset-73)>0.01f)throw new InvalidOperationException("Vertical scroll clamp failed");scroll.SetOffset(0);if(TriadHomeRoute.Settings.ToLegacyViewKey()!="settings"||TriadHomeRoute.Home.ToLegacyViewKey()!="home")throw new InvalidOperationException("Bottom Navigation route parity failed");}
        private static T Spawn<T>(string path,Transform parent,string name,Vector2 pos,Vector2 size)where T:Component{GameObject asset=AssetDatabase.LoadAssetAtPath<GameObject>(path);if(!asset)throw new InvalidOperationException("Missing prefab: "+path);GameObject go=(GameObject)PrefabUtility.InstantiatePrefab(asset,parent);go.name=name;TopLeft(go.GetComponent<RectTransform>(),pos,size);return go.GetComponent<T>();}
        private static void ConfigureFixedCanvas(Canvas canvas,int sortingOrder){SerializedObject data=new(canvas);data.FindProperty("m_OverrideSorting").boolValue=true;data.FindProperty("m_SortingOrder").intValue=sortingOrder;data.ApplyModifiedPropertiesWithoutUndo();EditorUtility.SetDirty(canvas);}
        private static GameObject Panel(string name,Transform parent,Vector2 pos,Vector2 size,Color fill,Color border,float radius){GameObject go=new(name,typeof(RectTransform));if(parent)go.transform.SetParent(parent,false);TopLeft(go.GetComponent<RectTransform>(),pos,size);var g=go.AddComponent<TriadRoundedRectGraphic>();g.color=fill;g.BorderColor=border;g.BorderWidth=border.a>0?1:0;g.CornerRadius=radius;g.raycastTarget=false;return go;}
        private static Text Text(Transform parent,string name,string value,Vector2 pos,Vector2 size,int fontSize,Color color,TextAnchor anchor,FontStyle style){GameObject go=new(name,typeof(RectTransform));go.transform.SetParent(parent,false);TopLeft(go.GetComponent<RectTransform>(),pos,size);Text t=go.AddComponent<Text>();t.text=value;t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.fontSize=fontSize;t.fontStyle=style;t.color=color;t.alignment=anchor;t.raycastTarget=false;return t;}
        private static void TopLeft(RectTransform r,Vector2 pos,Vector2 size){r.anchorMin=r.anchorMax=r.pivot=new Vector2(0,1);r.anchoredPosition=new Vector2(pos.x,-pos.y);r.sizeDelta=size;}private static Color Hex(string value){if(!ColorUtility.TryParseHtmlString(value,out Color c))throw new ArgumentException(value);return c;}
    }
}
