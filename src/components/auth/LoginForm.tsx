'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { config } from '@/lib/config';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onEmailChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setEmail(e.currentTarget.value);
  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setPassword(e.currentTarget.value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.ok && !result?.error) {
        // Obter a sessão atualizada para verificar o role
        const session = await getSession();
        const userRole = (session?.user as any)?.role;
        
        // Redirecionar baseado no role
        if (userRole === 'admin') {
          window.location.href = config.urls.adminDashboard;
        } else {
          window.location.href = config.urls.userDashboard;
        }
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input type="email" value={email} onChange={onEmailChange} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Senha</label>
        <Input type="password" value={password} onChange={onPasswordChange} required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
