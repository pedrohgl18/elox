import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await db.leaderboard.competitionByViews(params.id);
  if (!data) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(data);
}
