/* ═══════════════════════════════════════════════════════════════════════
 * 12_Components — 部品（§0-7 COMPONENTS・§0-8・§0-9）
 *
 * 同じボタンを画面ごとに描き直さない。ここで Component として作り、
 * 画面側は Instance を置くだけにする。
 *
 * 色は必ず変数へ束ねる。直接 hex を置くと、Figma でテーマを切り替えたときに
 * その部品だけ取り残される。
 * ═══════════════════════════════════════════════════════════════════════ */

/** トークン名 → tokens.json の色の行。 */
let tokenColor = new Map();

/** 変数に束ねた単色の塗り。変数が無ければ素の色で置く。 */
function fillOf(token, mode) {
  const entry = tokenColor.get(token);
  if (!entry) return { type: 'SOLID', color: { r: 1, g: 0, b: 1 }, opacity: 1 };  // 見落とし用の目立つ色
  const paint = solid(entry.values[mode || 'sumi']);
  const variable = made.color.get(token);
  return variable ? figma.variables.setBoundVariableForPaint(paint, 'color', variable) : paint;
}

function strokeOf(token, mode) { return fillOf(token, mode); }

/** 寸法の変数へ束ねる。束ねられなければ値をそのまま入れる。 */
function bindSize(node, field, token, fallback) {
  const variable = made.size.get(token);
  if (variable) { try { node.setBoundVariable(field, variable); return; } catch { /* 下へ落とす */ } }
  if (fallback !== undefined) node[field] = fallback;
}

/** 画面側から名前で取り出せるように控える。 */
function keep(component, name) {
  component.name = name;
  mark(component);
  made.component.set(name, component);
  return component;
}

/**
 * Component をひとつ用意する。同名があれば中身を捨てて作り直す
 * （Instance は名前で繋がっているので、作り直しても差し替わる）。
 */
function component(page, name) {
  const existing = page.children.find((n) => n.type === 'COMPONENT' && n.name === name);
  if (existing) { for (const c of [...existing.children]) c.remove(); return existing; }
  const c = figma.createComponent();
  page.appendChild(c);
  return c;
}

/* ═════════════ 部品 ═════════════ */

/**
 * 主要ボタン（木札）。ホームの「対戦」「物語」。
 *
 * 高さは完成イメージに合わせて画面幅の約28%（390px 幅で 109px）。
 * 現行実装の .mokufuda は min-height 92px なので、ここが差になる。
 */
async function makePrimaryButton(page, tokens) {
  const c = component(page, 'TRIAD_PrimaryButton');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 2;
  c.paddingTop = 14; c.paddingBottom = 10; c.paddingLeft = 8; c.paddingRight = 8;
  c.resize(185, 109);
  c.fills = [fillOf('--kiji-1'), fillOf('--kiji-2')].slice(0, 1);
  c.strokes = [strokeOf('--kin-2')];
  c.strokeWeight = 1;
  c.topLeftRadius = 10; c.topRightRadius = 10;
  c.bottomLeftRadius = 13; c.bottomRightRadius = 13;
  const shadow = made.effect.get('--shadow-2/sumi');
  if (shadow) await c.setEffectStyleIdAsync(shadow.id);

  const main = await text(c, '対戦', {
    font: made.textStyle.get('大見出し').fontName,
    size: made.textStyle.get('大見出し').fontSize,
    letterSpacing: 18, color: tokenColor.get('--gofun').values.sumi, align: 'CENTER',
  });
  main.name = '主';
  const sub = await text(c, '三人で一局', {
    font: made.textStyle.get('補助').fontName, size: 11,
    letterSpacing: 4, color: tokenColor.get('--kinpaku').values.sumi, align: 'CENTER',
  });
  sub.name = '副';

  // 画面ごとに文言だけ差し替えられるようにする（§0-8）
  const mainProp = c.addComponentProperty('主', 'TEXT', '対戦');
  const subProp = c.addComponentProperty('副', 'TEXT', '三人で一局');
  main.componentPropertyReferences = { characters: mainProp };
  sub.componentPropertyReferences = { characters: subProp };

  c.description = 'ホームの「対戦」「物語」。高さ109px＝390px幅の28%。'
    + '実装は .mokufuda（index.html 1428-1458）。現行は min-height 92px。';
  return keep(c, 'TRIAD_PrimaryButton');
}

