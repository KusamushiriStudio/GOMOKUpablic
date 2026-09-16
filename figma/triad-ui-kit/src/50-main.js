/* ═══════════════════════════════════════════════════════════════════════
 * 入口
 * ═══════════════════════════════════════════════════════════════════════ */

/** §0-4 のページ構成。順番のとおりに並べる。 */
const PAGES = [
  '00_DesignSystem', '01_Home', '02_Battle', '03_Online', '04_Practice',
  '05_Story', '06_Gacha', '07_DressUp', '08_Friends', '09_Spectator',
  '10_Settings', '11_Result', '12_Components', '13_Prototype',
];

/** 試作の繋ぎ先。ホームのボタン名 → 行き先のページ。 */
const FLOW = [
  ['対戦', '02_Battle'],
  ['物語', '05_Story'],
  ['世界', '03_Online'],
  ['ガチャ', '06_Gacha'],
  ['衣', '07_DressUp'],
];

/** 行き先の仮の画面。中身はまだ決めていないと分かる形にしておく。 */
async function stubScreen(page, title, note, tokens) {
  const existing = page.children.find((n) => n.name === `${page.name}/390` && isGenerated(n));
  if (existing) existing.remove();
  const m = metricsFor(390, tokens);
  const f = mark(frame(page, `${page.name}/390`, { w: m.width, h: m.height }));
  f.x = 0; f.y = 0;
  f.fills = [fillOf('--bg-2')];

  const body = frame(f, '中身', {
    layout: 'VERTICAL', gap: 12, pad: [24, m.gutter, m.navH + 16, m.gutter], align: 'CENTER',
  });
  body.layoutPositioning = 'ABSOLUTE';
  body.x = 0; body.y = 0;
  body.resize(m.width, m.height);
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';

  await text(body, title, {
    font: made.textStyle.get('タイトル').fontName,
    size: made.textStyle.get('タイトル').fontSize, letterSpacing: 16,
    color: tokenColor.get('--kinpaku').values.sumi, align: 'CENTER', hSize: 'FILL',
  });
  await text(body, note, {
    font: made.textStyle.get('本文').fontName, size: 14, lineHeight: 175,
    color: tokenColor.get('--fg-2').values.sumi, align: 'CENTER', hSize: 'FILL',
  });
  await text(body, '※ この画面はまだ設計していない。ホームから遷移できることの確認用。', {
    font: made.textStyle.get('補助').fontName, size: 11, lineHeight: 165,
    color: tokenColor.get('--fg-3').values.sumi, align: 'CENTER', hSize: 'FILL',
  });

  const nav = made.component.get('TRIAD_Navigation').createInstance();
  f.appendChild(nav);
  nav.layoutPositioning = 'ABSOLUTE';
  nav.resize(m.width, m.navH);
  nav.x = 0;
  nav.y = m.height - m.navH;
  return f;
}

/** ホームのボタンから行き先へ線を張る（§0-10）。 */
async function wirePrototype(destinations) {
  const targets = homeTargets.get('390');
  if (!targets) { say('⚠ ホーム 390 のボタンが見つからず、試作の線を張れませんでした'); return 0; }
  let wired = 0;
  for (const [label, pageName] of FLOW) {
    const from = targets[label];
    const to = destinations.get(pageName);
    if (!from || !to) continue;
    try {
      await from.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{
          type: 'NODE',
          destinationId: to.id,
          navigation: 'NAVIGATE',
          transition: {
            type: 'SMART_ANIMATE',
            easing: { type: 'EASE_OUT' },
            duration: 0.3,                 // --dur-3 = 0.30s
          },
          preserveScrollPosition: false,
        }],
      }]);
      wired += 1;
    } catch (e) {
      say(`⚠ 「${label}」の線を張れませんでした: ${e.message}`);
    }
  }
  return wired;
}

/* ───────── 実行 ───────── */

async function main() {
  const started = Date.now();
  const tokens = DATA.tokens;

  // dynamic-page では、既にあるページは明示的に読み込まないと中を触れない
  await figma.loadAllPagesAsync();

  const pages = new Map();
  for (const name of PAGES) pages.set(name, ensurePage(name));
  // §0-4 の並びにそろえる（利用者が作った別のページは後ろに残す）
  PAGES.forEach((name, i) => { figma.root.insertChild(i, pages.get(name)); });
  say(`ページ ${PAGES.length} 枚`);

  for (const name of PAGES) clearGenerated(pages.get(name));

  await buildVariables(tokens);
  await buildTextStyles(tokens);
  await buildEffectStyles(tokens);
  await buildPaintStyles(tokens);
  await drawSystemBoard(tokens, pages.get('00_DesignSystem'));
  await buildComponents(tokens, pages.get('12_Components'));
  await buildHome(tokens, pages.get('01_Home'));

  const destinations = new Map();
  for (const [, pageName] of FLOW) {
    if (destinations.has(pageName)) continue;
    const title = { '02_Battle': '対戦', '05_Story': '物語', '03_Online': '世界', '06_Gacha': 'ガチャ', '07_DressUp': '着せ替え' }[pageName];
    const note = {
      '02_Battle': '三人で一局。盤は SVG のまま（見やすさを落とさない）。',
      '05_Story': '六つの碁印。進行と褒美はサーバが決める。',
      '03_Online': 'オンライン対戦。待合と観戦。',
      '06_Gacha': '籤。確率と結果はサーバが決める。',
      '07_DressUp': '着せ替え。装備は 864 通りの組み合わせ。',
    }[pageName];
    destinations.set(pageName, await stubScreen(pages.get(pageName), title, note, tokens));
  }
  const wired = await wirePrototype(destinations);
  say(`試作の線 ${wired} 本`);

  await figma.setCurrentPageAsync(pages.get('01_Home'));
  const home = pages.get('01_Home').children.find((n) => n.name === '01_Home/390');
  if (home) {
    figma.currentPage.selection = [home];
    figma.viewport.scrollAndZoomIntoView([home]);
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const warnings = log.filter((l) => l.startsWith('⚠'));
  figma.notify(warnings.length
    ? `TRIAD UI Kit: ${seconds}秒で作成（注意 ${warnings.length} 件はコンソール）`
    : `TRIAD UI Kit: ${seconds}秒で作成しました`, { timeout: 6000 });
  console.log(`\n── ${seconds}秒 ──\n` + log.join('\n'));
}

main()
  .then(() => figma.closePlugin())
  .catch((e) => {
    console.error(e);
    figma.notify(`TRIAD UI Kit で失敗: ${e.message}`, { error: true, timeout: 10000 });
    figma.closePlugin(`失敗: ${e.message}`);
  });
