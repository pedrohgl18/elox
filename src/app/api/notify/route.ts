import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      // fallback: aceitar em memória para dev
      console.warn('Supabase não configurado. Aceitando email apenas no log.');
      return NextResponse.redirect(new URL('/?notificado=1', req.url));
    }

    const { data, error } = await supabase
      .from('elox_waitlist')
      .upsert({ email }, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('Erro ao salvar email na waitlist:', error);
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/?notificado=1', req.url));
  } catch (e) {
    console.error('Notify error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
