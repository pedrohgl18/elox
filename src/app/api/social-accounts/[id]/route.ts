import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null) as { username?: string } | null;
  // valida ownership antes de alterar
  const mine = (await db.social.listForUser(user.id)).find((a: any) => a.id === params.id);
  if (!mine) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  const updated = await db.social.patch(params.id, { username: body?.username });
  if (!updated) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // valida ownership
  const mine = (await db.social.listForUser(user.id)).find((a: any) => a.id === params.id);
  if (!mine) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  const ok = await db.social.remove(params.id);
  if (!ok) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
