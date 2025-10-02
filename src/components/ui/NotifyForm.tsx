"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function NotifyForm({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        show('Você entrou na lista de espera! 👌', { type: 'success' });
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        show(data?.error || 'Não foi possível salvar seu e-mail.', { type: 'error' });
      }
    } catch (err) {
      show('Erro de conexão. Tente novamente.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full bg-gradient-to-r from-sky-600 via-indigo-700 to-blue-950 px-6 text-sm font-semibold text-white shadow-lg btn-shimmer"
        >
          {loading ? 'Enviando…' : 'Quero ser avisado'}
        </button>
      </div>
    </form>
  );
}
