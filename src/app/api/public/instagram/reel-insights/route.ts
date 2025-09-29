import { NextResponse } from 'next/server';

// AVISO IMPORTANTE: Esta rota utiliza scraping de HTML público do Instagram para extrair
// metadados básicos (legenda e possíveis contagens exibidas na página).
// Isso NÃO é parte da API oficial da Meta e pode quebrar sem aviso.
// Use por sua conta e risco e revise as políticas de uso.

type Result = {
  url: string;
  shortcode: string;
  views?: number | null;
  hashtags: string[];
  mentions: string[];
};

function parseShortcode(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // formatos possíveis: /reel/{code}/ ou /p/{code}/
    const idx = parts[0] === 'reel' || parts[0] === 'p' ? 1 : -1;
    if (idx === -1) return null;
    const code = parts[idx];
    return code ? code : null;
  } catch {
    return null;
  }
}

function extractHashtagsAndMentions(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

async function fetchPublicHtml(targetUrl: string): Promise<string> {
  // Nota: Instagram pode bloquear requisições server-side; adicionamos um UA comum
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    // Sem redirecionar para login se possível
    redirect: 'follow',
    cache: 'no-store',
  });
  const html = await res.text();
  if (!res.ok) {
    throw new Error(`Instagram respondeu ${res.status}`);
  }
  return html;
}

function extractCaptionFromHtml(html: string): string {
  // Estratégias:
  // 1) JSON-LD: "caption" ou "articleBody"
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldMatch) {
    try {
      const json = JSON.parse(ldMatch[1]);
      const text = json?.caption || json?.articleBody || json?.description;
      if (typeof text === 'string') return text;
    } catch {}
  }
  // 2) meta property="og:description"
  const og = html.match(/<meta property="og:description" content="([^"]+)"\s*\/>/);
  if (og && og[1]) return og[1];
  // 3) Fallback: procurar por "caption":"..."
  const cap = html.match(/"caption"\s*:\s*"([\s\S]*?)"/);
  if (cap && cap[1]) return cap[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
  return '';
}

function extractViewsFromHtml(html: string): number | null {
  // Procurar por "play_count" ou "video_view_count" em blobs de JSON
  const pc = html.match(/"play_count"\s*:\s*(\d+)/);
  if (pc && pc[1]) return Number(pc[1]);
  const vv = html.match(/"video_view_count"\s*:\s*(\d+)/);
  if (vv && vv[1]) return Number(vv[1]);
  // Alguns templates usam "view_count";
  const vc = html.match(/"view_count"\s*:\s*(\d+)/);
  if (vc && vc[1]) return Number(vc[1]);
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body?.url || '').trim();
    if (!url) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    const shortcode = parseShortcode(url);
    if (!shortcode) return NextResponse.json({ error: 'URL de Reel inválida. Use /reel/{código}' }, { status: 400 });

    const html = await fetchPublicHtml(url);
    // Heurística: se a página exigir login, conterá prompts específicos
    if (/login|Entrar no Instagram|faça login/i.test(html) && !/application\/ld\+json/i.test(html)) {
      return NextResponse.json({ error: 'Instagram bloqueou a visualização pública para este conteúdo.' }, { status: 451 });
    }

    const caption = extractCaptionFromHtml(html);
    const { hashtags, mentions } = extractHashtagsAndMentions(caption || '');
    const views = extractViewsFromHtml(html);

    const result: Result = {
      url,
      shortcode,
      views: typeof views === 'number' && !Number.isNaN(views) ? views : null,
      hashtags,
      mentions,
    };
    return NextResponse.json(result);
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
