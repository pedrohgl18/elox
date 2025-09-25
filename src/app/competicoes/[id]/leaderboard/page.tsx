import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/database';
import { config } from '@/lib/config';
import { formatCurrencyBRL } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CompetitionLeaderboardPage({ params }: { params: { id: string } }) {
  const comp = await db.competition.getById(params.id);
  if (!comp) notFound();

  const res = await fetch(`${config.baseUrl}/api/competitions/${params.id}/leaderboard`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const data = await res.json() as { name: string; levels: Array<{ name: string; prize: number; maxWinners: number; winners: Array<{ username: string; views: number; place: number }> }> };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-black text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Leaderboard • {data.name}</h1>
        {data.levels.map((lvl) => (
          <div key={lvl.name} className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{lvl.name}</h2>
              <div className="text-sm text-emerald-300 font-medium">Prêmio: {formatCurrencyBRL(lvl.prize)}</div>
            </div>
            {lvl.winners.length === 0 ? (
              <div className="text-slate-400 text-sm">Sem vencedores no momento.</div>
            ) : (
              <ol className="space-y-2">
                {lvl.winners.map((w) => (
                  <li key={`${lvl.name}-${w.place}-${w.username}`} className="flex items-center justify-between bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">#{w.place}</div>
                      <div>
                        <div className="font-semibold text-slate-100">{w.username}</div>
                        <div className="text-xs text-slate-400">{w.views.toLocaleString('pt-BR')} views</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">Nível: {lvl.name}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
