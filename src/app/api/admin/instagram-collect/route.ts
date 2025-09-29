import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { runApifyInstagram } from '@/lib/apify';

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
    const cooldownMin = Math.max(0, Math.min(240, Number(process.env.APIFY_COOLDOWN_MIN) || 30));
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
    // Coleta exclusivamente via Apify
    const ap = await runApifyInstagram(url).catch(() => null);
    if (!ap) {
      const actor = (process.env.APIFY_ACTOR || 'apify~instagram-scraper').replace('/', '~');
      const waitSec = Math.max(5, Math.min(60, Number(process.env.APIFY_WAIT_SEC) || 25));
      const configured = !!process.env.APIFY_TOKEN;
      return NextResponse.json({
        error: 'Apify did not return data. Check APIFY_TOKEN, APIFY_ACTOR and optionally APIFY_WAIT_SEC.',
        hint: { configured, actor, waitSec }
      }, { status: 502 });
    }
    const shortcode = parseShortcode(url);
    const ins = await supa
      .from('video_metrics')
      .insert({ platform: 'instagram', url, shortcode, views: ap.views, hashtags: ap.hashtags, mentions: ap.mentions });
    if (ins.error) {
      console.error('[instagram-collect] insert error:', ins.error);
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    return NextResponse.json({ url, shortcode, views: ap.views, hashtags: ap.hashtags, mentions: ap.mentions });
  } catch (e: any) {
    console.error('[instagram-collect] collect error:', e);
    return NextResponse.json({ error: e.message || 'Failed to collect' }, { status: 500 });
  }
}

function parseShortcode(input: string): string | null {
  try {
    const u = new URL(input);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts[0] === 'reel' || parts[0] === 'reels' || parts[0] === 'p' ? 1 : -1;
    if (idx === -1) return null;
    return parts[idx] || null;
  } catch {
    return null;
  }
}
