# TRIAD UI段階実装報告

Phase：16（Story Banner品質向上）
対象：背景美術付き章告知カード、文字可読性、金装飾

## 今回使用したツール

- Unity 6000.3.24f1：背景クロップ、uGUIレイヤー、文字・金枠調整、Windowsプレイヤー確認
- 既存TRIAD背景素材：`HomeNightShrine-v1.png`
- Figma：未使用（既存レイアウト内の小単位改善）
- Blender：未使用（2D UI工程のため）
- Rive：Phase 9のホーム選択演出を維持

## 無料 / 有料

- Unity Personal：無料
- Figma Starter：無料、今回は未使用
- Rive Runtime：無料範囲、既存実装を維持
- Blender：無料、今回は未使用
- 有料Asset／有料プラン：未使用

## 今回実装したもの

- Story Bannerへ夜の神社と灯籠の背景美術を追加
- 背景画像をカード比率に合わせて独立クロップ
- 背景と文字の間へ半透明スクリーンを追加
- 章タイトル、副題、進捗、カルーセル、矢印の情報階層を再調整
- `月下に響く、新たな碁印`の副題を追加
- タイトルと矢印へ暗色アウトラインを追加
- 矢印専用の小型プレートと金枠を追加
- 四隅と中央へ細い金装飾を追加
- 画像、文字、進捗、装飾を独立操作可能なレイヤーとして維持

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase16.unity`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase16Builder.cs`
- Background：`Assets/TRIAD/UI/Art/Backgrounds/HomeNightShrine-v1.png`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase16.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- 背景美術、可読性スクリーン、金装飾、副題を確認
- 背景・装飾レイヤーは入力を遮断しない
- 既存の操作ボタン18個以上を保持

## 既存機能への影響

- 既存Story Bannerのデータバインドと進捗表示を維持
- 既存ゲームロジックと画面遷移イベントの変更なし
- Phase 1〜15のHeader、中央ヒバナ、Main CTA、メニュー、Rive演出を維持
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 平坦な紺色カードから、背景美術を持つ章告知カードへ改善済み
- 専用の新章キャラクターイラストと左右カルーセル操作は未実装
- 現在は既存背景素材を再利用しており、章ごとの専用画像差し替え機構は未実装
- 最終筆文字フォントと告知切り替えアニメーションは未実装

## 無料プランで困った点

- 今回は既存素材とUnity無料範囲だけで実装でき、停止要因なし

## 有料版で改善できそうな点

- 現時点で有料ツールが必須となる具体的制限なし
- 章ごとの専用イラストを量産する段階で制作方法と費用を比較する

## 現時点で課金が必要か

NO

## 次に実装する小単位

- 推奨：Sub Menu（世界／ガチャ／着せ替え／キャラ強化）へ画像サムネイルと可読性スクリーンを追加

## スクリーンショット

- `Artifacts/UI/HomePhase16-StoryBanner-Player.png`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 16コミットで記録
