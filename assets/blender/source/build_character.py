"""TRIAD - キャラクターの試作（Blender 4.x / bpy）

    blender --background --factory-startup --python assets/blender/source/build_character.py

なぜ 3D なのか
    着せ替えは キャラ12 × 衣装12 × 小物12 = 1,728 通り。絵で持つと、
    ホームの立ち絵だけで 1,728 枚要る。層に分けても 300 枚で、
    全部を同じポーズ・同じ光で描かないと繋ぎ目がずれる。
    素体12 + 衣装12 + 小物12 = 36 個のモデルなら、組み合わせは
    その場で作れる。1,728 通りに耐えるのはこれだけ。

このファイルが作るもの
    char_<id>_base.glb        素体（体・顔・髪）
    char_<id>_outfit_*.glb    衣装（差し替える）
    char_<id>_acc_*.glb       小物（差し替える）
    char_<id>_home.webp       ホーム用の立ち絵（透過・§13 の 236×330 比）

    衣装と小物は素体と同じ原点・同じ寸法で作る。そうしておけば、
    読み込んで重ねるだけで組み合わせが成立する。

見え方
    セルシェード（Shader to RGB → 定数補間のカラーランプ）と、
    法線を反転させた外殻による輪郭線。どちらも EEVEE でしか動かない。
    Cycles には Shader to RGB が無い。
"""

import os
import sys
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                                      # noqa: E402
from mathutils import Vector                    # noqa: E402
import triad_common as T                        # noqa: E402


# ───────────────────────── 色 ─────────────────────────

SKIN = "#f7ddc8"
SKIN_SH = "#e0b69c"
HAIR = "#d2622c"
HAIR_SH = "#9c4318"
EYE = "#3a2a20"
KIMONO = "#f4efe4"
KIMONO_SH = "#cfc6ae"
OBI = "#8d291f"
OBI_SH = "#561514"
GOLD = "#c9a456"
SASH = "#1c4d7e"


# ───────────────────────── セルシェード ─────────────────────────

def toon_material(name, base_hex, shadow_hex, rim=True, rim_hex="#e7c97a"):
    """2段のセルシェード。

    Principled のままだと滑らかに陰が回り、絵が「3Dのまま」に見える。
    拡散を Shader to RGB で色に落とし、定数補間のランプで2段に切ると、
    塗り分けたように見える。Shader to RGB は EEVEE 専用。
    """
    old = bpy.data.materials.get(name)
    if old:
        bpy.data.materials.remove(old)
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = nt.nodes["Material Output"]

    diffuse = nt.nodes.new("ShaderNodeBsdfDiffuse")
    diffuse.inputs["Color"].default_value = (1, 1, 1, 1)
    to_rgb = nt.nodes.new("ShaderNodeShaderToRGB")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = T.srgb(shadow_hex)
    ramp.color_ramp.elements[1].position = 0.46
    ramp.color_ramp.elements[1].color = T.srgb(base_hex)

    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 1.0
    nt.links.new(diffuse.outputs["BSDF"], to_rgb.inputs["Shader"])
    nt.links.new(to_rgb.outputs["Color"], ramp.inputs["Fac"])

    if rim:
        # 縁の光。輪郭の内側に一筋入れると、背景から浮く。
        fres = nt.nodes.new("ShaderNodeFresnel")
        fres.inputs["IOR"].default_value = 1.32
        rramp = nt.nodes.new("ShaderNodeValToRGB")
        rramp.color_ramp.interpolation = "CONSTANT"
        rramp.color_ramp.elements[0].position = 0.0
        rramp.color_ramp.elements[0].color = (0, 0, 0, 1)
        rramp.color_ramp.elements[1].position = 0.62
        rramp.color_ramp.elements[1].color = T.srgb(rim_hex)
        add = nt.nodes.new("ShaderNodeMixRGB")
        add.blend_type = "ADD"
        add.inputs["Fac"].default_value = 0.55
        nt.links.new(fres.outputs["Fac"], rramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], add.inputs[1])
        nt.links.new(rramp.outputs["Color"], add.inputs[2])
        nt.links.new(add.outputs["Color"], emit.inputs["Color"])
    else:
        nt.links.new(ramp.outputs["Color"], emit.inputs["Color"])

    nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    return mat