/** 副ボタン（小さい木札）。世界・ガチャ・衣・鍛。 */
async function makeSecondaryButton(page) {
  const c = component(page, 'TRIAD_SecondaryButton');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 1;
  c.paddingTop = 8; c.paddingBottom = 7; c.paddingLeft = 4; c.paddingRight = 4;
  c.resize(88, 66);
  c.fills = [fillOf('--urushi-2')];
  c.strokes = [strokeOf('--kin-2')];
  c.strokeWeight = 1;
  c.cornerRadius = 8;

  const main = await text(c, '世界', {
    font: made.textStyle.get('見出し').fontName, size: 16,
    letterSpacing: 8, color: tokenColor.get('--gofun').values.sumi, align: 'CENTER',
  });
  main.name = '主';
  const sub = await text(c, 'オンライン', {
    font: made.textStyle.get('補助').fontName, size: 9.5,
    color: tokenColor.get('--kin').values.sumi, align: 'CENTER',
  });
  sub.name = '副';
  main.componentPropertyReferences = { characters: c.addComponentProperty('主', 'TEXT', '世界') };
  sub.componentPropertyReferences = { characters: c.addComponentProperty('副', 'TEXT', 'オンライン') };

  c.description = '4枚並ぶ副入口。390px 幅で (390-2*10-3*7)/4 = 87.25 → 88px。';
  return keep(c, 'TRIAD_SecondaryButton');
}

/** 通貨の丸札（金貨＋数＋⊕）。完成イメージの最上段。 */
async function makeCurrency(page) {
  const c = component(page, 'TRIAD_Currency');
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 6;
  // ⊕ は購入への入口で、押させる。だから札ごと最小タップ 44px を確保する。
  // 完成イメージの見た目は細い丸札だが、細いまま押させると 44px を割る。
  c.paddingLeft = 8; c.paddingRight = 0; c.paddingTop = 0; c.paddingBottom = 0;
  c.resize(124, 44);
  c.fills = [fillOf('--urushi')];
  c.strokes = [strokeOf('--line-kin')];
  c.strokeWeight = 1;
  c.cornerRadius = 999;

  const coin = figma.createEllipse();
  coin.name = '貨';
  coin.resize(20, 20);
  coin.fills = [fillOf('--kinpaku')];
  c.appendChild(coin);
  coin.layoutSizingHorizontal = 'FIXED';
  coin.layoutSizingVertical = 'FIXED';

  const value = await text(c, '179,516', {
    font: made.textStyle.get('数字').fontName, size: 13,
    color: tokenColor.get('--gofun').values.sumi,
  });
  value.name = '数';
  value.layoutGrow = 1;
  value.textAlignHorizontal = 'RIGHT';

  const plus = frame(c, '⊕', {
    layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
    w: 44, h: 44, radius: 999, fill: fillOf('--kin'),
  });
  plus.layoutSizingHorizontal = 'FIXED';
  plus.layoutSizingVertical = 'FIXED';
  await text(plus, '＋', {
    font: made.textStyle.get('補助').fontName, size: 15,
    color: tokenColor.get('--urushi').values.sumi,
  });

  value.componentPropertyReferences = { characters: c.addComponentProperty('数', 'TEXT', '179,516') };
  c.description = '完成イメージの最上段の通貨。⊕ は購入導線。'
    + '注意: 第2通貨（青い宝玉）は profile に残高が無いので、いまは金貨のみ。';
  return keep(c, 'TRIAD_Currency');
}

/** 報せの赤丸。数字か「！」。 */
async function makeBadge(page) {
  const c = component(page, 'TRIAD_NotificationBadge');
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.resize(18, 18);
  c.fills = [fillOf('--shu')];
  c.strokes = [strokeOf('--gofun')];
  c.strokeWeight = 1.5;
  c.cornerRadius = 999;
  const n = await text(c, '3', {
    font: made.textStyle.get('数字').fontName, size: 10,
    color: tokenColor.get('--shu-ink').values.sumi, align: 'CENTER',
  });
  n.name = '数';
  n.componentPropertyReferences = { characters: c.addComponentProperty('数', 'TEXT', '3') };
  c.description = '未読の報せ。18px は最小タップ 44px を満たさないので、単体では押させない。';
  return keep(c, 'TRIAD_NotificationBadge');
}

