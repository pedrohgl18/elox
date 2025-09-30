import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { fetchYoutubePublicInsights, parseYoutubeId } from '@/lib/youtube';

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
    // Cooldown simples para evitar recoleta muito frequente, a menos que force=true
    const cooldownMin = Math.max(0, Math.min(240, Number(process.env.YT_COOLDOWN_MIN) || 30));
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

    const yt = await fetchYoutubePublicInsights(url);
    if (!yt) {
      const configured = !!process.env.YOUTUBE_API_KEY;
      return NextResponse.json({ error: 'YouTube API não configurada (YOUTUBE_API_KEY ausente).', hint: { configured } }, { status: 502 });
    }
    const videoId = parseYoutubeId(url);
    const ins = await supa
      .from('video_metrics')
      .insert({ platform: 'youtube', url, shortcode: videoId, views: yt.views, hashtags: yt.hashtags, mentions: yt.mentions });
    if (ins.error) {
      console.error('[youtube-collect] insert error:', ins.error);
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    return NextResponse.json({ url, videoId, views: yt.views, hashtags: yt.hashtags, mentions: yt.mentions });
  } catch (e: any) {
    console.error('[youtube-collect] collect error:', e);
    return NextResponse.json({ error: e.message || 'Failed to collect' }, { status: 500 });
  }
}
