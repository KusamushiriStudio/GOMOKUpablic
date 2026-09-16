/**
 * Figma プラグイン API の replica。
 *
 * プラグインは Figma の中でしか動かず、動かすには人がログインして手で読み込む
 * 必要がある。それでは毎回の確認ができないので、API の「守らないと例外になる規則」
 * だけを写した偽物をここに置き、code.js を実際に走らせて確かめる。
 *
 * 写した規則（どれも実機で例外になるもの）
 *  ・characters は loadFontAsync より後でしか入れられない
 *  ・layoutSizingHorizontal / Vertical / layoutGrow は、親が Auto Layout のときだけ
 *  ・FILL になっている軸は resize で変えられない
 *  ・setProperties の鍵は addComponentProperty が返した名前でなければならない
 *  ・ページは 1 枚以上残る
 *
 * 写していないもの（実機でしか分からない）
 *  ・実際の見た目、文字の折り返し、書体の有無、プランによるモード数の上限
 */

let seq = 0;

const FONT_KEY = (f) => `${f.family}/${f.style}`;

/** この端末に入っていることにする書体。実機の顔ぶれに寄せてある。 */
export const AVAILABLE_FONTS = [
  ['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'Bold'],
  ['Roboto', 'Regular'], ['Roboto', 'Bold'],
  ['Noto Sans JP', 'Regular'], ['Noto Sans JP', 'Medium'], ['Noto Sans JP', 'Bold'],
  ['Noto Serif JP', 'Regular'], ['Noto Serif JP', 'Medium'], ['Noto Serif JP', 'Bold'],
  ['Klee One', 'Regular'], ['Klee One', 'SemiBold'],
];

export function createFakeFigma(options = {}) {
  const fonts = options.fonts || AVAILABLE_FONTS;
  const loaded = new Set();
  const notices = [];
  const created = { pages: [], variables: [], collections: [], textStyles: [], effectStyles: [], paintStyles: [] };
  /** 実機で例外にはならないが、設計上あってはならないもの。 */
  const complaints = [];

  const autoParent = (node) => node.parent && node.parent.layoutMode && node.parent.layoutMode !== 'NONE';

  function baseNode(type) {
    const node = {
      type,
      id: `${type}:${seq += 1}`,
      name: '',
      parent: null,
      children: [],
      visible: true,
      x: 0,
      y: 0,
      width: type === 'TEXT' ? 40 : 100,
      height: type === 'TEXT' ? 16 : 100,
      rotation: 0,
      fills: [],
      strokes: [],
      effects: [],
      reactions: [],
      dashPattern: [],
      _plugin: {},
      _sizing: { h: 'FIXED', v: 'FIXED' },

      setPluginData(key, value) { this._plugin[key] = String(value); },
      getPluginData(key) { return this._plugin[key] ?? ''; },

      appendChild(child) {
        if (child.parent) {
          const i = child.parent.children.indexOf(child);
          if (i >= 0) child.parent.children.splice(i, 1);
        }
        child.parent = this;
        this.children.push(child);
      },
      insertChild(index, child) {
        if (child.parent) {
          const i = child.parent.children.indexOf(child);
          if (i >= 0) child.parent.children.splice(i, 1);
        }
        child.parent = this;
        this.children.splice(index, 0, child);
      },
      remove() {
        if (!this.parent) return;
        const i = this.parent.children.indexOf(this);
        if (i >= 0) this.parent.children.splice(i, 1);
        this.parent = null;
      },
      resize(w, h) {
        if (this._sizing.h === 'FILL' && Math.abs(w - this.width) > 0.01) {
          throw new Error(`in resize: ${this.name || this.type} の横は FILL なので幅を変えられない`);
        }
        if (this._sizing.v === 'FILL' && Math.abs(h - this.height) > 0.01) {
          throw new Error(`in resize: ${this.name || this.type} の縦は FILL なので高さを変えられない`);
        }
        this.width = w;
        this.height = h;
      },
      async setEffectStyleIdAsync(id) { this.effectStyleId = id; },
      async setReactionsAsync(list) {
        for (const r of list) {
          for (const a of r.actions || []) {
            if (a.type === 'NODE' && !a.destinationId) {
              throw new Error('in setReactionsAsync: 行き先が空');
            }
          }
        }
        this.reactions = list;
      },
      setBoundVariable(field, variable) {
        if (!variable || variable.__kind !== 'variable') throw new Error('in setBoundVariable: 変数ではない');
        (this.boundVariables ||= {})[field] = { id: variable.id };
      },
    };

    for (const [prop, axis] of [['layoutSizingHorizontal', 'h'], ['layoutSizingVertical', 'v']]) {
      Object.defineProperty(node, prop, {
        get() { return node._sizing[axis]; },
        set(value) {
          if (!autoParent(node)) {
            throw new Error(`in ${prop}: 親が Auto Layout でないので設定できない`
              + `（${node.name || node.type} / 親 ${node.parent ? node.parent.name || node.parent.type : 'なし'}）`);
          }
          node._sizing[axis] = value;
        },
      });
    }
    Object.defineProperty(node, 'layoutGrow', {
      get() { return node._grow ?? 0; },
      set(value) {
        if (!autoParent(node)) {
          throw new Error(`in layoutGrow: 親が Auto Layout でない（${node.name || node.type}）`);
        }
        node._grow = value;
        // 実機では layoutGrow=1 が主軸を FILL にする
        if (value) node._sizing[node.parent.layoutMode === 'VERTICAL' ? 'v' : 'h'] = 'FILL';
      },
    });
    return node;
  }

  function textNode() {
    const node = baseNode('TEXT');
    node.fontName = { family: 'Inter', style: 'Regular' };
    node.fontSize = 12;
    node.textAutoResize = 'WIDTH_AND_HEIGHT';
    node.textAlignHorizontal = 'LEFT';
    node.lineHeight = { unit: 'AUTO' };
    node.letterSpacing = { unit: 'PERCENT', value: 0 };
    Object.defineProperty(node, 'characters', {
      get() { return node._chars ?? ''; },
      set(value) {
        if (!loaded.has(FONT_KEY(node.fontName))) {
          throw new Error(`in characters: ${FONT_KEY(node.fontName)} を loadFontAsync していない`);
        }
        node._chars = String(value);
        node.width = Math.max(8, node._chars.length * node.fontSize * 0.6);
      },
    });
    return node;
  }

  function componentNode() {
    const node = baseNode('COMPONENT');
    node._props = new Map();
    node.addComponentProperty = (name, type, defaultValue) => {
      const key = `${name}#${seq += 1}:0`;
      node._props.set(key, { type, defaultValue });
      return key;
    };
    node.createInstance = () => {
      const inst = baseNode('INSTANCE');
      inst.mainComponent = node;
      inst.name = node.name;
      inst.width = node.width;
      inst.height = node.height;
      inst.componentProperties = Object.fromEntries(
        [...node._props].map(([k, v]) => [k, { type: v.type, value: v.defaultValue }]),
      );
      inst.setProperties = (values) => {
        for (const [k, v] of Object.entries(values)) {
          if (k === 'undefined' || k === undefined) {
            throw new Error(`in setProperties: 鍵が undefined（${node.name} に対応する部品属性が無い）`);
          }
          if (!node._props.has(k)) {
            throw new Error(`in setProperties: ${node.name} に「${k}」という部品属性が無い`);
          }
          inst.componentProperties[k] = { type: node._props.get(k).type, value: v };
        }
      };
      return inst;
    };
    return node;
  }

  const page = baseNode('PAGE');
  page.name = 'Page 1';
  const root = baseNode('DOCUMENT');
  root.appendChild(page);
  created.pages.push(page);

  const figma = {
    root,
    currentPage: page,
    viewport: { scrollAndZoomIntoView() {} },

    createFrame: () => baseNode('FRAME'),
    createRectangle: () => baseNode('RECTANGLE'),
    createEllipse: () => baseNode('ELLIPSE'),
    createPolygon: () => { const n = baseNode('POLYGON'); n.pointCount = 3; return n; },
    createText: textNode,
    createComponent: componentNode,
    createPage() {
      const p = baseNode('PAGE');
      root.appendChild(p);
      created.pages.push(p);
      return p;
    },

    createTextStyle() { const s = { __kind: 'textStyle', id: `S${seq += 1}`, name: '' }; created.textStyles.push(s); return s; },
    createEffectStyle() { const s = { __kind: 'effectStyle', id: `S${seq += 1}`, name: '', effects: [] }; created.effectStyles.push(s); return s; },
    createPaintStyle() { const s = { __kind: 'paintStyle', id: `S${seq += 1}`, name: '', paints: [] }; created.paintStyles.push(s); return s; },
    async getLocalTextStylesAsync() { return created.textStyles; },
    async getLocalEffectStylesAsync() { return created.effectStyles; },
    async getLocalPaintStylesAsync() { return created.paintStyles; },

    variables: {
      createVariableCollection(name) {
        const modes = [{ modeId: `m${seq += 1}`, name: 'Mode 1' }];
        const col = {
          __kind: 'collection', id: `C${seq += 1}`, name, modes,
          defaultModeId: modes[0].modeId,
          renameMode(modeId, newName) {
            const m = modes.find((x) => x.modeId === modeId);
            if (!m) throw new Error('in renameMode: そのモードが無い');
            m.name = newName;
          },
          addMode(newName) {
            if (modes.length >= (options.modeLimit ?? 4)) {
              throw new Error(`in addMode: Limited to ${options.modeLimit ?? 4} modes only`);
            }
            const m = { modeId: `m${seq += 1}`, name: newName };
            modes.push(m);
            return m.modeId;
          },
        };
        created.collections.push(col);
        return col;
      },
      createVariable(name, collection, resolvedType) {
        if (!collection || collection.__kind !== 'collection') {
          throw new Error('in createVariable: 集合が Collection ではない');
        }
        if (!['COLOR', 'FLOAT', 'STRING', 'BOOLEAN'].includes(resolvedType)) {
          throw new Error(`in createVariable: 種別 ${resolvedType} は無い`);
        }
        const v = {
          __kind: 'variable', id: `V${seq += 1}`, name, resolvedType,
          variableCollectionId: collection.id, valuesByMode: {}, scopes: [], description: '',
          setValueForMode(modeId, value) {
            if (!collection.modes.some((m) => m.modeId === modeId)) {
              throw new Error(`in setValueForMode: ${name} に無いモード`);
            }
            if (resolvedType === 'COLOR') {
              for (const ch of ['r', 'g', 'b']) {
                if (typeof value?.[ch] !== 'number' || value[ch] < 0 || value[ch] > 1) {
                  throw new Error(`in setValueForMode: ${name} の ${ch} が 0〜1 でない（${value?.[ch]}）`);
                }
              }
            }
            if (resolvedType === 'FLOAT' && typeof value !== 'number') {
              throw new Error(`in setValueForMode: ${name} は数値でなければならない`);
            }
            if (resolvedType === 'STRING' && typeof value !== 'string') {
              throw new Error(`in setValueForMode: ${name} は文字列でなければならない`);
            }
            v.valuesByMode[modeId] = value;
          },
        };
        created.variables.push(v);
        return v;
      },
      async getLocalVariableCollectionsAsync() { return created.collections; },
      async getLocalVariablesAsync(type) {
        return type ? created.variables.filter((v) => v.resolvedType === type) : created.variables;
      },
      setBoundVariableForPaint(paint, field, variable) {
        if (paint.type !== 'SOLID') throw new Error('in setBoundVariableForPaint: 単色でない塗りには束ねられない');
        if (!variable || variable.__kind !== 'variable') throw new Error('in setBoundVariableForPaint: 変数ではない');
        return { ...paint, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: variable.id } } };
      },
    },

    async listAvailableFontsAsync() { return fonts.map(([family, style]) => ({ fontName: { family, style } })); },
    async loadFontAsync(fontName) {
      if (!fonts.some(([f, s]) => f === fontName.family && s === fontName.style)) {
        throw new Error(`in loadFontAsync: ${FONT_KEY(fontName)} は入っていない`);
      }
      loaded.add(FONT_KEY(fontName));
    },

    async loadAllPagesAsync() {},
    async setCurrentPageAsync(p) { figma.currentPage = p; },
    notify(message, opts) { notices.push({ message, ...opts }); },
    closePlugin(message) { figma.__closed = message ?? true; },
  };

  return { figma, created, notices, complaints, loadedFonts: loaded };
}
