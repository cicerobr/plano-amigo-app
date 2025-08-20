import { NextRequest, NextResponse } from 'next/server';
import { hadeswebApi } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { cpfCnpj, personType } = await request.json();

    // Validate input
    if (!cpfCnpj || !personType) {
      return NextResponse.json(
        { success: false, error: 'CPF/CNPJ e tipo de pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    if (personType !== 'F' && personType !== 'J') {
      return NextResponse.json(
        { success: false, error: 'Tipo de pessoa deve ser F (física) ou J (jurídica)' },
        { status: 400 }
      );
    }

    // Check environment variables
    const token = process.env.HADESWEB_API_TOKEN;
    const baseUrl = process.env.HADESWEB_API_BASE_URL;

    if (!token || token === 'your_hadesweb_api_token_here') {
      return NextResponse.json(
        { success: false, error: 'Token da API Hadesweb não configurado no servidor' },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        { success: false, error: 'URL base da API Hadesweb não configurada no servidor' },
        { status: 500 }
      );
    }

    console.log('Environment check passed. Token configured:', !!token);
    console.log('Base URL:', baseUrl);

    // Call the Hadesweb API
    const result = await hadeswebApi.searchBeneficiary(cpfCnpj, personType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
