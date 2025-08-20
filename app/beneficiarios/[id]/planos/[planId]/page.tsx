'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrencyBRL, formatDateBR } from '@/lib/format';
import { supabase } from '@/lib/supabase';

interface VendaPlano {
  id: number;
  num_venda?: number;
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
  [key: string]: any;
}

export default function PlanDetailsPage() {
  const params = useParams();
  const [plan, setPlan] = useState<VendaPlano | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && params.planId) {
      fetchPlan(params.id as string, params.planId as string);
    }
  }, [params.id, params.planId]);

  const fetchPlan = async (id: string, planId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch(`/api/beneficiary/${id}/plans/${planId}`, {
        headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      });
      const ct = res.headers.get('content-type') || '';
      const json = ct.includes('application/json') ? await res.json() : { success: false, error: await res.text() };

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao buscar detalhes do plano');
      }

      setPlan(json.data || null);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try { return new Date(date).toLocaleDateString('pt-BR'); } catch { return date; }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/beneficiarios" className="hover:text-blue-600">Beneficiários</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/beneficiarios/${params.id}/planos`} className="hover:text-blue-600">Planos</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Plano #{params.planId}</span>
        </div>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detalhes do Plano</h1>
        <Link href={`/beneficiarios/${params.id}/planos`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes do plano...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar plano</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Link href={`/beneficiarios/${params.id}/planos`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      ) : !plan ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Plano não encontrado</h3>
          <p className="text-yellow-700">Verifique o identificador e tente novamente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Identificação</div>
              <div className="text-sm text-gray-900">Plano #{plan.num_venda ?? plan.id}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Data de Venda</div>
              <div className="text-sm text-gray-900">{formatDateBR(plan.dt_venda)}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Plano</div>
              <div className="text-sm text-gray-900">{plan.plano ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Cliente</div>
              <div className="text-sm text-gray-900">{plan.cliente ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Vendedor</div>
              <div className="text-sm text-gray-900">{plan.vendedor ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Forma de Cobrança</div>
              <div className="text-sm text-gray-900">{plan.forma_cobranca ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
              <div className="text-sm text-gray-900"><StatusBadge status={plan.status} /></div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Valor</div>
              <div className="text-sm text-gray-900">{plan.valor !== undefined ? formatCurrencyBRL(plan.valor) : (plan.vlr_liquido !== undefined ? formatCurrencyBRL(plan.vlr_liquido) : '—')}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Periodicidade</div>
              <div className="text-sm text-gray-900">{plan.periodicidade_cobranca ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">1º Vencimento</div>
              <div className="text-sm text-gray-900">{formatDateBR(plan.dt_primeiro_vencimento)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

