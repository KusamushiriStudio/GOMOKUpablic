# TRIAD アセット

指示書「Blender活用・グラフィック全面強化」§61〜§63 の構成。

```
assets/
  blender/source/   .blend と、それを生成する Blender Python スクリプト（編集可能な元データ）
  models/           ゲーム用の書き出し（.glb）
  images/rendered/  Blender からのプリレンダー（.webp）。512 / 1024 / 2048 の段に分ける
```

## 命名規則（§63）

| 種別 | 形 | 例 |
|---|---|---|
| キャラ | `char_<id>_<用途>.glb` | `char_hibana_home.glb` |
| 盤面 | `board_<skin>.glb` | `board_sakura.glb` |
| 小物 | `prop_<name>.glb` | `prop_torii.glb` |
| 背景 | `bg_<画面>_<季節>.webp` | `bg_home_spring.webp` |
| 演出 | `fx_<id>_<種類>.webp` | `fx_hibana_fire.webp` |

LOD は `_lod1` を付ける（`board_default_lod1.glb`）。

## 生成済みのもの

Blender 4.5.9 LTS で実行済み。対象は碁盤・碁石・鳥居・和風台座・石灯籠。

| 種別 | 数 | 容量 |
|---|---|---|
| `models/*.glb` | 10（5 形 × 基本 + LOD1） | 688 KB |
| `images/rendered/*/*.webp` | 15（5 形 × 3 段） | 408 KB |
| `blender/source/*.blend` | 5 | 4.9 MB |

## 作り直しかた

```bash
blender --background --factory-startup --python assets/blender/source/build_models.py
blender --background --factory-startup --python assets/blender/source/build_renders.py
```

`-- --only <名前>` で 1 つだけ作り直せる。

**Microsoft Store 版の Blender では headless 実行ができない。** ランチャーが即座に戻って
プロセスが残らず、実行体を直接起動しようとすると Access denied になる。通常版か
ポータブル版を使うこと（検証はポータブル版 4.5.9 で行った）。

## つまずいたところ

- **カメラのニアクリップ** — 既定の `clip_start` は 0.1。碁石（長辺 0.025）はカメラより
  手前に入りきらず、まるごと消えて真っ白な画像が出る。`frame_camera()` が寸法から
  クリップ面を決めるようにしてある。
- **照明の距離と強さ** — `triad_common.three_point()` は位置と強さを同じ `scale` で動かすため、
  小さい対象では灯りが近づきすぎて片側だけ白飛びする。レンダー側は `studio_lights()` で
  距離を対象の大きさに、強さを距離の二乗に比例させている。
- **木目は GLB に乗らない** — 手続き材質なので、`.glb` は単色のまま。レンダー画像にだけ出る。
  GLB にも載せたい場合はベイクが要る。

## まだゲームに載っていない

生成物はリポジトリにあるが、`index.html` はまだ 1 つも読み込んでいない。
**`.blend` をゲーム本体から直接読み込まない**（§61）。ゲームが読むのは `models/` と
`images/rendered/` の書き出しだけ。

単一 HTML 配布なので、載せるには配信先の決定が要る。このリポジトリは Edge Function の
bundle を jsDelivr の commit 固定 URL で配信しており（`supabase/functions/api/index.ts`）、
同じ方式をアセットにも使える。`triad_common.write_manifest()` がその前提の目録を書く。
取り込みは遅延ロードとし、起動時に全部読まない（§26・§60）。
