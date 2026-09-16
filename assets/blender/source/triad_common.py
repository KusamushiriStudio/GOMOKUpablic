"""TRIAD - Blender 共通ヘルパ（Blender 4.x / bpy）

指示書 §9・§10・§24〜§26・§61〜§63・§81 の土台。
ここでは「形を作らない」。材質・書き出し・LOD・レンダ設定・品質確認の部品だけを置く。

Blender 4.0 / 4.1 / 4.2 / 4.3 で名前が変わった API は、すべて存在確認してから触る。
（Principled BSDF の入力名、EEVEE のエンジン識別子、glTF 書き出しの引数、自動スムーズ）
"""

import bpy
import bmesh
import json
import math
import os
import sys
import hashlib
from mathutils import Vector

# ───────────────────────── 置き場所（§61） ─────────────────────────

SRC_DIR = os.path.dirname(os.path.abspath(__file__))          # assets/blender/source
REPO_ROOT = os.path.abspath(os.path.join(SRC_DIR, "..", "..", ".."))
ASSETS_DIR = os.path.join(REPO_ROOT, "assets")
MODELS_DIR = os.path.join(ASSETS_DIR, "models")
RENDER_DIR = os.path.join(ASSETS_DIR, "images", "rendered")

# §25 解像度の段。長辺で 512 / 1024 / 2048。
# ファイル名は §63 のまま保ちたいので、段はディレクトリで分ける。
#   assets/images/rendered/1024/bg_home_spring.webp
RES_TIERS = (512, 1024, 2048)


def ensure_dirs():
    for d in (MODELS_DIR, RENDER_DIR):
        os.makedirs(d, exist_ok=True)
    for t in RES_TIERS:
        os.makedirs(os.path.join(RENDER_DIR, str(t)), exist_ok=True)


def argv_after_ddash():
    """blender -b --python x.py -- --foo bar の「--」以降を返す。"""
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return []


def log(*a):
    print("[TRIAD]", *a)
    sys.stdout.flush()


# ───────────────────────── 色（ゲームのCSSトークンと同じ値） ─────────────────────────

def srgb(hex_str, alpha=1.0):
    """sRGB の16進を Blender のリニア RGBA に直す。"""
    h = hex_str.lstrip("#")

    def lin(i):
        c = int(h[i:i + 2], 16) / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (lin(0), lin(2), lin(4), alpha)


# index.html の :root と同じ値。3D と 2D で色がずれないようにする。
HEX = {
    "green_900": "#0e2f21",
    "green_800": "#14432f",
    "green_700": "#1f6f4a",
    "green_500": "#3f8f5c",
    "green_200": "#cfe0cd",
    "cream": "#f4efe1",
    "cream_2": "#eae2cd",
    "ink": "#24301f",
    "sumi": "#2b2b2b",
    "accent": "#c0362c",   # 朱
    "gold": "#c9a227",     # 金
    "p1": "#1f6f4a",
    "p2": "#b5462f",
    "p3": "#2f5d94",
    # 素材色
    "kaya_light": "#e8dcbe",   # 榧（碁盤の面）
    "kaya_dark": "#c8b183",
    "keyaki": "#7d5a33",       # 欅（脚）
    "urushi": "#1a1512",       # 漆黒
    "ishi": "#8b8880",         # 石
    "ishi_dark": "#5f5d57",
    "hakuseki": "#efece2",     # 白石
    "akari": "#ffd89a",        # 灯り
}


# ───────────────────────── 材質（§10 スタイライズ） ─────────────────────────

def _set_input(node, names, value):
    """入力名がバージョンで変わるので、見つかった最初の名前に入れる。"""
    for n in names:
        if n in node.inputs:
            try:
                node.inputs[n].default_value = value
                return True
            except Exception:
                pass
    return False


def _principled(mat):
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        return bsdf
    for n in mat.node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED":
            return n
    return None


