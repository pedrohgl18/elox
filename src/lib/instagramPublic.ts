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

async function attemptGraphQL(shortcode: string, reelUrl: string, ctx?: DebugCtx): Promise<{ views?: number | null; caption?: string } | null> {
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

export async function fetchPublicHtml(targetUrl: string, cookies?: string | null, ctx?: DebugCtx): Promise<string> {
  const UA = process.env.IG_SCRAPER_UA || process.env.SCRAPER_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const headers: Record<string, string> = {
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

export function extractViewsFromHtml(html: string): number | null {
  // 1) Números diretos em JSON/blobs (snake_case)
  const pc = html.match(/"play_count"\s*:\s*(\d+)/);
  if (pc && pc[1]) return Number(pc[1]);
  const vv = html.match(/"video_view_count"\s*:\s*(\d+)/);
  if (vv && vv[1]) return Number(vv[1]);
  const vc = html.match(/"view_count"\s*:\s*(\d+)/);
  if (vc && vc[1]) return Number(vc[1]);
  // 2) Possíveis camelCase em blobs JS
  const vcc = html.match(/"viewCount"\s*:\s*(\d+)/);
  if (vcc && vcc[1]) return Number(vcc[1]);
  const pcc = html.match(/"playCount"\s*:\s*(\d+)/);
  if (pcc && pcc[1]) return Number(pcc[1]);
  // 3) JSON-LD: interactionStatistic -> userInteractionCount (às vezes representa views)
  const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
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
  // 4) Fallback textual (embed/DOM): "1.234.567 visualizações" | "2,5 mi views" | "120k views"
  //    Buscamos diversas variantes em PT/EN e convertimos para número absoluto.
  const patterns = [
    /(\d[\d\.,\s]*)\s*(k|m|b|mi|mil|milhão|milhões|bilhão|bilhões)?\s*(visualizaç(?:ão|ões)|views|reproduções|plays)/gi,
    /(visualizaç(?:ão|ões)|views|reproduções|plays)[^\d]{0,10}(\d[\d\.,\s]*)(\s*(k|m|b|mi|mil|milhão|milhões|bilhão|bilhões))?/gi,
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
    let s = numStr.replace(/\s+/g, '');
    if (suffix) {
      // nota: tratar decimal com vírgula
      s = s.replace(/\./g, '').replace(/,/g, '.');
      const f = parseFloat(s);
      if (!isFinite(f)) return null;
      return Math.round(f * scaleOf(suffix));
    }
    // sem sufixo: remover separadores de milhar e manter apenas dígitos
    s = s.replace(/[^\d]/g, '');
    if (!s) return null;
    const n = parseInt(s, 10);
    return isFinite(n) ? n : null;
  };
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      // Padrão pode capturar em posições diferentes conforme a regex usada acima
      const rawNum = m[1] && /\d/.test(m[1]) ? m[1] : m[2];
      const suf = (m[2] && /[A-Za-z]/.test(m[2])) ? m[2] : m[3];
      const val = rawNum ? toNumber(rawNum, suf) : null;
      if (typeof val === 'number' && val > 0) {
        if (best === null || val > best) best = val; // pega o maior número plausível encontrado
      }
    }
  }
  if (typeof best === 'number') return best;
  return null;
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
  // 1) Fallback: Tentar múltiplas variantes (original, canônica, embed, etc.)
  // Primeiro, tenta capturar cookies da home para reutilizar nas próximas requisições
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
  ];
  let html: string | null = null;
  let htmlWithViews: string | null = null;
  let firstContentHtml: string | null = null;
  let viewsFound: number | null = null;
  for (const candidate of candidates) {
    try {
      const h = await fetchPublicHtml(candidate, sessionCookies, ctx);
      // Heurística melhorada: considerar OK se acharmos qualquer sinal de conteúdo útil
      const hasLd = /application\/ld\+json/i.test(h);
      const ogDesc = /<meta\s+property="og:description"\s+content="[^"]+"/i.test(h);
      const capTry = extractCaptionFromHtml(h);
      let vvTry = extractViewsFromHtml(h);
      if (!vvTry && opts?.strong) {
        // Já incorporado dentro de extractViewsFromHtml o fallback textual; manter tentativa única
        vvTry = extractViewsFromHtml(h);
      }
      const containsLogin = /login|Entrar no Instagram|faça login/i.test(h);
      const hasContent = (capTry && capTry.trim().length > 0) || (typeof vvTry === 'number') || ogDesc || hasLd;
      if (hasContent) {
        if (!firstContentHtml) firstContentHtml = h;
        if (typeof vvTry === 'number') {
          htmlWithViews = h;
          viewsFound = vvTry;
        }
        if (ctx.enabled) ctx.logs.push({ step: 'html_candidate_ok', ok: true, url: candidate, notes: `cap:${capTry ? capTry.length : 0} views:${typeof vvTry === 'number'} og:${ogDesc} ld:${hasLd}` });
        // Continua a procurar uma variante que traga views explícitas (ex.: /embed/)
        if (typeof vvTry === 'number') break;
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
  const views = typeof viewsFound === 'number' ? viewsFound : extractViewsFromHtml(html);
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
