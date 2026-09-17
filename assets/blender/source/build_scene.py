"""TRIAD - ホームの情景を1枚に組んで撮る（Blender 4.x / bpy）

    blender --background --factory-startup --python assets/blender/source/build_scene.py

なぜ別のスクリプトなのか
    build_renders.py は「1つの形を白い背景で撮る」道具で、UI に重ねる小物のためのもの。
    ホームの地に要るのはそれではなく、鳥居も灯籠も地面も霧も入った「夜の情景」1枚。
    照明の考え方が正反対（三点の撮影照明 ↔ 月あかりと灯籠の火）なので、分けてある。

作るもの
    bg_home_night   … ホームの地。端末の縦横比（390:844）で撮る
    board_front     … 手前に置く碁盤。低い角度で、石を並べた状態

形は作り直さない。build_models.py が保存した .blend から取り込んで並べるだけ。
同じ形を二度定義すると、片方を直したときに必ずずれる。
"""

import os
import sys
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                                      # noqa: E402
from mathutils import Vector                    # noqa: E402
import triad_common as T                        # noqa: E402


# ───────────────────────── 取り込み ─────────────────────────

def append_from(blend_name, skip_lod=True):
    """保存済みの .blend からメッシュを取り込んで、1つに結合して返す。

    build_models.py の build_* は先頭で reset_scene() を呼ぶので、直接は呼べない。
    書き出し済みの .blend を読むのが、形をひとつに保ったまま並べる唯一の道。
    """
    path = os.path.join(T.SRC_DIR, blend_name)
    if not os.path.exists(path):
        raise SystemExit("%s が無い。先に build_models.py を実行すること。" % path)

    before = set(bpy.context.scene.objects)
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = [n for n in src.objects
                       if not (skip_lod and "lod" in n.lower())]
    brought = []
    for ob in dst.objects:
        if ob is None or ob.type != "MESH":
            continue
        bpy.context.collection.objects.link(ob)
        brought.append(ob)
    if not brought:
        raise SystemExit("%s からメッシュを取り込めなかった" % blend_name)

    del before
    if len(brought) == 1:
        return brought[0]
    return T.join_objects(brought, blend_name.replace(".blend", ""))


def bounds(obj):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for corner in obj.bound_box:
        p = obj.matrix_world @ Vector(corner)
        lo = Vector((min(lo.x, p.x), min(lo.y, p.y), min(lo.z, p.z)))
        hi = Vector((max(hi.x, p.x), max(hi.y, p.y), max(hi.z, p.z)))
    return lo, hi, hi - lo


def place(obj, height, at, rot_z=0.0, name=None):
    """高さを合わせ、底を地面に付けて置く。

    元の形の寸法はまちまち（碁石は 0.025、鳥居は数単位）なので、
    座標を手で書くと形を作り直したときに必ず破綻する。高さで正規化する。
    """
    _lo, _hi, size = bounds(obj)
    if size.z <= 1e-9:
        raise SystemExit("%s の高さが 0" % obj.name)
    k = height / size.z
    obj.scale = (k, k, k)
    bpy.context.view_layer.update()
    lo, _hi2, _s = bounds(obj)
    obj.location = (at[0] - 0, at[1] - 0, at[2] - lo.z)
    obj.rotation_euler = (0.0, 0.0, math.radians(rot_z))
    bpy.context.view_layer.update()
    # 回転と拡大で原点がずれるので、置き直して底を合わせる
    lo2, _h, _s2 = bounds(obj)
    obj.location = (obj.location.x + (at[0] - (lo2.x + _h.x) / 2.0),
                    obj.location.y + (at[1] - (lo2.y + _h.y) / 2.0),
                    obj.location.z + (at[2] - lo2.z))
    if name:
        obj.name = name
    bpy.context.view_layer.update()
    return obj


def copy_of(obj, name):
    dup = obj.copy()
    dup.data = obj.data.copy()
    bpy.context.collection.objects.link(dup)
    dup.name = name
    return dup


# ───────────────────────── 夜の材質と灯り ─────────────────────────

