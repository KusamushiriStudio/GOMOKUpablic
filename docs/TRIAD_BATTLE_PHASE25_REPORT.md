# TRIAD Battle段階実装報告

Phase：Battle 25

対象：対局終了確認

## 実装内容

- 対局メニューの「ホームへ」に終了確認画面を追加。
- 「終了する」と「対局へ戻る」を明確に分離。
- キャンセル時は対局盤面へ安全に復帰。
- 終了確定時だけ中断対局チェックポイントを削除。
- 誤タップによる進行中対局の消失を防止。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase58.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase25.unity`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase25.exe`

## 次工程

Battle Phase 26：盤面へ直前の着手位置を示すマーカーを追加する。
