import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

// GET: retorna apenas se o cookie está configurado
export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const s = await db.settings.get();
  return NextResponse.json({ instagramCookieSet: s.instagramCookieSet || s.instagramCookieSet === true || (s as any).instagramCookieSet, ...('instagramCookieSet' in s ? {} : { instagramCookieSet: (s as any).instagramCookieSet }) });
}

// PATCH: define ou remove o cookie (body: { cookie?: string | null })
export async function PATCH(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const ok = await db.settings.setInstagramCookie(body?.cookie ?? null);
  return NextResponse.json({ instagramCookieSet: ok });
}
