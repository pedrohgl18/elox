"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SocialEmbed } from './SocialEmbed';

// Este componente escuta eventos de preview emitidos pelo formulário e mostra o embed real na sidebar.
export function PreviewSidebar() {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setUrl(detail || '');
    };
    window.addEventListener('elox:upload-preview', handler as any);
    return () => window.removeEventListener('elox:upload-preview', handler as any);
  }, []);

  return (
    <Card>
      <CardHeader>
        <span className="font-semibold">Preview do Vídeo</span>
      </CardHeader>
      <CardContent>
        {url ? (
          <div className="rounded-md overflow-hidden border border-slate-800">
            <SocialEmbed url={url} />
          </div>
        ) : (
          <div className="text-sm text-slate-400">Cole um link válido para ver o preview.</div>
        )}
      </CardContent>
    </Card>
  );
}
