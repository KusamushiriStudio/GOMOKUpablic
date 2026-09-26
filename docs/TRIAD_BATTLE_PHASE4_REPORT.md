# TRIAD Battle段階実装報告

Phase：Battle 4

対象：守護・凍結の盤面状態表示

## 実装内容

- 守護された碁石の足元へ、発光する金色の護輪を表示。
- 凍結中の交点へ、発光する青い結晶印を表示。
- 護輪と結晶印に脈動・回転を加え、静止画的にならないよう調整。
- スキル発動、通常配置、リセットのたびにCoreの対局状態から効果を再構築。
- 凍結期限を過ぎた印はターン進行に合わせて自動消去。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase37.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase4.unity`
- Effect Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleEffectPulse.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase4.exe`

## 次工程

Battle Phase 5：勝敗結果、再戦、ホーム復帰の終了導線を実装する。