def line_material():
    """輪郭用の黒。外殻の内側だけが見えるので、これで線になる。"""
    name = "mat_toon_line"
    old = bpy.data.materials.get(name)
    if old:
        return old
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = T.srgb("#241a16")
    emit.inputs["Strength"].default_value = 1.0
    nt.links.new(emit.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
    # ここが要。殻は外へ張り出していて、こちら側の面は内向きになる。
    # 裏面を描かない設定にすると、その内向きの面だけが消え、縁だけ黒が残る。
    # 付け忘れると殻が正面を覆い、全身が真っ黒になる（実際に一度そうなった）。
    mat.use_backface_culling = True
    return mat


def add_outline(obj, thickness=0.006):
    """法線を反転した外殻で輪郭を出す。

    Freestyle は EEVEE の速い経路に乗らず、線幅も距離で変わる。
    外殻なら、どのレンダラでも同じ太さで出る。
    """
    if line_material().name not in [m.name for m in obj.data.materials if m]:
        obj.data.materials.append(line_material())
    idx = len(obj.data.materials) - 1
    mod = obj.modifiers.new("Outline", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = 1.0
    mod.use_flip_normals = False
    mod.use_rim = False
    mod.material_offset = idx
    mod.material_offset_rim = idx
    return mod


# ───────────────────────── 形を作る道具 ─────────────────────────

def sphere(name, r, loc, scale=(1, 1, 1), segs=24, rings=14):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=rings)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    return o


def cyl(name, r1, r2, depth, loc, verts=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2,
                                    depth=depth, location=loc,
                                    rotation=[math.radians(a) for a in rot])
    o = bpy.context.active_object
    o.name = name
    return o


def cube(name, size, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc,
                                    rotation=[math.radians(a) for a in rot])
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    return o


def finish(objs, name, mat, smooth=True, outline=0.006):
    """部品をまとめて1つにし、材質と輪郭を付ける。"""
    obj = T.join_objects(objs, name) if len(objs) > 1 else objs[0]
    obj.name = name
    T.apply_all_transforms(obj)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if smooth:
        T.shade_smooth_auto(obj, 42.0)
    T.recalc_normals(obj)
    if outline:
        add_outline(obj, outline)
    return obj


# ───────────────────────── 素体 ─────────────────────────
#
# 寸法の基準は「背丈 1.0」。衣装も小物もこの基準に合わせて作れば、
# どの組み合わせでも重なる。

HEIGHT = 1.0
HEAD_R = 0.108          # 頭は大きめ。二頭身寄りにすると、小さく出しても顔が読める。
HEAD_Z = 0.845


def build_base(char_id="hibana"):
    T.reset_scene()
    skin = toon_material("mat_%s_skin" % char_id, SKIN, SKIN_SH)
    hair_m = toon_material("mat_%s_hair" % char_id, HAIR, HAIR_SH)
    eye_m = toon_material("mat_%s_eye" % char_id, EYE, EYE, rim=False)

    # ── 頭 ──
    head = sphere("Head", HEAD_R, (0, 0, HEAD_Z), scale=(1.0, 0.92, 1.06), segs=28, rings=18)
    jaw = sphere("Jaw", HEAD_R * 0.74, (0, -0.012, HEAD_Z - 0.052), scale=(1.0, 0.95, 0.85))
    head = finish([head, jaw], "%s_head" % char_id, skin)

    # ── 首と胴 ──
    neck = cyl("Neck", 0.030, 0.034, 0.055, (0, 0, HEAD_Z - 0.118))
    chest = cyl("Chest", 0.058, 0.082, 0.170, (0, 0, HEAD_Z - 0.245))
    waist = cyl("Waist", 0.082, 0.070, 0.090, (0, 0, HEAD_Z - 0.375))
    body = finish([neck, chest, waist], "%s_body" % char_id, skin)

    # ── 腕 ──
    arms = []
    for side, sx in (("L", -1), ("R", 1)):
        upper = cyl("Up%s" % side, 0.030, 0.026, 0.150,
                    (sx * 0.088, 0.004, HEAD_Z - 0.255), rot=(0, sx * 12, 0))
        fore = cyl("Fore%s" % side, 0.026, 0.021, 0.145,
                   (sx * 0.122, -0.010, HEAD_Z - 0.392), rot=(sx * -16, sx * 6, 0))
        hand = sphere("Hand%s" % side, 0.030,
                      (sx * 0.136, -0.040, HEAD_Z - 0.468), scale=(1.0, 1.15, 0.72))
        arms += [upper, fore, hand]
    arms_o = finish(arms, "%s_arms" % char_id, skin)

    # ── 脚。裾から少しだけ見える範囲でよい ──
    legs = []
    for sx in (-1, 1):
        leg = cyl("Leg", 0.040, 0.030, 0.300, (sx * 0.042, 0, HEAD_Z - 0.575))
        foot = cube("Foot", (0.052, 0.086, 0.028), (sx * 0.042, -0.022, HEAD_Z - 0.728))
        legs += [leg, foot]
    legs_o = finish(legs, "%s_legs" % char_id, skin)

    # ── 髪 ──
    cap = sphere("HairCap", HEAD_R * 1.055, (0, 0.004, HEAD_Z + 0.012),
                 scale=(1.0, 0.95, 1.04), segs=28, rings=18)
    # 前髪。板を数枚、額に沿わせる。
    bangs = []
    for i, (x, rz) in enumerate([(-0.062, 14), (-0.020, 4), (0.024, -6), (0.066, -16)]):
        b = cube("Bang%d" % i, (0.050, 0.030, 0.092),
                 (x, -0.082, HEAD_Z + 0.034), rot=(12, 0, rz))
        bangs.append(b)
    # 横と後ろの長い髪
    sides = []
    for sx in (-1, 1):
        s = cyl("SideHair", 0.034, 0.020, 0.360,
                (sx * 0.098, 0.004, HEAD_Z - 0.170), rot=(0, sx * 5, 0))
        sides.append(s)
    back = cyl("BackHair", 0.105, 0.052, 0.420, (0, 0.062, HEAD_Z - 0.185))
    hair = finish([cap] + bangs + sides + [back], "%s_hair" % char_id, hair_m)

    # ── 目と眉。板を顔に貼る ──
    faces = []
    for sx in (-1, 1):
        e = sphere("Eye", 0.017, (sx * 0.038, -0.093, HEAD_Z + 0.012),
                   scale=(0.85, 0.35, 1.25))
        faces.append(e)
        br = cube("Brow", (0.034, 0.008, 0.008),
                  (sx * 0.040, -0.098, HEAD_Z + 0.048), rot=(0, 0, sx * -7))
        faces.append(br)
    eyes = finish(faces, "%s_face" % char_id, eye_m, outline=0.0)

    parts = [head, body, arms_o, legs_o, hair, eyes]
    T.save_blend("char_%s_base.blend" % char_id)
    info = T.export_glb(parts, "char_%s_base.glb" % char_id)
    T.log("   素体 %d 部品 / %d 三角形" % (len(parts), sum(T.tri_count(p) for p in parts)))
    return {"char_%s_base" % char_id: {"kind": "model", "lods": [info]}}


# ───────────────────────── 衣装 ─────────────────────────

def build_outfit(char_id="hibana", outfit_id="haregi"):
    """衣装。素体と同じ原点・同じ背丈で作る。

    素体を消してから作ると寸法を外すので、素体を読み込んだ上に重ねて作り、
    書き出すときに衣装だけを選ぶ。
    """
    T.reset_scene()
    cloth = toon_material("mat_%s_cloth" % outfit_id, KIMONO, KIMONO_SH)
    obi_m = toon_material("mat_%s_obi" % outfit_id, OBI, OBI_SH)
    gold_m = toon_material("mat_%s_gold" % outfit_id, GOLD, "#8a6a2c")
    sash_m = toon_material("mat_%s_sash" % outfit_id, SASH, "#0a213f")

    # 身頃。肩から裾へ広がる円錐。
    body = cyl("Kimono", 0.094, 0.176, 0.560, (0, 0, HEAD_Z - 0.430), verts=28)
    # 襟。V字に重ねる2枚。
    collars = []
    for sx in (-1, 1):
        c = cube("Collar", (0.040, 0.020, 0.185),
                 (sx * 0.032, -0.052, HEAD_Z - 0.210), rot=(10, 0, sx * 15))
        collars.append(c)
    # 袖。振袖なので長く垂らす。
    sleeves = []
    for sx in (-1, 1):
        s = cube("Sleeve", (0.090, 0.105, 0.300),
                 (sx * 0.135, 0.004, HEAD_Z - 0.330), rot=(0, sx * 10, 0))
        sleeves.append(s)
    kimono = finish([body] + collars + sleeves, "%s_%s_cloth" % (char_id, outfit_id), cloth)

    # 帯
    obi = cyl("Obi", 0.118, 0.126, 0.100, (0, 0, HEAD_Z - 0.392), verts=28)
    knot = cube("ObiKnot", (0.116, 0.082, 0.100), (0, 0.104, HEAD_Z - 0.378))
    obi_o = finish([obi, knot], "%s_%s_obi" % (char_id, outfit_id), obi_m)

    # 帯締めと金の縁
    cord = cyl("Cord", 0.122, 0.124, 0.020, (0, 0, HEAD_Z - 0.352), verts=28)
    cord_o = finish([cord], "%s_%s_cord" % (char_id, outfit_id), gold_m, outline=0.004)

    hem = cyl("Hem", 0.174, 0.182, 0.030, (0, 0, HEAD_Z - 0.700), verts=28)
    hem_o = finish([hem], "%s_%s_hem" % (char_id, outfit_id), sash_m, outline=0.004)

    parts = [kimono, obi_o, cord_o, hem_o]
    T.save_blend("char_%s_outfit_%s.blend" % (char_id, outfit_id))
    info = T.export_glb(parts, "char_%s_outfit_%s.glb" % (char_id, outfit_id))
    T.log("   衣装 %d 三角形" % sum(T.tri_count(p) for p in parts))
    return {"char_%s_outfit_%s" % (char_id, outfit_id): {"kind": "model", "lods": [info]}}


# ───────────────────────── 小物 ─────────────────────────

def build_accessory(char_id="hibana", acc_id="hanakanzashi"):
    T.reset_scene()
    petal_m = toon_material("mat_%s_petal" % acc_id, "#f6f1e6", "#d8cfc0")
    gold_m = toon_material("mat_%s_gold" % acc_id, GOLD, "#8a6a2c")
    shu_m = toon_material("mat_%s_shu" % acc_id, "#b5402f", "#7a2419")

    # 花。花びらを放射に並べる。
    petals = []
    at = Vector((0.082, -0.028, HEAD_Z + 0.072))
    for i in range(6):
        a = math.radians(i * 60.0)
        p = sphere("Petal%d" % i, 0.026,
                   (at.x + math.cos(a) * 0.026, at.y, at.z + math.sin(a) * 0.026),
                   scale=(1.0, 0.45, 1.0), segs=14, rings=8)
        petals.append(p)
    flower = finish(petals, "%s_%s_flower" % (char_id, acc_id), petal_m, outline=0.004)

    core = sphere("Core", 0.014, (at.x, at.y - 0.008, at.z), segs=12, rings=8)
    core_o = finish([core], "%s_%s_core" % (char_id, acc_id), gold_m, outline=0.003)

    # 垂れ飾り
    drops = []
    for i, dz in enumerate((0.046, 0.082, 0.118)):
        d = sphere("Drop%d" % i, 0.010,
                   (at.x + 0.012, at.y, at.z - dz), segs=10, rings=6)
        drops.append(d)
    drop_o = finish(drops, "%s_%s_drop" % (char_id, acc_id), shu_m, outline=0.003)

    parts = [flower, core_o, drop_o]
    T.save_blend("char_%s_acc_%s.blend" % (char_id, acc_id))
    info = T.export_glb(parts, "char_%s_acc_%s.glb" % (char_id, acc_id))
    T.log("   小物 %d 三角形" % sum(T.tri_count(p) for p in parts))
    return {"char_%s_acc_%s" % (char_id, acc_id): {"kind": "model", "lods": [info]}}


# ───────────────────────── 組み合わせて撮る ─────────────────────────

def append_all(blend_name):
    path = os.path.join(T.SRC_DIR, blend_name)
    if not os.path.exists(path):
        raise SystemExit("%s が無い" % path)
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if "lod" not in n.lower()]
    out = []
    for ob in dst.objects:
        if ob and ob.type == "MESH":
            bpy.context.collection.objects.link(ob)
            out.append(ob)
    return out


