import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { collectInstagramWithSession } from '@/lib/instagramCollect';
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
  // recupera cookie
  const { data, error } = await supa.from('instagram_admin_session').select('cookie').limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.cookie) return NextResponse.json({ error: 'Instagram session not set' }, { status: 400 });
  try {
    let res = await collectInstagramWithSession(url, data.cookie);
    // Se views e caption não vieram, tenta fallback via Apify (se APIFY_TOKEN estiver definido)
    if ((!res.views || res.views <= 1) && (!res.hashtags?.length && !res.mentions?.length)) {
      const ap = await runApifyInstagram(url).catch(() => null);
      if (ap) {
        res = { ...res, views: ap.views ?? res.views ?? null, hashtags: ap.hashtags ?? res.hashtags, mentions: ap.mentions ?? res.mentions };
      }
    }
    // persiste histórico
    const ins = await supa
      .from('video_metrics')
      .insert({ platform: 'instagram', url: res.url, shortcode: res.shortcode, views: res.views, hashtags: res.hashtags, mentions: res.mentions });
    if (ins.error) {
      console.error('[instagram-collect] insert error:', ins.error);
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    return NextResponse.json(res);
  } catch (e: any) {
    console.error('[instagram-collect] collect error:', e);
    return NextResponse.json({ error: e.message || 'Failed to collect' }, { status: 500 });
  }
}
