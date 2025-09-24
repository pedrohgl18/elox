import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { validateUsername, normalizeUsername, sanitizePixKey, validatePixKey } from '@/lib/validation';

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
    if (!validateUsername(username)) return NextResponse.json({ ok: false, error: 'Username inválido' }, { status: 400 });
    if (!validatePixKey(pixKey)) return NextResponse.json({ ok: false, error: 'PixKey inválida' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ ok: false, error: 'Senha muito curta' }, { status: 400 });
    const svc = getSupabaseServiceClient();
    if (!svc) return NextResponse.json({ ok: false, error: 'Configuração de backend ausente' }, { status: 500 });
    // Normalização (case-insensitive)
    const usernameNorm = normalizeUsername(username);
    // Verifica email duplicado
    const existingEmail = await svc.from('profiles').select('id').eq('email', email).maybeSingle();
    if (existingEmail.data) return NextResponse.json({ ok: false, error: 'Email já cadastrado' }, { status: 409 });
    // Verifica username duplicado (case-insensitive) usando username_normalized se disponível
    let existingUser: any = await svc.from('profiles').select('id').eq('username_normalized', usernameNorm).maybeSingle();
    if (!existingUser.data) {
      // fallback se coluna não existir ainda: comparar lower(username)
      const { data: rawList } = await svc.from('profiles').select('id, username').ilike('username', usernameNorm);
      if (rawList && rawList.length > 0) existingUser = { data: rawList[0] };
    }
    if (existingUser.data) return NextResponse.json({ ok: false, error: 'Username indisponível' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const insert = {
      email,
      username,
      role: 'clipador',
      is_active: true,
      warnings: 0,
      total_earnings: 0,
      pix_key: sanitizePixKey(pixKey) ?? null,
      password_hash: hash,
      // username_normalized é coluna gerada; não incluir no insert
    } as any;
    const { error } = await svc.from('profiles').insert(insert);
    if (error) {
      const code = (error as any).code;
      if (code === '23505') { // unique violation
        const msg = (error as any).message || '';
        if (msg.includes('email')) return NextResponse.json({ ok: false, error: 'Email já cadastrado' }, { status: 409 });
        if (msg.includes('username')) return NextResponse.json({ ok: false, error: 'Username indisponível' }, { status: 409 });
        return NextResponse.json({ ok: false, error: 'Registro duplicado' }, { status: 409 });
      } else if (code === '428C9' || code === '42703') {
        // 428C9: cannot insert into generated column (ou 42703 missing column)
        return NextResponse.json({ ok: false, error: 'Schema desatualizado. Reaplique migração de perfis.' }, { status: 500 });
      }
      console.error('Erro Supabase insert profile', error);
      return NextResponse.json({ ok: false, error: 'Falha ao criar usuário' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'Erro inesperado' }, { status: 500 });
  }
}
