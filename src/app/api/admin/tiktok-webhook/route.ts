import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { apifyGetDatasetItems } from '@/lib/apify';

// Webhook para ACTOR.RUN.SUCCEEDED do Apify
// Segurança: usamos um segredo simples via query param ?secret=... configurado por env APIFY_WEBHOOK_SECRET

export async function POST(req: Request) {
  const secret = process.env.APIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const provided = searchParams.get('secret');
  if (!provided || provided !== secret) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 });
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });

  const bodyText = await req.text();
  let payload: any = null;
  try { payload = JSON.parse(bodyText); } catch { payload = null; }
  const dsId = payload?.resource?.defaultDatasetId || payload?.resource?.datasetId || payload?.resource?.defaultDatasetId || null;
  const inputUrl = payload?.resource?.input?.videoUrls?.[0]
    || payload?.resource?.input?.postURLs?.[0]
    || payload?.resource?.input?.postUrls?.[0]
    || payload?.resource?.input?.urls?.[0]
    || payload?.resource?.input?.url
    || '';

  if (!dsId) return NextResponse.json({ ok: true, note: 'no dataset id' });

  const items = await apifyGetDatasetItems(token, dsId, 10);
  if (!items?.length) return NextResponse.json({ ok: true, note: 'no items yet' });

  // Pick best candidate and extract metrics
  const flat: any[] = [];
  for (const it of items) {
    if (!it) continue;
    flat.push(it);
    if (it.item) flat.push(it.item);
    if (it.data) flat.push(it.data);
    if (it.video) flat.push(it.video);
    if (Array.isArray((it as any).items)) flat.push(...(it as any).items);
    if (Array.isArray((it as any).videos)) flat.push(...(it as any).videos);
  }
  const pick = (arr: any[]) => arr.find((p) => {
    const cand = [p?.stats?.playCount, p?.playCount, p?.videoViewCount, p?.views, p?.play_count, p?.stats?.play_count];
    const n = cand.map((x) => (typeof x === 'string' ? Number(x) : (typeof x === 'number' ? x : NaN))).find((x) => isFinite(x) && x > 1);
    return isFinite(Number(n));
  }) || arr[0];
  const item = pick(flat.length ? flat : items);

  const caption = item?.desc || item?.text || item?.title || '';
  const hashtags = Array.from(new Set((caption.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m: string) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((caption.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m: string) => m.trim())));
  const views = (() => {
    const cand = [item?.stats?.playCount, item?.playCount, item?.videoViewCount, item?.views, item?.play_count, item?.stats?.play_count];
    for (const v of cand) {
      const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
      if (isFinite(n) && n >= 0) return Math.round(n);
    }
    return null;
  })();

  const url = inputUrl || item?.webVideoUrl || item?.web_video_url || item?.url || '';
  const shortcode = (() => {
    try { const u = new URL(url); const parts = u.pathname.split('/').filter(Boolean); const i = parts.findIndex((p) => p === 'video'); return i >= 0 ? parts[i+1] || null : null; } catch { return null; }
  })();

  // Dedupe 5 min
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const exists = await supa.from('video_metrics').select('id').eq('platform', 'tiktok').eq('url', url).gte('collected_at', fiveMinAgo).limit(1).maybeSingle();
  if (!exists.error && exists.data) return NextResponse.json({ ok: true, dedup: true });

  const ins = await supa.from('video_metrics').insert({ platform: 'tiktok', url, shortcode, views, hashtags, mentions });
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, url, views, hashtags, mentions });
}
