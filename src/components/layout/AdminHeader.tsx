"use client";
import React from 'react';
import { LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="px-6 h-full flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-wide text-slate-100">EloX Admin</span>
        </Link>
        <Link href="/auth/logout" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </div>
    </header>
  );
}
