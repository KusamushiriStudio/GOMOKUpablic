"""TRIAD - 3D アセット生成（§9・§10・§62・§63）

碁盤 / 碁石 / 鳥居 / 和風台座 / 灯籠 を作り、
assets/models/*.glb と assets/blender/source/*.blend を書く。

単体で動かす:
    blender --background --python assets/blender/source/build_models.py
    blender --background --python assets/blender/source/build_models.py -- --only board

スタイライズ（§10）の方針:
  - 面取りは必ず入れる。角が立ったままの直方体は使わない（光の縁が出ない）。
  - 材質は単色 + ラフネスだけ。写実テクスチャを持ち込まない（glTF にそのまま乗る）。
  - 実寸のメートルで作る。碁盤の交点間隔 0.03m は、2D の S=40 と同じ比率。
"""

import os
import sys
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                                   # noqa: E402
from mathutils import Vector                 # noqa: E402
import triad_common as T                     # noqa: E402


# 盤の寸法。2D（board.js の S=40 / PAD=28）と同じ比率で作る。
COLS, ROWS = 11, 17
STEP = 0.030                                 # 交点間隔 30mm
MARGIN = STEP * 28.0 / 40.0                  # PAD/S と同じ比率 = 21mm
BOARD_W = (COLS - 1) * STEP + MARGIN * 2     # 0.342 m
BOARD_D = (ROWS - 1) * STEP + MARGIN * 2     # 0.522 m
BOARD_T = 0.060                              # 天板の厚み
LEG_H = 0.090

# §81 のポリゴン予算（三角形）
BUDGET = {
    "board_default": 6000,
    "stone_default": 1200,
    "prop_torii": 4000,
    "prop_pedestal": 3000,
    "prop_lantern": 6000,
}


# ───────────────────────── 部品 ─────────────────────────

def _cube(name, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    T.apply_all_transforms(o)
    return o


def _cyl(name, verts, radius, depth, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth,
                                        location=loc,
                                        rotation=tuple(math.radians(a) for a in rot))
    o = bpy.context.object
    o.name = name
    T.apply_all_transforms(o)
    return o


def _cone(name, verts, r1, r2, depth, loc):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2,
                                    depth=depth, location=loc)
    o = bpy.context.object
    o.name = name
    T.apply_all_transforms(o)
    return o


def _plane(name, sx, sy, loc):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (sx, sy, 1.0)
    T.apply_all_transforms(o)
    return o


def _finish(obj, name, budget_key, base=True, smooth=None, uv=True):
    """全アセット共通の仕上げ。§81 の確認項目をここで満たす。"""
    T.recalc_normals(obj)
    if smooth is not None:
        T.shade_smooth_auto(obj, smooth)
    if uv:
        T.uv_unwrap(obj)
    if base:
        T.origin_to_base(obj)
    else:
        T.origin_to_center(obj)
    obj.name = name
    obj.data.name = name + "_mesh"
    tris = T.tri_count(obj)
    cap = BUDGET.get(budget_key, 10000)
    if tris > cap:
        T.log("!! ポリゴン超過 %s: %d > %d" % (name, tris, cap))
    return obj


# ───────────────────────── 碁盤（board_default） ─────────────────────────

