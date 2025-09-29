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
      {/* Bloco de cookie do Instagram removido enquanto insights estão desativados */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
