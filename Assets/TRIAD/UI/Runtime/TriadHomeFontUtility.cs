using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.UI
{
    internal static class TriadHomeFontUtility
    {
        private static Font sans;
        public static void Apply(Transform root)
        {
            sans ??= Font.CreateDynamicFontFromOSFont(new[] { "Noto Sans JP", "Yu Gothic UI", "Hiragino Sans", "Arial" }, 18);
            if (!sans) return;
            foreach (Text text in root.GetComponentsInChildren<Text>(true)) text.font = sans;
        }
    }
}
