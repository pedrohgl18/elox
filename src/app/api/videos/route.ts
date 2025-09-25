import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';
import { validateVideoUrl } from '@/lib/validation';

// rate limit simples em memória por usuário para POST (janela curta)
const rateMap = new Map<string, { ts: number; count: number }>();
const WINDOW_MS = 30_000; // 30s
const LIMIT = 3; // 3 envios/30s

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authUser = await db.auth.getById((session.user as any).id as string);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const list = await db.video.listForUser(authUser);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authUser = await db.auth.getById((session.user as any).id as string);
  if (!authUser || authUser.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { url?: string; socialMedia?: 'tiktok' | 'instagram' | 'kwai' } | null;
  if (!body?.url || !body.socialMedia) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  // valida e normaliza URL
  const validation = validateVideoUrl(body.url, body.socialMedia);
  if (!validation.ok) return NextResponse.json({ error: validation.reason || 'Invalid URL' }, { status: 400 });

  // rate limiting simples
  const key = authUser.id;
  const now = Date.now();
  const bucket = rateMap.get(key);
  if (!bucket || now - bucket.ts > WINDOW_MS) {
    rateMap.set(key, { ts: now, count: 1 });
  } else {
    if (bucket.count >= LIMIT) {
      return NextResponse.json({ error: 'Muitas requisições, tente novamente em instantes.' }, { status: 429 });
    }
    bucket.count += 1;
  }

  // evitar duplicidade por URL para o usuário (case-insensitive, após normalização)
  const existing = await db.video.listForUser(authUser);
  const normalizedUrl = validation.url.toLowerCase();
  const dup = existing.find((v: any) => (v.url || '').toLowerCase() === normalizedUrl);
  if (dup) return NextResponse.json({ error: 'Este vídeo já foi enviado.' }, { status: 409 });

  try {
    const v = await db.video.create(authUser, validation.url, body.socialMedia);
    return NextResponse.json(v, { status: 201 });
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    const code = err?.code || err?.status || '';
    if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Este vídeo já foi enviado.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Falha ao salvar o vídeo.' }, { status: 500 });
  }
}
