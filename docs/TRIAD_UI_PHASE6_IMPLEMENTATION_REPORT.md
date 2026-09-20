# TRIAD UI段階実装報告

## 結論

Home Phase 6（34〜40番）はUnity実装・既存遷移契約への接続・テスト・実表示確認まで完了した。FigmaはStarter無料プランのMCP呼び出し上限が継続しているため、課金せず同期待ちとした。Phase 7には未着手。

## 実装結果

- Phase：Home Phase 6
- 対象：Sub Menu（世界・ガチャ・着せ替え・キャラ強化）
- 今回使用したツール：Unity、既存Web実装、Codex
- 無料 / 有料：Unity Personal、Figma Starter。新規課金なし
- Unityへ反映：YES

実装したもの：

- `HomeSubMenu.prefab`を独立Prefabとして追加
- 4項目を独立Button、独立ベクターアイコン、ラベル、補助ラベルへ分解
- ガチャの`NEW`通知状態をゲームデータから切り替え可能にした
- 既存画面キーとの表示契約を追加
  - 世界 → `online`
  - ガチャ → `gacha`
  - 着せ替え → `wardrobe`
  - キャラ強化 → `chars`
- 遷移開始後はMain CTAとSub Menuをまとめて無効化し、二重タップを防止
- `HomePhase6.unity`を追加し、通常Build Settingsの対象をPhase 6へ更新

## テスト結果

- Unityコンパイル / Builder検証：PASS
- Unity EditMode：144 / 144 PASS
- Unity PlayMode：1 / 1 PASS
- Web回帰テスト：102 / 102 PASS
- Windows Player Build：PASS（Unity 6000.3.24f1）
- 390 × 844実表示：PASS
- 文字切れ、重なり、画面外配置：目視上なし
- 既存機能への影響：回帰テスト上なし

## 完成イメージとの差

和風の濃紺・金・朱色、独立した操作部品、高級感のある枠線は維持できている。現段階のアイコンはUnity上のコード生成ベクターで、最終Figma正本への同期と、Riveによる選択演出は未実施。画面下部の空きはPhase 7〜8用に保持している。

## 外部ツール評価

- 無料プランで困った点：Figma StarterのMCP呼び出し上限によりPhase 6の正本同期を実行できない
- 有料版で改善できそうな点：MCP経由のFigma同期回数。ただし現時点では課金効果を実画面で比較できていない
- 現時点で課金が必要か：NO
- Blender：Phase 6は2D UIのため対象外
- Rive：Phase 9まで未導入

## 成果物

- Unity Scene：`Assets/TRIAD/UI/Scenes/HomePhase6.unity`
- Unity Prefab：`Assets/TRIAD/UI/Prefabs/HomeSubMenu.prefab`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase6.exe`
- スクリーンショット：`Artifacts/UI/HomePhase6-Player.png`
- テストログ：`Logs/home-phase6-editmode.xml`、`Logs/home-phase6-playmode.xml`

## 次に実装する小単位

Phase 7（41〜46番）Community：交流・プレイヤーコード。開始前にPhase 6の実画面確認を行う。

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：この報告を含むPhase 6単位のコミット
