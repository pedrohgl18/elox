export type ApifyInstagramItem = any;

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
  const runStatus = run?.data?.status || run?.status;
  const datasetId = run?.data?.defaultDatasetId || run?.data?.datasetId || run?.data?.defaultDatasetId || run?.data?.datasetId;
  if (!datasetId) return null;
  const itemsUrl = `https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true&format=json&limit=1`;
  let itemsRes = await fetch(itemsUrl);
  if (!itemsRes.ok) return null;
  let items = await itemsRes.json().catch(() => []) as ApifyInstagramItem[];
  if ((!Array.isArray(items) || items.length === 0)) {
    await new Promise((r) => setTimeout(r, 3000));
    itemsRes = await fetch(itemsUrl);
    if (!itemsRes.ok) return null;
    items = await itemsRes.json().catch(() => []) as ApifyInstagramItem[];
  }
  if (!Array.isArray(items) || items.length === 0) {
    console.error('[apify] dataset empty', { actor, runId, runStatus, datasetId });
    return null;
  }
  return items;
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
