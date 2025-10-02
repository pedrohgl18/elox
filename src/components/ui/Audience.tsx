"use client";

import { Sparkles, Rocket, Users, GraduationCap } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

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
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.title}
            variants={card}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_22px_45px_-30px_rgba(15,23,42,0.45)] transition-colors hover:border-emerald-200"
          >
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ rotate: 8 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{it.title}</h3>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">{it.desc}</p>
              </div>
            </div>
            <div className="mt-auto pt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
              EloX Academy
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
