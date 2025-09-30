export type ApifyInstagramItem = any;
export type ApifyTiktokItem = any;

function env(k: string): string | undefined {
  return process.env[k];
}

function extractTagsFromText(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

function extractViewsFromItem(item: ApifyInstagramItem): number | null {
  const candidates = [
    item?.videoViewCount,
    item?.playCount,
    item?.viewCount,
    item?.views,
    item?.video_view_count,
    item?.clips_view_count,
    item?.plays,
    item?.videoPlayCount,
    item?.reels_play_count,
    item?.reelsPlayCount,
  ];
  for (const v of candidates) {
    const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
    if (isFinite(n) && n > 1) return Math.round(n);
  }
  return null;
}

function extractCaptionFromItem(item: ApifyInstagramItem): string {
  if (typeof item?.caption === 'string') return item.caption;
  if (item?.edge_media_to_caption?.edges?.length) return item.edge_media_to_caption.edges[0]?.node?.text || '';
  if (typeof item?.title === 'string') return item.title;
  if (typeof item?.description === 'string') return item.description;
  return '';
}

function normalizeInstagramUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.hostname.includes('instagram.com')) {
      // Normaliza /reels/{code}/ para /reel/{code}/ e garante barra no final
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'reels' || parts[0] === 'reel' || parts[0] === 'p')) {
        const kind = parts[0] === 'reels' ? 'reel' : parts[0];
        const code = parts[1];
        u.pathname = `/${kind}/${code}/`;
      }
      if (!u.pathname.endsWith('/')) u.pathname += '/';
      return u.toString();
    }
  } catch {}
  return raw;
}

