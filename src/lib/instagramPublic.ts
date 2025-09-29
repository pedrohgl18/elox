// Utilitário para extrair informações públicas de um Reel a partir do HTML

export type ReelInsights = {
  url: string;
  shortcode: string;
  views?: number | null;
  hashtags: string[];
  mentions: string[];
};

// Heurísticos da web do Instagram (não oficial e sujeito a mudanças)
const IG_APP_ID = '936619743392459';
const IG_ASBD_ID = '129477';
const IG_GRAPHQL_DOC_ID = '8845758582119845'; // pode mudar sem aviso

export function parseShortcode(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts[0] === 'reel' || parts[0] === 'reels' || parts[0] === 'p' ? 1 : -1;
    if (idx === -1) return null;
    const code = parts[idx];
    return code ? code : null;
  } catch {
    return null;
  }
}

export function extractHashtagsAndMentions(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

function extractLSDToken(html: string): string | null {
  // Possíveis padrões para capturar o token LSD usado no cabeçalho X-FB-LSD
  const m1 = html.match(/"LSD"\s*,\s*\[\s*\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"\s*\}/);
  if (m1) return m1[1];
  const m2 = html.match(/"lsd"\s*:\s*\{\s*"token"\s*:\s*"([^"]+)"\s*\}/i);
  if (m2) return m2[1];
  const m3 = html.match(/name=\"lsd\"\s+value=\"([^"]+)\"/i);
  if (m3) return m3[1];
  return null;
}

function mergeCookies(...sets: Array<string | null | undefined>): string | null {
  const bag = new Map<string, string>();
  for (const raw of sets) {
    if (!raw) continue;
    const parts = raw.split(/,(?=[^;]+=)/g); // separa múltiplos Set-Cookie
    for (const p of parts) {
      const seg = p.split(';')[0].trim();
      const eq = seg.indexOf('=');
      if (eq > 0) {
        const k = seg.slice(0, eq).trim();
        const v = seg.slice(eq + 1).trim();
        if (k && v) bag.set(k, v);
      }
    }
  }
  if (bag.size === 0) return null;
  return Array.from(bag.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function attemptGraphQL(shortcode: string, reelUrl: string): Promise<{ views?: number | null; caption?: string } | null> {
  try {
    // 1) Tenta obter HTML do Reel e/ou home para extrair LSD e cookies
    const UA = process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const commonHeaders: Record<string, string> = {
      'User-Agent': UA,
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      Referer: 'https://www.instagram.com/',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const r1 = await fetch(reelUrl, { headers: commonHeaders, redirect: 'follow', cache: 'no-store' });
    const html1 = await r1.text();
    const lsd1 = extractLSDToken(html1);
    const setCookie1 = r1.headers.get('set-cookie');

    let lsd = lsd1;
    let cookie = setCookie1;

    if (!lsd) {
      const r2 = await fetch('https://www.instagram.com/', { headers: commonHeaders, redirect: 'follow', cache: 'no-store' });
      const html2 = await r2.text();
      const lsd2 = extractLSDToken(html2);
      const setCookie2 = r2.headers.get('set-cookie');
      lsd = lsd2 || lsd;
      cookie = mergeCookies(cookie, setCookie2);
    }

    const cookies = mergeCookies(cookie);
    if (!lsd) return null; // sem LSD, GraphQL web geralmente rejeita

    // 2) Monta chamada ao endpoint GraphQL com doc_id e variables
    const variables = {
      shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null,
    } as Record<string, any>;
    const body = new URLSearchParams();
    body.set('doc_id', IG_GRAPHQL_DOC_ID);
    body.set('variables', JSON.stringify(variables));

    const resp = await fetch('https://www.instagram.com/graphql/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': commonHeaders['User-Agent'],
        'Accept-Language': commonHeaders['Accept-Language'],
        'X-FB-LSD': lsd,
        'X-IG-App-ID': IG_APP_ID,
        'X-ASBD-ID': IG_ASBD_ID,
        Referer: reelUrl,
        Accept: 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: body.toString(),
    });
    if (!resp.ok) return null;
    const data = await resp.json().catch(() => null) as any;
    const postData = data?.data?.xdt_shortcode_media || data?.data?.shortcode_media;
    if (!postData) return null;
    const views = typeof postData.video_view_count === 'number' ? postData.video_view_count : null;
    const caption = postData?.edge_media_to_caption?.edges?.[0]?.node?.text || postData?.caption || '';
    return { views, caption };
  } catch {
    return null;
  }
}

export async function fetchPublicHtml(targetUrl: string): Promise<string> {
  const UA = process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Referer': 'https://www.instagram.com/',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'X-Requested-With': 'XMLHttpRequest',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  const html = await res.text();
  if (!res.ok) throw new Error(`Instagram respondeu ${res.status}`);
  return html;
}

export function extractCaptionFromHtml(html: string): string {
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldMatch) {
    try {
      const json = JSON.parse(ldMatch[1]);
      const text = json?.caption || json?.articleBody || json?.description;
      if (typeof text === 'string') return text;
    } catch {}
  }
  const og = html.match(/<meta property="og:description" content="([^"]+)"\s*\/>/);
  if (og && og[1]) return og[1];
  const tw = html.match(/<meta name="twitter:description" content="([^"]+)"\s*\/>/);
  if (tw && tw[1]) return tw[1];
  const cap = html.match(/"caption"\s*:\s*"([\s\S]*?)"/);
  if (cap && cap[1]) return cap[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
  return '';
}

export function extractViewsFromHtml(html: string): number | null {
  const pc = html.match(/"play_count"\s*:\s*(\d+)/);
  if (pc && pc[1]) return Number(pc[1]);
  const vv = html.match(/"video_view_count"\s*:\s*(\d+)/);
  if (vv && vv[1]) return Number(vv[1]);
  const vc = html.match(/"view_count"\s*:\s*(\d+)/);
  if (vc && vc[1]) return Number(vc[1]);
  return null;
}

export async function fetchReelPublicInsights(url: string): Promise<ReelInsights> {
  const shortcode = parseShortcode(url);
  if (!shortcode) throw new Error('URL de Reel inválida. Use /reel/{código}');
  // 0) Tenta obter via GraphQL web (se disponível)
  const gql = await attemptGraphQL(shortcode, url).catch(() => null);
  if (gql?.caption || typeof gql?.views === 'number') {
    const { hashtags, mentions } = extractHashtagsAndMentions(gql.caption || '');
    return { url, shortcode, views: typeof gql.views === 'number' ? gql.views : null, hashtags, mentions };
  }
  // 1) Fallback: Tentar múltiplas variantes (original, canônica, embed, etc.)
  const candidates = [
    url,
    `https://www.instagram.com/reel/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/?utm_source=ig_embed`,
    `https://www.instagram.com/reel/${shortcode}/?utm_source=ig_web_copy_link`,
    `https://www.instagram.com/reel/${shortcode}/embed/`,
    `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
  ];
  let html: string | null = null;
  for (const candidate of candidates) {
    try {
      const h = await fetchPublicHtml(candidate);
      // Se tiver JSON-LD, provavelmente conseguimos extrair
      const hasLd = /application\/ld\+json/i.test(h);
      const isBlocked = /login|Entrar no Instagram|faça login/i.test(h) && !hasLd;
      if (!isBlocked || hasLd) {
        html = h;
        break;
      }
    } catch {
      // tenta o próximo
    }
  }
  if (!html) {
    // Última tentativa: usar canônica mesmo bloqueada e tentar og:description
    html = await fetchPublicHtml(`https://www.instagram.com/reel/${shortcode}/`);
    const hasLd = /application\/ld\+json/i.test(html);
    const isBlocked = /login|Entrar no Instagram|faça login/i.test(html) && !hasLd;
    if (isBlocked && !hasLd) {
      throw new Error('Instagram bloqueou a visualização pública para este conteúdo.');
    }
  }
  const caption = extractCaptionFromHtml(html);
  const { hashtags, mentions } = extractHashtagsAndMentions(caption || '');
  const views = extractViewsFromHtml(html);
  return { url, shortcode, views: typeof views === 'number' && !Number.isNaN(views) ? views : null, hashtags, mentions };
}
