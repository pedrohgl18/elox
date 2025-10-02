import { FeatureCard } from '@/components/ui/FeatureCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { StatCard } from '@/components/ui/StatCard';
import { FAQ } from '@/components/ui/FAQ';
import Link from 'next/link';
import { GaugeCircle, LineChart, Megaphone, PlayCircle, Trophy, Users } from 'lucide-react';
import PanelFeatures from '@/components/ui/PanelFeatures';
import Audience from '@/components/ui/Audience';
import CompetitionBanner from '@/components/ui/CompetitionBanner';
import { db } from '@/lib/database';
import { Competition } from '@/lib/types';
import LeaderboardPreview from '@/components/ui/LeaderboardPreview';
import RewardsBreakdown from '@/components/ui/RewardsBreakdown';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import ViralMeter from '@/components/ui/ViralMeter';
import { Reveal } from '@/components/ui/Reveal';
import { LandingHero } from '@/components/ui/LandingHero';
import { Button } from '@/components/ui/Button';

export default async function LandingPage() {
  const session: any = await getServerSession(authOptions as any);
  const isLogged = !!session?.user;
  const comps: Competition[] = await db.competition.list();
  const now = Date.now();
  const active = comps.find((c: Competition) => now >= c.startDate.getTime() && now <= c.endDate.getTime() && c.isActive);
  const activePrize = active?.rewards?.reduce((sum, reward) => sum + reward.amount, 0);
  const activeInfo = active
    ? {
        name: active.name,
        prize: activePrize && activePrize > 0 ? `R$ ${activePrize.toLocaleString('pt-BR')}` : '—',
        endsAtLabel: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(active.endDate),
      }
    : undefined;

  const differentiators = [
    {
      icon: Trophy,
      title: 'Ranking em tempo real',
      description: 'Atualizamos o ranking a cada 10 minutos com métricas unificadas das principais redes sociais.',
    },
    {
      icon: LineChart,
      title: 'Inteligência de desempenho',
      description: 'Painéis com previsões de CPM, alertas de tendências e benchmarks por nicho.',
    },
    {
      icon: Megaphone,
      title: 'Campanhas com verba garantida',
      description: 'Marcas conectadas à EloX financiam premiações e boosts temáticos toda semana.',
    },
    {
      icon: GaugeCircle,
      title: 'Pagamentos confiáveis',
      description: 'Pagamentos automáticos via PIX com auditoria antifraude e recibos organizados.',
    },
  ];

  const workflow = [
    {
      step: '1',
      title: 'Conecte suas contas',
      description: 'Integre TikTok, Instagram, Kwai e YouTube em minutos para importar métricas oficiais.',
      hint: 'Integrações OAuth seguras e com atualização automática de dados.',
    },
    {
      step: '2',
      title: 'Envie clipes campeões',
      description: 'Use nosso checklist para garantir cortes otimizados para cada rede e evitar rejeições.',
      hint: 'Validação automática de links, duração ideal e direitos autorais.',
    },
    {
      step: '3',
      title: 'Suba no ranking EloX',
      description: 'Acompanhe sua posição ao vivo, desbloqueie boosts e receba feedback da comunidade.',
      hint: 'Ranking por nicho, região e plataforma com bônus progressivos.',
    },
    {
      step: '4',
      title: 'Receba e reinvista',
      description: 'Solicite pagamentos com um clique, exporte relatórios e planeje seus próximos envios.',
      hint: 'Pagamentos aprovados em horas e histórico completo para contabilidade.',
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <PublicHeader />
      <div className="flex w-full grow flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pb-20 pt-12 sm:px-6 md:px-8">
          <LandingHero isLogged={isLogged} activeInfo={activeInfo} />

          <section id="beneficios" className="space-y-10">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal delay={0.05}>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Por que o ecossistema EloX funciona?</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-3 text-lg text-slate-600">
                  Uma camada completa de tecnologia, comunidade e monetização criada especificamente para clipadores profissionais.
                </p>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {differentiators.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={0.05 * (index + 1)}>
                  <FeatureCard
                    icon={<Icon className="h-7 w-7" />}
                    title={title}
                    description={description}
                    color="group"
                  />
                </Reveal>
              ))}
            </div>
          </section>

          <section id="como-funciona" className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 px-6 py-12 shadow-xl sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,320px),minmax(0,1fr)]">
              <div className="space-y-4">
                <Reveal delay={0.05}>
                  <h2 className="text-3xl font-bold text-slate-900">Seu fluxo em 4 etapas</h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="text-slate-600">
                    Do onboarding ao recebimento, o EloX cuida da operação para você focar no que importa: clipes que convertem.
                  </p>
                </Reveal>
                <Reveal delay={0.15}>
                  <Link href="#cta" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900">
                    Ver planos de monetização
                    <PlayCircle className="h-4 w-4" />
                  </Link>
                </Reveal>
              </div>
              <div className="relative">
                <div className="absolute left-[18px] top-5 bottom-5 hidden md:block w-px rounded-full bg-gradient-to-b from-sky-200 via-slate-200 to-transparent" />
                <div className="space-y-6">
                  {workflow.map(({ step, title, description, hint }, index) => (
                    <Reveal key={title} delay={0.05 * (index + 1)}>
                      <article className="grid gap-4 rounded-3xl border border-slate-100 bg-white/90 px-5 py-5 shadow-sm backdrop-blur md:grid-cols-[56px,1fr]">
                        <div className="flex items-start gap-3 md:flex-col md:items-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-base font-semibold text-sky-700">
                            {step}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                          <p className="text-sm text-slate-600">{description}</p>
                          <p className="text-xs font-medium text-slate-400">{hint}</p>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Reveal delay={0.05}>
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
                  {active ? (
                    <CompetitionBanner name={active.name} endsAt={active.endDate} prize={activePrize && activePrize > 0 ? `R$ ${activePrize.toLocaleString('pt-BR')}` : '—'} />
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900">Nova temporada chegando</h3>
                      <p className="text-slate-600">
                        Estamos preparando a próxima campanha com marcas parceiras. Cadastre-se para ser avisado em primeira mão.
                      </p>
                      <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                        Quero ser avisado
                        <PlayCircle className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
                  <LeaderboardPreview />
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
                <RewardsBreakdown />
              </div>
            </Reveal>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 px-6 py-12 text-white shadow-xl sm:px-10" id="suite">
            <Reveal delay={0.05}>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">O painel EloX é o seu QG de crescimento</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 max-w-2xl text-slate-200">
                Métricas, envios, financeiro e relacionamento com marcas, tudo no mesmo lugar. Personalize o painel com widgets e alertas
                que fazem sentido para o seu fluxo.
              </p>
            </Reveal>
            <div className="mt-10 rounded-[32px] border border-white/15 bg-white/10 p-1 backdrop-blur">
              <div className="rounded-[28px] bg-white/95 text-slate-900">
                <PanelFeatures />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4" id="metricas">
            <Reveal delay={0.05}>
              <StatCard label="Clipadores ativos" value="3.2k+" accentClass="border-white/10" />
            </Reveal>
            <Reveal delay={0.1}>
              <StatCard label="Vídeos monetizados" value="120k+" accentClass="border-white/10" />
            </Reveal>
            <Reveal delay={0.15}>
              <StatCard label="Pagamentos processados" value="R$ 420k+" accentClass="border-white/10" />
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                <ViralMeter />
              </div>
            </Reveal>
          </section>

          <section id="depoimentos" className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal delay={0.05}>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">A comunidade que cresce junto</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-3 text-lg text-slate-600">
                  Clipadores em todo o Brasil transformando clipes em negócios sustentáveis com a EloX.
                </p>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Reveal delay={0.1}>
                <TestimonialCard
                  name="Lucas Viral"
                  text="A EloX mudou minha vida! Agora meus vídeos geram retorno e tenho apoio de uma comunidade incrível."
                  social="@lucasviral (TikTok)"
                />
              </Reveal>
              <Reveal delay={0.15}>
                <TestimonialCard
                  name="Ana Trends"
                  text="O ranking me motiva e os pagamentos são rápidos. Recomendo para todo criador!"
                  social="@anatrends (Instagram)"
                />
              </Reveal>
              <Reveal delay={0.2}>
                <TestimonialCard
                  name="Pedro Clipes"
                  text="Plataforma simples, transparente e com suporte excelente. EloX é o futuro dos clipes!"
                  social="@pedroclipes (Kwai)"
                />
              </Reveal>
            </div>
          </section>

          <section id="para-quem-e" className="space-y-6">
            <Reveal delay={0.05}>
              <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">Para quem é a EloX?</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-lg">
                <Audience />
              </div>
            </Reveal>
          </section>

          <section className="space-y-6" id="faq">
            <Reveal delay={0.05}>
              <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">Perguntas frequentes</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <FAQ
                items={[
                  {
                    q: 'Como eu ganho dinheiro na EloX?',
                    a: 'Envie seus vídeos, participe das campanhas e receba de acordo com as regras e visualizações. Os pagamentos são solicitados via PIX.',
                  },
                  {
                    q: 'Preciso pagar para participar?',
                    a: 'Não. Criar conta e usar a plataforma é gratuito para clipadores registrados.',
                  },
                  {
                    q: 'Quando recebo meus pagamentos?',
                    a: 'Pagamentos são processados semanalmente e você acompanha tudo pelo painel com transparência.',
                  },
                ]}
              />
            </Reveal>
          </section>

          <section id="cta" className="rounded-[32px] border border-sky-200 bg-gradient-to-br from-sky-100 via-white to-indigo-50 px-6 py-12 text-center shadow-xl sm:px-10">
            <Reveal delay={0.05}>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Pronto para lançar sua próxima virada?</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 text-lg text-slate-600">
                Cadastre-se agora e libere o acesso ao painel, campanhas patrocinadas e comunidade EloX Academy.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {isLogged ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-base font-semibold text-white shadow-lg hover:brightness-110"
                    >
                      Ir para o dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-base font-semibold text-white shadow-lg hover:brightness-110"
                      >
                        Criar conta gratuita
                      </Button>
                    </Link>
                    <Link href="/auth/login" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-slate-200 bg-white text-base font-semibold text-sky-900 shadow hover:bg-white/70"
                      >
                        Já tenho conta
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Reveal>
          </section>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
