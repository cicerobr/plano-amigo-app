'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SetupInstructions() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-amber-800">
            Configuração necessária para usar o sistema
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="text-amber-700 hover:text-amber-800"
        >
          {isVisible ? 'Ocultar' : 'Ver instruções'}
        </Button>
      </div>
      
      {isVisible && (
        <div className="mt-4 space-y-3 text-sm text-amber-700">
          <div>
            <h4 className="font-semibold mb-2">Para usar o sistema, você precisa:</h4>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                <strong>Obter o token da API Hadesweb</strong>
                <p className="text-xs text-amber-600 mt-1">
                  Entre em contato com o provedor da API para obter seu token de acesso.
                </p>
              </li>
              <li>
                <strong>Configurar o arquivo .env.local</strong>
                <div className="mt-2 p-3 bg-amber-100 rounded border text-xs font-mono">
                  <div className="text-amber-800 mb-1"># Arquivo: my-app/.env.local</div>
                  <div>HADESWEB_API_TOKEN=<span className="text-red-600">SEU_TOKEN_AQUI</span></div>
                  <div>HADESWEB_API_BASE_URL=https://api.hadesweb.com.br/api/v1</div>
                </div>
              </li>
              <li>
                <strong>Reiniciar o servidor de desenvolvimento</strong>
                <div className="mt-2 p-3 bg-amber-100 rounded border text-xs font-mono">
                  <div>npm run dev</div>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="border-t border-amber-200 pt-3">
            <h4 className="font-semibold mb-2">Possíveis erros e soluções:</h4>
            <ul className="space-y-1 text-xs">
              <li><strong>401 - Não autorizado:</strong> Token inválido ou não configurado</li>
              <li><strong>404 - Não encontrado:</strong> Beneficiário não existe ou URL incorreta</li>
              <li><strong>500 - Erro do servidor:</strong> Problema na API Hadesweb</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
