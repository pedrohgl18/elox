// Coletor YouTube Data API v3 para insights públicos de vídeos
// Compatível com Netlify: defina YOUTUBE_API_KEY nas variáveis de ambiente

export type YoutubeInsights = {
  videoId: string;
  views: number | null;
  hashtags: string[];
  mentions: string[];
};

function extractVideoId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/+$/, '');
    // youtu.be/{id}
    if (host.includes('youtu.be')) {
      const id = path.split('/').filter(Boolean)[0];
      return id || null;
    }
    // youtube.com/shorts/{id}
    if (path.startsWith('/shorts/')) {
      const id = path.split('/').filter(Boolean)[1];
      return id || null;
    }
    // youtube.com/watch?v={id}
    if (path.startsWith('/watch')) {
      const v = u.searchParams.get('v');
      return v || null;
    }
    return null;
  } catch {
    return null;
  }
}

function extractTagsFromText(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

export async function fetchYoutubePublicInsights(url: string): Promise<YoutubeInsights | null> {
  const key = process.env.YOUTUBE_API_KEY as string | undefined;
  if (!key) return null;
  const id = extractVideoId(url);
  if (!id) throw new Error('Não foi possível extrair o ID do vídeo do YouTube.');
  const api = new URL('https://www.googleapis.com/youtube/v3/videos');
  api.searchParams.set('part', 'statistics,snippet');
  api.searchParams.set('id', id);
  api.searchParams.set('key', key);
  const resp = await fetch(api.toString(), { cache: 'no-store' });
  if (!resp.ok) {
    // tenta extrair motivo do erro
    let detail = '';
    try {
      const j = await resp.json();
      const reason = j?.error?.errors?.[0]?.reason || '';
      const message = j?.error?.message || '';
      detail = `${reason} ${message}`.trim();
    } catch {
      const body = await resp.text().catch(() => '');
      detail = body?.slice?.(0, 200) || '';
    }
    throw new Error(`YouTube API falhou: ${resp.status} ${detail}`);
  }
  const json = await resp.json().catch(() => null) as any;
  const item = Array.isArray(json?.items) && json.items.length ? json.items[0] : null;
  if (!item) return { videoId: id, views: null, hashtags: [], mentions: [] };
  const stats = item.statistics || {};
  const snippet = item.snippet || {};
  const views = typeof stats.viewCount === 'string' ? Number(stats.viewCount) : (typeof stats.viewCount === 'number' ? stats.viewCount : null);
  const text = [snippet.title, snippet.description].filter(Boolean).join('\n');
  const { hashtags, mentions } = extractTagsFromText(text);
  return { videoId: id, views: Number.isFinite(views as any) ? Math.round(views as number) : null, hashtags, mentions };
}

export function parseYoutubeId(url: string): string | null {
  return extractVideoId(url);
}
