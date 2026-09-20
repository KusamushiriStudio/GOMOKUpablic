using System.Collections;
using System.IO;
using UnityEngine;

namespace TRIAD.UI
{
    public sealed class TriadPhase1ScreenshotRunner : MonoBehaviour
    {
        private IEnumerator Start()
        {
            string[] args = System.Environment.GetCommandLineArgs();
            int flag = System.Array.IndexOf(args, "-triadCapturePath");
            if (flag < 0 || flag + 1 >= args.Length) yield break;

            string output = args[flag + 1];
            Directory.CreateDirectory(Path.GetDirectoryName(output) ?? Application.persistentDataPath);
            yield return null;
            yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(output);
            for (int i = 0; i < 10; i++) yield return null;
            Application.Quit(0);
        }
    }
}
