using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Hero Portrait Graphic")]
    public sealed class TriadHeroPortraitGraphic : MaskableGraphic
    {
        [SerializeField] private string characterId = "hibana";
        public string CharacterId { get => characterId; set { characterId = value; SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            Rect r = GetPixelAdjustedRect();
            Color flame = characterId == "hibana" ? new Color(.94f, .38f, .18f, 1f) : new Color(.35f, .65f, .9f, 1f);
            AddDisc(vh, new Vector2(r.center.x, r.yMin + r.height * .52f), r.width * .28f, new Color(.05f, .08f, .15f, 1f), 32);
            AddTriangle(vh, new Vector2(r.center.x, r.yMax), new Vector2(r.xMin + r.width * .18f, r.yMin), new Vector2(r.xMax - r.width * .10f, r.yMin), new Color(.07f, .11f, .21f, 1f));
            AddTriangle(vh, new Vector2(r.center.x, r.yMax - r.height * .04f), new Vector2(r.xMin + r.width * .30f, r.yMin + r.height * .44f), new Vector2(r.xMax - r.width * .20f, r.yMin + r.height * .38f), flame);
            AddDisc(vh, new Vector2(r.center.x + r.width * .02f, r.yMin + r.height * .62f), r.width * .16f, new Color(1f, .88f, .73f, 1f), 28);
            AddTriangle(vh, new Vector2(r.xMin + r.width * .34f, r.yMin + r.height * .66f), new Vector2(r.xMin + r.width * .42f, r.yMin + r.height * .92f), new Vector2(r.center.x, r.yMin + r.height * .72f), flame);
            AddTriangle(vh, new Vector2(r.xMax - r.width * .28f, r.yMin + r.height * .67f), new Vector2(r.xMax - r.width * .18f, r.yMin + r.height * .91f), new Vector2(r.center.x, r.yMin + r.height * .73f), flame);
        }

        private static void AddTriangle(VertexHelper vh, Vector2 a, Vector2 b, Vector2 c, Color color)
        {
            int i = vh.currentVertCount; Add(vh, a, color); Add(vh, b, color); Add(vh, c, color); vh.AddTriangle(i, i + 1, i + 2);
        }
        private static void AddDisc(VertexHelper vh, Vector2 center, float radius, Color color, int segments)
        {
            int start = vh.currentVertCount; Add(vh, center, color);
            for (int i = 0; i < segments; i++) { float a = i * Mathf.PI * 2f / segments; Add(vh, center + new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * radius, color); }
            for (int i = 0; i < segments; i++) vh.AddTriangle(start, start + i + 1, start + ((i + 1) % segments) + 1);
        }
        private static void Add(VertexHelper vh, Vector2 p, Color color)
        { UIVertex v = UIVertex.simpleVert; v.position = p; v.color = color; vh.AddVert(v); }
    }
}
