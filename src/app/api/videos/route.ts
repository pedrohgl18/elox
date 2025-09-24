import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authUser = await db.auth.getById((session.user as any).id as string);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const list = await db.video.listForUser(authUser);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authUser = await db.auth.getById((session.user as any).id as string);
  if (!authUser || authUser.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { url?: string; socialMedia?: 'tiktok' | 'instagram' | 'kwai' } | null;
  if (!body?.url || !body.socialMedia) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const v = await db.video.create(authUser, body.url, body.socialMedia);
  return NextResponse.json(v, { status: 201 });
}
