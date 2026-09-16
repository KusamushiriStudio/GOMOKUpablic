/* ═══════════════════════════════════════════════════════════════════════
 * 道具
 * ═══════════════════════════════════════════════════════════════════════ */

/** 生成物の印。再実行したときに、前回作ったものだけを作り直すために使う。 */
const TAG = 'triad-ui-kit';

const log = [];
function say(line) { log.push(line); console.log(line); }

function mark(node) { node.setPluginData(TAG, 'generated'); return node; }
function isGenerated(node) { return node.getPluginData(TAG) === 'generated'; }

/* ───────── ページ ───────── */

/**
 * 名前のページを用意する。既にあれば使い回す。
 * ページは消さない。利用者が手で描いたものが消えるため。中身だけ作り直す。
 */
function ensurePage(name) {
  const found = figma.root.children.find((p) => p.name === name);
  if (found) return found;
  const page = figma.createPage();
  page.name = name;
  return page;
}

/** そのページの「前回この道具が作ったもの」だけを消す。手描きは残す。 */
function clearGenerated(page) {
  for (const child of [...page.children]) if (isGenerated(child)) child.remove();
}

/* ───────── 書体 ───────── */

/**
 * 使える書体をその場で調べて選ぶ。
 *
 * Figma に何が入っているかは環境で変わる。無い書体を fontName に入れると
 * loadFontAsync が投げ、そこで生成が止まる。だから「候補を並べて、
 * 実際に在るものを採る」形にする。最後の Inter / Roboto は保険。
 */
let _fontIndex = null;
async function fontIndex() {
  if (_fontIndex) return _fontIndex;
  _fontIndex = new Map();                       // family → Set<style>
  for (const f of await figma.listAvailableFontsAsync()) {
    if (!_fontIndex.has(f.fontName.family)) _fontIndex.set(f.fontName.family, new Set());
    _fontIndex.get(f.fontName.family).add(f.fontName.style);
  }
  return _fontIndex;
}

/**
 * 候補の [家族, 字面] を上から試し、実在する最初の組を返す。
 * 字面が無ければ、その家族の中から近いものへ落とす。
 */
async function pickFont(candidates) {
  const index = await fontIndex();
  for (const [family, style] of candidates) {
    const styles = index.get(family);
    if (!styles) continue;
    if (styles.has(style)) return { family, style };
    for (const near of [style, 'Bold', 'Medium', 'Regular', 'Normal', ...styles]) {
      if (styles.has(near)) return { family, style: near };
    }
  }
  return { family: 'Inter', style: 'Regular' };
}

const _loaded = new Set();
async function useFont(fontName) {
  const key = `${fontName.family}/${fontName.style}`;
  if (!_loaded.has(key)) { await figma.loadFontAsync(fontName); _loaded.add(key); }
  return fontName;
}

/* ───────── 色と塗り ───────── */

function solid(rgba) {
  return { type: 'SOLID', color: { r: rgba.r, g: rgba.g, b: rgba.b }, opacity: rgba.a ?? 1 };
}

