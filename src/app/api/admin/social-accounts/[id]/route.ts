import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null) as { status?: 'pending' | 'verified' | 'revoked' } | null;
  if (!body?.status) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const updated = await db.social.setStatus(params.id, body.status);
  if (!updated) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updated);
}
