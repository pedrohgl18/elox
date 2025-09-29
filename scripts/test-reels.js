/* Testa scraping público de Reels do Instagram para URLs fornecidas. */

const urls = [
  'https://www.instagram.com/reel/DPH47tljk6D/',
  'https://www.instagram.com/reels/DPKUAQQjmQx/',
];

function parseShortcode(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts[0] === 'reel' || parts[0] === 'p' || parts[0] === 'reels' ? 1 : -1;
    if (idx === -1) return null;
    const code = parts[idx];
    return code || null;
  } catch {
    return null;
  }
}

async function fetchPublicHtml(targetUrl) {
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  const html = await res.text();
  if (!res.ok) throw new Error(`Instagram respondeu ${res.status}`);
  return html;
}

function extractCaptionFromHtml(html) {
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
  const cap = html.match(/"caption"\s*:\s*"([\s\S]*?)"/);
  if (cap && cap[1]) return cap[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
  return '';
}

function extractViewsFromHtml(html) {
  const pc = html.match(/"play_count"\s*:\s*(\d+)/);
  if (pc && pc[1]) return Number(pc[1]);
  const vv = html.match(/"video_view_count"\s*:\s*(\d+)/);
  if (vv && vv[1]) return Number(vv[1]);
  const vc = html.match(/"view_count"\s*:\s*(\d+)/);
  if (vc && vc[1]) return Number(vc[1]);
  return null;
}

function extractHashtagsAndMentions(text) {
  const hashtags = Array.from(new Set((text.match(/(^|\s)#([\p{L}0-9_]+)/gu) || []).map((m) => m.trim().replace(/^#/, '#'))));
  const mentions = Array.from(new Set((text.match(/(^|\s)@([A-Za-z0-9_.]+)/g) || []).map((m) => m.trim())));
  return { hashtags, mentions };
}

async function fetchReelPublicInsights(url) {
  const shortcode = parseShortcode(url);
  if (!shortcode) throw new Error('URL de Reel inválida. Use /reel/{código}');
  const html = await fetchPublicHtml(url);
  if (/login|Entrar no Instagram|faça login/i.test(html) && !/application\/ld\+json/i.test(html)) {
    throw new Error('Instagram bloqueou a visualização pública para este conteúdo.');
  }
  const caption = extractCaptionFromHtml(html);
  const { hashtags, mentions } = extractHashtagsAndMentions(caption || '');
  const views = extractViewsFromHtml(html);
  return { url, shortcode, views: Number.isFinite(views) ? views : null, hashtags, mentions };
}

(async () => {
  for (const url of urls) {
    process.stdout.write(`\n>>> Testando: ${url}\n`);
    try {
      const data = await fetchReelPublicInsights(url);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Erro ao coletar insights: ${e?.message || e}`);
    }
  }
})();
