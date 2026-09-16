/* ═══════════════════════════════════════════════════════════════════════
 * 01_Home — ホーム画面の第一案（§0-5・§0-6・§0-9）
 *
 * 基準は 390×844。320 と 430 も同じ木構造から作り、変えるのは
 * 「余白」と「枠の幅」だけにする。固定座標での手配置はしない。
 *
 * 現行実装との一番大きな違いは、舞台を角丸カードの中に閉じず
 * 画面いっぱいの地にすること。現行は .home-stage が 44svh の
 * カードで、立ち絵の実描画高は画面の約20%しかない。
 * ═══════════════════════════════════════════════════════════════════════ */

/** 幅ごとに変える値。ここ以外に幅依存の数字を書かない。 */
function metricsFor(width, tokens) {
  const gutter = tokens.responsive.find((r) => r.token === '--gutter');
  const height = (VIEWPORT_HEIGHTS[width] || 844);
  return {
    width,
    height,
    gutter: Math.round(gutter ? gutter.px[String(width)] : 12),
    navH: numberOf(tokens, '--nav-h', 60),
    headerH: numberOf(tokens, '--header-h', 52),
    gap: width <= 320 ? 6 : 8,
    // 主要ボタンは画面幅の28%（完成イメージの見た目の重み）
    primaryH: Math.round(width * 0.28),
    subH: width <= 320 ? 58 : 66,
  };
}

const VIEWPORT_HEIGHTS = { 320: 780, 390: 844, 430: 932 };

/* ───────── 背景（夜の神社） ───────── */

/**
 * 舞台の地。Blender の絵でも立ち絵でもなく、構図を決めるための下敷き。
 *
 * ここに完成品の絵を貼らないのは、立ち絵が装備 864 通りの合成で、
 * 天候と季節も data-fx で動くため。Figma に貼れるのは「どこに何がどの大きさで
 * 来るか」までで、その先は実装側の SVG が持つ。
 */
async function stageBackdrop(parent, m, tokens) {
  const sky = tokenColor.get('--bg-1').values.sumi;
  const far = tokenColor.get('--surface-1').values.sumi;
  const kin = tokenColor.get('--kinpaku').values.sumi;
  const shu = tokenColor.get('--shu').values.sumi;

  const bg = frame(parent, '背景／夜の神社', { w: m.width, h: m.height });
  bg.layoutPositioning = 'ABSOLUTE';
  bg.x = 0; bg.y = 0;
  bg.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { color: { ...sky, a: 1 }, position: 0 },
      { color: { r: 0.10, g: 0.09, b: 0.16, a: 1 }, position: 0.45 },
      { color: { r: 0.04, g: 0.05, b: 0.05, a: 1 }, position: 1 },
    ],
  }];

  const moon = figma.createEllipse();
  moon.name = '満月';
  moon.resize(m.width * 0.34, m.width * 0.34);
  moon.x = m.width * 0.52;
  moon.y = m.height * 0.10;
  moon.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.95, b: 0.86 }, opacity: 0.82 }];
  bg.appendChild(moon);

  // 山並み（遠景）
  for (const [i, spec] of [[0.62, 0.18], [0.30, 0.26], [0.86, 0.22]].entries()) {
    const hill = figma.createPolygon();
    hill.name = `山${i + 1}`;
    hill.pointCount = 3;
    hill.resize(m.width * 0.62, m.height * spec[1]);
    hill.x = m.width * spec[0] - m.width * 0.31;
    hill.y = m.height * 0.42 - m.height * spec[1];
    hill.fills = [{ type: 'SOLID', color: far, opacity: 0.16 + i * 0.05 }];
    bg.appendChild(hill);
  }

  // 鳥居（中景）。完成イメージでは立ち絵の後ろに大きく立つ。
  const torii = frame(bg, '鳥居', { w: m.width * 0.52, h: m.height * 0.30 });
  torii.layoutPositioning = 'ABSOLUTE';
  torii.x = m.width * 0.24;
  torii.y = m.height * 0.28;
  torii.fills = [];
  const post = (x, w) => {
    const r = figma.createRectangle();
    r.resize(w, torii.height);
    r.x = x; r.y = 0;
    r.fills = [{ type: 'SOLID', color: shu, opacity: 0.55 }];
    torii.appendChild(r);
  };
  post(torii.width * 0.10, torii.width * 0.07);
  post(torii.width * 0.83, torii.width * 0.07);
  for (const [y, h, inset] of [[0.06, 0.05, -0.04], [0.19, 0.035, 0.04]]) {
    const beam = figma.createRectangle();
    beam.resize(torii.width * (1 - inset * 2), torii.height * h);
    beam.x = torii.width * inset;
    beam.y = torii.height * y;
    beam.fills = [{ type: 'SOLID', color: shu, opacity: 0.55 }];
    torii.appendChild(beam);
  }

  // 立ち絵の置き場所。大きさが議論の的なので、枠と注記だけを置く。
  const heroW = Math.round(m.width * 0.71);       // 完成イメージの実測比
  const heroH = Math.round(m.height * 0.45);
  const hero = frame(bg, '立ち絵（実装は characterHero の SVG）', { w: heroW, h: heroH });
  hero.layoutPositioning = 'ABSOLUTE';
  hero.x = Math.round((m.width - heroW) / 2);
  hero.y = Math.round(m.height * 0.30);
  hero.fills = [{ type: 'SOLID', color: kin, opacity: 0.06 }];
  hero.strokes = [{ type: 'SOLID', color: kin, opacity: 0.5 }];
  hero.strokeWeight = 1;
  hero.dashPattern = [6, 5];
  const note = await text(hero, `立ち絵 ${heroW}×${heroH}\n画面高の45%\n（現行は約20%）`, {
    font: made.textStyle.get('補助').fontName, size: 11,
    color: kin, align: 'CENTER',
  });
  note.x = 8;
  note.y = heroH - 56;
  note.resize(heroW - 16, 48);

  // 手前の碁盤（board_default.webp を撮り直して使う想定）
  const board = frame(bg, '手前の碁盤（board_default を低い角度で撮り直す）', {
    w: Math.round(m.width * 0.84), h: Math.round(m.height * 0.09),
  });
  board.layoutPositioning = 'ABSOLUTE';
  board.x = Math.round(m.width * 0.08);
  board.y = Math.round(m.height * 0.70);
  board.fills = [{ type: 'SOLID', color: tokenColor.get('--kiji-1').values.sumi, opacity: 0.55 }];
  board.cornerRadius = 4;

  return bg;
}

