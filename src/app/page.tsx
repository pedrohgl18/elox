import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
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

export default async function LandingPage() {
  const session: any = await getServerSession(authOptions as any);
  const isLogged = !!session?.user;
  const comps: Competition[] = await db.competition.list();
  const now = Date.now();
  const active = comps.find((c: Competition) => now >= c.startDate.getTime() && now <= c.endDate.getTime() && c.isActive);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-black flex flex-col items-center px-4">
      <PublicHeader />
      <Hero
        title="EloX: Monetize seus vídeos, dispute rankings e faça parte da comunidade!"
        description="O ecossistema completo para criadores de conteúdo de vídeo. Transforme seus clipes em ganhos reais, participe de competições e eventos, e conquiste seu espaço no ranking dos melhores clipadores."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {isLogged ? (
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto text-lg px-8 py-3">Ir para o Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button className="w-full sm:w-auto text-lg px-8 py-3">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-3">Criar Conta</Button>
              </Link>
            </>
          )}
        </div>
      </Hero>

      {/* Benefícios */}
  <section id="beneficios" className="w-full max-w-7xl mx-auto grid gap-6 sm:gap-8 md:grid-cols-3 mb-16 px-2 sm:px-4">
        <FeatureCard
          icon={<Trophy className="h-8 w-8 text-yellow-500" />}
          title="Ranking e Competições"
          description="Dispute posições, conquiste prêmios mensais e participe de eventos exclusivos para os melhores clipadores."
          color="border-yellow-200"
        />
        <FeatureCard
          icon={<PlayCircle className="h-8 w-8 text-indigo-500" />}
          title="Monetização Real"
          description="Receba por cada mil visualizações, acompanhe seus ganhos e solicite pagamentos direto pelo painel."
          color="border-indigo-200"
        />
        <FeatureCard
          icon={<Users className="h-8 w-8 text-green-500" />}
          title="Comunidade Clipadora"
          description="Troque experiências, participe de grupos, eventos e evolua junto com outros criadores."
          color="border-green-200"
        />
      </section>

      {/* Competição Atual */}
      {active && (
        <section className="w-full max-w-7xl mx-auto mb-8 px-2 sm:px-4">
          <CompetitionBanner name={active.name} endsAt={active.endDate} prize={(active.rewards?.length ? `R$ ${active.rewards.reduce((sum: number, r: any) => sum + (r.amount||0), 0).toLocaleString('pt-BR')}` : '—')} cpm={active.rules?.cpm} />
        </section>
      )}

      {/* Leaderboard Preview + Rewards */}
      <section className="w-full max-w-7xl mx-auto mb-12 px-2 sm:px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LeaderboardPreview />
        </div>
        <div>
          <RewardsBreakdown />
        </div>
      </section>

      {/* Recursos do Painel */}
      <section className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <PanelFeatures />
      </section>

      {/* Como funciona */}
  <section id="como-funciona" className="w-full max-w-6xl mx-auto mb-16 px-2 sm:px-4">
  <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center">Como funciona?</h2>
        <div className="grid gap-6 md:grid-cols-4">
          <StepCard step={1} title="Cadastre-se" description="Crie sua conta e acesse o painel exclusivo para clipadores." />
          <StepCard step={2} title="Envie seus vídeos" description="Publique clipes virais das redes sociais e acompanhe suas métricas." />
          <StepCard step={3} title="Participe de rankings" description="Dispute posições, ganhe prêmios e destaque-se na comunidade." />
          <StepCard step={4} title="Receba seus ganhos" description="Solicite pagamentos via PIX e acompanhe seu histórico de ganhos." />
        </div>
      </section>

      {/* Depoimentos */}
  <section id="depoimentos" className="w-full max-w-6xl mx-auto mb-16 px-2 sm:px-4">
  <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center">Depoimentos de Clipadores</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <TestimonialCard
            name="Lucas Viral"
            text="A EloX mudou minha vida! Agora meus vídeos realmente me trazem retorno e ainda faço parte de uma comunidade incrível."
            social="@lucasviral (TikTok)"
          />
          <TestimonialCard
            name="Ana Trends"
            text="O sistema de ranking é motivador e os pagamentos são rápidos. Recomendo para todo criador!"
            social="@anatrends (Instagram)"
          />
          <TestimonialCard
            name="Pedro Clipes"
            text="A plataforma é fácil de usar, transparente e tem suporte excelente. EloX é o futuro dos clipes!"
            social="@pedroclipes (Kwai)"
          />
        </div>
      </section>

      {/* Estatísticas rápidas */}
      <section className="w-full max-w-7xl mx-auto mb-16 px-2 sm:px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Clipadores ativos" value="3.2k+" accentClass="border-indigo-200" />
          <StatCard label="Vídeos enviados" value="120k+" accentClass="border-yellow-200" />
          <StatCard label="Pagamentos processados" value="R$ 420k+" accentClass="border-green-200" />
        </div>
      </section>

      {/* Viral Meter */}
      <section className="w-full max-w-7xl mx-auto mb-12 flex items-center justify-center px-2 sm:px-4">
        <ViralMeter />
      </section>

      {/* Para quem é */}
      <section className="w-full max-w-7xl mx-auto mb-4 px-2 sm:px-4">
        <Audience />
      </section>

      {/* FAQ */}
      <section className="w-full max-w-6xl mx-auto mb-16 px-2 sm:px-4">
  <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center">Perguntas Frequentes</h2>
        <FAQ
          items={[
            { q: 'Como eu ganho dinheiro na EloX?', a: 'Você envia seus vídeos e recebe com base em visualizações e regras das competições. Solicite pagamentos via PIX no painel.' },
            { q: 'Preciso pagar para participar?', a: 'Não. Criar conta e usar a plataforma é gratuito para clipadores.' },
            { q: 'Quando recebo meus pagamentos?', a: 'Pagamentos são processados semanalmente. Você acompanha e solicita diretamente no painel.' },
          ]}
        />
      </section>

      {/* Call to Action */}
  <section className="w-full py-12 text-center bg-white/5 border border-white/10 rounded-xl mb-8 px-2 sm:px-4">
    <h2 className="text-3xl font-bold text-indigo-300 mb-4">Pronto para monetizar seus vídeos?</h2>
    <p className="text-gray-300 mb-6">Junte-se à EloX e transforme seu conteúdo em ganhos reais. Comece agora e faça parte do ranking dos melhores!</p>
        {isLogged ? (
          <Link href="/dashboard">
            <Button size="lg" className="px-10 py-4 text-xl">Ir para o Dashboard</Button>
          </Link>
        ) : (
          <Link href="/auth/register">
            <Button size="lg" className="px-10 py-4 text-xl">Criar Conta Grátis</Button>
          </Link>
        )}
      </section>

      <PublicFooter />
    </main>
  );
}
