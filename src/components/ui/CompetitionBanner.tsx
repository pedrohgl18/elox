"use client";

import { Trophy, Timer, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  name: string;
  endsAt: Date;
  prize: string;
};

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return { d, h, m, s: ss };
}

export default function CompetitionBanner({ name, endsAt, prize }: Props) {
  const { d, h, m, s } = useCountdown(endsAt);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-purple-500/10 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 text-indigo-200 text-xs border border-white/15">
            <Trophy className="w-4 h-4" /> Competição ativa
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2">{name}</h3>
          <p className="text-sm text-gray-300">Prêmio total: <span className="text-white font-semibold">{prize}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
            <Timer className="w-5 h-5 text-indigo-300" />
            <div className="text-white font-mono text-lg tabular-nums">{d.toString().padStart(2,'0')}d:{h.toString().padStart(2,'0')}h:{m.toString().padStart(2,'0')}m:{s.toString().padStart(2,'0')}s</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
            <Wallet className="w-5 h-5 text-emerald-300" />
            <div className="text-gray-200 text-sm">Pagamentos semanais via PIX</div>
          </div>
        </div>
      </div>
    </section>
  );
}
