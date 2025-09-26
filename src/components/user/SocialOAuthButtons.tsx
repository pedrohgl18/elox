'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

type Provider = 'instagram' | 'tiktok' | 'kwai' | 'youtube';

const labels: Record<Provider, string> = {
  instagram: 'Conectar Instagram',
  tiktok: 'Conectar TikTok',
  kwai: 'Conectar Kwai',
  youtube: 'Conectar YouTube',
};

// Este componente inicia o fluxo OAuth específico por provedor via rotas internas /api/social-accounts/oauth/{provider}/start
export function SocialOAuthButtons({ providerOrder = ['instagram', 'tiktok', 'kwai', 'youtube'] }: { providerOrder?: Provider[] }) {
  const start = (p: Provider) => {
    window.location.href = `/api/social-accounts/oauth/${p}/start`;
  };
  return (
    <div className="space-y-2">
      {providerOrder.map((p) => (
        <Button key={p} type="button" className="w-full" variant="outline" onClick={() => start(p)}>
          {labels[p]}
        </Button>
      ))}
    </div>
  );
}
