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

  const clientId = process.env.INSTAGRAM_CLIENT_ID!;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;
  const redirectUri = `${config.baseUrl}/api/social-accounts/oauth/instagram/callback`;

  try {
    // 1) Troca code -> short-lived token
    const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok) throw new Error(tokenJson.error_message || 'instagram access_token error');

    const shortToken = tokenJson.access_token as string;
    const userId = tokenJson.user_id as string;

    // 2) Troca short -> long-lived token
    const llUrl = new URL('https://graph.instagram.com/access_token');
    llUrl.searchParams.set('grant_type', 'ig_exchange_token');
    llUrl.searchParams.set('client_secret', clientSecret);
    llUrl.searchParams.set('access_token', shortToken);
    const llResp = await fetch(llUrl.toString());
    const llJson = await llResp.json();
    if (!llResp.ok) throw new Error(llJson.error?.message || 'instagram long-lived token error');
    const accessToken = llJson.access_token as string;
    const expiresIn = Number(llJson.expires_in || 60 * 60 * 24 * 60); // segundos
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 3) Busca perfil para obter username
    const meUrl = new URL('https://graph.instagram.com/me');
    meUrl.searchParams.set('fields', 'id,username');
    meUrl.searchParams.set('access_token', accessToken);
    const meResp = await fetch(meUrl.toString());
    const meJson = await meResp.json();
    if (!meResp.ok) throw new Error(meJson.error?.message || 'instagram profile error');
    const username = meJson.username as string;

    // 4) Upsert da conta social no banco
    await db.social.upsertOAuthAccount((session.user as any).id, {
      platform: 'instagram',
      providerAccountId: userId,
      username,
      accessToken,
      refreshToken: null as any,
      expiresAt,
      scope: 'user_profile,user_media',
    });

    return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_ok`);
  } catch (e: any) {
    console.error('Instagram OAuth callback error', e);
    return NextResponse.redirect(`${config.baseUrl}/dashboard?oauth=instagram_fail`);
  }
}
