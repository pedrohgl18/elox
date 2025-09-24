"use client";

import { Gift, LineChart, DollarSign } from "lucide-react";

export default function RewardsBreakdown() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-bold text-indigo-300 mb-4">Como você é pago?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-300"/> CPM por 1.000 views</div>
          <p className="text-sm text-gray-300 mt-1">Ganhe com base nas views dos seus clipes, com regras claras.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white font-semibold flex items-center gap-2"><Gift className="w-5 h-5 text-pink-300"/> Bônus por ranking</div>
          <p className="text-sm text-gray-300 mt-1">Os melhores da semana recebem prêmios extras.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white font-semibold flex items-center gap-2"><LineChart className="w-5 h-5 text-indigo-300"/> Boosts e eventos</div>
          <p className="text-sm text-gray-300 mt-1">Eventos temáticos podem aumentar seu CPM temporariamente.</p>
        </div>
      </div>
    </section>
  );
}
