import { readFile } from 'node:fs/promises';

const INDEX_URL = new URL('../../index.html', import.meta.url);

let cachedRequire = null;

/**
 * Load the module registry embedded in index.html without booting app.js.
 *
 * The public build is a single HTML file. Replacing only its final boot call
 * lets the pure rules/profile/story modules be tested without a DOM shim and
 * without changing the production bundle to expose test-only globals.
 */
export async function loadTriadBundle() {
  if (cachedRequire) return cachedRequire;

  const html = await readFile(INDEX_URL, 'utf8');
  const configAt = html.indexOf('__TRIAD_NO_PATH_ROUTING__');
  const scriptStart = html.indexOf('(function () {', configAt);
  const scriptEnd = html.lastIndexOf('</script>');
  if (configAt < 0 || scriptStart < 0 || scriptEnd <= scriptStart) {
    throw new Error('index.html の埋め込みモジュールを見つけられませんでした。');
  }

  const bootCall = '__req("app.js");';
  const bundle = html.slice(scriptStart, scriptEnd);
  const bootAt = bundle.lastIndexOf(bootCall);
  if (bootAt < 0) {
    throw new Error('index.html の app.js 起動箇所を見つけられませんでした。');
  }

  const testableBundle = `${bundle.slice(0, bootAt)}return __req;${bundle.slice(bootAt + bootCall.length)}`;
  // The source is the repository's own checked-in bundle. Evaluating it here
  // mirrors the browser module loader while the replaced return skips app boot.
  const requireModule = Function(`"use strict"; return ${testableBundle}`)();
  if (typeof requireModule !== 'function') {
    throw new Error('埋め込みモジュールローダーの初期化に失敗しました。');
  }

  cachedRequire = requireModule;
  return cachedRequire;
}