/** 左端の菱形ボタン（フレンド・お知らせ・ミッション・順位）。 */
async function makeRailButton(page) {
  const c = component(page, 'TRIAD_RailButton');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 1;
  c.resize(52, 52);                       // 最小タップ 44px を超える
  c.fills = [];

  const plate = figma.createPolygon();     // 菱形は 4 角の多角形を 45 度回す代わりに
  plate.pointCount = 4;                    // 4 角形として作り、回転で菱形にする
  plate.resize(44, 44);
  plate.rotation = 45;
  plate.fills = [fillOf('--urushi-2')];
  plate.strokes = [strokeOf('--kin-2')];
  plate.strokeWeight = 1;
  plate.name = '額';
  c.appendChild(plate);
  plate.layoutPositioning = 'ABSOLUTE';
  plate.x = 4; plate.y = 4;

  const label = await text(c, 'フレンド', {
    font: made.textStyle.get('補助').fontName, size: 9,
    color: tokenColor.get('--gofun').values.sumi, align: 'CENTER',
  });
  label.name = '名';
  label.componentPropertyReferences = { characters: c.addComponentProperty('名', 'TEXT', 'フレンド') };

  c.description = '完成イメージ左端の縦一列。52×52 で最小タップ 44px を満たす。';
  return keep(c, 'TRIAD_RailButton');
}

/** 身分帯（肖像・名前・Lv・XP・段位・称号・歯車）。 */
async function makePlayerCard(page) {
  const c = component(page, 'TRIAD_PlayerCard');
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 10;
  c.paddingLeft = 8; c.paddingRight = 8; c.paddingTop = 7; c.paddingBottom = 7;
  c.resize(370, 62);
  c.fills = [fillOf('--urushi')];
  c.strokes = [strokeOf('--line-kin')];
  c.strokeWeight = 1;
  c.cornerRadius = 12;

  const avatar = figma.createEllipse();
  avatar.name = '肖像';
  avatar.resize(46, 46);
  avatar.fills = [fillOf('--surface-2')];
  avatar.strokes = [strokeOf('--kinpaku')];
  avatar.strokeWeight = 2;
  c.appendChild(avatar);
  avatar.layoutSizingHorizontal = 'FIXED';
  avatar.layoutSizingVertical = 'FIXED';

  const col = frame(c, '名とLv', { layout: 'VERTICAL', gap: 3 });
  col.layoutGrow = 1;
  col.layoutSizingVertical = 'HUG';
  const name = await text(col, 'あなた', {
    font: made.textStyle.get('見出し').fontName, size: 15,
    color: tokenColor.get('--gofun').values.sumi,
  });
  name.name = '名';
  const lvRow = frame(col, 'Lv行', { layout: 'HORIZONTAL', gap: 6, align: 'CENTER' });
  lvRow.layoutSizingHorizontal = 'FILL';
  const lv = await text(lvRow, 'Lv.115', {
    font: made.textStyle.get('数字').fontName, size: 12,
    color: tokenColor.get('--kin').values.sumi,
  });
  lv.name = 'Lv';
  const bar = frame(lvRow, 'XP溝', { h: 5, radius: 999, fill: fillOf('--surface-inset') });
  bar.layoutGrow = 1;
  bar.layoutSizingVertical = 'FIXED';
  const fillBar = frame(bar, 'XP', { fill: fillOf('--kinpaku'), radius: 999 });
  fillBar.layoutPositioning = 'ABSOLUTE';
  fillBar.x = 0; fillBar.y = 0;
  fillBar.resize(Math.max(bar.width * 0.62, 1), 5);
  const rest = await text(lvRow, 'あと 40532', {
    font: made.textStyle.get('補助').fontName, size: 10,
    color: tokenColor.get('--fg-3').values.sumi,
  });
  rest.name = '残り';

  for (const [title, value] of [['段位', '六段'], ['称号', '四季の継承者']]) {
    const plate = frame(c, title, {
      layout: 'VERTICAL', gap: 0, align: 'CENTER', justify: 'CENTER',
      pad: [4, 6, 4, 6], radius: 6, fill: fillOf('--urushi-2'),
      stroke: strokeOf('--kin-2'),
    });
    plate.layoutSizingVertical = 'HUG';
    await text(plate, title, {
      font: made.textStyle.get('補助').fontName, size: 8,
      color: tokenColor.get('--fg-3').values.sumi, align: 'CENTER',
    });
    await text(plate, value, {
      font: made.textStyle.get('補助').fontName, size: 11,
      color: tokenColor.get('--kin').values.sumi, align: 'CENTER',
    });
  }

  const gear = frame(c, '設定', {
    layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
    w: 44, h: 44, radius: 10, fill: fillOf('--urushi-2'), stroke: strokeOf('--line-kin'),
  });
  gear.layoutSizingHorizontal = 'FIXED';
  gear.layoutSizingVertical = 'FIXED';
  await text(gear, '⚙', {
    font: made.textStyle.get('本文').fontName, size: 18,
    color: tokenColor.get('--kin').values.sumi,
  });

  name.componentPropertyReferences = { characters: c.addComponentProperty('名', 'TEXT', 'あなた') };
  lv.componentPropertyReferences = { characters: c.addComponentProperty('Lv', 'TEXT', 'Lv.115') };
  rest.componentPropertyReferences = { characters: c.addComponentProperty('残り', 'TEXT', 'あと 40532') };

  c.description = '現行の .home-topbar（index.html 1178-1210）に、段位・称号・歯車を足したもの。'
    + '現行は名前/Lv/XP/ペリカの4つだけで、段位と称号はデータも無い。';
  return keep(c, 'TRIAD_PlayerCard');
}

