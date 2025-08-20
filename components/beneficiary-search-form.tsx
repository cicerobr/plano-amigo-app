'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCpfCnpj, validateCpfCnpj, getPersonType } from '@/lib/validation';
import { searchBeneficiaryClient, type BeneficiaryData } from '@/lib/api';
import toast from 'react-hot-toast';

interface BeneficiarySearchFormProps {
  onSearchResult: (data: BeneficiaryData[] | null, error?: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function BeneficiarySearchForm({ onSearchResult, onLoadingChange }: BeneficiarySearchFormProps) {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [personType, setPersonType] = useState<'F' | 'J'>('F');
  const [errors, setErrors] = useState<{ cpfCnpj?: string; general?: string }>({});

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCpfCnpj(value);
    setCpfCnpj(formatted);

    // Auto-detect person type based on input
    const detectedType = getPersonType(formatted);
    if (detectedType) {
      setPersonType(detectedType);
    }

    // Clear errors when user starts typing
    if (errors.cpfCnpj) {
      setErrors(prev => ({ ...prev, cpfCnpj: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { cpfCnpj?: string } = {};
    
    if (!cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF ou CNPJ é obrigatório';
    } else {
      const validation = validateCpfCnpj(cpfCnpj);
      if (!validation.isValid) {
        newErrors.cpfCnpj = `${validation.type || 'Documento'} inválido`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setErrors({});
    onLoadingChange(true);
    
    try {
      const result = await searchBeneficiaryClient(cpfCnpj, personType);

      console.log('Search result:', result);
      console.log('Search result data:', result.data);

      if (result.success) {
        // Always pass the data to the display component, let it handle empty states
        onSearchResult(result.data || []);

        if (result.data && result.data.length > 0) {
          toast.success(`${result.data.length} registro(s) encontrado(s)`);
        }
      } else {
        const errorMessage = result.error || 'Erro ao buscar beneficiário';
        onSearchResult(null, errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = 'Erro de conexão. Tente novamente.';
      onSearchResult(null, errorMessage);
      toast.error(errorMessage);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="cpf-cnpj" className="block text-sm font-semibold text-gray-800">
            CPF ou CNPJ
            <span className="text-xs text-gray-500 font-normal ml-2">(detecção automática)</span>
          </label>
          <div className="relative">
            <Input
              id="cpf-cnpj"
              type="text"
              value={cpfCnpj}
              onChange={handleCpfCnpjChange}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              maxLength={18} // Max length for formatted CNPJ
              className={`form-focus text-lg py-3 ${errors.cpfCnpj ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
              aria-invalid={!!errors.cpfCnpj}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V7a2 2 0 012-2" />
              </svg>
            </div>
          </div>
          {errors.cpfCnpj && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.cpfCnpj}
            </p>
          )}
        </div>

        {/* Auto-detected person type indicator */}
        {cpfCnpj && personType && (
          <div className={`border rounded-lg p-3 ${
            personType === 'F'
              ? 'bg-green-50 border-green-200'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                personType === 'F' ? 'text-green-600' : 'text-purple-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium ${
                personType === 'F' ? 'text-green-800' : 'text-purple-800'
              }`}>
                {personType === 'F' ? '👤 Pessoa Física (CPF)' : '🏢 Pessoa Jurídica (CNPJ)'}
              </span>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full py-3 text-lg font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Consultar Beneficiário
        </Button>
      </form>
    </div>
  );
}
