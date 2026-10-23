# TRIAD 残りゲーム画面 Phase 34–36 実装報告

## 結論

ホームから遷移できる物語、ガチャ、着せ替えの3画面をUnity uGUIで実装した。対戦 Phase 33は維持し、画面はすべて390×844の縦画面で独立パーツとして構成した。

## Phase 34

- 対象：物語画面
- 実装：第一章バナー、全30話の達成数、6話分の選択、解放／未解放、選択話の詳細、開始導線、ホームへ戻る
- 重要仕様：物語進捗はホーム画面へ戻さず、物語画面内だけに表示
- Unityへ反映：YES

## Phase 35

- 対象：ガチャ画面
- 実装：召喚札、装飾品28種、単発1／十一連10、SSR 3%／SR 12%／R 35%／N 50%、結果、収集数、ローカル保存
- 重要仕様：キャラクター本体はガチャ対象外。購入・課金処理なし
- Unityへ反映：YES

## Phase 36

- 対象：着せ替え画面
- 実装：ヒバナの高解像度プレビュー、衣装3枠、所有／未解放、衣装説明、装備保存
- 重要仕様：衣装は外見のみで対戦能力に影響しない
- Unityへ反映：YES

## 使用ツールと費用

- Unity：使用、無料範囲
- Figma：今回の3画面では新規接続なし
- Blender：今回の3画面は3D対象外
- Rive：今回の3画面では追加導入なし
- 現時点で新規課金：不要

## 検証

- Unityコンパイル：エラー0
- Windows Playerビルド：成功
- EditModeテスト：144 / 144 合格
- 参照解像度：390×844
- 既存対戦 Phase 33：ビルドへ継続収録
- Missing Script：各新規シーン0

## 成果物

- Windows実行版：`Artifacts/Game/Player/TRIADRemainingPhase36.exe`
- 物語：`Artifacts/Game/Player/Screenshots/StoryPhase34.png`
- ガチャ：`Artifacts/Game/Player/Screenshots/GachaPhase35.png`
- 着せ替え：`Artifacts/Game/Player/Screenshots/WardrobePhase36.png`
- テスト結果：`Artifacts/Tests/remaining-phase36-editmode.xml`

## 次の小単位

Phase 37 世界／オンライン、Phase 38 キャラクター強化、Phase 39 交流／フレンドを実装し、次の3フェーズとしてGitHubへプッシュする。
