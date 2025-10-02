"use client";
import Link from 'next/link';
import { LogIn, LayoutDashboard, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Suite EloX', href: '#suite' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Para quem é', href: '#para-quem-e' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
];

export default function PublicHeaderClient({ isLogged }: { isLogged: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 text-slate-900 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="relative inline-flex items-center gap-3">
            <motion.span
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              EloX
            </motion.span>
            <span className="hidden rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white md:inline-flex">
              Live
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex">
              {links.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative overflow-hidden rounded-full px-3 py-2 transition-colors hover:text-sky-700"
                >
                  {label}
                  <span className="pointer-events-none absolute inset-x-2 bottom-1 h-1 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              {isLogged ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogIn className="h-4 w-4" /> Entrar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                  >
                    <Sparkles className="h-4 w-4" /> Criar conta
                  </Link>
                </>
              )}
            </div>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-white/70 active:scale-[0.98] lg:hidden"
              aria-label="Menu"
              onClick={() => setIsOpen((v) => !v)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-sm font-semibold">
              {links.map(({ label, href }) => (
                <Link
                  key={href}
                  onClick={() => setIsOpen(false)}
                  href={href}
                  className="rounded-xl px-3 py-2 transition hover:bg-sky-50"
                >
                  {label}
                </Link>
              ))}

              <div className="mt-2 grid gap-2">
                {isLogged ? (
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-5 py-2 text-white shadow-lg"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/auth/login"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <LogIn className="h-4 w-4" /> Entrar
                    </Link>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/auth/register"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-5 py-2 text-white shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" /> Criar conta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
