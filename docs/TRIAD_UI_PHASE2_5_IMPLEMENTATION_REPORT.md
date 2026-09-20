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

- Runtime C#静的コンパイル：エラー0
- Editor Builder C#静的コンパイル：エラー0
- Web既存回帰テスト：102/102成功
- Unity自動生成・実表示・スクリーンショット：未完了

## 未完了理由

前日から残っている画面なしUnityプロセスがライセンスサービスを保持しており、新しいUnityバッチがライセンス初期化で停止する。対象プロセスの強制終了は、未保存作業の可能性を完全には排除できないため自動実行していない。

## 既存機能への影響

- Web版ロジック・画面には変更なし。
- ユーザー所有の`Assets/TRIADAssetTest/Scenes/AssetTestScene.unity`差分には未接触。
- 既存Phase 1 Headerを再利用する。

## 現時点の課金判断

判断保留。Figmaの制限は実際に到達したが、Unity側の検証完了前であり、まだ課金判断に必要な比較材料が不足している。
