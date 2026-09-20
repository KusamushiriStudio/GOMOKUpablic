using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    [AddComponentMenu("TRIAD/UI/Rounded Rect Graphic")]
    public sealed class TriadRoundedRectGraphic : MaskableGraphic
    {
        [SerializeField, Min(0f)] private float cornerRadius = 12f;
        [SerializeField, Min(0f)] private float borderWidth = 1f;
        [SerializeField] private Color borderColor = new(0.835f, 0.706f, 0.357f, 1f);
        [SerializeField, Range(2, 12)] private int cornerSegments = 6;

        public float CornerRadius { get => cornerRadius; set { cornerRadius = Mathf.Max(0f, value); SetVerticesDirty(); } }
        public float BorderWidth { get => borderWidth; set { borderWidth = Mathf.Max(0f, value); SetVerticesDirty(); } }
        public Color BorderColor { get => borderColor; set { borderColor = value; SetVerticesDirty(); } }

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            Rect rect = GetPixelAdjustedRect();
            if (rect.width <= 0f || rect.height <= 0f) return;

            float radius = Mathf.Min(cornerRadius, Mathf.Min(rect.width, rect.height) * 0.5f);
            int segments = Mathf.Max(2, cornerSegments);
            int pointCount = segments * 4;
            var outer = new Vector2[pointCount];
            BuildPerimeter(rect, radius, segments, outer);

            UIVertex vertex = UIVertex.simpleVert;
            vertex.color = color;
            vertex.position = rect.center;
            vh.AddVert(vertex);
            for (int i = 0; i < pointCount; i++)
            {
                vertex.position = outer[i];
                vh.AddVert(vertex);
            }
            for (int i = 0; i < pointCount; i++)
                vh.AddTriangle(0, i + 1, ((i + 1) % pointCount) + 1);

            float width = Mathf.Min(borderWidth, Mathf.Min(rect.width, rect.height) * 0.5f);
            if (width <= 0f || borderColor.a <= 0f) return;

            Rect innerRect = new(rect.xMin + width, rect.yMin + width, rect.width - width * 2f, rect.height - width * 2f);
            var inner = new Vector2[pointCount];
            BuildPerimeter(innerRect, Mathf.Max(0f, radius - width), segments, inner);
            int ringStart = vh.currentVertCount;
            vertex.color = borderColor;
            for (int i = 0; i < pointCount; i++)
            {
                vertex.position = outer[i];
                vh.AddVert(vertex);
                vertex.position = inner[i];
                vh.AddVert(vertex);
            }
            for (int i = 0; i < pointCount; i++)
            {
                int next = (i + 1) % pointCount;
                int o0 = ringStart + i * 2;
                int i0 = o0 + 1;
                int o1 = ringStart + next * 2;
                int i1 = o1 + 1;
                vh.AddTriangle(o0, o1, i1);
                vh.AddTriangle(o0, i1, i0);
            }
        }

        private static void BuildPerimeter(Rect rect, float radius, int segments, Vector2[] points)
        {
            Vector2[] centers =
            {
                new(rect.xMax - radius, rect.yMax - radius),
                new(rect.xMin + radius, rect.yMax - radius),
                new(rect.xMin + radius, rect.yMin + radius),
                new(rect.xMax - radius, rect.yMin + radius)
            };
            float[] startAngles = { 0f, 90f, 180f, 270f };
            int index = 0;
            for (int corner = 0; corner < 4; corner++)
            {
                for (int step = 0; step < segments; step++)
                {
                    float t = segments == 1 ? 0f : step / (float)(segments - 1);
                    float angle = (startAngles[corner] + t * 90f) * Mathf.Deg2Rad;
                    points[index++] = centers[corner] + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * radius;
                }
            }
        }
    }
}
