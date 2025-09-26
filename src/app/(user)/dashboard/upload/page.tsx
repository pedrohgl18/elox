import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { SubmitVideoForm } from '@/components/user/SubmitVideoForm';
import { InstagramHashtagPicker } from '@/components/user/InstagramHashtagPicker';
import { Upload, Video, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Video as VideoType } from '@/lib/types';

export default async function UploadPage() {
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
  const recentVideos: VideoType[] = videos.slice(-5); // Últimos 5 vídeos

  return (
    <UserLayout username={user.username} email={user.email}>
      <div className="space-y-6">
        {/* Header da Página */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-700/20 to-slate-800/40">
            <Upload className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Enviar Vídeo</h1>
            <p className="text-slate-400">Envie seus vídeos e comece a ganhar dinheiro</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulário de Upload Principal */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold text-slate-100">Enviar Novo Vídeo</h2>
                <p className="text-sm text-slate-400">
                  Cole o link do seu vídeo das redes sociais suportadas
                </p>
              </CardHeader>
              <CardContent>
                <SubmitVideoForm />
              </CardContent>
            </Card>

            {/* Seção de seleção de posts por hashtag (Instagram) */}
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold text-slate-100">Selecionar Post do Instagram por Hashtag</h2>
                <p className="text-sm text-slate-400">
                  Conecte sua conta do Instagram no Dashboard e busque suas postagens com a hashtag da campanha para enviar direto.
                </p>
              </CardHeader>
              <CardContent>
                <InstagramHashtagPicker onPick={() => { /* toast de sucesso é global */ }} />
              </CardContent>
            </Card>

            {/* Dicas para Maximizar Ganhos */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-slate-100">Dicas para Maximizar seus Ganhos</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-200">Conteúdo Viral</h4>
                      <p className="text-sm text-slate-400">
                        Vídeos com mais engajamento (likes, comentários, compartilhamentos) têm maior potencial de ganho
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-200">Timing é Tudo</h4>
                      <p className="text-sm text-slate-400">
                        Envie vídeos que estão em tendência. Quanto mais cedo você enviar, maior a chance de aprovação
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-200">Diversifique as Redes</h4>
                      <p className="text-sm text-slate-400">
                        Envie vídeos de TikTok, Instagram e Kwai para maximizar suas oportunidades
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-200">Qualidade de Link</h4>
                      <p className="text-sm text-slate-400">
                        Certifique-se de que o link está correto e o vídeo está público
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Informações */}
          <div className="lg:col-span-1 space-y-6">
            {/* (Preview removido temporariamente) */}

            {/* Estatísticas Rápidas */}
            <Card>
              <CardHeader>
                <span className="font-semibold">Suas Estatísticas</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Enviados</span>
                    <span className="font-medium">{videos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Aprovados</span>
                    <span className="font-medium text-green-600">
                      {videos.filter((v: VideoType) => v.status === 'APPROVED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pendentes</span>
                    <span className="font-medium text-yellow-600">
                      {videos.filter((v: VideoType) => v.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxa de Aprovação</span>
                    <span className="font-medium">
                      {videos.length > 0 ? Math.round((videos.filter((v: VideoType) => v.status === 'APPROVED').length / videos.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vídeos Recentes */}
            {recentVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <span className="font-semibold">Últimos Envios</span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentVideos.map((video: VideoType) => (
                      <div key={video.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Video className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {video.socialMedia.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(video.submittedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          video.status === 'APPROVED' ? 'bg-green-500' :
                          video.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aviso Importante */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Importante</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Não envie o mesmo vídeo múltiplas vezes. Isso pode resultar em advertência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}