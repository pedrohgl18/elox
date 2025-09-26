"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialAccountsAPI } from '@/lib/api';

type Platform = 'tiktok' | 'instagram' | 'kwai' | 'youtube';

export function HashtagPostPicker({ platform = 'youtube', onPick }: { platform?: Platform; onPick: (item: any) => void }) {
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    if (!hashtag.trim()) return;
    setLoading(true);
    try {
      const res = await SocialAccountsAPI.listPosts(platform, hashtag.startsWith('#') ? hashtag : `#${hashtag}`);
      setItems(res.items || []);
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="#hashtag" value={hashtag} onChange={(e) => setHashtag(e.currentTarget.value)} />
        <Button onClick={search} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <ul className="space-y-2 max-h-64 overflow-auto">
        {items.length === 0 && <li className="text-sm text-slate-500">Nenhum item encontrado ainda.</li>}
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center justify-between rounded border border-slate-800 p-2">
            <div className="text-sm truncate">{it.title || it.id || 'Post'}</div>
            <Button variant="outline" onClick={() => onPick(it)}>Selecionar</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
