'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from './NotificationBell';

interface UserHeaderProps {
  username: string;
  email: string;
}

export function UserHeader({ username, email }: UserHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    // Redireciona para a landing sem depender de localhost
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 text-slate-100">
      <div className="flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 rounded-lg font-bold text-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow">
            EloX
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard do Clipador</h1>
        </div>

        {/* Menu do Usuário */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <NotificationBell />

          {/* Dropdown do Usuário */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Avatar username={username} size="sm" />
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-slate-100">{username}</div>
                <div className="text-xs text-slate-400">{email}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="text-sm font-medium text-slate-100">{username}</div>
                  <div className="text-xs text-slate-400">{email}</div>
                </div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </button>
                
                <hr className="my-2" />
                
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/30 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}