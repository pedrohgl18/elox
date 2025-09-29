import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
  const { data, error } = await supa.from('instagram_admin_session').select('cookie').limit(1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.cookie) return NextResponse.json({ authenticated: false, reason: 'no-cookie' });
  // Tenta acessar uma página que exige login; se redirecionar para login, não está autenticado
  const resp = await fetch('https://www.instagram.com/accounts/edit/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Referer: 'https://www.instagram.com/',
      Cookie: data.cookie,
    },
    redirect: 'manual',
    cache: 'no-store',
  });
  const location = resp.headers.get('location') || '';
  const isLoginRedirect = location.includes('/accounts/login');
  return NextResponse.json({ authenticated: resp.status === 200 && !isLoginRedirect, status: resp.status, location });
}
