import React from 'react';
import { db } from '@/lib/database';
import { Competition } from '@/lib/types';
import { formatDateShort } from '@/lib/format';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { config } from '@/lib/config';
import { UserLayout } from '@/components/layout/UserLayout';
import { CompetitionEnrollButton } from '@/components/user/CompetitionEnrollButton';

export const dynamic = 'force-dynamic';

export default async function UserCompetitionsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);

  let user = await db.auth.getById((session.user as any).id as string);
  if (!user) user = await db.auth.getByIdOrEmail((session.user as any).email as string);
  if (!user) redirect(config.urls.login);

  const comps: Competition[] = await db.competition.list();
  const now = Date.now();
  const byStatus: Record<'ACTIVE'|'SCHEDULED'|'COMPLETED', Competition[]> = {
    ACTIVE: comps.filter((c: Competition) => now >= c.startDate.getTime() && now <= c.endDate.getTime()),
    SCHEDULED: comps.filter((c: Competition) => now < c.startDate.getTime()),
    COMPLETED: comps.filter((c: Competition) => now > c.endDate.getTime()),
  };

  const Section = ({ title, items }: { title: string; items: typeof comps }) => (
    <section>
      <h2 className="text-lg font-semibold text-slate-100 mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="text-slate-400 text-sm border border-slate-800 bg-slate-900/60 rounded-lg p-4">Nada por aqui.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c: Competition) => (
            <div key={c.id} className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex gap-4">
              {c.bannerImageUrl ? (
                <img src={c.bannerImageUrl} alt={c.name} className="h-16 w-28 object-cover rounded-lg border border-slate-800" />
              ) : (
                <div className="h-16 w-28 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 text-xs">Sem imagem</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-slate-100 font-semibold truncate">{c.name}</div>
                <div className="text-slate-400 text-sm truncate">{c.description || '—'}</div>
                <div className="text-slate-400 text-xs mt-1">{formatDateShort(c.startDate)} → {formatDateShort(c.endDate)} • CPM R$ {c.rules.cpm.toFixed(2)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <Link href={`/competicoes/${c.id}`} className="text-brand-400 hover:text-brand-300 text-sm">Ver detalhes</Link>
                  {(c.status === 'ACTIVE' || c.status === 'SCHEDULED') && (
                    <CompetitionEnrollButton competitionId={c.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <UserLayout username={user.username} email={user.email}>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Competições</h1>
          <p className="text-slate-400">Veja competições abertas, concluídas e agendadas</p>
        </div>

        <Section title="Abertas" items={byStatus.ACTIVE} />
        <Section title="Agendadas" items={byStatus.SCHEDULED} />
        <Section title="Concluídas" items={byStatus.COMPLETED} />
      </div>
    </UserLayout>
  );
}
