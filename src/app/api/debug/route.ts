import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Esta rota é apenas para inspeção rápida em desenvolvimento.
// No ambiente Supabase o adaptador não expõe db.users diretamente,
// então precisamos tolerar undefined e não provocar erro em build/render.
export async function GET() {
  // Se estivermos no InMemoryDB, há a propriedade users (array); no supabaseAdapter não.
  const rawUsers = (db && Array.isArray((db as any).users)) ? (db as any).users as any[] : [];
  const users = rawUsers.map(u => ({ id: u.id, email: u.email, role: u.role }));

  return NextResponse.json({
    ok: true,
    usersCount: users.length,
    users,
    adapter: db?.video && db?.competition ? 'dynamic' : 'unknown',
    message: 'Debug: rota operacional'
  });
}