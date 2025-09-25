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
import { Video, Payment, Competition } from '@/lib/types';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import Link from 'next/link';

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
  // Competições do usuário
  const enrolledComps: Competition[] = (await db.competition.listEnrolledForUser?.(user.id)) || [];
  const now = Date.now();
  const activeComps = enrolledComps.filter(c => now >= c.startDate.getTime() && now <= c.endDate.getTime());
  const nextActive = activeComps.sort((a,b) => a.endDate.getTime() - b.endDate.getTime())[0];

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

      {/* Destaque de Competições */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Suas Competições</h2>
          <Link href="/dashboard/competitions" className="text-sm text-brand-400 hover:text-brand-300">Ver todas</Link>
        </div>
        {nextActive ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-slate-100 font-semibold">{nextActive.name}</div>
                <div className="text-slate-400 text-sm">Ativa agora • termina em {nextActive.endDate.toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/competicoes/${nextActive.id}`} className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">Ver detalhes</Link>
                <Link href="/dashboard/upload" className="text-sm px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-400">Enviar para esta campanha</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-slate-300 text-sm">
            Você ainda não está inscrito em nenhuma campanha ativa. Explore novas campanhas na página de Competições.
          </div>
        )}
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
