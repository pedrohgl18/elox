"use client";
import Link from 'next/link';
import { LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicHeaderClient({ isLogged }: { isLogged: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-sky-900/95 text-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            EloX
          </Link>
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 active:scale-[0.98] transition"
              aria-label="Menu"
              onClick={() => setIsOpen((v) => !v)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
              <Link href="#beneficios" className="hover:text-sky-100 transition">Benefícios</Link>
              <Link href="#recursos" className="hover:text-sky-100 transition">Recursos</Link>
              <Link href="#como-funciona" className="hover:text-sky-100 transition">Como funciona</Link>
              <Link href="#para-quem-e" className="hover:text-sky-100 transition">Para quem é</Link>
              <Link href="#depoimentos" className="hover:text-sky-100 transition">Depoimentos</Link>
              {isLogged ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sky-900 shadow hover:bg-sky-50 transition"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 hover:bg-white/10 transition"
                >
                  <LogIn className="h-4 w-4" /> Entrar
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 text-slate-700 text-sm font-medium">
              <Link onClick={() => setIsOpen(false)} href="#beneficios" className="rounded-lg px-3 py-2 hover:bg-sky-50">Benefícios</Link>
              <Link onClick={() => setIsOpen(false)} href="#recursos" className="rounded-lg px-3 py-2 hover:bg-sky-50">Recursos</Link>
              <Link onClick={() => setIsOpen(false)} href="#como-funciona" className="rounded-lg px-3 py-2 hover:bg-sky-50">Como funciona</Link>
              <Link onClick={() => setIsOpen(false)} href="#para-quem-e" className="rounded-lg px-3 py-2 hover:bg-sky-50">Para quem é</Link>
              <Link onClick={() => setIsOpen(false)} href="#depoimentos" className="rounded-lg px-3 py-2 hover:bg-sky-50">Depoimentos</Link>
              {isLogged ? (
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/dashboard"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-sky-900 px-4 py-2 text-white shadow hover:bg-sky-800"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              ) : (
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/auth/login"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="h-4 w-4" /> Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
