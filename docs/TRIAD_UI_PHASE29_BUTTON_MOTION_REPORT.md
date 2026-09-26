# TRIAD UI段階実装報告

Phase：29

対象：Main CTA／Sub Menuの押下マイクロアニメーション

## 実装内容

- 対戦・物語・世界・ガチャ・着せ替え・キャラ強化の6ボタンへ共通押下演出を追加。
- 押下時にボタン本体、台座、紋章、立体装飾が一体で2px沈む。
- 押下時は98.5%へ縮小し、機能別カラーの背面発光を強める。
- 選択状態、ポインター離脱、無効化、再有効化時に表示が正しく戻る構造とした。
- 演出レイヤーは入力を受けず、既存Buttonと遷移イベントを維持する。

## 無料／有料

Unity標準機能のみ。追加課金なし。

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase29.unity`
- Runtime：`Assets/TRIAD/UI/Runtime/TriadSculptedButtonFeedback.cs`

## 完了条件

- 6ボタンへ共通演出を適用
- 装飾を含む6パーツ以上が連動
- 既存Button、ラベル、遷移を保持
- Compile Error 0、ビルド・実表示・回帰テストで確認

## 次工程

Phase 30：下部コンテンツが続くことを明示するスクロール案内を追加する。
