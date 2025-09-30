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
import { Alert } from '@/components/ui/Alert';
import { Plus } from 'lucide-react';
import { headers } from 'next/headers';

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

  // Notificação simples via querystring (?notice=approved|rejected)
  const h = headers();
  const notice = h.get('x-next-url')?.includes('notice=approved') ? 'approved' : (h.get('x-next-url')?.includes('notice=rejected') ? 'rejected' : null);
  
  // Estatísticas removidas desta página (migradas para /dashboard/stats)

  // Tabela de histórico removida desta página

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

      {/* Notificação */}
      {notice && (
        <div className="mb-4">
          <Alert variant={notice === 'approved' ? 'success' : 'warning'}
            title={notice === 'approved' ? 'Vídeo aprovado' : 'Vídeo rejeitado'}
            description={notice === 'approved' ? 'Seu vídeo foi aprovado e começará a contar métricas.' : 'Seu vídeo foi rejeitado. Revise as diretrizes e tente novamente.'} />
        </div>
      )}

      {/* Estatísticas removidas desta página (ir para /dashboard/stats) */}

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

      {/* Histórico removido: acesse suas métricas e histórico em /dashboard/stats */}
    </UserLayout>
  );
}