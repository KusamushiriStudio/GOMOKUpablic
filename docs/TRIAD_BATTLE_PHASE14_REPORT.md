# TRIAD Battle段階実装報告

Phase：Battle 14

対象：対局アクション連番とセッションジャーナル

## 実装内容

- 通常着手・スキルへセッション内連番を付与。
- 席、アクション種別、スキル、移動元、対象座標を記録。
- 再戦・セッション変更時に連番を初期化。
- 将来の送信、再接続、リプレイで利用できるJSON出力を追加。
- 現在の同期カーソルを`SYNC #n`として画面へ表示。
- 現時点では外部サーバーへ送信せず、ローカルメモリ内だけで保持。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase47.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase14.unity`
- Journal Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleSessionJournal.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase14.exe`

## 次工程

Battle Phase 15：実バックエンド選定後、セッション作成・参加APIへジャーナルを接続する。
