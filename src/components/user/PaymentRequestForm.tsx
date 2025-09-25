'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PaymentsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function PaymentRequestForm({ onRequested }: { onRequested?: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [available, setAvailable] = useState<number | null>(null);

  async function loadSummary() {
    try {
      const res = await fetch('/api/payments/summary', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAvailable(data.available ?? 0);
      }
    } catch {}
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    setLoading(true);
    try {
      await PaymentsAPI.request(value);
  setSuccess('Solicitação enviada!');
      setAmount('');
      onRequested?.();
  router.refresh();
      loadSummary();
    } catch (err: any) {
      setError(err.message || 'Falha ao solicitar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert variant="error" description={error} />}
      {success && <Alert variant="success" description={success} />}
      <div className="space-y-1">
        {available !== null && (
          <div className="text-xs text-slate-400">Saldo disponível: <span className="text-slate-200">R$ {available.toFixed(2)}</span></div>
        )}
        <label className="mb-1 block text-sm font-medium">Valor (R$)</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.currentTarget.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading || (available !== null && Number(amount||0) > available)}>
          {loading ? 'Enviando...' : 'Solicitar Pagamento'}
        </Button>
      </div>
    </form>
  );
}
