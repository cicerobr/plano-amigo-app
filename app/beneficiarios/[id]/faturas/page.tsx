'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatCurrencyBRL, formatDateBR, normalizeStatus } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { InvoiceFilters, InvoiceFiltersValue } from '@/components/Filters/InvoiceFilters';

interface DuplicataReceber {
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
  [key: string]: any;
}

export default function FaturasPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<DuplicataReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<InvoiceFiltersValue>({});
  useEffect(() => {
    if (params.id) fetchData(params.id as string);
  }, [params.id]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const planId = search.get('planId');
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch(`/api/beneficiary/${id}/faturas${planId ? `?planId=${planId}` : ''}`, {
        headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      });
      const ct = res.headers.get('content-type') || '';
      const json = ct.includes('application/json') ? await res.json() : { success: false, error: await res.text() };
      if (!res.ok || !json.success) throw new Error(json.error || 'Erro ao carregar faturas');
      const arr = Array.isArray(json.data) ? json.data : [];
      // Redireciona automaticamente quando houver exatamente 1 duplicata
      if (arr.length === 1) {
        const only = arr[0];
        const planId = search.get('planId') || '';
        router.push(`/beneficiarios/${id}/faturas/${only.id}?planId=${planId}`);
        return;
      }
      setItems(arr);
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={`/beneficiarios/${params.id}`} className="hover:text-blue-600">Detalhes</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">Faturas</span>
        </div>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faturas (Duplicatas a Receber)</h1>
        {/* Plano selecionado */}
        {(() => { const p = search.get('planId'); return p ? (
          <div className="text-sm text-gray-600 mt-1">Plano selecionado: <span className="font-medium text-gray-900">#{p}</span></div>
        ) : null; })()}
        <Link href={`/beneficiarios/${params.id}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar aos Detalhes
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <InvoiceFilters value={filters} onChange={setFilters} />
      </div>
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando faturas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar faturas</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => fetchData(params.id as string)} variant="outline">Tentar Novamente</Button>
            <Link href={`/beneficiarios/${params.id}/planos`}>
              <Button>Escolher um Plano</Button>
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Nenhuma fatura encontrada</h3>
          <p className="text-yellow-700">Selecione um Plano e tente novamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items
            .filter((dup) => {
              // status
              if (filters.status) {
                const s = (dup.status || '').toLowerCase();
                if (!s.includes(filters.status.toLowerCase())) return false;
              }
              // pago / não pago
              if (filters.paid === 'pago' && !(dup.valor_pago && Number(dup.valor_pago) > 0)) return false;
              if (filters.paid === 'nao_pago' && (dup.valor_pago && Number(dup.valor_pago) > 0)) return false;
              // período
              const toDate = (s?: string) => (s ? new Date(s) : null);
              const dEmissao = toDate(dup.dt_emissao);
              if (filters.from && dEmissao) {
                const from = new Date(filters.from);
                if (dEmissao < from) return false;
              }
              if (filters.to && dEmissao) {
                const to = new Date(filters.to);
                // incluir o dia "to"
                to.setHours(23,59,59,999);
                if (dEmissao > to) return false;
              }
              return true;
            })
            .map((dup) => (
            <div key={dup.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: 'var(--primary)' }}>
                <h3 className="text-lg font-semibold text-white">Duplicata #{dup.id_duplicata ?? dup.id}</h3>
                <p className="text-white/80 text-sm">Parcela: {dup.parcela ?? '—'}</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Documento</span><span className="text-gray-900">{dup.num_documento ?? '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Emissão</span><span className="text-gray-900">{formatDateBR(dup.dt_emissao)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Vencimento</span><span className="text-gray-900">{formatDateBR(dup.dt_vencimento)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Valor</span><span className="text-gray-900">{formatCurrencyBRL(dup.valor)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pago</span><span className="text-gray-900">{formatCurrencyBRL(dup.valor_pago)}</span></div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={dup.status} />
                </div>
                <div className="pt-3 border-t">
                  <Link href={`/beneficiarios/${params.id}/faturas/${dup.id}?planId=${search.get('planId') ?? ''}`}>
                    <Button size="sm">
                      Ver detalhes
                    </Button>
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

