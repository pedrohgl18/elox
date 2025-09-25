import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AdminApiKeysForm } from '@/components/admin/AdminApiKeysForm';

export default async function AdminConfigPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-100">Configurações</h1>
      <Card>
        <CardHeader>Integrações de API das Plataformas</CardHeader>
        <CardContent>
          <AdminApiKeysForm />
        </CardContent>
      </Card>
    </div>
  );
}
