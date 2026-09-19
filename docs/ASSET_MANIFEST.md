# TRIAD Asset Manifest

| Asset | Source | Unity export | Web export | State |
|---|---|---|---|---|
| 11×17 board blockout | `Art/Blender/Board/board_blockout.blend` | `ArtExport/Unity/board_blockout.fbx` | `ArtExport/Web/board_blockout.glb` | Generated and validation-gated |
| Black/white stone blockouts | `Art/Blender/Stones/stones_blockout.blend` | `ArtExport/Unity/stones_blockout.fbx` | `ArtExport/Web/stones_blockout.glb` | Generated and validation-gated |

Every export has a JSON sidecar containing the exact Blender version, export settings, and object manifest. Every source `.blend` has a validation JSON report.
