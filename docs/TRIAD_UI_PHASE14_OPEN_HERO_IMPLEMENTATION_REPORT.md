# TRIAD UI段階実装報告

Phase：14（背景直結ヒーロー構成）
対象：ヒバナと背景の間にあった大きな紺色パネルの撤去、局所的な可読性確保

## 今回使用したツール

- 参考画像：ユーザー提示のTRIADホーム画面完成イメージ
- Unity 6000.3.24f1：uGUI構成変更、表示調整、Windowsプレイヤー確認
- Figma：未使用（ユーザー指定による小単位修正）
- Blender：未使用（2D UI工程のため）
- Rive：Phase 9のホーム選択演出を維持

## 無料 / 有料

- Unity Personal：無料
- Figma Starter：無料、今回は未使用
- Rive Runtime：無料範囲、既存実装を維持
- Blender：無料、今回は未使用
- 有料Asset／有料プラン：未使用

## 今回実装したもの

- `HomeHeroArea`全体の紺色塗りを透明化
- ヒーロー領域全体の金外枠と角装飾を非表示化
- ヒバナを夜桜・神社背景へ直接重ねるオープン構成
- キャラクター表示領域を拡大し、背景と一体化する配置へ調整
- キャラクター情報だけを保護する小型半透明カード
- キャラクター名、役割、見出しへ暗色アウトラインを追加
- 詳細／衣装ボタン、文字、スキル表示は独立操作可能な状態を維持
- UI開発方針へ、ボタン可読性と背景直結キャラクター構成を恒久基準として追加

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase14.unity`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase14Builder.cs`
- Policy：`docs/TRIAD_UI_ITERATIVE_DEVELOPMENT_POLICY.md`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase14.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- ヒーロー全体パネル：透明、外枠なし
- 全体金装飾：非表示
- 局所情報カード：入力遮断なし
- 既存の操作ボタン18個以上を保持

## 既存機能への影響

- 既存ゲームロジックと画面遷移イベントの変更なし
- Phase 1〜13のHeader、Player Status、Story、Main CTA、メニュー、Rive演出を維持
- Phase 12の金装飾コンポーネントは削除せず、再利用可能な状態で非表示化
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 参考画像と同様に、キャラクターと背景の間へ大きなパネルを置かない構成へ変更済み
- 参考画像にある左ショートカット、キャラクター変更カード、背景へ溶け込むコピーは未実装
- 現在の情報カードは機能優先の小型構成で、最終的な漆・和紙素材表現は未調整
- ボタンは文字コントラストと押下状態を確保済みだが、最終アイコンと筆文字フォントは未実装

## 無料プランで困った点

- 今回の構成変更と可読性改善はUnity無料範囲で実装でき、停止要因なし

## 有料版で改善できそうな点

- 現時点で有料ツールが必須となる具体的制限なし
- 最終フォントは商用ライセンスと端末収録サイズを確認して別途判断する

## 現時点で課金が必要か

NO

## 次に実装する小単位

- 推奨：Story Bannerを参考画像の告知カードに近づけ、画像・文字・進捗の可読性を両立する

## スクリーンショット

- `Artifacts/UI/HomePhase14-OpenHero-Player.png`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 14コミットで記録
