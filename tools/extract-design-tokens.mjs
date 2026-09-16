/**
 * index.html の CSS カスタムプロパティを Figma の Variables / Styles 用へ書き出す。
 *
 *   node tools/extract-design-tokens.mjs
 *     → figma/triad-ui-kit/tokens.json
 *
 * なぜ抽出するのか（指示書 §0-7・§0-13・§0-14）
 *   色や余白を Figma で手入力すると、Web の CSS と必ずずれる。ずれた状態で
 *   「Figma を完成基準にする」と言っても意味が無い。だから正は index.html の
 *   :root に一本化し、Figma 側はここから機械で作る。将来 Unity の Theme へ
 *   移すときも、読むのはこの JSON になる。
 *
 * 拾う元は 2 つだけ
 *   :root                      … 明（和紙）の値と、テーマに依らない値
 *   :root[data-theme="sumi"]   … 暗（墨）の値
 *
 * 拾わないもの
 *   :root[data-fx="off"] / :root[data-shake="off"] など …「演出を切った状態」であって
 *     トークンの定義ではない。混ぜると --dur-scale が 0、--washi-grain が none で
 *     上書きされ、Figma に「演出を切った画面」が写ってしまう。
 *   @media の :root:not([data-theme="washi"]) … 墨の写しなので二重に読まない。
 *
 * Figma に写せないもの（calc() / gradient / env()）は捨てずに notVariable へ集め、
 * 代わりに何を使うかを書く。黙って消すと、後から別の値が発明される。
 * clamp() は変数にできないが幅ごとの実寸なら出せるので、responsive に入れる。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/* ───────────────────────── CSS を読む ───────────────────────── */

/** ブロックコメントを消す。値の中に入れ子は無いので単純な置換で足りる。 */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** `@media` / `@supports` の範囲を、条件と文字位置で返す。 */
function atRuleRanges(css) {
  const out = [];
  const re = /@(media|supports)([^{]*)\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    for (; i < css.length && depth > 0; i += 1) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
    }
    out.push({ condition: `@${m[1]}${m[2].replace(/\s+/g, ' ').trimEnd()}`, start: m.index, end: i });
  }
  return out;
}

/**
 * `:root` で始まる規則を、選択子・中身・囲っている @規則 の組で全部返す。
 * 波括弧は数えて閉じる。@media の中の :root は「条件が合ったときだけの値」なので、
 * 素の :root と混ぜてはいけない。混ぜると reduced-motion の 0 や、
 * 900px 以上のときの舞台の高さが、既定値として写ってしまう。
 */
export function rootRules(css) {
  const ranges = atRuleRanges(css);
  const out = [];
  const re = /(^|[\s{}])(:root[^{};]*)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[2].trim();
    const at = ranges.filter((r) => m.index > r.start && m.index < r.end).at(-1);
    let depth = 1;
    let i = re.lastIndex;
    for (; i < css.length && depth > 0; i += 1) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
    }
    out.push({ selector, body: css.slice(re.lastIndex, i - 1), at: at ? at.condition : null });
    re.lastIndex = i;
  }
  return out;
}

/**
 * `@media (max-width: 360px)` のような幅の条件が、その幅で成り立つか。
 * 幅以外の条件（prefers-reduced-motion など）は判定しないので null を返す。
 */
export function appliesAtWidth(condition, width) {
  if (!/\bwidth\s*:/.test(condition)) return null;
  let verdict = true;
  for (const m of condition.matchAll(/\((min|max)-width\s*:\s*(\d+(?:\.\d+)?)px\)/g)) {
    const n = Number(m[2]);
    verdict = verdict && (m[1] === 'min' ? width >= n : width <= n);
  }
  return verdict;
}

/**
 * 宣言を読む。値に `,` や `(` が入るので、`;` は括弧の外にあるものだけを区切りとみなす。
 * カスタムプロパティ以外（background-color など）は捨てる。
 */
