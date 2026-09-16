/* ═══════════════════════════════════════════════════════════════════════
 * TRIAD UI Kit — Figma のデザインファイルを作るプラグイン
 *
 * これは生成物。直接編集しない。
 *   元  : figma/triad-ui-kit/src/*.js
 *   値  : figma/triad-ui-kit/tokens.json（index.html の :root から抽出）
 *   作り直し: node tools/build-figma-plugin.mjs
 *
 * 束ねた元ファイル: 10-lib.js → 20-system.js → 30-components.js → 40-home.js → 50-main.js
 * ═══════════════════════════════════════════════════════════════════════ */

const DATA = {
  "tokens": {
    "generatedFrom": "index.html",
    "note": "tools/extract-design-tokens.mjs が作る。直接編集しない。直すのは index.html の :root。",
    "modes": [
      "washi",
      "sumi"
    ],
    "viewports": [
      {
        "w": 320,
        "h": 780
      },
      {
        "w": 390,
        "h": 844
      },
      {
        "w": 430,
        "h": 932
      }
    ],
    "colors": [
      {
        "name": "色/旧/緑/green-900",
        "token": "--green-900",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.054902,
            "g": 0.184314,
            "b": 0.129412,
            "a": 1
          },
          "sumi": {
            "r": 0.054902,
            "g": 0.184314,
            "b": 0.129412,
            "a": 1
          }
        },
        "uses": 4
      },
      {
        "name": "色/旧/緑/green-800",
        "token": "--green-800",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.078431,
            "g": 0.262745,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.078431,
            "g": 0.262745,
            "b": 0.184314,
            "a": 1
          }
        },
        "uses": 8
      },
      {
        "name": "色/旧/緑/green-700",
        "token": "--green-700",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          },
          "sumi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          }
        },
        "uses": 9
      },
      {
        "name": "色/旧/緑/green-500",
        "token": "--green-500",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.247059,
            "g": 0.560784,
            "b": 0.360784,
            "a": 1
          },
          "sumi": {
            "r": 0.247059,
            "g": 0.560784,
            "b": 0.360784,
            "a": 1
          }
        },
        "uses": 4
      },
      {
        "name": "色/旧/緑/green-200",
        "token": "--green-200",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.811765,
            "g": 0.878431,
            "b": 0.803922,
            "a": 1
          },
          "sumi": {
            "r": 0.811765,
            "g": 0.878431,
            "b": 0.803922,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/旧/緑/green-100",
        "token": "--green-100",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.894118,
            "g": 0.933333,
            "b": 0.870588,
            "a": 1
          },
          "sumi": {
            "r": 0.894118,
            "g": 0.933333,
            "b": 0.870588,
            "a": 1
          }
        },
        "uses": 3
      },
      {
        "name": "その他/cream",
        "token": "--cream",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.956863,
            "g": 0.937255,
            "b": 0.882353,
            "a": 1
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 1
          }
        },
        "uses": 5
      },
      {
        "name": "その他/cream-2",
        "token": "--cream-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.917647,
            "g": 0.886275,
            "b": 0.803922,
            "a": 1
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 0.2
          }
        },
        "uses": 22
      },
      {
        "name": "その他/ink",
        "token": "--ink",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.121569,
            "a": 1
          },
          "sumi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.121569,
            "a": 1
          }
        },
        "uses": 3
      },
      {
        "name": "その他/ink-soft",
        "token": "--ink-soft",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.333333,
            "g": 0.376471,
            "b": 0.298039,
            "a": 1
          },
          "sumi": {
            "r": 0.333333,
            "g": 0.376471,
            "b": 0.298039,
            "a": 1
          }
        },
        "uses": 8
      },
      {
        "name": "その他/sumi",
        "token": "--sumi",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.168627,
            "g": 0.168627,
            "b": 0.168627,
            "a": 1
          },
          "sumi": {
            "r": 0.168627,
            "g": 0.168627,
            "b": 0.168627,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "その他/accent",
        "token": "--accent",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.752941,
            "g": 0.211765,
            "b": 0.172549,
            "a": 1
          },
          "sumi": {
            "r": 0.752941,
            "g": 0.211765,
            "b": 0.172549,
            "a": 1
          }
        },
        "uses": 10
      },
      {
        "name": "その他/gold",
        "token": "--gold",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.788235,
            "g": 0.635294,
            "b": 0.152941,
            "a": 1
          },
          "sumi": {
            "r": 0.788235,
            "g": 0.635294,
            "b": 0.152941,
            "a": 1
          }
        },
        "uses": 4
      },
      {
        "name": "その他/p1",
        "token": "--p1",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          },
          "sumi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "その他/p2",
        "token": "--p2",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.709804,
            "g": 0.27451,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.709804,
            "g": 0.27451,
            "b": 0.184314,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "その他/p3",
        "token": "--p3",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.184314,
            "g": 0.364706,
            "b": 0.580392,
            "a": 1
          },
          "sumi": {
            "r": 0.184314,
            "g": 0.364706,
            "b": 0.580392,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/盤/席/seat-1",
        "token": "--seat-1",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.184314,
            "g": 0.603922,
            "b": 0.407843,
            "a": 1
          },
          "sumi": {
            "r": 0.184314,
            "g": 0.603922,
            "b": 0.407843,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/盤/席/seat-1-deep",
        "token": "--seat-1-deep",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          },
          "sumi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/席/seat-2",
        "token": "--seat-2",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.843137,
            "g": 0.356863,
            "b": 0.262745,
            "a": 1
          },
          "sumi": {
            "r": 0.843137,
            "g": 0.356863,
            "b": 0.262745,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/盤/席/seat-2-deep",
        "token": "--seat-2-deep",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.709804,
            "g": 0.27451,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.709804,
            "g": 0.27451,
            "b": 0.184314,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/席/seat-3",
        "token": "--seat-3",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.32549,
            "g": 0.564706,
            "b": 0.811765,
            "a": 1
          },
          "sumi": {
            "r": 0.32549,
            "g": 0.564706,
            "b": 0.811765,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/盤/席/seat-3-deep",
        "token": "--seat-3-deep",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.184314,
            "g": 0.364706,
            "b": 0.580392,
            "a": 1
          },
          "sumi": {
            "r": 0.184314,
            "g": 0.364706,
            "b": 0.580392,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-focus",
        "token": "--mark-focus",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.960784,
            "g": 0.901961,
            "b": 0.690196,
            "a": 1
          },
          "sumi": {
            "r": 0.960784,
            "g": 0.901961,
            "b": 0.690196,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-last",
        "token": "--mark-last",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-cand",
        "token": "--mark-cand",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 0.6
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 0.6
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-win",
        "token": "--mark-win",
        "themed": false,
        "values": {
          "washi": {
            "r": 1,
            "g": 0.913725,
            "b": 0.639216,
            "a": 1
          },
          "sumi": {
            "r": 1,
            "g": 0.913725,
            "b": 0.639216,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-ward",
        "token": "--mark-ward",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.415686,
            "g": 0.639216,
            "b": 0.847059,
            "a": 1
          },
          "sumi": {
            "r": 0.415686,
            "g": 0.639216,
            "b": 0.847059,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-freeze",
        "token": "--mark-freeze",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.658824,
            "g": 0.862745,
            "b": 0.941176,
            "a": 1
          },
          "sumi": {
            "r": 0.658824,
            "g": 0.862745,
            "b": 0.941176,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-target",
        "token": "--mark-target",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.878431,
            "g": 0.32549,
            "b": 0.235294,
            "a": 1
          },
          "sumi": {
            "r": 0.878431,
            "g": 0.32549,
            "b": 0.235294,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/盤/印/mark-turn",
        "token": "--mark-turn",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/地/bg-1",
        "token": "--bg-1",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.901961,
            "g": 0.866667,
            "b": 0.784314,
            "a": 1
          },
          "sumi": {
            "r": 0.027451,
            "g": 0.039216,
            "b": 0.035294,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/地/bg-2",
        "token": "--bg-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.937255,
            "g": 0.905882,
            "b": 0.835294,
            "a": 1
          },
          "sumi": {
            "r": 0.054902,
            "g": 0.070588,
            "b": 0.066667,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/地/bg-3",
        "token": "--bg-3",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.956863,
            "g": 0.937255,
            "b": 0.882353,
            "a": 1
          },
          "sumi": {
            "r": 0.086275,
            "g": 0.113725,
            "b": 0.101961,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/面/surface-1",
        "token": "--surface-1",
        "themed": true,
        "values": {
          "washi": {
            "r": 1,
            "g": 0.992157,
            "b": 0.964706,
            "a": 1
          },
          "sumi": {
            "r": 0.101961,
            "g": 0.133333,
            "b": 0.117647,
            "a": 1
          }
        },
        "uses": 3
      },
      {
        "name": "色/面/surface-2",
        "token": "--surface-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.968627,
            "g": 0.94902,
            "b": 0.894118,
            "a": 1
          },
          "sumi": {
            "r": 0.129412,
            "g": 0.168627,
            "b": 0.14902,
            "a": 1
          }
        },
        "uses": 7
      },
      {
        "name": "色/面/surface-3",
        "token": "--surface-3",
        "themed": true,
        "values": {
          "washi": {
            "r": 1,
            "g": 0.996078,
            "b": 0.980392,
            "a": 1
          },
          "sumi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.160784,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/面/surface-inset",
        "token": "--surface-inset",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.984314,
            "g": 0.972549,
            "b": 0.933333,
            "a": 1
          },
          "sumi": {
            "r": 0.047059,
            "g": 0.062745,
            "b": 0.058824,
            "a": 1
          }
        },
        "uses": 3
      },
      {
        "name": "色/面/surface-urushi",
        "token": "--surface-urushi",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.078431,
            "g": 0.262745,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.039216,
            "g": 0.054902,
            "b": 0.05098,
            "a": 1
          }
        },
        "uses": 5
      },
      {
        "name": "その他/on-urushi",
        "token": "--on-urushi",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 1
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 1
          }
        },
        "uses": 5
      },
      {
        "name": "色/文字/fg-1",
        "token": "--fg-1",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.137255,
            "g": 0.188235,
            "b": 0.121569,
            "a": 1
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 1
          }
        },
        "uses": 12
      },
      {
        "name": "色/文字/fg-2",
        "token": "--fg-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.298039,
            "g": 0.337255,
            "b": 0.266667,
            "a": 1
          },
          "sumi": {
            "r": 0.796078,
            "g": 0.764706,
            "b": 0.705882,
            "a": 1
          }
        },
        "uses": 6
      },
      {
        "name": "色/文字/fg-3",
        "token": "--fg-3",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.435294,
            "g": 0.466667,
            "b": 0.4,
            "a": 1
          },
          "sumi": {
            "r": 0.603922,
            "g": 0.572549,
            "b": 0.517647,
            "a": 1
          }
        },
        "uses": 8
      },
      {
        "name": "色/文字/fg-4",
        "token": "--fg-4",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.603922,
            "g": 0.627451,
            "b": 0.568627,
            "a": 1
          },
          "sumi": {
            "r": 0.427451,
            "g": 0.411765,
            "b": 0.380392,
            "a": 1
          }
        },
        "uses": 2
      },
      {
        "name": "色/金/kin",
        "token": "--kin",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.647059,
            "g": 0.505882,
            "b": 0.121569,
            "a": 1
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          }
        },
        "uses": 15
      },
      {
        "name": "色/金/kin-bright",
        "token": "--kin-bright",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 1
          },
          "sumi": {
            "r": 0.94902,
            "g": 0.878431,
            "b": 0.666667,
            "a": 1
          }
        },
        "uses": 7
      },
      {
        "name": "色/金/kin-deep",
        "token": "--kin-deep",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.435294,
            "g": 0.337255,
            "b": 0.058824,
            "a": 1
          },
          "sumi": {
            "r": 0.627451,
            "g": 0.498039,
            "b": 0.164706,
            "a": 1
          }
        },
        "uses": 2
      },
      {
        "name": "色/金/kin-ink",
        "token": "--kin-ink",
        "themed": true,
        "values": {
          "washi": {
            "r": 1,
            "g": 0.980392,
            "b": 0.941176,
            "a": 1
          },
          "sumi": {
            "r": 0.164706,
            "g": 0.117647,
            "b": 0.019608,
            "a": 1
          }
        },
        "uses": 3
      },
      {
        "name": "色/朱/shu",
        "token": "--shu",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.709804,
            "g": 0.25098,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.878431,
            "g": 0.352941,
            "b": 0.27451,
            "a": 1
          }
        },
        "uses": 8
      },
      {
        "name": "色/朱/shu-deep",
        "token": "--shu-deep",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.54902,
            "g": 0.164706,
            "b": 0.109804,
            "a": 1
          },
          "sumi": {
            "r": 0.647059,
            "g": 0.192157,
            "b": 0.121569,
            "a": 1
          }
        },
        "uses": 5
      },
      {
        "name": "色/朱/shu-ink",
        "token": "--shu-ink",
        "themed": true,
        "values": {
          "washi": {
            "r": 1,
            "g": 0.960784,
            "b": 0.945098,
            "a": 1
          },
          "sumi": {
            "r": 1,
            "g": 0.956863,
            "b": 0.941176,
            "a": 1
          }
        },
        "uses": 6
      },
      {
        "name": "色/藍/ai",
        "token": "--ai",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.184314,
            "g": 0.364706,
            "b": 0.580392,
            "a": 1
          },
          "sumi": {
            "r": 0.415686,
            "g": 0.639216,
            "b": 0.847059,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/藍/ai-deep",
        "token": "--ai-deep",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.105882,
            "g": 0.227451,
            "b": 0.376471,
            "a": 1
          },
          "sumi": {
            "r": 0.113725,
            "g": 0.227451,
            "b": 0.360784,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/藍/ai-ink",
        "token": "--ai-ink",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.94902,
            "g": 0.968627,
            "b": 0.992157,
            "a": 1
          },
          "sumi": {
            "r": 0.933333,
            "g": 0.960784,
            "b": 0.988235,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "その他/shiro",
        "token": "--shiro",
        "themed": true,
        "values": {
          "washi": {
            "r": 1,
            "g": 1,
            "b": 1,
            "a": 1
          },
          "sumi": {
            "r": 0.972549,
            "g": 0.956863,
            "b": 0.92549,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/可/ok",
        "token": "--ok",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.168627,
            "g": 0.490196,
            "b": 0.309804,
            "a": 1
          },
          "sumi": {
            "r": 0.372549,
            "g": 0.729412,
            "b": 0.494118,
            "a": 1
          }
        },
        "uses": 2
      },
      {
        "name": "色/可/ok-deep",
        "token": "--ok-deep",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.105882,
            "g": 0.352941,
            "b": 0.211765,
            "a": 1
          },
          "sumi": {
            "r": 0.121569,
            "g": 0.435294,
            "b": 0.290196,
            "a": 1
          }
        },
        "uses": 2
      },
      {
        "name": "色/注/warn",
        "token": "--warn",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.603922,
            "g": 0.423529,
            "b": 0.062745,
            "a": 1
          },
          "sumi": {
            "r": 0.913725,
            "g": 0.694118,
            "b": 0.247059,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/注/warn-deep",
        "token": "--warn-deep",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.419608,
            "g": 0.290196,
            "b": 0.031373,
            "a": 1
          },
          "sumi": {
            "r": 0.541176,
            "g": 0.368627,
            "b": 0.070588,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/朱/danger",
        "token": "--danger",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.709804,
            "g": 0.25098,
            "b": 0.184314,
            "a": 1
          },
          "sumi": {
            "r": 0.878431,
            "g": 0.352941,
            "b": 0.27451,
            "a": 1
          }
        },
        "aliasOf": "--shu",
        "uses": 0
      },
      {
        "name": "色/罫/line-1",
        "token": "--line-1",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.121569,
            "a": 0.1
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 0.1
          }
        },
        "uses": 6
      },
      {
        "name": "色/罫/line-2",
        "token": "--line-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.121569,
            "a": 0.18
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 0.2
          }
        },
        "uses": 10
      },
      {
        "name": "色/罫/line-3",
        "token": "--line-3",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.141176,
            "g": 0.188235,
            "b": 0.121569,
            "a": 0.32
          },
          "sumi": {
            "r": 0.956863,
            "g": 0.933333,
            "b": 0.886275,
            "a": 0.34
          }
        },
        "uses": 0
      },
      {
        "name": "色/罫/line-kin",
        "token": "--line-kin",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.647059,
            "g": 0.505882,
            "b": 0.121569,
            "a": 0.45
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 0.42
          }
        },
        "uses": 16
      },
      {
        "name": "色/罫/line-kin-2",
        "token": "--line-kin-2",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.647059,
            "g": 0.505882,
            "b": 0.121569,
            "a": 0.9
          },
          "sumi": {
            "r": 0.85098,
            "g": 0.717647,
            "b": 0.360784,
            "a": 0.85
          }
        },
        "uses": 4
      },
      {
        "name": "色/罫/line-shu",
        "token": "--line-shu",
        "themed": true,
        "values": {
          "washi": {
            "r": 0.709804,
            "g": 0.25098,
            "b": 0.184314,
            "a": 0.55
          },
          "sumi": {
            "r": 0.878431,
            "g": 0.352941,
            "b": 0.27451,
            "a": 0.55
          }
        },
        "uses": 2
      },
      {
        "name": "塗り/kinpaku",
        "token": "--kinpaku",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.909804,
            "g": 0.772549,
            "b": 0.380392,
            "a": 1
          },
          "sumi": {
            "r": 0.909804,
            "g": 0.772549,
            "b": 0.380392,
            "a": 1
          }
        },
        "uses": 14
      },
      {
        "name": "その他/urushi",
        "token": "--urushi",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.070588,
            "g": 0.054902,
            "b": 0.047059,
            "a": 1
          },
          "sumi": {
            "r": 0.070588,
            "g": 0.054902,
            "b": 0.047059,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "その他/urushi-2",
        "token": "--urushi-2",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.113725,
            "g": 0.086275,
            "b": 0.07451,
            "a": 1
          },
          "sumi": {
            "r": 0.113725,
            "g": 0.086275,
            "b": 0.07451,
            "a": 1
          }
        },
        "uses": 0
      },
      {
        "name": "色/金/kin-2",
        "token": "--kin-2",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.662745,
            "g": 0.509804,
            "b": 0.113725,
            "a": 1
          },
          "sumi": {
            "r": 0.662745,
            "g": 0.509804,
            "b": 0.113725,
            "a": 1
          }
        },
        "uses": 6
      },
      {
        "name": "その他/gofun",
        "token": "--gofun",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.968627,
            "g": 0.94902,
            "b": 0.901961,
            "a": 1
          },
          "sumi": {
            "r": 0.968627,
            "g": 0.94902,
            "b": 0.901961,
            "a": 1
          }
        },
        "uses": 4
      },
      {
        "name": "その他/washi",
        "token": "--washi",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.937255,
            "g": 0.901961,
            "b": 0.823529,
            "a": 1
          },
          "sumi": {
            "r": 0.937255,
            "g": 0.901961,
            "b": 0.823529,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "舞台/hero-shadow",
        "token": "--hero-shadow",
        "themed": false,
        "values": {
          "washi": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.42
          },
          "sumi": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.42
          }
        },
        "uses": 1
      },
      {
        "name": "色/木地/kiji-1",
        "token": "--kiji-1",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.419608,
            "g": 0.290196,
            "b": 0.172549,
            "a": 1
          },
          "sumi": {
            "r": 0.419608,
            "g": 0.290196,
            "b": 0.172549,
            "a": 1
          }
        },
        "uses": 1
      },
      {
        "name": "色/木地/kiji-2",
        "token": "--kiji-2",
        "themed": false,
        "values": {
          "washi": {
            "r": 0.290196,
            "g": 0.196078,
            "b": 0.12549,
            "a": 1
          },
          "sumi": {
            "r": 0.290196,
            "g": 0.196078,
            "b": 0.12549,
            "a": 1
          }
        },
        "uses": 1
      }
    ],
    "numbers": [
      {
        "name": "寸法/角丸/radius",
        "token": "--radius",
        "unit": "px",
        "value": 14,
        "uses": 2
      },
      {
        "name": "寸法/高さ/nav-h",
        "token": "--nav-h",
        "unit": "px",
        "value": 60,
        "uses": 5
      },
      {
        "name": "寸法/高さ/header-h",
        "token": "--header-h",
        "unit": "px",
        "value": 52,
        "uses": 3
      },
      {
        "name": "寸法/文字/fs-1",
        "token": "--fs-1",
        "unit": "px",
        "value": 11,
        "uses": 0
      },
      {
        "name": "寸法/文字/fs-2",
        "token": "--fs-2",
        "unit": "px",
        "value": 12,
        "uses": 3
      },
      {
        "name": "寸法/文字/fs-3",
        "token": "--fs-3",
        "unit": "px",
        "value": 13,
        "uses": 0
      },
      {
        "name": "寸法/文字/fs-4",
        "token": "--fs-4",
        "unit": "px",
        "value": 14,
        "uses": 1
      },
      {
        "name": "寸法/文字/fs-5",
        "token": "--fs-5",
        "unit": "px",
        "value": 16,
        "uses": 1
      },
      {
        "name": "寸法/文字/fs-6",
        "token": "--fs-6",
        "unit": "px",
        "value": 18,
        "uses": 0
      },
      {
        "name": "寸法/文字/fs-7",
        "token": "--fs-7",
        "unit": "px",
        "value": 22,
        "uses": 0
      },
      {
        "name": "寸法/文字/fs-8",
        "token": "--fs-8",
        "unit": "px",
        "value": 26,
        "uses": 0
      },
      {
        "name": "寸法/行送り/lh-tight",
        "token": "--lh-tight",
        "unit": "%",
        "value": 125,
        "uses": 1
      },
      {
        "name": "寸法/行送り/lh-base",
        "token": "--lh-base",
        "unit": "%",
        "value": 155,
        "uses": 0
      },
      {
        "name": "寸法/行送り/lh-loose",
        "token": "--lh-loose",
        "unit": "%",
        "value": 175,
        "uses": 0
      },
      {
        "name": "寸法/字間/ls-brush",
        "token": "--ls-brush",
        "unit": "%",
        "value": 16,
        "uses": 2
      },
      {
        "name": "寸法/字間/ls-ui",
        "token": "--ls-ui",
        "unit": "%",
        "value": 2,
        "uses": 1
      },
      {
        "name": "寸法/余白/sp-1",
        "token": "--sp-1",
        "unit": "px",
        "value": 4,
        "uses": 0
      },
      {
        "name": "寸法/余白/sp-2",
        "token": "--sp-2",
        "unit": "px",
        "value": 6,
        "uses": 3
      },
      {
        "name": "寸法/余白/sp-3",
        "token": "--sp-3",
        "unit": "px",
        "value": 8,
        "uses": 1
      },
      {
        "name": "寸法/余白/sp-4",
        "token": "--sp-4",
        "unit": "px",
        "value": 12,
        "uses": 2
      },
      {
        "name": "寸法/余白/sp-5",
        "token": "--sp-5",
        "unit": "px",
        "value": 16,
        "uses": 0
      },
      {
        "name": "寸法/余白/sp-6",
        "token": "--sp-6",
        "unit": "px",
        "value": 22,
        "uses": 0
      },
      {
        "name": "寸法/余白/sp-7",
        "token": "--sp-7",
        "unit": "px",
        "value": 32,
        "uses": 0
      },
      {
        "name": "寸法/余白/sp-8",
        "token": "--sp-8",
        "unit": "px",
        "value": 44,
        "uses": 0
      },
      {
        "name": "寸法/操作/tap",
        "token": "--tap",
        "unit": "px",
        "value": 44,
        "uses": 1
      },
      {
        "name": "寸法/角丸/r-1",
        "token": "--r-1",
        "unit": "px",
        "value": 4,
        "uses": 1
      },
      {
        "name": "寸法/角丸/r-2",
        "token": "--r-2",
        "unit": "px",
        "value": 8,
        "uses": 3
      },
      {
        "name": "寸法/角丸/r-3",
        "token": "--r-3",
        "unit": "px",
        "value": 12,
        "uses": 2
      },
      {
        "name": "寸法/角丸/r-4",
        "token": "--r-4",
        "unit": "px",
        "value": 16,
        "uses": 0
      },
      {
        "name": "寸法/角丸/r-5",
        "token": "--r-5",
        "unit": "px",
        "value": 22,
        "uses": 0
      },
      {
        "name": "寸法/角丸/r-pill",
        "token": "--r-pill",
        "unit": "px",
        "value": 999,
        "uses": 0
      },
      {
        "name": "時間/dur-scale",
        "token": "--dur-scale",
        "unit": "",
        "value": 1,
        "uses": 13
      },
      {
        "name": "その他/shake-amp",
        "token": "--shake-amp",
        "unit": "px",
        "value": 6,
        "uses": 1
      },
      {
        "name": "舞台/stage-floor",
        "token": "--stage-floor",
        "unit": "%",
        "value": 12,
        "uses": 1
      }
    ],
    "strings": [
      {
        "name": "書体/font",
        "token": "--font",
        "value": "\"Hiragino Mincho ProN\", \"Yu Mincho\", \"Noto Serif JP\", serif",
        "uses": 12
      },
      {
        "name": "書体/font-ui",
        "token": "--font-ui",
        "value": "-apple-system, BlinkMacSystemFont, \"Hiragino Sans\", \"Noto Sans JP\", \"Segoe UI\", sans-serif",
        "uses": 1
      },
      {
        "name": "書体/font-brush",
        "token": "--font-brush",
        "value": "\"Toppan Bunkyu Midashi Mincho\", \"TsukuBRdGothic\", \"Klee\", \"Klee One\", \"HGP行書体\", \"HG行書体\", \"Yu Mincho Demibold\", \"Hiragino Mincho ProN\", \"YuMincho\", \"Yu Mincho\", \"Noto Serif JP\", \"Noto Serif CJK JP\", serif",
        "uses": 8
      },
      {
        "name": "書体/font-mincho",
        "token": "--font-mincho",
        "value": "\"Hiragino Mincho ProN\", \"Toppan Bunkyu Mincho\", \"Yu Mincho\", YuMincho, \"Noto Serif JP\", \"Noto Serif CJK JP\", \"MS PMincho\", serif",
        "uses": 4
      },
      {
        "name": "書体/font-gothic",
        "token": "--font-gothic",
        "value": "-apple-system, BlinkMacSystemFont, \"Hiragino Sans\", \"Hiragino Kaku Gothic ProN\", \"Noto Sans JP\", \"Yu Gothic UI\", \"Yu Gothic\", Meiryo, \"Segoe UI\", system-ui, sans-serif",
        "uses": 4
      },
      {
        "name": "書体/font-num",
        "token": "--font-num",
        "value": "-apple-system, BlinkMacSystemFont, \"Hiragino Sans\", \"Hiragino Kaku Gothic ProN\", \"Noto Sans JP\", \"Yu Gothic UI\", \"Yu Gothic\", Meiryo, \"Segoe UI\", system-ui, sans-serif",
        "aliasOf": "--font-gothic",
        "uses": 1
      }
    ],
    "effectStyles": [
      {
        "name": "効果/影/shadow",
        "token": "--shadow",
        "washi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.078431,
              "g": 0.176471,
              "b": 0.117647,
              "a": 0.16
            },
            "offset": {
              "x": 0,
              "y": 2
            },
            "radius": 10,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.5
            },
            "offset": {
              "x": 0,
              "y": 6
            },
            "radius": 18,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "aliasOf": "--shadow-2",
        "uses": 4
      },
      {
        "name": "効果/影/shadow-1",
        "token": "--shadow-1",
        "washi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.078431,
              "g": 0.176471,
              "b": 0.117647,
              "a": 0.12
            },
            "offset": {
              "x": 0,
              "y": 1
            },
            "radius": 2,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.55
            },
            "offset": {
              "x": 0,
              "y": 1
            },
            "radius": 2,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "uses": 9
      },
      {
        "name": "効果/影/shadow-2",
        "token": "--shadow-2",
        "washi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.078431,
              "g": 0.176471,
              "b": 0.117647,
              "a": 0.16
            },
            "offset": {
              "x": 0,
              "y": 4
            },
            "radius": 14,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.5
            },
            "offset": {
              "x": 0,
              "y": 6
            },
            "radius": 18,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "uses": 5
      },
      {
        "name": "効果/影/shadow-3",
        "token": "--shadow-3",
        "washi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.078431,
              "g": 0.176471,
              "b": 0.117647,
              "a": 0.24
            },
            "offset": {
              "x": 0,
              "y": 14
            },
            "radius": 40,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.6
            },
            "offset": {
              "x": 0,
              "y": 18
            },
            "radius": 48,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "uses": 1
      },
      {
        "name": "効果/艶/sheen",
        "token": "--sheen",
        "washi": [
          {
            "type": "INNER_SHADOW",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1,
              "a": 0.7
            },
            "offset": {
              "x": 0,
              "y": 1
            },
            "radius": 0,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "INNER_SHADOW",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1,
              "a": 0.06
            },
            "offset": {
              "x": 0,
              "y": 1
            },
            "radius": 0,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "uses": 3
      },
      {
        "name": "効果/光/glow-kin",
        "token": "--glow-kin",
        "washi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.647059,
              "g": 0.505882,
              "b": 0.121569,
              "a": 0.45
            },
            "offset": {
              "x": 0,
              "y": 0
            },
            "radius": 0,
            "spread": 1,
            "blendMode": "NORMAL",
            "visible": true
          },
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.647059,
              "g": 0.505882,
              "b": 0.121569,
              "a": 0.16
            },
            "offset": {
              "x": 0,
              "y": 0
            },
            "radius": 12,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "sumi": [
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.85098,
              "g": 0.717647,
              "b": 0.360784,
              "a": 0.55
            },
            "offset": {
              "x": 0,
              "y": 0
            },
            "radius": 0,
            "spread": 1,
            "blendMode": "NORMAL",
            "visible": true
          },
          {
            "type": "DROP_SHADOW",
            "color": {
              "r": 0.85098,
              "g": 0.717647,
              "b": 0.360784,
              "a": 0.2
            },
            "offset": {
              "x": 0,
              "y": 0
            },
            "radius": 16,
            "spread": 0,
            "blendMode": "NORMAL",
            "visible": true
          }
        ],
        "uses": 2
      }
    ],
    "gradients": [
      {
        "name": "塗り/fill-primary",
        "token": "--fill-primary",
        "washi": "linear-gradient(180deg, #24815a, #1a6243)",
        "sumi": "linear-gradient(180deg, #2a8259, #17563a)"
      },
      {
        "name": "塗り/fill-sub",
        "token": "--fill-sub",
        "washi": "linear-gradient(180deg, #fffefa, #f4efe1)",
        "sumi": "linear-gradient(180deg, #232e28, #1a221e)"
      },
      {
        "name": "塗り/fill-gold",
        "token": "--fill-gold",
        "washi": "linear-gradient(180deg, #e2c569, #b08d22)",
        "sumi": "linear-gradient(180deg, #e2c569, #a07f2a)"
      },
      {
        "name": "塗り/fill-danger",
        "token": "--fill-danger",
        "washi": "linear-gradient(180deg, #c04a37, #8c2a1c)",
        "sumi": "linear-gradient(180deg, #c04434, #7d2216)"
      },
      {
        "name": "塗り/fill-urushi",
        "token": "--fill-urushi",
        "washi": "linear-gradient(180deg, #14432f, #0e2f21)",
        "sumi": "linear-gradient(180deg, #111715, #070a09)"
      }
    ],
    "responsive": [
      {
        "name": "寸法/文字/fs-btn",
        "token": "--fs-btn",
        "css": "clamp(14px, 4.2vw, 16px)",
        "px": {
          "320": 14,
          "390": 16,
          "430": 16
        },
        "uses": 2
      },
      {
        "name": "寸法/文字/fs-title",
        "token": "--fs-title",
        "css": "clamp(26px, 8.4vw, 40px)",
        "px": {
          "320": 26.88,
          "390": 32.76,
          "430": 36.12
        },
        "uses": 1
      },
      {
        "name": "寸法/文字/fs-title-sm",
        "token": "--fs-title-sm",
        "css": "clamp(18px, 5.4vw, 24px)",
        "px": {
          "320": 18,
          "390": 21.06,
          "430": 23.22
        },
        "uses": 0
      },
      {
        "name": "その他/gutter",
        "token": "--gutter",
        "css": "clamp(10px, 3.2vw, 16px)",
        "px": {
          "320": 10.24,
          "390": 12.48,
          "430": 13.76
        },
        "uses": 0
      },
      {
        "name": "舞台/stage-h",
        "token": "--stage-h",
        "css": "clamp(250px, 44svh, 392px)",
        "px": {
          "320": 343.2,
          "390": 371.36,
          "430": 392
        },
        "uses": 4
      }
    ],
    "mediaOverrides": [
      {
        "token": "--dur-scale",
        "name": "時間/dur-scale",
        "condition": "@media (prefers-reduced-motion: reduce)",
        "value": "0",
        "appliesTo": [],
        "widthConditional": false
      },
      {
        "token": "--shake-amp",
        "name": "その他/shake-amp",
        "condition": "@media (prefers-reduced-motion: reduce)",
        "value": "0px",
        "appliesTo": [],
        "widthConditional": false
      },
      {
        "token": "--fx-particle-scale",
        "name": "その他/fx-particle-scale",
        "condition": "@media (prefers-reduced-motion: reduce)",
        "value": "0",
        "appliesTo": [],
        "widthConditional": false
      },
      {
        "token": "--fs-title",
        "name": "寸法/文字/fs-title",
        "condition": "@media (max-width: 360px)",
        "value": "clamp(24px, 9vw, 32px)",
        "appliesTo": [
          320
        ],
        "widthConditional": true,
        "px": {
          "320": 28.8,
          "390": 32,
          "430": 32
        }
      },
      {
        "token": "--stage-h",
        "name": "舞台/stage-h",
        "condition": "@media (max-width: 360px)",
        "value": "clamp(228px, 42svh, 320px)",
        "appliesTo": [
          320
        ],
        "widthConditional": true,
        "px": {
          "320": 320,
          "390": 320,
          "430": 320
        }
      },
      {
        "token": "--stage-h",
        "name": "舞台/stage-h",
        "condition": "@media (min-width: 900px)",
        "value": "clamp(300px, 50svh, 440px)",
        "appliesTo": [],
        "widthConditional": true,
        "px": {
          "320": 390,
          "390": 422,
          "430": 440
        }
      }
    ],
    "notVariable": [
      {
        "token": "--safe-b",
        "why": "env() は端末依存で Figma に無い",
        "washi": "env(safe-area-inset-bottom, 0px)",
        "sumi": null
      },
      {
        "token": "--safe-t",
        "why": "env() は端末依存で Figma に無い",
        "washi": "env(safe-area-inset-top, 0px)",
        "sumi": null
      },
      {
        "token": "--dur-1",
        "why": "calc() は Figma の変数にできない",
        "washi": "calc(.15s * 1)",
        "sumi": null
      },
      {
        "token": "--dur-2",
        "why": "calc() は Figma の変数にできない",
        "washi": "calc(.22s * 1)",
        "sumi": null
      },
      {
        "token": "--dur-3",
        "why": "calc() は Figma の変数にできない",
        "washi": "calc(.30s * 1)",
        "sumi": null
      },
      {
        "token": "--dur-4",
        "why": "calc() は Figma の変数にできない",
        "washi": "calc(.40s * 1)",
        "sumi": null
      },
      {
        "token": "--ease-out",
        "why": "緩急曲線。Figma では個別に指定する",
        "washi": "cubic-bezier(.22, .80, .30, 1)",
        "sumi": null
      },
      {
        "token": "--ease-in",
        "why": "緩急曲線。Figma では個別に指定する",
        "washi": "cubic-bezier(.50, 0, .85, .30)",
        "sumi": null
      },
      {
        "token": "--ease-std",
        "why": "緩急曲線。Figma では個別に指定する",
        "washi": "cubic-bezier(.40, 0, .20, 1)",
        "sumi": null
      },
      {
        "token": "--fill-primary",
        "why": "グラデーションは変数ではなく Paint Style にする",
        "washi": "linear-gradient(180deg, #24815a, #1a6243)",
        "sumi": "linear-gradient(180deg, #2a8259, #17563a)"
      },
      {
        "token": "--fill-sub",
        "why": "グラデーションは変数ではなく Paint Style にする",
        "washi": "linear-gradient(180deg, #fffefa, #f4efe1)",
        "sumi": "linear-gradient(180deg, #232e28, #1a221e)"
      },
      {
        "token": "--fill-gold",
        "why": "グラデーションは変数ではなく Paint Style にする",
        "washi": "linear-gradient(180deg, #e2c569, #b08d22)",
        "sumi": "linear-gradient(180deg, #e2c569, #a07f2a)"
      },
      {
        "token": "--fill-danger",
        "why": "グラデーションは変数ではなく Paint Style にする",
        "washi": "linear-gradient(180deg, #c04a37, #8c2a1c)",
        "sumi": "linear-gradient(180deg, #c04434, #7d2216)"
      },
      {
        "token": "--fill-urushi",
        "why": "グラデーションは変数ではなく Paint Style にする",
        "washi": "linear-gradient(180deg, #14432f, #0e2f21)",
        "sumi": "linear-gradient(180deg, #111715, #070a09)"
      },
      {
        "token": "--washi-grain",
        "why": "層を重ねた／繰り返しのグラデは Figma の塗り 1 つに写せない。実装側の CSS が正",
        "washi": "repeating-linear-gradient(97deg, rgba(255,255,255,.35) 0 1px, transparent 1px 3px),\r\n    repeating-linear-gradient(7deg,  rgba(120,100,60,.045) 0 1px, transparent 1px 4px),\r\n    radial-gradient(70% 45% at 18% 8%,  rgba(63,143,92,.08), transparent 70%),\r\n    radial-gradient(60% 45% at 86% 92%, rgba(20,67,47,.08), transparent 70%)",
        "sumi": "repeating-linear-gradient(97deg, rgba(244,238,226,.016) 0 1px, transparent 1px 3px),\r\n    repeating-linear-gradient(7deg,  rgba(0,0,0,.20) 0 1px, transparent 1px 4px),\r\n    radial-gradient(70% 45% at 18% 8%,  rgba(106,163,216,.05), transparent 70%),\r\n    radial-gradient(60% 45% at 86% 92%, rgba(217,183,92,.045), transparent 70%)"
      }
    ]
  }
};

/* ────────── src/10-lib.js ────────── */

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


/* ────────── src/20-system.js ────────── */

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


/* ────────── src/30-components.js ────────── */

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


/* ────────── src/40-home.js ────────── */

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


/* ────────── src/50-main.js ────────── */

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
