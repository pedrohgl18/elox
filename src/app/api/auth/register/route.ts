import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

// Rate limit simples em memória (reiniciado a cada reload)
interface Bucket { count: number; resetAt: number; }
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQ = 5;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, pixKey } = body as { email?: string; username?: string; password?: string; pixKey?: string };

    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + WINDOW_MS;
    }
    bucket.count += 1;
    buckets.set(ip, bucket);
    if (bucket.count > MAX_REQ) {
      const retrySec = Math.ceil((bucket.resetAt - now) / 1000);
      return new NextResponse(JSON.stringify({ ok: false, error: 'Muitas tentativas, tente mais tarde.' }), {
        status: 429,
        headers: {
          'Retry-After': String(retrySec),
          'Content-Type': 'application/json',
        }
      });
    }
    if (!email || !username || !password) {
      return NextResponse.json({ ok: false, error: 'Dados incompletos' }, { status: 400 });
    }
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ ok: false, error: 'Username inválido' }, { status: 400 });
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