/* ───────── 前景のひとまとまり ───────── */

async function homeTopBar(parent, m) {
  const bar = frame(parent, '最上段', {
    layout: 'HORIZONTAL', gap: 6, align: 'CENTER', h: m.headerH,
  });
  bar.layoutSizingHorizontal = 'FILL';
  bar.layoutSizingVertical = 'FIXED';

  const brand = frame(bar, 'ロゴ', { layout: 'VERTICAL', gap: 0 });
  await text(brand, 'TRIAD', {
    font: made.textStyle.get('タイトル').fontName, size: 20, letterSpacing: 10,
    color: tokenColor.get('--kinpaku').values.sumi,
  });
  await text(brand, '超次元五目', {
    font: made.textStyle.get('補助').fontName, size: 9, letterSpacing: 8,
    color: tokenColor.get('--fg-3').values.sumi,
  });

  const spacer = frame(bar, '空き', {});
  spacer.layoutGrow = 1;
  spacer.fills = [];

  const currency = made.component.get('TRIAD_Currency').createInstance();
  bar.appendChild(currency);
  currency.resize(m.width <= 320 ? 92 : 108, currency.height);

  // 文と報せ。押させるので 44px を割らない（現行の .icon-btn は 34px）。
  for (const icon of ['✉', '鈴']) {
    const btn = frame(bar, icon, {
      layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
      w: 44, h: 44, radius: 999, fill: fillOf('--urushi-2'), stroke: strokeOf('--line-kin'),
      clip: false,
    });
    btn.layoutSizingHorizontal = 'FIXED';
    btn.layoutSizingVertical = 'FIXED';
    await text(btn, icon, {
      font: made.textStyle.get('補助').fontName, size: 15,
      color: tokenColor.get('--kin').values.sumi,
    });
    const badge = made.component.get('TRIAD_NotificationBadge').createInstance();
    btn.appendChild(badge);
    badge.layoutPositioning = 'ABSOLUTE';
    badge.x = 27; badge.y = -2;
  }
  return bar;
}

