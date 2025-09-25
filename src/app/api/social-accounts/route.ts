import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const list = await db.social.listForUser(user.id);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null) as { platform?: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; username?: string } | null;
  if (!body?.platform || !body.username) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const created = await db.social.create(user.id, { platform: body.platform, username: body.username });
  return NextResponse.json(created, { status: 201 });
}
