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
  rules?: { minViews?: number; allowedPlatforms?: Array<'tiktok' | 'instagram' | 'kwai' | 'youtube'>; requiredHashtags?: string[]; requiredMentions?: string[] };
    rewards?: Array<{ fromPlace: number; toPlace: number; amount: number; platform?: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; description?: string }>;
    isActive?: boolean;
    assets?: { audioLinks?: Array<{ platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; url: string; label?: string }> };
    phases?: Array<{ name: string; startDate: string; endDate: string; description?: string }>;
  } | null;
  if (!body?.name || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const comp = await db.competition.create({
    name: body.name,
    description: body.description,
    bannerImageUrl: body.bannerImageUrl,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    rules: {
      minViews: body.rules?.minViews != null ? Number(body.rules.minViews) : undefined,
      allowedPlatforms: body.rules?.allowedPlatforms,
      requiredHashtags: body.rules?.requiredHashtags,
      requiredMentions: body.rules?.requiredMentions,
    },
    rewards: body.rewards,
    isActive: body.isActive,
    assets: body.assets,
    phases: body.phases?.map((ph) => ({ ...ph, startDate: new Date(ph.startDate as string), endDate: new Date(ph.endDate as string) } as any)),
  });
  return NextResponse.json(comp, { status: 201 });
}
