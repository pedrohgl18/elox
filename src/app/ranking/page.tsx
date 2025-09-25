import React from 'react';
import LeaderboardPreview from '@/components/ui/LeaderboardPreview';

export const dynamic = 'force-dynamic';

export default function PublicRankingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-black text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Ranking Geral</h1>
        <LeaderboardPreview />
        <p className="text-slate-400 text-sm">A versão detalhada do leaderboard será exibida em breve com dados em tempo real.</p>
      </div>
    </div>
  );
}
