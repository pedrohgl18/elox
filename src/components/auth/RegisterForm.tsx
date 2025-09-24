'use client';

import React, { useState } from 'react';
import { detectPixKeyType } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { signIn } from 'next-auth/react';

interface RegisterResponse {
  ok: boolean;
  error?: string;
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [pixKey, setPixKey] = useState('');
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('Senhas não coincidem');
      return;
    }
    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Serviço');
      return;
    }
    if (!usernameRegex.test(username)) {
      setError('Username inválido. Use 3-20 caracteres: letras, números, underscore.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, pixKey: pixKey || undefined }),
      });
      const data: RegisterResponse = await res.json();
      if (!data.ok) {
        setError(data.error || 'Falha ao registrar');
        return;
      }
      // Auto login
      const loginResult = await signIn('credentials', { email, password, redirect: false });
      if (loginResult?.ok) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/auth/login';
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value.toLowerCase())}
            required
            placeholder="ex: clip_master"
            className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900"
          />
          {username.length > 0 && !usernameRegex.test(username) && (
            <p className="mt-1 text-xs text-red-500">Use 3-20 caracteres: letras, números ou _</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Chave Pix (opcional)</label>
          <input value={pixKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPixKey(e.target.value.trim())} placeholder="CPF, CNPJ, email, telefone ou chave aleatória" className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900" />
          {pixKey && detectPixKeyType(pixKey) === 'unknown' && (
            <p className="mt-1 text-xs text-red-500">Formato de chave PIX inválido.</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Senha</label>
          <input type="password" minLength={6} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirmar Senha</label>
          <input type="password" value={passwordConfirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)} required className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900" />
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <input
          id="terms"
          type="checkbox"
          className="mt-1"
          checked={acceptTerms}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptTerms(e.target.checked)}
        />
        <label htmlFor="terms" className="text-sm select-none">
          Li e aceito os <a href="/terms" target="_blank" className="underline">Termos de Serviço</a>.
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Criando...' : 'Criar Conta'}
      </Button>
      <p className="text-xs text-center text-muted-foreground">Já tem conta? <a className="underline" href="/auth/login">Entrar</a></p>
    </form>
  );
}
