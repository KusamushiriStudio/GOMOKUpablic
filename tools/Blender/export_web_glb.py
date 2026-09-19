"""Export only TRIAD's _EXPORT collection to binary glTF with a sidecar manifest."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy

from triad_asset_pipeline import blender_version, object_manifest, portable_path, select_export_objects, write_json


def args() -> argparse.Namespace:
    values = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--sidecar", required=True)
    return parser.parse_args(values)


def main() -> None:
    options = args()
    output = Path(options.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    objects = select_export_objects()
    if not objects:
        raise RuntimeError("_EXPORT contains no objects")
    settings = {
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": True,
        "export_yup": True,
    }
    bpy.ops.export_scene.gltf(filepath=str(output), **settings)
    write_json(
        options.sidecar,
        {
            "schema": "triad.blender.export.v1",
            "format": "GLB",
            "blender_version": blender_version(),
            "source_blend": portable_path(bpy.data.filepath),
            "output": portable_path(output),
            "settings": settings,
            "objects": object_manifest(objects),
        },
    )
    print(f"[TRIAD Blender] Exported GLB: {output}")


if __name__ == "__main__":
    main()
