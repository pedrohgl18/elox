'use client';

import React, { useEffect, useState } from 'react';
import { SocialAccountsAPI } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ConnectedSocialAccounts() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await SocialAccountsAPI.list();
        setList(data);
      } catch (e: any) {
        setError(e.message || 'Falha ao carregar contas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-slate-400">Carregando contas...</div>;
  if (error) return <div className="text-sm text-red-400">{error}</div>;

  if (!list.length) return <div className="text-sm text-slate-400">Nenhuma conta conectada ainda.</div>;

  return (
    <div className="space-y-2">
      {list.map((a) => (
        <div key={a.id} className="flex items-center justify-between rounded border border-slate-800 px-3 py-2">
          <div>
            <div className="text-sm font-medium capitalize">{a.platform}</div>
            <div className="text-xs text-slate-500">@{a.username || a.providerAccountId || '—'}</div>
          </div>
          <StatusBadge label={a.status} />
        </div>
      ))}
    </div>
  );
}
