# TRIAD UI段階実装報告

Phase：30

対象：縦スクロール案内と下部Communityへの到達性

## 実装内容

- Bottom Navigationの直上へ「上へスワイプ」案内を追加。
- 案内は金縁・濃紺の小型ピル形状とし、主要ボタンを隠さない位置へ固定。
- 未操作時は上下へわずかに動き、スクロール開始後34px以内で滑らかに消える。
- 案内は入力を受けず、既存のドラッグ・ホイール・ボタン操作を妨げない。
- Player Codeを含む下部Communityへスクロールできる既存構造を維持。

## 無料／有料

Unity標準機能のみ。追加課金なし。

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase30.unity`
- Runtime：`Assets/TRIAD/UI/Runtime/TriadScrollCue.cs`

## 次工程

Phase 31：遷移要求後の操作ロックを画面上でも分かる状態表示へ接続する。
