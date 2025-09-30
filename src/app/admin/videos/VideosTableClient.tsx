'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import ClientActions from './ClientActions';

export type VideoRow = {
  id: string;
  clipadorUsername: string;
  clipadorEmail: string;
  socialMedia: 'tiktok' | 'instagram' | 'kwai' | 'youtube';
  url: string;
  status: string;
  submittedAt: string; // ISO
  validatedAt?: string | null; // ISO
  latest?: { views: number | null; collected_at?: string | null; hashtags?: string[]; mentions?: string[] };
};

type Props = {
  rows: VideoRow[];
  // Server actions recebidas do server component
  approveAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => Promise<void>;
};

export default function VideosTableClient({ rows, approveAction, rejectAction }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState<'idle' | 'collect' | 'export'>('idle');
  const [progress, setProgress] = useState<{ total: number; done: number }>({ total: 0, done: 0 });
  const [force, setForce] = useState(false);

  const allSelected = selected.size > 0 && selected.size === rows.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);

  async function collectSelected() {
    const targets = selectedRows.filter((r) => r.socialMedia === 'instagram' || r.socialMedia === 'youtube');
    if (!targets.length) return;
    setRunning('collect');
    setProgress({ total: targets.length, done: 0 });
    const concurrency = 3;
    let done = 0;
    async function worker(batch: VideoRow[]) {
      for (const r of batch) {
        try {
          const endpoint = r.socialMedia === 'instagram' ? '/api/admin/instagram-collect' : '/api/admin/youtube-collect';
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: r.url, force }),
          });
        } catch {}
        done++;
        setProgress({ total: targets.length, done });
      }
    }
    const batches: VideoRow[][] = [];
    for (let i = 0; i < targets.length; i += 1) {
      batches.push([targets[i]]);
    }
    // Dispara até "concurrency" workers rodando em paralelo, cada um consumindo uma fila simples
    let idx = 0;
    const runNext = async () => {
      if (idx >= batches.length) return;
      const b = batches[idx++];
      await worker(b);
      await runNext();
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, () => runNext()));
    setRunning('idle');
    // Recarrega para atualizar as últimas métricas
    window.location.reload();
  }

  async function collectPage() {
    // Coleta todos da página (Instagram e YouTube)
    const targets = rows.filter((r) => r.socialMedia === 'instagram' || r.socialMedia === 'youtube');
    if (!targets.length) return;
    setRunning('collect');
    setProgress({ total: targets.length, done: 0 });
    let done = 0;
    const concurrency = 4;
    const work = async (r: VideoRow) => {
      try {
        const endpoint = r.socialMedia === 'instagram' ? '/api/admin/instagram-collect' : '/api/admin/youtube-collect';
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: r.url, force }),
        });
      } catch {}
      done++;
      setProgress({ total: targets.length, done });
    };
    // pool simples
    const queue = [...targets];
    async function runner() {
      while (queue.length) {
        const r = queue.shift()!;
        await work(r);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, runner));
    setRunning('idle');
    window.location.reload();
  }

  function exportCSV() {
    const rowsToExport = selectedRows.length ? selectedRows : rows; // se nada selecionado, exporta todos visíveis
    if (!rowsToExport.length) return;
    setRunning('export');
    const header = [
      'video_id',
      'clipador_username',
      'clipador_email',
      'platform',
      'url',
      'status',
      'views_latest',
      'hashtags_latest',
      'mentions_latest',
      'collected_at_latest',
      'submitted_at',
      'validated_at',
    ];
    const esc = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = [header.join(',')];
    for (const r of rowsToExport) {
      const m = r.latest || { views: null, collected_at: '', hashtags: [], mentions: [] };
      lines.push([
        r.id,
        r.clipadorUsername,
        r.clipadorEmail,
        r.socialMedia,
        r.url,
        r.status,
        m.views ?? '',
        (m.hashtags || []).join(' '),
        (m.mentions || []).join(' '),
        m.collected_at ? new Date(m.collected_at).toISOString() : '',
        new Date(r.submittedAt).toISOString(),
        r.validatedAt ? new Date(r.validatedAt).toISOString() : '',
      ].map(esc).join(','));
    }
    const csv = '\uFEFF' + lines.join('\n'); // BOM para Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elox-videos-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setRunning('idle');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-slate-300">
          Selecionados: {selected.size} / {rows.length}
          {running !== 'idle' && (
            <span className="ml-3 text-emerald-400">{running === 'collect' ? `Coletando ${progress.done}/${progress.total}...` : 'Gerando CSV...'}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 mr-2">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-800" checked={force} onChange={(e) => setForce(e.target.checked)} />
            Forçar recoleta
          </label>
          <Button size="sm" variant="outline" onClick={() => setSelected(new Set())} disabled={running !== 'idle'}>
            Limpar seleção
          </Button>
          <Button size="sm" onClick={collectSelected} disabled={running !== 'idle' || selectedRows.filter(r => r.socialMedia === 'instagram' || r.socialMedia === 'youtube').length === 0} title="Coletar métricas dos selecionados">
            Coletar (sel.)
          </Button>
          <Button size="sm" onClick={collectPage} disabled={running !== 'idle' || rows.filter(r => r.socialMedia === 'instagram' || r.socialMedia === 'youtube').length === 0} title="Coletar métricas de todos desta página">
            Coletar (pág.)
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV} disabled={running !== 'idle' || rows.length === 0} title="Exportar CSV da página ou dos selecionados">
            CSV {selected.size ? '(sel.)' : '(pág.)'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm sm:text-[0.95rem]">
          <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
            <tr>
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-semibold text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </th>
              {['Clipador','Rede','URL','Views (última)','Hashtags','Menções','Coletado em','Enviado em','Validado em','Status','Ações'].map((h) => (
                <th key={h} className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-semibold text-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {rows.map((r) => (
              <tr key={r.id} className="group hover:bg-slate-900">
                <td className="px-3 sm:px-4 py-2 align-top">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    aria-label={`Selecionar vídeo ${r.id}`}
                  />
                </td>
                <td className="px-3 sm:px-4 py-2 text-slate-100 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium">{r.clipadorUsername}</span>
                    <span className="text-xs text-slate-400">{r.clipadorEmail}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-2 text-slate-300 whitespace-nowrap align-top">{r.socialMedia.toUpperCase()}</td>
                <td className="px-3 sm:px-4 py-2 break-words max-w-[260px] sm:max-w-none align-top">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-brand-400 underline break-all">{r.url}</a>
                </td>
                <td className="px-3 sm:px-4 py-2 text-slate-200 whitespace-nowrap align-top">{typeof r.latest?.views === 'number' ? r.latest.views.toLocaleString('pt-BR') : '-'}</td>
                <td className="px-3 sm:px-4 py-2 align-top">
                  {(r.latest?.hashtags || []).length ? (
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(r.latest!.hashtags || []).slice(0,5).map((t, i) => (
                        <span key={i} className="text-[11px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>
                      ))}
                      {(r.latest!.hashtags || []).length > 5 && (
                        <span className="text-[11px] text-slate-500">+{(r.latest!.hashtags || []).length - 5}</span>
                      )}
                    </div>
                  ) : <span className="text-slate-500">-</span>}
                </td>
                <td className="px-3 sm:px-4 py-2 align-top">
                  {(r.latest?.mentions || []).length ? (
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(r.latest!.mentions || []).slice(0,5).map((t, i) => (
                        <span key={i} className="text-[11px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200">{t}</span>
                      ))}
                      {(r.latest!.mentions || []).length > 5 && (
                        <span className="text-[11px] text-slate-500">+{(r.latest!.mentions || []).length - 5}</span>
                      )}
                    </div>
                  ) : <span className="text-slate-500">-</span>}
                </td>
                <td className="px-3 sm:px-4 py-2 text-slate-400 whitespace-nowrap align-top">{r.latest?.collected_at ? new Date(r.latest.collected_at).toLocaleString('pt-BR') : '-'}</td>
                <td className="px-3 sm:px-4 py-2 text-slate-300 whitespace-nowrap align-top">{new Date(r.submittedAt).toLocaleString('pt-BR')}</td>
                <td className="px-3 sm:px-4 py-2 text-slate-300 whitespace-nowrap align-top">{r.validatedAt ? new Date(r.validatedAt).toLocaleString('pt-BR') : '-'}</td>
                <td className="px-3 sm:px-4 py-2 align-top"><StatusBadge label={r.status} /></td>
                <td className="px-3 sm:px-4 py-2 flex flex-wrap gap-2 align-top">
                  {r.status !== 'APPROVED' && (
                    <form action={approveAction.bind(null, r.id)}>
                      <Button size="sm">Aprovar</Button>
                    </form>
                  )}
                  {r.status !== 'REJECTED' && (
                    <form action={rejectAction.bind(null, r.id)}>
                      <Button size="sm" variant="outline">Rejeitar</Button>
                    </form>
                  )}
                  {(r.socialMedia === 'instagram' || r.socialMedia === 'youtube') && (
                    <ClientActions url={r.url} platform={r.socialMedia} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
