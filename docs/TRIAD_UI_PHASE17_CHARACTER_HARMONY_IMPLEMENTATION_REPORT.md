# TRIAD UI段階実装報告

Phase：17（キャラクター品質・背景調和）
対象：ヒバナのポーズ、画質、背景とのコントラスト・濃淡、画面内の余白

## 今回使用したツール

- OpenAI組み込み画像生成：ヒバナv2の座りポーズ透過素材
- Unity 6000.3.24f1：非圧縮Import、背景合成、色・影・配置・スクロール領域調整
- 参考画像：ユーザー提示の中央キャラクター構成
- Figma：未使用（キャラクター素材とUnity合成の小単位工程）
- Blender：未使用（2Dキャラクター工程のため）
- Rive：Phase 9のホーム選択演出を維持

## 無料 / 有料

- Unity Personal：無料
- OpenAI組み込み画像生成：今回の環境で利用可能な範囲
- Figma Starter：無料、今回は未使用
- Rive Runtime：無料範囲、既存実装を維持
- Blender：無料、今回は未使用
- 有料Asset／有料プラン：未使用

## 今回実装したもの

- ヒバナの正面寄り座りポーズ
- 顔、目、髪、手、衣装刺繍、金具を高密度化
- 上方右側からの青い月光と、下方左側からの灯籠光を素材へ反映
- 過度な暖色を抑え、濃紺背景と調和する低彩度シャドウへ調整
- 透過PNGを新規`v2`として追加し、旧立ち絵`v1`を保持
- 1024×1536、32-bit ARGB、四隅Alpha 0を確認
- Unityでは非圧縮、sRGB、Alpha保持、MipMap無効、Clamp、BilinearでImport
- キャラクターへの暗色影を34%から22%へ軽減
- 色補正をほぼ白へ戻し、顔・白布・金具の階調を保持
- ヒーロー領域を290pxから360pxへ拡大
- Story Banner、Main CTA、Sub Menu、Communityを下へ移動
- スクロール領域を819pxへ拡張し、全ボタンを初期画面へ押し込まない構成へ変更

## Unityへ反映

YES

- Scene：`Assets/TRIAD/UI/Scenes/HomePhase17.unity`
- Character：`Assets/TRIAD/UI/Art/Characters/HibanaSeated-v2.png`
- Builder：`Assets/TRIAD/UI/Editor/TriadHomePhase17Builder.cs`
- Windows Player：`Artifacts/UI/Player/TRIADHomePhase17.exe`

## テスト結果

- Compile Error：0
- Windowsプレイヤービルド：成功
- 390×844実画面キャプチャ：成功
- EditMode：144 / 144 PASS
- PlayMode：1 / 1 PASS
- キャラクター中心位置：183px、誤差1px以内
- キャラクター領域：360px
- スクロールコンテンツ：819px
- キャラクター画像と影の両方へv2テクスチャを適用
- キャラクターと影は入力を遮断しない
- 既存の操作ボタン18個以上を保持

## 既存機能への影響

- 旧素材`HibanaFullBody-v1.png`は削除・上書きしていない
- 既存ゲームロジックと画面遷移イベントの変更なし
- 詳細／衣装ボタン、Story Banner、Main CTA、Sub Menu、Communityを維持
- 初期画面に収まらない下部メニューは既存スクロールで確認可能
- ユーザー編集中の `Assets/TRIADAssetTest/Scenes/AssetTestScene.unity` は変更・復元していない

## 完成イメージとの差

- 参考画像と同様の座りポーズ、中央主役配置、背景へ馴染む光源方向へ改善済み
- 参考画像の碁盤、机との接地、背景内の人物専用ライトは未実装
- キャラクターの待機アニメーション、表情差分、Live2D相当の髪・袖揺れは未実装
- 端末メモリ最適化前のため、現段階は画質確認を優先して非圧縮設定

## 無料プランで困った点

- 今回の画像生成、Unity合成、実機確認では有料ツール必須の制限なし

## 有料版で改善できそうな点

- 現時点で課金が必要となる具体的制限なし
- 表情・衣装・ポーズ差分を大量制作する段階で制作費と運用負担を比較する

## 現時点で課金が必要か

NO

## 次に実装する小単位

- 推奨：実機メモリと見た目を比較しながら、キャラクター画像の端末向け圧縮設定を最適化

## スクリーンショット

- `Artifacts/UI/HomePhase17-CharacterHarmony-Player.png`

## 画像生成情報

- モード：OpenAI組み込み画像生成
- 方式：既存ヒバナを編集対象、背景を光源・色参照、完成イメージを構図参照として使用
- 最終プロンプト：

```text
Use case: identity-preserve
Asset type: transparent premium mobile-game home-screen character cutout
Primary request: Redraw Hibana so she integrates naturally into TRIAD's moonlit night-shrine home background. Improve the pose, rendering quality, and the character-to-background contrast balance.
Input images: Image 1 is the character identity and costume edit target; Image 2 is the exact lighting and color-environment reference; Image 3 is the pose, front-facing prominence, and home-screen composition reference.
Subject: the same young adult fire shrine maiden Hibana from Image 1. Preserve her recognizable face, amber eyes, long charcoal-black hair with subtle ember-red tips, black-and-gold go-stone hair ornament, ivory/vermilion/deep-navy layered miko outfit, triangle motifs, gold trim, and refined commercial-game proportions.
Pose: elegant seated or low kneeling front-facing pose suitable for a home-screen centerpiece, relaxed and confident rather than combat-ready; torso and face turned toward the viewer; one hand rests softly near her cheek or knee and the other presents one black go stone with a small controlled flame. Natural anatomy, clearly readable hands, calm inviting expression. The pose should feel grounded and intimate like Image 3 without copying that character.
Style/medium: highest-quality polished Japanese fantasy gacha-game illustration; crisp painterly cel rendering, detailed face, hair strands, fabric embroidery, metallic gold ornaments, and controlled material texture. Sharper facial detail and cleaner hands than Image 1.
Composition/framing: complete seated figure contained in a vertical 2:3 canvas, centered frontally, head and all visible limbs fully inside the frame, generous transparent padding, broad readable silhouette at smartphone size. No scenery and no large throne or furniture.
Lighting/mood: match Image 2 precisely: cool desaturated navy moonlight from upper right across hair and shoulders, subtle warm amber lantern bounce from lower left and lower edges, restrained ember light at the hand. Reduce the overall warm orange cast of Image 1. Use moderate contrast with deep but readable shadows so the figure belongs in the dark scene; face remains the focal point. No bright cutout halo.
Color palette: deep navy and charcoal shadows, ivory cloth, muted vermilion, antique gold, small warm amber accents; slightly lower saturation than Image 1.
Scene/backdrop: genuinely transparent background with clean preserved alpha; lighting may imply Image 2 but do not render any background, floor, rectangle, gradient, smoke field, or scenery.
Constraints: preserve Hibana's identity and outfit design; exactly one character; actual transparent background; no text; no logo; no UI; no border; no watermark; no extra limbs; anatomically clear hands and fingers; no cropped head, hair, sleeves, knees, or feet; suitable for compositing over Image 2.
Avoid: standing pose, side profile, chibi proportions, excessive cleavage, sexualized pose, bulky armor, photorealism, flat warm studio lighting, overexposure, crushed black facial features, bright outline halo, huge flame, busy effects, background scenery.
```

## Git

- branch：`unity/bootstrap-sprint1a`
- commit：本報告と同じPhase 17コミットで記録
