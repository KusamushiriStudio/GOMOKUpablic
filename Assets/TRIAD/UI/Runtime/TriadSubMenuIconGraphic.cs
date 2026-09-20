using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Sub Menu Icon Graphic")]
    public sealed class TriadSubMenuIconGraphic : MaskableGraphic
    {
        public enum IconKind { World, Gacha, Wardrobe, Training }

        [SerializeField] private IconKind kind;
        [SerializeField, Min(.5f)] private float strokeWidth = 1.8f;

        public IconKind Kind { get => kind; set { kind = value; SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            Rect r = GetPixelAdjustedRect();
            Vector2 P(float x, float y) => new(r.xMin + x * r.width, r.yMin + y * r.height);
            float w = strokeWidth;

            switch (kind)
            {
                case IconKind.World:
                    Circle(vh, P(.5f, .5f), Mathf.Min(r.width, r.height) * .39f, w, 28);
                    Circle(vh, P(.5f, .5f), r.width * .18f, w, 20);
                    Line(vh, P(.12f, .5f), P(.88f, .5f), w);
                    break;
                case IconKind.Gacha:
                    Circle(vh, P(.5f, .5f), r.width * .34f, w, 24);
                    Line(vh, P(.27f, .27f), P(.73f, .73f), w);
                    Disc(vh, P(.63f, .38f), w * 1.5f, 10);
                    break;
                case IconKind.Wardrobe:
                    Line(vh, P(.22f, .72f), P(.36f, .83f), w);
                    Line(vh, P(.36f, .83f), P(.5f, .70f), w);
                    Line(vh, P(.5f, .70f), P(.64f, .83f), w);
                    Line(vh, P(.64f, .83f), P(.78f, .72f), w);
                    Line(vh, P(.78f, .72f), P(.69f, .22f), w);
                    Line(vh, P(.69f, .22f), P(.31f, .22f), w);
                    Line(vh, P(.31f, .22f), P(.22f, .72f), w);
                    break;
                case IconKind.Training:
                    Line(vh, P(.22f, .25f), P(.5f, .55f), w);
                    Line(vh, P(.5f, .55f), P(.78f, .25f), w);
                    Line(vh, P(.5f, .55f), P(.5f, .84f), w);
                    Line(vh, P(.38f, .72f), P(.5f, .84f), w);
                    Line(vh, P(.62f, .72f), P(.5f, .84f), w);
                    break;
            }
        }

        private void Line(VertexHelper vh, Vector2 a, Vector2 b, float width)
        {
            Vector2 n = new(-(b.y - a.y), b.x - a.x);
            n = n.sqrMagnitude < .001f ? Vector2.up : n.normalized;
            Vector2 d = n * width * .5f;
            int s = vh.currentVertCount;
            Vertex(vh, a - d); Vertex(vh, a + d); Vertex(vh, b + d); Vertex(vh, b - d);
            vh.AddTriangle(s, s + 1, s + 2); vh.AddTriangle(s, s + 2, s + 3);
        }

        private void Circle(VertexHelper vh, Vector2 center, float radius, float width, int segments)
        {
            Vector2 previous = center + Vector2.right * radius;
            for (int i = 1; i <= segments; i++)
            {
                float a = i * Mathf.PI * 2f / segments;
                Vector2 next = center + new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * radius;
                Line(vh, previous, next, width); previous = next;
            }
        }

        private void Disc(VertexHelper vh, Vector2 center, float radius, int segments)
        {
            int s = vh.currentVertCount; Vertex(vh, center);
            for (int i = 0; i < segments; i++)
            {
                float a = i * Mathf.PI * 2f / segments;
                Vertex(vh, center + new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * radius);
            }
            for (int i = 0; i < segments; i++) vh.AddTriangle(s, s + i + 1, s + (i + 1) % segments + 1);
        }

        private void Vertex(VertexHelper vh, Vector2 position)
        {
            UIVertex v = UIVertex.simpleVert; v.color = color; v.position = position; vh.AddVert(v);
        }
    }
}
