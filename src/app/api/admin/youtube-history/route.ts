import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get('url') || '').trim();
  const shortcode = (searchParams.get('shortcode') || '').trim();
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
  let query = supa
    .from('video_metrics')
    .select('id,url,shortcode,views,hashtags,mentions,collected_at')
    .eq('platform', 'youtube')
    .order('collected_at', { ascending: false })
    .limit(limit);
  if (url) query = query.eq('url', url);
  if (shortcode) query = query.eq('shortcode', shortcode);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
