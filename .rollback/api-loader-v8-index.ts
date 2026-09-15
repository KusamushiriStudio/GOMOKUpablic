/**
 * TRIAD API のローダー（デプロイされる実体）。
 *
 * 実装本体（supabase/functions/api/{index,store,social,engine}.ts を esbuild でまとめたもの）は
 * gzip+base64 で public.engine_bundle に置き、ここで展開して読み込む。
 * 転送の破損・改ざんを検知できるよう、展開後の SHA-256 を下の定数と突き合わせる。
 */

import postgres from 'npm:postgres@3.4.7';

const APP_SHA = '446aa7beb8fdd295b6fd9031b659f64443b74bf052aeb7cb7a16c8dafa9383d6';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

let failure: string | null = null;

try {
  const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, {
    prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10,
  });
  const rows = await sql`select gz_b64, sha256_src from public.engine_bundle where name = 'app'`;
  await sql.end({ timeout: 5 });

  if (!rows.length || !rows[0].gz_b64) throw new Error('app バンドルが未転送です。');
  if (rows[0].sha256_src !== APP_SHA) throw new Error('app バンドルの想定ハッシュが一致しません。');

  const bin = atob(rows[0].gz_b64 as string);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);

  const buf = await new Response(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),
  ).arrayBuffer();

  const digest = await sha256Hex(buf);
  if (digest !== APP_SHA) throw new Error(`app バンドルのハッシュ不一致: ${digest}`);

  // 本体は読み込まれた時点で Deno.serve を呼ぶ
  await import('data:text/javascript;charset=utf-8,'
    + encodeURIComponent(new TextDecoder().decode(buf)));
} catch (e) {
  failure = String((e as Error)?.message ?? e);
  console.error('[loader]', e);
}

if (failure) {
  Deno.serve(() =>
    new Response(
      JSON.stringify({ ok: false, code: 'boot_failed', message: 'サーバーの準備ができていません。' }),
      { status: 503, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } },
    ));
}