async function startActorRunAndGetItems(token: string, actor: string, wait: number, input: Record<string, any>): Promise<ApifyInstagramItem[] | null> {
  const startUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/runs?token=${encodeURIComponent(token)}&waitForFinish=${wait}`;
  const runRes = await fetch(startUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!runRes.ok) {
    const txt = await runRes.text().catch(() => '');
    console.error('[apify] run start failed', { actor, status: runRes.status, body: txt?.slice?.(0, 300) });
    return null;
  }
  const run = await runRes.json().catch(() => null) as any;
  const runId = run?.data?.id || run?.data?.id?.toString?.();
  const datasetId = run?.data?.defaultDatasetId || run?.data?.datasetId;
  if (!datasetId) return null;
  const itemsUrl = `https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true&format=json&limit=10`;
  const statusUrl = runId ? `https://api.apify.com/v2/actor-runs/${encodeURIComponent(runId)}` : null;

  // Poll dataset for items with backoff up to ~wait seconds (min 5 attempts)
  const intervalMs = 3000;
  const attempts = Math.max(5, Math.ceil(wait / 3) + 3);
  for (let i = 0; i < attempts; i++) {
    try {
      const itemsRes = await fetch(itemsUrl);
      if (itemsRes.ok) {
        const items = await itemsRes.json().catch(() => []) as ApifyInstagramItem[];
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {}
    // Optionally inspect run status for debugging
    if (statusUrl && (i % 2 === 1)) {
      try {
        const st = await fetch(statusUrl);
        const sj = await st.json().catch(() => null) as any;
        const s = sj?.data?.status || sj?.status;
        if (s === 'SUCCEEDED' || s === 'SUCCEED') {
          // if succeeded but still empty, keep one more fetch
        } else if (s === 'FAILED' || s === 'ABORTED' || s === 'TIMED_OUT') {
          console.error('[apify] run ended without data', { actor, runId, status: s });
          break;
        }
      } catch {}
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error('[apify] dataset empty after polling', { actor, runId, datasetId });
  return null;
}

export async function runApifyInstagram(url: string, opts?: { waitForFinishSec?: number; actorId?: string }): Promise<{ views: number | null; hashtags: string[]; mentions: string[] } | null> {
  const token = env('APIFY_TOKEN');
  let actor = opts?.actorId || env('APIFY_ACTOR') || 'apify~instagram-scraper';
  // Normaliza actor: aceita "apify/instagram-scraper" e converte para "apify~instagram-scraper"
  if (actor.includes('/')) actor = actor.replace('/', '~');
  if (!token) return null; // sem token, não usa Apify

  const wait = Math.max(5, Math.min(60, opts?.waitForFinishSec ?? (Number(env('APIFY_WAIT_SEC')) || 25)));
  const normalizedUrl = normalizeInstagramUrl(url);
  // Tentar com ator preferido e depois ator alternativo
  const preferred = actor;
  const alternate = preferred.toLowerCase().includes('hpix') ? 'apify~instagram-scraper' : 'hpix~ig-reels-scraper';
  const actorsToTry = [preferred, alternate];

  const baseInputs: Record<string, any>[] = [
    { directUrls: [normalizedUrl] },
    { startUrls: [{ url: normalizedUrl }] },
    { urls: [normalizedUrl] },
    { url: normalizedUrl },
    { reelsUrls: [normalizedUrl] },
    { reelUrls: [normalizedUrl] },
  ];
  const variants: ((b: Record<string, any>) => Record<string, any>)[] = [
    (b) => ({ ...b }),
    (b) => ({ ...b, resultsLimit: 1 }),
    (b) => ({ ...b, maxItems: 1 }),
  ];

  let items: ApifyInstagramItem[] | null = null;
  for (const act of actorsToTry) {
    for (const b of baseInputs) {
      for (const v of variants) {
        const input = v(b);
        items = await startActorRunAndGetItems(token, act, wait, input);
        if (items && items.length) {
          actor = act; // atualiza actor efetivo
          break;
        }
      }
      if (items && items.length) break;
    }
    if (items && items.length) break;
  }
  if (!items || !items.length) return null;
  const item = items[0];
  const caption = extractCaptionFromItem(item);
  const views = extractViewsFromItem(item);
  const { hashtags, mentions } = extractTagsFromText(caption || '');
  return { views, hashtags, mentions };
}

// --- TikTok ---
function normalizeTiktokUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (!u.hostname.includes('tiktok.com')) return raw;
    // Normaliza /@user/video/12345 formato
    const parts = u.pathname.split('/').filter(Boolean);
    const vidIdx = parts.findIndex((p) => p === 'video');
    if (vidIdx > 0 && parts[vidIdx + 1]) {
      const user = parts[vidIdx - 1]?.startsWith('@') ? parts[vidIdx - 1] : parts[vidIdx - 1] ? `@${parts[vidIdx - 1]}` : '@user';
      const id = parts[vidIdx + 1];
      u.pathname = `/${user}/video/${id}`;
    }
    if (!u.pathname.endsWith('/')) u.pathname += '/';
    return u.toString();
  } catch { return raw; }
}

export async function runApifyTiktok(url: string, opts?: { waitForFinishSec?: number; actorId?: string }): Promise<{ views: number | null; hashtags: string[]; mentions: string[] } | null> {
  const token = env('APIFY_TOKEN');
  let actor = opts?.actorId || env('APIFY_ACTOR_TIKTOK') || 'clockworks~tiktok-scraper';
  if (actor.includes('/')) actor = actor.replace('/', '~');
  if (!token) return null;
  // TikTok geralmente demora mais; porém Netlify Functions têm timeout curto.
  // Limitamos o wait a no máximo 10s (padrão 8) para evitar timeouts do servidor.
  const wait = Math.max(5, Math.min(10, opts?.waitForFinishSec ?? (Number(env('APIFY_WAIT_SEC')) || 8)));
  const normalizedUrl = normalizeTiktokUrl(url);
  const rawUrl = url;
  const isVideoActor = actor.toLowerCase().includes('video-scraper');
  const baseInputs: Record<string, any>[] = isVideoActor
    ? [
        { postURLs: [normalizedUrl] },
        { postURLs: [rawUrl] },
        { postUrls: [normalizedUrl] },
        { postUrls: [rawUrl] },
        { startUrls: [{ url: normalizedUrl }] },
        { startUrls: [{ url: rawUrl }] },
        { directUrls: [normalizedUrl] },
        { directUrls: [rawUrl] },
        { urls: [normalizedUrl] },
        { urls: [rawUrl] },
        { url: normalizedUrl },
        { url: rawUrl },
      ]
    : [
        { videoUrls: [normalizedUrl] },
        { videoUrls: [rawUrl] },
        { videoURLs: [normalizedUrl] },
        { videoURLs: [rawUrl] },
        { postURLs: [normalizedUrl] },
        { postURLs: [rawUrl] },
        { postUrls: [normalizedUrl] },
        { postUrls: [rawUrl] },
        { startUrls: [{ url: normalizedUrl }] },
        { startUrls: [{ url: rawUrl }] },
        { directUrls: [normalizedUrl] },
        { directUrls: [rawUrl] },
        { urls: [normalizedUrl] },
        { urls: [rawUrl] },
        { url: normalizedUrl },
        { url: rawUrl },
        { profiles: [], hashtags: [], videoUrls: [normalizedUrl] },
      ];
  const variants: ((b: Record<string, any>) => Record<string, any>)[] = [
    (b) => ({ ...b }),
    (b) => ({ ...b, resultsLimit: 1 }),
    (b) => ({ ...b, maxItems: 1 }),
    (b) => ({ ...b, resultsPerPage: 1 }),
  ];
  let items: ApifyTiktokItem[] | null = null;
  for (const b of baseInputs) {
    for (const v of variants) {
      const input = v(b);
      items = await startActorRunAndGetItems(token, actor, wait, input);
      if (items && items.length) break;
    }
    if (items && items.length) break;
  }
  if (!items || !items.length) return null;
  // Alguns atores retornam itens aninhados (item/data/video) ou arrays internas (items/videos)
  const flat: any[] = [];
  for (const it of items) {
    if (!it) continue;
    flat.push(it);
    if (it.item) flat.push(it.item);
    if (it.data) flat.push(it.data);
    if (it.video) flat.push(it.video);
    if (Array.isArray((it as any).items)) flat.push(...(it as any).items);
    if (Array.isArray((it as any).videos)) flat.push(...(it as any).videos);
  }
  const pick = (arr: any[]) => arr.find((p) => {
    const cand = [p?.stats?.playCount, p?.playCount, p?.videoViewCount, p?.views, p?.play_count, p?.stats?.play_count];
    const n = cand.map((x) => (typeof x === 'string' ? Number(x) : (typeof x === 'number' ? x : NaN))).find((x) => isFinite(x) && x > 1);
    if (isFinite(Number(n))) return true;
    const wv = p?.webVideoUrl || p?.web_video_url || p?.url;
    return typeof wv === 'string' && /tiktok\.com\/@.+\/video\//.test(wv);
  }) || arr[0];
  const item = pick(flat.length ? flat : items);
  // TikTok campos típicos: stats.playCount, diggCount, shareCount, commentCount; desc/text/title como legenda
  const caption = item?.desc || item?.text || item?.title || '';
  const { hashtags, mentions } = extractTagsFromText(caption);
  const views = (() => {
    const cand = [item?.stats?.playCount, item?.playCount, item?.videoViewCount, item?.views, item?.play_count, item?.stats?.play_count];
    for (const v of cand) {
      const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
      if (isFinite(n) && n > 1) return Math.round(n);
    }
    return null;
  })();
  return { views, hashtags, mentions };
}
