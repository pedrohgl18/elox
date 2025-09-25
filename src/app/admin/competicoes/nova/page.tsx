"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDateTimeShort } from '@/lib/format';

export default function NovaCompeticaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    bannerImageUrl: '',
    startDate: '',
    endDate: '',
    minViews: 0,
    allowedPlatforms: ['tiktok','instagram','kwai','youtube'] as string[],
    requiredHashtags: '' as string, // separado por espaço ou vírgula
    requiredMentions: '' as string, // separado por espaço ou vírgula
  });
  const [audioLinks, setAudioLinks] = useState<Array<{ platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; url: string; label?: string }>>([]);
  const [phases, setPhases] = useState<Array<{ name: string; startDate: string; endDate: string; description?: string }>>([]);
  const [rewards, setRewards] = useState<Array<{ fromPlace: number; toPlace: number; amount: number; platform?: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; description?: string }>>([
    { fromPlace: 1, toPlace: 3, amount: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          bannerImageUrl: form.bannerImageUrl || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          rules: {
            minViews: form.minViews ? Number(form.minViews) : undefined,
            allowedPlatforms: form.allowedPlatforms,
            requiredHashtags: form.requiredHashtags.trim() ? form.requiredHashtags.split(/[ ,]+/).filter(Boolean) : undefined,
            requiredMentions: form.requiredMentions.trim() ? form.requiredMentions.split(/[ ,]+/).filter(Boolean) : undefined,
          },
          rewards: rewards
            .filter(r => r.amount > 0 && r.fromPlace >= 1 && r.toPlace >= r.fromPlace)
            .map(r => ({ fromPlace: Number(r.fromPlace), toPlace: Number(r.toPlace), amount: Number(r.amount), platform: r.platform || undefined })),
          isActive: true,
          assets: { audioLinks: audioLinks.length ? audioLinks : undefined },
          phases: phases.length ? phases : undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao criar competição');
      }
      router.push('/admin/competicoes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Nova competição</h1>
        <p className="text-slate-400">Defina regras, período e premiações</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nome</label>
            <input required className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Banner (URL)</label>
            <Input placeholder="https://..." value={form.bannerImageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, bannerImageUrl: e.target.value })} />
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
          {/* Campo CPM removido conforme solicitado */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Mín. de views (opcional)</label>
            <input type="number" className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={form.minViews} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, minViews: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Hashtags obrigatórias</label>
              <Input placeholder="#elox #campanha" value={form.requiredHashtags} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, requiredHashtags: e.target.value })} />
              <p className="text-xs text-slate-500 mt-1">Separe por espaço ou vírgula</p>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Menções obrigatórias</label>
              <Input placeholder="@eloxoficial @artista" value={form.requiredMentions} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, requiredMentions: e.target.value })} />
              <p className="text-xs text-slate-500 mt-1">Separe por espaço ou vírgula</p>
            </div>
          </div>
        </div>
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-slate-300">Premiações</label>
            <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => setRewards(prev => [...prev, { fromPlace: 1, toPlace: 1, amount: 0 }])}
            >Adicionar faixa</button>
          </div>
          <div className="space-y-2">
            {rewards.map((r, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[200px_200px_1fr_220px_auto] gap-3 items-end">
                <div>
                  <label className="block text-xs text-slate-400">De (posição)</label>
                  <input type="number" min={1} className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.fromPlace}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = Number(e.target.value);
                      setRewards(rs => rs.map((x,i) => i===idx ? { ...x, fromPlace: v } : x));
                    }} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Até (posição)</label>
                  <input type="number" min={1} className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.toPlace}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = Number(e.target.value);
                      setRewards(rs => rs.map((x,i) => i===idx ? { ...x, toPlace: v } : x));
                    }} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Valor (R$)</label>
                  <input type="number" step={0.01} min={0} className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = Number(e.target.value);
                      setRewards(rs => rs.map((x,i) => i===idx ? { ...x, amount: v } : x));
                    }} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Plataforma (opcional)</label>
                  <select className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={r.platform || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRewards(rs => rs.map((x,i) => i===idx ? { ...x, platform: (e.target.value || undefined) as any } : x))}
                  >
                    <option value="">Todas</option>
                    {(['tiktok','instagram','kwai','youtube'] as const).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                    onClick={() => setRewards(rs => rs.filter((_,i) => i!==idx))}
                  >Remover</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => setRewards(prev => [...prev, { fromPlace: 1, toPlace: 1, amount: 0 }])}
            >Adicionar faixa</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Plataformas permitidas</label>
          <div className="flex gap-3 text-sm text-slate-200">
            {['tiktok','instagram','kwai','youtube'].map((p) => (
              <label key={p} className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-brand-500" checked={form.allowedPlatforms.includes(p)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = e.target.checked
                    ? [...form.allowedPlatforms, p]
                    : form.allowedPlatforms.filter((x) => x !== p);
                  setForm({ ...form, allowedPlatforms: next });
                }} /> {p}
              </label>
            ))}
          </div>
        </div>
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-slate-300">Links de Áudio</label>
            <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => setAudioLinks(prev => [...prev, { platform: 'tiktok', url: '' }])}
            >Adicionar link</button>
          </div>
          <div className="space-y-2">
            {audioLinks.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[140px_1fr_180px_auto] gap-3 items-center">
                <div>
                  <label className="block text-xs text-slate-400">Plataforma</label>
                  <select className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={a.platform}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAudioLinks(rs => rs.map((x,i) => i===idx ? { ...x, platform: e.target.value as any } : x))}
                  >
                    {(['tiktok','instagram','kwai','youtube'] as const).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400">URL</label>
                  <Input value={a.url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudioLinks(rs => rs.map((x,i) => i===idx ? { ...x, url: e.target.value } : x))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Rótulo (opcional)</label>
                  <Input value={a.label || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudioLinks(rs => rs.map((x,i) => i===idx ? { ...x, label: e.target.value } : x))} />
                </div>
                <div className="flex items-end">
                  <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => setAudioLinks(rs => rs.filter((_,i) => i!==idx))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-slate-300">Fases (opcional)</label>
            <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => setPhases(prev => [...prev, { name: '', startDate: '', endDate: '' }])}
            >Adicionar fase</button>
          </div>
          <div className="space-y-2">
            {phases.map((ph, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px_auto] gap-3 items-center">
                <div>
                  <label className="block text-xs text-slate-400">Nome da fase</label>
                  <Input value={ph.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhases(rs => rs.map((x,i) => i===idx ? { ...x, name: e.target.value } : x))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Início</label>
                  <input type="datetime-local" className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={ph.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhases(rs => rs.map((x,i) => i===idx ? { ...x, startDate: e.target.value } : x))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Fim</label>
                  <input type="datetime-local" className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg h-10 px-3" value={ph.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhases(rs => rs.map((x,i) => i===idx ? { ...x, endDate: e.target.value } : x))} />
                </div>
                <div className="flex items-end">
                  <button type="button" className="h-9 px-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => setPhases(rs => rs.filter((_,i) => i!==idx))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Salvando…' : 'Criar competição'}</Button>
          <button type="button" onClick={() => router.back()} className="h-10 px-4 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
