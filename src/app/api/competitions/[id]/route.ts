import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const c = await db.competition.getById(params.id);
  if (!c) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as Partial<{
    name: string;
    description: string;
    bannerImageUrl: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    rules: { cpm: number; minViews?: number; allowedPlatforms?: Array<'tiktok' | 'instagram' | 'kwai'> };
    rewards: Array<{ place: number; amount: number; description?: string }>;
  }> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const payload: any = { ...body };
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.endDate) payload.endDate = new Date(payload.endDate);
  const updated = await db.competition.patch(params.id, payload);
  if (!updated) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const ok = await db.competition.remove(params.id);
  if (!ok) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
