import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.redirect(`${config.baseUrl}/auth/login`);

  const appId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${config.baseUrl}/api/social-accounts/oauth/instagram/callback`;
  // Permissões mínimas para ler páginas vinculadas e IG Business/Creator
  const scope = [
    'instagram_basic',
    'pages_show_list',
    // 'pages_read_engagement', // opcional: pode ajudar a ler campos da página
  ].join(',');

  if (!appId || !process.env.FACEBOOK_APP_SECRET && !process.env.INSTAGRAM_CLIENT_SECRET) {
    const url = new URL(`${config.baseUrl}/dashboard`);
    url.searchParams.set('oauth', 'instagram_misconfig');
    return NextResponse.redirect(url.toString());
  }

  const state = 'elox_' + Math.random().toString(36).slice(2);
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  return NextResponse.redirect(authUrl.toString());
}
