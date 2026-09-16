# TRIAD_GAME_UI（Figma）

指示書 §0「Figmaの導入」。Figma を**完成画面を先に決める場所**として使い、
`Figma → Blender → Web → 将来 Unity` の順で作る（§0-3・§0-15）。

```
figma/
  README.md        これ
  現状分析.md       いまのホーム画面の問題点（§0-16 の 1・2）
  triad-ui-kit/    Figma ファイルを作るプラグイン
    manifest.json
    code.js        生成物。直接編集しない
    tokens.json    生成物。index.html の :root から抽出した値
    src/*.js       元ファイル。直すのはここ
```

## 1. 済んでいること

- Figma Desktop **126.9.7** を導入（`%LOCALAPPDATA%\Figma\Figma.exe`）。
  公式 `desktop.figma.com/win/FigmaSetup.exe` から取得し、署名が
  `CN="Figma, Inc."` であることを確認済み。起動も確認済み。
- 現行ホーム画面の分析（[現状分析.md](現状分析.md)）。
- Design System・部品・ホーム第一案・試作の遷移を**作るプラグイン**。

## 2. あなたにお願いすること

**ログインは代行できません。** 認証情報を入力する作業は行わない方針です。
Figma を起動して、ご自分のアカウントでログインしてください。

そのあと、1 回だけ：

1. Figma で新しいデザインファイルを作り、名前を `TRIAD_GAME_UI` にする
2. メニュー **Plugins → Development → Import plugin from manifest…**
3. `figma/triad-ui-kit/manifest.json` を選ぶ
4. **Plugins → Development → TRIAD UI Kit** を実行

数十秒で、§0-4 の 14 ページ・Design System・部品・ホーム 4 枚・試作の線が入ります。
2 回目以降は同じ手順の 4 だけ。**何度実行しても増えません**（前回の生成物だけ作り直す）。

> `manifest.json` に `id` がありません。ローカル開発ではこれで読めますが、
> Figma が `id` を求めた場合は **Plugins → Development → New plugin…** で
> 空のプラグインを作り、生成された `manifest.json` の `id` 行だけを
> `figma/triad-ui-kit/manifest.json` に写してください。
> `node tools/build-figma-plugin.mjs` は既存の `id` を残します。

## 3. できるもの

| ページ | 中身 |
|---|---|
| `00_DesignSystem` | 色見本（和紙／墨を並べて表示）・文字 6 種・余白・角丸・写せない値の一覧 |
| `01_Home` | 390×844（上と送り）、320×780、430×932 の 4 枚 |
| `12_Components` | 部品 11 個（下表） |
| `02`〜`07` | 遷移先の仮画面 |
| 他 | 空ページ（§0-4 の並び） |

部品（§0-7）：`TRIAD_PrimaryButton` / `SecondaryButton` / `Currency` /
`NotificationBadge` / `RailButton` / `PlayerCard` / `Navigation` /
`CharacterCard` / `SkillButton` / `Dialog` / `ResultPanel`。
全部 Auto Layout で、文言は Component Property で差し替えられる（§0-8・§0-9）。

変数：色 74（和紙／墨の 2 モード）・寸法 39・書体 6。効果 12・塗り 10。

## 4. 値は index.html が正

Figma に色や余白を手で入れない。入れた瞬間に Web とずれ、
「Figma を完成基準にする」（§0-13）が成り立たなくなる。

```
index.html の :root
      ↓  node tools/extract-design-tokens.mjs
figma/triad-ui-kit/tokens.json
      ↓  node tools/build-figma-plugin.mjs
figma/triad-ui-kit/code.js   ← Figma で実行
```

```bash
npm run build:figma
```

CSS を直したらこれを流し、Figma でプラグインを再実行すれば追随します。
`npm test` は `tokens.json` が `index.html` と一致しているかも見ます。

将来 Unity へ移すときも、読むのは `tokens.json`（§0-14）。

## 5. Figma に写せないもの

REST API には**デザイン内容を作る書き込み口がありません**
（書けるのはコメント・Webhook・dev_resources・変数のみ。OpenAPI 仕様で確認）。
だからプラグインで作っています。

値の側にも写せないものがあります。`00_DesignSystem` の "NOT IN FIGMA" に出します。

| CSS | 理由 | Figma 側 |
|---|---|---|
| `clamp()` 5 件 | 可変長が無い | 320 / 390 / 430 の実寸を変数と説明に持つ |
| `calc()`（`--dur-*`） | 計算式が無い | 実装側の CSS が正 |
| `env()`（`--safe-*`） | 端末依存 | Figma の枠には無い |
| `--washi-grain` | 層を重ねた繰り返しグラデ | 塗り 1 つに写せない。CSS が正 |
| `cubic-bezier` | 緩急曲線 | Smart Animate で個別指定 |

**モードの上限**：無料プランは 1 コレクションに 1 モードしか持てません。
その場合、墨の色は `TRIAD 色（sumi）` という別コレクションへ逃がします（値は捨てません）。

**書体**：`Klee One` → `Noto Serif JP` → `Yu Mincho` の順に、その環境に実在するものを選びます。
日本語書体が 1 つも無ければ Inter に落ちます（止まりません）。

## 6. 仮置きのもの

ホームの背景は**構図を決めるための下敷き**で、完成画の代わりではありません。

- 立ち絵は破線の枠と寸法だけ。実装は `characterHero()` の SVG で、
  装備 864 通りの組み合わせがあるため 1 枚の画像に焼けません。
- 神社・月・鳥居は単純な図形。実装は `views/home-stage.js` の SVG。
- 手前の碁盤は箱だけ。`board_default.blend` を低い角度で撮り直す想定。

決めているのは「どこに・何が・どの大きさで来るか」までです。

## 7. 確かめかた

ログインが要るので実機では流していません。代わりに Figma API を写した
ハーネス（`tests/helpers/fake-figma.mjs`）の上で `code.js` を実際に走らせ、
19 項目を確認しています（`tests/figma-plugin.test.mjs`）。

写した規則：字面を読み込む前に文字を入れない／`layoutSizing*` は親が
Auto Layout のときだけ／FILL の軸は resize できない／`setProperties` の鍵は実在すること。

**写せないもの**：実際の見た目、文字の折り返し、その環境の書体、プランのモード上限。
ここは Figma で開いて目で見るしかありません。
