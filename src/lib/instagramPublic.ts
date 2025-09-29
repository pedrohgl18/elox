// Utilitário para extrair informações públicas de um Reel a partir do HTML

export type ReelInsights = {
  url: string;
  shortcode: string;
  views?: number | null;
  hashtags: string[];
  mentions: string[];
};

// Debug structures (opcional)
export type ReelDebugEntry = {
  step: string;
  ok?: boolean;
  status?: number;
  url?: string;
  notes?: string;
  extra?: Record<string, any>;
};

type DebugCtx = {
  enabled: boolean;
  logs: ReelDebugEntry[];
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

export function extractViewsFromHtml(html: string): number | null {
  // Normaliza entidades e espaços especiais (NBSP, NNBSP) para facilitar regex textual
  let norm = html
    // entidades comuns de espaço
    .replace(/&nbsp;|&#160;|&#8239;/g, ' ')
    // entidades numéricas decimais
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCharCode(parseInt(n, 10)); } catch { return ' '; }
    })
    // entidades numéricas hexadecimais
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
      try { return String.fromCharCode(parseInt(h, 16)); } catch { return ' '; }
    });

  // 1) Números diretos em JSON/blobs (snake_case), aceitando números entre aspas
  const numFromKey = (key: string): number | null => {
    const reNum = new RegExp(`"${key}"\\s*:\\s*(?:"(\\d+)"|(\\d+))`);
    const m = norm.match(reNum);
    const v = m?.[1] || m?.[2];
    return v ? Number(v) : null;
  };
  const snakeKeys = ['play_count', 'video_view_count', 'view_count', 'views_count'];
  for (const k of snakeKeys) {
    const n = numFromKey(k);
    if (typeof n === 'number' && n > 0) return n;
  }

  // 2) camelCase
  const camelKeys = ['viewCount', 'playCount'];
  for (const k of camelKeys) {
    const n = numFromKey(k);
    if (typeof n === 'number' && n > 0) return n;
  }

  // 3) JSON-LD: interactionStatistic -> userInteractionCount
  const ldMatches = norm.match(/<script type="application\/ld\+json">([\s\s]*?)<\/script>/g) || [];
  for (const tag of ldMatches) {
    const m = tag.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) continue;
    try {
      const json = JSON.parse(m[1]);
      const stats = ([] as any[])
        .concat(json?.interactionStatistic || [])
        .concat(json?.interactionStatistics || []);
      for (const it of stats) {
        const count = it?.userInteractionCount;
        if (typeof count === 'number' && count > 0) return count;
      }
    } catch {}
  }

  // 3.5) Meta: og:video:views
  const ogViews = norm.match(/<meta\s+property=["']og:video:views["']\s+content=["'](\d+)["']\s*\/?\s*>/i);
  if (ogViews && ogViews[1]) {
    const n = Number(ogViews[1]);
    if (isFinite(n) && n > 0) return n;
  }
  // 3.55) Microdata: itemprop="interactionCount" (ex.: UserPlays:1234)
  const micro = norm.match(/<meta[^>]+itemprop=["']interactionCount["'][^>]+content=["'][^"']*(?:UserPlays|UserView|Plays)[:\s]*(\d+)[^"']*["'][^>]*>/i);
  if (micro && micro[1]) {
    const n = Number(micro[1]);
    if (isFinite(n) && n > 0) return n;
  }

  // 3.6) Scripts JSON espalhados na página
  const scriptViews = extractViewsFromScriptsJson(norm);
  if (typeof scriptViews === 'number' && scriptViews > 0) return scriptViews;

  // 4) aria-label textual
  const aria = norm.match(/aria-label="([^"]*?(?:visualizaç(?:ão|ões)|views|reproduções|plays)[^"]*?)"/i);
  if (aria && aria[1]) {
    const got = extractViewsFromText(aria[1]);
    if (typeof got === 'number') return got;
  }

  // 5) Fallback textual amplo (PT/EN) em todo o HTML normalizado
  const got = extractViewsFromText(norm);
  if (typeof got === 'number') return got;

  return null;
}

// Extrai contagem numérica a partir de texto com padrões humanizados (k/mi/milhões), pt/en
function extractViewsFromText(text: string): number | null {
  const patterns = [
    /(\d[\d\.,\s\u00A0\u202F]*)\s*(k|m|b|mi|mil|milhão|milhões|bilhão|bilhões)?\s*(visualizaç(?:ão|ões)|views|reproduções|plays)/gi,
    /(visualizaç(?:ão|ões)|views|reproduções|plays)[^\d]{0,10}(\d[\d\.,\s\u00A0\u202F]*)(\s*(k|m|b|mi|mil|milhão|milhões|bilhão|bilhões))?/gi,
  ];
  let best: number | null = null;
  const scaleOf = (s?: string): number => {
    if (!s) return 1;
    const x = s.toLowerCase();
    if (x === 'k') return 1e3;
    if (x === 'm' || x === 'mi' || x.includes('milh')) return 1e6; // mi | milhão | milhões
    if (x === 'b' || x.includes('bilh')) return 1e9; // bilhão | bilhões
    if (x === 'mil') return 1e3;
    return 1;
  };
  const toNumber = (numStr: string, suffix?: string): number | null => {
    // remove espaços, normaliza milhar/decimal (pt/en)
    let s = numStr.replace(/[\s\u00A0\u202F]+/g, '');
    if (suffix) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
      const f = parseFloat(s);
      if (!isFinite(f)) return null;
      return Math.round(f * scaleOf(suffix));
    }
    s = s.replace(/[^\d]/g, '');
    if (!s) return null;
    const n = parseInt(s, 10);
    return isFinite(n) ? n : null;
  };
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const rawNum = m[1] && /\d/.test(m[1]) ? m[1] : m[2];
      const suf = (m[2] && /[A-Za-z\u00C0-\u017F]/.test(m[2])) ? m[2] : m[3];
      const val = rawNum ? toNumber(rawNum, suf) : null;
      if (typeof val === 'number' && val > 0) {
        if (best === null || val > best) best = val;
      }
    }
  }
  return best;
}

