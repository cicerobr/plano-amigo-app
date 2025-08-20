'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Login realizado com sucesso');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Falha no login';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded p-2" placeholder="E-mail" required />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded p-2" placeholder="Senha" required />
        <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
      </form>
      <p className="mt-4 text-sm">Não tem conta? <Link className="text-blue-600" href="/signup">Cadastre-se</Link></p>
    </div>
  );
}