/**
 * 中段。左に菱形の列、右に告知とキャラの額。あいだは空けて立ち絵を見せる。
 * この「空き」が立ち絵の顔が出る場所なので、潰さない。
 */
async function homeMiddle(parent, m) {
  const mid = frame(parent, '中段', { layout: 'HORIZONTAL', gap: 6, align: 'MIN' });
  mid.layoutSizingHorizontal = 'FILL';
  mid.layoutGrow = 1;
  mid.clipsContent = false;

  const rail = frame(mid, '左の列', { layout: 'VERTICAL', gap: 6, align: 'CENTER' });
  rail.layoutSizingVertical = 'HUG';
  for (const [name, badge] of [['フレンド', '3'], ['お知らせ', '！'], ['ミッション', ''], ['順位', '']]) {
    const btn = made.component.get('TRIAD_RailButton').createInstance();
    rail.appendChild(btn);
    btn.setProperties({ [Object.keys(btn.componentProperties).find((k) => k.startsWith('名'))]: name });
    if (badge) {
      const b = made.component.get('TRIAD_NotificationBadge').createInstance();
      btn.appendChild(b);
      b.layoutPositioning = 'ABSOLUTE';
      b.x = 34; b.y = 0;
      b.setProperties({ [Object.keys(b.componentProperties).find((k) => k.startsWith('数'))]: badge });
    }
  }

  const window = frame(mid, '立ち絵の見える場所', {});
  window.layoutGrow = 1;
  window.layoutSizingVertical = 'FILL';
  window.fills = [];

  const right = frame(mid, '右の柱', { layout: 'VERTICAL', gap: 6 });
  right.resize(m.width <= 320 ? 118 : 138, 10);
  right.layoutSizingHorizontal = 'FIXED';
  right.layoutSizingVertical = 'HUG';

  const banner = frame(right, '告知バナー', {
    layout: 'VERTICAL', gap: 1, align: 'CENTER', justify: 'CENTER',
    pad: [8, 6, 8, 6], radius: 8,
    fill: fillOf('--ai-deep'), stroke: strokeOf('--kin-2'),
  });
  banner.layoutSizingHorizontal = 'FILL';
  await text(banner, '新章 開幕', {
    font: made.textStyle.get('見出し').fontName, size: 15, letterSpacing: 8,
    color: tokenColor.get('--kinpaku').values.sumi, align: 'CENTER',
  });
  await text(banner, '六つの碁印と月の響', {
    font: made.textStyle.get('補助').fontName, size: 9,
    color: tokenColor.get('--fg-2').values.sumi, align: 'CENTER',
  });
  const dots = frame(banner, 'ページ点', { layout: 'HORIZONTAL', gap: 4, justify: 'CENTER' });
  dots.layoutSizingHorizontal = 'FILL';
  for (let i = 0; i < 5; i += 1) {
    const d = figma.createEllipse();
    d.resize(4, 4);
    d.fills = [{ type: 'SOLID', color: tokenColor.get('--kin').values.sumi, opacity: i === 0 ? 1 : 0.35 }];
    dots.appendChild(d);
    d.layoutSizingHorizontal = 'FIXED';
    d.layoutSizingVertical = 'FIXED';
  }

  const plate = frame(right, 'キャラの額', {
    layout: 'VERTICAL', gap: 3, pad: [8, 8, 8, 8], radius: 8,
    fill: fillOf('--urushi'), stroke: strokeOf('--kin-2'),
  });
  plate.layoutSizingHorizontal = 'FILL';
  await text(plate, 'ヒバナ', {
    font: made.textStyle.get('見出し').fontName, size: 15,
    color: tokenColor.get('--gofun').values.sumi,
  });
  await text(plate, '火花ノ華、花の帳', {
    font: made.textStyle.get('補助').fontName, size: 9.5,
    color: tokenColor.get('--fg-3').values.sumi, hSize: 'FILL',
  });
  await text(plate, '「この一手が、世界を変えるかもね？」', {
    font: made.textStyle.get('補助').fontName, size: 9.5, lineHeight: 160,
    color: tokenColor.get('--fg-2').values.sumi, hSize: 'FILL',
  });
  const change = frame(plate, 'キャラ変更', {
    layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
    h: 30, radius: 6, fill: fillOf('--urushi-2'), stroke: strokeOf('--line-kin'),
  });
  change.layoutSizingHorizontal = 'FILL';
  change.layoutSizingVertical = 'FIXED';
  await text(change, 'キャラ変更 ›', {
    font: made.textStyle.get('補助').fontName, size: 11,
    color: tokenColor.get('--kin').values.sumi,
  });
  return mid;
}

