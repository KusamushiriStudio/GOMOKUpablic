# TRIAD UI段階実装報告

Phase：31

対象：画面遷移要求後の状態表示と二重操作防止の可視化

## 実装内容

- 既存の`TriadHomeNavigationGate`による二重遷移防止を維持。
- 対戦、物語、世界、ガチャ、着せ替え、キャラ強化、交流の遷移要求時に、移動先名を含む状態表示を追加。
- 表示例：「対戦へ移動中…」「ガチャへ移動中…」。
- 遷移完了通知で表示を解除し、各ボタンを再び操作可能にする。
- 状態表示は入力を受けず、実際のScene遷移実装と分離した。

## 無料／有料

Unity標準機能のみ。追加課金なし。

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase31.unity`
- Runtime：`Assets/TRIAD/UI/Runtime/TriadRouteTransitionIndicator.cs`
- Controller：`TriadHomeScreenController.NavigationCompleted`

## 次工程

Phase 32：背景とキャラクターの間・手前をつなぐ軽量な桜花びら演出を追加する。
