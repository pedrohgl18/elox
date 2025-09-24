'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Video, Payment } from '@/lib/types';

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