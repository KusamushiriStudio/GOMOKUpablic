# TRIAD Blender Pipeline

## Purpose

Generate deterministic board and stone blockouts for both Unity and Web without hand-editing export files.

## Locked measurements

- Board: 11 columns × 17 rows of intersections; center is `F9`.
- Grid spacing: `0.04 m`; intersection region: `0.40 × 0.64 m`.
- Board: `0.44 × 0.68 × 0.03 m`.
- Stone: `0.034 m` diameter × `0.013 m` height.
- Blender uses meters and Z-up. Every exported mesh has applied rotation/scale and a bottom-center origin.
- Only objects in `_EXPORT` are exported.

## Runtime

The generated `Docs/BLENDER_RUNTIME_VERSION.txt` records the exact Blender runtime used. The initial Windows pipeline is validated with Blender 5.2 LTS portable.

## Generate and export

Run commands from the repository root, replacing `<blender>` with the installed `blender.exe` path:

```powershell
<blender> --background --factory-startup --python Tools/Blender/create_board_blockout.py -- --output Art/Blender/Board/board_blockout.blend
<blender> --background --factory-startup --python Tools/Blender/create_stones_blockout.py -- --output Art/Blender/Stones/stones_blockout.blend
<blender> --background Art/Blender/Board/board_blockout.blend --python Tools/Blender/validate_asset.py -- --json Art/Blender/Board/board_blockout.validation.json
<blender> --background Art/Blender/Stones/stones_blockout.blend --python Tools/Blender/validate_asset.py -- --json Art/Blender/Stones/stones_blockout.validation.json
<blender> --background Art/Blender/Board/board_blockout.blend --python Tools/Blender/export_unity_fbx.py -- --output ArtExport/Unity/board_blockout.fbx --sidecar ArtExport/Unity/board_blockout.fbx.json
<blender> --background Art/Blender/Stones/stones_blockout.blend --python Tools/Blender/export_unity_fbx.py -- --output ArtExport/Unity/stones_blockout.fbx --sidecar ArtExport/Unity/stones_blockout.fbx.json
<blender> --background Art/Blender/Board/board_blockout.blend --python Tools/Blender/export_web_glb.py -- --output ArtExport/Web/board_blockout.glb --sidecar ArtExport/Web/board_blockout.glb.json
<blender> --background Art/Blender/Stones/stones_blockout.blend --python Tools/Blender/export_web_glb.py -- --output ArtExport/Web/stones_blockout.glb --sidecar ArtExport/Web/stones_blockout.glb.json
```

## Unity intake

Copy approved FBX files to `Assets/TRIADAssetTest/Models/Incoming/`. `TRIADModelImportPolicy` applies the test import policy. Run the EditMode/PlayMode suites and inspect the FBX with `TRIAD > Asset Test > Validate Selected FBX` before replacing preview primitives.
