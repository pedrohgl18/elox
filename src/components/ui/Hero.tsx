import React from 'react';

interface HeroProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function Hero({ title, description, children }: HeroProps) {
  return (
    <section className="relative w-full py-16 text-center rounded-2xl mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-indigo-200 mb-4">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
          Plataforma para Clipadores
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent mb-4 drop-shadow-lg leading-tight px-4">{title}</h1>
        <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto px-4">{description}</p>
        <div className="flex items-center justify-center gap-3">{children}</div>
        <div className="mt-4 text-xs text-gray-400">Sem taxa de cadastro • Pagamentos semanais via PIX • Suporte humano</div>
      </div>
    </section>
  );
}
