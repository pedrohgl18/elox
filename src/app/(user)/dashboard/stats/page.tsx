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
import { BarChart3, Eye, Video, DollarSign, TrendingUp, Clock, Target } from 'lucide-react';
import { Video as VideoType, Payment, Competition } from '@/lib/types';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { SocialIcon } from '@/components/ui/SocialIcon';

type Search = { from?: string; to?: string; comp?: string };

export default async function StatsPage({ searchParams }: { searchParams?: Search }) {
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
  const competitions: Competition[] = await db.competition.list();

  // Filtros por data (submittedAt)
  const fromParam = searchParams?.from;
  const toParam = searchParams?.to;
  const compParam = searchParams?.comp; // competition filter: id | 'none' | undefined (todas)
  let fromDate: Date | null = null;
  let toDate: Date | null = null;
  if (fromParam) {
    const d = new Date(fromParam + 'T00:00:00');
    if (!isNaN(d.getTime())) fromDate = d;
  }
  if (toParam) {
    const d = new Date(toParam + 'T23:59:59');
    if (!isNaN(d.getTime())) toDate = d;
  }
  const filteredVideos = videos.filter((v) => {
    const ts = new Date(v.submittedAt).getTime();
    if (fromDate && ts < fromDate.getTime()) return false;
    if (toDate && ts > toDate.getTime()) return false;
    if (compParam === 'none') {
      if (v.competitionId) return false;
    } else if (compParam) {
      if (v.competitionId !== compParam) return false;
    }
    return true;
  });

  const totalEarnings = payments
    .filter((p: Payment) => p.status !== 'FAILED')
    .reduce((acc: number, p: Payment) => acc + p.amount, 0);
  // Últimas métricas do Supabase por URL
  const supa = getSupabaseServiceClient();
  const latestByUrl = new Map<string, { views: number | null; hashtags?: string[]; mentions?: string[]; collected_at?: string }>();
  if (supa && filteredVideos.length > 0) {
    const urls = filteredVideos.map((v) => v.url);
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

  const totalViews = filteredVideos.reduce((acc: number, v: VideoType) => {
    const m = latestByUrl.get(v.url);
    const views = typeof m?.views === 'number' ? m.views : v.views;
    return acc + (views || 0);
  }, 0);
  const approvedVideos = filteredVideos.filter((v: VideoType) => v.status === 'APPROVED').length;
  const pendingVideos = filteredVideos.filter((v: VideoType) => v.status === 'PENDING').length;
  const rejectedVideos = filteredVideos.filter((v: VideoType) => v.status === 'REJECTED').length;

  // Estatísticas por rede social
  const tiktokVideos = filteredVideos.filter((v: VideoType) => v.socialMedia === 'tiktok');
  const instagramVideos = filteredVideos.filter((v: VideoType) => v.socialMedia === 'instagram');
  const kwaiVideos = filteredVideos.filter((v: VideoType) => v.socialMedia === 'kwai');
  const youtubeVideos = filteredVideos.filter((v: VideoType) => v.socialMedia === 'youtube');

  const chartLabels = ['TikTok', 'Instagram', 'Kwai', 'YouTube'];
  const chartValues = [tiktokVideos.length, instagramVideos.length, kwaiVideos.length, youtubeVideos.length];

  // Estatísticas de performance
  const avgViewsPerVideo = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const approvalRate = videos.length > 0 ? Math.round((approvedVideos / videos.length) * 100) : 0;
  const avgEarningsPerVideo = approvedVideos > 0 ? totalEarnings / approvedVideos : 0;

  // Uploads por dia (dados reais)
  // Determina janela: filtros (from/to) ou últimos 14 dias por padrão
  let startWindow: Date;
  let endWindow: Date;
  if (fromDate || toDate) {
    startWindow = fromDate ? new Date(fromDate) : new Date(Math.min(...filteredVideos.map(v => new Date(v.submittedAt).getTime())) || Date.now());
    endWindow = toDate ? new Date(toDate) : new Date(Math.max(...filteredVideos.map(v => new Date(v.submittedAt).getTime())) || Date.now());
  } else {
    endWindow = new Date();
    startWindow = new Date(endWindow.getTime() - 13 * 24 * 60 * 60 * 1000);
  }
  // Normaliza para dias inteiros
  const dayMs = 24 * 60 * 60 * 1000;
  const startDay = new Date(startWindow.getFullYear(), startWindow.getMonth(), startWindow.getDate());
  const endDay = new Date(endWindow.getFullYear(), endWindow.getMonth(), endWindow.getDate());
  const days: string[] = [];
  const counts: number[] = [];
  for (let t = startDay.getTime(); t <= endDay.getTime(); t += dayMs) {
    const d = new Date(t);
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    days.push(label);
    counts.push(filteredVideos.filter(v => {
      const vd = new Date(v.submittedAt);
      return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth() && vd.getDate() === d.getDate();
    }).length);
  }

  // Resumo por competição (dados reais)
  const compById = new Map(competitions.map(c => [c.id, c.name] as const));
  type CompAgg = { name: string; videos: number; views: number; approved: number; pending: number; rejected: number };
  const byCompetition = new Map<string, CompAgg>();
  for (const v of filteredVideos) {
    const key = v.competitionId || 'none';
    const name = v.competitionId ? (compById.get(v.competitionId) || 'Competição') : 'Sem competição';
    const agg = byCompetition.get(key) || { name, videos: 0, views: 0, approved: 0, pending: 0, rejected: 0 };
    agg.videos += 1;
    const m = latestByUrl.get(v.url);
    const views = typeof m?.views === 'number' ? m.views : (v.views || 0);
    agg.views += views || 0;
    if (v.status === 'APPROVED') agg.approved += 1; else if (v.status === 'PENDING') agg.pending += 1; else if (v.status === 'REJECTED') agg.rejected += 1;
    byCompetition.set(key, agg);
  }

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header e filtros */}
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
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">De</label>
            <input type="date" name="from" defaultValue={fromParam || ''} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Até</label>
            <input type="date" name="to" defaultValue={toParam || ''} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Competição</label>
            <select name="comp" defaultValue={compParam || ''} className="border rounded px-2 py-1 text-sm min-w-[220px]">
              <option value="">Todas</option>
              <option value="none">Sem competição</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Aplicar</button>
          {(fromParam || toParam) && (
            <a href="/dashboard/stats" className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-sm">Limpar</a>
          )}
        </form>
      </div>

      {/* Métricas por Vídeo (destaque no topo) */}
      <Card className="mb-8 border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Métricas por Vídeo</h3>
            {(fromParam || toParam) && (
              <span className="text-xs text-gray-500">Período: {fromParam || 'início'} → {toParam || 'agora'}</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-2">Rede</th>
                  <th className="text-left py-2 px-2">URL</th>
                  <th className="text-right py-2 px-2">Views (última)</th>
                  <th className="text-left py-2 px-2">Hashtags</th>
                  <th className="text-left py-2 px-2">Menções</th>
                  <th className="text-left py-2 px-2">
                    Última coleta
                    <span className="ml-1 text-xs text-gray-500" title="Data/hora da última coleta de métricas deste vídeo efetuada pelo admin">(?)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {([...filteredVideos]
                  .sort((a, b) => {
                    const ma = latestByUrl.get(a.url);
                    const va = typeof ma?.views === 'number' ? ma.views : a.views || 0;
                    const mb = latestByUrl.get(b.url);
                    const vb = typeof mb?.views === 'number' ? mb.views : b.views || 0;
                    return vb - va; // desc
                  })
                ).map((v) => {
                  const m = latestByUrl.get(v.url);
                  const views = typeof m?.views === 'number' ? m.views : v.views;
                  return (
                    <tr key={v.id} className="border-b border-gray-100 align-top">
                      <td className="py-2 px-2 font-medium text-gray-700">
                        <span className="inline-flex items-center">
                          <SocialIcon platform={v.socialMedia as any} className="h-4 w-4 mr-2" />
                          <span className="uppercase text-xs text-gray-600">{v.socialMedia}</span>
                        </span>
                      </td>
                      <td className="py-2 px-2 max-w-[420px]">
                        <a href={v.url} className="text-blue-600 underline block truncate" title={v.url} target="_blank" rel="noreferrer">{v.url}</a>
                      </td>
                      <td className="py-2 px-2 text-right">{typeof views === 'number' ? views.toLocaleString() : '-'}</td>
                      <td className="py-2 px-2">
                        {(m?.hashtags || []).length ? (
                          <div className="flex flex-wrap gap-1">{(m?.hashtags || []).slice(0,5).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">{t}</span>)}</div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-2">
                        {(m?.mentions || []).length ? (
                          <div className="flex flex-wrap gap-1">{(m?.mentions || []).slice(0,5).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">{t}</span>)}</div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-2">{m?.collected_at ? new Date(m.collected_at).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredVideos.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">Sem vídeos para o período selecionado.</div>
            )}
          </div>
        </CardContent>
      </Card>

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
        {/* Uploads por dia (dados reais) */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Uploads por dia</h3>
          </CardHeader>
          <CardContent>
            <BarChart labels={days} values={counts} />
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

      {/* Resumo por competição (dados reais) */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold">Resumo por Competição</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Competição</th>
                  <th className="text-right py-2 px-2">Vídeos</th>
                  <th className="text-right py-2 px-2">Views (última)</th>
                  <th className="text-right py-2 px-2">Aprovados</th>
                  <th className="text-right py-2 px-2">Pendentes</th>
                  <th className="text-right py-2 px-2">Rejeitados</th>
                </tr>
              </thead>
              <tbody>
                {[...byCompetition.values()].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-medium">{row.name}</td>
                    <td className="py-2 px-2 text-right">{row.videos}</td>
                    <td className="py-2 px-2 text-right">{row.views.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{row.approved}</td>
                    <td className="py-2 px-2 text-right">{row.pending}</td>
                    <td className="py-2 px-2 text-right">{row.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {byCompetition.size === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">Nenhum vídeo neste período.</div>
            )}
          </div>
        </CardContent>
      </Card>

    </UserLayout>
  );
}