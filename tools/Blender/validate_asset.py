"""Validate a loaded TRIAD .blend asset and write a machine-readable report."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy

from triad_asset_pipeline import almost_equal, blender_version, export_collection, object_manifest, portable_path, write_json


def args() -> argparse.Namespace:
    values = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", required=True)
    return parser.parse_args(values)


def main() -> None:
    options = args()
    problems: list[str] = []
    try:
        objects = list(export_collection().all_objects)
    except RuntimeError as exc:
        objects = []
        problems.append(str(exc))

    if not objects:
        problems.append("_EXPORT contains no objects")
    for obj in objects:
        if obj.type != "MESH":
            problems.append(f"{obj.name}: expected MESH, got {obj.type}")
            continue
        if not all(almost_equal(value, 1.0, 0.00001) for value in obj.scale):
            problems.append(f"{obj.name}: scale is not applied: {tuple(obj.scale)}")
        if not all(almost_equal(value, 0.0, 0.00001) for value in obj.rotation_euler):
            problems.append(f"{obj.name}: rotation is not applied: {tuple(obj.rotation_euler)}")
        if obj.data is None or not obj.data.vertices:
            problems.append(f"{obj.name}: mesh has no vertices")
        if not obj.material_slots:
            problems.append(f"{obj.name}: mesh has no material")
        minimum_z = min((obj.matrix_world @ vertex.co).z for vertex in obj.data.vertices)
        if not almost_equal(minimum_z, obj.location.z, 0.0001):
            problems.append(f"{obj.name}: origin is not at bottom center (minZ={minimum_z:.6f}, originZ={obj.location.z:.6f})")

    payload = {
        "schema": "triad.blender.validation.v1",
        "blender_version": blender_version(),
        "blend_file": portable_path(bpy.data.filepath),
        "passed": not problems,
        "problem_count": len(problems),
        "problems": problems,
        "objects": object_manifest(objects),
    }
    write_json(options.json, payload)
    print(f"[TRIAD Blender] Validation {'PASS' if not problems else 'FAIL'}: {len(problems)} problem(s)")
    if problems:
        for problem in problems:
            print(f"[TRIAD Blender] {problem}")
        raise SystemExit(2)


if __name__ == "__main__":
    main()