export function declarations(body) {
  const out = [];
  let i = 0;
  while (i < body.length) {
    const colon = body.indexOf(':', i);
    if (colon < 0) break;
    const name = body.slice(i, colon).trim();
    let depth = 0;
    let j = colon + 1;
    for (; j < body.length; j += 1) {
      const c = body[j];
      if (c === '(') depth += 1;
      else if (c === ')') depth -= 1;
      else if (c === ';' && depth === 0) break;
    }
    const value = body.slice(colon + 1, j).trim();
    if (name.startsWith('--') && value) out.push([name, value]);
    i = j + 1;
  }
  return out;
}

/* ───────────────────────── 値を見分ける ───────────────────────── */

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;
const PX = /^(-?\d*\.?\d+)px$/;
const EM = /^(-?\d*\.?\d+)em$/;
const PCT = /^(-?\d*\.?\d+)%$/;
const NUM = /^(-?\d*\.?\d+)$/;

const round6 = (n) => Math.round(n * 1e6) / 1e6;

/** #rgb / #rgba / #rrggbb / #rrggbbaa → Figma の {r,g,b,a}（0〜1）。 */
function fromHex(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = (k) => round6(parseInt(h.slice(k * 2, k * 2 + 2), 16) / 255);
  return { r: n(0), g: n(1), b: n(2), a: h.length === 8 ? n(3) : 1 };
}

/** 色を {r,g,b,a}（0〜1）にする。`.20` のような前置ゼロ無しの小数も通す。 */
export function asColor(value) {
  if (HEX.test(value)) return fromHex(value);
  const m = RGB.exec(value);
  if (!m) return null;
  const c = (k) => round6(Number(m[k]) / 255);
  return { r: c(1), g: c(2), b: c(3), a: m[4] === undefined ? 1 : Number(m[4]) };
}

/** `,` を括弧の外だけで割る。影の重ね掛けや clamp() の引数を分けるのに使う。 */
export function splitTop(value) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth -= 1;
    else if (c === ',' && depth === 0) { out.push(value.slice(start, i).trim()); start = i + 1; }
  }
  out.push(value.slice(start).trim());
  return out.filter(Boolean);
}

/**
 * `inset 0 1px 0 rgba(...)` のような影ひとつを Figma の Effect にする。
 * 長さは 2〜4 個（x y [ぼかし] [広がり]）。読めなければ null を返す。
 */
export function asShadow(part) {
  const inset = /(^|\s)inset(\s|$)/.test(part);
  const rest = part.replace(/(^|\s)inset(\s|$)/, ' ').trim();
  const tokens = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= rest.length; i += 1) {
    const c = rest[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth -= 1;
    if ((i === rest.length || /\s/.test(c)) && depth === 0) {
      const t = rest.slice(start, i).trim();
      if (t) tokens.push(t);
      start = i + 1;
    }
  }
  const colorTok = tokens.find((t) => asColor(t));
  const lengths = tokens
    .filter((t) => t !== colorTok)
    .map((t) => (PX.test(t) ? Number(PX.exec(t)[1]) : NUM.test(t) ? Number(t) : NaN));
  if (!colorTok || lengths.length < 2 || lengths.some(Number.isNaN)) return null;
  const [x, y, blur = 0, spread = 0] = lengths;
  return {
    type: inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
    color: asColor(colorTok),
    offset: { x, y },
    radius: blur,
    spread,
    blendMode: 'NORMAL',
    visible: true,
  };
}

/* ───────────────────────── 可変長を実寸にする ───────────────────────── */

/**
 * 確認する画面幅（§0-5）。高さは各幅の代表的な端末に合わせる。
 * svh / dvh / lvh / vh はどれも「表示領域の高さ」として同じに扱う。Figma の枠には
 * ブラウザのアドレスバーが無いので、区別しても写せない。
 */
