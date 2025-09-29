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
  const caption = extractCaption(html);
  const views = extractViews(html);
  const { hashtags, mentions } = extractTags(caption);
  return { url, shortcode, views, hashtags, mentions };
}
