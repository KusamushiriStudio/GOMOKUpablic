// 公開ページ配信。DB に置いた gzip 済み HTML をそのまま返す。
// Storage の公開URLは HTML を text/plain で返すため、ここで正しい Content-Type を付ける。
// 秘密情報は返さない。返すのは build 済みの公開ページ 1 本だけ。

import postgres from 'npm:postgres@3.4.7';

const EXPECTED_SHA = '45290d396e0801854d40c2603eb82d6add119a1e04fd7efcb19ea031bae845dc';

let cachedGz: Uint8Array | null = null;
let cachedRaw: Uint8Array | null = null;
let cachedEtag = '';

async function load(): Promise<void> {
  if (cachedGz) return;
  const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 1, idle_timeout: 5 });
  try {
    const rows = await sql`select gz_b64 from public.engine_bundle where name = 'site'`;
    if (!rows.length) throw new Error('bundle missing');
    const bin = atob(rows[0].gz_b64 as string);
    const gz = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) gz[i] = bin.charCodeAt(i);

    const raw = new Uint8Array(await new Response(
      new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer());

    const digest = await crypto.subtle.digest('SHA-256', raw);
    const sha = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (sha !== EXPECTED_SHA) throw new Error(`sha mismatch: ${sha}`);

    cachedGz = gz;
    cachedRaw = raw;
    cachedEtag = `"${sha.slice(0, 32)}"`;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('method not allowed', { status: 405 });
  }
  try {
    await load();
  } catch (e) {
    return new Response(`unavailable: ${String((e as Error)?.message ?? e)}`, {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=60',
    'ETag': cachedEtag,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });

  if (req.headers.get('if-none-match') === cachedEtag) {
    return new Response(null, { status: 304, headers });
  }
  if (req.method === 'HEAD') {
    headers.set('Content-Length', String(cachedRaw!.length));
    return new Response(null, { status: 200, headers });
  }

  const ae = req.headers.get('accept-encoding') || '';
  if (/\bgzip\b/i.test(ae)) {
    headers.set('Content-Encoding', 'gzip');
    headers.set('Vary', 'Accept-Encoding');
    return new Response(cachedGz, { status: 200, headers });
  }
  headers.set('Vary', 'Accept-Encoding');
  return new Response(cachedRaw, { status: 200, headers });
});
