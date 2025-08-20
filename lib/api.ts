// API service for Hadesweb integration

export interface BeneficiaryData {
  id?: string;
  nome?: string;
  cpf_cnpj?: string;
  tipo_pessoa?: 'F' | 'J';
  plano?: string;
  status?: string;
  data_contratacao?: string;
  valor_mensalidade?: number;
  // Add more fields as needed based on API response
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  data?: BeneficiaryData[];
  message?: string;
  error?: string;
}

class HadeswebApiService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.HADESWEB_API_BASE_URL || 'https://api.hadesweb.com.br/api/v1';
    this.token = process.env.HADESWEB_API_TOKEN || '';
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // GET /plano_funerario/clientes/{idCliente}/vendas
  async getClientPlansByClienteId(idCliente: number, page?: number, per_page?: number): Promise<ApiResponse> {
    try {
      if (!this.token || this.token === 'your_hadesweb_api_token_here') {
        throw new Error('Token da API Hadesweb não configurado. Verifique o arquivo .env.local');
      }

      const url = new URL(`${this.baseUrl}/plano_funerario/clientes/${idCliente}/vendas`);
      if (page) url.searchParams.append('page', String(page));
      if (per_page) url.searchParams.append('per_page', String(per_page));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 401) {
          errorMessage = 'Token de autenticação inválido ou expirado. Verifique o token da API Hadesweb.';
        } else if (response.status === 404) {
          errorMessage = 'Planos não encontrados para este cliente ou endpoint incorreto.';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor da API Hadesweb.';
        }
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage += ` Detalhes: ${errorData.message}`;
        } catch {}
        throw new Error(errorMessage);
      }

      const response_data = await response.json();
      let actualData = response_data && typeof response_data === 'object' && response_data.data
        ? response_data.data
        : response_data;

      if (!actualData || (Array.isArray(actualData) && actualData.length === 0)) {
        return { success: true, data: [] };
      }

      const resultData = Array.isArray(actualData) ? actualData : [actualData];
      const filteredData = resultData.filter(item => item && typeof item === 'object' && Object.keys(item).length > 0);

      return { success: true, data: filteredData };
    } catch (error) {
      console.error('Error fetching client plans:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async searchBeneficiary(cpfCnpj: string, personType: 'F' | 'J'): Promise<ApiResponse> {
    try {
      // Check if token is configured
      if (!this.token || this.token === 'your_hadesweb_api_token_here') {
        throw new Error('Token da API Hadesweb não configurado. Verifique o arquivo .env.local');
      }

      // Construct URL with query parameters
      const url = new URL(`${this.baseUrl}/plano_funerario/clientes`);
      url.searchParams.append('cpf_cnpj', cpfCnpj);
      url.searchParams.append('fis_jur', personType);

      console.log('Making request to:', url.toString());
      console.log('Headers:', this.getHeaders());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (response.status === 401) {
          errorMessage = 'Token de autenticação inválido ou expirado. Verifique o token da API Hadesweb.';
        } else if (response.status === 404) {
          errorMessage = 'Beneficiário não encontrado ou endpoint da API incorreto.';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor da API Hadesweb.';
        }

        // Try to get more error details from response
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += ` Detalhes: ${errorData.message}`;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(errorMessage);
      }

      const response_data = await response.json();

      console.log('API Response:', response_data);

      // Handle the API response structure - it comes wrapped in a data property
      let actualData = response_data;

      // If the response has a 'data' property, extract it
      if (response_data && typeof response_data === 'object' && response_data.data) {
        actualData = response_data.data;
      }

      // Handle empty responses - check for various empty response formats
      if (!actualData ||
          (Array.isArray(actualData) && actualData.length === 0) ||
          (typeof actualData === 'object' && Object.keys(actualData).length === 0) ||
          actualData === null ||
          actualData === undefined) {
        console.log('Empty response detected');
        return {
          success: true,
          data: [],
        };
      }

      // Convert single object to array for consistent handling
      const resultData = Array.isArray(actualData) ? actualData : [actualData];

      // Filter out empty objects
      const filteredData = resultData.filter(item =>
        item && typeof item === 'object' && Object.keys(item).length > 0
      );

      console.log('Filtered data:', filteredData);

      return {
        success: true,
        data: filteredData,
      };
    } catch (error) {
      console.error('Error searching beneficiary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET /plano_funerario/clientes/{idCliente}/vendas/{idVenda}/duplicatas_receber
  async getDuplicatasReceber(idCliente: number, idVenda?: number, page?: number, per_page?: number): Promise<ApiResponse> {
    try {
      if (!this.token || this.token === 'your_hadesweb_api_token_here') {
        throw new Error('Token da API Hadesweb não configurado. Verifique o arquivo .env.local');
      }
      let path = `${this.baseUrl}/plano_funerario/clientes/${idCliente}/vendas`;
      if (idVenda) path += `/${idVenda}`;
      path += `/duplicatas_receber`;
      const url = new URL(path);
      if (page) url.searchParams.append('page', String(page));
      if (per_page) url.searchParams.append('per_page', String(per_page));

      const response = await fetch(url.toString(), { method: 'GET', headers: this.getHeaders() });
      if (!response.ok) {
        let msg = `HTTP error! status: ${response.status}`;
        try { const err = await response.json(); if (err?.message) msg += ` Detalhes: ${err.message}`; } catch {}
        throw new Error(msg);
      }
      const json = await response.json();
      const data = json?.data ?? json;
      return { success: true, data: Array.isArray(data) ? data : (data ? [data] : []) };
    } catch (error) {
      console.error('Error fetching duplicatas_receber:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // GET /plano_funerario/clientes/{idCliente}/vendas/{idVenda}/duplicatas_receber/{idDuplicata}
  async getDuplicataDetalhe(idCliente: number, idVenda: number, idDuplicata: number): Promise<ApiResponse> {
    try {
      if (!this.token || this.token === 'your_hadesweb_api_token_here') {
        throw new Error('Token da API Hadesweb não configurado. Verifique o arquivo .env.local');
      }
      const url = new URL(`${this.baseUrl}/plano_funerario/clientes/${idCliente}/vendas/${idVenda}/duplicatas_receber/${idDuplicata}`);
      const response = await fetch(url.toString(), { method: 'GET', headers: this.getHeaders() });
      if (!response.ok) {
        let msg = `HTTP error! status: ${response.status}`;
        try { const err = await response.json(); if (err?.message) msg += ` Detalhes: ${err.message}`; } catch {}
        throw new Error(msg);
      }
      const json = await response.json();
      const data = json?.data ?? json;
      return { success: true, data: Array.isArray(data) ? data : (data ? [data] : []) };
    } catch (error) {
      console.error('Error fetching duplicata detalhe:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

}

// Create singleton instance
export const hadeswebApi = new HadeswebApiService();

// Client-side API functions for Next.js API routes
export async function searchBeneficiaryClient(cpfCnpj: string, personType: 'F' | 'J'): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/beneficiary/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpfCnpj, personType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in client API call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}
