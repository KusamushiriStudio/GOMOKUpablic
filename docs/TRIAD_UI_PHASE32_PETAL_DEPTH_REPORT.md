# TRIAD UI段階実装報告

Phase：32

対象：桜花びらによる背景・キャラクター・前景の奥行き統合

## 実装内容

- Hero Areaへ中景7枚・前景5枚、合計12枚の軽量な桜花びらを追加。
- 中景は小さく薄く、前景は大きく明るくして距離差を表現。
- 落下、左右の揺れ、回転速度を花びらごとに変え、同じ動きの反復感を抑制。
- 画面外へ落ちた花びらはHero Area上部へ再配置して再利用する。
- 花びらは入力を受けず、背景・キャラクター・碁盤・ボタンを独立要素のまま維持。

## 性能方針

- 画像テクスチャとParticle Systemを追加せず、既存uGUI Graphicだけで構成。
- 12要素に限定し、オブジェクトの生成破棄を実行中に行わない。

## 無料／有料

Unity標準機能のみ。追加課金なし。

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase32.unity`
- Runtime：`Assets/TRIAD/UI/Runtime/TriadPetalDrift.cs`

## 次工程

Phase 33：終盤統合シーン、Windows Player、縦画面キャプチャ、全回帰テストを確定する。