def night_world(top="#1b1f3d", bottom="#2d2440", strength=1.35):
    """夜空。上下で色を変える。

    一色の暗い世界光で撮ると、社殿も山も黒い板になって形が読めない
    （実際に一度そうなった）。上を藍、下を紫寄りにして、地平に近いほど
    明るくすると、遠くの輪郭が浮く。
    """
    w = bpy.data.worlds.new("TRIAD_Night")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_WORLD":
            nt.nodes.remove(n)
    out = nt.nodes["World Output"]
    bg = nt.nodes.new("ShaderNodeBackground")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    mapping = nt.nodes.new("ShaderNodeMapping")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    grad.gradient_type = "EASING"
    mapping.inputs["Rotation"].default_value[1] = math.radians(-90.0)
    ramp.color_ramp.elements[0].position = 0.34
    ramp.color_ramp.elements[0].color = T.srgb(bottom)
    ramp.color_ramp.elements[1].position = 0.72
    ramp.color_ramp.elements[1].color = T.srgb(top)
    bg.inputs[1].default_value = strength
    nt.links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], grad.inputs["Vector"])
    nt.links.new(grad.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def sakura(at, radius=1.1, blobs=7, seed=0):
    """桜。球をいくつか寄せて枝先の塊にする。花びら1枚ずつは作らない。

    遠景〜中景でしか映らないので、輪郭とにじみさえ出れば足りる。
    """
    mat = T.make_material("mat_sakura_%d" % seed, "#f0b6cd", roughness=0.95,
                          emission_hex="#f7cdda", emission_strength=0.55)
    made = []
    rng = [(0.0, 0.0, 0.0), (0.62, 0.22, 0.24), (-0.55, 0.3, 0.18),
           (0.25, -0.5, -0.22), (-0.3, -0.42, 0.3), (0.5, 0.5, -0.2),
           (-0.62, 0.05, -0.3)]
    for i in range(min(blobs, len(rng))):
        dx, dy, dz = rng[i]
        r = radius * (0.58 + 0.24 * ((i * 7 + seed) % 5) / 4.0)
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=r, segments=14, ring_count=8,
            location=(at[0] + dx * radius, at[1] + dy * radius, at[2] + dz * radius))
        o = bpy.context.active_object
        o.name = "Sakura%d_%d" % (seed, i)
        T.assign(o, mat)
        T.shade_smooth_auto(o, 60.0)
        made.append(o)
    return made


def add_fog(center, size, density=0.010):
    """霧。奥行きはこれが一番効く。濃くしすぎると全部白くなる。"""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
    cube = bpy.context.active_object
    cube.name = "Fog"
    cube.scale = size
    mat = bpy.data.materials.new("mat_fog")
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = nt.nodes["Material Output"]
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = T.srgb("#b9c7e6")
    vol.inputs["Density"].default_value = density
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    cube.data.materials.append(mat)
    return cube


def lantern_fire(obj, at, height):
    """灯籠の火袋。材質を光らせたうえで、点光源も置く。

    材質の発光だけでは周りを照らさない（EEVEE では間接光が回らない）。
    逆に点光源だけだと火袋そのものが暗いままになる。両方要る。
    """
    fire = T.make_material("mat_akari", T.HEX["akari"],
                           roughness=0.9, emission_hex=T.HEX["akari"],
                           emission_strength=14.0)
    # 灯籠は複数の材質を持つ。火袋に当たる部分だけを光らせるのは
    # 形の中身に踏み込むことになるので、ここでは点光源で代表させる。
    lamp = bpy.data.lights.new("Akari", type="POINT")
    lamp.energy = 26.0
    lamp.color = T.srgb(T.HEX["akari"])[:3]
    lamp.shadow_soft_size = 0.10
    ob = bpy.data.objects.new("Akari", lamp)
    bpy.context.collection.objects.link(ob)
    ob.location = (at[0], at[1], at[2] + height * 0.72)

    # 火袋そのものも光らせる。点光源だけだと灯籠の中が暗いままになる。
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=height * 0.062, segments=12, ring_count=8,
        location=(at[0], at[1], at[2] + height * 0.72))
    bulb = bpy.context.active_object
    bulb.name = "Hibukuro"
    T.assign(bulb, fire)
    del obj
    return ob


