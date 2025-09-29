// Minimal Instagram collector using an authenticated session cookie (server-side only)
export type IgCollectResult = { url: string; shortcode: string | null; views: number | null; hashtags: string[]; mentions: string[] };

function parseShortcode(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts[0] === 'reel' || parts[0] === 'reels' || parts[0] === 'p' ? 1 : -1;
    if (idx === -1) return null;
    return parts[idx] || null;
  } catch {
    return null;
  }
}

function extractCaption(html: string): string {
  const og = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1];
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ld?.[1]) {
    try { const j = JSON.parse(ld[1]); return j?.caption || j?.description || ''; } catch {}
  }
  return '';
}

function extractViews(html: string): number | null {
  const ogViews = html.match(/<meta\s+property=["']og:video:views["']\s+content=["'](\d+)["']/i);
  if (ogViews?.[1]) { const n = Number(ogViews[1]); if (isFinite(n) && n > 0) return n; }
  const jsonCount = html.match(/"(?:video_view_count|play_count|view_count|viewCount)"\s*:\s*("?)(\d+)\1/);
  if (jsonCount?.[2]) { const n = Number(jsonCount[2]); if (isFinite(n) && n > 1) return n; }
  // JSON-LD interactionStatistic
  const ldAll = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi));
  for (const m of ldAll) {
    try {
      const j = JSON.parse(m[1]);
      const arr = Array.isArray(j) ? j : [j];
      for (const item of arr) {
        const stats = item?.interactionStatistic || item?.interactionStatistics;
        const statsArr = Array.isArray(stats) ? stats : (stats ? [stats] : []);
        for (const s of statsArr) {
          const t = (s?.interactionType || s?.['@type'] || '').toString().toLowerCase();
          if (t.includes('watch') || t.includes('interaction')) {
            const val = s?.userInteractionCount ?? s?.interactionCount;
            const n = typeof val === 'string' ? Number(val) : (typeof val === 'number' ? val : NaN);
            if (isFinite(n) && n > 1) return Math.round(n);
          }
        }
      }
    } catch {}
  }
  const text = html.replace(/&nbsp;|&#160;|&#8239;/g, ' ');
  const m = /(\d[\d\.,\s]*)\s*(k|m|mi|milh(?:ão|ões)|bilh(?:ão|ões))?\s*(views|visualizaç(?:ão|ões))/i.exec(text);
  if (m) {
    let s = (m[1] || '').replace(/[\s\u00A0\u202F]/g, '');
    const suf = (m[2] || '').toLowerCase();
    s = s.replace(/\./g, '').replace(/,/g, '.');
    const f = parseFloat(s);
    if (isFinite(f)) {
      const mult = suf.startsWith('k') ? 1e3 : (suf.startsWith('m') || suf.startsWith('mi') || suf.includes('milh')) ? 1e6 : suf.includes('bilh') ? 1e9 : 1;
      const n = Math.round(f * mult);
      if (n > 1) return n;
    }
  }
  return null;
}

function extractTags(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

export async function collectInstagramWithSession(url: string, cookie: string): Promise<IgCollectResult> {
  const shortcode = parseShortcode(url);
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    Referer: 'https://www.instagram.com/',
    Cookie: cookie,
  };
  const res = await fetch(url, { headers, redirect: 'follow', cache: 'no-store' });
  const html = await res.text();
  if (!res.ok) throw new Error(`Instagram respondeu ${res.status}`);
  let caption = extractCaption(html);
  let views = extractViews(html);
  // Fallback: tentar endpoint JSON autenticado com __a=1&__d=dis por shortcode
  if ((!views || views <= 1) || !caption) {
    if (shortcode) {
      const jsonHeaders: Record<string, string> = {
        'User-Agent': headers['User-Agent'],
        'Accept-Language': headers['Accept-Language'],
        Accept: 'application/json',
        Referer: 'https://www.instagram.com/',
        Cookie: cookie,
        'X-Requested-With': 'XMLHttpRequest',
        'X-IG-App-ID': '936619743392459',
      };
      const candidates = [
        `https://www.instagram.com/reel/${shortcode}/?__a=1&__d=dis`,
        `https://www.instagram.com/reels/${shortcode}/?__a=1&__d=dis`,
        `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`,
      ];
      for (const apiUrl of candidates) {
        try {
          const jr = await fetch(apiUrl, { headers: jsonHeaders, redirect: 'follow', cache: 'no-store' });
          const txt = await jr.text();
          // Alguns ambientes retornam "for (;;);" prefixo – remover antes do JSON.parse
          const clean = txt.replace(/^for \(;;\);/, '');
          const j = JSON.parse(clean);
          // Tentativa robusta: varrer o JSON em busca de campos de contagem de views e caption
          const { viewCount, cap } = deepExtractViewAndCaption(j);
          if (!caption && cap) caption = cap;
          if ((!views || views <= 1) && typeof viewCount === 'number' && viewCount > 1) views = viewCount;
          if (caption || (typeof views === 'number' && views > 1)) break;
        } catch {
          // tenta próximo candidate
        }
      }

      // Fallback mobile: i.instagram.com com UA mobile
      if ((!views || views <= 1) || !caption) {
        const mobileHeaders: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
          Accept: 'application/json',
          Referer: 'https://www.instagram.com/',
          Cookie: cookie,
          'X-Requested-With': 'XMLHttpRequest',
          'X-IG-App-ID': '936619743392459',
        };
        const mobileUrl = `https://i.instagram.com/api/v1/media/shortcode/${shortcode}/`;
        try {
          const jr2 = await fetch(mobileUrl, { headers: mobileHeaders, redirect: 'follow', cache: 'no-store' });
          const txt2 = await jr2.text();
          const j2 = JSON.parse(txt2);
          const { viewCount, cap } = deepExtractViewAndCaption(j2);
          if (!caption && cap) caption = cap;
          if ((!views || views <= 1) && typeof viewCount === 'number' && viewCount > 1) views = viewCount;
        } catch {
          // ignora
        }
      }
    }
  }

  // Último recurso: tentar variante HTML em en-US (algumas páginas exibem metatags em inglês)
  if ((!views || views <= 1) || !caption) {
    try {
      const altHeaders = { ...headers, 'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8' } as Record<string, string>;
      const rr = await fetch(url, { headers: altHeaders, redirect: 'follow', cache: 'no-store' });
      if (rr.ok) {
        const h2 = await rr.text();
        if (!caption) caption = extractCaption(h2);
        if (!views || views <= 1) {
          const v2 = extractViews(h2);
          if (typeof v2 === 'number' && v2 > 1) views = v2;
        }
      }
    } catch {}
  }
  const { hashtags, mentions } = extractTags(caption);
  return { url, shortcode, views, hashtags, mentions };
}

// Percorre recursivamente o objeto procurando chaves plausíveis
function deepExtractViewAndCaption(obj: any): { viewCount: number | null; cap: string } {
  let foundViews: number | null = null;
  let foundCaption = '';
  const keysViews = new Set(['video_view_count', 'video_play_count', 'play_count', 'view_count', 'viewCount', 'playCount', 'clips_view_count']);
  function walk(x: any) {
    if (!x || typeof x !== 'object') return;
    // caption pode vir como string ou objeto { text }
    if (!foundCaption) {
      if (typeof x.caption === 'string' && x.caption) foundCaption = x.caption;
      else if (x.caption && typeof x.caption === 'object' && typeof x.caption.text === 'string' && x.caption.text) foundCaption = x.caption.text;
      else if (typeof x.title === 'string' && x.title) foundCaption = x.title;
      else if (typeof x.description === 'string' && x.description) foundCaption = x.description;
    }
    // GraphQL comum: edge_media_to_caption.edges[0].node.text
    if (!foundCaption && x.edge_media_to_caption && Array.isArray(x.edge_media_to_caption.edges) && x.edge_media_to_caption.edges.length) {
      const node = x.edge_media_to_caption.edges[0]?.node;
      if (node && typeof node.text === 'string' && node.text) foundCaption = node.text;
    }
    for (const k of Object.keys(x)) {
      const v = (x as any)[k];
      if (v && typeof v === 'object') walk(v);
      if (foundViews === null && keysViews.has(k)) {
        const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
        if (isFinite(n) && n > 1) foundViews = Math.round(n);
      }
      if (!foundCaption && (k === 'caption' || k === 'title' || k === 'description') && typeof v === 'string') {
        foundCaption = v;
      }
      if (!foundCaption && k === 'caption' && v && typeof v === 'object' && typeof v.text === 'string') {
        foundCaption = v.text;
      }
    }
  }
  walk(obj);
  return { viewCount: foundViews, cap: foundCaption };
}
