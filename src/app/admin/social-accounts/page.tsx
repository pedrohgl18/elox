import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function AdminSocialAccountsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-100">Contas Sociais</h1>
      <Card>
        <CardHeader>Funcionalidade desativada</CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            O gerenciamento de contas sociais foi removido do produto. O fluxo de envio usa apenas URLs públicas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
