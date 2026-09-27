# TRIAD Battle段階実装報告

Phase：Battle 29

対象：無効操作フィードバック

## 実装内容

- 盤外タップと交点から外れたタップへ理由を表示。
- 占有済み、手番違い、気力不足、使用回数超過、守護、凍結などの失敗理由を警告トーストで表示。
- 対象座標が存在する場合は盤面へ短時間の赤色マーカーを表示。
- 既存のステータス表示と同じエラーメッセージを使用。
- 演出軽減ON時はフェードを省略。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase62.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase29.unity`
- Feedback Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleInvalidInputFeedback.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase29.exe`

## 次工程

Battle Phase 30：対局開始前にルールと選択モードを最終確認できる画面を追加する。
