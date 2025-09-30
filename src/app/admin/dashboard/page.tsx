import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { VideoStatus } from '@/lib/types';
import { formatCurrencyBRL } from '@/lib/format';

export default async function AdminDashboard() {
  const session: any = await getServerSession(authOptions as any);

  if (!session?.user) {
    redirect(config.urls.login);
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole !== 'admin') {
    redirect(config.urls.userDashboard); // Redireciona usuário normal para seu dashboard
  }

  // Carrega dados para cards
  const [clipadores, videos, pagamentos] = await Promise.all([
    db.admin.listClipadores(),
    db.video.listForUser({ role: 'admin' } as any),
    db.payment.listForUser({ role: 'admin' } as any),
  ]);

  const ativos = (clipadores || []).filter((c: any) => c.isActive).length;
  const pendentes = (videos || []).filter((v: any) => v.status === VideoStatus.Pending).length;
  const viewsTotais = (videos || []).reduce((s: number, v: any) => s + (Number(v.views) || 0), 0);
  const youtubeVideos = (videos || []).filter((v: any) => v.socialMedia === 'youtube').length;

  // Total pago hoje (PROCESSED com processedAt = hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const totalPagoHojeNum = (pagamentos || [])
    .filter((p: any) => p.status === 'PROCESSED' && p.processedAt && (new Date(p.processedAt)) >= today && (new Date(p.processedAt)) < tomorrow)
    .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const totalPagoHoje = formatCurrencyBRL(totalPagoHojeNum);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container space-y-6 py-8">
        <h1 className="text-2xl font-bold">Admin - Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader>Clipadores Ativos</CardHeader>
            <CardContent>{ativos}</CardContent>
          </Card>
          <Card>
            <CardHeader>Total Pago Hoje</CardHeader>
            <CardContent>{totalPagoHoje}</CardContent>
          </Card>
          <Card>
            <CardHeader>Vídeos Pendentes</CardHeader>
            <CardContent>{pendentes}</CardContent>
          </Card>
          <Card>
            <CardHeader>Views Totais</CardHeader>
            <CardContent>{viewsTotais.toLocaleString('pt-BR')}</CardContent>
          </Card>
          <Card>
            <CardHeader>Vídeos YouTube</CardHeader>
            <CardContent>{youtubeVideos}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
