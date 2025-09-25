import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const rows = await db.leaderboard.global();
  return NextResponse.json(rows);
}
