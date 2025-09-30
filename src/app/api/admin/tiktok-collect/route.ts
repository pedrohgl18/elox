import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { runApifyTiktok } from '@/lib/apify';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const url = (body?.url || '').trim();
  const force = !!body?.force;
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
  try {
    const cooldownMin = Math.max(0, Math.min(240, Number(process.env.TT_COOLDOWN_MIN) || 30));
    if (!force && cooldownMin > 0) {
      const latest = await supa
        .from('video_metrics')
        .select('collected_at')
        .eq('url', url)
        .order('collected_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const latestAt = (latest.data as any)?.collected_at ? new Date((latest.data as any).collected_at) : null;
      if (latestAt) {
        const ageMin = (Date.now() - latestAt.getTime()) / 60000;
        if (ageMin < cooldownMin) {
          return NextResponse.json({ skipped: true, reason: 'recent', latestAt: latestAt.toISOString(), cooldownMin });
        }
      }
    }
    let tk = await runApifyTiktok(url).catch(() => null);
    // fallback: tentar ator específico de vídeo
    if (!tk) {
      tk = await runApifyTiktok(url, { actorId: 'clockworks~tiktok-video-scraper' }).catch(() => null);
    }
    if (!tk) {
      const configured = !!process.env.APIFY_TOKEN;
      const actor = (process.env.APIFY_ACTOR_TIKTOK || 'clockworks~tiktok-scraper').replace('/', '~');
      const waitSec = Math.max(5, Math.min(60, Number(process.env.APIFY_WAIT_SEC) || 8));
      return NextResponse.json({ error: 'Apify TikTok não retornou dados. Verifique APIFY_TOKEN e APIFY_ACTOR_TIKTOK.', hint: { configured, actor, waitSec } }, { status: 502 });
    }
    const shortcode = parseTiktokId(url);
    const ins = await supa
      .from('video_metrics')
      .insert({ platform: 'tiktok', url, shortcode, views: tk.views, hashtags: tk.hashtags, mentions: tk.mentions });
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
    return NextResponse.json({ url, shortcode, views: tk.views, hashtags: tk.hashtags, mentions: tk.mentions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Falha ao coletar métricas do TikTok.' }, { status: 500 });
  }
}

function parseTiktokId(input: string): string | null {
  try {
    const u = new URL(input);
    const parts = u.pathname.split('/').filter(Boolean);
    const vidIdx = parts.findIndex((p) => p === 'video');
    if (vidIdx >= 0) return parts[vidIdx + 1] || null;
    return null;
  } catch { return null; }
}
