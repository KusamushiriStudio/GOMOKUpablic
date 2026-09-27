# TRIAD Battle段階実装報告

Phase：Battle 13

対象：オンライン入口と接続状態表示

## 実装内容

- モード選択へオンライン対戦入口を追加。
- セッション状態を盤面上部へ常時表示。
- 実サーバー未設定時は「未接続」と明示。
- オンライン入口を押した場合、接続設定がない理由とローカル代替を案内。
- 接続済みと見せかけるダミーマッチングは実装していない。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase46.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase13.unity`
- Status Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleSessionStatusView.cs`
- Online Gate：`Assets/TRIAD/Battle/Runtime/TriadBattleOnlineGate.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase13.exe`

## 次工程

Battle Phase 14：通信再開に使える対局アクション連番とジャーナルを追加する。
