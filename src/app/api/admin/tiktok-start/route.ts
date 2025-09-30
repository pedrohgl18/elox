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
  // Se não houver actor forçado por env, para URLs de vídeo priorizamos o tiktok-video-scraper (mais direto)
  const forced = process.env.APIFY_ACTOR_TIKTOK;
  let actor = (forced || 'clockworks~tiktok-scraper').replace('/', '~');
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 });
  const isVideoUrl = (() => { try { const u = new URL(url); return u.hostname.includes('tiktok.com') && u.pathname.includes('/video/'); } catch { return false; } })();
  if (!forced && isVideoUrl) actor = 'clockworks~tiktok-video-scraper';
  const isVideoActor = actor.toLowerCase().includes('video-scraper');
  const input = isVideoActor
    ? { postURLs: [url], postUrls: [url], urls: [url], startUrls: [{ url }] }
    : { videoUrls: [url], videoURLs: [url], urls: [url], startUrls: [{ url }], postURLs: [url] };
  // Configura webhook ad-hoc para persistir no backend ao finalizar
  const secret = process.env.APIFY_WEBHOOK_SECRET;
  const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL; // defina no Netlify o domínio público
  const webhooks = (secret && baseUrl) ? [{
    eventTypes: ['ACTOR.RUN.SUCCEEDED'],
    requestUrl: `${baseUrl.replace(/\/$/, '')}/api/admin/tiktok-webhook?secret=${encodeURIComponent(secret)}`,
    // Importante: enviar {{resource}} como objeto JSON (sem aspas), conforme docs do Apify
    payloadTemplate: '{"resource":{{resource}}}',
  }] : undefined;
  const { runId } = await apifyStartRun(token, actor, input, 0, { webhooks });
  if (!runId) return NextResponse.json({ error: 'Failed to start Apify run' }, { status: 502 });
  return NextResponse.json({ runId, actor });
}
