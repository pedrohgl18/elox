"use client";

import { Sparkles, Rocket, Users, GraduationCap } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Criadores iniciantes",
    desc: "Aprenda rápido e monetize desde os primeiros vídeos com uma curva de aprendizado amigável.",
  },
  {
    icon: Rocket,
    title: "Clipadores avançados",
    desc: "Escale seu alcance, participe de rankings e maximize ganhos com métricas detalhadas.",
  },
  {
    icon: Users,
    title: "Times e agências",
    desc: "Gerencie múltiplos criadores, acompanhe performance e centralize pagamentos.",
  },
  {
    icon: GraduationCap,
    title: "Quem quer aprender",
    desc: "Conteúdo educativo, boas práticas e suporte humano para evoluir no jogo dos clipes.",
  },
];

export default function Audience() {
  return (
    <section id="para-quem-e" className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight">
            Para quem é a EloX?
          </h2>
          <p className="text-slate-300 mt-3 sm:mt-4 text-base sm:text-lg">
            Se você cria ou gerencia clipes, a EloX foi feita para você.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="bg-white/5 rounded-xl p-5 sm:p-6 border border-white/10 hover:border-emerald-400/30 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-400/10 text-emerald-300 flex items-center justify-center">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-base sm:text-lg">{it.title}</h3>
                  <p className="text-sm sm:text-base text-slate-300 mt-1">{it.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
