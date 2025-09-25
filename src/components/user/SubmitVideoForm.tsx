'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { VideosAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { detectSocialMediaFromUrl, validateVideoUrl } from '@/lib/validation';

export function SubmitVideoForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [social, setSocial] = useState<'tiktok' | 'instagram' | 'kwai' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setLoading(true);
    try {
      await VideosAPI.create({ url: check.url, socialMedia: chosen as any });
  setSuccess('Vídeo enviado com sucesso!');
      setUrl('');
      setSocial('');
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
        <Select
          value={social}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSocial(e.currentTarget.value as 'tiktok' | 'instagram' | 'kwai' | '')
          }
        >
          <option value="">Selecione</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="kwai">Kwai</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Vídeo'}
        </Button>
      </div>
    </form>
  );
}
