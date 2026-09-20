# TRIAD UI段階実装報告 — Phase 9

## 結論

54〜59番のRive小規模検証を完了した。Rive Unity Runtime v0.4.3と公式`.riv`サンプルを使い、ホーム選択タブだけにアニメーションを配置した。実行ログで`LOADED`を確認し、読み込み失敗時はPhase 8の静的選択状態を残す構造にした。

## 対象

- Phase：9
- 対象：ホーム選択状態のRiveマイクロアニメーション1件
- Unityへ反映：YES

## 今回使用したツール

- Figma：未使用（既存の無料版設計を維持）
- Unity：Unity 6000.3.24f1 / uGUI / Windows D3D11
- Blender：未使用
- Rive：Unity Runtime v0.4.3、公式`skills.riv`

## 無料 / 有料

- Unity：既存環境
- Rive Runtime：無料のMITライセンス
- Rive Editor：契約・ログイン・課金なし
- 有料Asset / Plugin：なし

## 今回実装したもの

- Homeタブ内に20〜28px相当のRive表示レイヤーを限定配置
- 金色・低不透明度で既存アイコン背面へ合成
- Riveレイヤーは入力を受けず、既存ボタン操作を保護
- `TriadRivePilotMonitor`でLoaded / Errorを監視
- Errorまたはタイムアウト時はRiveレイヤーだけ停止
- 静的なHome選択状態は常時維持
- Headerを最前面に固定し、Rive Canvas導入後も表示を保護

## テスト結果

- Unity Builder / Compile：PASS
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- Windows Player Build：PASS
- Rive runtime：`[TRIAD RIVE PILOT] LOADED`を確認
- 390 × 844実表示：PASS
- Compile Error：0
- 既存機能への影響：検出なし

## 完成イメージとの差

- 選択状態の動的レイヤーと静的フォールバック構造は完成
- 今回は技術検証用の公式サンプル素材であり、TRIAD専用の桜・金粒子モーションではない
- 本導入前にRive EditorでTRIAD専用の小型アニメーションを制作する必要がある

## 無料プランで困った点

- ランタイム導入とUnity再生には課金不要だった
- Rive EditorのWeb画面はこの環境で正常表示できなかったため、今回は公式サンプルでランタイム経路を検証した
- Windowsでは公式Git依存の取得が不安定だったため、検証時のみ同一v0.4.3をローカル展開した

## 有料版で改善できそうな点

- 今回の1演出検証に、有料機能が必要である根拠は確認されていない
- デザイナー共同編集、権限、運用規模が拡大した時点で再評価する

## 現時点で課金が必要か

NO

理由：無料ランタイムでUnity取込、再生、D3D11表示、フォールバックまで成立したため。

## 成果物

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase9.unity`
- Runtime監視：`Assets/TRIAD/UI/Runtime/TriadRivePilotMonitor.cs`
- Riveデータ：`Assets/TRIAD/UI/Rive/OfficialSkillsSample.riv`
- Screenshot：`Artifacts/UI/HomePhase9-Rive-Player.png`
- Test Results：`Artifacts/UI/phase9-editmode-results.xml`、`Artifacts/UI/phase9-playmode-results.xml`
- Runtime Log：`Logs/phase9-player.log`

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：Phase 9専用コミット

## 次に実装する小単位

Phase 10以降へ進む前に、Phase 1〜9のホーム画面を人間が確認する。Riveを継続採用する場合は、TRIAD専用の金粒子または桜の選択モーション1件へ公式サンプルを差し替える。
