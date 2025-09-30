import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { formatCurrencyBRL } from '@/lib/format';
import { BarChart } from '@/components/charts/BarChart';
import { BarChart3, Calendar, Eye, Video, DollarSign, TrendingUp, Clock, Target } from 'lucide-react';
import { Video as VideoType, Payment } from '@/lib/types';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export default async function StatsPage() {
  const session: any = await getServerSession(authOptions as any);
  
  if (!session?.user) {
    redirect(config.urls.login);
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole === 'admin') {
    redirect(config.urls.adminDashboard);
  }
  
  const user = await db.auth.getById((session.user as any).id as string);
  if (!user) {
    console.error('Usuário não encontrado no banco:', session.user);
    redirect(config.urls.login);
  }

  const videos: VideoType[] = await db.video.listForUser(user);
  const payments: Payment[] = await db.payment.listForUser(user);

  const totalEarnings = payments
    .filter((p: Payment) => p.status !== 'FAILED')
    .reduce((acc: number, p: Payment) => acc + p.amount, 0);
  // Últimas métricas do Supabase por URL
  const supa = getSupabaseServiceClient();
  const latestByUrl = new Map<string, { views: number | null; hashtags?: string[]; mentions?: string[]; collected_at?: string }>();
  if (supa && videos.length > 0) {
    const urls = videos.map((v) => v.url);
    const { data: metrics } = await supa
      .from('video_metrics')
      .select('url,views,hashtags,mentions,collected_at')
      .in('url', urls)
      .order('collected_at', { ascending: false });
    if (Array.isArray(metrics)) {
      for (const m of metrics as any[]) {
        if (!latestByUrl.has(m.url)) latestByUrl.set(m.url, { views: m.views ?? null, hashtags: m.hashtags || [], mentions: m.mentions || [], collected_at: m.collected_at });
      }
    }
  }

  const totalViews = videos.reduce((acc: number, v: VideoType) => {
    const m = latestByUrl.get(v.url);
    const views = typeof m?.views === 'number' ? m.views : v.views;
    return acc + (views || 0);
  }, 0);
  const approvedVideos = videos.filter((v: VideoType) => v.status === 'APPROVED').length;
  const pendingVideos = videos.filter((v: VideoType) => v.status === 'PENDING').length;
  const rejectedVideos = videos.filter((v: VideoType) => v.status === 'REJECTED').length;

  // Estatísticas por rede social
  const tiktokVideos = videos.filter((v: VideoType) => v.socialMedia === 'tiktok');
  const instagramVideos = videos.filter((v: VideoType) => v.socialMedia === 'instagram');
  const kwaiVideos = videos.filter((v: VideoType) => v.socialMedia === 'kwai');
  const youtubeVideos = videos.filter((v: VideoType) => v.socialMedia === 'youtube');

  const chartLabels = ['TikTok', 'Instagram', 'Kwai', 'YouTube'];
  const chartValues = [tiktokVideos.length, instagramVideos.length, kwaiVideos.length, youtubeVideos.length];

  // Estatísticas de performance
  const avgViewsPerVideo = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const approvalRate = videos.length > 0 ? Math.round((approvedVideos / videos.length) * 100) : 0;
  const avgEarningsPerVideo = approvedVideos > 0 ? totalEarnings / approvedVideos : 0;

  // Mock de dados históricos (7 dias)
  const mockDailyStats = [
    { day: 'Dom', views: 2500, earnings: 12.50 },
    { day: 'Seg', views: 3200, earnings: 16.00 },
    { day: 'Ter', views: 2800, earnings: 14.00 },
    { day: 'Qua', views: 3800, earnings: 19.00 },
    { day: 'Qui', views: 4200, earnings: 21.00 },
    { day: 'Sex', views: 5100, earnings: 25.50 },
    { day: 'Sab', views: 4600, earnings: 23.00 }
  ];

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
            <p className="text-gray-600">Análise detalhada do seu desempenho</p>
          </div>
        </div>
      </div>

      {/* KPIs Resumo */}
      <div className="grid gap-6 mb-8 lg:grid-cols-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganhos Totais</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrencyBRL(totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Views</p>
                <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vídeos Aprovados</p>
                <p className="text-2xl font-bold text-purple-600">{approvedVideos}</p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-orange-600">{approvalRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Distribuição por Rede Social */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Distribuição por Rede Social</h3>
          </CardHeader>
          <CardContent>
            <BarChart labels={chartLabels} values={chartValues} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>TikTok:</span>
                <span className="font-medium">{tiktokVideos.length} vídeos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Instagram:</span>
                <span className="font-medium">{instagramVideos.length} vídeos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kwai:</span>
                <span className="font-medium">{kwaiVideos.length} vídeos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>YouTube:</span>
                <span className="font-medium">{youtubeVideos.length} vídeos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Vídeos */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Status dos Vídeos</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-slate-200">Aprovados</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{approvedVideos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-slate-200">Pendentes</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{pendingVideos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-slate-200">Rejeitados</span>
                </div>
                <span className="text-2xl font-bold text-red-400">{rejectedVideos}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid gap-8 lg:grid-cols-3 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Média de Views</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{avgViewsPerVideo.toLocaleString()}</div>
              <p className="text-sm text-gray-600">views por vídeo</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Média de Ganhos</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{formatCurrencyBRL(avgEarningsPerVideo)}</div>
              <p className="text-sm text-gray-600">por vídeo aprovado</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Atividade</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{videos.length}</div>
              <p className="text-sm text-gray-600">vídeos enviados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Semanal (Mock) */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-semibold">Performance dos Últimos 7 Dias</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Dia</th>
                  <th className="text-right py-2">Views</th>
                  <th className="text-right py-2">Ganhos</th>
                </tr>
              </thead>
              <tbody>
                {mockDailyStats.map((stat, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{stat.day}</td>
                    <td className="text-right py-2">{stat.views.toLocaleString()}</td>
                    <td className="text-right py-2 text-green-600">{formatCurrencyBRL(stat.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Vídeo (última coleta) */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold">Métricas por Vídeo (última coleta)</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Rede</th>
                  <th className="text-left py-2 px-2">URL</th>
                  <th className="text-right py-2 px-2">Views</th>
                  <th className="text-left py-2 px-2">Hashtags</th>
                  <th className="text-left py-2 px-2">Menções</th>
                  <th className="text-left py-2 px-2">
                    Última coleta
                    <span className="ml-1 text-xs text-gray-500" title="Data/hora da última coleta de métricas deste vídeo efetuada pelo admin">(?)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => {
                  const m = latestByUrl.get(v.url);
                  const views = typeof m?.views === 'number' ? m.views : v.views;
                  return (
                    <tr key={v.id} className="border-b border-gray-100 align-top">
                      <td className="py-2 px-2 font-medium uppercase text-gray-700">{v.socialMedia}</td>
                      <td className="py-2 px-2 max-w-[340px]">
                        <a href={v.url} className="text-brand-600 underline break-all" target="_blank" rel="noreferrer">{v.url}</a>
                      </td>
                      <td className="py-2 px-2 text-right">{typeof views === 'number' ? views.toLocaleString() : '-'}</td>
                      <td className="py-2 px-2">
                        {(m?.hashtags || []).length ? (
                          <div className="flex flex-wrap gap-1">{(m?.hashtags || []).slice(0,5).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>)}</div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-2">
                        {(m?.mentions || []).length ? (
                          <div className="flex flex-wrap gap-1">{(m?.mentions || []).slice(0,5).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>)}</div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-2">{m?.collected_at ? new Date(m.collected_at).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {videos.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">Você ainda não enviou vídeos.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </UserLayout>
  );
}