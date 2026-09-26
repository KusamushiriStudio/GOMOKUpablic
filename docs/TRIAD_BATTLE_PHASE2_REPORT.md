# TRIAD Battle段階実装報告

Phase：Battle 2

対象：三人分の対局HUDと着手アニメーション

## 実装内容

- 席1「ヒバナ」、席2「ユキネ」、席3「クオン」の状態パネルを追加。
- 各席の手番／待機／勝者と、気力0〜6をリアルタイム表示。
- 現在手番のパネルを金枠・暖色背景で強調。
- Coreの`MatchState`更新イベントとHUDを接続。
- 碁石を上方から落とし、拡大と小さな弾みを伴って盤へ着地させる演出を追加。
- Home Phase 35の対戦ボタンからBattle Phase 2へ接続。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase35.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase2.unity`
- HUD：`Assets/TRIAD/Battle/Runtime/TriadBattleSeatHud.cs`
- 着手演出：`Assets/TRIAD/Battle/Runtime/TriadPlacedStoneMotion.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase2.exe`

## 次工程

Battle Phase 3：スキル選択UIと、火花・守護・凍結などCoreスキルの対象選択を盤面へ接続する。
