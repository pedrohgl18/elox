import React from 'react';
import { db } from '@/lib/database';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyBRL } from '@/lib/format';
import { Payment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPagamentosPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect('/auth/login');
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user || user.role !== 'admin') redirect('/');

  const payments: Payment[] = await db.payment.listForUser(user);
  const pending = payments.filter(p => p.status === 'PENDING');
  const processed = payments.filter(p => p.status === 'PROCESSED');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Pagamentos</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-200">Pendentes</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && <div className="text-sm text-slate-400">Nenhum pagamento pendente.</div>}
            {pending.map((p) => (
              <form key={p.id} action={async () => { 'use server'; await db.payment.markProcessed(p.id); }} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                <div className="text-sm">
                  <div className="text-slate-100">{formatCurrencyBRL(p.amount)} • {p.clipadorId}</div>
                  <div className="text-slate-400">solicitado em {new Date(p.requestedAt).toLocaleString('pt-BR')}</div>
                </div>
                <Button type="submit" size="sm">Marcar Processado</Button>
              </form>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-200">Processados</div>
          </CardHeader>
          <CardContent className="space-y-2">
            {processed.length === 0 && <div className="text-sm text-slate-400">Nenhum pagamento processado.</div>}
            {processed.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
                <div className="text-slate-100">{formatCurrencyBRL(p.amount)} • {p.clipadorId}</div>
                <div className="text-slate-400">{p.processedAt ? new Date(p.processedAt).toLocaleString('pt-BR') : '-'}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="font-semibold text-slate-200">Todos os Pagamentos</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
                <tr>
                  {['Clipador','Valor','Status','Solicitado','Processado','Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {payments.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-900">
                    <td className="px-4 py-2 text-slate-100">{p.clipadorId}</td>
                    <td className="px-4 py-2 font-medium text-green-400">{formatCurrencyBRL(p.amount)}</td>
                    <td className="px-4 py-2"><StatusBadge label={p.status} /></td>
                    <td className="px-4 py-2 text-slate-300">{new Date(p.requestedAt).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-2 text-slate-300">{p.processedAt ? new Date(p.processedAt).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {p.status !== 'PROCESSED' && (
                        <form action={async () => { 'use server'; await db.payment.markProcessed(p.id); }}>
                          <Button size="sm">Marcar Processado</Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}