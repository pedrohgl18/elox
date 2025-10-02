import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    let email = '';
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      email = String(body?.email || '').trim().toLowerCase();
    } else {
      const formData = await req.formData();
      email = String(formData.get('email') || '').trim().toLowerCase();
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      // fallback: aceitar em memória para dev
      console.warn('Supabase não configurado. Aceitando email apenas no log.');
      return NextResponse.json({ ok: true });
    }

    const { data, error } = await supabase
      .from('elox_waitlist')
      .upsert({ email }, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('Erro ao salvar email na waitlist:', error);
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Notify error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
