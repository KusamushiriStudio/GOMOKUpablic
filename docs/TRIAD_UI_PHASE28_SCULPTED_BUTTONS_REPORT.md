# TRIAD UI段階実装報告

Phase：28

対象：ホーム画面 Main CTA／Sub Menuの立体ボタン化

## 今回実装したもの

- Main CTAの「対戦する」「物語」の間隔を12pxから2pxへ縮小。
- Sub Menuの4ボタンの間隔を10pxから2pxへ縮小。
- ボタンごとに台座、上部の菱形紋章、前へ張り出す立体装飾、文字用の暗色プレートを追加。
- ボタン本体の外へ装飾を張り出させ、四角形だけに依存しないシルエットへ変更。
- 機能を示す立体装飾を独立レイヤーとして配置。
  - 対戦：刀、碁石、赤金の戦闘紋章
  - 物語：物語絵巻、開いた本、月と桜
  - 世界：鳥居、橋、月夜の縮景
  - ガチャ：発光する召喚珠
  - 着せ替え：着物、扇、髪飾り
  - キャラ強化：刀、鍛造槌、炎の強化紋章
- 既存の文字、通知バッジ、Button、画面遷移は維持。

## 今回使用したツール

- ChatGPT画像生成：透明背景の立体装飾アトラス2点
- Unity 6000.3.24f1：uGUI合成、ボタン配置、ビルド、テスト
- Google Drive：Phase 27確定時点の復元用ZIP保存
- Figma／Blender／Rive：今回未使用

## 生成素材

- `Assets/TRIAD/UI/Art/CTA/HomeMainCtaEmblemAtlas-v1.png`
- `Assets/TRIAD/UI/Art/Menu/HomeSubMenuEmblemAtlas-v1.png`

生成プロンプトでは、透明背景、文字なし、ボタンパネルなし、各機能を示す独立した3D装飾、黒・赤・金、漆・金属・布・発光ガラス、80px前後でも判別可能な構図を指定した。

## Unityへ反映

YES

- シーン：`Assets/TRIAD/UI/Scenes/HomePhase28.unity`
- Windowsプレビュー：`Artifacts/UI/Player/TRIADHomePhase28.exe`
- スクリーンショット：`Artifacts/UI/HomePhase28-SculptedButtons-Player.png`

## テスト結果

- Phase 28自動検証：PASS
- Windows 64-bit Player build：PASS
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- Compile Error：0
- 390 × 844表示：PASS
- Main CTA間隔：2px
- Sub Menu間隔：2px
- 既存ボタン15個以上：保持

## 既存機能への影響

ゲームロジックや遷移先は変更していない。立体装飾はraycast無効の表示専用レイヤーで、既存Buttonの操作を遮らない。

## Google Driveバックアップ

- 保存先：マイドライブ／ゲーム作成
- ファイル：`TRIAD_Unity_Phase27_2026-09-21.zip`
- Drive確認サイズ：214.2MB
- ローカルサイズ：224,594,231 bytes
- SHA-256：`1e26e2583cedee54a465661dc718119d5dbbde4d74183f7b9598e18da3216120`
- ZIP一覧検査：PASS
- 保存内容：Assets、Packages、ProjectSettings、Art、ArtExport、docs、tests、tools、設定ファイル、Phase 27スクリーンショット
- 除外：Unityが再生成できるLibrary、Temp、Logs、obj、および大型Player生成物

## 無料／有料

今回使用した範囲では新規課金なし。外部有料プランは不要。

## 次に実装する小単位

Phase 29候補：押下時に装飾と台座が1～2px沈み、発光が短く強まるマイクロアニメーションを追加する。