export const VIEWPORTS = [
  { w: 320, h: 780 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
];

const LEN = /^(-?\d*\.?\d+)(px|vw|vh|svh|dvh|lvh|%)$/;

/** 単位付きの長さを px にする。% は基準が無いので null。 */
function toPx(value, vp) {
  const m = LEN.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (m[2] === 'px') return n;
  if (m[2] === 'vw') return (n / 100) * vp.w;
  if (m[2] === '%') return null;
  return (n / 100) * vp.h;              // vh / svh / dvh / lvh
}

/**
 * clamp(最小, 希望, 最大) を画面幅ごとの実寸にする。
 * Figma に可変長は無いので、320 / 390 / 430 それぞれの枠へ入れる数を先に出しておく。
 */
export function evalClamp(value) {
  const m = /^clamp\(([\s\S]*)\)$/.exec(value.trim());
  if (!m) return null;
  const parts = splitTop(m[1]);
  if (parts.length !== 3) return null;
  const out = {};
  for (const vp of VIEWPORTS) {
    const [lo, mid, hi] = parts.map((p) => toPx(p, vp));
    if (lo === null || mid === null || hi === null) return null;
    out[vp.w] = Math.round(Math.min(Math.max(mid, lo), hi) * 100) / 100;
  }
  return out;
}

/* ───────────────────────── 分類と命名 ───────────────────────── */

/** CSS 名の頭から Figma の入れ子名を決める。先に書いたものが勝つ。 */
const GROUPS = [
  ['--fs-', '寸法/文字'], ['--sp-', '寸法/余白'], ['--r-', '寸法/角丸'],
  ['--lh-', '寸法/行送り'], ['--ls-', '寸法/字間'],
  ['--seat-', '色/盤/席'], ['--mark-', '色/盤/印'],
  ['--surface-', '色/面'], ['--bg-', '色/地'], ['--fg-', '色/文字'],
  ['--line-', '色/罫'],
  ['--shadow', '効果/影'], ['--glow', '効果/光'], ['--sheen', '効果/艶'],
  ['--green-', '色/旧/緑'], ['--kinpaku', '塗り'], ['--kin', '色/金'], ['--shu', '色/朱'],
  ['--ai', '色/藍'], ['--ok', '色/可'], ['--warn', '色/注'], ['--kiji-', '色/木地'],
  ['--danger', '色/朱'], ['--nav-h', '寸法/高さ'], ['--header-h', '寸法/高さ'],
  ['--tap', '寸法/操作'], ['--radius', '寸法/角丸'],
  ['--font', '書体'], ['--dur', '時間'], ['--ease-', '時間/曲線'],
  ['--fill-', '塗り'], ['--washi-grain', '塗り'],
  ['--stage-', '舞台'], ['--hero-', '舞台'],
];

export function figmaName(css) {
  const hit = GROUPS.find(([p]) => css.startsWith(p));
  const leaf = css.slice(2);
  return hit ? `${hit[1]}/${leaf}` : `その他/${leaf}`;
}

/**
 * Figma の Paint Style にできる形。角度ひとつと停点だけの、単層の線形グラデ。
 * `repeating-linear-gradient` や、`,` で層を重ねた --washi-grain は写せない。
 */
export const SIMPLE_GRADIENT = /^linear-gradient\(\s*-?[\d.]+deg\s*,[^;]*\)$/;

/** Figma へ写せない値の理由。写せるなら null。 */
export function unsupported(value) {
  if (/\bcalc\(/.test(value)) return 'calc() は Figma の変数にできない';
  if (/\benv\(/.test(value)) return 'env() は端末依存で Figma に無い';
  if (/gradient\(/.test(value)) {
    return SIMPLE_GRADIENT.test(value)
      ? 'グラデーションは変数ではなく Paint Style にする'
      : '層を重ねた／繰り返しのグラデは Figma の塗り 1 つに写せない。実装側の CSS が正';
  }
  if (/\bclamp\(/.test(value)) return 'clamp() で、幅ごとの実寸も出せなかった';
  if (/var\(/.test(value)) return '参照を解決できなかった';
  if (/cubic-bezier\(/.test(value)) return '緩急曲線。Figma では個別に指定する';
  return null;
}

/* ───────────────────────── 組み立て ───────────────────────── */

const WASHI = 'washi';
const SUMI = 'sumi';

/**
 * そのトークンが index.html のどこかで `var(--x)` として使われている回数。
 *
 * 定義してあるのに一度も参照されていないトークンが 20 以上ある。Figma に
 * 全部載せるのは良いが、印を付けないと「実装済み」と読み違える。CSS だけでなく
 * JS が組み立てる style 文字列も同じ書き方なので、ファイル全体を数える。
 */
export function countUses(html) {
  const uses = new Map();
  for (const m of html.matchAll(/var\(\s*(--[\w-]+)/g)) {
    uses.set(m[1], (uses.get(m[1]) ?? 0) + 1);
  }
  return uses;
}

/** index.html の中身から tokens.json の内容を作る。テストはここを直接呼ぶ。 */
export function buildTokens(html) {
  const uses = countUses(html);
  const css = stripComments(html.slice(html.indexOf('<style'), html.lastIndexOf('</style>')));
  const all = rootRules(css)
    .filter((r) => r.selector === ':root' || r.selector === ':root[data-theme="sumi"]');

  // name → { washi?, sumi? }。宣言の順に積み、後に出たものが勝つ（CSS と同じ）。
  const seen = new Map();
  for (const rule of all) {
    if (rule.at) continue;                       // @media の中は既定値ではない
    const mode = rule.selector === ':root' ? WASHI : SUMI;
    for (const [name, value] of declarations(rule.body)) {
      if (!seen.has(name)) seen.set(name, {});
      seen.get(name)[mode] = value;
    }
  }

  /* @media の中の :root は、条件が合ったときだけの上書き。
     幅の条件なら 320 / 390 / 430 のどこで効くかまで出しておく（§0-5）。 */
  const mediaOverrides = [];
  for (const rule of all) {
    if (!rule.at) continue;
    for (const [token, value] of declarations(rule.body)) {
      const px = evalClamp(value);
      const entry = {
        token, name: figmaName(token), condition: rule.at, value,
        appliesTo: VIEWPORTS
          .filter((vp) => appliesAtWidth(rule.at, vp.w) === true)
          .map((vp) => vp.w),
        widthConditional: appliesAtWidth(rule.at, 390) !== null,
      };
      if (px) entry.px = px;
      mediaOverrides.push(entry);
    }
  }

  /* var(--x) を実体へ置き換える。--danger: var(--shu) のような別名を別名のまま
     渡すと、片方のテーマで解決できず色が抜ける。どれが別名だったかは aliasOf に残す。 */
  const aliasOf = new Map();
  const deref = (value, mode, depth) => {
    if (depth > 4 || !/var\(/.test(value)) return value;
    const next = value.replace(/var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g, (all, ref) => {
      const target = seen.get(ref);
      if (!target) return all;
      return target[mode] ?? target[WASHI] ?? target[SUMI] ?? all;
    });
    return next === value ? value : deref(next, mode, depth + 1);
  };
  for (const [name, byMode] of seen) {
    for (const mode of [WASHI, SUMI]) {
      const v = byMode[mode];
      if (v === undefined || !/var\(/.test(v)) continue;
      const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v);
      if (ref) aliasOf.set(name, ref[1]);
      byMode[mode] = deref(v, mode, 0);
    }
  }

  const colors = [];
  const numbers = [];
  const strings = [];
  const effectStyles = [];
  const gradients = [];
  const responsive = [];
  const notVariable = [];

  for (const [token, byMode] of seen) {
    const washi = byMode[WASHI];
    const sumi = byMode[SUMI] ?? washi;          // 墨で上書きが無ければ和紙と同じ
    const themed = byMode[SUMI] !== undefined && byMode[WASHI] !== undefined
      && byMode[SUMI] !== byMode[WASHI];
    const sample = washi ?? sumi;
    if (sample === undefined) continue;
    const name = figmaName(token);
    const alias = aliasOf.has(token) ? { aliasOf: aliasOf.get(token) } : {};
    const used = { uses: uses.get(token) ?? 0 };

    // clamp() は変数にできないが、幅ごとの実寸なら出せる
    const clamp = evalClamp(sample);
    if (clamp) { responsive.push({ name, token, css: sample, px: clamp, ...used }); continue; }

    const why = unsupported(sample);
    if (why) {
      notVariable.push({ token, why, washi: washi ?? null, sumi: byMode[SUMI] ?? null });
      // Figma の Paint Style にできるのは、停点を並べた単層のグラデだけ。
      // repeating-linear-gradient や、複数層を重ねた --washi-grain は写せない。
      // 「グラデだから塗りにできる」と一括りにすると、プラグイン側で必ず落ちる。
      if (SIMPLE_GRADIENT.test(sample)) {
        gradients.push({ name, token, washi: washi ?? null, sumi: byMode[SUMI] ?? null });
      }
      continue;
    }

    // 影・艶・光は変数ではなく Effect Style にする
    if (token.startsWith('--shadow') || token === '--sheen' || token === '--glow-kin') {
      const build = (v) => splitTop(v).map(asShadow).filter(Boolean);
      const w = build(washi ?? sumi);
      const s = build(sumi);
      if (w.length) effectStyles.push({ name, token, washi: w, sumi: s.length ? s : w, ...alias, ...used });
      else notVariable.push({ token, why: '影として読めなかった', washi: washi ?? null, sumi: byMode[SUMI] ?? null });
      continue;
    }

    const cw = asColor(washi ?? sumi);
    if (cw) {
      colors.push({ name, token, themed, values: { washi: cw, sumi: asColor(sumi) ?? cw }, ...alias, ...used });
      continue;
    }

    if (PX.test(sample) || PCT.test(sample) || NUM.test(sample) || EM.test(sample)) {
      // 行送り 1.55 と字間 .16em は Figma では % で持つ
      const unit = PX.test(sample) ? 'px'
        : PCT.test(sample) || EM.test(sample) || token.startsWith('--lh-') ? '%' : '';
      const value = PX.test(sample) ? Number(PX.exec(sample)[1])
        : PCT.test(sample) ? Number(PCT.exec(sample)[1])
          : EM.test(sample) ? round6(Number(EM.exec(sample)[1]) * 100)
            : token.startsWith('--lh-') ? round6(Number(sample) * 100) : Number(sample);
      numbers.push({ name, token, unit, value, ...alias, ...used });
      continue;
    }

    if (/[a-z]/i.test(sample)) {
      strings.push({ name, token, value: sample.replace(/\s+/g, ' '), ...alias, ...used });
      continue;
    }

    notVariable.push({ token, why: '種別を判定できなかった', washi: washi ?? null, sumi: byMode[SUMI] ?? null });
  }

  return {
    generatedFrom: 'index.html',
    note: 'tools/extract-design-tokens.mjs が作る。直接編集しない。直すのは index.html の :root。',
    modes: [WASHI, SUMI],
    viewports: VIEWPORTS,
    colors, numbers, strings, effectStyles, gradients, responsive, mediaOverrides, notVariable,
  };
}

/* 直接動かしたときだけ書き出す（テストからの import では書かない）。 */
const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (invokedDirectly) {
  const root = resolve(import.meta.dirname, '..');
  const out = buildTokens(readFileSync(resolve(root, 'index.html'), 'utf8'));
  const dest = resolve(root, 'figma/triad-ui-kit/tokens.json');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
  console.log(`色 ${out.colors.length}（テーマで変わる ${out.colors.filter((c) => c.themed).length}）`
    + ` / 数値 ${out.numbers.length} / 文字列 ${out.strings.length}`
    + ` / 効果 ${out.effectStyles.length} / 塗り ${out.gradients.length}`
    + ` / 幅で変わる ${out.responsive.length} / 変数にできない ${out.notVariable.length}`);
  console.log(`→ ${dest}`);
}
