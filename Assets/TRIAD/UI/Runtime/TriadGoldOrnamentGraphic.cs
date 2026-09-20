using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Gold Ornament Graphic")]
    public sealed class TriadGoldOrnamentGraphic : MaskableGraphic
    {
        [SerializeField, Min(0.5f)] private float strokeWidth = 1.5f;
        [SerializeField, Min(8f)] private float cornerLength = 30f;
        [SerializeField, Min(0f)] private float inset = 6f;

        public float StrokeWidth { get => strokeWidth; set { strokeWidth = Mathf.Max(.5f, value); SetVerticesDirty(); } }
        public float CornerLength { get => cornerLength; set { cornerLength = Mathf.Max(8f, value); SetVerticesDirty(); } }
        public float Inset { get => inset; set { inset = Mathf.Max(0f, value); SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            Rect r = rectTransform.rect;
            float left = r.xMin + inset;
            float right = r.xMax - inset;
            float bottom = r.yMin + inset;
            float top = r.yMax - inset;
            float length = Mathf.Min(cornerLength, Mathf.Min(r.width, r.height) * .22f);
            float t = strokeWidth;

            AddCorner(vh, new Vector2(left, top), 1f, -1f, length, t);
            AddCorner(vh, new Vector2(right, top), -1f, -1f, length, t);
            AddCorner(vh, new Vector2(left, bottom), 1f, 1f, length, t);
            AddCorner(vh, new Vector2(right, bottom), -1f, 1f, length, t);

            float centerX = (left + right) * .5f;
            AddDiamond(vh, new Vector2(centerX, top), Mathf.Max(3f, t * 2.5f));
            AddLine(vh, new Vector2(centerX - 28f, top), new Vector2(centerX - 8f, top), t);
            AddLine(vh, new Vector2(centerX + 8f, top), new Vector2(centerX + 28f, top), t);
            AddDiamond(vh, new Vector2(centerX, bottom), Mathf.Max(2.5f, t * 2f));
        }

        private void AddCorner(VertexHelper vh, Vector2 origin, float xDirection, float yDirection, float length, float thickness)
        {
            AddLine(vh, origin, origin + new Vector2(xDirection * length, 0f), thickness);
            AddLine(vh, origin, origin + new Vector2(0f, yDirection * length), thickness);
            Vector2 notch = origin + new Vector2(xDirection * length * .62f, yDirection * length * .24f);
            AddDiamond(vh, notch, Mathf.Max(2f, thickness * 1.8f));
        }

        private void AddLine(VertexHelper vh, Vector2 a, Vector2 b, float thickness)
        {
            Vector2 direction = b - a;
            if (direction.sqrMagnitude < .001f) return;
            Vector2 normal = new Vector2(-direction.y, direction.x).normalized * thickness * .5f;
            AddQuad(vh, a - normal, a + normal, b + normal, b - normal);
        }

        private void AddDiamond(VertexHelper vh, Vector2 center, float radius)
        {
            AddQuad(
                vh,
                center + new Vector2(-radius, 0f),
                center + new Vector2(0f, radius),
                center + new Vector2(radius, 0f),
                center + new Vector2(0f, -radius));
        }

        private void AddQuad(VertexHelper vh, Vector2 a, Vector2 b, Vector2 c, Vector2 d)
        {
            int start = vh.currentVertCount;
            UIVertex vertex = UIVertex.simpleVert;
            vertex.color = color;
            vertex.position = a; vh.AddVert(vertex);
            vertex.position = b; vh.AddVert(vertex);
            vertex.position = c; vh.AddVert(vertex);
            vertex.position = d; vh.AddVert(vertex);
            vh.AddTriangle(start, start + 1, start + 2);
            vh.AddTriangle(start, start + 2, start + 3);
        }
    }
}
