import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET() {
  const list = await db.competition.list();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as {
    name?: string;
    description?: string;
    bannerImageUrl?: string;
    startDate?: string;
    endDate?: string;
    rules?: { cpm?: number; minViews?: number; allowedPlatforms?: Array<'tiktok' | 'instagram' | 'kwai'> };
    rewards?: Array<{ place: number; amount: number; description?: string }>;
    isActive?: boolean;
  } | null;
  if (!body?.name || !body.startDate || !body.endDate || !body.rules?.cpm) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const comp = await db.competition.create({
    name: body.name,
    description: body.description,
    bannerImageUrl: body.bannerImageUrl,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    rules: {
      cpm: Number(body.rules.cpm),
      minViews: body.rules.minViews ? Number(body.rules.minViews) : undefined,
      allowedPlatforms: body.rules.allowedPlatforms,
    },
    rewards: body.rewards,
    isActive: body.isActive,
  });
  return NextResponse.json(comp, { status: 201 });
}
