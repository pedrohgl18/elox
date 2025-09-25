import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const s = await db.settings.get();
  return NextResponse.json(s);
}

export async function PATCH(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null) as Partial<{ socialApiKeys: Partial<{ tiktok: string; instagram: string; kwai: string; youtube: string }> }> | null;
  const keys = body?.socialApiKeys || {};
  const updated = await db.settings.updateSocialApis(keys);
  return NextResponse.json({ socialApiKeys: updated });
}
