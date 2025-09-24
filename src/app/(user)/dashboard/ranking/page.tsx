export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { formatCurrencyBRL } from '@/lib/format';
import { Trophy, Crown, Medal, Users } from 'lucide-react';

export default async function RankingPage() {
  const session: any = await getServerSession(authOptions as any);
  
  if (!session?.user) {
    redirect(config.urls.login);
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole === 'admin') {
    redirect(config.urls.adminDashboard);
  }
  
  let user = await db.auth.getById((session.user as any).id as string);
  if (!user) {
    user = await db.auth.getByIdOrEmail((session.user as any).email as string);
  }
  if (!user) {
    console.error('Usuário não encontrado no banco:', session.user);
    redirect(config.urls.login);
  }

  const userVideos = await db.video.listForUser(user);
  const userPayments = await db.payment.listForUser(user);
  const userEarnings = userPayments
    .filter((p) => p.status !== 'FAILED')
    .reduce((acc, p) => acc + p.amount, 0);
  const userViews = userVideos.reduce((acc, v) => acc + v.views, 0);

  // Mock data para o ranking (em um cenário real, isso viria do banco)
  const mockRanking = [
    { username: 'clipador_pro', totalEarnings: 2850, totalViews: 125000, approvedVideos: 45, totalVideos: 52 },
    { username: 'viral_master', totalEarnings: 2340, totalViews: 98000, approvedVideos: 38, totalVideos: 41 },
    { username: 'trend_hunter', totalEarnings: 1920, totalViews: 87000, approvedVideos: 35, totalVideos: 43 },
    { username: user.username, totalEarnings: userEarnings, totalViews: userViews, approvedVideos: userVideos.filter(v => v.status === 'APPROVED').length, totalVideos: userVideos.length },
    { username: 'content_king', totalEarnings: 1650, totalViews: 76000, approvedVideos: 32, totalVideos: 39 },
    { username: 'clip_wizard', totalEarnings: 1480, totalViews: 65000, approvedVideos: 28, totalVideos: 35 },
    { username: 'social_ninja', totalEarnings: 1320, totalViews: 58000, approvedVideos: 25, totalVideos: 31 }
  ];

  // Ordenar por ganhos totais e derivar dados
  const sortedByEarnings = [...mockRanking].sort((a, b) => b.totalEarnings - a.totalEarnings);
  const top3 = sortedByEarnings.slice(0, 3);
  const tableRows = sortedByEarnings.map((clipador, i) => ({
    rank: `#${i + 1}`,
    username: clipador.username,
    totalEarnings: formatCurrencyBRL(clipador.totalEarnings),
    totalViews: clipador.totalViews.toLocaleString(),
    videos: `${clipador.approvedVideos}/${clipador.totalVideos}`,
    approvalRate: clipador.totalVideos > 0 ? `${Math.round((clipador.approvedVideos / clipador.totalVideos) * 100)}%` : '0%',
  }));
  const userRankNumber = sortedByEarnings.findIndex(r => r.username === user.username) + 1;
  const userRank = userRankNumber > 0 ? `#${userRankNumber}` : '#-';

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-500/15 p-2 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Ranking</h1>
            <p className="text-slate-400">Veja os melhores clipadores da plataforma</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sua Posição */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Medal className="h-5 w-5 text-blue-300" />
              <span className="font-semibold text-slate-200">Sua Posição</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{userRank}</div>
              <p className="text-sm text-slate-400 mt-1">de {sortedByEarnings.length} clipadores</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Ganhos:</span>
                    <span className="font-medium text-slate-100">{formatCurrencyBRL(userEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Visualizações:</span>
                    <span className="font-medium text-slate-100">{userViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Vídeos:</span>
                    <span className="font-medium text-slate-100">{`${userVideos.filter(v => v.status === 'APPROVED').length}/${userVideos.length}`}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold text-slate-200">Top 3 Clipadores</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {top3.map((clipador, index) => (
                <div key={clipador.username} className="text-center p-4 bg-slate-900 rounded-lg">
                  <div className={`text-2xl mb-2 ${
                    index === 0 ? 'text-yellow-300' : 
                    index === 1 ? 'text-slate-400' : 
                    'text-amber-300'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="font-semibold text-slate-100">{clipador.username}</div>
                  <div className="text-sm text-slate-300">{formatCurrencyBRL(clipador.totalEarnings)}</div>
                  <div className="text-xs text-slate-400">
                    {clipador.totalViews.toLocaleString()} views • {clipador.approvedVideos} vídeos
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Completo */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="font-semibold text-slate-200">Ranking Completo</span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tableRows}
            columns={[
              { key: 'rank', label: 'Posição' },
              { key: 'username', label: 'Clipador' },
              { key: 'totalEarnings', label: 'Ganhos Totais' },
              { key: 'totalViews', label: 'Visualizações' },
              { key: 'videos', label: 'Vídeos Aprovados' },
              { key: 'approvalRate', label: 'Taxa Aprovação' },
            ]}
          />
        </CardContent>
      </Card>
    </UserLayout>
  );
}