def make_material(name, base_hex, roughness=0.55, metallic=0.0,
                  emission_hex=None, emission_strength=0.0, alpha=1.0):
    """スタイライズ用の単色 Principled。glTF にそのまま乗る形だけを使う。"""
    old = bpy.data.materials.get(name)
    if old:
        bpy.data.materials.remove(old)
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = _principled(mat)
    _set_input(bsdf, ["Base Color"], srgb(base_hex, alpha))
    _set_input(bsdf, ["Roughness"], roughness)
    _set_input(bsdf, ["Metallic"], metallic)
    _set_input(bsdf, ["IOR"], 1.45)
    _set_input(bsdf, ["Alpha"], alpha)
    # 4.0 で "Emission" が "Emission Color" に改名された
    if emission_hex:
        _set_input(bsdf, ["Emission Color", "Emission"], srgb(emission_hex))
        _set_input(bsdf, ["Emission Strength"], emission_strength)
    if alpha < 1.0 and hasattr(mat, "blend_method"):
        try:
            mat.blend_method = "BLEND"
        except Exception:
            pass
    return mat


def make_wood_material(name, light_hex, dark_hex, scale=7.0, roughness=0.45):
    """木目。手続き材質は glTF に乗らないので、レンダ用（bg_*）に使う。
    GLB に載せたいときは bake_basecolor() を通すこと。"""
    mat = make_material(name, light_hex, roughness=roughness)
    nt = mat.node_tree
    bsdf = _principled(mat)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    wave = nt.nodes.new("ShaderNodeTexWave")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    wave.wave_type = "BANDS"
    try:
        wave.bands_direction = "X"
    except Exception:
        pass
    _set_input(wave, ["Scale"], scale)
    _set_input(wave, ["Distortion"], 2.2)
    _set_input(wave, ["Detail"], 3.0)
    _set_input(wave, ["Detail Scale"], 1.2)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = srgb(dark_hex)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = srgb(light_hex)
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def assign(obj, mat, slot=0):
    while len(obj.data.materials) <= slot:
        obj.data.materials.append(None)
    obj.data.materials[slot] = mat
    return obj


# ───────────────────────── 場面の初期化 ─────────────────────────

def reset_scene(unit_scale=1.0):
    """空の場面から始める。単位はメートル、スケールは 1（§81 スケール確認）。"""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = unit_scale
    sc.unit_settings.length_unit = "METERS"
    # 出力の色は「素の見た目」で扱う。AgX を通すとゲームの2D色と合わない。
    try:
        sc.view_settings.view_transform = "Standard"
        sc.view_settings.look = "None"
    except Exception:
        pass
    return sc


