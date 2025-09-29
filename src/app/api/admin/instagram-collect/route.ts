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
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
  try {
    // Coleta exclusivamente via Apify
    const ap = await runApifyInstagram(url).catch(() => null);
    if (!ap) return NextResponse.json({ error: 'Apify did not return data. Check APIFY_TOKEN and actor configuration.' }, { status: 502 });
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
