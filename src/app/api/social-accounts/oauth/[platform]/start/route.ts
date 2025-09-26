import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

// Fluxo de início de OAuth (mock): cria/garante conta pendente e redireciona para callback
export async function GET(_req: Request, { params }: { params: { platform: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const platform = (params.platform || '').toLowerCase();
  const allowed = ['tiktok', 'instagram', 'kwai', 'youtube'];
  if (!allowed.includes(platform)) return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });

  // Garante existência de uma conta para o usuário; no mock, criamos verificada direto
  try {
    const existing = (await db.social?.listForUser?.(user.id)) || [];
    const found = existing.find((a: any) => a.platform === platform);
    if (!found) {
      // cria com username placeholder
      await db.social?.create?.(user.id, { platform, username: `${platform}_user_${user.username}` });
    }
  } catch {}

  // Redireciona para o callback (mock de sucesso)
  const url = new URL(`/api/social-accounts/oauth/${platform}/callback`, process.env.NEXTAUTH_URL || 'http://localhost');
  return NextResponse.redirect(url.toString());
}
