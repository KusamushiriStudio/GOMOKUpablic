# TRIAD Battle段階実装報告

Phase：Battle 6

対象：対局開始・手番切替の視覚／音響フィードバック

## 実装内容

- 対局開始時に先手名を表示する横長バナーを追加。
- 各着手・スキル後に、次のキャラクター名を短時間表示。
- バナーを右から滑り込ませ、表示後に自然にフェードアウト。
- 外部音源を増やさず、短い二音チャイムを実行時に生成。
- 勝敗結果オーバーレイより手前へ出ない描画順を維持。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase39.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase6.unity`
- Feedback Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleTurnFeedback.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase6.exe`

## 次工程

Battle Phase 7：着手とスキルの直近履歴を対局画面に追加する。
