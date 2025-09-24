import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getToken } from 'next-auth/jwt';
import appConfig from '@/lib/config';

export async function middleware(request: NextRequest) {
  // Aplicar middleware apenas para rotas de admin, reduzindo latência no dashboard do usuário
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: appConfig.auth.secret });
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if ((token as any).role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
