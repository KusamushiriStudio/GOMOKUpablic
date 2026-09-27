# TRIAD Battle段階実装報告

Phase：Battle 30

対象：対局開始前の最終確認

## 実装内容

- 一人用・三人ローカル選択後に確認画面を表示。
- 操作する席、CPU席、手番順、勝利条件を開始前に明示。
- 「この内容で開始」と「選び直す」を分離。
- 確定前はセッションを作成せず、盤面入力もロックしたまま維持。
- 中断対局の再開は保存済み条件を優先し、確認画面を経由せず復元。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase63.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase30.unity`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase30.exe`

## 次工程

Battle Phase 31：勝利した五連を盤面上で強調表示する。
