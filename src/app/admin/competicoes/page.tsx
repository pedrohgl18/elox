import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/database';
import { formatDateShort } from '@/lib/format';
import { Plus, Pencil, Eye } from 'lucide-react';
import { Competition } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCompeticoesPage() {
  const list: Competition[] = await db.competition.list();

  const now = Date.now();
  const statusOf = (start: Date, end: Date) => {
    if (now < start.getTime()) return 'SCHEDULED';
    if (now > end.getTime()) return 'COMPLETED';
    return 'ACTIVE';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Campanhas / Competições</h1>
          <p className="text-slate-400">Gerencie as competições dos clipadores</p>
        </div>
        <Link href="/admin/competicoes/nova" className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-10 px-4">
          <Plus className="h-4 w-4 mr-2"/> Nova competição
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {list.length === 0 && (
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 text-slate-300">Nenhuma competição cadastrada.</div>
        )}
  {list.map((c: Competition) => {
          const st = statusOf(c.startDate, c.endDate);
          return (
            <div key={c.id} className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-center gap-4">
              {c.bannerImageUrl ? (
                <img src={c.bannerImageUrl} alt={c.name} className="h-16 w-28 object-cover rounded-lg border border-slate-800" />
              ) : (
                <div className="h-16 w-28 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 text-xs">Sem imagem</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-slate-100 font-semibold truncate">{c.name}</div>
                <div className="text-slate-400 text-sm truncate">{c.description || '—'}</div>
                <div className="text-slate-400 text-xs mt-1">{formatDateShort(c.startDate)} → {formatDateShort(c.endDate)} • Status: <span className="text-slate-200">{st}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/competicoes/${c.id}`} className="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg h-10 px-3">
                  <Pencil className="h-4 w-4 mr-2"/> Editar
                </Link>
                <Link href={`/competicoes/${c.id}`} className="inline-flex items-center border border-slate-700 hover:bg-slate-800 text-slate-100 rounded-lg h-10 px-3">
                  <Eye className="h-4 w-4 mr-2"/> Ver público
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
