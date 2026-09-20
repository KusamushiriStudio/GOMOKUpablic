using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Header Icon Graphic")]
    public sealed class TriadHeaderIconGraphic : MaskableGraphic
    {
        public enum IconKind { Crest, Coin, Mail, Bell }

        [SerializeField] private IconKind kind;
        [SerializeField, Min(0.5f)] private float strokeWidth = 1.8f;

        public IconKind Kind { get => kind; set { kind = value; SetVerticesDirty(); } }
        public float StrokeWidth { get => strokeWidth; set { strokeWidth = Mathf.Max(0.5f, value); SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            Rect r = GetPixelAdjustedRect();
            Vector2 P(float x, float y) => new(r.xMin + x * r.width, r.yMin + y * r.height);
            float w = strokeWidth;

            switch (kind)
            {
                case IconKind.Crest:
                    AddCircle(vh, P(.5f, .5f), Mathf.Min(r.width, r.height) * .44f, w, 32);
                    AddLine(vh, P(.5f, .78f), P(.76f, .28f), w);
                    AddLine(vh, P(.76f, .28f), P(.24f, .28f), w);
                    AddLine(vh, P(.24f, .28f), P(.5f, .78f), w);
                    AddDisc(vh, P(.5f, .78f), w * 1.35f, 12);
                    AddDisc(vh, P(.76f, .28f), w * 1.35f, 12);
                    AddDisc(vh, P(.24f, .28f), w * 1.35f, 12);
                    break;
                case IconKind.Coin:
                    AddCircle(vh, P(.5f, .5f), Mathf.Min(r.width, r.height) * .38f, w, 28);
                    break;
                case IconKind.Mail:
                    AddLine(vh, P(.12f, .25f), P(.88f, .25f), w);
                    AddLine(vh, P(.88f, .25f), P(.88f, .75f), w);
                    AddLine(vh, P(.88f, .75f), P(.12f, .75f), w);
                    AddLine(vh, P(.12f, .75f), P(.12f, .25f), w);
                    AddLine(vh, P(.12f, .68f), P(.5f, .42f), w);
                    AddLine(vh, P(.5f, .42f), P(.88f, .68f), w);
                    break;
                case IconKind.Bell:
                    AddLine(vh, P(.25f, .32f), P(.33f, .43f), w);
                    AddLine(vh, P(.33f, .43f), P(.33f, .62f), w);
                    AddCircle(vh, P(.5f, .62f), r.width * .17f, w, 14, 0f, 180f);
                    AddLine(vh, P(.67f, .62f), P(.67f, .43f), w);
                    AddLine(vh, P(.67f, .43f), P(.75f, .32f), w);
                    AddLine(vh, P(.25f, .32f), P(.75f, .32f), w);
                    AddLine(vh, P(.43f, .22f), P(.57f, .22f), w);
                    break;
            }
        }

        private void AddLine(VertexHelper vh, Vector2 a, Vector2 b, float width)
        {
            Vector2 normal = new(-(b.y - a.y), b.x - a.x);
            normal = normal.sqrMagnitude < .001f ? Vector2.up : normal.normalized;
            Vector2 d = normal * width * .5f;
            int start = vh.currentVertCount;
            AddVertex(vh, a - d); AddVertex(vh, a + d); AddVertex(vh, b + d); AddVertex(vh, b - d);
            vh.AddTriangle(start, start + 1, start + 2);
            vh.AddTriangle(start, start + 2, start + 3);
        }

        private void AddCircle(VertexHelper vh, Vector2 center, float radius, float width, int segments, float start = 0f, float end = 360f)
        {
            Vector2 previous = center + Direction(start) * radius;
            for (int i = 1; i <= segments; i++)
            {
                float angle = Mathf.Lerp(start, end, i / (float)segments);
                Vector2 next = center + Direction(angle) * radius;
                AddLine(vh, previous, next, width);
                previous = next;
            }
        }

        private void AddDisc(VertexHelper vh, Vector2 center, float radius, int segments)
        {
            int start = vh.currentVertCount;
            AddVertex(vh, center);
            for (int i = 0; i < segments; i++) AddVertex(vh, center + Direction(i * 360f / segments) * radius);
            for (int i = 0; i < segments; i++) vh.AddTriangle(start, start + i + 1, start + ((i + 1) % segments) + 1);
        }

        private void AddVertex(VertexHelper vh, Vector2 position)
        {
            UIVertex v = UIVertex.simpleVert;
            v.color = color;
            v.position = position;
            vh.AddVert(v);
        }

        private static Vector2 Direction(float degrees)
        {
            float radians = degrees * Mathf.Deg2Rad;
            return new Vector2(Mathf.Cos(radians), Mathf.Sin(radians));
        }
    }
}
