"""TRIAD - プリレンダー素材の生成（Blender 4.x / bpy）

指示書 §24（プリレンダー）・§25（解像度の段）・§63（命名）。

build_models.py が作った形を読み込み、和風の三点灯りで撮って
assets/images/rendered/<段>/ へ WebP で書き出す。

    blender --background --factory-startup --python assets/blender/source/build_renders.py

段（長辺）は triad_common.RES_TIERS（512 / 1024 / 2048）。
背景は透過で撮る。ゲーム側の地色（墨・和紙）どちらにも載せられるようにするため。

カメラと灯りは、形の寸法から自動で決める。手で座標を書くと、形を作り直した
ときに切れたり白飛びしたりする（実際に一度そうなった）。
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                      # noqa: E402
from mathutils import Vector    # noqa: E402
import triad_common as T        # noqa: E402


# ───────────────────────── 撮るもの ─────────────────────────
#
# name は §63 の形。blend は build_models.py が保存したファイル名。
# dir は見る向き（カメラを置く方角の単位ベクトル）。
# portrait は縦長で撮るか。

SHOTS = (
    {"name": "prop_torii",     "blend": "prop_torii.blend",
     "dir": (0.0, -1.0, 0.28), "portrait": True},
    {"name": "prop_lantern",   "blend": "prop_lantern.blend",
     "dir": (0.42, -1.0, 0.34), "portrait": True},
    {"name": "prop_pedestal",  "blend": "prop_pedestal.blend",
     "dir": (0.0, -1.0, 0.62), "portrait": False},
    # 盤はほぼ正面から。斜めにしすぎると交点が読みにくくなる（§17）。
    {"name": "board_default",  "blend": "board_default.blend",
     "dir": (0.0, -0.34, 1.0), "portrait": True},
    {"name": "stone_default",  "blend": "stone_default.blend",
     "dir": (0.30, -0.78, 0.55), "portrait": False},
)


def open_blend(filename):
    path = os.path.join(T.SRC_DIR, filename)
    if not os.path.exists(path):
        raise SystemExit("%s が無い。先に build_models.py を実行すること。" % path)
    bpy.ops.wm.open_mainfile(filepath=path)


def scene_bounds():
    """いま置かれているメッシュ全体の中心と、いちばん長い辺を返す。"""
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    found = False
    for ob in bpy.context.scene.objects:
        if ob.type != "MESH":
            continue
        found = True
        for corner in ob.bound_box:
            p = ob.matrix_world @ Vector(corner)
            lo = Vector((min(lo.x, p.x), min(lo.y, p.y), min(lo.z, p.z)))
            hi = Vector((max(hi.x, p.x), max(hi.y, p.y), max(hi.z, p.z)))
    if not found:
        raise SystemExit("メッシュが1つも無い")
    size = hi - lo
    return (lo + hi) / 2.0, size, max(size.x, size.y, size.z)


def frame_camera(center, span, direction, margin=1.18):
    """対象がぜんぶ入る正投影カメラ。切れないことを寸法で保証する。

    正投影にするのは、遠近で盤の奥側が縮んで交点の間隔が変わるのを避けるため。

    クリップ面も寸法から決める。既定の clip_start は 0.1 で、碁石のような
    小さい対象（長辺 0.025）はカメラより手前に入りきらず、まるごと消える。
    実際に石が真っ白（＝何も写っていない）で出た原因がこれだった。
    """
    d = Vector(direction).normalized()
    dist = max(span * 4.0, 0.05)
    cam = T.add_camera(tuple(center + d * dist),
                       look_at=tuple(center), ortho=span * margin)
    cam.data.clip_start = max(1e-4, span * 0.01)
    cam.data.clip_end = dist + span * 10.0
    return cam


def studio_lights(center, span):
    """撮影用の三点灯り。

    triad_common.three_point() は位置と強さを同じ scale で動かすため、
    小さい対象では灯りが近づきすぎて片側だけ白飛びする（実際にそうなった）。
    ここでは距離を対象の大きさに比例させ、強さを距離の二乗に比例させることで、
    どの大きさの対象でも当たる明るさが同じになるようにする。
    """
    d = max(0.25, span * 2.6)          # 対象から十分離す
    e = 55.0 * d * d                   # 距離が伸びた分だけ強くする
    c = Vector(center)
    rig = (
        ("Key",  ( 0.85, -1.00,  1.05), e,        "#fff1d6", d * 1.5),
        ("Fill", (-1.05, -0.65,  0.55), e * 0.34, "#cfe0ff", d * 2.0),
        ("Rim",  (-0.45,  1.10,  0.85), e * 0.45, "#c9a227", d * 1.1),
    )
    out = []
    for name, dirv, energy, color, size in rig:
        v = Vector(dirv).normalized() * d
        lamp = T.add_area_light(name, tuple(c + v), (0, 0, 0), energy, size, color)
        # 対象の中心へ向ける
        look = (c - Vector(lamp.location))
        lamp.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
        out.append(lamp)
    return out


def shoot(shot):
    open_blend(shot["blend"])
    center, _size, span = scene_bounds()

    studio_lights(center, span)
    frame_camera(center, span, shot["dir"])
    T.add_world("#0e2f21", 0.08)

    out = {"kind": "image", "tiers": {}}
    for tier in T.RES_TIERS:
        T.setup_render(long_edge=tier, portrait=shot["portrait"],
                       engine="EEVEE", samples=64, transparent=True)
        info = T.render_to(shot["name"], tier, quality=82)
        out["tiers"][str(tier)] = {
            "file": info["file"], "bytes": info["bytes"], "sha256": info["sha256"],
        }
        out["w"] = info["w"]
        out["h"] = info["h"]
    T.log("   span=%.3f" % span)
    return {shot["name"]: out}


def main():
    args = T.argv_after_ddash()
    only = args[args.index("--only") + 1] if "--only" in args else None

    T.ensure_dirs()
    entries = {}
    for shot in SHOTS:
        if only and shot["name"] != only:
            continue
        T.log("=== render", shot["name"], "===")
        entries.update(shoot(shot))

    total = sum(t["bytes"] for e in entries.values() for t in e["tiers"].values())
    T.log("done:", ", ".join(entries.keys()), "| 合計 %.1f KB" % (total / 1024.0))
    return entries


if __name__ == "__main__":
    main()
