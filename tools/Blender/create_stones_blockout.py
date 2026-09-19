"""Generate black and white TRIAD stone blockouts."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy

from triad_asset_pipeline import (
    STONE_DIAMETER_M,
    STONE_HEIGHT_M,
    apply_transforms,
    configure_scene,
    export_collection,
    material,
    move_to_collection,
    reset_scene,
    save_blend,
    set_bottom_center_origin,
)


def args() -> argparse.Namespace:
    values = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    return parser.parse_args(values)


def create_stone(name: str, x: float, mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=(x, 0.0, STONE_HEIGHT_M / 2.0))
    stone = bpy.context.object
    stone.name = name
    stone.scale = (STONE_DIAMETER_M / 2.0, STONE_DIAMETER_M / 2.0, STONE_HEIGHT_M / 2.0)
    apply_transforms(stone)
    stone.data.materials.append(mat)
    move_to_collection(stone, export_collection())
    set_bottom_center_origin(stone)
    stone.location.z = 0.0
    stone["diameter_m"] = STONE_DIAMETER_M
    stone["height_m"] = STONE_HEIGHT_M
    for polygon in stone.data.polygons:
        polygon.use_smooth = True
    return stone


def main() -> None:
    options = args()
    reset_scene()
    configure_scene()
    black = material("MAT_Stone_Black", (0.012, 0.016, 0.024, 1.0), 0.22)
    white = material("MAT_Stone_White", (0.84, 0.86, 0.90, 1.0), 0.20)
    create_stone("TRIAD_Stone_Black", -0.03, black)
    create_stone("TRIAD_Stone_White", 0.03, white)
    save_blend(options.output)
    print(f"[TRIAD Blender] Created stones: {Path(options.output).resolve()}")


if __name__ == "__main__":
    main()
