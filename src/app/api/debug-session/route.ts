import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  
  return NextResponse.json({
    session: session ? {
      user: session.user,
      expires: session.expires
    } : null,
    users: db.users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    message: 'Debug: sessão e dados disponíveis'
  });
}