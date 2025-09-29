'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

type Keys = { };

export function AdminApiKeysForm() {
  const [keys, setKeys] = React.useState<Keys>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [apifyConfigured, setApifyConfigured] = React.useState(false);
  const [apifyActor, setApifyActor] = React.useState<string>('');
  const [apifyWait, setApifyWait] = React.useState<number>(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Falha ao carregar');
      const j = await res.json();
      setKeys(j.socialApiKeys || {});
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/apify-status');
        if (!res.ok) throw new Error('Falha ao verificar Apify');
        const j = await res.json();
        if (!mounted) return;
        setApifyConfigured(!!j.configured);
        setApifyActor(j.actor || '');
        setApifyWait(j.waitSec || 0);
      } catch {
        if (mounted) setApifyConfigured(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ socialApiKeys: keys }) });
      if (!res.ok) throw new Error('Falha ao salvar');
      setSuccess('Chaves atualizadas.');
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      {error && <Alert variant="error" description={error} />}
      {success && <Alert variant="success" description={success} />}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Apify</div>
            <div className="text-xs text-slate-400">Status de configuração via variáveis de ambiente no Netlify.</div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${apifyConfigured ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-200'}`}>
            {apifyConfigured ? 'Configurada' : 'Não configurada'}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-400">Actor</label>
            <Input readOnly value={apifyActor} placeholder="apify~instagram-scraper" />
          </div>
          <div>
            <label className="block text-xs text-slate-400">Wait (segundos)</label>
            <Input readOnly value={String(apifyWait || '')} placeholder="25" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={async () => {
            setLoading(true); setError(null); setSuccess(null);
            try {
              const res = await fetch('/api/admin/apify-status');
              if (!res.ok) throw new Error('Falha ao checar Apify');
              const j = await res.json();
              setApifyConfigured(!!j.configured);
              setApifyActor(j.actor || '');
              setApifyWait(j.waitSec || 0);
              setSuccess('Status atualizado.');
            } catch (e: any) { setError(e.message || 'Erro'); } finally { setLoading(false); }
          }}>Testar integração</Button>
        </div>
      </div>
    </form>
  );
}
