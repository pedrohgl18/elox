import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';

export default async function AdminDashboard() {
  const session: any = await getServerSession(authOptions as any);

  if (!session?.user) {
    redirect(config.urls.login);
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole !== 'admin') {
    redirect(config.urls.userDashboard); // Redireciona usuário normal para seu dashboard
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container space-y-6 py-8">
        <h1 className="text-2xl font-bold">Admin - Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>Clipadores Ativos</CardHeader>
            <CardContent>0</CardContent>
          </Card>
          <Card>
            <CardHeader>Total Pago Hoje</CardHeader>
            <CardContent>R$ 0,00</CardContent>
          </Card>
          <Card>
            <CardHeader>Vídeos Pendentes</CardHeader>
            <CardContent>0</CardContent>
          </Card>
          <Card>
            <CardHeader>Views Totais</CardHeader>
            <CardContent>0</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
