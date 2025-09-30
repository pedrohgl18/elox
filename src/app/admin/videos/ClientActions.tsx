"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type Platform = 'instagram' | 'youtube';

export default function ClientActions({ url, platform = 'instagram' }: { url: string; platform?: Platform }) {
  const { show } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = React.useState<Array<{ id: string; views: number | null; hashtags?: string[]; mentions?: string[]; collected_at: string }>>([]);
  const [histLoading, setHistLoading] = React.useState(false);

  async function collect() {
    setLoading(true);
    try {
      const endpoint = platform === 'instagram' ? '/api/admin/instagram-collect' : '/api/admin/youtube-collect';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j?.error || 'Falha ao coletar');
      }
      if (j?.skipped && j?.reason === 'recent') {
        show(`Coleta ignorada (cooldown). Última: ${j?.latestAt ? new Date(j.latestAt).toLocaleString('pt-BR') : 'há pouco'}.`, { type: 'info' });
      } else {
        show('Coleta concluída.', { type: 'success' });
      }
    } catch (e: any) {
      const msg = String(e?.message || 'Erro ao coletar');
      // ajustes de mensagens mais amigáveis
      if (msg.toLowerCase().includes('cota') || msg.toLowerCase().includes('quota')) {
        show('Limite de cota da YouTube Data API atingido. Tente novamente mais tarde.', { type: 'warning' });
      } else if (msg.toLowerCase().includes('não configurada') || msg.toLowerCase().includes('inválida')) {
        show(msg, { type: 'warning' });
      } else {
        show(msg, { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function openDetails() {
    setOpen(true);
    setHistLoading(true);
    try {
      const qs = new URLSearchParams({ url, limit: '10' }).toString();
      const endpoint = platform === 'instagram' ? '/api/admin/instagram-history' : '/api/admin/youtube-history';
      const res = await fetch(`${endpoint}?${qs}`);
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
        {loading ? 'Coletando…' : `Coletar métricas (${platform === 'instagram' ? 'Apify' : 'YouTube'})`}
      </Button>
  <Button size="sm" variant="outline" onClick={openDetails}>Detalhes</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4 text-slate-200">
          <div className="text-lg font-semibold">Histórico de coletas</div>
          <div className="text-xs text-slate-400 break-all">{url}</div>
          {histLoading ? (
            <div className="text-sm text-slate-300">Carregando…</div>
          ) : history.length === 0 ? (
            <div className="text-sm text-slate-300">Sem histórico.</div>
          ) : (
            <div className="max-h-80 overflow-auto rounded border border-slate-800 bg-slate-950/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="text-left p-2 font-medium">Coletado em</th>
                    <th className="text-left p-2 font-medium">Views</th>
                    <th className="text-left p-2 font-medium">Hashtags</th>
                    <th className="text-left p-2 font-medium">Menções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/40">
                      <td className="p-2 text-slate-300">{new Date(h.collected_at).toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-slate-200">{typeof h.views === 'number' ? h.views.toLocaleString('pt-BR') : '-'}</td>
                      <td className="p-2">
                        {(h.hashtags || []).length ? (
                          <div className="flex flex-wrap gap-1">{(h.hashtags || []).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>)}</div>
                        ) : <span className="text-slate-500">-</span>}
                      </td>
                      <td className="p-2">
                        {(h.mentions || []).length ? (
                          <div className="flex flex-wrap gap-1">{(h.mentions || []).map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>)}</div>
                        ) : <span className="text-slate-500">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
