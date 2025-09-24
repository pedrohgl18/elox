import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyBRL } from '@/lib/format';
import { Eye, Users, Video as VideoIcon, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminHome() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  // KPIs simulados a partir do DB em memória
  const users = await db.admin.listClipadores();
  const videos = await db.video.listForUser({} as any); // admin lista todos
  const payments = await db.payment.listForUser({ role: 'admin' } as any);

  const activeUsers = users.filter(u => u.clipador?.isActive).length;
  const pendingVideos = videos.filter(v => v.status === 'PENDING').length;
  const processedPayments = payments.filter(p => p.status === 'PROCESSED');
  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const totalPaid = processedPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Clipadores Ativos</span>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{activeUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Vídeos Pendentes</span>
            <VideoIcon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pendingVideos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Total Pago</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-500">{formatCurrencyBRL(totalPaid)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Views Totais</span>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalViews.toLocaleString('pt-BR')}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>Distribuição por Rede Social</CardHeader>
          <CardContent>
            <BarChart
              labels={["TikTok", "Instagram", "Kwai"]}
              values={[
                videos.filter(v => v.socialMedia === 'tiktok').length,
                videos.filter(v => v.socialMedia === 'instagram').length,
                videos.filter(v => v.socialMedia === 'kwai').length,
              ]}
              title="Envios por Rede"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Pagamentos</CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Processados</span>
                <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                  <CheckCircle className="h-4 w-4" /> {processedPayments.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Falharam</span>
                <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                  <XCircle className="h-4 w-4" /> {failedPayments.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>Últimos Vídeos</CardHeader>
          <CardContent>
            {/* Lista simplificada */}
            <ul className="divide-y divide-slate-800">
              {videos.slice(0, 8).map(v => (
                <li key={v.id} className="py-3 flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-slate-100 font-medium">{v.socialMedia.toUpperCase()}</div>
                    <a href={v.url} target="_blank" rel="noreferrer" className="text-xs text-brand-400 underline break-all">{v.url}</a>
                  </div>
                  <StatusBadge label={v.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Clipadores Recentes</CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-800">
              {users.slice(0, 8).map(u => (
                <li key={u.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="text-slate-100 font-medium">{u.username}</div>
                    <div className="text-slate-400 text-xs">{u.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${u.clipador?.isActive ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                    {u.clipador?.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
