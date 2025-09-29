import { NextResponse } from 'next/server';
import { fetchReelPublicInsights, fetchReelPublicInsightsDebug, parseShortcode } from '@/lib/instagramPublic';

// AVISO: utiliza heurísticas públicas e endpoints web do Instagram (não-oficiais).
// Pode falhar ou mudar sem aviso. Usar por conta e risco.

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body?.url || '').trim();
    const debugFlag = body?.debug === true || body?.debug === 1 || body?.debug === '1';
    if (!url) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    const code = parseShortcode(url);
    if (!code) return NextResponse.json({ error: 'URL de Reel inválida. Use /reel/{código}' }, { status: 400 });
    if (debugFlag) {
      const { data, debug } = await fetchReelPublicInsightsDebug(url);
      return NextResponse.json({ ...data, _debug: debug });
    } else {
      const data = await fetchReelPublicInsights(url);
      return NextResponse.json(data);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Falha ao obter métricas' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get('url') || '').trim();
  const debugParam = searchParams.get('debug');
  const debugFlag = debugParam === '1' || debugParam === 'true';
  if (!url) return NextResponse.json({ error: 'Parâmetro url é obrigatório' }, { status: 400 });
  return POST(new Request(req.url, { method: 'POST', body: JSON.stringify({ url, debug: debugFlag }) } as any));
}
