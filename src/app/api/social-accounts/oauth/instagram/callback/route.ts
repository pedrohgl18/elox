import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.redirect(`${config.baseUrl}/auth/login`);

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (error) return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_error`);
  if (!code) return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_missing_code`);

  const appId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_CLIENT_ID!;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET!;
  const redirectUri = `${config.baseUrl}/api/social-accounts/oauth/instagram/callback`;

  try {
    // 1) Troca code -> access_token do Facebook Login (usuário)
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);
    const tokenResp = await fetch(tokenUrl.toString());
    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok) throw new Error(tokenJson.error?.message || 'facebook access_token error');
    const userAccessToken = tokenJson.access_token as string;

    // 2) Lista Páginas do usuário e encontra página com instagram_business_account
    const pagesResp = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${encodeURIComponent(userAccessToken)}`);
    const pagesJson = await pagesResp.json();
    if (!pagesResp.ok) throw new Error(pagesJson.error?.message || 'facebook pages error');
    const pages = (pagesJson.data || []).filter((p: any) => p.instagram_business_account?.id && p.access_token);
    if (!pages.length) throw new Error('Nenhuma Página com conta do Instagram vinculada foi encontrada. Converta sua conta para Business/Creator e vincule a uma Página do Facebook.');
    const page = pages[0];
    const pageAccessToken = page.access_token as string;
    const igUserId = page.instagram_business_account.id as string;

    // 3) Busca username do IG
    const igResp = await fetch(`https://graph.facebook.com/v18.0/${igUserId}?fields=username&access_token=${encodeURIComponent(pageAccessToken)}`);
    const igJson = await igResp.json();
    if (!igResp.ok) throw new Error(igJson.error?.message || 'instagram profile error');
    const username = igJson.username as string;

    // 4) Upsert da conta social no banco com IG user id e page token
    await db.social.upsertOAuthAccount((session.user as any).id, {
      platform: 'instagram',
      providerAccountId: igUserId,
      username,
      accessToken: pageAccessToken, // token de página para chamadas ao IG Graph
      refreshToken: null as any,
      expiresAt: null as any,
      scope: 'instagram_basic,pages_show_list',
    });

    return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_ok`);
  } catch (e: any) {
    console.error('Instagram OAuth callback error', e);
    return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_fail`);
  }
}
