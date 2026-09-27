# TRIAD Battle段階実装報告

Phase：Battle 21

対象：中断対局チェックポイント

## 実装内容

- 一人用・三人ローカル対局の着手履歴を端末内へ自動保存。
- セッションID、対局形式、保存時刻、行動順を一つのチェックポイントとして保持。
- 新規対局開始時は古い履歴を上書き。
- 対局終了時は不要になった中断チェックポイントを削除。
- 不正または不完全な保存データを復元候補から除外。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase54.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase21.unity`
- Checkpoint Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleCheckpointStore.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase21.exe`

## 次工程

Battle Phase 22：保存した中断対局をモード選択画面から復元できるようにする。
