'use client';
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

function useReelInsights() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any | null>(null);
  const [debug, setDebug] = React.useState(false);
  const [strong, setStrong] = React.useState(true);

  const fetchInsights = async () => {
    setError(null);
    setData(null);
    if (!url) {
      setError('Informe a URL do Reel');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/public/instagram/reel-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, debug, strong }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao buscar métricas');
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Erro ao buscar');
    } finally {
      setLoading(false);
    }
  };

  return { url, setUrl, loading, error, data, fetchInsights, debug, setDebug, strong, setStrong };
}

export default function InstagramInsightsPage() {
  const { url, setUrl, loading, error, data, fetchInsights, debug, setDebug, strong, setStrong } = useReelInsights();
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>Buscar métricas públicas de um Reel</CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <Alert variant="error" description={error} />}
            <div>
              <label className="mb-1 block text-sm font-medium">URL do Reel</label>
              <Input
                placeholder="https://www.instagram.com/reel/ABC123/"
                value={url}
                onChange={(e: any) => setUrl(e.currentTarget.value)}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.currentTarget.checked)} />
                Debug
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={strong} onChange={(e) => setStrong(e.currentTarget.checked)} />
                Heurística forte (views)
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={fetchInsights} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            {data && (
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Shortcode:</span> <span className="font-mono">{data.shortcode}</span></div>
                <div><span className="text-slate-400">Views:</span> {data.views ?? 'N/D'}</div>
                <div>
                  <span className="text-slate-400">Hashtags:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(data.hashtags || []).map((h: string) => (
                      <span key={h} className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs">{h}</span>
                    ))}
                    {(!data.hashtags || data.hashtags.length === 0) && <span className="text-slate-400">Nenhuma</span>}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Menções:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(data.mentions || []).map((m: string) => (
                      <span key={m} className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs">{m}</span>
                    ))}
                    {(!data.mentions || data.mentions.length === 0) && <span className="text-slate-400">Nenhuma</span>}
                  </div>
                </div>
                {data._debug && (
                  <div className="mt-4">
                    <div className="text-slate-400">Debug:</div>
                    <pre className="mt-2 text-xs bg-slate-900 p-3 rounded overflow-x-auto">{JSON.stringify(data._debug, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
