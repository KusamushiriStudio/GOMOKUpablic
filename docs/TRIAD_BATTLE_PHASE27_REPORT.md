# TRIAD Battle段階実装報告

Phase：Battle 27

対象：盤面座標ガイドとタップ位置表示

## 実装内容

- 11列をA〜K、17行を1〜17として盤面周辺へ座標ガイドを追加。
- 有効な交点をタップした瞬間に「選択 A9」の形式で座標を表示。
- スキルの移動元・対象選択でも同じ座標フィードバックを使用。
- 通常時は短いフェード表示、演出軽減ON時は即時消去。
- 対局ログ、共有結果、中断復元と同じ座標表記へ統一。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase60.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase27.unity`
- Coordinate Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleCoordinateFeedback.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase27.exe`

## 次工程

Battle Phase 28：全着手を確認できる対局ログ画面を追加する。
