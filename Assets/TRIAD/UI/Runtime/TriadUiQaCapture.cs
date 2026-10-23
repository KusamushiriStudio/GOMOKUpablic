using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TRIAD.UI
{
    internal sealed class TriadUiQaCapture : MonoBehaviour
    {
        private string targetScene;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Install()
        {
            string target = ReadArgument("-triad-qa-scene=");
            if (string.IsNullOrWhiteSpace(target)) return;
            GameObject host = new("TriadUiQaCapture", typeof(TriadUiQaCapture));
            DontDestroyOnLoad(host);
            host.GetComponent<TriadUiQaCapture>().targetScene = target;
        }

        private IEnumerator Start()
        {
            if (!string.Equals(SceneManager.GetActiveScene().name, targetScene, StringComparison.Ordinal))
            {
                AsyncOperation load = SceneManager.LoadSceneAsync(targetScene, LoadSceneMode.Single);
                if (load == null) yield break;
                while (!load.isDone) yield return null;
            }

            yield return new WaitForEndOfFrame();
            yield return new WaitForEndOfFrame();
            yield return new WaitForSecondsRealtime(.75f);
            string playerRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Application.dataPath;
            string screenshotDirectory = Path.Combine(playerRoot, "Screenshots");
            Directory.CreateDirectory(screenshotDirectory);
            string path = Path.Combine(screenshotDirectory, targetScene + ".png");
            ScreenCapture.CaptureScreenshot(path, 1);
            Debug.Log($"[TRIAD UI QA] Screenshot requested: {path}");
            yield return new WaitForSecondsRealtime(1.5f);
            Application.Quit(0);
        }

        private static string ReadArgument(string prefix)
        {
            foreach (string argument in Environment.GetCommandLineArgs())
                if (argument.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    return argument.Substring(prefix.Length);
            return string.Empty;
        }
    }
}
