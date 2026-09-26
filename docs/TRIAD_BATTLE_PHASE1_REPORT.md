# TRIAD Battle段階実装報告

Phase：Battle 1

対象：ホームから三人対戦Sceneへの接続と基本着手ループ

## 実装内容

- Home Phase 33を基に、実Scene遷移を持つ`HomePhase34`を作成。
- ホームの「対戦する」ボタンを`BattlePhase1`へ接続。
- Blender 5.2.2 LTSで生成済みの11×17盤FBXを専用Battle Sceneへ配置。
- Blender製碁石メッシュを三人分の黒・白・赤として再利用。
- 11列×17行、合計187交点へタップ着手できる入力処理を実装。
- `TRIAD.Core.RuleEngine`へ着手を渡し、席1→席2→席3の手番を進行。
- 占有交点、手番、対局終了を既存Coreルールで判定。
- 五連完成時の勝者表示、気力表示、再戦、ホームへ戻る操作を実装。
- 未実装のホーム遷移先は操作ロックを解除し、画面を止めない構造とした。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase34.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase1.unity`
- Battle Runtime：`Assets/TRIAD/Battle/Runtime/TriadBattleBoardController.cs`
- Home Router：`Assets/TRIAD/UI/Runtime/TriadHomeSceneRouter.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase1.exe`

## Blender連携

- 盤：`Assets/TRIADAssetTest/Models/Incoming/board_blockout.fbx`
- 碁石：`Assets/TRIADAssetTest/Models/Incoming/stones_blockout.fbx`
- 既存AssetTest Sceneの未コミット差分は変更していない。

## 現在の検証

- Unity Compile Error：0
- Battle Phase 1 Builder検証：PASS
- Home＋BattleのWindows 64-bit Player build：PASS
- Blender盤、28本の罫線、碁石メッシュ、戻る・再戦ボタンを自動検査

ユーザー指示に従い、総合的な見た目チェックと全回帰テストは後工程でまとめて行う。

## 無料／有料

Unity、既存Blender FBX、既存Coreロジックのみを使用。追加課金なし。

## 次工程

Battle Phase 2：対局HUD、三人のキャラクター情報、スキル選択UI、着手演出を実装する。
