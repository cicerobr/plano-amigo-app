'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, state } }
      });
      if (error) throw error;

      // Perfil será criado automaticamente via trigger handle_new_user()
      toast.success('Cadastro realizado! Verifique seu e-mail para confirmar.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Criar Conta</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="w-full border rounded p-2" placeholder="Nome" required />
        <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="w-full border rounded p-2" placeholder="Sobrenome" required />
        <input value={state} onChange={(e)=>setState(e.target.value)} className="w-full border rounded p-2" placeholder="Estado (UF)" required />
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded p-2" placeholder="E-mail" required />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded p-2" placeholder="Senha" required />
        <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full border rounded p-2" placeholder="Confirmar senha" required />
        <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
      </form>
      <p className="mt-4 text-sm">Já tem conta? <Link className="text-blue-600" href="/login">Entrar</Link></p>
    </div>
  );
}

