"use client";
import Link from 'next/link';
import { LogIn, LayoutDashboard, Menu } from 'lucide-react';
import { useState } from 'react';

export default function PublicHeaderClient({ isLogged }: { isLogged: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between bg-black/20 backdrop-blur rounded-xl mt-4">
        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition">
          EloX
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/15 text-white hover:bg-white/10 active:scale-[0.98]"
            aria-label="Menu"
            onClick={() => setIsOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden lg:flex items-center gap-3">
            <Link href="#beneficios" className="text-gray-300 hover:text-white">Benefícios</Link>
            <Link href="#recursos" className="text-gray-300 hover:text-white">Recursos</Link>
            <Link href="#como-funciona" className="text-gray-300 hover:text-white">Como funciona</Link>
            <Link href="#para-quem-e" className="text-gray-300 hover:text-white">Para quem é</Link>
            <Link href="#depoimentos" className="text-gray-300 hover:text-white">Depoimentos</Link>
            {isLogged ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 active:scale-[0.98] transition">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-[0.98] transition">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      {isOpen && (
        <div className="lg:hidden w-full max-w-6xl mx-auto px-3 sm:px-4 mt-2">
          <div className="bg-black/30 backdrop-blur rounded-xl border border-white/10 p-3 flex flex-col gap-2">
            <Link onClick={() => setIsOpen(false)} href="#beneficios" className="px-3 py-2 rounded-md text-gray-200 hover:bg-white/10">Benefícios</Link>
            <Link onClick={() => setIsOpen(false)} href="#recursos" className="px-3 py-2 rounded-md text-gray-200 hover:bg-white/10">Recursos</Link>
            <Link onClick={() => setIsOpen(false)} href="#como-funciona" className="px-3 py-2 rounded-md text-gray-200 hover:bg-white/10">Como funciona</Link>
            <Link onClick={() => setIsOpen(false)} href="#para-quem-e" className="px-3 py-2 rounded-md text-gray-200 hover:bg-white/10">Para quem é</Link>
            <Link onClick={() => setIsOpen(false)} href="#depoimentos" className="px-3 py-2 rounded-md text-gray-200 hover:bg-white/10">Depoimentos</Link>
            {isLogged ? (
              <Link onClick={() => setIsOpen(false)} href="/dashboard" className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 transition">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/auth/login" className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