def moonlight(target=(0, 2, 1.5), energy=1500.0):
    """月あかり。寒色で、高いところから斜めに。"""
    lamp = bpy.data.lights.new("Moon", type="AREA")
    lamp.energy = energy
    lamp.color = T.srgb("#cfe0ff")[:3]
    lamp.size = 16.0
    ob = bpy.data.objects.new("Moon", lamp)
    bpy.context.collection.objects.link(ob)
    ob.location = (5.0, 13.0, 11.0)
    look = Vector(target) - Vector(ob.location)
    ob.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    return ob


def fill_light(target=(0, 4, 2), energy=260.0):
    """手前からの弱い起こし。これが無いと、こちらを向いた面が全部黒く落ちる。"""
    lamp = bpy.data.lights.new("Fill", type="AREA")
    lamp.energy = energy
    lamp.color = T.srgb("#8fa2d8")[:3]
    lamp.size = 12.0
    ob = bpy.data.objects.new("Fill", lamp)
    bpy.context.collection.objects.link(ob)
    ob.location = (-4.5, -6.0, 4.5)
    look = Vector(target) - Vector(ob.location)
    ob.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    return ob


def moon_disc(at=(3.2, 20.0, 8.4), radius=1.9):
    """空に浮かぶ月そのもの。発光する板。"""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=at, segments=32, ring_count=16)
    o = bpy.context.active_object
    o.name = "MoonDisc"
    T.assign(o, T.make_material("mat_moon", "#fffdf2", roughness=1.0,
                                emission_hex="#fff6dc", emission_strength=6.0))
    T.shade_smooth_auto(o, 60.0)
    return o


def bloom(threshold=0.85, size=8):
    """にじみ。EEVEE Next から bloom の切替が無くなったので合成で出す。"""
    sc = bpy.context.scene
    sc.use_nodes = True
    nt = sc.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    rl = nt.nodes.new("CompositorNodeRLayers")
    glare = nt.nodes.new("CompositorNodeGlare")
    comp = nt.nodes.new("CompositorNodeComposite")
    glare.glare_type = "BLOOM" if "BLOOM" in [
        i.identifier for i in glare.bl_rna.properties["glare_type"].enum_items
    ] else "FOG_GLOW"
    glare.quality = "HIGH"
    try:
        glare.threshold = threshold
    except Exception:
        pass
    try:
        glare.size = size
    except Exception:
        pass
    nt.links.new(rl.outputs["Image"], glare.inputs["Image"])
    nt.links.new(glare.outputs["Image"], comp.inputs["Image"])
    return glare


def phone_render(long_edge, ratio=390.0 / 844.0, samples=96, transparent=False):
    """端末の縦横比で撮る。setup_render は 2:3 固定なので、後から寸法を入れ直す。"""
    sc = T.setup_render(long_edge=long_edge, portrait=True, engine="EEVEE",
                        samples=samples, transparent=transparent)
    sc.render.resolution_y = long_edge
    sc.render.resolution_x = int(round(long_edge * ratio))
    return sc


# ───────────────────────── 夜の神社 ─────────────────────────

