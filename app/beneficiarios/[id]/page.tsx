'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoCollapse } from '@/components/ui/info-collapse';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface BeneficiaryDetails {
  id: number;
  hadesweb_id: number;
  nome: string;
  cpf_cnpj: string;
  fis_jur: string;
  nome_social?: string;
  dt_nascimento?: string;
  sexo?: string;
  estado_civil?: string;
  profissao?: string;
  religiao?: string;
  rg?: string;
  rg_org_emissor?: string;
  rg_uf?: string;
  rg_dt_emissao?: string;
  naturalidade?: string;
  natural_uf?: string;
  nacionalidade?: string;
  pai?: string;
  mae?: string;
  telefone_res?: string;
  telefone_com?: string;
  telefone_cel1?: string;
  telefone_cel2?: string;
  email1?: string;
  email2?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  ce_licenca?: number;
  modulo?: string;
  codigo?: string;
  sn_possui_jazigo?: string;
  cemiterio_jazigo?: string;
  uso?: string;
  posicao_spc?: string;
  sn_consumidor_geral?: string;
  dt_falecimento?: string;
  hr_falecimento?: string;
  cemiterio_falecimento?: string;
  jazigo_falecimento?: string;
  num_gaveta_falecimento?: string;
  tipo_obito?: string;
  dt_exumacao?: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export default function BeneficiaryDetailsPage() {
  const params = useParams();
  const [beneficiary, setBeneficiary] = useState<BeneficiaryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plansInfo, setPlansInfo] = useState<{ firstId?: number; count?: number }>({});

  useEffect(() => {
    if (params.id) {
      fetchBeneficiaryDetails(params.id as string);
    }
  }, [params.id]);

  const fetchBeneficiaryDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching beneficiary details for ID:', id);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`/api/beneficiary/${id}`, {
        headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      });
      const data = await response.json();

      console.log('API Response:', data);

      if (data.success && data.data) {
        setBeneficiary(data.data);
      } else {
        setError(data.error || 'Erro ao carregar detalhes do beneficiário');
      }
    } catch (error) {
      console.error('Error fetching beneficiary details:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
      // Busca rápida dos planos para habilitar o atalho direto para faturas
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const res = await fetch(`/api/beneficiary/${id}/plans`, {
          headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        });
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json() : { success: false };
        if (json?.success && Array.isArray(json.data)) {
          setPlansInfo({ firstId: json.data[0]?.id, count: json.data.length });
        } else {
          setPlansInfo({});
        }
      } catch {
        setPlansInfo({});
      }

    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString || dateString === '0000-00-00' || dateString === '') return 'Não informado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatPhone = (phone: string | undefined): string => {
    if (!phone || phone === '') return 'Não informado';
    return phone;
  };

  const formatPersonType = (type: string): string => {
    return type === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  const formatGender = (gender: string): string => {
    return gender === 'F' ? 'Feminino' : gender === 'M' ? 'Masculino' : gender;
  };

  const formatYesNo = (value: string): string => {
    return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value;
  };

  const renderField = (label: string, value: string | number | undefined | null, formatter?: (val: string) => string) => {
    // Convert value to string safely
    let stringValue: string | undefined;
    if (value === null || value === undefined) {
      stringValue = undefined;
    } else if (typeof value === 'number') {
      stringValue = value.toString();
    } else {
      stringValue = String(value);
    }

    const displayValue = stringValue && stringValue !== '' ? (formatter ? formatter(stringValue) : stringValue) : 'Não informado';
    const isEmpty = !stringValue || stringValue === '' || displayValue === 'Não informado';

    return (
      <div className="mb-4 last:mb-0">
        <dt className="text-sm font-semibold text-gray-600 mb-1">{label}</dt>
        <dd className={`text-sm ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'} bg-gray-50 px-3 py-2 rounded-lg`}>
          {displayValue}
        </dd>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes do beneficiário...</p>
        </div>
      </div>
    );
  }

  if (error || !beneficiary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => fetchBeneficiaryDetails(params.id as string)} variant="outline">
              Tentar Novamente
            </Button>
            <Link href="/beneficiarios">
              <Button>Voltar à Lista</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/beneficiarios" className="hover:text-blue-600">
            Beneficiários
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{beneficiary.nome}</span>
        </div>
      </nav>

      {/* Header with beneficiary info and actions */}
      <div className="rounded-xl p-6 mb-8 border border-[color:var(--primary)]/20 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 text-[color:var(--primary)]">{beneficiary.nome || 'Nome não informado'}</h1>
            <div className="flex flex-wrap gap-4 text-[color:var(--primary)]/80">
              <span>Código: {beneficiary.codigo || 'N/A'}</span>
              <span>ID: {beneficiary.hadesweb_id || 'N/A'}</span>
              <span>{beneficiary.fis_jur ? formatPersonType(beneficiary.fis_jur) : 'N/A'}</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="rounded-lg px-4 py-2 text-center border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/5">
              <div className="text-sm text-[color:var(--primary)]/70">CPF/CNPJ</div>
              <div className="font-semibold text-[color:var(--primary)]">{beneficiary.cpf_cnpj || 'N/A'}</div>
            </div>

            <Link href={`/beneficiarios/${params.id}/planos`}>
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                Ver Plano
              </Button>
            </Link>

            <Link href={plansInfo.count === 1 && plansInfo.firstId
              ? `/beneficiarios/${params.id}/faturas?planId=${plansInfo.firstId}`
              : `/beneficiarios/${params.id}/planos`}
            >
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                Ver Faturas
              </Button>
            </Link>

            <Button
              onClick={async () => {
                const confirmed = window.confirm('Tem certeza que deseja excluir este beneficiário? Esta ação não pode ser desfeita.');
                if (!confirmed) return;
                try {
                  const { data: sessionData } = await supabase.auth.getSession();
                  const accessToken = sessionData?.session?.access_token;
                  const res = await fetch(`/api/beneficiary/${beneficiary.id}`, { method: 'DELETE', headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    throw new Error(json.error || 'Erro ao excluir beneficiário');
                  }
                  toast.success(json.message || 'Beneficiário excluído com sucesso');
                  setTimeout(() => { window.location.href = '/beneficiarios'; }, 1200);
                } catch (e) {
                  console.error(e);
                  toast.error(e instanceof Error ? e.message : 'Erro de conexão');
                }
              }}
variant="destructive"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-9 0h10" />
              </svg>
              Excluir Beneficiário
            </Button>

            <Link href="/beneficiarios">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar à Lista
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Information in Collapsible Sections */}
      <div className="space-y-4">

        {/* Dados Pessoais */}
        <InfoCollapse
          title="Dados Pessoais"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Nome', beneficiary.nome)}
            {renderField('Nome Social', beneficiary.nome_social)}
            {renderField('Data de Nascimento', beneficiary.dt_nascimento, formatDate)}
            {renderField('Sexo', beneficiary.sexo, formatGender)}
            {renderField('Estado Civil', beneficiary.estado_civil)}
            {renderField('Profissão', beneficiary.profissao)}
            {renderField('Religião', beneficiary.religiao)}
          </div>
        </InfoCollapse>

        {/* Documentos */}
        <InfoCollapse
          title="Documentos"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m6 0V7a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2V6.306z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('CPF/CNPJ', beneficiary.cpf_cnpj)}
            {renderField('RG', beneficiary.rg)}
            {renderField('Órgão Emissor', beneficiary.rg_org_emissor)}
            {renderField('UF do RG', beneficiary.rg_uf)}
            {renderField('Data de Emissão', beneficiary.rg_dt_emissao, formatDate)}
            {renderField('Naturalidade', beneficiary.naturalidade)}
            {renderField('UF Natural', beneficiary.natural_uf)}
            {renderField('Nacionalidade', beneficiary.nacionalidade)}
          </div>
        </InfoCollapse>

        {/* Contatos */}
        <InfoCollapse
          title="Contatos"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Telefone Residencial', beneficiary.telefone_res, formatPhone)}
            {renderField('Telefone Comercial', beneficiary.telefone_com, formatPhone)}
            {renderField('Celular 1', beneficiary.telefone_cel1, formatPhone)}
            {renderField('Celular 2', beneficiary.telefone_cel2, formatPhone)}
            {renderField('Email 1', beneficiary.email1)}
            {renderField('Email 2', beneficiary.email2)}
          </div>
        </InfoCollapse>

        {/* Endereço */}
        {beneficiary.endereco && (
          <InfoCollapse
            title="Endereço"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('CEP', beneficiary.endereco.cep)}
              {renderField('Logradouro', beneficiary.endereco.logradouro)}
              {renderField('Número', beneficiary.endereco.numero)}
              {renderField('Complemento', beneficiary.endereco.complemento)}
              {renderField('Bairro', beneficiary.endereco.bairro)}
              {renderField('Cidade', beneficiary.endereco.cidade)}
              {renderField('UF', beneficiary.endereco.uf)}
            </div>
          </InfoCollapse>
        )}

        {/* Filiação */}
        <InfoCollapse
          title="Filiação"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Pai', beneficiary.pai)}
            {renderField('Mãe', beneficiary.mae)}
          </div>
        </InfoCollapse>

        {/* Informações do Plano */}
        <InfoCollapse
          title="Informações do Plano"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m6 0V7a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2V6.306z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Licença', beneficiary.ce_licenca)}
            {renderField('Módulo', beneficiary.modulo)}
            {renderField('Possui Jazigo', beneficiary.sn_possui_jazigo, formatYesNo)}
            {renderField('Cemitério do Jazigo', beneficiary.cemiterio_jazigo)}
            {renderField('Uso', beneficiary.uso)}
            {renderField('Posição SPC', beneficiary.posicao_spc)}
            {renderField('Consumidor Geral', beneficiary.sn_consumidor_geral, formatYesNo)}
          </div>
        </InfoCollapse>

        {/* Informações de Óbito (se houver) */}
        {(beneficiary.dt_falecimento || beneficiary.hr_falecimento || beneficiary.cemiterio_falecimento) && (
          <InfoCollapse
            title="Informações de Óbito"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Data do Falecimento', beneficiary.dt_falecimento, formatDate)}
              {renderField('Hora do Falecimento', beneficiary.hr_falecimento)}
              {renderField('Cemitério', beneficiary.cemiterio_falecimento)}
              {renderField('Jazigo', beneficiary.jazigo_falecimento)}
              {renderField('Número da Gaveta', beneficiary.num_gaveta_falecimento)}
              {renderField('Tipo de Óbito', beneficiary.tipo_obito)}
              {renderField('Data de Exumação', beneficiary.dt_exumacao, formatDate)}
            </div>
          </InfoCollapse>
        )}

        {/* Observações */}
        {beneficiary.observacao && (
          <InfoCollapse
            title="Observações"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            bgColor="bg-yellow-50"
          >
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 leading-relaxed">{beneficiary.observacao}</p>
            </div>
          </InfoCollapse>
        )}

        {/* Informações do Sistema */}
        <InfoCollapse
          title="Informações do Sistema"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('ID do Sistema', beneficiary.id)}
            {renderField('ID Hadesweb', beneficiary.hadesweb_id)}
            {renderField('Data de Cadastro', beneficiary.created_at, (date) => {
              try {
                return date ? new Date(date).toLocaleString('pt-BR') : 'Não informado';
              } catch {
                return 'Data inválida';
              }
            })}
            {renderField('Última Atualização', beneficiary.updated_at, (date) => {
              try {
                return date ? new Date(date).toLocaleString('pt-BR') : 'Não informado';
              } catch {
                return 'Data inválida';
              }
            })}
          </div>
        </InfoCollapse>
      </div>
    </div>
  );
}
