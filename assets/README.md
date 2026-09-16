# TRIAD アセット

指示書「Blender活用・グラフィック全面強化」§61〜§63 の構成。

```
assets/
  blender/source/   .blend と、それを生成する Blender Python スクリプト（編集可能な元データ）
  models/           ゲーム用の書き出し（.glb）
  images/rendered/  Blender からのプリレンダー（.webp / .png）
```

## 命名規則（§63）

| 種別 | 形 | 例 |
|---|---|---|
| キャラ | `char_<id>_<用途>.glb` | `char_hibana_home.glb` |
| 盤面 | `board_<skin>.glb` | `board_sakura.glb` |
| 背景 | `bg_<画面>_<季節>.webp` | `bg_home_spring.webp` |
| 演出 | `fx_<id>_<種類>.webp` | `fx_hibana_fire.webp` |

## 重要な制約

**`.blend` をゲーム本体から直接読み込まない**（§61）。ゲームが読むのは `models/` と
`images/rendered/` の書き出しだけ。

**ゲーム本体は単一 HTML ファイルで配布している。** 外部アセットを参照するには配信先を
決める必要がある。このリポジトリは Edge Function の bundle を jsDelivr の commit 固定 URL で
配信しており（`supabase/functions/api/index.ts` を参照）、同じ方式をアセットにも使える。
取り込みは遅延ロードとし、起動時に全部読まない（§26・§60）。

## 現状

**Blender はこのマシンに未インストールのため、この下にはまだ生成物がない。**
`blender/source/` のスクリプトは、Blender 4.x を入れたあとに実行する想定で書いてある。

生成の入口:

```bash
blender --background --python assets/blender/source/build_all.py
```
