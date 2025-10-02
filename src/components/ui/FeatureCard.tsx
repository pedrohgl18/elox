"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div
      className={`group relative flex min-h-[220px] flex-col justify-start overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-6 text-left shadow-[0_22px_48px_-30px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:shadow-xl ${
        color ?? ''
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <motion.div whileHover={{ rotate: 4, scale: 1.03 }} className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 grow text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
        EloX para criadores
      </div>
    </div>
  );
}
