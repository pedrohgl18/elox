'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  accentClass?: string;
}

export function StatCard({ icon, label, value, accentClass }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_24px_45px_-30px_rgba(15,23,42,0.45)] ${
        accentClass ?? ''
      }`}
    >
      {icon && (
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 6 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 rounded-2xl bg-sky-100 p-3 text-sky-600"
        >
          {icon}
        </motion.div>
      )}
      <div>
        <div className="text-3xl font-extrabold leading-tight text-slate-900">{value}</div>
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
      </div>
    </motion.div>
  );
}
