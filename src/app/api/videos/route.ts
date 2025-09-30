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

  const body = await req.json().catch(() => null) as { url?: string; socialMedia?: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; competitionId?: string | null } | null;
  if (!body?.url || !body.socialMedia) return NextResponse.json({ error: 'Corpo inválido: informe URL e rede social.' }, { status: 400 });

  // valida e normaliza URL
  const validation = validateVideoUrl(body.url, body.socialMedia);
  if (!validation.ok) return NextResponse.json({ error: validation.reason || 'URL inválida' }, { status: 400 });

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
    // Se competitionId fornecido, validar que o usuário está inscrito
    let competitionId: string | null | undefined = body.competitionId ?? null;
    if (competitionId) {
      const enrolled = await db.competition.isUserEnrolled?.(authUser.id, competitionId);
      if (!enrolled) {
        return NextResponse.json({ error: 'Você não está inscrito nesta campanha.' }, { status: 400 });
      }
    }
    // Se Instagram, tentar coletar insights públicos a partir da URL do Reel
    let meta: { views?: number | null; hashtags?: string[]; mentions?: string[] } | undefined;
    // insights públicos do Instagram desligados neste momento
    const v = await db.video.create(authUser, validation.url, body.socialMedia, competitionId, meta);
    return NextResponse.json(v, { status: 201 });
  } catch (err: any) {
    const rawMsg = String(err?.message || '');
    const msg = rawMsg.toLowerCase();
    const code = err?.code || err?.status || '';
    if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Este vídeo já foi enviado.' }, { status: 409 });
    }
    // Check constraint para plataforma (quando a coluna social_media não aceita 'youtube')
    if (code === '23514' || msg.includes('violates check constraint') || msg.includes('social_media')) {
      return NextResponse.json({
        error: 'A plataforma selecionada não está habilitada no banco de dados. Peça ao administrador para atualizar o schema para aceitar YouTube.',
        hint: 'Atualize a tabela public.videos para incluir youtube no CHECK (social_media).',
      }, { status: 400 });
    }
    // Foreign key: usuário não existe na tabela profiles
    if (msg.includes('violates foreign key constraint') || msg.includes('clipador_id')) {
      return NextResponse.json({
        error: 'Conta não reconhecida no banco para salvar o vídeo. Refaça o login ou contate o administrador.',
        hint: 'Verifique se o usuário existe em public.profiles e se o id do token corresponde ao id na tabela.',
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Falha ao salvar o vídeo. Tente novamente em instantes.' }, { status: 500 });
  }
}
