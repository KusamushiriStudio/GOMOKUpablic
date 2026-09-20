using System.Collections;
using Rive.Components;
using UnityEngine;

namespace TRIAD.UI
{
    /// <summary>
    /// Keeps the Unity-authored selected state visible and removes only the optional
    /// Rive layer when the pilot asset cannot be loaded.
    /// </summary>
    public sealed class TriadRivePilotMonitor : MonoBehaviour
    {
        [SerializeField] private RiveWidget widget;
        [SerializeField] private GameObject animatedLayer;
        [SerializeField] private GameObject staticFallback;

        public bool IsLoaded { get; private set; }

        public void Configure(RiveWidget riveWidget, GameObject riveLayer, GameObject fallback)
        {
            widget = riveWidget;
            animatedLayer = riveLayer;
            staticFallback = fallback;
        }

        private IEnumerator Start()
        {
            if (staticFallback != null) staticFallback.SetActive(true);

            for (int frame = 0; frame < 120; frame++)
            {
                if (widget != null && widget.Status == WidgetStatus.Loaded)
                {
                    IsLoaded = true;
                    Debug.Log("[TRIAD RIVE PILOT] LOADED: Home selection animation is active.");
                    yield break;
                }

                if (widget == null || widget.Status == WidgetStatus.Error) break;
                yield return null;
            }

            IsLoaded = false;
            if (animatedLayer != null) animatedLayer.SetActive(false);
            Debug.LogWarning("[TRIAD RIVE PILOT] FALLBACK: Static Home selection remains active.");
        }
    }
}
