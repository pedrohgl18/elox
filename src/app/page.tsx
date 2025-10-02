import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { Hero } from '@/components/ui/Hero';
import { StepCard } from '@/components/ui/StepCard';
import { StatCard } from '@/components/ui/StatCard';
import { FAQ } from '@/components/ui/FAQ';
import Link from 'next/link';
import { Trophy, Users, PlayCircle } from 'lucide-react';
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

export default async function LandingPage() {
  const session: any = await getServerSession(authOptions as any);
  const isLogged = !!session?.user;
  const comps: Competition[] = await db.competition.list();
  const now = Date.now();
  const active = comps.find((c: Competition) => now >= c.startDate.getTime() && now <= c.endDate.getTime() && c.isActive);
  const activePrize = active?.rewards?.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader />
      <div className="flex w-full grow flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-16 pt-10 sm:px-6 md:px-8">
          <Hero
            title="EloX: Monetize seus vídeos, dispute rankings e brilhe na comunidade!"
            description="O ecossistema completo para criadores de conteúdo. Transforme seus clipes em ganhos reais, participe de competições e conquiste seu espaço no ranking EloX."
          >
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isLogged ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button className="w-full bg-sky-900 text-base sm:text-lg" size="lg">
                    Ir para o Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="w-full sm:w-auto">
                    <Button className="w-full bg-sky-900 text-base sm:text-lg" size="lg">
                      Criar conta grátis
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full border-sky-200 text-base text-sky-900 sm:text-lg" size="lg">
                      Entrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Hero>

          <section id="beneficios" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal delay={0.05}>
              <FeatureCard
                icon={<Trophy className="h-8 w-8" />}
                title="Ranking e competições"
                description="Suba posições, dispute prêmios mensais e participe de eventos exclusivos para os melhores clipadores."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <FeatureCard
                icon={<PlayCircle className="h-8 w-8" />}
                title="Monetização real"
                description="Receba por visualizações e premiações, acompanhe seus ganhos e solicite pagamentos direto pelo painel."
              />
            </Reveal>
            <Reveal delay={0.15}>
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Comunidade clipadora"
                description="Troque experiências, participe de grupos e evolua com outros criadores apaixonados por clipes."
              />
            </Reveal>
          </section>

          {active && (
            <Reveal as="section" className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <CompetitionBanner
                name={active.name}
                endsAt={active.endDate}
                prize={activePrize && activePrize > 0 ? `R$ ${activePrize.toLocaleString('pt-BR')}` : '—'}
              />
            </Reveal>
          )}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <LeaderboardPreview />
            </div>
            <RewardsBreakdown />
          </section>

          <PanelFeatures />

          <section id="como-funciona" className="space-y-6">
            <div className="text-center">
              <Reveal delay={0.1}>
                <h2 className="text-3xl font-bold text-slate-900">Como funciona?</h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-2 text-slate-600">
                  Em quatro passos simples você começa a monetizar seus clipes e participar do ranking EloX.
                </p>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((step) => {
                const copy = [
                  {
                    title: 'Cadastre-se',
                    description: 'Crie sua conta e acesse o painel exclusivo para clipadores.',
                  },
                  {
                    title: 'Envie seus vídeos',
                    description: 'Publique clipes virais e acompanhe métricas em tempo real.',
                  },
                  {
                    title: 'Participe de rankings',
                    description: 'Dispute posições, desbloqueie bônus e ganhe visibilidade.',
                  },
                  {
                    title: 'Receba seus ganhos',
                    description: 'Solicite pagamentos via PIX e tenha histórico transparente.',
                  },
                ][step - 1];

                return (
                  <Reveal key={step} delay={0.05 * step}>
                    <StepCard step={step} title={copy.title} description={copy.description} />
                  </Reveal>
                );
              })}
            </div>
          </section>

          <section id="depoimentos" className="space-y-6">
            <div className="text-center">
              <Reveal delay={0.1}>
                <h2 className="text-3xl font-bold text-slate-900">Depoimentos de clipadores</h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-2 text-slate-600">Histórias reais de quem já está faturando com a EloX.</p>
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

          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Reveal delay={0.1}>
                <StatCard label="Clipadores ativos" value="3.2k+" accentClass="border-sky-100" />
              </Reveal>
              <Reveal delay={0.15}>
                <StatCard label="Vídeos enviados" value="120k+" accentClass="border-emerald-100" />
              </Reveal>
              <Reveal delay={0.2}>
                <StatCard label="Pagamentos processados" value="R$ 420k+" accentClass="border-indigo-100" />
              </Reveal>
            </div>
            <div className="flex justify-center">
              <Reveal>
                <ViralMeter />
              </Reveal>
            </div>
          </section>

          <section id="para-quem-e" className="space-y-6">
            <Reveal delay={0.1}>
              <h2 className="text-center text-3xl font-bold text-slate-900">Para quem é a EloX?</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Audience />
              </div>
            </Reveal>
          </section>

          <section className="space-y-6">
            <Reveal delay={0.1}>
              <h2 className="text-center text-3xl font-bold text-slate-900">Perguntas frequentes</h2>
            </Reveal>
            <Reveal delay={0.15}>
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

          <section className="rounded-3xl border border-sky-100 bg-sky-100/60 px-6 py-10 text-center shadow-sm">
            <Reveal delay={0.1}>
              <h2 className="text-3xl font-bold text-sky-900">Pronto para monetizar seus vídeos?</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-3 text-slate-700">
                Junte-se à EloX e transforme seus clipes em ganhos reais. Comece agora e entre para o ranking dos melhores!
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {isLogged ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-sky-900 px-8 text-lg">
                      Ir para o Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full bg-sky-900 px-8 text-lg">
                        Criar conta grátis
                      </Button>
                    </Link>
                    <Link href="/auth/login" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-sky-200 px-8 text-lg text-sky-900"
                      >
                        Acessar minha conta
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
