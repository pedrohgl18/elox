"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CompetitionsAPI } from '@/lib/api';
import { config } from '@/lib/config';

export function CompetitionEnrollButton({ competitionId }: { competitionId: string }) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    CompetitionsAPI.listEnrolled()
      .then((list) => setEnrolled(!!list.find((c: any) => c.id === competitionId)))
      .catch(() => setEnrolled(false));
  }, [competitionId]);

  const handleEnroll = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/enroll`, { method: 'POST' });
      if (res.status === 401) {
        router.push(config.urls.login);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Falha na inscrição' }));
        throw new Error(j.error || 'Falha na inscrição');
      }
      setEnrolled(true);
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return <Button type="button" variant="outline" disabled>Inscrito</Button>;
  }
  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={handleEnroll} disabled={loading}>
        {loading ? 'Inscrevendo…' : 'Inscrever-se'}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
