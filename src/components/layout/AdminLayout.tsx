"use client";
import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { X } from 'lucide-react';

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader onOpenMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Drawer Mobile */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] h-full bg-slate-950 border-r border-slate-800 shadow-xl animate-[slideIn_.2s_ease-out]">
            <button
              aria-label="Fechar menu"
              className="absolute top-3 right-3 rounded-full p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pt-10">
              <AdminSidebar mobile />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
