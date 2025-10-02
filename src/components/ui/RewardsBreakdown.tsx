"use client";

import { Gift, LineChart, DollarSign } from "lucide-react";
import { Reveal } from "./Reveal";

export default function RewardsBreakdown() {
  return (
    <Reveal as="section" className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-sky-50 p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">Como você é pago?</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <DollarSign className="h-5 w-5 text-emerald-500" /> Prêmios por ranking
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Ganhe prêmios conforme sua posição e regras da campanha.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Gift className="h-5 w-5 text-pink-500" /> Bônus por ranking
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Os melhores da semana recebem recompensas extras.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <LineChart className="h-5 w-5 text-sky-500" /> Boosts e eventos
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Eventos temáticos oferecem multiplicadores e bônus temporários.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