def render_home(char_id="hibana", outfit_id="haregi", acc_id="hanakanzashi"):
    """ホームの立ち絵を撮る。§13 の 236×330（比 0.715）に合わせる。

    背景は透過。UI の上に重ねるので、地の色を持たせてはいけない。
    """
    T.reset_scene()
    objs = []
    objs += append_all("char_%s_base.blend" % char_id)
    objs += append_all("char_%s_outfit_%s.blend" % (char_id, outfit_id))
    objs += append_all("char_%s_acc_%s.blend" % (char_id, acc_id))
    if not objs:
        raise SystemExit("組み合わせるものが無い")

    # セルシェードは自前で発光させているので、灯りは形の陰影のためだけに置く。
    key = bpy.data.lights.new("Key", type="AREA")
    key.energy = 260.0
    key.size = 2.4
    key.color = T.srgb("#fff4e0")[:3]
    kob = bpy.data.objects.new("Key", key)
    bpy.context.collection.objects.link(kob)
    kob.location = (-1.5, -2.2, 2.2)
    look = Vector((0, 0, 0.75)) - Vector(kob.location)
    kob.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()

    fill = bpy.data.lights.new("Fill", type="AREA")
    fill.energy = 90.0
    fill.size = 3.0
    fill.color = T.srgb("#cfe0ff")[:3]
    fob = bpy.data.objects.new("Fill", fill)
    bpy.context.collection.objects.link(fob)
    fob.location = (2.2, -1.6, 1.4)
    look = Vector((0, 0, 0.7)) - Vector(fob.location)
    fob.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()

    T.add_world("#101726", 0.25)

    # 正投影で撮る。透視だと頭が小さくなり、二頭身寄りの意図が崩れる。
    T.add_camera((0.0, -3.2, 0.62), look_at=(0.0, 0.0, 0.50), ortho=1.02)

    out = {"kind": "image", "tiers": {}}
    for tier in (512, 1024):
        sc = T.setup_render(long_edge=tier, portrait=True, engine="EEVEE",
                            samples=64, transparent=True)
        sc.render.resolution_y = tier
        sc.render.resolution_x = int(round(tier * 236.0 / 330.0))
        info = T.render_to("char_%s_home" % char_id, tier, quality=88)
        out["tiers"][str(tier)] = {"file": info["file"], "bytes": info["bytes"],
                                   "sha256": info["sha256"]}
        out["w"] = info["w"]
        out["h"] = info["h"]
    T.save_blend("char_%s_home.blend" % char_id)
    return {"char_%s_home" % char_id: out}


def main():
    args = T.argv_after_ddash()
    only = args[args.index("--only") + 1] if "--only" in args else None
    T.ensure_dirs()
    steps = [
        ("base", lambda: build_base()),
        ("outfit", lambda: build_outfit()),
        ("acc", lambda: build_accessory()),
        ("home", lambda: render_home()),
    ]
    entries = {}
    for name, fn in steps:
        if only and name != only:
            continue
        T.log("=== char", name, "===")
        entries.update(fn())
    T.log("done:", ", ".join(entries.keys()))
    return entries


if __name__ == "__main__":
    main()
