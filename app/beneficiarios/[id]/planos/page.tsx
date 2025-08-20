'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrencyBRL, formatDateBR } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';

interface VendaPlano {
  id: number;
  num_venda?: number;
  num_proposta?: number;
  seq_venda?: number;
  dt_venda?: string;
  plano?: string;
  cliente?: string;
  vendedor?: string;
  forma_cobranca?: string;
  status?: string;
  valor?: number;
  vlr_liquido?: number;
  periodicidade_cobranca?: string;
  dt_primeiro_vencimento?: string;
}

export default function BeneficiaryPlansPage() {
  const params = useParams();
  const [plans, setPlans] = useState<VendaPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPlans(params.id as string);
    }
  }, [params.id]);

  const fetchPlans = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch(`/api/beneficiary/${id}/plans`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const ct = res.headers.get('content-type') || '';
      const json = ct.includes('application/json') ? await res.json() : { success: false, error: await res.text() };

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao buscar planos');
      }

      const data = Array.isArray(json.data) ? json.data : [];
      setPlans(data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/beneficiarios" className="hover:text-blue-600">Beneficiários</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Planos</span>
        </div>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planos do Beneficiário</h1>
        <Link href={`/beneficiarios/${params.id}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar aos Detalhes
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar planos</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => fetchPlans(params.id as string)} variant="outline">Tentar Novamente</Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Nenhum plano encontrado</h3>
          <p className="text-yellow-700">Este beneficiário não possui planos funerários contratados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Plano #{plan.num_venda ?? plan.id}</h3>
                <p className="text-purple-100 text-sm">{plan.plano || 'Plano'}</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Proposta</span>
                  <span className="text-gray-900">{plan.num_proposta ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sequencial</span>
                  <span className="text-gray-900">{plan.seq_venda ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Data da Venda</span>
                  <span className="text-gray-900">{formatDateBR(plan.dt_venda)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cliente</span>
                  <span className="text-gray-900">{plan.cliente ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vendedor</span>
                  <span className="text-gray-900">{plan.vendedor ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Forma de Cobrança</span>
                  <span className="text-gray-900">{plan.forma_cobranca ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={plan.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valor</span>
                  <span className="text-gray-900">{plan.valor !== undefined ? formatCurrencyBRL(plan.valor) : (plan.vlr_liquido !== undefined ? formatCurrencyBRL(plan.vlr_liquido) : '—')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">1º Vencimento</span>
                  <span className="text-gray-900">{formatDateBR(plan.dt_primeiro_vencimento)}</span>
                </div>
                <div className="pt-3 border-t flex items-center gap-2">
                  <Link href={`/beneficiarios/${params.id}/planos/${plan.id}`}>
                    <Button size="sm">Ver detalhes</Button>
                  </Link>
                  <Link href={`/beneficiarios/${params.id}/faturas?planId=${plan.id}`}>
                    <Button size="sm" variant="outline">Ver faturas</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

