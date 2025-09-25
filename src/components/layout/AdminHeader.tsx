"use client";
import React from 'react';
import { LogOut, Shield, Menu } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botão menu mobile */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-wide text-slate-100">EloX Admin</span>
          </Link>
        </div>
        <Link href="/auth/logout" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </div>
    </header>
  );
}
