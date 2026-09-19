using System;
using UnityEditor;
using UnityEngine;

namespace TRIAD.AssetTest.Editor
{
    /// <summary>
    /// Model Import Preset template for FBX pipeline testing.
    /// Scope is deliberately limited to Assets/TRIADAssetTest/Models/Incoming.
    /// </summary>
    public sealed class TRIADModelImportPolicy : AssetPostprocessor
    {
        private const string IncomingRoot = "Assets/TRIADAssetTest/Models/Incoming/";

        private void OnPreprocessModel()
        {
            if (!assetPath.StartsWith(IncomingRoot, StringComparison.OrdinalIgnoreCase)) return;

            var importer = (ModelImporter)assetImporter;
            importer.globalScale = 1f;
            importer.useFileScale = true;
            importer.importAnimation = false;
            importer.importCameras = false;
            importer.importLights = false;
            importer.meshCompression = ModelImporterMeshCompression.Off;
            importer.isReadable = true; // test project only; allows validation of mesh data
            importer.importNormals = ModelImporterNormals.Import;
            importer.importTangents = ModelImporterTangents.CalculateMikk;
            importer.materialImportMode = ModelImporterMaterialImportMode.ImportStandard;
        }
    }
}
