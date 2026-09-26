# TRIAD Battle段階実装報告

Phase：Battle 9

対象：対局画面の統合仕上げと検証契約

## 実装内容

- 対局UI全体をSafe Area配下へ整理し、ノッチ・ホームインジケーター領域へ対応。
- 画面サイズとSafe Area変更を検知して自動再配置。
- スキル、三席HUD、結果、対局記録、一時メニューの必須構成をBuilderで検証。
- Scene内のMissing Scriptを自動検出。
- Coreの三席手番と五連勝利を決定的な手順で検証する統合契約を追加。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase42.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase9.unity`
- Safe Area Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleSafeAreaFitter.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase9.exe`

## 次工程

Battle Phase 10：一人でも対局を確認できるCPU参加機能を追加する。
