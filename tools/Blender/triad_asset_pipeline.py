"""Shared helpers for TRIAD Blender blockout generation and export."""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


GRID_COLUMNS = 11
GRID_ROWS = 17
GRID_SPACING_M = 0.04
BOARD_WIDTH_M = 0.44
BOARD_DEPTH_M = 0.68
BOARD_HEIGHT_M = 0.03
STONE_DIAMETER_M = 0.034
STONE_HEIGHT_M = 0.013


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in tuple(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    root = bpy.context.scene.collection
    export = bpy.data.collections.get("_EXPORT") or bpy.data.collections.new("_EXPORT")
    if export.name not in root.children:
        root.children.link(export)
    default = bpy.data.collections.get("Collection")
    if default is not None and default.name in root.children and not default.objects:
        root.children.unlink(default)


def export_collection() -> bpy.types.Collection:
    collection = bpy.data.collections.get("_EXPORT")
    if collection is None:
        raise RuntimeError("Required collection '_EXPORT' is missing")
    return collection


def move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for existing in tuple(obj.users_collection):
        existing.objects.unlink(obj)
    collection.objects.link(obj)


def material(name: str, rgba: tuple[float, float, float, float], roughness: float) -> bpy.types.Material:
    value = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    value.diffuse_color = rgba
    value.roughness = roughness
    value.metallic = 0.0
    return value


def apply_transforms(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.select_set(False)


def set_bottom_center_origin(obj: bpy.types.Object) -> None:
    minimum = min((obj.matrix_world @ Vector(corner)).z for corner in obj.bound_box)
    cursor = bpy.context.scene.cursor
    old_location = cursor.location.copy()
    cursor.location = (obj.location.x, obj.location.y, minimum)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR", center="MEDIAN")
    obj.select_set(False)
    cursor.location = old_location


def configure_scene() -> None:
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.unit_settings.scale_length = 1.0
    scene["triad_grid"] = f"{GRID_COLUMNS}x{GRID_ROWS}"
    scene["triad_center"] = "F9"
    scene["triad_spacing_m"] = GRID_SPACING_M


def select_export_objects() -> list[bpy.types.Object]:
    bpy.ops.object.select_all(action="DESELECT")
    objects = list(export_collection().all_objects)
    for obj in objects:
        obj.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active = objects[0]
    return objects


def save_blend(path: str | Path) -> Path:
    target = Path(path).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(target))
    return target


def blender_version() -> str:
    return bpy.app.version_string


def portable_path(path: str | Path) -> str:
    """Prefer a repository-relative path so manifests are portable between Windows and macOS."""
    value = Path(path).resolve()
    try:
        return value.relative_to(Path.cwd().resolve()).as_posix()
    except ValueError:
        return value.as_posix()


def write_json(path: str | Path, payload: dict) -> None:
    target = Path(path).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def object_manifest(objects: list[bpy.types.Object]) -> list[dict]:
    result = []
    for obj in objects:
        result.append(
            {
                "name": obj.name,
                "type": obj.type,
                "dimensions_m": [round(v, 6) for v in obj.dimensions],
                "location_m": [round(v, 6) for v in obj.location],
                "rotation_euler": [round(v, 6) for v in obj.rotation_euler],
                "scale": [round(v, 6) for v in obj.scale],
                "materials": [slot.material.name for slot in obj.material_slots if slot.material],
            }
        )
    return result


def almost_equal(left: float, right: float, tolerance: float = 0.0001) -> bool:
    return math.isclose(left, right, abs_tol=tolerance)
