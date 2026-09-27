# TRIAD Battle段階実装報告

Phase：Battle 20

対象：スマートフォンの戻る操作とアプリ中断時の安全な一時停止

## 実装内容

- Androidの戻る操作とPCのEscapeキーを同じナビゲーションとして実装。
- 対局中の戻る操作で一時停止メニューを開閉。
- モード選択前または対局終了後の戻る操作でホームへ遷移。
- チュートリアル表示中は誤操作による終了を抑止。
- アプリのバックグラウンド移行・フォーカス喪失時に進行中の対局を自動停止。
- 対局画面では60fpsを目標とし、端末の自動スリープを抑止。画面終了時に元の設定へ復元。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase53.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase20.unity`
- Lifecycle Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleLifecycleController.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase20.exe`

## 次工程

Battle Phase 21：対局状態の復元準備と中断セッション管理を追加する。
