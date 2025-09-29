'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

type Keys = { tiktok?: string; instagram?: string; kwai?: string; youtube?: string };

export function AdminApiKeysForm() {
  const [keys, setKeys] = React.useState<Keys>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [igCookieInput, setIgCookieInput] = React.useState('');
  const [igCookieSet, setIgCookieSet] = React.useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Falha ao carregar');
      const j = await res.json();
      setKeys(j.socialApiKeys || {});
      // estado do cookie (não retorna valor)
      const rc = await fetch('/api/admin/instagram-cookie');
      if (rc.ok) {
        const cj = await rc.json();
        setIgCookieSet(!!cj.instagramCookieSet);
      }
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">TikTok API Key</label>
          <Input value={keys.tiktok || ''} onChange={(e) => setKeys({ ...keys, tiktok: e.currentTarget.value })} placeholder="tk-..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram API Key</label>
          <Input value={keys.instagram || ''} onChange={(e) => setKeys({ ...keys, instagram: e.currentTarget.value })} placeholder="ig-..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kwai API Key</label>
          <Input value={keys.kwai || ''} onChange={(e) => setKeys({ ...keys, kwai: e.currentTarget.value })} placeholder="kw-..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube API Key</label>
          <Input value={keys.youtube || ''} onChange={(e) => setKeys({ ...keys, youtube: e.currentTarget.value })} placeholder="yt-..." />
        </div>
      </div>
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Cookie de Sessão do Instagram (opcional)</div>
            <div className="text-xs text-slate-400">Permite extrair métricas de forma mais confiável ao usar uma sessão válida. O valor não será exibido após salvar.</div>
          </div>
          <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200">{igCookieSet ? 'Configurado' : 'Não definido'}</div>
        </div>
        <Input value={igCookieInput} onChange={(e) => setIgCookieInput(e.currentTarget.value)} placeholder="Ex: ds_user_id=...; sessionid=...; csrftoken=..." />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" disabled={loading} onClick={async () => {
            setLoading(true); setError(null); setSuccess(null);
            try {
              const res = await fetch('/api/admin/instagram-cookie', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: null }) });
              if (!res.ok) throw new Error('Falha ao remover');
              setIgCookieInput('');
              setIgCookieSet(false);
              setSuccess('Cookie removido.');
            } catch (e: any) { setError(e.message || 'Erro'); } finally { setLoading(false); }
          }}>Remover</Button>
          <Button type="button" disabled={loading || !igCookieInput.trim()} onClick={async () => {
            setLoading(true); setError(null); setSuccess(null);
            try {
              const res = await fetch('/api/admin/instagram-cookie', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: igCookieInput }) });
              if (!res.ok) throw new Error('Falha ao salvar');
              setIgCookieInput('');
              setIgCookieSet(true);
              setSuccess('Cookie salvo.');
            } catch (e: any) { setError(e.message || 'Erro'); } finally { setLoading(false); }
          }}>Salvar Cookie</Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
