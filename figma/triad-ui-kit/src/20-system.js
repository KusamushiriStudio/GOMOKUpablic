/* ═══════════════════════════════════════════════════════════════════════
 * 00_DesignSystem — 変数・文字スタイル・効果・塗り（§0-7）
 *
 * 値は DATA.tokens（index.html の :root から機械で抜いたもの）だけを見る。
 * ここに数字を直接書かない。書いた瞬間に Web とずれる。
 * ═══════════════════════════════════════════════════════════════════════ */

const COLLECTION = { color: 'TRIAD 色', size: 'TRIAD 寸法', font: 'TRIAD 書体' };

/** 名前で引ける入れ物。作ったものは全部ここに入れて、後の画面作りから参照する。 */
const made = {
  color: new Map(),     // トークン名 → Variable
  size: new Map(),
  textStyle: new Map(), // 役目名 → TextStyle
  effect: new Map(),
  paint: new Map(),
  component: new Map(),
};

function hex(rgba) {
  const h = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${h(rgba.r)}${h(rgba.g)}${h(rgba.b)}${rgba.a < 1 ? h(rgba.a) : ''}`;
}

/* ───────── 変数 ───────── */

/**
 * 変数集合をひとつ用意する。既にあれば使い回す（再実行で二重に増やさない）。
 *
 * modes は「墨」と「和紙」の2つを入れたい。ただし下位プランは 1 つしか持てず、
 * addMode は `Limited to N modes only` を投げる。投げられたら、墨の値を別の集合へ
 * 分けて作り、その旨を報告する。黙って墨を捨てない。
 */
async function ensureCollection(name, modeNames) {
  const existing = (await figma.variables.getLocalVariableCollectionsAsync())
    .find((c) => c.name === name);
  const col = existing || figma.variables.createVariableCollection(name);

  const ids = {};
  col.renameMode(col.modes[0].modeId, modeNames[0]);
  ids[modeNames[0]] = col.modes[0].modeId;

  for (const extra of modeNames.slice(1)) {
    const have = col.modes.find((m) => m.name === extra);
    if (have) { ids[extra] = have.modeId; continue; }
    try {
      ids[extra] = col.addMode(extra);
    } catch (e) {
      say(`⚠ 「${name}」に ${extra} のモードを足せませんでした（${e.message}）。`
        + ` 別の集合「${name}（${extra}）」へ分けます。`);
      return { col, ids, overflow: extra };
    }
  }
  return { col, ids, overflow: null };
}

async function ensureVariable(col, name, type) {
  const existing = (await figma.variables.getLocalVariablesAsync(type))
    .find((v) => v.name === name && v.variableCollectionId === col.id);
  return existing || figma.variables.createVariable(name, col, type);
}

async function buildVariables(tokens) {
  /* 色 — 墨と和紙の2モード */
  const c = await ensureCollection(COLLECTION.color, ['washi', 'sumi']);
  let sumiFallback = null;
  if (c.overflow) {
    const alt = await ensureCollection(`${COLLECTION.color}（sumi）`, ['sumi']);
    sumiFallback = alt;
  }
  for (const entry of tokens.colors) {
    const v = await ensureVariable(c.col, entry.name, 'COLOR');
    v.setValueForMode(c.ids.washi, entry.values.washi);
    if (c.ids.sumi) v.setValueForMode(c.ids.sumi, entry.values.sumi);
    v.scopes = ['ALL_SCOPES'];
    if (entry.aliasOf) v.description = `CSS: ${entry.token}（${entry.aliasOf} の別名）`;
    else v.description = `CSS: ${entry.token}`;
    made.color.set(entry.token, v);

    if (sumiFallback) {
      const sv = await ensureVariable(sumiFallback.col, entry.name, 'COLOR');
      sv.setValueForMode(sumiFallback.ids.sumi, entry.values.sumi);
      sv.description = `CSS: ${entry.token}（墨）`;
    }
  }
  say(`色の変数 ${tokens.colors.length} 個`
    + (sumiFallback ? '（墨は別集合）' : `（うち墨で変わる ${tokens.colors.filter((x) => x.themed).length} 個）`));

  /* 寸法 — 余白・角丸・文字サイズ・高さ */
  const s = await ensureCollection(COLLECTION.size, ['既定']);
  for (const entry of tokens.numbers) {
    const v = await ensureVariable(s.col, entry.name, 'FLOAT');
    v.setValueForMode(s.ids['既定'], entry.value);
    v.description = `CSS: ${entry.token}${entry.unit ? `（${entry.unit}）` : ''}`;
    made.size.set(entry.token, v);
  }
  // 幅で変わる寸法は、390px の実寸を既定として入れておく（§0-5 の基準サイズ）
  for (const entry of tokens.responsive) {
    const v = await ensureVariable(s.col, `${entry.name}@390`, 'FLOAT');
    v.setValueForMode(s.ids['既定'], entry.px['390']);
    v.description = `CSS: ${entry.token} = ${entry.css}`
      + `｜320px: ${entry.px['320']} / 390px: ${entry.px['390']} / 430px: ${entry.px['430']}`;
    made.size.set(entry.token, v);
  }
  say(`寸法の変数 ${tokens.numbers.length + tokens.responsive.length} 個`);

  /* 書体 — 家族の並び。Figma では文字列として持つだけ */
  const f = await ensureCollection(COLLECTION.font, ['既定']);
  for (const entry of tokens.strings) {
    const v = await ensureVariable(f.col, entry.name, 'STRING');
    v.setValueForMode(f.ids['既定'], entry.value);
    v.description = `CSS: ${entry.token}`;
  }
  say(`書体の変数 ${tokens.strings.length} 個`);
}

/* ───────── 文字スタイル（§0-7 TYPOGRAPHY） ───────── */

/**
 * 指示書が挙げる 6 種（§0-7）。
 *
 * 大事なのは「トークンの理想形」ではなく「いま画面に出ている値」を写すこと。
 * index.html は見出しや本文の多くを var(--fs-*) ではなく直接の px で書いており、
 * --fs-1 / 3 / 6 / 7 / 8 は一度も参照されていない。--fs-8=26px を「大見出し」として
 * Figma に入れると、実画面（23px）と照らし合わせたときに必ず食い違う。
 * なので実クラスの値を正とし、対応するCSSの場所を description に残す。
 *
 * size に文字列を書いた場合はトークンから引く。数値はCSS側が直値である印。
 */
const TYPE_SCALE = [
  {
    name: 'タイトル', role: 'brush', weight: 'Bold',
    size: '--fs-title', lh: 125, ls: 16,
    css: '.brush-title-main（--font-brush / --fs-title / --lh-tight / --ls-brush）',
  },
  {
    name: '大見出し', role: 'mincho', weight: 'Bold',
    size: 23, lh: 125, ls: 18,
    css: '.mokufuda .fuda-main（--font / 直値 23px / .18em）',
  },
  {
    name: '見出し', role: 'mincho', weight: 'Medium',
    size: 15, lh: 130, ls: 8,
    css: '.card > h2・.section-title（--font / 直値 15px / .08em）',
  },
  {
    name: '本文', role: 'gothic', weight: 'Regular',
    size: '--fs-5', lh: '--lh-base', ls: '--ls-ui',
    css: 'body + .t-ui（--font-gothic / --fs-5 / --lh-base / --ls-ui）',
  },
  {
    name: '補助', role: 'gothic', weight: 'Regular',
    size: 12, lh: 160, ls: 2,
    css: '.muted（直値 12px / line-height 1.6）',
  },
  {
    name: '数字', role: 'gothic', weight: 'Bold',
    size: '--fs-7', lh: 125, ls: 1,
    css: '.num（--font-num / 700 / tabular-nums / .01em）',
  },
];

/**
 * CSS の書体の並びから、Figma に実在するものを選ぶ。
 * index.html は外部フォントを読まない方針なので、ここも Figma に元から入っている
 * 日本語書体（Noto 系）に寄せる。無ければ pickFont が保険へ落とす。
 */
const FONT_CANDIDATES = {
  brush: (w) => [['Klee One', 'SemiBold'], ['Noto Serif JP', w], ['Yu Mincho', w], ['Noto Serif JP', 'Bold']],
  mincho: (w) => [['Noto Serif JP', w], ['Yu Mincho', w], ['Hiragino Mincho ProN', w]],
  gothic: (w) => [['Noto Sans JP', w], ['Hiragino Sans', w], ['Yu Gothic', w], ['Inter', w]],
};

/** 数値か、トークン名なら 390px 基準の実寸を引く。 */
function numberOf(tokens, spec, fallback) {
  if (typeof spec === 'number') return spec;
  const n = tokens.numbers.find((x) => x.token === spec);
  if (n) return n.value;
  const r = tokens.responsive.find((x) => x.token === spec);
  return r ? r.px['390'] : fallback;
}

async function buildTextStyles(tokens) {
  const existing = await figma.getLocalTextStylesAsync();
  for (const spec of TYPE_SCALE) {
    const name = `TRIAD/${spec.name}`;
    const style = existing.find((s) => s.name === name) || figma.createTextStyle();
    style.name = name;

    const font = await useFont(await pickFont(FONT_CANDIDATES[spec.role](spec.weight)));
    style.fontName = font;
    style.fontSize = numberOf(tokens, spec.size, 16);
    style.lineHeight = { unit: 'PERCENT', value: numberOf(tokens, spec.lh, 150) };
    style.letterSpacing = { unit: 'PERCENT', value: numberOf(tokens, spec.ls, 0) };
    style.description = `${spec.css}／${font.family} ${font.style}`;
    made.textStyle.set(spec.name, style);
  }
  say(`文字スタイル ${TYPE_SCALE.length} 種`);
}

/* ───────── 効果と塗り ───────── */

/**
 * Figma の Effect Style と Paint Style にはモードが無い。
 * 影も箔もテーマで値が違うので、和紙と墨で別のスタイルとして 2 本ずつ作る。
 * 片方だけにすると、もう一方のテーマの画面を Figma で組めなくなる。
 */
const THEME_LABEL = { washi: '和紙', sumi: '墨' };

async function buildEffectStyles(tokens) {
  const existing = await figma.getLocalEffectStylesAsync();
  let made_ = 0;
  for (const entry of tokens.effectStyles) {
    for (const mode of ['washi', 'sumi']) {
      const name = `TRIAD/${entry.name}/${THEME_LABEL[mode]}`;
      const style = existing.find((s) => s.name === name) || figma.createEffectStyle();
      style.name = name;
      style.effects = entry[mode];
      style.description = `CSS: ${entry.token}（${THEME_LABEL[mode]}）`;
      made.effect.set(`${entry.token}/${mode}`, style);
      made_ += 1;
    }
  }
  say(`効果スタイル ${made_} 種（${tokens.effectStyles.length} × 和紙・墨）`);
}

async function buildPaintStyles(tokens) {
  const existing = await figma.getLocalPaintStylesAsync();
  let ok = 0;
  for (const entry of tokens.gradients) {
    for (const mode of ['washi', 'sumi']) {
      const css = entry[mode] || entry.washi || entry.sumi;
      const paint = gradientPaint(css);
      if (!paint) { say(`⚠ ${entry.token}（${THEME_LABEL[mode]}）は塗りに直せませんでした: ${css}`); continue; }
      const name = `TRIAD/${entry.name}/${THEME_LABEL[mode]}`;
      const style = existing.find((s) => s.name === name) || figma.createPaintStyle();
      style.name = name;
      style.paints = [paint];
      style.description = `CSS: ${entry.token}（${THEME_LABEL[mode]}）`;
      made.paint.set(`${entry.token}/${mode}`, style);
      ok += 1;
    }
  }
  say(`塗りスタイル ${ok} 種`);
}

/* ───────── 見えるかたちにする ───────── */

/**
 * 変数パネルの中だけにあっても、デザインの話はできない。
 * 00_DesignSystem に、色見本・文字見本・余白見本を並べて置く。
 */
async function drawSystemBoard(tokens, page) {
  const sumi = tokens.colors.find((c) => c.token === '--bg-2').values.sumi;
  const ink = tokens.colors.find((c) => c.token === '--fg-1').values.sumi;
  const dim = tokens.colors.find((c) => c.token === '--fg-3').values.sumi;
  const kin = tokens.colors.find((c) => c.token === '--kin').values.sumi;

  const board = mark(frame(page, 'TRIAD Design System', {
    layout: 'VERTICAL', gap: 40, pad: 40, fill: solid(sumi), clip: false,
  }));
  board.x = 0;
  board.y = 0;

  const heading = async (parent, label, note) => {
    const row = frame(parent, `見出し/${label}`, { layout: 'VERTICAL', gap: 4 });
    row.layoutSizingHorizontal = 'HUG';
    await text(row, label, { font: made.textStyle.get('大見出し').fontName, size: 26, color: kin });
    if (note) await text(row, note, { font: made.textStyle.get('補助').fontName, size: 12, color: dim });
    return row;
  };

  /* 色 */
  const colorSection = frame(board, '色', { layout: 'VERTICAL', gap: 16 });
  await heading(colorSection, 'COLORS', 'index.html の :root から生成。左が和紙（明）、右が墨（暗）。');
  const groups = new Map();
  for (const entry of tokens.colors) {
    const group = entry.name.split('/').slice(0, 2).join('/');
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(entry);
  }
  for (const [group, entries] of groups) {
    const row = frame(colorSection, group, { layout: 'VERTICAL', gap: 8 });
    await text(row, group, { font: made.textStyle.get('見出し').fontName, size: 14, color: dim });
    const swatches = frame(row, '見本', { layout: 'HORIZONTAL', gap: 10, wrap: true, rowGap: 10 });
    swatches.resize(1120, 1);
    swatches.layoutSizingHorizontal = 'FIXED';
    swatches.counterAxisSizingMode = 'AUTO';
    for (const entry of entries) {
      const cell = frame(swatches, entry.token, { layout: 'VERTICAL', gap: 6, w: 128 });
      cell.layoutSizingHorizontal = 'FIXED';
      const pair = frame(cell, '和紙と墨', { layout: 'HORIZONTAL', gap: 0, h: 36, radius: 6 });
      pair.layoutSizingHorizontal = 'FILL';
      pair.layoutSizingVertical = 'FIXED';
      for (const mode of ['washi', 'sumi']) {
        const half = frame(pair, mode, { fill: solid(entry.values[mode]) });
        half.layoutSizingHorizontal = 'FILL';
        half.layoutSizingVertical = 'FILL';
      }
      // 定義はあるが var() で一度も参照されていないものは、実装済みと読み違えられる
      await text(cell, entry.uses ? entry.token : `${entry.token}（未接続）`, {
        font: made.textStyle.get('補助').fontName, size: 10, color: entry.uses ? ink : dim,
      });
      await text(cell, hex(entry.values.sumi), { font: made.textStyle.get('補助').fontName, size: 9, color: dim });
    }
  }

  /* 文字 */
  const typeSection = frame(board, '書体', { layout: 'VERTICAL', gap: 16 });
  await heading(typeSection, 'TYPOGRAPHY', '大きさは 390px のときの実寸。');
  for (const spec of TYPE_SCALE) {
    const style = made.textStyle.get(spec.name);
    const row = frame(typeSection, spec.name, { layout: 'VERTICAL', gap: 2 });
    await text(row, `${spec.name}　つながる一手、広がる世界　0123456789`, {
      font: style.fontName, size: style.fontSize, color: ink,
      lineHeight: style.lineHeight.value, letterSpacing: style.letterSpacing.value,
    });
    await text(row, style.description, { font: made.textStyle.get('補助').fontName, size: 11, color: dim });
  }

  /* 余白・角丸 */
  const sizeSection = frame(board, '寸法', { layout: 'VERTICAL', gap: 16 });
  await heading(sizeSection, 'SPACING / RADIUS', '4px 刻み。最小タップは 44px。');
  const spacingRow = frame(sizeSection, '余白', { layout: 'HORIZONTAL', gap: 20, align: 'MAX' });
  for (const entry of tokens.numbers.filter((n) => n.token.startsWith('--sp-') || n.token === '--tap')) {
    const cell = frame(spacingRow, entry.token, { layout: 'VERTICAL', gap: 6, align: 'CENTER' });
    const bar = frame(cell, 'bar', { w: Math.max(entry.value, 4), h: 44, fill: solid(kin), radius: 2 });
    bar.layoutSizingHorizontal = 'FIXED';
    bar.layoutSizingVertical = 'FIXED';
    await text(cell, `${entry.token.slice(2)}\n${entry.value}`, {
      font: made.textStyle.get('補助').fontName, size: 10, color: dim, align: 'CENTER',
    });
  }
  const radiusRow = frame(sizeSection, '角丸', { layout: 'HORIZONTAL', gap: 20 });
  for (const entry of tokens.numbers.filter((n) => n.token.startsWith('--r-'))) {
    const cell = frame(radiusRow, entry.token, { layout: 'VERTICAL', gap: 6, align: 'CENTER' });
    const box = frame(cell, 'box', {
      w: 64, h: 44, fill: solid(kin), radius: Math.min(entry.value, 22),
    });
    box.layoutSizingHorizontal = 'FIXED';
    box.layoutSizingVertical = 'FIXED';
    await text(cell, `${entry.token.slice(2)} ${entry.value}`, {
      font: made.textStyle.get('補助').fontName, size: 10, color: dim,
    });
  }

  /* 幅で変わる寸法 */
  if (tokens.responsive.length) {
    const resp = frame(board, '幅で変わる寸法', { layout: 'VERTICAL', gap: 8 });
    await heading(resp, 'RESPONSIVE', 'clamp() は Figma に持ち込めない。320 / 390 / 430 の実寸で持つ。');
    for (const entry of tokens.responsive) {
      await text(resp, `${entry.token} = ${entry.css}`
        + `　→　320px: ${entry.px['320']} / 390px: ${entry.px['390']} / 430px: ${entry.px['430']}`, {
        font: made.textStyle.get('補助').fontName, size: 11, color: ink,
      });
    }
  }

  /* 写せなかったもの */
  if (tokens.notVariable.length) {
    const gap = frame(board, '写せないもの', { layout: 'VERTICAL', gap: 8 });
    await heading(gap, 'NOT IN FIGMA', 'CSS にあるが Figma の変数にできない値。実装時はこちらが正。');
    for (const entry of tokens.notVariable) {
      await text(gap, `${entry.token} — ${entry.why}`, {
        font: made.textStyle.get('補助').fontName, size: 11, color: dim,
      });
    }
  }

  /* 定義だけあって使われていないもの */
  const unused = [...tokens.colors, ...tokens.numbers, ...tokens.strings, ...tokens.responsive]
    .filter((x) => x.uses === 0);
  if (unused.length) {
    const box = frame(board, '未接続', { layout: 'VERTICAL', gap: 8 });
    await heading(box, 'NOT WIRED UP',
      `定義はあるが index.html のどこからも var() で参照されていない ${unused.length} 個。`
      + ' Figma で使う前に、実装側を先に繋ぐこと。');
    await text(box, unused.map((x) => x.token).join('　'), {
      font: made.textStyle.get('補助').fontName, size: 11, color: dim,
      hSize: 'FILL',
    });
    box.resize(1120, box.height);
    box.layoutSizingHorizontal = 'FIXED';
  }
  return board;
}