def activate(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    return obj


def select_only(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    if objs:
        bpy.context.view_layer.objects.active = objs[0]
    return objs


# ───────────────────────── 形の後処理 ─────────────────────────

def apply_all_transforms(obj):
    activate(obj)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


def add_bevel(obj, width=0.004, segments=2, angle_deg=40.0):
    """スタイライズの要（§10）。角に必ずハイライトが乗るようにする。"""
    activate(obj)
    m = obj.modifiers.new("TRIAD_Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle_deg)
    try:
        m.harden_normals = False
    except Exception:
        pass
    bpy.ops.object.modifier_apply(modifier=m.name)
    return obj


def shade_smooth_auto(obj, angle_deg=32.0):
    activate(obj)
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(angle_deg))   # 4.1 以降
        return obj
    except Exception:
        pass
    bpy.ops.object.shade_smooth()
    me = obj.data
    if hasattr(me, "use_auto_smooth"):        # 4.0 以前
        me.use_auto_smooth = True
        me.auto_smooth_angle = math.radians(angle_deg)
    return obj


def recalc_normals(obj):
    activate(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj


def _planar_uv(obj):
    """headless で smart_project が使えない場合の保険。面の法線で3方向に投影する。"""
    me = obj.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers.active.data
    dims = max(obj.dimensions) or 1.0
    for poly in me.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        u_i, v_i = ((1, 2), (0, 2), (0, 1))[ax]
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv[li].uv = ((co[u_i] / dims) + 0.5, (co[v_i] / dims) + 0.5)
    return obj


def uv_unwrap(obj, angle_deg=66.0, margin=0.02):
    """§81 の UV 確認を通すため、必ず UV を1枚は持たせる。"""
    activate(obj)
    try:
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(angle_deg), island_margin=margin)
        bpy.ops.object.mode_set(mode="OBJECT")
        return obj
    except Exception as e:
        log("!! smart_project 失敗（%s）。平面投影に落とす: %s" % (e, obj.name))
        try:
            bpy.ops.object.mode_set(mode="OBJECT")
        except Exception:
            pass
        return _planar_uv(obj)


def join_objects(objs, name):
    objs = [o for o in objs if o is not None]
    select_only(objs)
    bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = name
    obj.data.name = name + "_mesh"
    return obj


def origin_to_base(obj):
    """原点は「底面の中心」に置く（§81 原点確認）。
    床に置くもの（盤・鳥居・灯籠・台座）は全部これで揃える。"""
    activate(obj)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    mn = min((obj.matrix_world @ Vector(c)).z for c in obj.bound_box)
    obj.location.z -= mn
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    obj.location = (0.0, 0.0, 0.0)
    return obj


def origin_to_center(obj):
    """碁石のように「宙に浮かせて回す」ものは重心を原点にする。"""
    activate(obj)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    return obj


def tri_count(obj):
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


# ───────────────────────── LOD（§62） ─────────────────────────

def make_lod(obj, ratio, suffix="_lod1"):
    """decimate を焼いた複製を返す。呼んだ側が書き出しと後始末をする。"""
    activate(obj)
    bpy.ops.object.duplicate()
    lod = bpy.context.view_layer.objects.active
    lod.name = obj.name + suffix
    m = lod.modifiers.new("TRIAD_LOD", "DECIMATE")
    m.decimate_type = "COLLAPSE"
    m.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=m.name)
    return lod


# ───────────────────────── 書き出し（§24・§61） ─────────────────────────

def _filter_kwargs(op, kwargs):
    """glTF 書き出しの引数は 4.x の細かい版で増減する。存在するものだけ渡す。"""
    try:
        props = set(op.get_rna_type().properties.keys())
    except Exception:
        return kwargs
    return {k: v for k, v in kwargs.items() if k in props}


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def export_glb(objs, filename, draco=False):
    """assets/models/<filename> へ GLB を書き出す。名前は §63 に従う。"""
    ensure_dirs()
    path = os.path.join(MODELS_DIR, filename)
    select_only(objs)
    kwargs = dict(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=True,
        export_draco_mesh_compression_enable=bool(draco),
        export_draco_mesh_compression_level=6,
    )
    bpy.ops.export_scene.gltf(**_filter_kwargs(bpy.ops.export_scene.gltf, kwargs))
    size = os.path.getsize(path)
    tris = sum(tri_count(o) for o in objs)
    log("GLB", filename, "%.1f KB" % (size / 1024.0), "tris=%d" % tris)
    return {"file": filename, "bytes": size, "tris": tris, "sha256": sha256_of(path)}


def save_blend(name):
    """編集可能な元データ（§61）。ゲームからは絶対に読まない。"""
    path = os.path.join(SRC_DIR, name)
    bpy.ops.wm.save_as_mainfile(filepath=path)
    log("BLEND", name)
    return path


# ───────────────────────── レンダ（§25） ─────────────────────────

def pick_engine(prefer="EEVEE"):
    items = [i.identifier for i in
             bpy.context.scene.render.bl_rna.properties["engine"].enum_items]
    if prefer == "CYCLES" and "CYCLES" in items:
        return "CYCLES"
    for cand in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):   # 4.2 で改名
        if cand in items:
            return cand
    return items[0]


def setup_render(long_edge=1024, portrait=True, engine="EEVEE",
                 samples=64, transparent=True):
    sc = bpy.context.scene
    sc.render.engine = pick_engine(engine)
    if sc.render.engine == "CYCLES":
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
        try:
            sc.cycles.device = "GPU"
        except Exception:
            pass
    else:
        try:
            sc.eevee.taa_render_samples = samples
        except Exception:
            pass
    short = int(round(long_edge * 2 / 3))
    sc.render.resolution_x = short if portrait else long_edge
    sc.render.resolution_y = long_edge if portrait else short
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = bool(transparent)
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    return sc


