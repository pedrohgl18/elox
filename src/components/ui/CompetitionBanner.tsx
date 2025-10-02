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
    <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-100 via-white to-cyan-100 p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-800 shadow-sm">
            <Trophy className="h-4 w-4" /> Competição ativa
          </div>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{name}</h3>
          <p className="text-sm text-slate-600">
            Prêmio total: <span className="font-semibold text-slate-900">{prize}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-3 shadow-sm">
            <Timer className="h-5 w-5 text-sky-600" />
            <div className="font-mono text-lg text-slate-900 tabular-nums">
              {d.toString().padStart(2, '0')}d:{h.toString().padStart(2, '0')}h:{m.toString().padStart(2, '0')}m:{s
                .toString()
                .padStart(2, '0')}s
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex">
            <Wallet className="h-5 w-5 text-emerald-500" />
            <div>Pagamentos semanais via PIX</div>
          </div>
        </div>
      </div>
    </section>
  );
}
