import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { apifyStartRun } from '@/lib/apify';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const url = (body?.url || '').trim();
  let actor = (process.env.APIFY_ACTOR_TIKTOK || 'clockworks~tiktok-scraper').replace('/', '~');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 });
  const input = actor.toLowerCase().includes('video-scraper') ? { postURLs: [url] } : { videoUrls: [url] };
  const { runId } = await apifyStartRun(token, actor, input, 0);
  if (!runId) return NextResponse.json({ error: 'Failed to start Apify run' }, { status: 502 });
  return NextResponse.json({ runId, actor });
}
