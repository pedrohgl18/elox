"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Video, Wallet, Settings, ShieldCheck, BarChart3, CheckCircle, XCircle, Trophy } from 'lucide-react';

const items = [
  { label: 'Visão Geral', href: '/admin', icon: Home, desc: 'KPIs do sistema' },
  { label: 'Competições', href: '/admin/competicoes', icon: Trophy, desc: 'Campanhas' },
  { label: 'Clipadores', href: '/admin/clipadores', icon: Users, desc: 'Gerenciar usuários' },
  { label: 'Vídeos', href: '/admin/videos', icon: Video, desc: 'Moderar envios' },
  { label: 'Pagamentos', href: '/admin/pagamentos', icon: Wallet, desc: 'Processar saques' },
  { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3, desc: 'Métricas' },
  { label: 'Configurações', href: '/admin/config', icon: Settings, desc: 'Sistema' },
];

export function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className={`${mobile ? 'block' : 'hidden md:block'} bg-slate-950 border-r border-slate-800 w-64`}>
      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active ? 'bg-brand-600/20 text-slate-100 border-r-2 border-brand-500' : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-100">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