async function homeCatch(parent) {
  const box = frame(parent, 'キャッチ', { layout: 'VERTICAL', gap: 2 });
  box.layoutSizingHorizontal = 'FILL';
  const t = made.textStyle.get('タイトル');
  const a = await text(box, 'つながる一手、', {
    font: t.fontName, size: t.fontSize * 0.72, letterSpacing: 16,
    color: tokenColor.get('--gofun').values.sumi,
  });
  a.name = 'キャッチ上';
  const b = await text(box, '広がる世界', {
    font: t.fontName, size: t.fontSize * 0.72, letterSpacing: 16,
    color: tokenColor.get('--gofun').values.sumi,
  });
  b.x = 18;
  b.name = 'キャッチ下';
  await text(box, '碁が紡ぐ、もうひとつの物語', {
    font: made.textStyle.get('補助').fontName, size: 10, letterSpacing: 6,
    color: tokenColor.get('--fg-3').values.sumi,
  });
  return box;
}

async function homeActions(parent, m) {
  const main = frame(parent, '主要ボタン', { layout: 'HORIZONTAL', gap: m.gap });
  main.layoutSizingHorizontal = 'FILL';
  const dest = {};
  for (const [label, sub] of [['対戦', '三人で一局'], ['物語', '六つの碁印']]) {
    const inst = made.component.get('TRIAD_PrimaryButton').createInstance();
    main.appendChild(inst);
    inst.layoutGrow = 1;
    inst.resize(inst.width, m.primaryH);
    const keys = Object.keys(inst.componentProperties);
    inst.setProperties({
      [keys.find((k) => k.startsWith('主'))]: label,
      [keys.find((k) => k.startsWith('副'))]: sub,
    });
    inst.name = label;
    dest[label] = inst;
  }

  const subRow = frame(parent, '副ボタン', { layout: 'HORIZONTAL', gap: m.width <= 320 ? 5 : 7 });
  subRow.layoutSizingHorizontal = 'FILL';
  for (const [label, note] of [['世界', 'オンライン'], ['ガチャ', '籤を引く'],
    ['衣', '着せ替え'], ['鍛', 'キャラ強化']]) {
    const inst = made.component.get('TRIAD_SecondaryButton').createInstance();
    subRow.appendChild(inst);
    inst.layoutGrow = 1;
    inst.resize(inst.width, m.subH);
    const keys = Object.keys(inst.componentProperties);
    inst.setProperties({
      [keys.find((k) => k.startsWith('主'))]: label,
      [keys.find((k) => k.startsWith('副'))]: note,
    });
    inst.name = label;
    dest[label] = inst;
  }
  return { main, subRow, dest };
}

