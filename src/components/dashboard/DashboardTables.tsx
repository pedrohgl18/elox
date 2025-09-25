'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Video, Payment, SocialAccount } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface DashboardTablesProps {
  videos: Video[];
  payments: Payment[];
}

function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(amount);
}

export function DashboardTables({ videos, payments }: DashboardTablesProps) {
  // Monta linhas para tabela simples de vídeos
  const videoRows = videos.map((v) => ({
    url: (
      <a href={v.url} className="text-brand-400 underline text-sm" target="_blank" rel="noreferrer">
        Ver
      </a>
    ),
    rede: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-200">
        {v.socialMedia.toUpperCase()}
      </span>
    ),
    views: v.views.toLocaleString('pt-BR'),
    ganho: <span className="text-green-400 font-medium">{formatCurrencyBRL(v.earnings)}</span>,
    status: <StatusBadge label={v.status} />,
  }));
  const videoColumns = [
    { key: 'url', label: 'URL' },
    { key: 'rede', label: 'Rede' },
    { key: 'views', label: 'Views' },
    { key: 'ganho', label: 'Ganho' },
    { key: 'status', label: 'Status' },
  ];

  // Monta linhas para tabela simples de pagamentos
  const paymentRows = payments.map((p) => ({
    valor: <span className="font-medium">{formatCurrencyBRL(p.amount)}</span>,
    status: <StatusBadge label={p.status} />,
    solicitado: new Date(p.requestedAt).toLocaleString('pt-BR'),
    processado: p.processedAt ? new Date(p.processedAt).toLocaleString('pt-BR') : '-',
  }));
  const paymentColumns = [
    { key: 'valor', label: 'Valor' },
    { key: 'status', label: 'Status' },
    { key: 'solicitado', label: 'Solicitado em' },
    { key: 'processado', label: 'Processado em' },
  ];

  return (
    <div className="grid gap-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Vídeos Recentes</h2>
        <DataTable data={videoRows} columns={videoColumns} />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Histórico de Pagamentos</h2>
        <DataTable data={paymentRows} columns={paymentColumns} />
      </div>
    </div>
  );
}

export function AdminSocialAccountsTable() {
  const [data, setData] = React.useState<SocialAccount[]>([] as any);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/social-accounts');
      if (!res.ok) throw new Error('Falha ao carregar');
      const j = await res.json();
      setData(j);
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'pending' | 'verified' | 'revoked') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Falha ao atualizar');
      await load();
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  const rows = data.map((a) => ({
    usuario: a.clipadorId,
    plataforma: a.platform.toUpperCase(),
    perfil: '@' + a.username,
    status: <StatusBadge label={a.status} />,
    acoes: (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'verified')}>Validar</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'revoked')}>Revogar</Button>
      </div>
    ),
  }));
  const columns = [
    { key: 'usuario', label: 'Usuário (id)' },
    { key: 'plataforma', label: 'Plataforma' },
    { key: 'perfil', label: 'Perfil' },
    { key: 'status', label: 'Status' },
    { key: 'acoes', label: 'Ações' },
  ];

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex justify-end">
        <Button size="sm" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Recarregar'}</Button>
      </div>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}