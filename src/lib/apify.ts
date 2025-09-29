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

async function startActorRunAndGetItems(token: string, actor: string, wait: number, input: Record<string, any>): Promise<ApifyInstagramItem[] | null> {
  const startUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/runs?token=${encodeURIComponent(token)}&waitForFinish=${wait}`;
  const runRes = await fetch(startUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!runRes.ok) return null;
  const run = await runRes.json().catch(() => null) as any;
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
  if (!Array.isArray(items) || items.length === 0) return null;
  return items;
}

export async function runApifyInstagram(url: string, opts?: { waitForFinishSec?: number; actorId?: string }): Promise<{ views: number | null; hashtags: string[]; mentions: string[] } | null> {
  const token = env('APIFY_TOKEN');
  let actor = opts?.actorId || env('APIFY_ACTOR') || 'apify~instagram-scraper';
  // Normaliza actor: aceita "apify/instagram-scraper" e converte para "apify~instagram-scraper"
  if (actor.includes('/')) actor = actor.replace('/', '~');
  if (!token) return null; // sem token, não usa Apify

  const wait = Math.max(5, Math.min(60, opts?.waitForFinishSec ?? (Number(env('APIFY_WAIT_SEC')) || 25)));
  // Tenta diferentes formatos de input conforme o actor
  const inputs: Record<string, any>[] = [];
  const direct = { directUrls: [url], resultsLimit: 1 } as Record<string, any>;
  const start = { startUrls: [{ url }], resultsLimit: 1 } as Record<string, any>;
  if (actor.toLowerCase().includes('hpix')) {
    // Alguns atores baseados em Apify SDK costumam aceitar startUrls melhor
    inputs.push(start, direct);
  } else {
    inputs.push(direct, start);
  }

  let items: ApifyInstagramItem[] | null = null;
  for (const inp of inputs) {
    items = await startActorRunAndGetItems(token, actor, wait, inp);
    if (items && items.length) break;
  }
  if (!items || !items.length) return null;
  const item = items[0];
  const caption = extractCaptionFromItem(item);
  const views = extractViewsFromItem(item);
  const { hashtags, mentions } = extractTagsFromText(caption || '');
  return { views, hashtags, mentions };
}
