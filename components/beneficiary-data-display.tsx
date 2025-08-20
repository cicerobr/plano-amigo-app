'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoCollapse } from '@/components/ui/info-collapse';
import { BeneficiaryData } from '@/lib/api';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface BeneficiaryDataDisplayProps {
  data: BeneficiaryData[] | null;
  error?: string;
  loading?: boolean;
  hasSearched?: boolean;
}

interface BeneficiaryRecord {
  id: number;
  ce_licenca: number;
  fis_jur: string;
  nome: string;
  nome_social: string;
  dt_nascimento: string;
  dt_falecimento: string | null;
  hr_falecimento: string | null;
  cemiterio_falecimento: string | null;
  jazigo_falecimento: string | null;
  num_gaveta_falecimento: string | null;
  tipo_obito: string | null;
  dt_exumacao: string | null;
  sexo: string;
  estado_civil: string;
  naturalidade: string;
  natural_uf: string | null;
  nacionalidade: string;
  cpf_cnpj: string;
  rg: string;
  rg_org_emissor: string;
  rg_uf: string;
  rg_dt_emissao: string;
  pai: string;
  mae: string;
  telefone_res: string;
  telefone_com: string;
  telefone_cel1: string;
  telefone_cel2: string;
  email1: string;
  email2: string;
  religiao: string | null;
  profissao: string;
  observacao: string;
  sn_possui_jazigo: string;
  uso: string | null;
  cemiterio_jazigo: string | null;
  posicao_spc: string;
  sn_consumidor_geral: string;
  codigo: string;
  modulo: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

export function BeneficiaryDataDisplay({ data, error, loading, hasSearched = false }: BeneficiaryDataDisplayProps) {
  const router = useRouter();
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [existingClients, setExistingClients] = useState<{ [key: number]: any }>({});
  const [checkingStates, setCheckingStates] = useState<{ [key: number]: boolean }>({});

  console.log('BeneficiaryDataDisplay - data:', data);
  console.log('BeneficiaryDataDisplay - error:', error);
  console.log('BeneficiaryDataDisplay - loading:', loading);

  // Check if beneficiaries already exist when data is loaded
  useEffect(() => {
    if (data && data.length > 0) {
      data.forEach((beneficiary: any) => {
        if (beneficiary?.id && !existingClients[beneficiary.id] && !checkingStates[beneficiary.id]) {
          checkIfExists(beneficiary);
        }
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700 text-lg">Consultando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Erro na consulta</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for truly empty data - only show if a search was performed
  if (hasSearched && (!data || data.length === 0)) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left">
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <svg className="h-12 w-12 text-blue-400 mx-auto md:mx-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m6 0V7a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 012-2V6.306z" />
              </svg>
            </div>
            <div className="md:ml-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Nenhum beneficiário encontrado</h3>
              <p className="text-blue-700 mb-4">
                Não foram encontrados dados para o CPF/CNPJ informado. Verifique se o documento está correto e tente novamente.
              </p>
              <div className="text-sm text-blue-600 bg-blue-100 rounded-lg p-4">
                <p className="font-semibold mb-2">Dicas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verifique se o CPF/CNPJ está digitado corretamente</li>
                  <li>Confirme se o beneficiário possui plano ativo</li>
                  <li>Tente novamente em alguns instantes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no search has been performed yet, don't show anything
  if (!hasSearched || !data || data.length === 0) {
    return null;
  }

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



  const renderField = (label: string, value: string | undefined, formatter?: (val: string) => string) => {
    const displayValue = value && value !== '' ? (formatter ? formatter(value) : value) : 'Não informado';
    const isEmpty = !value || value === '' || value === 'Não informado';

    return (
      <div className="mb-4 last:mb-0">
        <dt className="text-sm font-semibold text-gray-600 mb-1">{label}</dt>
        <dd className={`text-sm ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'} bg-gray-50 px-3 py-2 rounded-lg`}>
          {displayValue}
        </dd>
      </div>
    );
  };

  const checkIfExists = async (beneficiary: any) => {
    const beneficiaryId = beneficiary?.id;
    if (!beneficiaryId) return;

    setCheckingStates(prev => ({ ...prev, [beneficiaryId]: true }));

    try {
      const response = await fetch('/api/beneficiary/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hadesweb_id: beneficiaryId }),
      });

      const result = await response.json();

      if (result.success) {
        setExistingClients(prev => ({
          ...prev,
          [beneficiaryId]: result.exists ? result.client : null
        }));
      }
    } catch (error) {
      console.error('Error checking beneficiary:', error);
    } finally {
      setCheckingStates(prev => ({ ...prev, [beneficiaryId]: false }));
    }
  };

  const saveBeneficiary = async (beneficiary: any) => {
    const beneficiaryId = beneficiary?.id;
    if (!beneficiaryId) return;

    setSavingStates(prev => ({ ...prev, [beneficiaryId]: true }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch('/api/beneficiary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(beneficiary),
      });

      let result: any = null;
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from save:', text.slice(0, 400));
        throw new Error(text || `Erro HTTP ${response.status}`);
      }

      if (!response.ok || !result?.success) {
        const msg = result?.error || `Erro HTTP ${response.status}`;
        throw new Error(msg);
      }

      toast.success(result.message || 'Beneficiário salvo com sucesso!');

      // Update existing clients state
      setExistingClients(prev => ({
        ...prev,
        [beneficiaryId]: result.data
      }));

      // Redirect to beneficiarios page after 1.2s
      setTimeout(() => {
        router.push('/beneficiarios');
      }, 1200);
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      toast.error('Erro de conexão ao salvar beneficiário');
    } finally {
      setSavingStates(prev => ({ ...prev, [beneficiaryId]: false }));
    }
  };

  const renderBeneficiaryData = (beneficiary: any, index: number) => {
    console.log('Rendering beneficiary:', beneficiary);
    return (
      <div key={index} className="space-y-6">
        {/* Header com nome do beneficiário */}
        <div className="rounded-xl p-6 text-white" style={{ backgroundColor: 'var(--primary)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{beneficiary?.nome || 'Nome não informado'}</h2>
              <div className="flex flex-wrap gap-4 text-blue-100">
                <span>Código: {beneficiary?.codigo || 'N/A'}</span>
                <span>ID: {beneficiary?.id || 'N/A'}</span>
                <span>{beneficiary?.fis_jur ? formatPersonType(beneficiary.fis_jur) : 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4">
              <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-blue-100">CPF/CNPJ</div>
                <div className="font-semibold">{beneficiary?.cpf_cnpj || 'N/A'}</div>
              </div>

              {checkingStates[beneficiary?.id] ? (
                <Button
                  disabled
                  className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </Button>
              ) : existingClients[beneficiary?.id] ? (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    disabled
                    className="font-semibold px-6 py-2 cursor-default"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Já Salvo
                  </Button>
                  <div className="text-xs text-blue-100 text-center">
                    Salvo em {new Date(existingClients[beneficiary?.id]?.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => saveBeneficiary(beneficiary)}
                  disabled={savingStates[beneficiary?.id] || !beneficiary?.id}
                  className="font-semibold px-6 py-2 transition-colors duration-200"
                >
                  {savingStates[beneficiary?.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Salvar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de beneficiário já salvo */}
        {existingClients[beneficiary?.id] && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Beneficiário já cadastrado</h4>
                <p className="text-sm text-blue-700">
                  Este beneficiário já foi salvo no sistema em {' '}
                  {new Date(existingClients[beneficiary?.id]?.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seções de informações em collapse */}
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
              {renderField('Nome', beneficiary?.nome)}
              {renderField('Nome Social', beneficiary?.nome_social)}
              {renderField('Data de Nascimento', beneficiary?.dt_nascimento, formatDate)}
              {renderField('Sexo', beneficiary?.sexo, formatGender)}
              {renderField('Estado Civil', beneficiary?.estado_civil)}
              {renderField('Profissão', beneficiary?.profissao)}
              {renderField('Religião', beneficiary?.religiao)}
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
              {renderField('CPF/CNPJ', beneficiary?.cpf_cnpj)}
              {renderField('RG', beneficiary?.rg)}
              {renderField('Órgão Emissor', beneficiary?.rg_org_emissor)}
              {renderField('UF do RG', beneficiary?.rg_uf)}
              {renderField('Data de Emissão', beneficiary?.rg_dt_emissao, formatDate)}
              {renderField('Naturalidade', beneficiary?.naturalidade)}
              {renderField('UF Natural', beneficiary?.natural_uf)}
              {renderField('Nacionalidade', beneficiary?.nacionalidade)}
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
              {renderField('Telefone Residencial', beneficiary?.telefone_res, formatPhone)}
              {renderField('Telefone Comercial', beneficiary?.telefone_com, formatPhone)}
              {renderField('Celular 1', beneficiary?.telefone_cel1, formatPhone)}
              {renderField('Celular 2', beneficiary?.telefone_cel2, formatPhone)}
              {renderField('Email 1', beneficiary?.email1)}
              {renderField('Email 2', beneficiary?.email2)}
            </div>
          </InfoCollapse>

          {/* Endereço */}
          {beneficiary?.endereco && (
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
                {renderField('CEP', beneficiary?.endereco?.cep)}
                {renderField('Logradouro', beneficiary?.endereco?.logradouro)}
                {renderField('Número', beneficiary?.endereco?.numero)}
                {renderField('Complemento', beneficiary?.endereco?.complemento)}
                {renderField('Bairro', beneficiary?.endereco?.bairro)}
                {renderField('Cidade', beneficiary?.endereco?.cidade)}
                {renderField('UF', beneficiary?.endereco?.uf)}
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
              {renderField('Pai', beneficiary?.pai)}
              {renderField('Mãe', beneficiary?.mae)}
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
              {renderField('Licença', beneficiary?.ce_licenca?.toString())}
              {renderField('Módulo', beneficiary?.modulo)}
              {renderField('Possui Jazigo', beneficiary?.sn_possui_jazigo, formatYesNo)}
              {renderField('Cemitério do Jazigo', beneficiary?.cemiterio_jazigo)}
              {renderField('Uso', beneficiary?.uso)}
              {renderField('Posição SPC', beneficiary?.posicao_spc)}
              {renderField('Consumidor Geral', beneficiary?.sn_consumidor_geral, formatYesNo)}
            </div>
          </InfoCollapse>

          {/* Informações de Óbito (se houver) */}
          {(beneficiary?.dt_falecimento || beneficiary?.hr_falecimento || beneficiary?.cemiterio_falecimento) && (
            <InfoCollapse
              title="Informações de Óbito"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Data do Falecimento', beneficiary?.dt_falecimento, formatDate)}
                {renderField('Hora do Falecimento', beneficiary?.hr_falecimento)}
                {renderField('Cemitério', beneficiary?.cemiterio_falecimento)}
                {renderField('Jazigo', beneficiary?.jazigo_falecimento)}
                {renderField('Número da Gaveta', beneficiary?.num_gaveta_falecimento)}
                {renderField('Tipo de Óbito', beneficiary?.tipo_obito)}
                {renderField('Data de Exumação', beneficiary?.dt_exumacao, formatDate)}
              </div>
            </InfoCollapse>
          )}

        </div>

        {/* Observações */}
        {beneficiary?.observacao && (
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
              <p className="text-yellow-800 leading-relaxed">{beneficiary?.observacao}</p>
            </div>
          </InfoCollapse>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Dados do Beneficiário
        </h2>
        <p className="text-gray-600 text-lg">
          {data.length === 1 ? 'Beneficiário encontrado' : `${data.length} beneficiários encontrados`}
        </p>
      </div>

      {/* Beneficiários */}
      <div className="space-y-12">
        {data.map((beneficiary, index) => {
          console.log(`Mapping beneficiary ${index}:`, beneficiary);
          return renderBeneficiaryData(beneficiary, index);
        })}
      </div>
    </div>
  );
}
