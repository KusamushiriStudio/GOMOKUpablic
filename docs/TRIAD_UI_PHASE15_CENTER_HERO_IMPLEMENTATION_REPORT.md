# TRIAD UI段階実装報告

Phase：15（キャラクター中央正面配置）
対象：ヒバナの主役配置と右側キャラクター情報カード

## 今回使用したツール

- 参考画像：ユーザー提示の中央キャラクター構成
- Unity 6000.3.24f1：配置、描画順、可読性調整、Windowsプレイヤー確認
- Figma：未使用（ユーザー指定による小単位配置修正）
- Blender：未使用（2Dキャラクター工程のため）
- Rive：Phase 9のホーム選択演出を維持

## 無料 / 有料

- Unity Personal：無料
- Figma Starter：無料、今回は未使用
- Rive Runtime：無料範囲、既存実装を維持
- Blender：無料、今回は未使用
- 有料Asset／有料プラン：未使用

## 今回実装したもの

- ヒバナをヒーロー領域の中央へ移動
- 顔、髪飾り、衣装、足元が切れない全身表示倍率へ調整
- キャラクター情報カードを左側から右側へ移動
- 情報カード、スキル、詳細／衣装ボタンをキャラクターより前面へ固定
- 狭い情報カードに合わせて主見出し、補助文字、ボタン文字のサイズと配置を調整
- Phase 15シーン内だけヒーローPrefabを展開し、描画順を確実に保持
- 元のヒーローPrefab本体は変更していない

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase15.unity`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase15Builder.cs`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase15.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- キャラクター中心位置：ヒーロー領域中央183px、誤差1px以内
- キャラクター倍率：顔を切らない上限内
- 情報カード：キャラクターより前面
- 既存の操作ボタン18個以上を保持

## 既存機能への影響

- 既存ゲームロジックと画面遷移イベントの変更なし
- 詳細／衣装ボタンのButtonとイベント構造を維持
- Phase 1〜14のHeader、Player Status、Story、Main CTA、メニュー、Rive演出を維持
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 参考画像と同様に、キャラクターを背景中央の主役として配置済み
- 現在のヒバナは立ち絵であり、参考画像の座りポーズや碁盤との接地表現とは異なる
- キャラクター固有コピー、表情差分、待機モーションは未実装
- 右側情報カードは操作優先の小型構成で、最終的な筆文字・漆素材は未調整

## 無料プランで困った点

- 今回の中央配置と情報カード再配置はUnity無料範囲で実装でき、停止要因なし

## 有料版で改善できそうな点

- 現時点で有料ツールが必須となる具体的制限なし
- 座りポーズなど新規キャラクター差分が必要な場合は、素材制作方法を別工程で比較する

## 現時点で課金が必要か

NO

## 次に実装する小単位

- 推奨：Story Bannerを画像付き告知カードへ高品質化

## スクリーンショット

- `Artifacts/UI/HomePhase15-CenterHero-Player.png`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 15コミットで記録