async function homeBelowFold(parent, m) {
  const gacha = frame(parent, 'ガチャ告知', {
    layout: 'HORIZONTAL', gap: 10, align: 'CENTER',
    pad: [10, 12, 10, 12], radius: 10, h: 68,
    fill: fillOf('--urushi'), stroke: strokeOf('--kin-2'),
  });
  gacha.layoutSizingHorizontal = 'FILL';
  gacha.layoutSizingVertical = 'FIXED';
  const face = figma.createEllipse();
  face.resize(44, 44);
  face.fills = [fillOf('--surface-2')];
  gacha.appendChild(face);
  face.layoutSizingHorizontal = 'FIXED';
  face.layoutSizingVertical = 'FIXED';
  const gcol = frame(gacha, '文', { layout: 'VERTICAL', gap: 1 });
  gcol.layoutGrow = 1;
  await text(gcol, '期間限定', {
    font: made.textStyle.get('補助').fontName, size: 9,
    color: tokenColor.get('--shu').values.sumi,
  });
  await text(gcol, '暁の継承者', {
    font: made.textStyle.get('見出し').fontName, size: 17, letterSpacing: 8,
    color: tokenColor.get('--kinpaku').values.sumi,
  });
  await text(gcol, 'ピックアップガチャ', {
    font: made.textStyle.get('補助').fontName, size: 9,
    color: tokenColor.get('--fg-3').values.sumi,
  });

  const social = frame(parent, '交流', {
    layout: 'VERTICAL', gap: 6, pad: [10, 12, 12, 12], radius: 10,
    fill: fillOf('--surface-1'), stroke: strokeOf('--line-kin'),
  });
  social.layoutSizingHorizontal = 'FILL';
  await text(social, '交流', {
    font: made.textStyle.get('見出し').fontName, size: 14,
    color: tokenColor.get('--kin').values.sumi,
  });
  await text(social, 'あなたのプレイヤーコード', {
    font: made.textStyle.get('補助').fontName, size: 10,
    color: tokenColor.get('--fg-3').values.sumi,
  });
  const codeRow = frame(social, 'コード', { layout: 'HORIZONTAL', gap: 8, align: 'CENTER' });
  codeRow.layoutSizingHorizontal = 'FILL';
  const code = await text(codeRow, 'TRD-1234-5678', {
    font: made.textStyle.get('数字').fontName, size: 18, letterSpacing: 6,
    color: tokenColor.get('--fg-1').values.sumi,
  });
  code.layoutGrow = 1;
  const copy = frame(codeRow, '写す', {
    layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
    w: 44, h: 44, radius: 8, fill: fillOf('--surface-2'), stroke: strokeOf('--line-kin'),
  });
  copy.layoutSizingHorizontal = 'FIXED';
  copy.layoutSizingVertical = 'FIXED';
  await text(copy, '⧉', {
    font: made.textStyle.get('本文').fontName, size: 16,
    color: tokenColor.get('--kin').values.sumi,
  });
  return { gacha, social };
}

/* ───────── 1 枚組み立てる ───────── */

/**
 * @param {'上'|'下'} part 画面の上半分（初回に見えるところ）か、
 *   下へ送ったところか。完成イメージは 1 画面に収まっていないので分ける。
 */
async function buildHomeFrame(page, width, tokens, part) {
  const m = metricsFor(width, tokens);
  const root = mark(frame(page, `01_Home/${width}${part === '下' ? '／送り' : ''}`, {
    w: m.width, h: m.height,
  }));
  root.fills = [fillOf('--bg-2')];

  await stageBackdrop(root, m, tokens);

  const fg = frame(root, '前景', {
    layout: 'VERTICAL', gap: m.gap,
    pad: [10, m.gutter, m.navH + m.gap, m.gutter],
  });
  fg.layoutPositioning = 'ABSOLUTE';
  fg.x = 0; fg.y = 0;
  fg.resize(m.width, m.height);
  fg.primaryAxisSizingMode = 'FIXED';
  fg.counterAxisSizingMode = 'FIXED';

  if (part === '上') {
    await homeTopBar(fg, m);
    const card = made.component.get('TRIAD_PlayerCard').createInstance();
    fg.appendChild(card);
    card.layoutSizingHorizontal = 'FILL';
    await homeMiddle(fg, m);
    await homeCatch(fg);
    const { dest } = await homeActions(fg, m);
    root.setPluginData('dest', '1');
    homeTargets.set(`${width}`, dest);
  } else {
    const spacer = frame(fg, '送りの上（画面外）', {});
    spacer.layoutSizingHorizontal = 'FILL';
    spacer.layoutGrow = 1;
    spacer.fills = [];
    const { dest } = await homeActions(fg, m);
    homeTargets.set(`${width}下`, dest);
    await homeBelowFold(fg, m);
  }

  const nav = made.component.get('TRIAD_Navigation').createInstance();
  root.appendChild(nav);
  nav.layoutPositioning = 'ABSOLUTE';
  nav.resize(m.width, m.navH);
  nav.x = 0;
  nav.y = m.height - m.navH;

  return root;
}

/** 幅 → { ボタン名: Instance }。試作の繋ぎ先を張るのに使う。 */
const homeTargets = new Map();

async function buildHome(tokens, page) {
  const frames = [];
  let x = 0;
  for (const width of [390, 320, 430]) {
    for (const part of width === 390 ? ['上', '下'] : ['上']) {
      const f = await buildHomeFrame(page, width, tokens, part);
      f.x = x;
      f.y = 0;
      x += f.width + 80;
      frames.push(f);
    }
  }
  say(`ホーム ${frames.length} 枚（390 の上下 / 320 / 430）`);
  return frames;
}
