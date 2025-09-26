import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.redirect(`${config.baseUrl}/auth/login`);

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${config.baseUrl}/api/social-accounts/oauth/instagram/callback`;
  const scope = 'user_profile,user_media';
  const state = 'elox_' + Math.random().toString(36).slice(2);
  const authUrl = new URL('https://api.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId || '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  return NextResponse.redirect(authUrl.toString());
}
