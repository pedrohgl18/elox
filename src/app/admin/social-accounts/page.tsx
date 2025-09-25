import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AdminSocialAccountsTable } from '@/components/dashboard/DashboardTables';

export default async function AdminSocialAccountsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contas Sociais dos Usuários</h1>
      <Card>
        <CardHeader>Revisar / Validar / Revogar</CardHeader>
        <CardContent>
          <AdminSocialAccountsTable />
        </CardContent>
      </Card>
    </div>
  );
}
