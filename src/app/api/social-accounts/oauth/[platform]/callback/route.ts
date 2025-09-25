import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

// Stub de callback OAuth: apenas marca a conta como verificada quando chamada
export async function GET(_req: Request, { params }: { params: { platform: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // No mock, se existir alguma conta pendente dessa plataforma, marca como verified
  const list = await db.social.listForUser(user.id);
  const pending = list.find((a: any) => a.platform === params.platform && a.status === 'pending');
  if (!pending) return NextResponse.json({ ok: true, message: 'Nenhuma conta pendente para verificar.' });
  const updated = await db.social.patch(pending.id, { status: 'verified' });
  return NextResponse.json({ ok: true, account: updated });
}
