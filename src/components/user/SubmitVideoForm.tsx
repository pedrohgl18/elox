'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CompetitionsAPI, VideosAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { detectSocialMediaFromUrl, validateVideoUrl } from '@/lib/validation';
import { SocialPicker } from './SocialPicker';

export function SubmitVideoForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [social, setSocial] = useState<'tiktok' | 'instagram' | 'kwai' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [competitionId, setCompetitionId] = useState<string | ''>('');

  useEffect(() => {
    // carrega campanhas em que o usuário está inscrito
    CompetitionsAPI.listEnrolled().then(setCompetitions).catch(() => setCompetitions([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!url) {
      setError('Informe a URL do vídeo.');
      return;
    }
    // tenta detectar automaticamente a rede caso não selecionada
    let chosen = social;
    if (!chosen) {
      const detected = detectSocialMediaFromUrl(url);
      if (detected) chosen = detected;
    }
    if (!chosen) {
      setError('Selecione a rede social ou cole um link válido.');
      return;
    }
    const check = validateVideoUrl(url, chosen as any);
    if (!check.ok) {
      setError(check.reason || 'URL inválida');
      return;
    }
    if (!competitionId) {
      setError('Selecione uma campanha.');
      return;
    }
    setLoading(true);
    try {
      await VideosAPI.create({ url: check.url, socialMedia: chosen as any, competitionId: competitionId || null });
  setSuccess('Vídeo enviado com sucesso!');
      setUrl('');
      setSocial('');
      setCompetitionId('');
      onSubmitted?.();
  router.refresh();
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar vídeo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert variant="error" description={error} />}
      {success && <Alert variant="success" description={success} />}
      <div>
        <label className="mb-1 block text-sm font-medium">URL do Vídeo</label>
        <Input
          placeholder="https://..."
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.currentTarget.value;
            setUrl(value);
            // auto-detect leve
            const detected = detectSocialMediaFromUrl(value);
            if (detected) setSocial(detected);
          }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Rede Social</label>
        <SocialPicker value={social} onChange={setSocial as any} />
      </div>

      {/* Seletor de Campanha atual (somente as que o usuário está inscrito) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Selecionar Campanha</label>
        <div className="flex flex-wrap gap-2">
          {competitions.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                competitionId === c.id
                  ? 'border-brand-400 bg-brand-400/10 text-brand-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setCompetitionId(c.id)}
              title={`${c.name} — CPM R$ ${Number(c.rules?.cpm ?? 0).toFixed(2)}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading || competitions.length === 0}>
          {loading ? 'Enviando...' : 'Enviar Vídeo'}
        </Button>
      </div>
    </form>
  );
}
