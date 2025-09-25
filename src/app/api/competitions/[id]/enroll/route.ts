import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const comp = await db.competition.getById(params.id);
  if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const already = await db.competition.isUserEnrolled?.(user.id, params.id);
  if (already) return NextResponse.json({ ok: true, enrolled: true }, { status: 200 });

  const ok = await db.competition.enroll?.(user.id, params.id);
  if (!ok) return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  return NextResponse.json({ ok: true, enrolled: true }, { status: 201 });
}
