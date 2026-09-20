# TRIAD UI段階実装報告

Phase：19（キャラクター接地・背景調和）
対象：ホーム画面Hero Areaのキャラクター配置、前景碁盤、明暗統合

## 今回使用したツール

- Unity 6000.3.24f1：レイヤー分離、配置、色調、端末別Texture Import、実画面確認
- OpenAI built-in image generation：透過前景碁盤素材の生成
- PowerShell / System.Drawing：画像サイズ・Alpha検証
- Figma：未使用
- Blender：未使用。前景碁盤は将来のBlender製3D素材へ交換可能な独立レイヤー
- Rive：既存実装を維持

## 無料 / 有料

- Unity Personal：無料
- built-in image generation：Codex環境内機能を使用
- Figma Professional、Rive有料プラン、有料Asset：未使用

## 今回実装したもの

- キャラクター表示マスクをHero Area全幅366pxへ拡張し、右端の欠けを防止
- ヒバナを左へ19px移動し、拡大率を1.12へ調整
- キャラクター色を暖色・高輝度から、暗めの青紫系月光色へ変更
- 接地影を追加
- 透過前景碁盤をキャラクターと別のRawImageとして追加
- 碁盤画像を盤面と前縁だけへクロップし、脚部を非表示
- 碁盤の後ろに遮蔽面を追加し、足・衣装下端が盤の下へ抜けない構成へ変更
- レイヤー順を `背景 → 接地影 → キャラクター → 遮蔽面 → 碁盤 → 情報カード` に固定
- ボタン18個以上、既存スクロール、画面遷移用UIを保持

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase19.unity`
- Board asset：`Assets/TRIAD/UI/Art/Props/HomeGoBoardForeground-v1.png`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase19Builder.cs`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase19.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功（111,122,725 bytes）
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS（Phase 18と同じD3D11条件）
- 前景碁盤：2009×783、32-bit Alpha、四隅Alpha 0
- 既存操作ボタン：18個以上を保持

## 既存機能への影響

- ゲームロジック、保存、通信、画面遷移イベントの変更なし
- Hero Area内の表示レイヤーとTexture Import設定のみ変更
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 足先が完全に見える問題：解消
- 右側シルエットの表示領域不足：解消
- キャラクターだけ明るく浮く問題：大幅改善
- 参考画像の「盤面を前景に置く接地構図」：反映
- 残差：参考画像はキャラクター専用に描き下ろされた背景光とポーズが完全一致している。現行は独立素材同士をUnityで統合しているため、髪先・袖への背景色の反射光は今後Shaderまたは専用差分素材で追加可能

## 無料プランで困った点

- 今回の範囲ではなし

## 有料版で改善できそうな点

- 有料版でなければ解決できない問題なし

## 現時点で課金が必要か

NO

## 次に実装する小単位

- Hero Areaの局所演出：髪・袖への月光リムライト、桜の前景粒子、キャラクター呼吸アニメーションのうち1項目

## スクリーンショット

- `Artifacts/UI/HomePhase19-GroundedHero-Player.png`

## 画像生成記録

- モード：built-in image generation
- 保存先：`Assets/TRIAD/UI/Art/Props/HomeGoBoardForeground-v1.png`
- 最終プロンプト：

```text
Use case: stylized-concept
Asset type: transparent foreground prop for a portrait mobile game home screen
Input images: Image 1 is the composition, material and premium Japanese fantasy style reference; Image 2 is the scene lighting and color-palette reference.
Primary request: Create only a wide Japanese Go board/table foreground overlay that can sit across the lower edge of the heroine area and naturally conceal the character's feet, matching the premium commercial Japanese fantasy game aesthetic of Image 1.
Subject: a low, wide dark lacquered wooden Go board viewed from a slightly elevated frontal angle, with a precise Go grid and a tasteful scattering of black and white stones; substantial dark wooden front edge with restrained antique-gold trim.
Style/medium: highly polished Japanese fantasy game asset, painterly realism, sharp material detail, premium mobile game quality.
Composition/framing: wide horizontal landscape asset; board spans nearly the full canvas width; top playing surface occupies the middle-lower part; transparent empty space above; clean silhouette suitable for cropping to a shallow foreground strip.
Lighting/mood: cool moonlit blue-violet rim light from the upper right, soft warm lantern reflection from the lower left, restrained contrast so it blends into a dark navy shrine-night background.
Color palette: deep brown-black lacquer, muted antique gold, warm amber highlights, cool indigo shadows.
Materials/textures: visible fine wood grain, subtle lacquer sheen, convincing stone reflections, elegant worn gold edging.
Constraints: genuinely transparent background and transparent area above/around the board; isolated prop only; no character, no hands, no room, no scenery, no UI, no text, no logo, no watermark; keep the full left and right edges of the board inside the canvas.
Avoid: floating board, bright studio lighting, thick ornate clutter, exaggerated perspective, cropped edges, opaque or black background.
```

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 19コミットで記録
