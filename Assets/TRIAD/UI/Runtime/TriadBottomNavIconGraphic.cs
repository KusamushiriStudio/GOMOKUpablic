using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    public sealed class TriadBottomNavIconGraphic : MaskableGraphic
    {
        public enum IconKind { Home, Battle, Character, Gacha, Wardrobe, Settings }
        [SerializeField] private IconKind kind;
        [SerializeField] private float strokeWidth = 1.6f;
        public IconKind Kind { get => kind; set { kind = value; SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear(); Rect r = GetPixelAdjustedRect(); Vector2 P(float x, float y) => new(r.xMin + x * r.width, r.yMin + y * r.height); float w = strokeWidth;
            switch (kind)
            {
                case IconKind.Home: Line(vh, P(.12f,.48f),P(.5f,.82f),w); Line(vh,P(.5f,.82f),P(.88f,.48f),w); Line(vh,P(.23f,.53f),P(.23f,.18f),w); Line(vh,P(.23f,.18f),P(.77f,.18f),w); Line(vh,P(.77f,.18f),P(.77f,.53f),w); break;
                case IconKind.Battle: Circle(vh,P(.5f,.5f),r.width*.34f,w,24); Line(vh,P(.2f,.5f),P(.8f,.5f),w); Line(vh,P(.5f,.2f),P(.5f,.8f),w); break;
                case IconKind.Character: Circle(vh,P(.5f,.67f),r.width*.16f,w,16); Circle(vh,P(.5f,.25f),r.width*.29f,w,18,0,180); break;
                case IconKind.Gacha: Circle(vh,P(.5f,.5f),r.width*.34f,w,24); Line(vh,P(.27f,.27f),P(.73f,.73f),w); break;
                case IconKind.Wardrobe: Line(vh,P(.22f,.72f),P(.36f,.82f),w); Line(vh,P(.36f,.82f),P(.5f,.68f),w); Line(vh,P(.5f,.68f),P(.64f,.82f),w); Line(vh,P(.64f,.82f),P(.78f,.72f),w); Line(vh,P(.78f,.72f),P(.68f,.2f),w); Line(vh,P(.68f,.2f),P(.32f,.2f),w); Line(vh,P(.32f,.2f),P(.22f,.72f),w); break;
                case IconKind.Settings: Circle(vh,P(.5f,.5f),r.width*.31f,w,20); Circle(vh,P(.5f,.5f),r.width*.10f,w,14); Line(vh,P(.5f,.82f),P(.5f,.92f),w); Line(vh,P(.5f,.08f),P(.5f,.18f),w); Line(vh,P(.08f,.5f),P(.18f,.5f),w); Line(vh,P(.82f,.5f),P(.92f,.5f),w); break;
            }
        }
        private void Line(VertexHelper vh, Vector2 a, Vector2 b, float width) { Vector2 n = new(-(b.y-a.y),b.x-a.x); n = n.sqrMagnitude < .001f ? Vector2.up : n.normalized; Vector2 d=n*width*.5f; int s=vh.currentVertCount; V(vh,a-d);V(vh,a+d);V(vh,b+d);V(vh,b-d);vh.AddTriangle(s,s+1,s+2);vh.AddTriangle(s,s+2,s+3); }
        private void Circle(VertexHelper vh, Vector2 c, float radius, float width, int segments, float start=0, float end=360) { Vector2 prev=c+D(start)*radius; for(int i=1;i<=segments;i++){Vector2 next=c+D(Mathf.Lerp(start,end,i/(float)segments))*radius;Line(vh,prev,next,width);prev=next;} }
        private void V(VertexHelper vh, Vector2 p){UIVertex v=UIVertex.simpleVert;v.color=color;v.position=p;vh.AddVert(v);} private static Vector2 D(float d){float r=d*Mathf.Deg2Rad;return new Vector2(Mathf.Cos(r),Mathf.Sin(r));}
    }
}
