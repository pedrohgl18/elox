import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  const users = db.users;
  return NextResponse.json({
    users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    message: 'Debug: dados disponíveis'
  });
}