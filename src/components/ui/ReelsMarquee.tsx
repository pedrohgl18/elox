"use client";

import { Eye, Heart, Hash } from "lucide-react";

type VideoItem = {
  title: string;
  views: string;
  likes: string;
  tags: string[];
};

const videos: VideoItem[] = [
  { title: "Hack do Reels 1", views: "24.3k", likes: "1.2k", tags: ["#reels", "#trend"] },
  { title: "Edição veloz", views: "19.8k", likes: "980", tags: ["#edit", "#fast"] },
  { title: "Trend da semana", views: "32.1k", likes: "2.3k", tags: ["#viral", "#fyp"] },
  { title: "Corte perfeito", views: "12.4k", likes: "640", tags: ["#cut", "#clean"] },
  { title: "Transição limpa", views: "28.9k", likes: "1.9k", tags: ["#transition", "#smooth"] },
  { title: "Efeito viral", views: "41.0k", likes: "3.1k", tags: ["#effect", "#viral"] },
];

const palettes = [
  ["from-fuchsia-400", "to-indigo-500"],
  ["from-indigo-400", "to-purple-500"],
  ["from-purple-400", "to-pink-500"],
  ["from-emerald-400", "to-teal-500"],
  ["from-orange-400", "to-rose-500"],
  ["from-sky-400", "to-indigo-500"],
];

function Thumb({ idx }: { idx: number }) {
  // Gera um mosaico 3x3 de blocos com gradientes variados
  const palette = palettes[idx % palettes.length];
  const blocks = new Array(9).fill(0);
  return (
    <div className="aspect-[9/16] rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white" />
      <div className="grid grid-cols-3 grid-rows-3 gap-[2px] p-[2px] relative">
        {blocks.map((_, i) => {
          const p = palettes[(idx + i) % palettes.length];
          return (
            <div key={i} className={`rounded-sm bg-gradient-to-br ${p[0]} ${p[1]} opacity-90`} />
          );
        })}
      </div>
      {/* Overlay inferior com barra de progresso */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent">
        <div className="h-1 w-full bg-white/30 rounded">
          <div className="h-1 bg-white rounded" style={{ width: `${30 + (idx * 10) % 60}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function ReelsMarquee() {
  const doubled = [...videos, ...videos];
  return (
    <section className="py-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-indigo-300">Clipes em destaque</h3>
        <p className="text-gray-300 text-sm">Uma amostra do que a comunidade está criando agora</p>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-4 w-[200%] animate-marquee" style={{"--marquee-speed":"22s"} as React.CSSProperties}>
          {doubled.map((v, i) => (
            <div key={i} className="min-w-[220px] sm:min-w-[240px] max-w-[240px] bg-white/5 border border-white/10 rounded-xl p-3 hover:border-indigo-400/30 shadow-sm hover:shadow-md transition-all hover-lift">
              <div className="relative">
                <Thumb idx={i} />
                {/* Tags no topo */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {v.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <div className="font-semibold text-white truncate">{v.title}</div>
                <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                  <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" />{v.views}</span>
                  <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" />{v.likes}</span>
                  <span className="inline-flex items-center gap-1"><Hash className="w-4 h-4" />trend</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
