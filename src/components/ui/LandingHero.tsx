'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Clock3, ShieldCheck, Sparkles, Trophy, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ActiveInfo {
  name: string;
  prize: string;
  endsAtLabel: string;
}

interface LandingHeroProps {
  isLogged: boolean;
  activeInfo?: ActiveInfo;
}

const heroStats = [
  { label: 'Pagamentos liberados', value: 'R$ 420k+', detail: 'nos últimos 90 dias' },
  { label: 'Clipadores premiados', value: '3.2k+', detail: 'ativos na comunidade' },
  { label: 'Campanhas mensais', value: '24', detail: 'com bônus exclusivos' },
];

const heroPills = [
  { icon: ShieldCheck, text: 'Validação antifraude em todas as submissões' },
  { icon: Wallet, text: 'Pagamentos semanais via PIX sem taxas' },
];

export function LandingHero({ isLogged, activeInfo }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-indigo-50 px-6 py-14 shadow-xl sm:px-10 lg:px-14">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-[120px]" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),minmax(0,420px)]">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-sky-700 shadow-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Nova Temporada EloX
          </motion.div>

          <div className="space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl"
            >
              A plataforma onde clipes virais viram renda recorrente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-lg text-slate-600 sm:text-xl"
            >
              Participe de competições, acompanhe métricas em tempo real e receba sem burocracia. A EloX conecta seus vídeos às marcas
              que precisam deles.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {isLogged ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-sky-900 px-6 text-base sm:text-lg">
                  Acessar meu dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-sky-900 px-6 text-base sm:text-lg">
                    Criar conta gratuita
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-sky-200 px-6 text-base text-sky-900 sm:text-lg"
                  >
                    Já sou clipador
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {heroPills.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm"
              >
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_30px_60px_-35px_rgba(16,24,40,0.35)] backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Trophy className="h-4 w-4 text-amber-500" />
                Competição em destaque
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-4 px-5 py-6">
              {activeInfo ? (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Campanha atual</p>
                  <h3 className="text-lg font-semibold text-slate-900">{activeInfo.name}</h3>
                  <p className="text-sm text-slate-500">Termina em {activeInfo.endsAtLabel}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Nova campanha</p>
                  <h3 className="text-lg font-semibold text-slate-900">Seja o primeiro a enviar seu clipe</h3>
                  <p className="text-sm text-slate-500">Inscreva-se para receber notificações.</p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl bg-sky-50/80 px-4 py-3 text-sm">
                <span className="text-slate-600">Prêmio total</span>
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-sky-700 shadow">
                  {activeInfo?.prize ?? 'A ser anunciado'}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Melhor vídeo', reward: 'R$ 2.000', trend: '+28% views' },
                  { title: 'Top clipadora', reward: 'R$ 1.200', trend: '+16% inscritos' },
                  { title: 'Destaque da semana', reward: 'R$ 500', trend: '+9% engajamento' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-600"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.trend}</p>
                    </div>
                    <span className="font-semibold text-sky-700">{item.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-6 w-full overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 px-5 py-4 text-sm text-white shadow-2xl sm:absolute sm:-bottom-12 sm:right-6 sm:mt-0 sm:w-[min(340px,42vw)]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Tempo médio</p>
                <p className="text-lg font-semibold">47 min</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <Clock3 className="h-4 w-4 text-white" />
                Aprovação de vídeos
              </div>
            </div>
            <p className="mt-3 text-xs text-white/90">
              Conte com curadoria humana para validar seus clipes e liberar pagamentos em tempo recorde.
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 grid gap-4 sm:grid-cols-3"
      >
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur"
          >
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
