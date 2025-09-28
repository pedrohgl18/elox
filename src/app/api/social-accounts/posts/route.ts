import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

// Lista posts recentes da conta conectada filtrando por hashtag (por plataforma)
// Query params: platform=tiktok|instagram|kwai|youtube&hashtag=%23musica67
export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = (searchParams.get('platform') || '').toLowerCase();
  const hashtag = (searchParams.get('hashtag') || '').trim();
  if (!platform || !hashtag) return NextResponse.json({ error: 'Missing platform or hashtag' }, { status: 400 });

  // Busca conta conectada e token
  const accounts = await db.social.listForUser(user.id);
  const account = accounts.find((a: any) => a.platform === platform);
  if (!account) return NextResponse.json({ error: 'No connected account for this platform' }, { status: 404 });

  try {
  if (platform === 'youtube') {
      // Busca tokens do usuário para chamada server-side
      const secrets = await (db.social.getAccountSecrets?.(user.id, 'youtube'));
      if (!secrets?.accessToken) {
        return NextResponse.json({ error: 'Conta YouTube sem token. Refaça a conexão.' }, { status: 400 });
      }
      const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('forMine', 'true');
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', '25');
      url.searchParams.set('q', `#${tag}`);
      const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${secrets.accessToken}` },
      });
      if (!resp.ok) {
        const err = await resp.text();
        return NextResponse.json({ error: `YouTube API error: ${resp.status} ${err}` }, { status: 502 });
      }
      const json = await resp.json();
      const items = (json.items || []).map((it: any) => ({
        id: it.id?.videoId,
        title: it.snippet?.title,
        description: it.snippet?.description,
        publishedAt: it.snippet?.publishedAt,
        thumbnail: it.snippet?.thumbnails?.default?.url,
        url: it.id?.videoId ? `https://www.youtube.com/watch?v=${it.id.videoId}` : undefined,
      }));
      return NextResponse.json({ platform, items });
    }
    if (platform === 'instagram') {
      const secrets = await (db.social.getAccountSecrets?.(user.id, 'instagram'));
      if (!secrets?.accessToken) return NextResponse.json({ error: 'Conta Instagram sem token. Conecte novamente.' }, { status: 400 });
      if (!secrets?.providerAccountId) return NextResponse.json({ error: 'Conta Instagram sem IG User ID. Refaça a conexão.' }, { status: 400 });

      // Instagram Graph API via Facebook: /{ig-user-id}/media com token de Página
      const igUserId = secrets.providerAccountId;
      const mediaUrl = new URL(`https://graph.facebook.com/v18.0/${igUserId}/media`);
      mediaUrl.searchParams.set('fields', 'id,caption,permalink,media_type,media_url,thumbnail_url,timestamp');
      mediaUrl.searchParams.set('access_token', secrets.accessToken);
      const mResp = await fetch(mediaUrl.toString());
      const mJson = await mResp.json();
      if (!mResp.ok) return NextResponse.json({ error: mJson.error?.message || 'instagram media error' }, { status: 502 });
      const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
      const items = (mJson.data || []).filter((it: any) => (it.caption || '').includes(tag));
      const mapped = items.map((it: any) => ({
        id: it.id,
        title: it.caption?.slice(0, 80) || it.id,
        caption: it.caption,
        url: it.permalink,
        mediaType: it.media_type,
        mediaUrl: it.media_url,
        thumbnailUrl: it.thumbnail_url,
        publishedAt: it.timestamp,
      }));
      return NextResponse.json({ platform, items: mapped });
    }
    // Outros provedores exigem integrações específicas (TikTok, Instagram Graph, Kwai)
    return NextResponse.json({ platform, items: [], note: 'Provedor ainda não implementado. Verifique as credenciais e o escopo necessário.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
