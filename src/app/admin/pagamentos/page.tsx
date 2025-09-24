import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyBRL } from '@/lib/format';
import { Payment } from '@/lib/types';

export default async function AdminPagamentosPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  const payments: Payment[] = await db.payment.listForUser({ role: 'admin' } as any);

  return (
      <Card>
        <CardHeader>Processar Pagamentos</CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
                <tr>
                  {['Clipador','Valor','Status','Solicitado','Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {payments.map((p: Payment) => (
                  <tr key={p.id} className="group hover:bg-slate-900">
                    <td className="px-4 py-2 text-slate-100">{p.clipadorId}</td>
                    <td className="px-4 py-2 font-medium text-green-400">{formatCurrencyBRL(p.amount)}</td>
                    <td className="px-4 py-2"><StatusBadge label={p.status} /></td>
                    <td className="px-4 py-2 text-slate-300">{new Date(p.requestedAt).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <form action={async () => { 'use server'; await db.payment.markProcessed(p.id); }}>
                        <Button size="sm">Marcar Processado</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
  );
}