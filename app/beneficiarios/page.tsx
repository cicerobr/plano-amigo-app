'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import { Eye, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Cliente {
  id: number;
  hadesweb_id: number;
  nome: string;
  cpf_cnpj: string;
  fis_jur: string;
  telefone_res?: string;
  email1?: string;
  created_at: string;
  endereco?: {
    cidade?: string;
    uf?: string;
  };
}

export default function BeneficiariosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch('/api/beneficiary/list', {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const data = await response.json();

      if (data.success) {
        setClientes(data.data || []);
      } else {
        setError(data.error || 'Erro ao carregar beneficiários');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  // Sorting and pagination
  const sortedClientes = [...clientes].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.nome.localeCompare(b.nome, 'pt-BR');
      case 'name-desc':
        return b.nome.localeCompare(a.nome, 'pt-BR');
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  const totalPages = Math.max(1, Math.ceil(sortedClientes.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * pageSize;
  const visibleClientes = sortedClientes.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    // resetar para primeira página quando muda ordenação ou quantidade
    setCurrentPage(1);
  }, [sortOption, clientes.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando beneficiários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Beneficiários Salvos</h1>
        <p className="text-gray-600">Lista de beneficiários cadastrados no sistema</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchClientes} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Nenhum beneficiário salvo</h3>
          <p className="text-blue-700 mb-4">Você ainda não salvou nenhum beneficiário no sistema.</p>
          <Link href="/">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Fazer Consulta
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Mobile: cards */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {visibleClientes.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{cliente.nome}</h3>
                    <span className="inline-flex items-center rounded-full bg-[color:var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[color:var(--primary)]">
                      {cliente.fis_jur === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{cliente.fis_jur === 'F' ? 'CPF' : 'CNPJ'}:</span>
                      <span className="font-mono truncate">{cliente.cpf_cnpj}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Hadesweb ID:</span>
                      <span className="font-mono">{cliente.hadesweb_id}</span>
                    </div>
                    {cliente.endereco?.cidade && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Localização:</span>
                        <span>{cliente.endereco.cidade}{cliente.endereco.uf && `, ${cliente.endereco.uf}`}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Salvo:</span>
                      <span>{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                {/* Footer ações */}
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/beneficiarios/${cliente.id}`}>
                      <Button size="sm" variant="gradient">
                        <Eye className="w-4 h-4 mr-2" /> Detalhes
                      </Button>
                    </Link>
                    <Link href={`/beneficiarios/${cliente.id}/planos`}>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" /> Plano
                      </Button>
                    </Link>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Excluir beneficiário"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    disabled={!!deleting[cliente.id]}
                    onClick={async () => {
                      const confirmed = window.confirm(`Remover o beneficiário \"${cliente.nome}\"? Esta ação não pode ser desfeita.`);
                      if (!confirmed) return;
                      try {
                        setDeleting((prev) => ({ ...prev, [cliente.id]: true }));
                        const { data: sessionData } = await supabase.auth.getSession();
                        const accessToken = sessionData?.session?.access_token;
                        const res = await fetch(`/api/beneficiary/${cliente.id}`, { method: 'DELETE', headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
                        const json = await res.json();
                        if (!res.ok || !json.success) {
                          throw new Error(json.error || 'Erro ao remover beneficiário');
                        }
                        toast.success('Beneficiário removido com sucesso');
                        setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
                      } catch (e) {
                        console.error(e);
                        toast.error(e instanceof Error ? e.message : 'Erro de conexão');
                      } finally {
                        setDeleting((prev) => ({ ...prev, [cliente.id]: false }));
                      }
                    }}
                  >
                    {deleting[cliente.id] ? (
                      <span className="inline-flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                      </span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: lista (cards) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">

              {visibleClientes.map((cliente) => (
                <div key={cliente.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{cliente.nome}</h3>
                      <span className="inline-flex items-center rounded-full bg-[color:var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[color:var(--primary)]">
                        {cliente.fis_jur === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{cliente.fis_jur === 'F' ? 'CPF' : 'CNPJ'}:</span>
                        <span className="font-mono truncate">{cliente.cpf_cnpj}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Hadesweb ID:</span>
                        <span className="font-mono">{cliente.hadesweb_id}</span>
                      </div>
                      {cliente.endereco?.cidade && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Localização:</span>
                          <span>{cliente.endereco.cidade}{cliente.endereco.uf && `, ${cliente.endereco.uf}`}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Salvo:</span>
                        <span>{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/beneficiarios/${cliente.id}`}>
                        <Button size="sm" variant="gradient">
                          <Eye className="w-4 h-4 mr-2" /> Detalhes
                        </Button>
                      </Link>
                      <Link href={`/beneficiarios/${cliente.id}/planos`}>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" /> Plano
                        </Button>
                      </Link>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Excluir beneficiário"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      disabled={!!deleting[cliente.id]}
                      onClick={async () => {
                        const confirmed = window.confirm(`Remover o beneficiário \"${cliente.nome}\"? Esta ação não pode ser desfeita.`);
                        if (!confirmed) return;
                        try {
                          setDeleting((prev) => ({ ...prev, [cliente.id]: true }));
                          const { data: sessionData } = await supabase.auth.getSession();
                          const accessToken = sessionData?.session?.access_token;
                          const res = await fetch(`/api/beneficiary/${cliente.id}`, { method: 'DELETE', headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
                          const json = await res.json();
                          if (!res.ok || !json.success) {
                            throw new Error(json.error || 'Erro ao remover beneficiário');
                          }
                          toast.success('Beneficiário removido com sucesso');
                          setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
                        } catch (e) {
                          console.error(e);
                          toast.error(e instanceof Error ? e.message : 'Erro de conexão');
                        } finally {
                          setDeleting((prev) => ({ ...prev, [cliente.id]: false }));
                        }
                      }}
                    >
                      {deleting[cliente.id] ? (
                        <span className="inline-flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                        </span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

