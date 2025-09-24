import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';

export default async function TestPage() {
  const session: any = await getServerSession(authOptions as any);
  
  if (!session?.user) {
    redirect(config.urls.login);
  }

  return (
    <UserLayout username={session.user.username || 'Usuário'} email={session.user.email || 'email@test.com'}>
        <>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold">Teste de Navegação</h1>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>✅ Se você está vendo esta página, a navegação está funcionando!</p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Sessão ativa:</h3>
                    <p className="text-green-700">Usuário: {session.user.username}</p>
                    <p className="text-green-700">Email: {session.user.email}</p>
                    <p className="text-green-700">Role: {session.user.role}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Links para testar:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard Principal</a></li>
                      <li><a href="/dashboard/videos" className="text-blue-600 hover:underline">Vídeos</a></li>
                      <li><a href="/dashboard/upload" className="text-blue-600 hover:underline">Upload</a></li>
                      <li><a href="/dashboard/payments" className="text-blue-600 hover:underline">Pagamentos</a></li>
                      <li><a href="/dashboard/ranking" className="text-blue-600 hover:underline">Ranking</a></li>
                      <li><a href="/dashboard/stats" className="text-blue-600 hover:underline">Estatísticas</a></li>
                      <li><a href="/dashboard/profile" className="text-blue-600 hover:underline">Perfil</a></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
    </UserLayout>
  );
}