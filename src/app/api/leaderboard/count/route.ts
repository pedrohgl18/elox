import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get('platform') as 'tiktok' | 'instagram' | 'kwai' | 'all' | null;
  const rows = await db.leaderboard.countByVideos(platform || undefined);
  return NextResponse.json(rows);
}
