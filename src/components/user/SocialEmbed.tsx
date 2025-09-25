"use client";

import React, { useEffect, useMemo } from 'react';
import { detectSocialMediaFromUrl } from '@/lib/validation';

interface Props {
  url: string;
}

// Renderiza embeds reais das plataformas. Sem fallbacks: só mostra quando reconhecido.
export function SocialEmbed({ url }: Props) {
  const platform = useMemo(() => detectSocialMediaFromUrl(url), [url]);

  useEffect(() => {
    if (platform === 'instagram') {
      // Instagram embed script
      if (!document.querySelector('script[src^="https://www.instagram.com/embed.js"]')) {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.instagram.com/embed.js';
        document.body.appendChild(s);
      } else if ((window as any).instgrm?.Embeds?.process) {
        (window as any).instgrm.Embeds.process();
      }
    }
    if (platform === 'tiktok') {
      if (!document.querySelector('script[src^="https://www.tiktok.com/embed.js"]')) {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.tiktok.com/embed.js';
        document.body.appendChild(s);
      }
    }
    // Kwai – utiliza iframe com URL de compartilhamento quando disponível
  }, [platform]);

  if (!platform) return null;

  if (platform === 'instagram') {
    // Supports reels/p posts with blockquote
    return (
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ background: '#141827', borderRadius: 12, margin: 0 }} />
    );
  }
  if (platform === 'tiktok') {
    return (
      <blockquote className="tiktok-embed" cite={url} data-video-id="" style={{ maxWidth: 605, minWidth: 325 }}>
        <a href={url}> </a>
      </blockquote>
    );
  }
  if (platform === 'kwai') {
    // Kwai não oferece um embed JS oficial público; usamos iframe do link direto quando possível.
    return (
      <iframe src={url} className="w-full h-80 rounded-md border border-slate-800" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
    );
  }
  return null;
}
