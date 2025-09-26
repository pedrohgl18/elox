"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialAccountsAPI } from '@/lib/api';
import { CompetitionsAPI, VideosAPI } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export function InstagramHashtagPicker({ onPick }: { onPick: (item: any) => void }) {
  const { show } = useToast();
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [competitionId, setCompetitionId] = useState<string>('');

  // Carrega competições ativas do usuário e sugere a hashtag requerida
  useEffect(() => {
    (async () => {
      try {
        const comps = await CompetitionsAPI.listEnrolledActive();
        setCompetitions(comps);
        if (comps.length) {
          setCompetitionId(comps[0].id);
          const firstTag = comps[0]?.rules?.requiredHashtags?.[0];
          if (firstTag) setHashtag(firstTag.startsWith('#') ? firstTag : `#${firstTag}`);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const search = async () => {
    setError(null);
    if (!hashtag.trim()) return;
    setLoading(true);
    try {
      const res = await SocialAccountsAPI.listPosts('instagram', hashtag);
      setItems(res.items || []);
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar posts');
    } finally {
      setLoading(false);
    }
  };

  const submitToCompetition = async (item: any) => {
    try {
      if (!competitionId) {
        setError('Selecione uma competição.');
        return;
      }
      const url = item.url as string;
      await VideosAPI.create({ url, socialMedia: 'instagram', competitionId });
      show('Vídeo enviado com sucesso! Aguarde a validação.', { type: 'success' });
      onPick(item);
    } catch (e: any) {
      setError(e.message || 'Falha ao enviar o vídeo');
      show(e.message || 'Falha ao enviar o vídeo', { type: 'error' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-12 items-center">
        <div className="sm:col-span-5">
        <Input placeholder="#hashtag" value={hashtag} onChange={(e) => setHashtag(e.currentTarget.value)} />
        </div>
        <div className="sm:col-span-5">
          <Select value={competitionId} onChange={(e) => setCompetitionId(e.currentTarget.value)}>
            <option value="">Selecione a competição</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Button onClick={search} disabled={loading} className="w-full">{loading ? 'Buscando...' : 'Buscar'}</Button>
        </div>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <ul className="space-y-2 max-h-64 overflow-auto">
        {items.length === 0 && <li className="text-sm text-slate-500">Nenhum item encontrado ainda.</li>}
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center justify-between rounded border border-slate-800 p-2">
            <div className="text-sm truncate">{it.title || it.id || 'Post'}</div>
            <Button variant="outline" onClick={() => submitToCompetition(it)}>Enviar</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
