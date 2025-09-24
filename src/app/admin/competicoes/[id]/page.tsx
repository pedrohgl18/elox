import React from 'react';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';
import EditForm from './ui/EditForm';

export const dynamic = 'force-dynamic';

export default async function EditCompetitionPage({ params }: { params: { id: string } }) {
  const c = await db.competition.getById(params.id);
  if (!c) notFound();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Editar competição</h1>
      <p className="text-slate-400 mb-6">Atualize regras, período e status</p>
      <EditForm competition={c} />
    </div>
  );
}