def build_night_shrine():
    T.reset_scene()

    # 地面。参道の石畳。
    ground = T.make_material("mat_ground", T.HEX["ishi_dark"], roughness=0.85)
    bpy.ops.mesh.primitive_plane_add(size=90.0, location=(0, 8, 0))
    floor = bpy.context.active_object
    floor.name = "Ground"
    T.assign(floor, ground)

    # 遠くの山。三角錐を並べるだけで十分に効く。
    yama = T.make_material("mat_yama", "#1b2233", roughness=1.0)
    for i, (x, y, h, r) in enumerate([(-16, 34, 11, 13), (7, 40, 14, 16), (20, 30, 9, 11)]):
        bpy.ops.mesh.primitive_cone_add(vertices=5, radius1=r, depth=h * 2,
                                        location=(x, y, 0))
        c = bpy.context.active_object
        c.name = "Yama%d" % i
        T.assign(c, yama)

    # 社殿。屋根を大きく張り出させないと、遠景では板にしか見えない
    # （実際に一度そうなった）。本体より屋根を広く、深く。
    urushi = T.make_material("mat_yashiro", "#3a2a20", roughness=0.8)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 24, 1.8))
    body = bpy.context.active_object
    body.name = "Yashiro"
    body.scale = (8.0, 5.0, 3.6)
    T.assign(body, urushi)

    yane = T.make_material("mat_yane", "#20262f", roughness=0.7)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=9.6, depth=3.4,
                                    location=(0, 24, 5.2), rotation=(0, 0, math.radians(45)))
    roof = bpy.context.active_object
    roof.name = "YashiroRoof"
    roof.scale = (1.0, 0.58, 1.0)
    T.assign(roof, yane)

    # 柱を並べて縁side を作る。数本あるだけで「建物」に見える。
    for x in (-6.4, -3.2, 0.0, 3.2, 6.4):
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.22, depth=3.6,
                                            location=(x, 21.4, 1.8))
        p = bpy.context.active_object
        p.name = "YashiroPillar"
        T.assign(p, T.make_material("mat_hashira", "#7d2f24", roughness=0.75))

    # 大鳥居。立ち絵の後ろに立つので、大きく。
    torii = append_from("prop_torii.blend")
    place(torii, height=5.2, at=(0.0, 7.5, 0.0), name="Torii")
    # 奥にもう一基、小さく重ねると参道に見える
    torii2 = copy_of(torii, "Torii2")
    place(torii2, height=3.4, at=(0.0, 14.0, 0.0))

    # 石灯籠。参道の両側に、手前から奥へ。火を入れる。
    lantern = append_from("prop_lantern.blend")
    spots = [(-2.0, 1.2, 1.25), (2.0, 1.2, 1.25),
             (-2.6, 5.4, 1.10), (2.6, 5.4, 1.10),
             (-3.1, 10.5, 0.95), (3.1, 10.5, 0.95)]
    base = place(lantern, height=spots[0][2], at=(spots[0][0], spots[0][1], 0.0), name="Lantern0")
    lantern_fire(base, (spots[0][0], spots[0][1], 0.0), spots[0][2])
    for i, (x, y, h) in enumerate(spots[1:], start=1):
        dup = copy_of(base, "Lantern%d" % i)
        place(dup, height=h, at=(x, y, 0.0))
        lantern_fire(dup, (x, y, 0.0), h)

    # 楼閣。遠景に段を重ねた塔を置くと、空の面積が減って密度が出る。
    # 一段ずつ小さくして屋根を張り出すだけで、それらしく見える。
    for i, (z, w, d) in enumerate([(0.0, 5.6, 4.2), (3.4, 4.7, 3.5),
                                   (6.4, 3.8, 2.9), (9.0, 3.0, 2.3)]):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-15.0, 27.0, z + 1.5))
        f = bpy.context.active_object
        f.name = "Rokaku%d" % i
        f.scale = (w, d, 3.0)
        T.assign(f, urushi)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=w * 1.42, depth=1.7,
                                        location=(-15.0, 27.0, z + 3.3),
                                        rotation=(0, 0, math.radians(45)))
        r = bpy.context.active_object
        r.name = "RokakuYane%d" % i
        r.scale = (1.0, 0.72, 1.0)
        T.assign(r, yane)

    # 遠くの灯り。小さな発光球を散らすと、街や社の気配が出る。
    tomoshibi = T.make_material("mat_tomoshibi", T.HEX["akari"], roughness=1.0,
                                emission_hex=T.HEX["akari"], emission_strength=9.0)
    for i, (x, y, z) in enumerate([
        (-15.0, 26.0, 2.2), (-13.6, 26.4, 5.6), (-16.2, 26.4, 8.6),
        (-6.0, 23.0, 2.6), (5.5, 23.0, 2.6), (9.5, 24.0, 1.9),
        (-9.5, 24.0, 1.9), (13.0, 26.0, 2.2), (0.0, 20.5, 3.4),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, segments=10, ring_count=6,
                                             location=(x, y, z))
        o = bpy.context.active_object
        o.name = "Tomoshibi%d" % i
        T.assign(o, tomoshibi)

    # 前景の欄干。画面下端に近景を1枚入れると、一気に奥行きが出る。
    ranma = T.make_material("mat_ranma", "#2a1714", roughness=0.8)
    for x in (-3.4, 3.4):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -2.6, 0.55))
        p = bpy.context.active_object
        p.name = "RankanPost"
        p.scale = (0.22, 0.22, 1.1)
        T.assign(p, ranma)
    for z in (0.62, 1.02):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.6, z))
        b = bpy.context.active_object
        b.name = "RankanBar"
        b.scale = (7.4, 0.16, 0.12)
        T.assign(b, ranma)

    # 桜。参道の左右、手前ほど大きく。夜の画面に色を入れるのはこれが一番効く。
    for i, (x, y, z, r) in enumerate([
        (-3.6, 2.4, 3.1, 1.5), (3.8, 3.2, 3.4, 1.6),
        (-4.6, 8.0, 3.6, 1.7), (4.8, 9.5, 3.3, 1.5),
        (-2.9, 16.0, 3.0, 1.3), (3.4, 17.5, 3.2, 1.4),
    ]):
        sakura((x, y, z), radius=r, seed=i)
        # 幹
        bpy.ops.mesh.primitive_cylinder_add(vertices=7, radius=0.13, depth=z,
                                            location=(x, y, z / 2.0))
        trunk = bpy.context.active_object
        trunk.name = "Miki%d" % i
        T.assign(trunk, T.make_material("mat_miki", "#2b211c", roughness=0.9))

    # 碁盤はここには置かない。手前の盤は board_front として別に撮り、
    # UI 側で重ねる。地の絵に焼き込むと、位置も明るさも後から動かせなくなる。

    moon_disc()
    moonlight()
    fill_light()
    add_fog(center=(0, 12, 4), size=(50, 46, 14), density=0.006)
    night_world()

    # 立ち絵が入る中央は空けたいので、カメラは低く、少し見上げる。
    T.add_camera((0.0, -3.4, 1.55), look_at=(0.0, 6.0, 2.35), lens=34.0)
    bloom(threshold=0.80, size=8)

    out = {"kind": "image", "tiers": {}}
    for tier in T.RES_TIERS:
        phone_render(tier, transparent=False)
        info = T.render_to("bg_home_night", tier, quality=80)
        out["tiers"][str(tier)] = {"file": info["file"], "bytes": info["bytes"],
                                   "sha256": info["sha256"]}
        out["w"] = info["w"]
        out["h"] = info["h"]
    T.save_blend("scene_home_night.blend")
    return {"bg_home_night": out}


