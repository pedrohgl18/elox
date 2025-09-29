import { NextResponse } from 'next/server';
import { fetchReelPublicInsights, parseShortcode } from '@/lib/instagramPublic';

// AVISO: utiliza heurísticas públicas e endpoints web do Instagram (não-oficiais).
// Pode falhar ou mudar sem aviso. Usar por conta e risco.

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body?.url || '').trim();
    if (!url) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    const code = parseShortcode(url);
    if (!code) return NextResponse.json({ error: 'URL de Reel inválida. Use /reel/{código}' }, { status: 400 });
    const data = await fetchReelPublicInsights(url);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Falha ao obter métricas' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get('url') || '').trim();
  if (!url) return NextResponse.json({ error: 'Parâmetro url é obrigatório' }, { status: 400 });
  return POST(new Request(req.url, { method: 'POST', body: JSON.stringify({ url }) } as any));
}
