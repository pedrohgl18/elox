"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, List as ListIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type Platform = 'instagram' | 'youtube' | 'tiktok';

export default function ClientActions({ url, platform = 'instagram' }: { url: string; platform?: Platform }) {
  const { show } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = React.useState<Array<{ id: string; views: number | null; hashtags?: string[]; mentions?: string[]; collected_at: string }>>([]);
  const [histLoading, setHistLoading] = React.useState(false);

  async function collect() {
    setLoading(true);
    try {
      const endpoint = platform === 'instagram'
        ? '/api/admin/instagram-collect'
        : (platform === 'youtube' ? '/api/admin/youtube-collect' : '/api/admin/tiktok-start');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const raw = await res.text();
      let j: any = null;
      try { j = raw ? JSON.parse(raw) : null; } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((j && j.error) || raw || 'Falha ao coletar');
      if (platform === 'tiktok' && j?.runId) {
        // Poll status até obter dados ou timeout curto no cliente
        const started = Date.now();
        const maxMs = 25000; // 25s lado cliente
        const poll = async (): Promise<boolean> => {
          const qs = new URLSearchParams({ runId: j.runId, url }).toString();
          const r = await fetch(`/api/admin/tiktok-status?${qs}`);
          const t = await r.text();
          let tj: any = null; try { tj = t ? JSON.parse(t) : null; } catch {}
          if (r.ok && tj && (tj.views !== undefined || tj.hashtags || tj.mentions)) return true;
          if (Date.now() - started > maxMs) return false;
          await new Promise((rr) => setTimeout(rr, 2000));
          return poll();
        };
        const ok = await poll();
        if (!ok) throw new Error('Coleta iniciada mas não finalizou a tempo. Tente novamente em alguns segundos.');
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
      const endpoint = platform === 'instagram'
        ? '/api/admin/instagram-history'
        : (platform === 'youtube' ? '/api/admin/youtube-history' : '/api/admin/tiktok-history');
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
      <Button size="sm" variant="outline" onClick={collect} disabled={loading} title="Coletar métricas">
        {loading ? (
          'Coletando…'
        ) : (
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coletar</span>
          </span>
        )}
      </Button>
      <Button size="sm" variant="outline" onClick={openDetails} title="Ver histórico de coletas">
        <span className="inline-flex items-center gap-1">
          <ListIcon className="h-3.5 w-3.5" />
          <span>Histórico</span>
        </span>
      </Button>
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
