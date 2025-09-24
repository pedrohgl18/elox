import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { SubmitVideoForm } from '@/components/user/SubmitVideoForm';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyBRL } from '@/lib/format';
import { Video } from '@/lib/types';
import { Plus, Video as VideoIcon, Eye, DollarSign } from 'lucide-react';

export default async function VideosPage() {
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
  
  const videos = await db.video.listForUser(user);
  
  // Estatísticas dos vídeos
  const totalVideos = videos.length;
  const approvedVideos = videos.filter(v => v.status === 'APPROVED').length;
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const totalEarnings = videos.reduce((acc, v) => acc + v.earnings, 0);

  // Colunas da tabela de vídeos
  const tableRows = videos.map((v) => ({
    url: (
      <a href={v.url} className="text-brand-400 underline text-sm" target="_blank" rel="noreferrer">
        Ver Vídeo
      </a>
    ),
    rede: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-200">
        {v.socialMedia.toUpperCase()}
      </span>
    ),
    views: (
      <div className="flex items-center space-x-1">
        <Eye className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{v.views.toLocaleString('pt-BR')}</span>
      </div>
    ),
    ganho: (
      <div className="flex items-center space-x-1 text-green-400 font-medium">
        <DollarSign className="h-4 w-4" />
        <span>{formatCurrencyBRL(v.earnings)}</span>
      </div>
    ),
    status: <StatusBadge label={v.status} />,
    enviado: new Date(v.submittedAt).toLocaleDateString('pt-BR'),
  }));

  const videoColumns = [
    { key: 'url', label: 'URL' },
    { key: 'rede', label: 'Rede Social' },
    { key: 'views', label: 'Views' },
    { key: 'ganho', label: 'Ganho' },
    { key: 'status', label: 'Status' },
    { key: 'enviado', label: 'Enviado em' },
  ];

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header da Página */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Meus Vídeos</h1>
          <p className="text-slate-400 mt-1">Gerencie seus vídeos enviados e acompanhe o desempenho</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Enviar Vídeo</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Total de Vídeos</span>
            <VideoIcon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
            <p className="text-xs text-slate-400">
              {approvedVideos} aprovados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Total de Views</span>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-slate-400">
              Média: {totalVideos > 0 ? Math.round(totalViews / totalVideos).toLocaleString('pt-BR') : 0} por vídeo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Ganhos Totais</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyBRL(totalEarnings)}</div>
            <p className="text-xs text-slate-400">
              Média: {formatCurrencyBRL(totalVideos > 0 ? totalEarnings / totalVideos : 0)} por vídeo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Taxa de Aprovação</span>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVideos > 0 ? Math.round((approvedVideos / totalVideos) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedVideos} de {totalVideos} vídeos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Envio Rápido */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-100">Envio Rápido</h3>
          <p className="text-sm text-slate-400">Envie um novo vídeo rapidamente</p>
        </CardHeader>
        <CardContent>
          <SubmitVideoForm />
        </CardContent>
      </Card>

      {/* Tabela de Vídeos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-100">Histórico de Vídeos</h3>
          <p className="text-sm text-slate-400">Todos os seus vídeos enviados e seu status</p>
        </CardHeader>
        <CardContent>
          {videos.length > 0 ? (
            <DataTable data={tableRows} columns={videoColumns} />
          ) : (
            <div className="text-center py-12">
              <VideoIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">Nenhum vídeo enviado ainda</h3>
              <p className="text-slate-400 mb-4">Comece enviando seu primeiro vídeo para começar a ganhar!</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Enviar Primeiro Vídeo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </UserLayout>
  );
}