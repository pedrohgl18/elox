import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { apifyGetRun, apifyGetDatasetItems } from '@/lib/apify';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');
  const url = searchParams.get('url') || '';
  if (!runId) return NextResponse.json({ error: 'runId is required' }, { status: 400 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 });
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });

  const { status, datasetId } = await apifyGetRun(token, runId);
  if (!status) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  if (!datasetId) return NextResponse.json({ status });
  const items = await apifyGetDatasetItems(token, datasetId, 10);
  if (!items.length) return NextResponse.json({ status });

  // Extrair métricas básicas do primeiro item válido
  const cand = items.find((p: any) => {
    const v = [p?.stats?.playCount, p?.playCount, p?.views, p?.videoViewCount].map((x: any) => typeof x === 'string' ? Number(x) : (typeof x === 'number' ? x : NaN)).find((x: number) => isFinite(x) && x > 1);
    return isFinite(Number(v));
  }) || items[0];
  const views = (() => {
    const arr = [cand?.stats?.playCount, cand?.playCount, cand?.views, cand?.videoViewCount];
    for (const v of arr) { const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN); if (isFinite(n) && n >= 0) return Math.round(n); }
    return null;
  })();
  const caption = cand?.desc || cand?.text || cand?.title || '';
  const hashtags = Array.from(new Set((caption.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m: string) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((caption.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m: string) => m.trim())));
  const shortcode = (() => {
    try { const u = new URL(url); const parts = u.pathname.split('/').filter(Boolean); const i = parts.findIndex((p) => p === 'video'); return i >= 0 ? parts[i+1] || null : null; } catch { return null; }
  })();

  // Evitar duplicidade por polling: se já houver coleta nos últimos 2 minutos, não inserimos de novo
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const exists = await supa.from('video_metrics')
    .select('id').eq('platform', 'tiktok').eq('url', url)
    .gte('collected_at', twoMinAgo).limit(1).maybeSingle();
  if (!exists.error && exists.data) {
    return NextResponse.json({ status, url, shortcode, views, hashtags, mentions, dedup: true });
  }
  const ins = await supa.from('video_metrics').insert({ platform: 'tiktok', url, shortcode, views, hashtags, mentions });
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ status, url, shortcode, views, hashtags, mentions });
}
