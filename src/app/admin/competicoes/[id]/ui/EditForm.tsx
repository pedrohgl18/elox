"use client";
import React, { useState } from 'react';
import type { Competition } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function EditForm({ competition }: { competition: Competition }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: competition.name,
    description: competition.description || '',
    bannerImageUrl: competition.bannerImageUrl || '',
    startDate: new Date(competition.startDate).toISOString().slice(0,16),
    endDate: new Date(competition.endDate).toISOString().slice(0,16),
    cpm: competition.rules.cpm,
    minViews: competition.rules.minViews || 0,
    allowedPlatforms: competition.rules.allowedPlatforms || ['tiktok','instagram','kwai'],
    isActive: competition.isActive,
  });
  const [rewards, setRewards] = useState<Array<{ place: number; amount: number; description?: string }>>(competition.rewards || []);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/competitions/${competition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          bannerImageUrl: form.bannerImageUrl || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          isActive: form.isActive,
          rules: {
            cpm: Number(form.cpm),
            minViews: form.minViews ? Number(form.minViews) : undefined,
            allowedPlatforms: form.allowedPlatforms,
          },
          rewards,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao atualizar');
      }
      router.push('/admin/competicoes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nome</label>
          <input required className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Banner (URL)</label>
          <input className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.bannerImageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, bannerImageUrl: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-300 mb-1">Descrição</label>
          <textarea className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-lg h-24 p-3" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Início</label>
          <input type="datetime-local" required className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Fim</label>
          <input type="datetime-local" required className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">CPM (R$)</label>
          <input type="number" step="0.01" required className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.cpm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, cpm: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Mín. de views (opcional)</label>
          <input type="number" className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.minViews} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, minViews: Number(e.target.value) })} />
        </div>
      </div>
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm text-slate-300">Premiações</label>
          <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
            onClick={() => setRewards(prev => [...prev, { place: (prev[prev.length-1]?.place ?? 0) + 1, amount: 0 }])}
          >Adicionar colocação</button>
        </div>
        <div className="space-y-2">
          {rewards.map((r, idx) => (
            <div key={idx} className="grid grid-cols-[80px_1fr_auto] gap-3 items-center">
              <div>
                <label className="block text-xs text-slate-400">Posição</label>
                <input type="number" min={1} className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.place}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = Number(e.target.value);
                    setRewards(rs => rs.map((x,i) => i===idx ? { ...x, place: v } : x));
                  }} />
              </div>
              <div>
                <label className="block text-xs text-slate-400">Valor (R$)</label>
                <input type="number" step="0.01" min={0} className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = Number(e.target.value);
                    setRewards(rs => rs.map((x,i) => i===idx ? { ...x, amount: v } : x));
                  }} />
              </div>
              <div className="flex items-end gap-2">
                <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                  onClick={() => setRewards(rs => rs.filter((_,i) => i!==idx))}
                >Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Plataformas permitidas</label>
        <div className="flex gap-3 text-sm text-slate-200">
          {(['tiktok','instagram','kwai'] as Array<'tiktok' | 'instagram' | 'kwai'>).map((p) => (
            <label key={p} className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-brand-500" checked={form.allowedPlatforms.includes(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const next = e.target.checked ? [...form.allowedPlatforms, p] : (form.allowedPlatforms.filter((x) => x !== p) as Array<'tiktok' | 'instagram' | 'kwai'>);
                setForm({ ...form, allowedPlatforms: next });
              }} /> {p}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-slate-200 text-sm">
          <input type="checkbox" className="accent-brand-500" checked={form.isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, isActive: e.target.checked })} />
          Ativa
        </label>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="h-10 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white">{loading ? 'Salvando…' : 'Salvar alterações'}</button>
        <button type="button" onClick={() => router.back()} className="h-10 px-4 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">Cancelar</button>
        <button type="button" onClick={async () => {
          if (!confirm('Tem certeza que deseja excluir esta competição?')) return;
          setLoading(true);
          try {
            const res = await fetch(`/api/competitions/${competition.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Falha ao excluir');
            router.push('/admin/competicoes');
          } catch (e) {
            alert((e as any).message);
          } finally {
            setLoading(false);
          }
        }} className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white ml-auto">Excluir</button>
      </div>
    </form>
  );
}
