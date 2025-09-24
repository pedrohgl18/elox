'use client';

import React, { useState } from 'react';
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
      <div>
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Solicitar Pagamento'}
        </Button>
      </div>
    </form>
  );
}
