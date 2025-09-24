import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, pixKey } = body as { email?: string; username?: string; password?: string; pixKey?: string };
    if (!email || !username || !password) {
      return NextResponse.json({ ok: false, error: 'Dados incompletos' }, { status: 400 });
    }
    if (password.length < 6) return NextResponse.json({ ok: false, error: 'Senha muito curta' }, { status: 400 });
    const svc = getSupabaseServiceClient();
    if (!svc) return NextResponse.json({ ok: false, error: 'Configuração de backend ausente' }, { status: 500 });
    // Verifica email duplicado
    const existing = await svc.from('profiles').select('id').eq('email', email).maybeSingle();
    if (existing.data) return NextResponse.json({ ok: false, error: 'Email já cadastrado' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const insert = {
      email,
      username,
      role: 'clipador',
      is_active: true,
      warnings: 0,
      total_earnings: 0,
      pix_key: pixKey ?? null,
      password_hash: hash,
    };
    const { error } = await svc.from('profiles').insert(insert);
    if (error) {
      console.error('Erro Supabase insert profile', error);
      return NextResponse.json({ ok: false, error: 'Falha ao criar usuário' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'Erro inesperado' }, { status: 500 });
  }
}
