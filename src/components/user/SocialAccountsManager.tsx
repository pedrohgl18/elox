'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import { SocialAccountsAPI } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Platform = 'tiktok' | 'instagram' | 'kwai' | 'youtube';

const options: { key: Platform; label: string }[] = [
  { key: 'tiktok', label: 'TikTok' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'kwai', label: 'Kwai' },
  { key: 'youtube', label: 'YouTube' },
];

export function SocialAccountsManager() {
  const [list, setList] = useState<any[]>([]);
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const a of list) {
      if (!g[a.platform]) g[a.platform] = [];
      g[a.platform].push(a);
    }
    return g;
  }, [list]);

  const refresh = async () => {
    try {
      const data = await SocialAccountsAPI.list();
      setList(data);
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar contas sociais');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!username.trim()) {
      setError('Informe o usuário/perfil (@nome).');
      return;
    }
    setLoading(true);
    try {
      await SocialAccountsAPI.create({ platform, username: username.replace(/^@/, '') });
      setUsername('');
      setSuccess('Conta adicionada com sucesso.');
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar conta');
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await SocialAccountsAPI.remove(id);
      setSuccess('Conta removida.');
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Falha ao remover conta');
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" description={error} />}
      {success && <Alert variant="success" description={success} />}

      <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-12 items-end">
        <div className="sm:col-span-4">
          <label className="mb-1 block text-sm font-medium">Plataforma</label>
          <Select value={platform} onChange={(e) => setPlatform(e.currentTarget.value as Platform)}>
            {options.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-6">
          <label className="mb-1 block text-sm font-medium">Usuário (@perfil)</label>
          <Input placeholder="ex: @seu_usuario" value={username} onChange={(e) => setUsername(e.currentTarget.value)} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</Button>
        </div>
      </form>

      <div className="space-y-3">
        {Object.keys(grouped).length === 0 && (
          <div className="text-sm text-slate-400">Nenhuma conta conectada ainda.</div>
        )}
        {Object.entries(grouped).map(([plat, accounts]) => (
          <div key={plat} className="rounded-lg border border-slate-800">
            <div className="px-3 py-2 border-b border-slate-800 text-sm font-semibold capitalize">{plat}</div>
            <ul className="divide-y divide-slate-800">
              {accounts.map((a: any) => (
                <li key={a.id} className="px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">@{a.username}</div>
                    <div className="text-xs text-slate-500">Adicionada em {new Date(a.createdAt).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge label={a.status} />
                    <Button variant="outline" onClick={() => onRemove(a.id)}>Remover</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