/** 最下部ナビ 6 つ。 */
async function makeNavigation(page, tokens) {
  const c = component(page, 'TRIAD_Navigation');
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.itemSpacing = 0;
  c.resize(390, numberOf(tokens, '--nav-h', 60));
  c.fills = [fillOf('--surface-urushi')];
  c.strokes = [strokeOf('--line-kin')];
  c.strokeTopWeight = 1;
  c.strokeBottomWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0;

  const items = [['⌂', 'ホーム', true], ['碁', '対戦'], ['人', 'キャラ'],
    ['籤', 'ガチャ'], ['衣', '着せ替え'], ['≡', 'メニュー']];
  for (const [icon, label, current] of items) {
    const cell = frame(c, label, {
      layout: 'VERTICAL', gap: 2, align: 'CENTER', justify: 'CENTER',
    });
    cell.layoutGrow = 1;
    cell.layoutSizingVertical = 'FILL';
    await text(cell, icon, {
      font: made.textStyle.get('見出し').fontName, size: 17,
      color: tokenColor.get(current ? '--kin' : '--fg-3').values.sumi, align: 'CENTER',
    });
    await text(cell, label, {
      font: made.textStyle.get('補助').fontName, size: 10,
      color: tokenColor.get(current ? '--kin' : '--fg-3').values.sumi, align: 'CENTER',
    });
  }
  c.description = '実装は index.html 1843-1848。6番目のラベルだけ「設定」→「メニュー」に変えてある。'
    + `高さは --nav-h = ${numberOf(tokens, '--nav-h', 60)}px。`;
  return keep(c, 'TRIAD_Navigation');
}

