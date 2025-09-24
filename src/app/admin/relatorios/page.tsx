import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function AdminReportsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
      <Card>
        <CardHeader>Em breve</CardHeader>
        <CardContent>Relatórios detalhados de performance, pagamentos e compliance.</CardContent>
      </Card>
    </div>
  );
}
