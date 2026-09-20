# TRIAD UI段階実装報告

Phase：20（ホーム物語進捗削除）
対象：ホーム画面の物語進捗バナー

## 今回使用したツール

- Unity 6000.3.24f1
- Figma：未使用
- Blender：未使用
- Rive：既存実装を維持

## 無料 / 有料

- Unity Personal：無料
- 有料機能・有料Asset：未使用

## 今回実装したもの

- 「第5段」「4/30段」などを表示する物語進捗バナーをホーム画面から削除
- 空いた100px分を詰め、対戦・物語ボタン、サブメニュー、交流欄を上へ移動
- ホームのスクロール領域を819pxから711pxへ短縮
- 物語画面へ移動する青い「物語」ボタンは維持

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase20.unity`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase20Builder.cs`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase20.exe`

## テスト結果

- Compile Error：0
- Windows Player Build：成功（111,115,573 bytes）
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- 物語進捗表示：0件
- 物語遷移ボタン：維持

## 既存機能への影響

- 物語ルート、対戦、サブメニュー、ボトムナビの機能を維持
- セーブデータ内の物語進捗値は削除せず、ホームで表示しないだけの変更
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 物語進捗による縦方向の圧迫を解消
- キャラクターから主要CTAへの流れが短くなり、サブメニューも初期画面内で確認可能

## 無料プランで困った点

- なし

## 有料版で改善できそうな点

- なし

## 現時点で課金が必要か

NO

## 次に実装する小単位

- メインCTAとサブメニューの画像・文字階層を参考画像へ近づける

## スクリーンショット

- `Artifacts/UI/HomePhase20-NoStoryProgress-Player.png`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 20コミットで記録
