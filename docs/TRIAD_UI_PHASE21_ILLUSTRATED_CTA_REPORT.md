# TRIAD UI段階実装報告

Phase：21（絵付きメインCTA）
対象：対戦・物語ボタン

## 実装結果

- 対戦：紅い月、神社、碁盤、黒白の碁石を使った背景画を追加
- 物語：青い月夜、神社、滝、桜を使った背景画を追加
- 文字は画像へ焼き込まずUnity Textを維持
- 暗幕、文字Outline、金枠で可読性を確保
- Buttonと既存の押下演出を維持
- 物語進捗バナーは非表示のまま維持

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase21.unity`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase21Builder.cs`
- Assets：`Assets/TRIAD/UI/Art/CTA/`
- Screenshot：`Artifacts/UI/HomePhase21-IllustratedCTA-Player.png`

## 検証

- Compile Error：0
- Windows Player Build：成功
- 390×844実画面：表示成功
- 無料ツールのみ使用、課金不要

## 画像生成記録

- モード：built-in image generation
- 保存先：`BattleCtaBackground-v1.png`、`StoryCtaBackground-v1.png`
- Battle最終プロンプト：`High-end Japanese fantasy mobile-game battle CTA background; dramatic crimson shrine night, black and white Go stones over a faint Go grid, dark quiet center for live text; artwork only, no text, border, logo, watermark or character.`
- Story最終プロンプト：`High-end Japanese fantasy mobile-game story CTA background; blue-indigo moonlit shrine, pagoda, torii, waterfall, cherry petals and subtle Go-grid motif, dark quiet center for live text; artwork only, no text, border, logo, watermark or character.`

## 次工程

- 4つのサブメニューを絵付きカードへ変更

