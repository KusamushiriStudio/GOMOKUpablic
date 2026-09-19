"""Generate TRIAD's 11 x 17 board blockout in a deterministic .blend file."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy

from triad_asset_pipeline import (
    BOARD_DEPTH_M,
    BOARD_HEIGHT_M,
    BOARD_WIDTH_M,
    GRID_COLUMNS,
    GRID_ROWS,
    GRID_SPACING_M,
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


def add_cube(name: str, location: tuple[float, float, float], dimensions: tuple[float, float, float], mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    apply_transforms(obj)
    obj.data.materials.append(mat)
    move_to_collection(obj, export_collection())
    return obj


def main() -> None:
    options = args()
    reset_scene()
    configure_scene()
    board_material = material("MAT_Board_Wood", (0.50, 0.20, 0.055, 1.0), 0.48)

    parts: list[bpy.types.Object] = []
    parts.append(
        add_cube(
            "Board_Base",
            (0.0, 0.0, BOARD_HEIGHT_M / 2.0),
            (BOARD_WIDTH_M, BOARD_DEPTH_M, BOARD_HEIGHT_M),
            board_material,
        )
    )

    region_width = (GRID_COLUMNS - 1) * GRID_SPACING_M
    region_depth = (GRID_ROWS - 1) * GRID_SPACING_M
    line_width = 0.0012
    line_height = 0.00045
    # Keep the blockout's external thickness exactly 0.03 m. Final line styling
    # belongs to the texture/material pass; these guide strips stay flush.
    line_z = BOARD_HEIGHT_M - line_height / 2.0
    for column in range(GRID_COLUMNS):
        x = -region_width / 2.0 + column * GRID_SPACING_M
        parts.append(add_cube(f"Grid_V_{column + 1:02d}", (x, 0.0, line_z), (line_width, region_depth, line_height), board_material))
    for row in range(GRID_ROWS):
        y = -region_depth / 2.0 + row * GRID_SPACING_M
        parts.append(add_cube(f"Grid_H_{row + 1:02d}", (0.0, y, line_z), (region_width, line_width, line_height), board_material))

    bpy.ops.object.select_all(action="DESELECT")
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    board = bpy.context.object
    board.name = "TRIAD_Board_11x17"
    board["grid_columns"] = GRID_COLUMNS
    board["grid_rows"] = GRID_ROWS
    board["grid_spacing_m"] = GRID_SPACING_M
    board["center_intersection"] = "F9"
    set_bottom_center_origin(board)
    board.location = (0.0, 0.0, 0.0)
    save_blend(options.output)
    print(f"[TRIAD Blender] Created board: {Path(options.output).resolve()}")


if __name__ == "__main__":
    main()
