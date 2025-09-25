import React from 'react';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';
import { formatDateShort } from '@/lib/format';
import { CompetitionEnrollButton } from '@/components/user/CompetitionEnrollButton';

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
            <div className="text-slate-400 text-sm">{formatDateShort(c.startDate)} → {formatDateShort(c.endDate)} • CPM R$ {c.rules.cpm.toFixed(2)}</div>
          </div>
        </div>
        {c.description && <p className="text-slate-300">{c.description}</p>}
        {Array.isArray(c.rewards) && c.rewards.length > 0 && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <h2 className="font-semibold mb-2">Premiações</h2>
            <ul className="text-sm text-slate-300 space-y-1">
              {c.rewards.map((r: any) => (
                <li key={r.place}>#{r.place} • R$ {(r.amount/1).toFixed(2)} {r.description ? `• ${r.description}` : ''}</li>
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

        {/* CTA de inscrição */}
        <div className="pt-2">
          <CompetitionEnrollButton competitionId={c.id} />
        </div>
      </div>
    </div>
  );
}