def _set_webp(sc, quality=82):
    fmts = [i.identifier for i in
            sc.render.image_settings.bl_rna.properties["file_format"].enum_items]
    if "WEBP" in fmts:
        sc.render.image_settings.file_format = "WEBP"
        sc.render.image_settings.quality = quality
        return ".webp"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.compression = 90
    log("!! この Blender は WEBP 非対応。PNG で出した。cwebp -q %d で変換すること。" % quality)
    return ".png"


def render_to(name, tier, quality=82):
    """assets/images/rendered/<tier>/<name>.webp を書く。name は §63 の形。"""
    ensure_dirs()
    sc = bpy.context.scene
    ext = _set_webp(sc, quality)
    out = os.path.join(RENDER_DIR, str(tier), name + ext)
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    size = os.path.getsize(out)
    log("IMG", "%s/%s%s" % (tier, name, ext), "%.1f KB" % (size / 1024.0))
    return {"file": "%s/%s%s" % (tier, name, ext), "bytes": size,
            "w": sc.render.resolution_x, "h": sc.render.resolution_y,
            "sha256": sha256_of(out)}


# ───────────────────────── 灯り（和風の三点） ─────────────────────────

def add_area_light(name, loc, rot_deg, energy, size, color_hex):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    d.color = srgb(color_hex)[:3]
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    return o


def three_point(scale=1.0, warm="#fff1d6", cool="#cfe0ff", rim="#c9a227"):
    """主光=行灯の暖色、補助=障子越しの冷色、縁=金の照り返し。"""
    k = add_area_light("Key", (2.2 * scale, -2.6 * scale, 3.0 * scale),
                       (52, 0, 40), 900 * scale ** 2, 2.4 * scale, warm)
    f = add_area_light("Fill", (-2.8 * scale, -1.6 * scale, 1.6 * scale),
                       (74, 0, -58), 260 * scale ** 2, 3.2 * scale, cool)
    r = add_area_light("Rim", (-1.2 * scale, 3.0 * scale, 2.2 * scale),
                       (64, 0, 200), 420 * scale ** 2, 1.6 * scale, rim)
    return k, f, r


def add_world(color_hex="#0e2f21", strength=0.22):
    w = bpy.data.worlds.new("TRIAD_World")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = srgb(color_hex)
        bg.inputs[1].default_value = strength
    return w


def add_camera(loc, look_at=(0, 0, 0), lens=55.0, ortho=None):
    d = bpy.data.cameras.new("Cam")
    if ortho:
        d.type = "ORTHO"
        d.ortho_scale = ortho
    else:
        d.lens = lens
    cam = bpy.data.objects.new("Cam", d)
    bpy.context.collection.objects.link(cam)
    cam.location = loc
    direction = Vector(look_at) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


# ───────────────────────── 目録（§24・§26 の取り込み用） ─────────────────────────

def write_manifest(entries, base_commit="REPLACE_WITH_COMMIT_SHA"):
    """assets/manifest.json と assets/asset-table.js を書く。
    asset-table.js は index.html に貼る JS リテラル（起動時に取りに行かせないため）。"""
    ensure_dirs()
    man = {"version": 1, "commit": base_commit, "tiers": list(RES_TIERS), "entries": entries}
    mpath = os.path.join(ASSETS_DIR, "manifest.json")
    with open(mpath, "w", encoding="utf-8") as f:
        json.dump(man, f, ensure_ascii=False, indent=2)
    images = {k: v for k, v in entries.items() if v.get("kind") == "image"}
    table = {k: {"w": v["w"], "h": v["h"], "tiers": v["tiers"]} for k, v in images.items()}
    jpath = os.path.join(ASSETS_DIR, "asset-table.js")
    with open(jpath, "w", encoding="utf-8") as f:
        f.write("/* build_all.py が生成。index.html の assets.js モジュールへ貼る。 */\n")
        f.write("const ASSET_COMMIT = %s;\n" % json.dumps(base_commit))
        f.write("const ASSET_TABLE = %s;\n" % json.dumps(table, ensure_ascii=False, indent=2))
    log("MANIFEST", mpath)
    log("TABLE", jpath)
    return man
