import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrencyBRL } from '@/lib/format';
import { Video, Payment } from '@/lib/types';
import { User, Mail, Calendar, Shield, Wallet, Settings, Save, Edit3, AlertTriangle } from 'lucide-react';

export default async function ProfilePage() {
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
  
  const clipador = user.clipador;
  if (!clipador) {
    redirect(config.urls.login);
  }
  
  const videos: Video[] = await db.video.listForUser(user);
  const payments: Payment[] = await db.payment.listForUser(user);
  
  // Estatísticas do perfil
  const totalVideos = videos.length;
  const approvedVideos = videos.filter((v: Video) => v.status === 'APPROVED').length;
  const totalViews = videos.reduce((acc: number, v: Video) => acc + v.views, 0);
  const totalEarnings = clipador.totalEarnings;
  const accountAge = Math.floor((Date.now() - clipador.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Meu Perfil</h1>
        <p className="text-slate-400 mt-1">Gerencie suas informações pessoais e configurações</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar do Perfil */}
        <div className="lg:col-span-1">
          {/* Card do Avatar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar username={user.username} size="lg" className="mx-auto mb-4 h-20 w-20 text-2xl" />
                <h2 className="text-xl font-semibold text-slate-100">{user.username}</h2>
                <p className="text-slate-400 text-sm">{user.email}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Membro há {accountAge} dias</span>
                </div>
                <Button className="mt-4 w-full" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status da Conta */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Status da Conta</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  clipador.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {clipador.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avisos</span>
                <span className={`flex items-center space-x-1 ${
                  clipador.warnings > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {clipador.warnings > 0 && <AlertTriangle className="h-4 w-4" />}
                  <span className="font-medium">{clipador.warnings}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ganhos Totais</span>
                <span className="font-medium text-green-600">
                  {formatCurrencyBRL(totalEarnings)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <span className="font-semibold">Estatísticas</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vídeos Enviados</span>
                <span className="font-medium">{totalVideos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vídeos Aprovados</span>
                <span className="font-medium text-green-600">{approvedVideos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de Views</span>
                <span className="font-medium">{totalViews.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa de Aprovação</span>
                <span className="font-medium">
                  {totalVideos > 0 ? Math.round((approvedVideos / totalVideos) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-slate-300" />
                  <span className="font-semibold text-slate-100">Informações Pessoais</span>
                </div>
                <Button size="sm" variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome de Usuário
                  </label>
                  <Input 
                    defaultValue={user.username}
                    disabled 
                    className="bg-slate-900 border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <Input 
                    defaultValue={user.email}
                    disabled 
                    className="bg-slate-900 border-slate-800 text-slate-200"
                    type="email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chave PIX (Para Pagamentos)
                </label>
                <Input 
                  defaultValue={clipador.pixKey || ''}
                  placeholder="Digite sua chave PIX para receber pagamentos"
                  className="w-full bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Cancelar</Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Pagamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-slate-300" />
                <span className="font-semibold text-slate-100">Configurações de Pagamento</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-900/10 border border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-300">
                      Como Funciona os Pagamentos
                    </h4>
                    <p className="text-sm text-blue-200/80 mt-1">
                      Os pagamentos são processados semanalmente via PIX. 
                      Certifique-se de que sua chave PIX esteja correta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valor Mínimo para Saque
                  </label>
                  <div className="text-lg font-semibold text-slate-100">
                    R$ 50,00
                  </div>
                  <p className="text-xs text-slate-500">
                    Valor mínimo para solicitar pagamento
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Próximo Pagamento
                  </label>
                  <div className="text-lg font-semibold text-slate-100">
                    Sexta-feira
                  </div>
                  <p className="text-xs text-slate-500">
                    Pagamentos são processados semanalmente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações da Conta */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-slate-300" />
                <span className="font-semibold text-slate-100">Configurações da Conta</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Notificações por Email</label>
                    <p className="text-xs text-slate-500">Receber atualizações sobre vídeos e pagamentos</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-brand-600 rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Relatórios Semanais</label>
                    <p className="text-xs text-slate-500">Resumo semanal do desempenho</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-brand-600 rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Avisos de Pagamento</label>
                    <p className="text-xs text-slate-500">Notificações sobre processamento de pagamentos</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-brand-600 rounded" defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button variant="outline" className="w-full text-red-400 border-red-500/40 hover:bg-red-500/10">
                  Desativar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}