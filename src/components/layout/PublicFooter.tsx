'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Instagram, Youtube, Send } from 'lucide-react';

const footerLinks = [
  { label: 'Política de Privacidade', href: '/terms' },
  { label: 'Termos de Uso', href: '/terms' },
  { label: 'Ranking', href: '/ranking' },
];

const socials = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Send, href: 'mailto:contato@elox.gg', label: 'Contato' },
];

export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/90 text-sm text-slate-600 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-500" /> EloX Academy
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Entre na comunidade que transforma clipes em carreira.
            </h3>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} className="w-full sm:w-auto">
            <Link
              href="/auth/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 sm:w-auto"
            >
              Criar conta agora
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="space-y-4"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
              EloX
            </Link>
            <p className="max-w-sm text-sm text-slate-600">
              EloX é o ecossistema completo para clipadores profissionais conquistarem marca, audiência e renda previsível.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -4 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
            className="grid gap-6 text-sm text-slate-600 sm:grid-cols-2"
          >
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Navegação</h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-slate-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Comunidade</h4>
              <p className="text-sm text-slate-600">
                Receba drops semanais com briefs de marcas, tendências e desafios da EloX.
              </p>
              <a
                href="mailto:contato@elox.gg"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
              >
                contato@elox.gg
              </a>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} EloX. Todos os direitos reservados.</span>
          <span>Construído para clipadores visionários.</span>
        </div>
      </div>
    </footer>
  );
}
