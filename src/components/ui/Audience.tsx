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
    <section id="para-quem-e" className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-indigo-300">Para quem é a EloX?</h2>
        <p className="text-gray-300 mt-2">Se você cria ou gerencia clipes, a EloX foi feita para você.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-indigo-400/30 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-400/15 text-indigo-300 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{it.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{it.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
