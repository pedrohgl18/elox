import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database';

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const list = await db.payment.listForUser(user);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'clipador') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { amount?: number } | null;
  if (!body?.amount || body.amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  const minAmount = 5; // valor mínimo simbólico em BRL
  if (body.amount < minAmount) return NextResponse.json({ error: `Valor mínimo para saque é R$ ${minAmount}.` }, { status: 400 });
  const summary = await db.finance.getUserEarningsSummary(user.id);
  if (body.amount > summary.available) {
    return NextResponse.json({ error: 'Valor solicitado excede seu saldo disponível.' }, { status: 400 });
  }
  const p = await db.payment.request(user, body.amount);
  return NextResponse.json(p, { status: 201 });
}
