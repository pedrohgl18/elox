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
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-100">Relatórios</h1>
      <Card>
        <CardHeader>Em breve</CardHeader>
        <CardContent className="text-slate-300">Relatórios detalhados de performance, pagamentos e compliance.</CardContent>
      </Card>
    </div>
  );
}