// Busca recursiva por números em possíveis chaves de views
function deepFindNumberByKeys(obj: any, keys: string[]): number | null {
  if (obj == null) return null;
  if (typeof obj === 'number') return obj;
  if (Array.isArray(obj)) {
    for (const it of obj) {
      const n = deepFindNumberByKeys(it, keys);
      if (typeof n === 'number' && n > 0) return n;
    }
    return null;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const val = (obj as any)[k];
      if (keys.includes(k)) {
        // casos: número direto, string numérica, ou objeto com count/value/total
        if (typeof val === 'number' && val > 0) return val;
        if (typeof val === 'string') {
          const n = Number(val.replace(/[^\d]/g, ''));
          if (isFinite(n) && n > 0) return n;
        }
        if (val && typeof val === 'object') {
          const cand = (val as any).count ?? (val as any).value ?? (val as any).total ?? (val as any).int64;
          if (typeof cand === 'number' && cand > 0) return cand;
          if (typeof cand === 'string') {
            const n = Number(cand.replace(/[^\d]/g, ''));
            if (isFinite(n) && n > 0) return n;
          }
        }
      }
      const n = deepFindNumberByKeys(val, keys);
      if (typeof n === 'number' && n > 0) return n;
    }
  }
  return null;
}

// Extrai views percorrendo JSONs em <script>...</script>
function extractViewsFromScriptsJson(html: string): number | null {
  const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const candidateKeys = ['video_view_count','play_count','view_count','viewCount','playCount','videoViewCount','playback_count','playbackCount'];
  for (const tag of scriptTags) {
    // tenta conteúdo como JSON puro
    const mJson = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (!mJson) continue;
    const body = mJson[1].trim();
    // Caso 1: JSON puro começando com { ou [
    if (body.startsWith('{') || body.startsWith('[')) {
      try {
        const data = JSON.parse(body);
        const n = deepFindNumberByKeys(data, candidateKeys);
        if (typeof n === 'number' && n > 0) return n;
      } catch {}
    }
    // Caso 2: atribuição JS "= {...};" — tenta isolar primeiro objeto grande
    const firstBrace = body.indexOf('{');
    const lastBrace = body.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonLike = body.slice(firstBrace, lastBrace + 1);
      try {
        const data = JSON.parse(jsonLike);
        const n = deepFindNumberByKeys(data, candidateKeys);
        if (typeof n === 'number' && n > 0) return n;
      } catch {}
    }
  }
  return null;
}
// -- Utilitários para GraphQL web do Instagram --
function extractLSDToken(html: string): string | null {
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
    const parts = raw.split(/,(?=[^;]+=)/g);
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
  return Array.from(bag.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function attemptGraphQL(shortcode: string, reelUrl: string, ctx?: DebugCtx): Promise<{ views?: number | null; caption?: string } | null> {
  try {
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
    if (ctx?.enabled) ctx.logs.push({ step: 'gql_prefetch_reel', ok: !!lsd1, status: r1.status, url: reelUrl, notes: `lsd:${!!lsd1} cookies:${!!setCookie1}` });

    let lsd = lsd1;
    let cookie = setCookie1;

    if (!lsd) {
      const r2 = await fetch('https://www.instagram.com/', { headers: commonHeaders, redirect: 'follow', cache: 'no-store' });
      const html2 = await r2.text();
      const lsd2 = extractLSDToken(html2);
      const setCookie2 = r2.headers.get('set-cookie');
      lsd = lsd2 || lsd;
      cookie = mergeCookies(cookie, setCookie2);
      if (ctx?.enabled) ctx.logs.push({ step: 'gql_prefetch_home', ok: !!lsd2, status: r2.status, url: 'https://www.instagram.com/', notes: `lsd:${!!lsd2} cookies2:${!!setCookie2}` });
    }

    const cookies = mergeCookies(cookie);
    if (!lsd) return null;

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
        Origin: 'https://www.instagram.com',
        Accept: 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: body.toString(),
    });
    if (ctx?.enabled) ctx.logs.push({ step: 'gql_post', ok: resp.ok, status: resp.status, url: 'https://www.instagram.com/graphql/query', extra: { hasCookies: !!cookies } });
    if (!resp.ok) return null;
    const data = await resp.json().catch(() => null) as any;
    const postData = data?.data?.xdt_shortcode_media || data?.data?.shortcode_media;
    if (ctx?.enabled) ctx.logs.push({ step: 'gql_parse', ok: !!postData, notes: postData ? 'found media' : 'no media' });
    if (!postData) return null;
    const views = typeof postData.video_view_count === 'number' ? postData.video_view_count : null;
    const caption = postData?.edge_media_to_caption?.edges?.[0]?.node?.text || postData?.caption || '';
    return { views, caption };
  } catch {
    if (ctx?.enabled) ctx.logs.push({ step: 'gql_error', ok: false, notes: 'exception thrown' });
    return null;
  }
}

