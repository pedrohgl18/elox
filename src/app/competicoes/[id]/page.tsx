import React from 'react';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';
import { formatDateShort } from '@/lib/format';
import { CompetitionEnrollButton } from '@/components/user/CompetitionEnrollButton';
import { formatCurrencyBRL } from '@/lib/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublicCompetitionPage({ params }: { params: { id: string } }) {
  const c = await db.competition.getById(params.id);
  if (!c) notFound();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-black text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          {c.bannerImageUrl && <img src={c.bannerImageUrl} alt={c.name} className="h-20 w-36 object-cover rounded-lg border border-slate-800" />}
          <div>
            <h1 className="text-2xl font-bold">{c.name}</h1>
            <div className="text-slate-400 text-sm">
              {formatDateShort(c.startDate)} → {formatDateShort(c.endDate)}
              {typeof c.rules?.cpm === 'number' ? (
                <> • CPM R$ {c.rules.cpm.toFixed(2)}</>
              ) : null}
            </div>
          </div>
        </div>
        {c.description && <p className="text-slate-300">{c.description}</p>}
        {Array.isArray(c.rewards) && c.rewards.length > 0 && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <h2 className="font-semibold mb-2">Premiações</h2>
            <ul className="text-sm text-slate-300 space-y-1">
              {c.rewards.map((r: any) => (
                <li key={r.place}>#{r.place} • {formatCurrencyBRL(r.amount)} {r.description ? `• ${r.description}` : ''}</li>
              ))}
            </ul>
          </div>
        )}
        {c.rules?.minViews && (
          <div className="text-sm text-slate-400">Mínimo de views para elegibilidade: {c.rules.minViews.toLocaleString('pt-BR')}</div>
        )}
        {c.rules?.allowedPlatforms && (
          <div className="text-sm text-slate-400">Plataformas: {c.rules.allowedPlatforms.join(', ')}</div>
        )}
        {((c.rules?.requiredHashtags && c.rules.requiredHashtags.length) || (c.rules?.requiredMentions && c.rules.requiredMentions.length)) && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <h2 className="font-semibold mb-2">Requisitos de Publicação</h2>
            {c.rules?.requiredHashtags?.length ? (
              <div className="text-sm text-slate-300 mb-1">Hashtags obrigatórias: {c.rules.requiredHashtags.map((h: string) => <span key={h} className="mr-2 text-emerald-300">{h}</span>)}</div>
            ) : null}
            {c.rules?.requiredMentions?.length ? (
              <div className="text-sm text-slate-300">Menções obrigatórias: {c.rules.requiredMentions.map((m: string) => <span key={m} className="mr-2 text-emerald-300">{m}</span>)}</div>
            ) : null}
          </div>
        )}
        {c.assets?.audioLinks && c.assets.audioLinks.length > 0 && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <h2 className="font-semibold mb-2">Áudios Oficiais</h2>
            <ul className="text-sm text-slate-300 space-y-1">
              {c.assets.audioLinks.map((a: { platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; url: string; label?: string }, idx: number) => (
                <li key={idx}>
                  <a className="text-emerald-300 hover:underline" href={a.url} target="_blank" rel="noreferrer">
                    {a.label || `Áudio ${a.platform}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(c.phases) && c.phases.length > 0 && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <h2 className="font-semibold mb-2">Fases</h2>
            <ul className="text-sm text-slate-300 space-y-1">
              {c.phases.map((ph: { name: string; startDate: Date; endDate: Date; description?: string }, idx: number) => (
                <li key={idx}>
                  <span className="font-medium">{ph.name}:</span> {formatDateShort(ph.startDate)} → {formatDateShort(ph.endDate)} {ph.description ? `• ${ph.description}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA de inscrição */}
        <div className="pt-2">
          <CompetitionEnrollButton competitionId={c.id} />
        </div>

        {/* Seção explicativa do ranking */}
        <div className="mt-8 border border-slate-800 rounded-xl p-5 bg-slate-900/60">
          <h2 className="text-xl font-semibold mb-2">Como funciona o Ranking</h2>
          <div className="space-y-2 text-slate-300 text-sm">
            <p>O ranking é baseado no número de visualizações dos vídeos publicados com as hashtags e marcações obrigatórias da competição e validados pelos moderadores.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>5 níveis (Level 1 a Level 5): quanto mais views, maior o nível.</li>
              <li>Cada nível tem um número fixo de posições premiadas.</li>
              <li>Cada usuário pode ter até 2 vídeos premiados por nível e até 4 no total por dia.</li>
              <li>Ranking atualizado diariamente e com consolidação semanal.</li>
            </ul>
            <p className="text-slate-400">Exemplo: Um vídeo com 10.000 visualizações pode entrar no Level 4 e render R$ 75,00.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
