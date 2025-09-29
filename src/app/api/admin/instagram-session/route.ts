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
  // Não retorna valor do cookie, apenas estado
  const { data, error } = await supa.from('instagram_admin_session').select('id').limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hasSession: Array.isArray(data) && data.length > 0 });
}

export async function PATCH(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const cookie = (body?.cookie || '').trim();
  const supa = getSupabaseServiceClient();
  if (!supa) return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
  // armazena substituindo registro único (mantemos no máximo 1)
  // estratégia: delete all e insert novo para simplificar
  const del = await supa.from('instagram_admin_session').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });
  if (cookie) {
    const ins = await supa.from('instagram_admin_session').insert({ cookie });
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
