"use client";

import { Crown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "./Reveal";
import { motion } from "framer-motion";

type Item = { rank: number; name: string; views: string; earnings: string };

const mock: Item[] = [
  { rank: 1, name: "Ana Trends", views: "1.2M", earnings: "R$ 3.4k" },
  { rank: 2, name: "Lucas Viral", views: "980k", earnings: "R$ 2.7k" },
  { rank: 3, name: "Pedro Clipes", views: "770k", earnings: "R$ 2.1k" },
];

export default function LeaderboardPreview() {
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Reveal as="section" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_48px_-32px_rgba(15,23,42,0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Crown className="h-5 w-5 text-amber-500" />Top Clipadores
        </h3>
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
          atualiza a cada 10 min
        </span>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="space-y-3"
      >
        {mock.map((i) => (
          <motion.div
            key={i.rank}
            variants={card}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.45)]"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i.rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-700'
                }`}
              >
                {i.rank}
              </div>
              <Avatar username={i.name} />
              <div>
                <div className="leading-tight font-semibold text-slate-900">{i.name}</div>
                <div className="text-xs text-slate-500">{i.views} views</div>
              </div>
            </div>
            <div className="font-semibold text-emerald-600">{i.earnings}</div>
          </motion.div>
        ))}
      </motion.div>
    </Reveal>
  );
}
