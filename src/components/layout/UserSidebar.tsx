'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Video, 
  CreditCard, 
  User, 
  Trophy, 
  BarChart3, 
  Upload,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Visão geral'
  },
  {
    label: 'Competições',
    icon: Trophy,
    href: '/dashboard/competitions',
    description: 'Ativas, agendadas e concluídas'
  },
  {
    label: 'Meus Vídeos',
    icon: Video,
    href: '/dashboard/videos',
    description: 'Gerenciar vídeos'
  },
  {
    label: 'Enviar Vídeo',
    icon: Upload,
    href: '/dashboard/upload',
    description: 'Novo envio'
  },
  {
    label: 'Pagamentos',
    icon: Wallet,
    href: '/dashboard/payments',
    description: 'Histórico e solicitações'
  },
  {
    label: 'Ranking',
    icon: Trophy,
    href: '/dashboard/ranking',
    description: 'Posição no ranking'
  },
  {
    label: 'Estatísticas',
    icon: BarChart3,
    href: '/dashboard/stats',
    description: 'Métricas detalhadas'
  },
  {
    label: 'Meu Perfil',
    icon: User,
    href: '/dashboard/profile',
    description: 'Configurações'
  },
];

export function UserSidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`bg-slate-950 border-r border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-600/20 text-slate-100 border-r-2 border-brand-500' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0`} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer do Sidebar */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="bg-gradient-to-r from-brand-500 to-brand-700 text-white p-4 rounded-lg">
              <div className="text-sm font-medium">EloX Pro</div>
              <div className="text-xs opacity-90 mt-1">
                Maximize seus ganhos com recursos exclusivos
              </div>
              <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
                Saiba Mais
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}