using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace TRIAD.Editor
{
    public static class TriadIosBuild
    {
        public const string ExpectedUnityVersion = "6000.3.24f1";

        private const string BundleIdVariable = "TRIAD_IOS_BUNDLE_ID";
        private const string ProductNameVariable = "TRIAD_IOS_PRODUCT_NAME";
        private const string CompanyNameVariable = "TRIAD_IOS_COMPANY_NAME";
        private const string BuildNumberVariable = "TRIAD_IOS_BUILD_NUMBER";
        private const string OutputVariable = "TRIAD_IOS_OUTPUT";
        private const string DefaultOutput = "Build/iOS";

        [MenuItem("TRIAD/iOS/Print Build Readiness")]
        public static void PrintReadiness()
        {
            string summary = GetReadinessSummary(out _);
            Debug.Log(summary);
        }

        public static void ValidateFromCommandLine()
        {
            string summary = GetReadinessSummary(out bool ready);
            Debug.Log(summary);
            if (!ready) throw new InvalidOperationException(summary);
        }

        public static void BuildFromCommandLine()
        {
            string summary = GetReadinessSummary(out bool ready);
            Debug.Log(summary);
            if (!ready) throw new InvalidOperationException(summary);

            string bundleIdentifier = ResolveSetting(BundleIdVariable,
                PlayerSettings.GetApplicationIdentifier(NamedBuildTarget.iOS));
            string productName = ResolveSetting(ProductNameVariable, PlayerSettings.productName);
            string companyName = ResolveSetting(CompanyNameVariable, PlayerSettings.companyName);
            string buildNumber = ResolveSetting(BuildNumberVariable, PlayerSettings.iOS.buildNumber);
            if (string.IsNullOrWhiteSpace(buildNumber)) buildNumber = "1";

            string configuredOutput = Environment.GetEnvironmentVariable(OutputVariable);
            string output = string.IsNullOrWhiteSpace(configuredOutput) ? DefaultOutput : configuredOutput;
            string projectRoot = Directory.GetParent(Application.dataPath)?.FullName ?? Directory.GetCurrentDirectory();
            string outputPath = Path.IsPathRooted(output) ? output : Path.Combine(projectRoot, output);
            outputPath = Path.GetFullPath(outputPath);

            string originalBundleIdentifier = PlayerSettings.GetApplicationIdentifier(NamedBuildTarget.iOS);
            string originalProductName = PlayerSettings.productName;
            string originalCompanyName = PlayerSettings.companyName;
            string originalBuildNumber = PlayerSettings.iOS.buildNumber;

            try
            {
                PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, bundleIdentifier);
                PlayerSettings.productName = productName;
                PlayerSettings.companyName = companyName;
                PlayerSettings.iOS.buildNumber = buildNumber;

                if (!EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.iOS, BuildTarget.iOS))
                    throw new InvalidOperationException("Unable to activate the iOS build target.");

                Directory.CreateDirectory(outputPath);
                string[] scenes = EnabledScenes();
                var options = new BuildPlayerOptions
                {
                    scenes = scenes,
                    locationPathName = outputPath,
                    target = BuildTarget.iOS,
                    targetGroup = BuildTargetGroup.iOS,
                    options = BuildOptions.None
                };

                BuildReport report = BuildPipeline.BuildPlayer(options);
                BuildSummary buildSummary = report.summary;
                string result = $"[TRIAD iOS BUILD] Result={buildSummary.result}; " +
                                $"Errors={buildSummary.totalErrors}; Warnings={buildSummary.totalWarnings}; " +
                                $"Output={outputPath}";
                Debug.Log(result);

                if (buildSummary.result != BuildResult.Succeeded)
                    throw new InvalidOperationException(result);
            }
            finally
            {
                PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, originalBundleIdentifier);
                PlayerSettings.productName = originalProductName;
                PlayerSettings.companyName = originalCompanyName;
                PlayerSettings.iOS.buildNumber = originalBuildNumber;
            }
        }

        private static string GetReadinessSummary(out bool ready)
        {
            bool exactUnityVersion = Application.unityVersion == ExpectedUnityVersion;
            bool macEditor = Application.platform == RuntimePlatform.OSXEditor;
            bool iosBuildSupport = BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.iOS, BuildTarget.iOS);
            bool scenesConfigured = EnabledScenes().Length > 0;

            string bundleIdentifier = ResolveSetting(BundleIdVariable,
                PlayerSettings.GetApplicationIdentifier(NamedBuildTarget.iOS));
            string productName = ResolveSetting(ProductNameVariable, PlayerSettings.productName);
            string companyName = ResolveSetting(CompanyNameVariable, PlayerSettings.companyName);

            bool bundleIdentifierConfigured = IsUsableBundleIdentifier(bundleIdentifier);
            bool productNameConfigured = !IsPlaceholder(productName, "v");
            bool companyNameConfigured = !IsPlaceholder(companyName, "DefaultCompany");

            ready = exactUnityVersion && macEditor && iosBuildSupport && scenesConfigured &&
                    bundleIdentifierConfigured && productNameConfigured && companyNameConfigured;

            return $"[TRIAD iOS READY] Ready={ready}; Unity={Application.unityVersion}; " +
                   $"ExpectedUnity={ExpectedUnityVersion}; ExactUnity={exactUnityVersion}; " +
                   $"MacEditor={macEditor}; iOSBuildSupport={iosBuildSupport}; " +
                   $"ScenesConfigured={scenesConfigured}; BundleIdConfigured={bundleIdentifierConfigured}; " +
                   $"ProductNameConfigured={productNameConfigured}; CompanyNameConfigured={companyNameConfigured}";
        }

        private static string[] EnabledScenes() =>
            EditorBuildSettings.scenes
                .Where(scene => scene.enabled && !string.IsNullOrWhiteSpace(scene.path))
                .Select(scene => scene.path)
                .ToArray();

        private static string ResolveSetting(string variableName, string fallback)
        {
            string configured = Environment.GetEnvironmentVariable(variableName);
            return string.IsNullOrWhiteSpace(configured) ? fallback : configured.Trim();
        }

        private static bool IsUsableBundleIdentifier(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Contains("DefaultCompany") || value.EndsWith(".v"))
                return false;

            return Regex.IsMatch(value, "^[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+){2,}$");
        }

        private static bool IsPlaceholder(string value, string placeholder) =>
            string.IsNullOrWhiteSpace(value) || string.Equals(value.Trim(), placeholder, StringComparison.OrdinalIgnoreCase);
    }
}
