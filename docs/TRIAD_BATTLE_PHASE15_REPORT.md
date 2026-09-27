# TRIAD Battle段階実装報告

Phase：Battle 15

対象：通信アダプター境界

## 実装内容

- 接続、送信、切断をゲームロジックから分離するTransport契約を追加。
- セッションジャーナルを送信用JSONへ変換するCoordinatorを追加。
- 現在は未設定Transportを使用し、誤って外部送信しない。
- URL、APIキー、秘密情報、ダミーの接続成功処理は追加していない。
- 実バックエンド選定後にTransport実装だけを差し替えられる構造とした。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase48.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase15.unity`
- Transport Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleTransport.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase15.exe`

## 次工程

Battle Phase 16：Coreの結果保存契約へローカル対局結果を接続する。
