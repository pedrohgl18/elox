"use client";

import { motion } from 'framer-motion';
import React from 'react';

interface HeroProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function Hero({ title, description, children }: HeroProps) {
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 text-center rounded-3xl mb-10 sm:mb-12 overflow-hidden bg-gradient-to-br from-sky-100 via-white to-blue-50">
      <div className="absolute -top-24 -right-10 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-900 text-white text-xs sm:text-sm font-medium shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Plataforma para Clipadores
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mt-5 mb-4 leading-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3"
        >
          {children}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-[11px] sm:text-xs text-slate-500"
        >
          Sem taxa de cadastro • Pagamentos semanais via PIX • Suporte humano
        </motion.div>
      </div>
    </section>
  );
}
