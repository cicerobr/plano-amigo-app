'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface DuplicataDetalhe {
  id: number;
  id_duplicata?: number;
  id_venda?: number;
  num_documento?: string;
  parcela?: number;
  dt_emissao?: string;
  dt_vencimento?: string;
  valor?: number;
  valor_pago?: number;
  status?: string;
  historico?: string;
  [key: string]: any;
}

export default function FaturaDetalhePage() {
  const params = useParams();
  const search = useSearchParams();
  const [item, setItem] = useState<DuplicataDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && params.duplicataId) fetchData(params.id as string, params.duplicataId as string);
  }, [params.id, params.duplicataId]);

  const fetchData = async (id: string, dupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const planId = search.get('planId');
      if (!planId) throw new Error('Identificador do plano (planId) é obrigatório.');
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch(`/api/beneficiary/${id}/faturas/${dupId}?planId=${planId}`, {
        headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      });
      const ct = res.headers.get('content-type') || '';
      const json = ct.includes('application/json') ? await res.json() : { success: false, error: await res.text() };
      if (!res.ok || !json.success) throw new Error(json.error || 'Erro ao carregar detalhes da fatura');
      setItem(Array.isArray(json.data) ? json.data[0] : json.data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/beneficiarios" className="hover:text-blue-600">Beneficiários</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={`/beneficiarios/${params.id}`} className="hover:text-blue-600">Detalhes</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={(() => { const p = search.get('planId'); return p ? `/beneficiarios/${params.id}/faturas?planId=${p}` : `/beneficiarios/${params.id}/faturas`; })()} className="hover:text-blue-600">Faturas</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">Fatura #{params.duplicataId}</span>
        </div>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detalhes da Fatura</h1>
        <Link href={(() => { const p = search.get('planId'); return p ? `/beneficiarios/${params.id}/faturas?planId=${p}` : `/beneficiarios/${params.id}/faturas`; })()}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar às Faturas
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando fatura...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar fatura</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Link href={(() => { const p = search.get('planId'); return p ? `/beneficiarios/${params.id}/faturas?planId=${p}` : `/beneficiarios/${params.id}/faturas`; })()}><Button variant="outline">Voltar</Button></Link>
        </div>
      ) : !item ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Fatura não encontrada</h3>
          <p className="text-yellow-700">Verifique o identificador e tente novamente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div className="text-xs font-medium text-gray-500 uppercase">Documento</div><div className="text-sm text-gray-900">{item.num_documento ?? '—'}</div></div>
            <div><div className="text-xs font-medium text-gray-500 uppercase">Parcela</div><div className="text-sm text-gray-900">{item.parcela ?? '—'}</div></div>
            <div><div className="text-xs font-medium text-gray-500 uppercase">Emissão</div><div className="text-sm text-gray-900">{formatDate(item.dt_emissao)}</div></div>
            <div><div className="text-xs font-medium text-gray-500 uppercase">Vencimento</div><div className="text-sm text-gray-900">{formatDate(item.dt_vencimento)}</div></div>
            <div><div className="text-xs font-medium text-gray-500 uppercase">Valor</div><div className="text-sm text-gray-900">{item.valor ?? '—'}</div></div>
            <div><div className="text-xs font-medium text-gray-500 uppercase">Pago</div><div className="text-sm text-gray-900">{item.valor_pago ?? '—'}</div></div>
            <div className="md:col-span-2"><div className="text-xs font-medium text-gray-500 uppercase">Status</div><div className="text-sm text-gray-900">{item.status ?? '—'}</div></div>
            {item.historico && (<div className="md:col-span-2"><div className="text-xs font-medium text-gray-500 uppercase">Histórico</div><div className="text-sm text-gray-900 whitespace-pre-wrap">{item.historico}</div></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