/** キャラの札（着せ替え・キャラ一覧で使う）。 */
async function makeCharacterCard(page) {
  const c = component(page, 'TRIAD_CharacterCard');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.itemSpacing = 6;
  c.paddingTop = 8; c.paddingBottom = 8; c.paddingLeft = 8; c.paddingRight = 8;
  c.resize(112, 10);
  c.fills = [fillOf('--surface-1')];
  c.strokes = [strokeOf('--line-kin')];
  c.strokeWeight = 1;
  c.cornerRadius = 12;

  const art = frame(c, '立ち絵', { fill: fillOf('--surface-2'), radius: 8, h: 120 });
  art.layoutSizingHorizontal = 'FILL';
  art.layoutSizingVertical = 'FIXED';
  const name = await text(c, 'ヒバナ', {
    font: made.textStyle.get('見出し').fontName, size: 14,
    color: tokenColor.get('--fg-1').values.sumi, align: 'CENTER', hSize: 'FILL',
  });
  name.name = '名';
  const skill = await text(c, '火花ノ華', {
    font: made.textStyle.get('補助').fontName, size: 11,
    color: tokenColor.get('--fg-3').values.sumi, align: 'CENTER', hSize: 'FILL',
  });
  skill.name = '技';
  name.componentPropertyReferences = { characters: c.addComponentProperty('名', 'TEXT', 'ヒバナ') };
  skill.componentPropertyReferences = { characters: c.addComponentProperty('技', 'TEXT', '火花ノ華') };
  c.description = '立ち絵は characterHero()（index.html 11130-）のSVG。'
    + '装備 864 通りの組み合わせがあるので画像に焼かない。';
  return keep(c, 'TRIAD_CharacterCard');
}

/** 技のボタン（対局中）。盤面には触らないが、盤の外の操作列で使う。 */
async function makeSkillButton(page, tokens) {
  const c = component(page, 'TRIAD_SkillButton');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 2;
  c.resize(96, numberOf(tokens, '--tap', 44));
  c.fills = [fillOf('--surface-2')];
  c.strokes = [strokeOf('--line-kin-2')];
  c.strokeWeight = 1;
  c.cornerRadius = 10;
  const label = await text(c, '火の粉', {
    font: made.textStyle.get('見出し').fontName, size: 14,
    color: tokenColor.get('--fg-1').values.sumi, align: 'CENTER',
  });
  label.name = '技名';
  await text(c, '残り 1', {
    font: made.textStyle.get('補助').fontName, size: 10,
    color: tokenColor.get('--fg-3').values.sumi, align: 'CENTER',
  });
  label.componentPropertyReferences = { characters: c.addComponentProperty('技名', 'TEXT', '火の粉') };
  c.description = `高さは --tap = ${numberOf(tokens, '--tap', 44)}px。ここを下回らせない。`;
  return keep(c, 'TRIAD_SkillButton');
}

/** 確認の窓。 */
async function makeDialog(page) {
  const c = component(page, 'TRIAD_Dialog');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.itemSpacing = 12;
  c.paddingTop = 18; c.paddingBottom = 16; c.paddingLeft = 16; c.paddingRight = 16;
  c.resize(320, 10);
  c.fills = [fillOf('--surface-3')];
  c.strokes = [strokeOf('--line-kin')];
  c.strokeWeight = 1;
  c.cornerRadius = 16;
  const shadow = made.effect.get('--shadow-3/sumi');
  if (shadow) await c.setEffectStyleIdAsync(shadow.id);

  const title = await text(c, 'この手でよいですか', {
    font: made.textStyle.get('見出し').fontName, size: 16,
    color: tokenColor.get('--fg-1').values.sumi, hSize: 'FILL',
  });
  title.name = '題';
  const body = await text(c, '置いたあとは戻せません。', {
    font: made.textStyle.get('本文').fontName, size: 14, lineHeight: 155,
    color: tokenColor.get('--fg-2').values.sumi, hSize: 'FILL',
  });
  body.name = '本文';

  const row = frame(c, '選択', { layout: 'HORIZONTAL', gap: 8 });
  row.layoutSizingHorizontal = 'FILL';
  for (const [label, kind] of [['やめる', 'sub'], ['置く', 'main']]) {
    const b = frame(row, label, {
      layout: 'HORIZONTAL', align: 'CENTER', justify: 'CENTER',
      h: 44, radius: 10,
      fill: fillOf(kind === 'main' ? '--ok-deep' : '--surface-2'),
      stroke: strokeOf('--line-kin'),
    });
    b.layoutGrow = 1;
    b.layoutSizingVertical = 'FIXED';
    await text(b, label, {
      font: made.textStyle.get('本文').fontName, size: 15,
      color: tokenColor.get(kind === 'main' ? '--kin-ink' : '--fg-1').values.sumi,
    });
  }
  title.componentPropertyReferences = { characters: c.addComponentProperty('題', 'TEXT', 'この手でよいですか') };
  body.componentPropertyReferences = { characters: c.addComponentProperty('本文', 'TEXT', '置いたあとは戻せません。') };
  c.description = '取り消しと決定の文言を必ず別にする（同じ「やめる」が2つ並んでいた不具合がある）。';
  return keep(c, 'TRIAD_Dialog');
}

