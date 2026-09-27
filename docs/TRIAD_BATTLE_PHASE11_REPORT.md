# TRIAD Battle段階実装報告

Phase：Battle 11

対象：対局開始前のモード選択

## 実装内容

- 対局Sceneへ入った直後にモード選択オーバーレイを表示。
- 「一人で対戦」は席2・席3をCPUに設定。
- 「三人ローカル」は三席すべてを人が順番に操作。
- 選択前は盤面入力を遮断し、誤操作を防止。
- 現在のモードを盤面上部の小型バッジへ反映。
- 対局を開始せずホームへ戻れる導線を追加。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase44.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase11.unity`
- Mode Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleModeSelector.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase11.exe`

## 次工程

Battle Phase 12：オンライン対戦へ接続するための対局セッション境界を追加する。
