"use client";

import type { LucideIcon } from "lucide-react";
import { Upload, BarChart3, Trophy, Wallet, ShieldCheck, HeadphonesIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const features: Feature[] = [
  { icon: Upload, title: "Envio Rápido de Vídeos", desc: "Faça upload dos seus clipes em segundos com validação automática de links." },
  { icon: BarChart3, title: "Métricas em Tempo Real", desc: "Acompanhe views, ganhos e tendências com gráficos claros." },
  { icon: Trophy, title: "Ranking Competitivo", desc: "Suba no ranking semanal e desbloqueie bônus por performance." },
  { icon: Wallet, title: "Pagamentos via PIX", desc: "Solicite e receba seus pagamentos semanalmente, sem burocracia." },
  { icon: ShieldCheck, title: "Validação Antifraude", desc: "Sistema de revisão e verificação para garantir justiça e qualidade." },
  { icon: HeadphonesIcon, title: "Suporte Humano", desc: "Conte com nossa equipe para tirar dúvidas e resolver problemas." },
];

export default function PanelFeatures() {
  return (
    <section id="recursos" className="py-16">
      <div className="text-center mb-10">
        <Reveal delay={0.1}>
          <h2 className="text-3xl font-extrabold text-slate-900">Recursos do Painel</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-slate-600 mt-2">
            Tudo que você precisa para monetizar seus clipes com eficiência.
          </p>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, index) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={0.1 * index}>
              <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-600 group-hover:bg-sky-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