def build_board(skin="default"):
    T.reset_scene()
    # 盤面は木目を持たせる（§16）。手続き材質は GLB に乗らないので、
    # GLB 側は単色のまま、レンダ用にだけ木目を出す。
    kaya = T.make_wood_material("mat_board_kaya", T.HEX["kaya_light"],
                                T.HEX["kaya_dark"], scale=26.0, roughness=0.42)
    keyaki = T.make_material("mat_board_leg", T.HEX["keyaki"], roughness=0.5)
    sumi = T.make_material("mat_board_sumi", T.HEX["sumi"], roughness=0.85)

    parts = []
    top = _cube("top", (BOARD_W, BOARD_D, BOARD_T), (0, 0, BOARD_T / 2))
    T.add_bevel(top, width=0.0035, segments=3)
    T.assign(top, kaya)
    parts.append(top)

    # 脚（碁盤の四隅。上が細く下が太い）
    lx = BOARD_W / 2 - 0.045
    ly = BOARD_D / 2 - 0.055
    for i, (sx, sy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
        leg = _cone("leg%d" % i, 12, 0.030, 0.022, LEG_H,
                    (lx * sx, ly * sy, -LEG_H / 2))
        T.add_bevel(leg, width=0.002, segments=2)
        T.assign(leg, keyaki)
        parts.append(leg)

    board = T.join_objects(parts, "board_body")
    # 木の脚は 2 枠目の材質として残る。join 後にスロットを詰め直す。
    board.data.materials.clear()
    board.data.materials.append(kaya)
    board.data.materials.append(keyaki)
    board.data.materials.append(sumi)
    for p in board.data.polygons:
        # 天板より下（z<0）は脚。ここだけ材質 1 に振る。
        c = p.center
        p.material_index = 1 if c.z < 0.0005 else 0

    # 罫線（墨）。板の上にごくわずかに浮かせて置く。
    lines = []
    z = BOARD_T + 0.0004
    lw = 0.0016
    for c in range(COLS):
        x = -BOARD_W / 2 + MARGIN + c * STEP
        lines.append(_plane("v%d" % c, lw, (ROWS - 1) * STEP, (x, 0, z)))
    for r in range(ROWS):
        y = -BOARD_D / 2 + MARGIN + r * STEP
        lines.append(_plane("h%d" % r, (COLS - 1) * STEP, lw, (0, y, z)))
    # 星（board.js の starPoints と同じ位置: 列 3 / 中央 / 右から4）
    star_c = [3, (COLS - 1) // 2, COLS - 4]
    star_r = [3, (ROWS - 1) // 2, ROWS - 4]
    for c in star_c:
        for r in star_r:
            x = -BOARD_W / 2 + MARGIN + c * STEP
            y = -BOARD_D / 2 + MARGIN + r * STEP
            lines.append(_cyl("star_%d_%d" % (c, r), 10, 0.0026, 0.0008, (x, y, z)))

    grid = T.join_objects(lines, "board_grid")
    grid.data.materials.clear()
    grid.data.materials.append(sumi)

    obj = T.join_objects([board, grid], "board_%s" % skin)
    _finish(obj, "board_%s" % skin, "board_default", base=True, smooth=None)

    T.save_blend("board_%s.blend" % skin)
    out = [T.export_glb([obj], "board_%s.glb" % skin)]
    lod = T.make_lod(obj, 0.45, "_lod1")
    out.append(T.export_glb([lod], "board_%s_lod1.glb" % skin))
    return {"board_%s" % skin: {"kind": "model", "lods": out}}


# ───────────────────────── 碁石（stone_default） ─────────────────────────

def build_stone(skin="default"):
    """席の色は実行時に差し替える前提で、白石の形だけを作る。
    P1/P2/P3 の色分けは 2D 側（stoneMarkup）が持つ正典なので、3D では触らない。"""
    T.reset_scene()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=14, radius=0.0125)
    o = bpy.context.object
    o.name = "stone"
    o.scale = (1.0, 1.0, 0.38)          # 碁石の凸レンズ形（厚み 9.5mm）
    T.apply_all_transforms(o)
    T.assign(o, T.make_material("mat_stone", T.HEX["hakuseki"],
                                roughness=0.18, metallic=0.0))
    _finish(o, "stone_%s" % skin, "stone_default", base=False, smooth=45.0)

    T.save_blend("stone_%s.blend" % skin)
    out = [T.export_glb([o], "stone_%s.glb" % skin)]
    lod = T.make_lod(o, 0.35, "_lod1")
    out.append(T.export_glb([lod], "stone_%s_lod1.glb" % skin))
    return {"stone_%s" % skin: {"kind": "model", "lods": out}}


# ───────────────────────── 鳥居（prop_torii） ─────────────────────────

def build_torii():
    T.reset_scene()
    shu = T.make_material("mat_torii_shu", T.HEX["accent"], roughness=0.35)
    urushi = T.make_material("mat_torii_urushi", T.HEX["urushi"], roughness=0.28)

    span, h, pr = 1.60, 2.40, 0.090
    red, black = [], []

    for s in (-1, 1):
        # 柱はわずかに内転びにする（下を外へ開く）
        p = _cone("pillar%d" % s, 16, pr * 1.08, pr * 0.92, h, (s * span / 2, 0, h / 2))
        p.rotation_euler = (0, math.radians(-1.6 * s), 0)
        T.apply_all_transforms(p)
        red.append(p)
        # 亀腹（柱の根本の白い膨らみ）
        red.append(_cone("kamebara%d" % s, 16, pr * 1.5, pr * 1.12, 0.10,
                         (s * span / 2, 0, 0.05)))

    # 貫（下の横木）
    red.append(_cube("nuki", (span + pr * 3.2, pr * 1.05, 0.085), (0, 0, h * 0.72)))
    # 額束（中央の小柱）
    red.append(_cube("gakuzuka", (0.085, pr * 1.1, h * 0.155), (0, 0, h * 0.80)))
    # 島木（笠木の下の横木）
    black.append(_cube("shimaki", (span + pr * 4.6, pr * 1.5, 0.095), (0, 0, h * 0.905)))
    # 笠木（いちばん上。両端を少し反らせるため 3 分割で角度をつける）
    kw = span + pr * 5.4
    black.append(_cube("kasagi_c", (kw * 0.62, pr * 1.75, 0.085), (0, 0, h * 0.975)))
    for s in (-1, 1):
        e = _cube("kasagi_e%d" % s, (kw * 0.21, pr * 1.75, 0.085),
                  (s * kw * 0.41, 0, h * 0.985))
        e.rotation_euler = (0, math.radians(-7 * s), 0)
        T.apply_all_transforms(e)
        black.append(e)

    for o in red + black:
        T.add_bevel(o, width=0.006, segments=2)

    r = T.join_objects(red, "torii_red")
    r.data.materials.clear()
    r.data.materials.append(shu)
    b = T.join_objects(black, "torii_black")
    b.data.materials.clear()
    b.data.materials.append(urushi)

    obj = T.join_objects([r, b], "prop_torii")
    _finish(obj, "prop_torii", "prop_torii", base=True, smooth=30.0)

    T.save_blend("prop_torii.blend")
    out = [T.export_glb([obj], "prop_torii.glb")]
    lod = T.make_lod(obj, 0.40, "_lod1")
    out.append(T.export_glb([lod], "prop_torii_lod1.glb"))
    return {"prop_torii": {"kind": "model", "lods": out}}


# ───────────────────────── 和風台座（prop_pedestal） ─────────────────────────

def build_pedestal():
    """八角の三段台座。キャラ立ち絵やガチャ演出の「置き場」として使う。"""
    T.reset_scene()
    ishi = T.make_material("mat_ped_ishi", T.HEX["ishi"], roughness=0.72)
    ishi_d = T.make_material("mat_ped_ishi_d", T.HEX["ishi_dark"], roughness=0.78)
    kin = T.make_material("mat_ped_kin", T.HEX["gold"], roughness=0.24, metallic=0.9)

    tiers = [
        ("t0", 0.450, 0.430, 0.070, 0.035),
        ("t1", 0.395, 0.360, 0.090, 0.125),
        ("t2", 0.330, 0.330, 0.120, 0.230),
    ]
    stone_parts = []
    for name, r1, r2, d, z in tiers:
        o = _cone(name, 8, r1, r2, d, (0, 0, z))
        T.add_bevel(o, width=0.008, segments=2)
        stone_parts.append(o)

    # 金の縁輪（段と段の間に一本）
    ring = _cyl("ring", 8, 0.345, 0.010, (0, 0, 0.172))
    T.add_bevel(ring, width=0.003, segments=2)

    s = T.join_objects(stone_parts, "ped_stone")
    s.data.materials.clear()
    s.data.materials.append(ishi)
    s.data.materials.append(ishi_d)
    for p in s.data.polygons:
        p.material_index = 1 if p.center.z < 0.075 else 0
    ring.data.materials.clear()
    ring.data.materials.append(kin)

    obj = T.join_objects([s, ring], "prop_pedestal")
    _finish(obj, "prop_pedestal", "prop_pedestal", base=True, smooth=28.0)

    T.save_blend("prop_pedestal.blend")
    out = [T.export_glb([obj], "prop_pedestal.glb")]
    lod = T.make_lod(obj, 0.45, "_lod1")
    out.append(T.export_glb([lod], "prop_pedestal_lod1.glb"))
    return {"prop_pedestal": {"kind": "model", "lods": out}}


# ───────────────────────── 灯籠（prop_lantern） ─────────────────────────

def build_lantern():
    """春日灯籠の形。火袋は「柱6本 + 上下の板」で作り、窓はブーリアンを使わず空ける。"""
    T.reset_scene()
    ishi = T.make_material("mat_lan_ishi", T.HEX["ishi"], roughness=0.74)
    akari = T.make_material("mat_lan_akari", T.HEX["akari"], roughness=0.5,
                            emission_hex=T.HEX["akari"], emission_strength=6.0)

    stone_parts = []
    # 基礎
    stone_parts.append(_cone("kiso", 8, 0.230, 0.200, 0.110, (0, 0, 0.055)))
    # 竿（柱）。節を2つ入れる
    stone_parts.append(_cyl("sao", 14, 0.056, 0.640, (0, 0, 0.430)))
    for z in (0.300, 0.560):
        stone_parts.append(_cyl("fushi_%d" % int(z * 1000), 14, 0.072, 0.028, (0, 0, z)))
    # 中台
    stone_parts.append(_cone("chudai", 8, 0.170, 0.145, 0.075, (0, 0, 0.787)))
    # 火袋：六角の隅柱 6 本 + 下板 + 上板
    hb_z, hb_h, hb_r = 0.885, 0.190, 0.130
    stone_parts.append(_cyl("hib_base", 6, hb_r * 1.05, 0.016, (0, 0, hb_z - hb_h / 2)))
    stone_parts.append(_cyl("hib_top", 6, hb_r * 1.05, 0.016, (0, 0, hb_z + hb_h / 2)))
    for i in range(6):
        a = math.radians(60 * i + 30)
        stone_parts.append(_cube("post%d" % i, (0.030, 0.030, hb_h),
                                 (math.cos(a) * hb_r, math.sin(a) * hb_r, hb_z)))
    # 笠（六角の屋根）と蕨手、宝珠
    stone_parts.append(_cone("kasa", 6, 0.265, 0.075, 0.115, (0, 0, 1.045)))
    stone_parts.append(_cyl("ukebana", 6, 0.070, 0.030, (0, 0, 1.118)))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=8, radius=0.052,
                                         location=(0, 0, 1.170))
    hoju = bpy.context.object
    hoju.name = "hoju"
    T.apply_all_transforms(hoju)
    stone_parts.append(hoju)

    for o in stone_parts:
        T.add_bevel(o, width=0.005, segments=2)

    body = T.join_objects(stone_parts, "lantern_stone")
    body.data.materials.clear()
    body.data.materials.append(ishi)

    # 火（発光）。火袋の中に小さな球を置く。
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.062,
                                         location=(0, 0, hb_z))
    flame = bpy.context.object
    flame.name = "lantern_light"
    T.apply_all_transforms(flame)
    flame.data.materials.clear()
    flame.data.materials.append(akari)

    obj = T.join_objects([body, flame], "prop_lantern")
    _finish(obj, "prop_lantern", "prop_lantern", base=True, smooth=26.0)

    T.save_blend("prop_lantern.blend")
    out = [T.export_glb([obj], "prop_lantern.glb")]
    lod = T.make_lod(obj, 0.40, "_lod1")
    out.append(T.export_glb([lod], "prop_lantern_lod1.glb"))
    return {"prop_lantern": {"kind": "model", "lods": out}}


# ───────────────────────── 入口 ─────────────────────────

BUILDERS = {
    "board": build_board,
    "stone": build_stone,
    "torii": build_torii,
    "pedestal": build_pedestal,
    "lantern": build_lantern,
}


def main():
    args = T.argv_after_ddash()
    only = None
    if "--only" in args:
        only = args[args.index("--only") + 1]
    T.ensure_dirs()
    entries = {}
    for key, fn in BUILDERS.items():
        if only and key != only:
            continue
        T.log("=== build", key, "===")
        entries.update(fn())
    T.log("done:", ", ".join(entries.keys()))
    return entries


if __name__ == "__main__":
    main()
