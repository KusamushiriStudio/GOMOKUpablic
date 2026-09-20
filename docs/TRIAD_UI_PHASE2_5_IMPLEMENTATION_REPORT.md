# TRIAD UI段階実装報告 — Home Phase 2–5

## 対象番号

12–33

## 今回使用したツール

- Figma Starter：Phase 1の既存Design SystemとHeaderを参照。MCP操作回数上限のためPhase 2–5書き込みは保留。
- Unity 6.3：uGUI Runtime、Prefab/Scene自動生成Editor拡張、390×844表示。
- Blender：今回の対象は2DホームUIのため未使用。
- Rive：Phase 9以降のため未使用。

## 実装内容

- Player Status：名前、Lv、EXP、段位、称号、プロフィールアイコン。100XP単位のWeb版仕様に一致。
- Hero Area：背景、差し替え可能なキャラID、ヒバナ用ベクター表示、役割、固有技、詳細・衣装ショートカット。
- Story Banner：新章・告知・通常状態、クリア数/総数、次ステージ、進捗率、カルーセル表示。
- Main CTA：対戦・物語、通常・押下・無効色、既存Web遷移に対応するBattle/Storyイベント契約。
- 操作保護：遷移中の二重タップ拒否、完了後の再有効化、ホームでの戻る操作は無遷移。
- 独立構造：各領域を個別Prefabとして生成するBuilderを追加。

## データ接続

`TriadHomeSnapshot`を表示契約とし、保存・バックエンド側から取得した値を`ApplySnapshot`で一括反映できる。View内へユーザーデータを固定していない。

## キャラクター画像規則

- 表示枠：190 × 262 UI px
- 現在：解像度非依存のUnityベクターGraphic
- 最終イラスト差し替え時：透過PNGまたはWebP、推奨原稿760 × 1048（表示の4倍）
- キャラIDを保ったままPortrait層だけ差し替え、情報・ボタン・背景とは統合しない。

## 検証結果

- Unity Compile Error：0
- Runtime C#静的コンパイル：エラー0
- Editor Builder C#静的コンパイル：エラー0
- Unity EditMode：144/144成功
- Unity PlayMode：1/1成功（RenderTextureを使うためGPU有効バッチで確認）
- Web既存回帰テスト：102/102成功
- Windows Player Build：成功（Unity 6000.3.24f1）
- 390 × 844実表示：成功
- スクリーンショット：`Artifacts/UI/HomePhase5-Player.png`
- 目視確認：文字欠け、部品の重なり、画面外表示なし

## Unityへの反映

YES。以下を生成・統合した。

- `HomePlayerStatus.prefab`
- `HomeHeroArea.prefab`
- `HomeStoryBanner.prefab`
- `HomeMainCta.prefab`
- `HomePhase5.unity`

画面下部の空き領域は、未着手のPhase 6〜8を配置するために意図して確保している。

## 既存機能への影響

- Web版ロジック・画面には変更なし。
- ユーザー所有の`Assets/TRIADAssetTest/Scenes/AssetTestScene.unity`差分には未接触。
- 既存Phase 1 Headerを再利用する。

## 現時点の課金判断

判断保留。FigmaのMCP操作回数上限には実際に到達したが、課金は行っていない。Unity側のPhase 2〜5実装は無料ツールの範囲で完了したため、Figma同期は無料枠リセット後に同じDesign Systemへ反映する。

## 番号33時点の残件

- Unity実装・データ接続・操作保護・実表示確認：完了
- Figma Phase 2〜5同期：無料MCP枠の上限解除待ち
- Figma Professional契約：未実施、判断保留