/** `linear-gradient(180deg, #a, #b)` を Figma の塗りにする。読めなければ null。 */
function gradientPaint(css) {
  const m = /^linear-gradient\(\s*(-?[\d.]+)deg\s*,([\s\S]*)\)$/.exec(String(css).trim());
  if (!m) return null;
  const stops = splitTopLevel(m[2]).map((part, i, arr) => {
    const hit = /(#[0-9a-f]{3,8}|rgba?\([^)]*\))\s*(?:([\d.]+)%)?$/i.exec(part.trim());
    if (!hit) return null;
    const color = parseColor(hit[1]);
    if (!color) return null;
    const position = hit[2] !== undefined ? Number(hit[2]) / 100
      : arr.length === 1 ? 0 : i / (arr.length - 1);
    return { color, position };
  });
  if (stops.some((s) => !s)) return null;

  // CSS の 0deg は下から上、90deg は左から右。Figma の行列は
  // 「単位の四角をグラデーション空間へ写す」形で、単位行列が左→右にあたる。
  const rad = ((90 - Number(m[1])) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [
      [cos, -sin, (1 - cos + sin) / 2],
      [sin, cos, (1 - sin - cos) / 2],
    ],
    gradientStops: stops,
  };
}

function splitTopLevel(value) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth -= 1;
    else if (c === ',' && depth === 0) { out.push(value.slice(start, i)); start = i + 1; }
  }
  out.push(value.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseColor(text) {
  const hex = /^#([0-9a-f]{3,8})$/i.exec(text);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (k) => parseInt(h.slice(k * 2, k * 2 + 2), 16) / 255;
    return { r: n(0), g: n(1), b: n(2), a: h.length === 8 ? n(3) : 1 };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(text);
  if (!rgb) return null;
  return {
    r: Number(rgb[1]) / 255, g: Number(rgb[2]) / 255, b: Number(rgb[3]) / 255,
    a: rgb[4] === undefined ? 1 : Number(rgb[4]),
  };
}

/* ───────── 節を作る ───────── */

/**
 * Auto Layout の枠をひとつ。
 *
 * layoutSizingHorizontal / Vertical は「親が Auto Layout であること」が前提なので、
 * 必ず親へ入れてから設定する。順を逆にすると例外になる。ここでは親を先に受け取る。
 */
function frame(parent, name, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.fills = [];
  f.clipsContent = opts.clip !== false;
  if (parent) parent.appendChild(f);

  if (opts.layout) {
    f.layoutMode = opts.layout;                       // 'VERTICAL' | 'HORIZONTAL'
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.itemSpacing = opts.gap ?? 0;
    const p = opts.pad ?? 0;
    const pad = Array.isArray(p) ? p : [p, p, p, p];  // 上 右 下 左
    [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = pad;
    if (opts.align) f.counterAxisAlignItems = opts.align;     // MIN|CENTER|MAX|BASELINE
    if (opts.justify) f.primaryAxisAlignItems = opts.justify; // MIN|CENTER|MAX|SPACE_BETWEEN
    if (opts.wrap) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = opts.rowGap ?? opts.gap ?? 0; }
  }

  if (opts.w !== undefined || opts.h !== undefined) {
    f.resize(opts.w ?? f.width ?? 1, opts.h ?? f.height ?? 1);
  }
  if (opts.fill) f.fills = [opts.fill];
  if (opts.radius !== undefined) f.cornerRadius = opts.radius;
  if (opts.stroke) { f.strokes = [opts.stroke]; f.strokeWeight = opts.strokeWeight ?? 1; }
  if (opts.effects) f.effects = opts.effects;

  // 親が Auto Layout のときだけ、伸び方を指定できる
  if (parent && parent.layoutMode && parent.layoutMode !== 'NONE') {
    if (opts.hSize) f.layoutSizingHorizontal = opts.hSize;    // FILL|HUG|FIXED
    if (opts.vSize) f.layoutSizingVertical = opts.vSize;
    if (opts.grow) f.layoutGrow = opts.grow;
  }
  return f;
}

/** 文字をひとつ。字面は必ず先に読み込んでから入れる。 */
async function text(parent, content, opts = {}) {
  const t = figma.createText();
  const font = await useFont(opts.font || (await pickFont([['Inter', 'Regular']])));
  t.fontName = font;
  t.characters = String(content);
  if (parent) parent.appendChild(t);

  if (opts.size) t.fontSize = opts.size;
  if (opts.lineHeight) t.lineHeight = { unit: 'PERCENT', value: opts.lineHeight };
  if (opts.letterSpacing !== undefined) t.letterSpacing = { unit: 'PERCENT', value: opts.letterSpacing };
  if (opts.color) t.fills = [solid(opts.color)];
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.style) t.setTextStyleIdAsync ? await t.setTextStyleIdAsync(opts.style.id) : (t.textStyleId = opts.style.id);
  if (opts.name) t.name = opts.name;

  if (parent && parent.layoutMode && parent.layoutMode !== 'NONE') {
    t.layoutSizingHorizontal = opts.hSize || 'HUG';
    if (opts.hSize === 'FILL') t.textAutoResize = 'HEIGHT';
  }
  return t;
}
