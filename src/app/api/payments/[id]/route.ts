import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const list = await db.payment.listForUser(user);
  const p = list.find((x) => x.id === params.id);
  if (!p) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const p = await db.payment.markProcessed(params.id);
  if (!p) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(p);
}
