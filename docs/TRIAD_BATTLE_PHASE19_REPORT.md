# TRIAD Battle段階実装報告

Phase：Battle 19

対象：音声・演出軽減のアクセシビリティ設定

## 実装内容

- 対局メニューへ音声ON/OFFを追加。
- 対局メニューへ演出軽減ON/OFFを追加。
- 設定を端末内へ保存し、次回起動後も維持。
- 音声OFF時は手番チャイムを停止。
- 演出軽減ON時は石の着手アニメーション、盤面エフェクトの回転・脈動、手番バナーの移動量を抑制。
- Phase 15の通信境界コンポーネントをUnityの命名規則に合うファイルへ分離し、Missing Scriptを解消。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase52.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase19.unity`
- Accessibility Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleAccessibilitySettings.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase19.exe`

## 次工程

Battle Phase 20：スマートフォンの戻る操作とアプリ中断時の安全な一時停止を追加する。