// Tenta endpoints JSON públicos (pouco estáveis): ?__a=1&__d=dis e similares
async function attemptPublicJson(shortcode: string, ctx: DebugCtx, cookies?: string | null): Promise<{ views?: number | null; caption?: string } | null> {
  const urls = [
    `https://www.instagram.com/reel/${shortcode}/?__a=1&__d=dis`,
    `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`,
  ];
  const headers: Record<string, string> = {
    'User-Agent': process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    Accept: 'application/json, text/plain, */*',
    Referer: `https://www.instagram.com/reel/${shortcode}/`,
    Origin: 'https://www.instagram.com',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (cookies) headers['Cookie'] = cookies;

  const deepFindNumberByKeys = (obj: any, keys: string[]): number | null => {
    if (obj == null) return null;
    if (typeof obj === 'number') return obj;
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (keys.includes(k) && typeof val === 'number' && val > 0) return val;
        const nested = deepFindNumberByKeys(val, keys);
        if (typeof nested === 'number' && nested > 0) return nested;
      }
    }
    if (Array.isArray(obj)) {
      for (const it of obj) {
        const nested = deepFindNumberByKeys(it, keys);
        if (typeof nested === 'number' && nested > 0) return nested;
      }
    }
    return null;
  };

  const deepFindCaption = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    // caminhos comuns
    const caption = obj?.edge_media_to_caption?.edges?.[0]?.node?.text
      || obj?.caption?.text
      || obj?.caption
      || obj?.clips_metadata?.music_info?.music_title; // fallback exótico
    if (typeof caption === 'string' && caption.trim()) return caption;
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      if (val && typeof val === 'object') {
        const c = deepFindCaption(val);
        if (c) return c;
      }
    }
    return null;
  };

  for (const u of urls) {
    try {
      const r = await fetch(u, { headers, redirect: 'follow', cache: 'no-store' });
      const ct = r.headers.get('content-type') || '';
      const ok = r.ok && ct.includes('application/json');
      const text = await r.text();
      if (!ok) {
        if (ctx.enabled) ctx.logs.push({ step: 'json_fetch', ok: false, status: r.status, url: u, notes: `ct:${ct}` });
        continue;
      }
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
      if (!data) {
        if (ctx.enabled) ctx.logs.push({ step: 'json_parse', ok: false, url: u });
        continue;
      }
      const views = deepFindNumberByKeys(data, ['video_view_count', 'play_count', 'view_count', 'viewCount', 'playCount']);
      const caption = deepFindCaption(data) || '';
      if (typeof views === 'number' || caption) {
        if (ctx.enabled) ctx.logs.push({ step: 'json_ok', ok: true, url: u, notes: `views:${typeof views === 'number'}` });
        return { views: typeof views === 'number' ? views : null, caption };
      }
      if (ctx.enabled) ctx.logs.push({ step: 'json_no_data', ok: false, url: u });
    } catch {
      if (ctx.enabled) ctx.logs.push({ step: 'json_error', ok: false, url: u });
    }
  }
  return null;
}