/** 対局の結果。 */
async function makeResultPanel(page) {
  const c = component(page, 'TRIAD_ResultPanel');
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 10;
  c.paddingTop = 24; c.paddingBottom = 20; c.paddingLeft = 16; c.paddingRight = 16;
  c.resize(340, 10);
  c.fills = [fillOf('--surface-1')];
  c.strokes = [strokeOf('--kin-2')];
  c.strokeWeight = 1;
  c.cornerRadius = 16;

  const verdict = await text(c, '勝利', {
    font: made.textStyle.get('タイトル').fontName,
    size: made.textStyle.get('タイトル').fontSize,
    letterSpacing: 16, color: tokenColor.get('--kin').values.sumi, align: 'CENTER',
  });
  verdict.name = '勝敗';
  const line = await text(c, '五目が並びました', {
    font: made.textStyle.get('本文').fontName, size: 14,
    color: tokenColor.get('--fg-2').values.sumi, align: 'CENTER',
  });
  line.name = '説明';
  const rewards = frame(c, '褒美', { layout: 'HORIZONTAL', gap: 10, justify: 'CENTER' });
  rewards.layoutSizingHorizontal = 'FILL';
  for (const [label, value] of [['ペリカ', '+120'], ['経験', '+340']]) {
    const cell = frame(rewards, label, {
      layout: 'VERTICAL', gap: 2, align: 'CENTER',
      pad: [8, 14, 8, 14], radius: 10, fill: fillOf('--surface-2'),
    });
    await text(cell, label, {
      font: made.textStyle.get('補助').fontName, size: 10,
      color: tokenColor.get('--fg-3').values.sumi,
    });
    await text(cell, value, {
      font: made.textStyle.get('数字').fontName, size: 18,
      color: tokenColor.get('--kin').values.sumi,
    });
  }
  verdict.componentPropertyReferences = { characters: c.addComponentProperty('勝敗', 'TEXT', '勝利') };
  c.description = '褒美の値はサーバが決める。Figma の数字は見本であって仕様ではない。';
  return keep(c, 'TRIAD_ResultPanel');
}

/* ═════════════ まとめて作る ═════════════ */

async function buildComponents(tokens, page) {
  tokenColor = new Map(tokens.colors.map((c) => [c.token, c]));

  const board = mark(frame(page, '部品', { layout: 'VERTICAL', gap: 28, pad: 40, clip: false }));
  board.x = 0; board.y = 0;
  board.fills = [fillOf('--bg-2')];

  const builders = [
    ['主要ボタン', () => makePrimaryButton(board, tokens)],
    ['副ボタン', () => makeSecondaryButton(board)],
    ['通貨', () => makeCurrency(board)],
    ['報せ', () => makeBadge(board)],
    ['菱形ボタン', () => makeRailButton(board)],
    ['身分帯', () => makePlayerCard(board)],
    ['最下部ナビ', () => makeNavigation(board, tokens)],
    ['キャラ札', () => makeCharacterCard(board)],
    ['技ボタン', () => makeSkillButton(board, tokens)],
    ['確認の窓', () => makeDialog(board)],
    ['結果', () => makeResultPanel(board)],
  ];
  for (const [label, build] of builders) {
    try {
      const c = await build();
      c.layoutSizingHorizontal = 'FIXED';
    } catch (e) {
      say(`⚠ 部品「${label}」を作れませんでした: ${e.message}`);
    }
  }
  say(`部品 ${made.component.size} 個`);
  return board;
}
