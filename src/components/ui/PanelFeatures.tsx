"use client";

import type { LucideIcon } from "lucide-react";
import { Upload, BarChart3, Trophy, Wallet, ShieldCheck, HeadphonesIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const features: Feature[] = [
  { icon: Upload, title: "Envio Rápido de Vídeos", desc: "Faça upload dos seus clipes em segundos com validação automática de links." },
  { icon: BarChart3, title: "Métricas em Tempo Real", desc: "Acompanhe views, CPM, ganhos e tendências com gráficos claros." },
  { icon: Trophy, title: "Ranking Competitivo", desc: "Suba no ranking semanal e desbloqueie bônus por performance." },
  { icon: Wallet, title: "Pagamentos via PIX", desc: "Solicite e receba seus pagamentos semanalmente, sem burocracia." },
  { icon: ShieldCheck, title: "Validação Antifraude", desc: "Sistema de revisão e verificação para garantir justiça e qualidade." },
  { icon: HeadphonesIcon, title: "Suporte Humano", desc: "Conte com nossa equipe para tirar dúvidas e resolver problemas." },
];

export default function PanelFeatures() {
  return (
    <section id="recursos" className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-indigo-300">Recursos do Painel</h2>
        <p className="text-gray-300 mt-2">Tudo que você precisa para monetizar seus clipes com eficiência.</p>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
              <div key={f.title} className="group bg-white/5 rounded-xl p-5 border border-white/10 hover:border-indigo-400/30 shadow-sm hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-lg bg-indigo-400/15 text-indigo-300 flex items-center justify-center mb-3 group-hover:bg-indigo-400/25">
                <Icon className="w-6 h-6" />
              </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
