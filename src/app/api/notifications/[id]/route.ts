import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const updated = await db.notifications.markRead(params.id);
  if (!updated) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updated);
}
