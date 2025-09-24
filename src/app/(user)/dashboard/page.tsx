export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { DashboardTables } from '@/components/dashboard/DashboardTables';
import { SubmitVideoForm } from '@/components/user/SubmitVideoForm';
import { PaymentRequestForm } from '@/components/user/PaymentRequestForm';
import { formatCurrencyBRL } from '@/lib/format';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { Video, Payment } from '@/lib/types';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';

export default async function UserDashboard() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    redirect(config.urls.login);
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole === 'admin') {
    redirect(config.urls.adminDashboard); // Redireciona admin para seu dashboard
  }
  
  let user = await db.auth.getById((session.user as any).id as string);
  if (!user) {
    user = await db.auth.getByIdOrEmail((session.user as any).email as string);
  }
  if (!user) {
    console.error('Usuário não encontrado no banco:', session.user);
    redirect(config.urls.login);
  }
  
  const videos: Video[] = await db.video.listForUser(user);
  const payments: Payment[] = await db.payment.listForUser(user);

  const totalEarnings = payments
    .filter((p: Payment) => p.status !== 'FAILED')
    .reduce((acc: number, p: Payment) => acc + p.amount, 0);
  const monthEarnings = 0; // placeholder; calcular por mês quando houver datas/validações
  const totalViews = videos.reduce((acc: number, v: Video) => acc + v.views, 0);

  const labels = ['TikTok', 'Instagram', 'Kwai'];
  const values = [
    videos.filter((v: Video) => v.socialMedia === 'tiktok').length,
    videos.filter((v: Video) => v.socialMedia === 'instagram').length,
    videos.filter((v: Video) => v.socialMedia === 'kwai').length,
  ];

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>Ganhos Totais</CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {formatCurrencyBRL(totalEarnings)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Ganhos no Mês</CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {formatCurrencyBRL(monthEarnings)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Views Totais</CardHeader>
          <CardContent className="text-2xl font-bold text-purple-600">
            {totalViews.toLocaleString('pt-BR')}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Posição no Ranking</CardHeader>
          <CardContent className="text-2xl font-bold text-orange-600">
            #-
          </CardContent>
        </Card>
      </div>

      {/* Charts and Forms Section */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>Distribuição por Rede Social</CardHeader>
          <CardContent>
            <BarChart labels={labels} values={values} title="Vídeos Enviados" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Enviar Novo Vídeo</CardHeader>
          <CardContent>
            <SubmitVideoForm />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>Solicitar Pagamento</CardHeader>
        <CardContent>
          <PaymentRequestForm />
        </CardContent>
      </Card>

      {/* Data Tables */}
      <DashboardTables videos={videos} payments={payments} />
    </UserLayout>
  );
}
