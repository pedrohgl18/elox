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
  const [testUrl, setTestUrl] = React.useState('');
  const [testLoading, setTestLoading] = React.useState(false);
  const [testOutput, setTestOutput] = React.useState<any | null>(null);
  const [ytConfigured, setYtConfigured] = React.useState<boolean>(false);
  const [ytTestUrl, setYtTestUrl] = React.useState('');
  const [ytTestLoading, setYtTestLoading] = React.useState(false);
  const [ytTestOutput, setYtTestOutput] = React.useState<any | null>(null);
  const [ttTestUrl, setTtTestUrl] = React.useState('');
  const [ttTestLoading, setTtTestLoading] = React.useState(false);
  const [ttTestOutput, setTtTestOutput] = React.useState<any | null>(null);

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
    (async () => {
      try {
        const res = await fetch('/api/admin/youtube-status');
        const j = await res.json();
        if (mounted) setYtConfigured(!!j.configured);
      } catch {
        if (mounted) setYtConfigured(false);
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
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">TikTok (via Apify)</div>
              <div className="text-xs text-slate-400">Usa APIFY_TOKEN e actor clockworks/tiktok-scraper (configurável).</div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${apifyConfigured ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-200'}`}>
              {apifyConfigured ? 'Disponível' : 'Não configurado'}
            </div>
          </div>
          <div className="text-sm font-medium">Teste de coleta (TikTok)</div>
          <div className="text-xs text-slate-400">Informe a URL de um vídeo TikTok e execute um teste rápido. Isso cria um registro em video_metrics.</div>
          <div className="flex gap-2">
            <Input value={ttTestUrl} onChange={(e) => setTtTestUrl(e.currentTarget.value)} placeholder="https://www.tiktok.com/@user/video/XXXXXXXXX" />
            <Button type="button" disabled={ttTestLoading || !ttTestUrl.trim()} onClick={async () => {
              setTtTestLoading(true); setError(null); setSuccess(null); setTtTestOutput(null);
              try {
                const res = await fetch('/api/admin/tiktok-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: ttTestUrl.trim() }) });
                const j = await res.json();
                if (!res.ok) throw new Error(j?.error || 'Falha na coleta');
                setTtTestOutput(j);
                setSuccess('Coleta TikTok concluída.');
              } catch (e: any) {
                setTtTestOutput(e?.message ? { error: e.message } : null);
                setError(e.message || 'Erro');
              } finally {
                setTtTestLoading(false);
              }
            }}>{ttTestLoading ? 'Coletando…' : 'Executar teste'}</Button>
          </div>
          {ttTestOutput && (
            <div className="text-xs bg-slate-900/60 border border-slate-800 rounded p-3 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(ttTestOutput, null, 2)}</pre>
            </div>
          )}
        </div>
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="text-sm font-medium">Teste de coleta (Apify)</div>
          <div className="text-xs text-slate-400">Informe a URL de um Reel/P e execute um teste rápido. Isso cria um registro em video_metrics.</div>
          <div className="flex gap-2">
            <Input value={testUrl} onChange={(e) => setTestUrl(e.currentTarget.value)} placeholder="https://www.instagram.com/reel/XXXXXXXXX/" />
            <Button type="button" disabled={testLoading || !testUrl.trim()} onClick={async () => {
              setTestLoading(true); setError(null); setSuccess(null); setTestOutput(null);
              try {
                const res = await fetch('/api/admin/instagram-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: testUrl.trim() }) });
                const j = await res.json();
                if (!res.ok) throw new Error(j?.error || 'Falha na coleta');
                setTestOutput(j);
                setSuccess('Coleta concluída.');
              } catch (e: any) {
                setTestOutput(e?.message ? { error: e.message } : null);
                setError(e.message || 'Erro');
              } finally {
                setTestLoading(false);
              }
            }}>{testLoading ? 'Coletando…' : 'Executar teste'}</Button>
          </div>
          {testOutput && (
            <div className="text-xs bg-slate-900/60 border border-slate-800 rounded p-3 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(testOutput, null, 2)}</pre>
            </div>
          )}
        </div>
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">YouTube Data API</div>
              <div className="text-xs text-slate-400">Status via variável de ambiente YOUTUBE_API_KEY (Netlify).</div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${ytConfigured ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-200'}`}>
              {ytConfigured ? 'Configurada' : 'Não configurada'}
            </div>
          </div>
          <div className="text-sm font-medium">Teste de coleta (YouTube)</div>
          <div className="text-xs text-slate-400">Informe a URL de um vídeo/short e execute um teste rápido. Isso cria um registro em video_metrics.</div>
          <div className="flex gap-2">
            <Input value={ytTestUrl} onChange={(e) => setYtTestUrl(e.currentTarget.value)} placeholder="https://www.youtube.com/watch?v=XXXXXXXXX" />
            <Button type="button" disabled={ytTestLoading || !ytTestUrl.trim()} onClick={async () => {
              setYtTestLoading(true); setError(null); setSuccess(null); setYtTestOutput(null);
              try {
                const res = await fetch('/api/admin/youtube-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: ytTestUrl.trim() }) });
                const j = await res.json();
                if (!res.ok) throw new Error(j?.error || 'Falha na coleta');
                setYtTestOutput(j);
                setSuccess('Coleta YouTube concluída.');
              } catch (e: any) {
                setYtTestOutput(e?.message ? { error: e.message } : null);
                setError(e.message || 'Erro');
              } finally {
                setYtTestLoading(false);
              }
            }}>{ytTestLoading ? 'Coletando…' : 'Executar teste'}</Button>
          </div>
          {ytTestOutput && (
            <div className="text-xs bg-slate-900/60 border border-slate-800 rounded p-3 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(ytTestOutput, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
