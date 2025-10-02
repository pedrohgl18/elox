"use client";

import { Sparkles, Rocket, Users, GraduationCap } from "lucide-react";
import clsx from "clsx";

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

interface AudienceProps {
  className?: string;
}

export default function Audience({ className }: AudienceProps) {
  return (
    <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.title}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-200 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{it.title}</h3>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">{it.desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
