export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { PaymentRequestForm } from '@/components/user/PaymentRequestForm';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyBRL } from '@/lib/format';
import { Payment } from '@/lib/types';
import { Plus, Wallet, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export default async function PaymentsPage() {
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
  
  const payments: Payment[] = await db.payment.listForUser(user);
  
  // Estatísticas dos pagamentos
  const totalRequests = payments.length;
  const pendingPayments = payments.filter((p: Payment) => p.status === 'PENDING');
  const processedPayments = payments.filter((p: Payment) => p.status === 'PROCESSED');
  const failedPayments = payments.filter((p: Payment) => p.status === 'FAILED');
  
  const totalRequested = payments.reduce((acc: number, p: Payment) => acc + p.amount, 0);
  const totalProcessed = processedPayments.reduce((acc: number, p: Payment) => acc + p.amount, 0);
  const totalPending = pendingPayments.reduce((acc: number, p: Payment) => acc + p.amount, 0);

  // Monta linhas e colunas para DataTable simples
  const tableRows = payments.map((p: Payment) => ({
    valor: (
      <div className="flex items-center space-x-1 font-medium">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span>{formatCurrencyBRL(p.amount)}</span>
      </div>
    ),
    status: <StatusBadge label={p.status} />,
    solicitado: (
      <div className="text-sm">
        <div>{new Date(p.requestedAt).toLocaleDateString('pt-BR')}</div>
        <div className="text-gray-500 text-xs">{new Date(p.requestedAt).toLocaleTimeString('pt-BR')}</div>
      </div>
    ),
    processado: p.processedAt ? (
      <div className="text-sm">
        <div>{new Date(p.processedAt).toLocaleDateString('pt-BR')}</div>
        <div className="text-gray-500 text-xs">{new Date(p.processedAt).toLocaleTimeString('pt-BR')}</div>
      </div>
    ) : (
      <span className="text-gray-400 text-sm">-</span>
    ),
  }));

  const paymentColumns = [
    { key: 'valor', label: 'Valor' },
    { key: 'status', label: 'Status' },
    { key: 'solicitado', label: 'Solicitado em' },
    { key: 'processado', label: 'Processado em' },
  ];

  return (
    <UserLayout username={user.username} email={user.email}>
      {/* Header da Página */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Pagamentos</h1>
          <p className="text-slate-400 mt-1">Gerencie suas solicitações de pagamento e histórico</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Solicitação</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Total Solicitado</span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyBRL(totalRequested)}</div>
            <p className="text-xs text-slate-400">
              {totalRequests} solicitações
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Total Recebido</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyBRL(totalProcessed)}</div>
            <p className="text-xs text-slate-400">
              {processedPayments.length} pagamentos processados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Em Processamento</span>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrencyBRL(totalPending)}</div>
            <p className="text-xs text-slate-400">
              {pendingPayments.length} aguardando processamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-300">Taxa de Sucesso</span>
            <div className={`h-4 w-4 rounded-full ${
              totalRequests > 0 && (processedPayments.length / totalRequests) >= 0.8 
                ? 'bg-green-500' 
                : totalRequests > 0 && (processedPayments.length / totalRequests) >= 0.6
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRequests > 0 ? Math.round((processedPayments.length / totalRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-400">
              {failedPayments.length} falharam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Nova Solicitação */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-100">Nova Solicitação de Pagamento</h3>
          <p className="text-sm text-slate-400">Solicite o pagamento dos seus ganhos acumulados</p>
        </CardHeader>
        <CardContent>
          <PaymentRequestForm />
        </CardContent>
      </Card>

      {/* Resumo Rápido por Status */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-yellow-300">Pendentes</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-300">{pendingPayments.length}</div>
            <p className="text-sm text-slate-400">{formatCurrencyBRL(totalPending)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-300">Processados</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-300">{processedPayments.length}</div>
            <p className="text-sm text-slate-400">{formatCurrencyBRL(totalProcessed)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-300">Falhas</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-300">{failedPayments.length}</div>
            <p className="text-sm text-slate-400">
              {formatCurrencyBRL(failedPayments.reduce((acc, p) => acc + p.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-100">Histórico de Solicitações</h3>
          <p className="text-sm text-slate-400">Todas as suas solicitações de pagamento</p>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <DataTable data={tableRows} columns={paymentColumns} />
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">Nenhuma solicitação ainda</h3>
              <p className="text-slate-400 mb-4">Você ainda não fez nenhuma solicitação de pagamento.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Fazer Primeira Solicitação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </UserLayout>
  );
}