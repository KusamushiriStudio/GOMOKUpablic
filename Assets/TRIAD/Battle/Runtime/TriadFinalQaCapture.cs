using System;
using System.IO;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadFinalQaCapture : MonoBehaviour
    {
        [SerializeField] private string surfaceName = "screen";
        [SerializeField] private TriadBattleBoardController controller;
        private bool qaEnabled;
        private int captureIndex;

        public void Configure(string surface, TriadBattleBoardController battleController = null)
        {
            surfaceName = surface;
            controller = battleController;
        }

        private void Awake()
        {
            qaEnabled = Array.Exists(Environment.GetCommandLineArgs(),
                argument => string.Equals(argument, "-triad-qa", StringComparison.OrdinalIgnoreCase));
        }

        private void Update()
        {
            if (qaEnabled && Input.GetKeyDown(KeyCode.F12)) Capture();
            if (qaEnabled && Input.GetKeyDown(KeyCode.F11)) CreateFinishedMatch();
        }

        private void CreateFinishedMatch()
        {
            if (controller == null) return;
            controller.SetAutomatedSeats(0);
            controller.StartMatch();
            BoardCoordinate[] actions =
            {
                new(0, 0), new(0, 3), new(0, 6),
                new(1, 0), new(1, 3), new(1, 6),
                new(2, 0), new(2, 3), new(2, 6),
                new(3, 0), new(3, 3), new(3, 6),
                new(4, 0)
            };
            foreach (BoardCoordinate coordinate in actions)
            {
                int seat = controller.State.TurnSeat;
                if (!controller.TryApplyAction(MatchAction.Place(seat, coordinate)))
                    throw new InvalidOperationException($"QA result sequence failed at {coordinate.X},{coordinate.Y}.");
            }
            Debug.Log("[TRIAD QA] Deterministic finished match created.");
        }

        private void Capture()
        {
            string directory = Environment.GetEnvironmentVariable("TRIAD_QA_CAPTURE_DIR");
            if (string.IsNullOrWhiteSpace(directory)) return;
            Directory.CreateDirectory(directory);
            captureIndex++;
            string fileName = $"phase33-{surfaceName}-{captureIndex:00}.png";
            string path = Path.Combine(directory, fileName);
            ScreenCapture.CaptureScreenshot(path, 1);
            Debug.Log($"[TRIAD QA] Screenshot requested: {path}");

            if (surfaceName == "battle" && Camera.main != null)
                CaptureCamera(Camera.main, Path.Combine(directory, $"phase33-camera-{captureIndex:00}.png"));
        }

        private static void CaptureCamera(Camera camera, string path)
        {
            RenderTexture previousTarget = camera.targetTexture;
            RenderTexture previousActive = RenderTexture.active;
            RenderTexture target = RenderTexture.GetTemporary(Screen.width, Screen.height, 24,
                RenderTextureFormat.ARGB32);
            Texture2D image = new(Screen.width, Screen.height, TextureFormat.RGB24, false);
            try
            {
                camera.targetTexture = target;
                camera.Render();
                RenderTexture.active = target;
                image.ReadPixels(new Rect(0f, 0f, Screen.width, Screen.height), 0, 0);
                image.Apply();
                File.WriteAllBytes(path, image.EncodeToPNG());
                Debug.Log($"[TRIAD QA] Camera screenshot saved: {path}");
            }
            finally
            {
                camera.targetTexture = previousTarget;
                RenderTexture.active = previousActive;
                RenderTexture.ReleaseTemporary(target);
                Destroy(image);
            }
        }
    }
}
