# TRIAD UI段階実装報告

Phase：13（Main CTA品質向上）
対象：対戦／物語ボタンの材質感、押下状態、控えめな発光

## 今回使用したツール

- Unity 6000.3.24f1：uGUI装飾、入力フィードバック、Windowsプレイヤー確認
- Figma：未使用（既存の確定レイアウトと文言を維持）
- Blender：未使用（2D UI工程のため）
- Rive：Phase 9のホーム選択演出を維持

## 無料 / 有料

- Unity Personal：無料
- Figma Starter：無料、今回は未使用
- Rive Runtime：無料範囲、既存実装を維持
- Blender：無料、今回は未使用
- 有料Asset／有料プラン：未使用

## 今回実装したもの

- 対戦ボタン：橙色の背面グロー、内側金枠、上辺ハイライト、下辺の奥行き
- 物語ボタン：濃紺の材質を保った寒色グロー、内側金枠、上辺ハイライト、下辺の奥行き
- `TriadCtaPressFeedback`：押下時の約2.5%沈み込みとグロー強調
- ポインター退出、選択解除、無効化時に安全に通常状態へ戻す処理
- 全装飾レイヤーのRaycastを無効化し、既存の画面遷移入力を保護
- 既存のラベル、サブラベル、配置、遷移イベントを維持

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase13.unity`
- Runtime：`Assets/TRIAD/UI/Runtime/TriadCtaPressFeedback.cs`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase13Builder.cs`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase13.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- Main CTAのButton：2個を維持
- 押下フィードバック：2個を実装
- 背面グロー：2個、入力遮断なし
- 既存の操作ボタン18個以上を保持

## 既存機能への影響

- 既存ゲームロジックと画面遷移イベントの変更なし
- Phase 1〜12のUI、背景、ヒバナ、金装飾、Rive演出を維持
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 主要CTAは平面的なボタンから、二重縁と光量差を持つゲームUIへ改善済み
- Header、Player Status、Story Banner、Sub Menu、Bottom Navigationの材質統一は未完了
- ボタン押下時の音、パーティクル、触覚フィードバックは未実装
- 最終フォントと一部アイコンは追加改善が必要

## 無料プランで困った点

- 今回の材質表現と押下フィードバックはUnity無料範囲で実装でき、停止要因なし

## 有料版で改善できそうな点

- 現時点で有料ツールが必須となる具体的制限なし
- 静的な材質と基本入力演出はUnity標準機能で代替できている

## 現時点で課金が必要か

NO

## 次に実装する小単位

- 推奨：Story Bannerの紙・漆・金縁の材質感と「新章」視認性を高品質化

## スクリーンショット

- `Artifacts/UI/HomePhase13-MainCTA-Player.png`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 13コミットで記録
