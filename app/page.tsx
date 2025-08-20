'use client';

import React, { useState } from 'react';
import { BeneficiarySearchForm } from '@/components/beneficiary-search-form';
import { BeneficiaryDataDisplay } from '@/components/beneficiary-data-display';
import { BeneficiaryData } from '@/lib/api';

export default function Home() {
  const [searchResults, setSearchResults] = useState<BeneficiaryData[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResult = (data: BeneficiaryData[] | null, errorMessage?: string) => {
    setSearchResults(data);
    setError(errorMessage);
    setHasSearched(true);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">

          
          {/* Introduction */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              Consulte seu Plano Amigo
            </div>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Consulta de Beneficiários
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Consulte informações gerais e financeiras sobre seus planos funerários contratados.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 card-hover">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Buscar Beneficiário</h3>
              <p className="text-gray-600">Informe o CPF ou CNPJ para consultar os dados</p>
            </div>
            <BeneficiarySearchForm
              onSearchResult={handleSearchResult}
              onLoadingChange={handleLoadingChange}
            />
          </div>

          {/* Results Display */}
          <BeneficiaryDataDisplay
            data={searchResults}
            error={error}
            loading={loading}
            hasSearched={hasSearched}
          />
        </div>
    </div>
  );
}
