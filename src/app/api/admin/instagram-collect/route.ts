import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { collectInstagramWithSession } from '@/lib/instagramCollect';

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
    const res = await collectInstagramWithSession(url, data.cookie);
    // persiste histórico
    await supa.from('video_metrics').insert({ platform: 'instagram', url: res.url, shortcode: res.shortcode, views: res.views, hashtags: res.hashtags, mentions: res.mentions });
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to collect' }, { status: 500 });
  }
}
