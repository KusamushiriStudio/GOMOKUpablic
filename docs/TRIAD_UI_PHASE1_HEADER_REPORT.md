# TRIAD UI段階実装報告

## Phase

- Phase：Home Phase 1
- 対象：Header（TRIADロゴ、通貨、メール、通知）
- Figma正本：[TRIAD_GAME_UI](https://www.figma.com/design/Gd3ERxkz7aVNrEw60JYHkl)

## 今回使用したツール

- Figma：無料Starter
- Unity：Unity Personal 6000.3.24f1
- Blender：未使用（Headerは2D UIのため）
- Rive：未使用（マイクロアニメーション工程前のため）

## 今回実装したもの

- FigmaにHeader用の色、寸法、文字トークンを作成
- Figmaに再利用可能な `Home/TopHeader` コンポーネントを作成
- `01_Home` の390×844フレームへHeaderをx=12、y=47、366×45で配置
- Unity uGUIに同じ構造を独立パーツとして実装
- 通貨額と未読件数の動的更新APIを実装
- メールと通知のButtonおよびイベント接続口を実装
- 角丸、金枠、ロゴ、通貨、メール、通知アイコンをUnity上の編集可能な描画部品として実装
- 専用PrefabとSceneを生成

## Unityへ反映

YES

- Prefab：`Assets/TRIAD/UI/Prefabs/HomeTopHeader.prefab`
- Scene：`Assets/TRIAD/UI/Scenes/HomePhase1Header.unity`
- 基準解像度：390×844

## テスト結果

- Compile Error：0
- Unity構造検証：PASS
- Windows縦画面実描画：PASS
- EditMode：144/144 passed
- PlayMode：1/1 passed
- メールButton：存在確認済み
- 通知Button：存在確認済み

## 既存機能への影響

- UIを既存ゲームロジックから分離したため、ルール、ストーリー、ガチャ、保存等のロジック変更なし
- 既存の `AssetTestScene.unity` 未コミット差分は変更・コミット対象外
- 既存テスト全件成功

## 完成イメージとの差

- 構成、位置、寸法、色、金枠、表示内容はFigmaと一致
- WindowsプレビューではOS動的フォントを使用するため、Figmaの `Noto Serif JP` / `Noto Sans JP` と字幅がわずかに異なる
- iOS実機でのセーフエリアとHiragino系フォントの最終確認はMac mini工程で実施する

## 無料プランで困った点

- 現時点ではなし
- Starterの変数モードは1モードだが、今回の単一Darkテーマには支障なし

## 有料版で改善できそうな点

- 複数テーマや多数の変数モードを同時管理する段階ではProfessionalが候補
- Phase 1 HeaderだけではProfessionalの必要性は確認されていない

## 現時点で課金が必要か

NO

## 次に実装する小単位

- ユーザー確認後：Home Phase 2 Player Status
- 確認前には着手しない

## スクリーンショット

- `Artifacts/UI/HomePhase1Header-Player.png`
- 390×844のWindows実描画。生成物のためGit管理対象外。

## Git

- branch：`unity/bootstrap-sprint1a`
- Phase 1単位でコミットする
