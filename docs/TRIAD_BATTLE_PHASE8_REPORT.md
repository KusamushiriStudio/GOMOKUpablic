# TRIAD Battle段階実装報告

Phase：Battle 8

対象：一時メニューと対局中断導線

## 実装内容

- 盤面右上へ小型の対局メニューボタンを追加。
- メニュー表示中は盤面入力とスキル選択をロック。
- 勝利条件とスキル状態表示の簡易ルール説明を追加。
- 「対局へ戻る」「最初から再戦」「ホームへ」を追加。
- 勝敗確定後はメニューを無効化し、結果画面を優先。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase41.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase8.unity`
- Pause Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattlePauseOverlay.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase8.exe`

## 次工程

Battle Phase 9：対局画面の統合仕上げと、最終チェック向けの自動テストを追加する。
