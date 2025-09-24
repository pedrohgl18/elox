"use client";

import { Crown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

type Item = { rank: number; name: string; views: string; earnings: string };

const mock: Item[] = [
  { rank: 1, name: "Ana Trends", views: "1.2M", earnings: "R$ 3.4k" },
  { rank: 2, name: "Lucas Viral", views: "980k", earnings: "R$ 2.7k" },
  { rank: 3, name: "Pedro Clipes", views: "770k", earnings: "R$ 2.1k" },
];

export default function LeaderboardPreview() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-indigo-300 flex items-center gap-2"><Crown className="w-5 h-5"/>Top Clipadores</h3>
        <span className="text-xs text-gray-400">atualiza a cada 10 min</span>
      </div>
      <div className="space-y-3">
        {mock.map((i) => (
          <div key={i.rank} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i.rank===1? 'bg-yellow-300 text-black':'bg-white/10 text-white'}`}>{i.rank}</div>
              <Avatar username={i.name} />
              <div>
                <div className="text-white font-semibold leading-tight">{i.name}</div>
                <div className="text-xs text-gray-400">{i.views} views</div>
              </div>
            </div>
            <div className="text-emerald-300 font-semibold">{i.earnings}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
