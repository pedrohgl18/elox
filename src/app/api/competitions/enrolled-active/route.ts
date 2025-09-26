import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const comps = (await db.competition.listEnrolledForUser?.(user.id)) || [];
  const now = Date.now();
  const active = comps.filter((c: any) => now >= c.startDate.getTime() && now <= c.endDate.getTime());
  return NextResponse.json(active);
}
