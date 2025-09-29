import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const configured = !!process.env.APIFY_TOKEN;
  const actor = process.env.APIFY_ACTOR || 'apify~instagram-scraper';
  const waitSec = Math.max(5, Math.min(60, Number(process.env.APIFY_WAIT_SEC) || 25));

  return NextResponse.json({ configured, actor, waitSec });
}