export async function fetchPublicHtml(targetUrl: string, cookies?: string | null, ctx?: DebugCtx, acceptLangOverride?: string): Promise<string> {
  const desktopUA = process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1';
  const host = new URL(targetUrl).hostname;
  const isMobileHost = /(^|\.)mbasic\.instagram\.com$/i.test(host) || /(^|\.)m\.instagram\.com$/i.test(host);
  const UA = isMobileHost ? mobileUA : desktopUA;
  const headers: Record<string, string> = {
    'User-Agent': UA,
    'Accept-Language': acceptLangOverride || 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    Referer: 'https://www.instagram.com/',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (cookies) headers['Cookie'] = cookies;
  const res = await fetch(targetUrl, {
    headers,
    redirect: 'follow',
    cache: 'no-store',
  });
  const html = await res.text();
  if (ctx?.enabled) ctx.logs.push({ step: 'html_fetch', ok: res.ok, status: res.status, url: targetUrl, notes: `len:${html.length}` });
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

async function internalFetchReelPublicInsights(url: string, ctx: DebugCtx, opts?: { strong?: boolean }): Promise<ReelInsights> {
  const shortcode = parseShortcode(url);
  if (!shortcode) throw new Error('URL de Reel inválida. Use /reel/{código}');
  // 0) Tenta obter via GraphQL web (se disponível)
  const gql = await attemptGraphQL(shortcode, url, ctx).catch(() => null);
  if (gql?.caption || typeof gql?.views === 'number') {
    const { hashtags, mentions } = extractHashtagsAndMentions(gql.caption || '');
    if (ctx.enabled) ctx.logs.push({ step: 'result', ok: true, notes: 'from_graphql' });
    return { url, shortcode, views: typeof gql.views === 'number' ? gql.views : null, hashtags, mentions };
  }
  // 0.5) Tenta endpoints JSON públicos (__a=1&__d=dis)
  let sessionCookies: string | null = null;
  try {
    const homeRes = await fetch('https://www.instagram.com/', {
      headers: {
        'User-Agent': process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        Referer: 'https://www.instagram.com/',
      },
      redirect: 'follow',
      cache: 'no-store',
    });
    sessionCookies = mergeCookies(homeRes.headers.get('set-cookie'));
    if (ctx.enabled) ctx.logs.push({ step: 'home_cookies', ok: !!sessionCookies, status: homeRes.status, url: 'https://www.instagram.com/' });
  } catch {}
  // merge com cookie opcional fornecido via env (uso opcional; mantém modo sem login por padrão)
  const injectedCookie = process.env.IG_SCRAPER_COOKIE || process.env.SCRAPER_COOKIE || null;
  if (injectedCookie) {
    sessionCookies = mergeCookies(sessionCookies, injectedCookie);
    if (ctx.enabled) ctx.logs.push({ step: 'cookie_injected', ok: true, notes: 'env:IG_SCRAPER_COOKIE' });
  }
  const jsonTry = await attemptPublicJson(shortcode, ctx, sessionCookies).catch(() => null);
  if (jsonTry?.caption || typeof jsonTry?.views === 'number') {
    const { hashtags, mentions } = extractHashtagsAndMentions(jsonTry.caption || '');
    if (ctx.enabled) ctx.logs.push({ step: 'result', ok: true, notes: 'from_public_json' });
    return { url, shortcode, views: typeof jsonTry.views === 'number' ? jsonTry.views : null, hashtags, mentions };
  }
  // 1) Fallback HTML: Tentar múltiplas variantes (original, canônica, embed, etc.)
  const candidates = [
    url,
    `https://www.instagram.com/reel/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/?utm_source=ig_embed`,
    `https://www.instagram.com/reel/${shortcode}/?utm_source=ig_web_copy_link`,
    `https://www.instagram.com/reel/${shortcode}/embed/`,
    `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/reels/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/?locale=en_US`,
    `https://www.instagram.com/reel/${shortcode}/?hl=en`,
    // versões mobile básicas
    `https://mbasic.instagram.com/reel/${shortcode}/`,
    `https://mbasic.instagram.com/p/${shortcode}/`,
    // versão mobile padrão
    `https://m.instagram.com/reel/${shortcode}/`,
    `https://m.instagram.com/p/${shortcode}/`,
  ];
  let html: string | null = null;
  let htmlWithViews: string | null = null;
  let firstContentHtml: string | null = null;
  let viewsFound: number | null = null;
  for (const candidate of candidates) {
    try {
      let h = await fetchPublicHtml(candidate, sessionCookies, ctx);
      // Heurística melhorada: considerar OK se acharmos qualquer sinal de conteúdo útil
      const hasLd = /application\/ld\+json/i.test(h);
      const ogDesc = /<meta\s+property="og:description"\s+content="[^"]+"/i.test(h);
      const capTry = extractCaptionFromHtml(h);
      let vvTry = extractViewsFromHtml(h);
      if (!vvTry && opts?.strong) {
        // tentativa extra: refetch com Accept-Language em inglês
        const hEn = await fetchPublicHtml(candidate, sessionCookies, ctx, 'en-US,en;q=0.9');
        const vvEn = extractViewsFromHtml(hEn);
        if (typeof vvEn === 'number') {
          h = hEn;
          vvTry = vvEn;
          if (ctx.enabled) ctx.logs.push({ step: 'lang_refetch', ok: true, url: candidate, notes: 'Accept-Language: en-US' });
        } else {
          // mantém h original
          vvTry = extractViewsFromHtml(h);
        }
      }
      const containsLogin = /login|Entrar no Instagram|faça login/i.test(h);
      const hasContent = (capTry && capTry.trim().length > 0) || (typeof vvTry === 'number') || ogDesc || hasLd;
      if (hasContent) {
        if (!firstContentHtml) firstContentHtml = h;
        if (typeof vvTry === 'number') {
          // guarda sempre o maior valor de views encontrado
          if (viewsFound == null || vvTry > viewsFound) {
            htmlWithViews = h;
            viewsFound = vvTry;
          }
        }
  if (ctx.enabled) ctx.logs.push({ step: 'html_candidate_ok', ok: true, url: candidate, notes: `cap:${capTry ? capTry.length : 0} views:${typeof vvTry === 'number'} og:${ogDesc} ld:${hasLd}`, extra: { viewsValue: typeof vvTry === 'number' ? vvTry : null } });
        // não interrompe: segue buscando variantes que eventualmente exponham número maior/mais confiável
        continue;
      }
      const isBlocked = containsLogin && !hasContent;
      if (isBlocked) {
        if (ctx.enabled) ctx.logs.push({ step: 'html_candidate_blocked', ok: false, url: candidate, notes: `og:${ogDesc} ld:${hasLd}` });
      } else {
        if (ctx.enabled) ctx.logs.push({ step: 'html_candidate_no_content', ok: false, url: candidate, notes: `og:${ogDesc} ld:${hasLd}` });
      }
    } catch {
      // tenta o próximo
      if (ctx.enabled) ctx.logs.push({ step: 'html_candidate_error', ok: false, url: candidate });
    }
  }
  // Define o HTML final preferindo onde encontramos views
  html = htmlWithViews || firstContentHtml || null;
  if (!html) {
    // Última tentativa: usar canônica mesmo bloqueada e tentar og:description
    html = await fetchPublicHtml(`https://www.instagram.com/reel/${shortcode}/`, sessionCookies, ctx);
    const hasLd = /application\/ld\+json/i.test(html);
    const ogDesc = /<meta\s+property="og:description"\s+content="[^"]+"/i.test(html);
    const capTry = extractCaptionFromHtml(html);
    let vvTry = extractViewsFromHtml(html);
    if (!vvTry && opts?.strong) vvTry = extractViewsFromHtml(html);
    const containsLogin = /login|Entrar no Instagram|faça login/i.test(html);
    const hasContent = (capTry && capTry.trim().length > 0) || (typeof vvTry === 'number') || ogDesc || hasLd;
    const isBlocked = containsLogin && !hasContent;
    if (isBlocked) {
      if (ctx.enabled) ctx.logs.push({ step: 'final_blocked', ok: false, url: `https://www.instagram.com/reel/${shortcode}/`, notes: `cap:${capTry ? capTry.length : 0} views:${typeof vvTry === 'number'} og:${ogDesc} ld:${hasLd}` });
      throw new Error('Instagram bloqueou a visualização pública para este conteúdo.');
    }
  }
  const caption = extractCaptionFromHtml(html);
  const { hashtags, mentions } = extractHashtagsAndMentions(caption || '');
  let views = typeof viewsFound === 'number' ? viewsFound : extractViewsFromHtml(html);
  // Evita falso-positivo típico "1" de textos soltos
  if (views === 1) views = null;
  if (ctx.enabled) ctx.logs.push({ step: 'result', ok: true, notes: 'from_html', extra: { hasCaption: !!caption, hasViews: typeof views === 'number' } });
  return { url, shortcode, views: typeof views === 'number' && !Number.isNaN(views) ? views : null, hashtags, mentions };
}

export async function fetchReelPublicInsights(url: string, opts?: { strong?: boolean }): Promise<ReelInsights> {
  const ctx: DebugCtx = { enabled: false, logs: [] };
  return internalFetchReelPublicInsights(url, ctx, opts);
}

export async function fetchReelPublicInsightsDebug(url: string, opts?: { strong?: boolean }): Promise<{ data?: ReelInsights; debug: ReelDebugEntry[]; error?: string }> {
  const ctx: DebugCtx = { enabled: true, logs: [] };
  try {
    const data = await internalFetchReelPublicInsights(url, ctx, opts);
    return { data, debug: ctx.logs };
  } catch (e: any) {
    const message = e?.message || 'Falha ao obter métricas';
    return { error: message, debug: ctx.logs };
  }
}
