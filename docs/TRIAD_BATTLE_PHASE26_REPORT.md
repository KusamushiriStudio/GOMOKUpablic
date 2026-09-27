# TRIAD Battle段階実装報告

Phase：Battle 26

対象：直前着手マーカー

## 実装内容

- 直前の着手・スキル対象位置へ金色マーカーを表示。
- 新しい操作が行われるたびにマーカー位置を更新。
- 新規対局ではマーカーを初期化。
- 中断対局の復元時も、再実行された最後の操作位置を表示。
- 通常時は控えめな脈動を付与し、演出軽減ON時は静止表示。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase59.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase26.unity`
- Marker Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleLastMoveIndicator.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase26.exe`

## 次工程

Battle Phase 27：盤面座標ガイドとタップ位置フィードバックを追加する。