# ───────────────────────── 手前の碁盤 ─────────────────────────

STONE_LAYOUT = [
    # (列, 行, 席)  席 1=深緑 2=朱 3=藍。盤の中央付近に、それらしく散らす。
    (-2, 0, 1), (-1, 0, 2), (0, 0, 1), (1, 0, 3), (2, 0, 2),
    (-1, 1, 3), (0, 1, 2), (1, 1, 1),
    (-2, -1, 2), (0, -1, 3), (2, -1, 1),
    (-1, 2, 1), (1, -2, 2),
]

SEAT_HEX = {1: T.HEX["p1"], 2: T.HEX["p2"], 3: T.HEX["p3"]}


def build_board_front():
    """低い角度の碁盤。石を並べた状態で撮る。

    build_renders.py の board_default はほぼ真上から撮っており（交点を読ませるため）、
    地面に置かれた盤を見下ろす絵にはならない。ホームの手前に置くのはこちら。
    """
    T.reset_scene()

    board = append_from("board_default.blend")
    place(board, height=0.42, at=(0, 0, 0), name="Board")
    # 明暗を離すと縞のテーブルクロスになる（実際に一度そうなった）。
    # 榧は本来ごく淡いので、2 色を近づけて、目を細かくする。
    wood = T.make_wood_material("mat_board_front", T.HEX["kaya_light"],
                                "#dccbab", scale=52.0, roughness=0.46)
    for i, _m in enumerate(board.data.materials):
        board.data.materials[i] = wood

    lo, hi, size = bounds(board)
    top = hi.z
    pitch = min(size.x, size.y) / 13.0

    stone = append_from("stone_default.blend")
    # 碁石は薄い。厚くするとゼリーに見える。
    place(stone, height=pitch * 0.24, at=(0, 0, top), name="StoneBase")
    stone.hide_render = True

    mats = {seat: T.make_material("mat_seat_%d" % seat, hexv, roughness=0.38)
            for seat, hexv in SEAT_HEX.items()}
    for n, (cx, cy, seat) in enumerate(STONE_LAYOUT):
        s = copy_of(stone, "Stone%d" % n)
        s.hide_render = False
        _l, _h, ssize = bounds(s)
        s.location = (cx * pitch, cy * pitch, top + ssize.z * 0.5)
        for i, _m in enumerate(s.data.materials):
            s.data.materials[i] = mats[seat]

    T.add_world("#1a2236", 1.6)
    moonlight(target=(0, 0, top), energy=900.0)

    # 盤の上を照らす灯り。盤面より高い位置に置かないと、天面が起きない。
    span = max(size.x, size.y)
    for x, y in ((-span * 0.7, -span * 0.5), (span * 0.7, -span * 0.4)):
        lamp = bpy.data.lights.new("Akari", type="POINT")
        lamp.energy = 40.0
        lamp.color = T.srgb(T.HEX["akari"])[:3]
        lamp.shadow_soft_size = 0.15
        ob = bpy.data.objects.new("Akari", lamp)
        bpy.context.collection.objects.link(ob)
        ob.location = (x, y, top + span * 0.45)

    key = bpy.data.lights.new("BoardKey", type="AREA")
    key.energy = 220.0
    key.size = span * 1.6
    key.color = T.srgb("#e8eeff")[:3]
    kob = bpy.data.objects.new("BoardKey", key)
    bpy.context.collection.objects.link(kob)
    kob.location = (0.0, -span * 0.8, top + span * 0.95)
    look = Vector((0, 0, top)) - Vector(kob.location)
    kob.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()

    # 高さは「地面に置いた盤を、座って見る」くらい。
    # 低すぎると側面しか映らない（実際に一度そうなった）。
    T.add_camera((0.0, -span * 1.15, top + span * 0.34),
                 look_at=(0, 0, top), lens=46.0)
    bloom(threshold=0.95, size=5)

    out = {"kind": "image", "tiers": {}}
    for tier in (512, 1024):
        sc = T.setup_render(long_edge=tier, portrait=False, engine="EEVEE",
                            samples=96, transparent=True)
        sc.render.resolution_x = tier
        sc.render.resolution_y = int(round(tier * 0.42))
        info = T.render_to("board_front", tier, quality=82)
        out["tiers"][str(tier)] = {"file": info["file"], "bytes": info["bytes"],
                                   "sha256": info["sha256"]}
        out["w"] = info["w"]
        out["h"] = info["h"]
    T.save_blend("scene_board_front.blend")
    return {"board_front": out}


SCENES = {
    "bg_home_night": build_night_shrine,
    "board_front": build_board_front,
}


def main():
    args = T.argv_after_ddash()
    only = args[args.index("--only") + 1] if "--only" in args else None
    T.ensure_dirs()
    entries = {}
    for name, fn in SCENES.items():
        if only and name != only:
            continue
        T.log("=== scene", name, "===")
        entries.update(fn())
    total = sum(t["bytes"] for e in entries.values() for t in e["tiers"].values())
    T.log("done:", ", ".join(entries.keys()), "| 合計 %.1f KB" % (total / 1024.0))
    return entries


if __name__ == "__main__":
    main()
