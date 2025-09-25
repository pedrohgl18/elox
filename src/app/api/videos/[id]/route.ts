import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const v = await db.video.getById(params.id);
  if (!v) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  if (user.role !== 'admin' && v.clipadorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(v);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { action?: 'approve' | 'reject' } | null;
  if (!body?.action) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const result = body.action === 'approve' ? await db.video.approve(params.id) : await db.video.reject(params.id);
  if (!result) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  // Criar notificação para o dono do vídeo
  try {
    const ownerId = result.clipadorId;
    const type = body.action === 'approve' ? 'video_approved' : 'video_rejected';
    const title = body.action === 'approve' ? 'Vídeo aprovado' : 'Vídeo rejeitado';
    const message = body.action === 'approve'
      ? 'Seu vídeo foi aprovado e começará a contar métricas.'
      : 'Seu vídeo foi rejeitado. Revise as diretrizes e tente novamente.';
    if (db.notifications?.create) {
      await db.notifications.create({ userId: ownerId, type, title, message });
    }
  } catch (e) {
    console.error('Falha ao criar notificação:', e);
  }
  return NextResponse.json(result);
}
