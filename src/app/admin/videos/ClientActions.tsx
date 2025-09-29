"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function ClientActions({ url }: { url: string }) {
  const { show } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = React.useState<Array<{ id: string; views: number | null; hashtags?: string[]; mentions?: string[]; collected_at: string }>>([]);
  const [histLoading, setHistLoading] = React.useState(false);

  async function collect() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/instagram-collect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao coletar');
      }
      show('Coleta concluída.', { type: 'success' });
    } catch (e: any) {
      show(e?.message || 'Erro ao coletar', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function openDetails() {
    setOpen(true);
    setHistLoading(true);
    try {
      const qs = new URLSearchParams({ url, limit: '10' }).toString();
      const res = await fetch(`/api/admin/instagram-history?${qs}`);
      const j = await res.json();
      if (res.ok) {
        setHistory(j.items || []);
      } else {
        throw new Error(j.error || 'Falha ao carregar histórico');
      }
    } catch (e: any) {
      show(e?.message || 'Erro ao carregar histórico', { type: 'error' });
    } finally {
      setHistLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={collect} disabled={loading}>
        {loading ? 'Coletando…' : 'Coletar métricas (sessão)'}
      </Button>
  <Button size="sm" variant="outline" onClick={openDetails}>Detalhes</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div className="text-lg font-semibold">Histórico de coletas</div>
          <div className="text-xs text-slate-600 break-all">{url}</div>
          {histLoading ? (
            <div className="text-sm">Carregando…</div>
          ) : history.length === 0 ? (
            <div className="text-sm">Sem histórico.</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Coletado em</th>
                    <th className="text-left p-2">Views</th>
                    <th className="text-left p-2">Hashtags</th>
                    <th className="text-left p-2">Menções</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="p-2">{new Date(h.collected_at).toLocaleString('pt-BR')}</td>
                      <td className="p-2">{typeof h.views === 'number' ? h.views.toLocaleString('pt-BR') : '-'}</td>
                      <td className="p-2">
                        {(h.hashtags || []).length ? (
                          <div className="flex flex-wrap gap-1">{(h.hashtags || []).map((t, i) => <span key={i} className="text-xs bg-slate-200 text-slate-800 px-1 rounded">{t}</span>)}</div>
                        ) : '-'}
                      </td>
                      <td className="p-2">
                        {(h.mentions || []).length ? (
                          <div className="flex flex-wrap gap-1">{(h.mentions || []).map((t, i) => <span key={i} className="text-xs bg-slate-200 text-slate-800 px-1 rounded">{t}</span>)}</div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={() => setOpen(false)}>Fechar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
